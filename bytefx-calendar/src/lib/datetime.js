/**
 * Date helpers.
 *
 * Everything the calendar stores is a plain `YYYY-MM-DD` string plus a UTC
 * `HH:MM`. Working in strings rather than Date objects keeps the server render
 * and the client hydration byte-identical regardless of the machine timezone,
 * which is the usual source of hydration mismatches in calendar UIs.
 */

export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const WEEKDAYS_LONG = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
export const MONTHS_SHORT = MONTHS.map((month) => month.slice(0, 3));

const DAY_MS = 86400000;

function pad(value) {
  return String(value).padStart(2, '0');
}

/** `YYYY-MM-DD` for a Date, read in UTC so it never shifts by a day. */
export function toISODate(date) {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

/** Parse `YYYY-MM-DD` into a UTC-midnight Date. */
export function fromISODate(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/** Today in the viewer's local calendar, expressed as an ISO date string. */
export function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function addDays(iso, days) {
  return toISODate(new Date(fromISODate(iso).getTime() + days * DAY_MS));
}

export function addMonths(iso, months) {
  const date = fromISODate(iso);
  const targetMonth = date.getUTCMonth() + months;
  const target = new Date(Date.UTC(date.getUTCFullYear(), targetMonth, 1));
  const lastDay = daysInMonth(target.getUTCFullYear(), target.getUTCMonth());
  target.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return toISODate(target);
}

export function daysInMonth(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

export function weekdayOf(iso) {
  return fromISODate(iso).getUTCDay();
}

export function diffDays(fromIso, toIso) {
  return Math.round((fromISODate(toIso) - fromISODate(fromIso)) / DAY_MS);
}

export function isWeekend(iso) {
  const day = weekdayOf(iso);
  return day === 0 || day === 6;
}

/** Monday-based start of the week containing `iso`. */
export function startOfWeek(iso) {
  const day = weekdayOf(iso);
  return addDays(iso, day === 0 ? -6 : 1 - day);
}

export function endOfWeek(iso) {
  return addDays(startOfWeek(iso), 6);
}

export function startOfMonth(iso) {
  return `${iso.slice(0, 7)}-01`;
}

export function endOfMonth(iso) {
  const date = fromISODate(iso);
  return toISODate(
    new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), daysInMonth(date.getUTCFullYear(), date.getUTCMonth()))),
  );
}

export function rangeOfDates(fromIso, toIso) {
  const out = [];
  let cursor = fromIso;
  while (cursor <= toIso) {
    out.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return out;
}

/** The nth (1-indexed) `weekday` of a month, or the last one when nth is -1. */
export function nthWeekdayOfMonth(year, monthIndex, weekday, nth) {
  const total = daysInMonth(year, monthIndex);
  const matches = [];
  for (let day = 1; day <= total; day += 1) {
    if (new Date(Date.UTC(year, monthIndex, day)).getUTCDay() === weekday) matches.push(day);
  }
  const day = nth === -1 ? matches[matches.length - 1] : matches[nth - 1];
  return day ? toISODate(new Date(Date.UTC(year, monthIndex, day))) : null;
}

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

export function formatLong(iso) {
  const date = fromISODate(iso);
  return `${WEEKDAYS_LONG[date.getUTCDay()]}, ${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

export function formatMedium(iso) {
  const date = fromISODate(iso);
  return `${WEEKDAYS[date.getUTCDay()]}, ${MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

export function formatShort(iso) {
  const date = fromISODate(iso);
  return `${MONTHS_SHORT[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

export function formatMonthYear(iso) {
  const date = fromISODate(iso);
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

export function formatRange(fromIso, toIso) {
  const from = fromISODate(fromIso);
  const to = fromISODate(toIso);
  const sameMonth = from.getUTCMonth() === to.getUTCMonth() && from.getUTCFullYear() === to.getUTCFullYear();
  if (sameMonth) {
    return `${MONTHS_SHORT[from.getUTCMonth()]} ${from.getUTCDate()} – ${to.getUTCDate()}, ${to.getUTCFullYear()}`;
  }
  return `${formatShort(fromIso)} – ${formatShort(toIso)}, ${to.getUTCFullYear()}`;
}

/** "Today" / "Tomorrow" / "in 3 days" / "12 days ago", relative to `todayIso`. */
export function relativeDayLabel(iso, todayIso) {
  const delta = diffDays(todayIso, iso);
  if (delta === 0) return 'Today';
  if (delta === 1) return 'Tomorrow';
  if (delta === -1) return 'Yesterday';
  if (delta > 0) return `In ${delta} days`;
  return `${Math.abs(delta)} days ago`;
}

/* ------------------------------------------------------------------ */
/* Timezone shifting                                                   */
/* ------------------------------------------------------------------ */

/**
 * Shift a UTC `HH:MM` on `iso` by `offsetMinutes`.
 * Returns the local time plus the day rollover, so a 23:30 Tokyo release can
 * correctly show up on the following day in New York.
 */
export function shiftTime(iso, hhmm, offsetMinutes) {
  const [hours, minutes] = hhmm.split(':').map(Number);
  const total = hours * 60 + minutes + offsetMinutes;
  const dayShift = Math.floor(total / 1440);
  const inDay = ((total % 1440) + 1440) % 1440;
  return {
    time: `${pad(Math.floor(inDay / 60))}:${pad(inDay % 60)}`,
    date: dayShift === 0 ? iso : addDays(iso, dayShift),
    dayShift,
    minutes: inDay,
  };
}

/** Absolute epoch ms for a UTC date + `HH:MM`. Used for countdowns. */
export function epochOf(iso, hhmm) {
  const [hours, minutes] = hhmm.split(':').map(Number);
  return fromISODate(iso).getTime() + hours * 3600000 + minutes * 60000;
}

/** "4h 15m", "2d 6h", "12m 30s" — the countdown format used across the app. */
export function formatCountdown(ms) {
  if (ms <= 0) return 'Released';
  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${pad(secs)}s`;
  return `${secs}s`;
}
