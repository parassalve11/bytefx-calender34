/**
 * Expands the recurring event catalog into concrete, dated events.
 *
 * Every figure is derived from a seed built out of the series id and the release
 * date, so the same day always renders the same numbers — on the server, on the
 * client, and every time the user navigates back to it.
 */

import { catalogById, eventCatalog, marketHolidays } from '@/data/eventCatalog';
import { countryByCode } from '@/data/countries';
import {
  MONTHS_SHORT,
  addDays,
  addMonths,
  daysInMonth,
  diffDays,
  epochOf,
  fromISODate,
  nthWeekdayOfMonth,
  rangeOfDates,
  toISODate,
  weekdayOf,
} from './datetime';
import { chanceFor, floatFor, intFor, noiseFor, pickFor, randomFor } from './seed';

/** Series where a higher print is the *worse* outcome. */
const INVERSE_SERIES = new Set([
  'us-unemployment-rate',
  'us-jobless-claims',
  'us-continuing-claims',
  'gb-unemployment-rate',
  'gb-claimant-count',
  'eu-unemployment-rate',
  'de-unemployment-change',
  'es-unemployment-change',
  'au-unemployment-rate',
  'ca-unemployment-rate',
  'ch-unemployment-rate',
  'jp-unemployment-rate',
  'br-unemployment-rate',
  'us-cpi-mom',
  'us-core-cpi-mom',
  'us-cpi-yoy',
  'us-core-pce',
  'gb-cpi-yoy',
  'gb-core-cpi-yoy',
]);

/* ------------------------------------------------------------------ */
/* Schedule expansion                                                  */
/* ------------------------------------------------------------------ */

/**
 * Nudge a date off the weekend. Saturday falls back to Friday and Sunday
 * forward to Monday — pushing both forward would pile a whole weekend's worth
 * of releases onto every Monday.
 */
function offWeekend(iso) {
  const day = weekdayOf(iso);
  if (day === 6) return addDays(iso, -1);
  if (day === 0) return addDays(iso, 1);
  return iso;
}

function monthsBetween(fromIso, toIso) {
  const out = [];
  let cursor = `${fromIso.slice(0, 7)}-01`;
  const last = `${toIso.slice(0, 7)}-01`;
  // A generous guard — the widest range the UI ever asks for is a few months.
  for (let i = 0; i < 400 && cursor <= last; i += 1) {
    const [year, month] = cursor.split('-').map(Number);
    out.push({ year, monthIndex: month - 1 });
    cursor = addMonths(cursor, 1);
  }
  return out;
}

/** All the dates a catalog entry fires on, within [fromIso, toIso]. */
export function occurrencesInRange(entry, fromIso, toIso) {
  const { schedule } = entry;
  const dates = [];

  if (schedule.type === 'weekly') {
    for (const iso of rangeOfDates(fromIso, toIso)) {
      if (weekdayOf(iso) === schedule.weekday) dates.push(iso);
    }
  } else if (schedule.type === 'monthlyNth') {
    // Widen by a month either side so a weekend nudge can carry a date in.
    for (const { year, monthIndex } of monthsBetween(addMonths(fromIso, -1), addMonths(toIso, 1))) {
      const iso = nthWeekdayOfMonth(year, monthIndex, schedule.weekday, schedule.nth);
      if (iso) dates.push(iso);
    }
  } else if (schedule.type === 'monthlyDay') {
    for (const { year, monthIndex } of monthsBetween(addMonths(fromIso, -1), addMonths(toIso, 1))) {
      const day = Math.min(schedule.day, daysInMonth(year, monthIndex));
      dates.push(offWeekend(toISODate(new Date(Date.UTC(year, monthIndex, day)))));
    }
  } else if (schedule.type === 'quarterly') {
    for (const { year, monthIndex } of monthsBetween(addMonths(fromIso, -1), addMonths(toIso, 1))) {
      if (!schedule.months.includes(monthIndex)) continue;
      const day = Math.min(schedule.day, daysInMonth(year, monthIndex));
      dates.push(offWeekend(toISODate(new Date(Date.UTC(year, monthIndex, day)))));
    }
  } else if (schedule.type === 'quarterlyNth') {
    for (const { year, monthIndex } of monthsBetween(addMonths(fromIso, -1), addMonths(toIso, 1))) {
      if (!schedule.months.includes(monthIndex)) continue;
      const iso = nthWeekdayOfMonth(year, monthIndex, schedule.weekday, schedule.nth);
      if (iso) dates.push(iso);
    }
  } else if (schedule.type === 'interval') {
    const step = schedule.weeks * 7;
    const first = Math.floor(diffDays(schedule.anchor, fromIso) / step) - 1;
    const last = Math.ceil(diffDays(schedule.anchor, toIso) / step) + 1;
    for (let k = first; k <= last; k += 1) {
      dates.push(addDays(schedule.anchor, k * step));
    }
  }

  return dates.filter((iso) => iso >= fromIso && iso <= toIso);
}

/** Walk backwards to find the `count` most recent occurrences on or before `iso`. */
export function previousOccurrences(entry, iso, count) {
  const from = addMonths(iso, -Math.max(18, count * 4));
  const all = occurrencesInRange(entry, from, iso);
  return all.slice(-count);
}

/** The next occurrence strictly after `iso`, or null within a two-year horizon. */
export function nextOccurrence(entry, iso) {
  const all = occurrencesInRange(entry, addDays(iso, 1), addMonths(iso, 24));
  return all[0] ?? null;
}

/* ------------------------------------------------------------------ */
/* Number generation and formatting                                    */
/* ------------------------------------------------------------------ */

function groupThousands(text) {
  const [whole, fraction] = text.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fraction ? `${grouped}.${fraction}` : grouped;
}

export function formatValue(num, spec) {
  if (num === null || num === undefined || Number.isNaN(num)) return null;
  const { dp = 1, unit = '', prefix = '', signed = false, grouped = false } = spec;
  const abs = Math.abs(num);
  let body = abs.toFixed(dp);
  if (grouped || abs >= 1000) body = groupThousands(body);
  const sign = num < 0 ? '-' : signed && num > 0 ? '+' : '';
  return `${sign}${prefix}${body}${unit}`;
}

/**
 * previous → forecast → actual, each a step away from the last with a pull back
 * toward the series' long-run base so the numbers never drift off to nowhere.
 */
function generateFigures(entry, iso) {
  const spec = entry.value;
  if (!spec) return { previous: null, forecast: null, actual: null };

  const seed = `${entry.id}|${iso}`;

  // Policy rates hold most of the time and move in clean 25bp steps.
  if (spec.policy) {
    const drift = Math.round(floatFor(`${seed}|drift`, -1.4, 1.4));
    const previous = spec.base;
    const moves = chanceFor(`${seed}|move`, 0.28);
    const step = spec.base > 12 ? 2.5 : 0.25;
    const actual = moves ? Number((spec.base + drift * step).toFixed(2)) : spec.base;
    const forecastMoves = moves ? chanceFor(`${seed}|fc`, 0.75) : chanceFor(`${seed}|fc2`, 0.12);
    const forecast = forecastMoves ? actual : previous;
    return { previous, forecast, actual };
  }

  const swing = spec.swing ?? 1;
  const previous = spec.base + noiseFor(`${seed}|prev`) * swing;
  const forecast = previous * 0.45 + spec.base * 0.55 + noiseFor(`${seed}|fc`) * swing * 0.35;
  const actual = forecast + noiseFor(`${seed}|act`) * swing * 0.65;

  const round = (value) => Number(value.toFixed(spec.dp ?? 1));
  return { previous: round(previous), forecast: round(forecast), actual: round(actual) };
}

/* ------------------------------------------------------------------ */
/* Period labels                                                       */
/* ------------------------------------------------------------------ */

function periodLabel(entry, iso) {
  const date = fromISODate(iso);
  const monthOffsets = {
    currentMonth: 0,
    prevMonth: -1,
    twoMonthsBack: -2,
    threeMonthsBack: -3,
    nextMonth: 1,
  };

  const period = entry.period ?? 'prevMonth';
  if (period === 'none') return '';
  if (period === 'ytd') return 'YTD';
  if (period === 'week') {
    const weekEnd = addDays(iso, -2);
    return `w/e ${MONTHS_SHORT[fromISODate(weekEnd).getUTCMonth()]} ${fromISODate(weekEnd).getUTCDate()}`;
  }
  if (period === 'prevQuarter' || period === 'currentQuarter') {
    const shift = period === 'prevQuarter' ? -1 : 0;
    const quarter = Math.floor(date.getUTCMonth() / 3) + shift;
    const wrapped = ((quarter % 4) + 4) % 4;
    const year = quarter < 0 ? date.getUTCFullYear() - 1 : date.getUTCFullYear();
    return `Q${wrapped + 1} ${String(year).slice(2)}`;
  }

  const shifted = addMonths(iso, monthOffsets[period] ?? -1);
  const shiftedDate = fromISODate(shifted);
  const sameYear = shiftedDate.getUTCFullYear() === date.getUTCFullYear();
  const month = MONTHS_SHORT[shiftedDate.getUTCMonth()];
  return sameYear ? month : `${month} ${String(shiftedDate.getUTCFullYear()).slice(2)}`;
}

/* ------------------------------------------------------------------ */
/* Commentary                                                          */
/* ------------------------------------------------------------------ */

const BEAT_LINES = [
  'Printed above consensus and firmed the currency through the London fix.',
  'A clear upside surprise — front-end yields moved higher within minutes of the release.',
  'Beat expectations and reversed the previous month’s decline.',
  'Stronger than forecast, though the details were softer than the headline implies.',
  'Came in comfortably above the range of analyst estimates.',
];
const MISS_LINES = [
  'Missed the consensus and stalled the recovery seen earlier in the quarter.',
  'A downside surprise that pulled forward expectations of easing.',
  'Undershot forecasts; the currency gave back its intraday gains on the print.',
  'Weaker than expected, with the shortfall concentrated in the volatile components.',
  'Fell short of every estimate in the survey range.',
];
const INLINE_LINES = [
  'Landed on consensus — a non-event for rate pricing.',
  'In line with forecasts, leaving the policy path unchanged.',
  'Matched expectations; markets looked through the release.',
];
const PREVIEW_LINES = [
  'Consensus looks for little change from the previous reading.',
  'A surprise in either direction would be the first real test of the current rate path.',
  'Positioning into the release is light, which leaves room for an outsized reaction.',
  'Analysts are split, so the risk of a two-way move is unusually high.',
];
const SPEECH_LINES = [
  'Prepared remarks with limited policy content — a modest FX reaction at most.',
  'Watched for any shift in tone on the timing of the next policy move.',
  'Text released in advance; the Q&A is where the headlines usually come from.',
];

/* ------------------------------------------------------------------ */
/* Event construction                                                  */
/* ------------------------------------------------------------------ */

export function eventKey(catalogId, iso) {
  return `${catalogId}__${iso}`;
}

export function parseEventKey(key) {
  const [catalogId, date] = String(key).split('__');
  return { catalogId, date: date ?? null };
}

/**
 * Build the full event record for one series on one date.
 * `nowMs` decides whether the release has happened yet.
 */
export function buildEvent(entry, iso, nowMs) {
  const seed = `${entry.id}|${iso}`;
  const country = countryByCode[entry.currency];
  const releaseEpoch = epochOf(iso, entry.time);
  const released = nowMs >= releaseEpoch;

  const figures = generateFigures(entry, iso);
  const spec = entry.value;

  const actualNum = released ? figures.actual : null;
  const surprise =
    actualNum === null || figures.forecast === null
      ? null
      : Math.abs(actualNum - figures.forecast) < (spec.swing ?? 1) * 0.08
        ? 'inline'
        : (actualNum > figures.forecast) !== INVERSE_SERIES.has(entry.id)
          ? 'beat'
          : 'miss';

  const speaker = entry.rotate ? pickFor(`${seed}|speaker`, entry.rotate) : null;
  const title = speaker ? entry.title.replace('Member', `Member ${speaker}`) : entry.title;
  const period = periodLabel(entry, iso);

  let commentary;
  if (entry.type === 'speech') commentary = pickFor(`${seed}|c`, SPEECH_LINES);
  else if (!released) commentary = pickFor(`${seed}|c`, PREVIEW_LINES);
  else if (surprise === 'beat') commentary = pickFor(`${seed}|c`, BEAT_LINES);
  else if (surprise === 'miss') commentary = pickFor(`${seed}|c`, MISS_LINES);
  else commentary = pickFor(`${seed}|c`, INLINE_LINES);

  return {
    key: eventKey(entry.id, iso),
    catalogId: entry.id,
    date: iso,
    time: entry.time,
    epoch: releaseEpoch,
    currency: entry.currency,
    country: country?.country ?? entry.currency,
    iso: country?.iso ?? null,
    title,
    period,
    displayTitle: period ? `${title} (${period})` : title,
    category: entry.category,
    impact: entry.impact,
    type: entry.type ?? 'data',
    source: entry.source,
    preliminary: Boolean(entry.preliminary),
    status: released ? 'released' : 'upcoming',
    surprise,
    actual: spec ? formatValue(actualNum, spec) : null,
    forecast: spec ? formatValue(figures.forecast, spec) : null,
    previous: spec ? formatValue(figures.previous, spec) : null,
    actualNum,
    forecastNum: figures.forecast,
    previousNum: figures.previous,
    unit: spec?.unit ?? '',
    description: entry.description ?? defaultDescription(entry),
    commentary,
    why: entry.why ?? null,
    volatility: entry.impact === 'high' ? intFor(`${seed}|vol`, 55, 95) : entry.impact === 'medium' ? intFor(`${seed}|vol`, 25, 60) : intFor(`${seed}|vol`, 5, 30),
  };
}

function defaultDescription(entry) {
  const country = countryByCode[entry.currency];
  const where = country ? country.country : entry.currency;
  if (entry.type === 'speech') {
    return `Scheduled remarks from a ${where} policymaker. Traders watch for any change of tone on the outlook for the policy rate.`;
  }
  if (entry.category === 'Interest rates') {
    return `The ${country?.bank ?? where} announces its policy decision. The statement accompanying the decision usually matters more than the rate itself.`;
  }
  return `${entry.title} for ${where}, published by ${entry.source}. Part of the ${entry.category.toLowerCase()} block that feeds into the ${country?.bankShort ?? 'central bank'} policy outlook.`;
}

/* ------------------------------------------------------------------ */
/* Holidays                                                            */
/* ------------------------------------------------------------------ */

export function holidaysOn(iso) {
  const suffix = iso.slice(5);
  return marketHolidays
    .filter((holiday) => holiday.date === suffix)
    .map((holiday) => ({ ...holiday, date: iso }));
}

/* ------------------------------------------------------------------ */
/* Public queries                                                      */
/* ------------------------------------------------------------------ */

/** Every event between two dates, sorted by release time. */
export function getEventsInRange(fromIso, toIso, nowMs) {
  const events = [];
  for (const entry of eventCatalog) {
    for (const iso of occurrencesInRange(entry, fromIso, toIso)) {
      events.push(buildEvent(entry, iso, nowMs));
    }
  }
  return events.sort(
    (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time) || a.title.localeCompare(b.title),
  );
}

export function getEventsForDate(iso, nowMs) {
  return getEventsInRange(iso, iso, nowMs);
}

/** Look up a single event by its composite `seriesId__YYYY-MM-DD` key. */
export function getEventByKey(key, nowMs, fallbackDate) {
  const { catalogId, date } = parseEventKey(key);
  const entry = catalogById[catalogId];
  if (!entry) return null;
  if (date) return buildEvent(entry, date, nowMs);

  // Bare series id — resolve to the next scheduled release.
  const anchor = fallbackDate ?? toISODate(new Date(nowMs));
  const upcoming = occurrencesInRange(entry, anchor, addMonths(anchor, 6))[0];
  return buildEvent(entry, upcoming ?? anchor, nowMs);
}

/**
 * Per-day event counts by impact. Powers the density dots in the date picker
 * and the weekly overview cards.
 */
export function getDailyCounts(fromIso, toIso, nowMs, currencies) {
  const allowed = currencies && currencies.length ? new Set(currencies) : null;
  const counts = {};
  for (const iso of rangeOfDates(fromIso, toIso)) {
    counts[iso] = { total: 0, high: 0, medium: 0, low: 0 };
  }
  for (const entry of eventCatalog) {
    if (allowed && !allowed.has(entry.currency)) continue;
    for (const iso of occurrencesInRange(entry, fromIso, toIso)) {
      const bucket = counts[iso];
      if (!bucket) continue;
      bucket.total += 1;
      bucket[entry.impact] += 1;
    }
  }
  return counts;
}

/** Client-side filtering, applied to an already-generated list. */
export function filterEvents(events, filters = {}) {
  const {
    currencies,
    impacts,
    categories: categoryFilter,
    query,
    onlyUpcoming,
    hideNoData,
    fromMinutes,
    toMinutes,
    offset = 0,
  } = filters;

  const currencySet = currencies && currencies.length ? new Set(currencies) : null;
  const impactSet = impacts && impacts.length ? new Set(impacts) : null;
  const categorySet =
    categoryFilter && categoryFilter.length && !categoryFilter.includes('All categories')
      ? new Set(categoryFilter)
      : null;
  const needle = query ? query.trim().toLowerCase() : '';

  return events.filter((event) => {
    if (currencySet && !currencySet.has(event.currency)) return false;
    if (impactSet && !impactSet.has(event.impact)) return false;
    if (categorySet && !categorySet.has(event.category)) return false;
    if (onlyUpcoming && event.status !== 'upcoming') return false;
    if (hideNoData && !event.actual && !event.forecast && event.type === 'data') return false;
    if (needle) {
      const haystack = `${event.title} ${event.country} ${event.currency} ${event.category}`.toLowerCase();
      if (!haystack.includes(needle)) return false;
    }
    if (fromMinutes !== undefined && toMinutes !== undefined) {
      const [hours, minutes] = event.time.split(':').map(Number);
      const local = ((hours * 60 + minutes + offset) % 1440 + 1440) % 1440;
      if (local < fromMinutes || local > toMinutes) return false;
    }
    return true;
  });
}

/**
 * The recent print history for a series, used by the trend chart on the
 * event detail page.
 */
export function getSeriesHistory(catalogId, iso, count = 14) {
  const entry = catalogById[catalogId];
  if (!entry || !entry.value) return [];
  const dates = previousOccurrences(entry, iso, count);
  return dates.map((date) => {
    const figures = generateFigures(entry, date);
    const inverse = INVERSE_SERIES.has(catalogId);
    const beat = (figures.actual > figures.forecast) !== inverse;
    const shortDate = fromISODate(date);
    return {
      date,
      label: `${MONTHS_SHORT[shortDate.getUTCMonth()]} ’${String(shortDate.getUTCFullYear()).slice(2)}`,
      actual: figures.actual,
      forecast: figures.forecast,
      previous: figures.previous,
      actualText: formatValue(figures.actual, entry.value),
      forecastText: formatValue(figures.forecast, entry.value),
      previousText: formatValue(figures.previous, entry.value),
      result: beat ? 'beat' : 'miss',
    };
  });
}

/** Other releases from the same country and category, for the detail page. */
export function getRelatedEvents(event, nowMs, limit = 5) {
  return eventCatalog
    .filter((entry) => entry.id !== event.catalogId && entry.currency === event.currency)
    .sort((a, b) => {
      const sameCategory = (entry) => (entry.category === event.category ? 0 : 1);
      return sameCategory(a) - sameCategory(b) || a.title.localeCompare(b.title);
    })
    .slice(0, limit)
    .map((entry) => {
      const date = previousOccurrences(entry, event.date, 1)[0] ?? event.date;
      return buildEvent(entry, date, nowMs);
    });
}

/**
 * Average absolute move each instrument makes on this release. Deterministic
 * per series, and scaled by impact so high-impact events show bigger moves.
 */
export function getAffectedMarkets(event) {
  const base = { high: 1, medium: 0.6, low: 0.3 }[event.impact] ?? 0.5;
  const pairs = {
    USD: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD', 'US500', 'NAS100'],
    EUR: ['EUR/USD', 'EUR/GBP', 'EUR/JPY', 'GER40', 'EUR/CHF'],
    GBP: ['GBP/USD', 'EUR/GBP', 'GBP/JPY', 'UK100'],
    JPY: ['USD/JPY', 'EUR/JPY', 'GBP/JPY', 'JP225'],
    AUD: ['AUD/USD', 'AUD/JPY', 'AUD/NZD', 'XAU/USD'],
    NZD: ['NZD/USD', 'AUD/NZD', 'NZD/JPY'],
    CAD: ['USD/CAD', 'CAD/JPY', 'USOIL'],
    CHF: ['USD/CHF', 'EUR/CHF', 'CHF/JPY'],
    CNY: ['AUD/USD', 'USD/CNH', 'XCU/USD', 'HK50'],
  };
  const list = pairs[event.currency] ?? ['EUR/USD', 'XAU/USD', 'US500'];
  return list.map((symbol, index) => {
    const seed = `${event.key}|${symbol}`;
    const pips = Math.round(floatFor(seed, 12, 78) * base + 6);
    return {
      symbol,
      move: symbol.startsWith('XAU') ? `$${(pips / 4).toFixed(2)}` : symbol.includes('/') ? `${pips} pips` : `${(pips / 70).toFixed(2)}%`,
      impact: index < 2 ? event.impact : index < 4 ? 'medium' : 'low',
      direction: randomFor(`${seed}|dir`) > 0.5 ? 'up' : 'down',
    };
  });
}
