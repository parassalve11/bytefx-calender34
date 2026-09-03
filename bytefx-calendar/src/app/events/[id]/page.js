'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  BellPlus,
  BellRing,
  ChevronRight,
  Share2,
  Star,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Controls';
import { ActualValue, CurrencyFlag, ImpactBadge, ImpactDots, Value } from '@/components/ui/Indicators';
import Flag from '@/components/ui/Flag';
import HistoricalTrend from '@/components/event/HistoricalTrend';
import ReminderDialog from '@/components/calendar/ReminderDialog';
import { catalogById } from '@/data/eventCatalog';
import { countryByCode, timezoneById } from '@/data/countries';
import {
  getAffectedMarkets,
  getEventByKey,
  getRelatedEvents,
  getSeriesHistory,
  nextOccurrence,
  previousOccurrences,
  buildEvent,
} from '@/lib/calendarEngine';
import {
  formatCountdown,
  formatLong,
  formatShort,
  relativeDayLabel,
  shiftTime,
  todayISO,
} from '@/lib/datetime';
import { useAppState } from '@/lib/store';
import { useNow, useStableNow } from '@/lib/useNow';

export default function EventDetailPage() {
  const params = useParams();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const id = decodeURIComponent(rawId ?? '');

  const snapshot = useStableNow();
  const now = useNow(1000);
  const today = todayISO();

  const { preferences, reminderFor, isSaved, toggleSaved, toast } = useAppState();
  const [reminderOpen, setReminderOpen] = useState(false);

  const event = useMemo(() => getEventByKey(id, snapshot, today), [id, snapshot, today]);

  const history = useMemo(
    () => (event ? getSeriesHistory(event.catalogId, event.date, 18) : []),
    [event],
  );
  const related = useMemo(() => (event ? getRelatedEvents(event, snapshot, 5) : []), [event, snapshot]);
  const markets = useMemo(() => (event ? getAffectedMarkets(event) : []), [event]);

  const priorReleases = useMemo(() => {
    if (!event) return [];
    const entry = catalogById[event.catalogId];
    if (!entry) return [];
    return previousOccurrences(entry, event.date, 6)
      .slice(0, -1)
      .reverse()
      .map((date) => buildEvent(entry, date, snapshot));
  }, [event, snapshot]);

  if (!event) {
    return (
      <div className="mx-auto max-w-shell px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-ink">Event not found</h1>
        <p className="mt-2 text-base text-ink-2">
          That release is not in the calendar. It may have been renamed or removed.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded bg-brand px-4 py-2 text-base font-semibold text-white"
        >
          <ArrowLeft size={15} />
          Back to calendar
        </Link>
      </div>
    );
  }

  const entry = catalogById[event.catalogId];
  const country = countryByCode[event.currency];
  const zone = timezoneById(preferences.timezone);
  const local = shiftTime(event.date, event.time, zone.offset);
  const reminder = reminderFor(event.key);
  const saved = isSaved(event.key);
  const upcoming = event.status === 'upcoming';
  const next = nextOccurrence(entry, event.date);

  const deviation =
    event.actualNum !== null && event.forecastNum !== null
      ? event.actualNum - event.forecastNum
      : null;
  const deviationPct =
    deviation !== null && event.forecastNum
      ? (deviation / Math.abs(event.forecastNum)) * 100
      : null;

  const stats = [
    {
      label: 'Actual',
      value: event.actual ?? '–',
      period: event.period || formatShort(event.date),
      note: upcoming ? 'Awaiting release' : event.surprise === 'beat' ? 'Above forecast' : event.surprise === 'miss' ? 'Below forecast' : 'On consensus',
      tone: event.surprise === 'beat' ? 'pos' : event.surprise === 'miss' ? 'neg' : null,
      noteTone: event.surprise === 'beat' ? 'pos' : event.surprise === 'miss' ? 'neg' : null,
    },
    {
      label: 'Forecast',
      value: event.forecast ?? '–',
      period: event.period || 'Consensus',
      note: `${entry?.source ?? 'Market'} survey`,
    },
    {
      label: 'Previous',
      value: event.previous ?? '–',
      period: 'Prior release',
      note: priorReleases[0] ? `Released ${formatShort(priorReleases[0].date)}` : 'No prior print',
    },
    {
      label: 'Surprise',
      value:
        deviation === null
          ? '–'
          : `${deviation > 0 ? '+' : ''}${deviation.toFixed(entry?.value?.dp ?? 1)}${event.unit}`,
      period: deviationPct === null ? 'vs forecast' : `${deviationPct > 0 ? '+' : ''}${deviationPct.toFixed(1)}% vs forecast`,
      note: event.surprise === 'beat' ? 'Better than expected' : event.surprise === 'miss' ? 'Worse than expected' : 'In line',
      tone: event.surprise === 'beat' ? 'pos' : event.surprise === 'miss' ? 'neg' : null,
      noteTone: event.surprise === 'beat' ? 'pos' : event.surprise === 'miss' ? 'neg' : null,
    },
  ];

  const facts = [
    { label: 'Country', value: country?.country ?? event.currency },
    { label: 'Category', value: event.category },
    { label: 'Source', value: event.source },
    { label: 'Release schedule', value: scheduleLabel(entry) },
    { label: 'Next release', value: next ? formatShort(next) : 'Not scheduled' },
    { label: 'Central bank', value: country?.bank ?? '—' },
    { label: 'Policy rate', value: country?.rate ?? '—' },
    { label: 'Revision', value: entry?.revised ? 'Usually revised' : 'Rarely revised' },
  ];

  const TONE = { pos: 'text-pos', neg: 'text-neg' };

  return (
    <div className="mx-auto max-w-shell px-4 py-6 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-ink-3">
        <Link href="/" className="hover:text-ink">
          Calendar
        </Link>
        <ChevronRight size={13} />
        <span>{country?.country ?? event.currency}</span>
        <ChevronRight size={13} />
        <span className="text-ink-2">{event.title}</span>
      </nav>

      <Link
        href="/"
        className="mt-4 inline-flex items-center gap-2 rounded border border-line-strong px-3 py-2 text-base font-medium text-ink transition-colors duration-150 hover:border-brand"
      >
        <ArrowLeft size={15} />
        Back to calendar
      </Link>

      <header className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <Flag code={event.currency} size="xl" className="mt-1.5" />
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {event.title}
              {event.period ? <span className="font-normal text-ink-3"> ({event.period})</span> : null}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ImpactBadge level={event.impact} />
              <span className="inline-flex items-center gap-1.5 rounded border border-line bg-subtle px-2 py-0.5 text-2xs font-semibold text-ink-2">
                <CurrencyFlag code={event.currency} />
              </span>
              <span className="rounded border border-line bg-subtle px-2 py-0.5 text-2xs font-semibold text-ink-2">
                {event.category}
              </span>
              {event.preliminary ? (
                <span className="rounded border border-line bg-subtle px-2 py-0.5 text-2xs font-semibold text-ink-2">
                  Preliminary
                </span>
              ) : null}
              <span
                className={`rounded border px-2 py-0.5 text-2xs font-semibold ${
                  upcoming
                    ? 'border-brand/25 bg-brand/10 text-brand-soft'
                    : 'border-line bg-subtle text-ink-2'
                }`}
              >
                {upcoming ? 'Scheduled' : 'Released'}
              </span>
            </div>
            <p className="mt-3 text-base leading-relaxed text-ink-2">{event.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-4">
          <div className="text-left lg:text-right">
            <p className="text-sm text-ink-2">{formatLong(local.date)}</p>
            <p className="tabular text-2xl font-bold text-ink">
              {local.time}{' '}
              <span className="text-sm font-normal text-ink-3">{zone.label.split(' ')[0]}</span>
            </p>
            <p className={`text-sm font-semibold ${upcoming ? 'text-brand-soft' : 'text-ink-3'}`}>
              {upcoming
                ? `In ${formatCountdown(event.epoch - now)}`
                : relativeDayLabel(event.date, today)}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant={reminder ? 'accent' : 'outline'} onClick={() => setReminderOpen(true)}>
              {reminder ? <BellRing size={15} /> : <BellPlus size={15} />}
              {reminder ? 'Reminder set' : 'Set reminder'}
            </Button>
            <button
              type="button"
              onClick={() => {
                const added = toggleSaved(event.key);
                toast(added ? 'Added to your watchlist' : 'Removed from your watchlist', added ? 'success' : 'info');
              }}
              aria-pressed={saved}
              aria-label={saved ? 'Remove from watchlist' : 'Save to watchlist'}
              className={`flex h-10 w-10 items-center justify-center rounded border transition-colors duration-150 ${
                saved
                  ? 'border-impact-medium/50 text-impact-medium'
                  : 'border-line-strong text-ink-2 hover:border-brand hover:text-ink'
              }`}
            >
              <Star size={16} fill={saved ? 'currentColor' : 'none'} />
            </button>
            <button
              type="button"
              onClick={() => toast('Event link copied to your clipboard', 'success')}
              aria-label="Share event"
              className="flex h-10 w-10 items-center justify-center rounded border border-line-strong text-ink-2 transition-colors duration-150 hover:border-brand hover:text-ink"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="p-4">
                <p className="text-sm text-ink-2">{stat.label}</p>
                <p className={`tabular mt-2 text-2xl font-bold ${TONE[stat.tone] ?? 'text-ink'}`}>
                  {stat.value}
                </p>
                <p className="mt-3 flex flex-wrap items-baseline justify-between gap-2 text-xs">
                  <span className="text-ink-3">{stat.period}</span>
                  <span className={TONE[stat.noteTone] ?? 'text-ink-2'}>{stat.note}</span>
                </p>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <HistoricalTrend history={history} unit={event.unit} />

            <Card>
              <CardHeader title="Why it matters" />
              <div className="px-5 py-4">
                <p className="text-base leading-relaxed text-ink-2">{event.commentary}</p>
                <ul className="mt-4 flex flex-col gap-3">
                  {(event.why ?? defaultWhy(event, country)).map((item) => (
                    <li key={item.title} className="flex gap-2.5">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                      />
                      <p className="text-base leading-relaxed text-ink-2">
                        <span className="font-semibold text-ink">{item.title}.</span> {item.body}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader
              title="Previous releases"
              action={<span className="text-2xs text-ink-3">Most recent first</span>}
            />
            <div className="thin-scroll overflow-x-auto">
              <table className="w-full min-w-[560px] text-left">
                <thead>
                  <tr className="text-xs font-medium text-ink-3">
                    <th scope="col" className="border-b border-line px-5 py-3 font-medium">
                      Date
                    </th>
                    <th scope="col" className="border-b border-line px-5 py-3 font-medium">
                      Period
                    </th>
                    <th scope="col" className="border-b border-line px-5 py-3 text-right font-medium">
                      Actual
                    </th>
                    <th scope="col" className="border-b border-line px-5 py-3 text-right font-medium">
                      Forecast
                    </th>
                    <th scope="col" className="border-b border-line px-5 py-3 text-right font-medium">
                      Previous
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {priorReleases.map((row) => (
                    <tr key={row.key} className="transition-colors duration-150 hover:bg-subtle">
                      <td className="tabular whitespace-nowrap border-b border-line px-5 py-3 text-sm text-ink-2">
                        <Link href={`/events/${row.key}`} className="hover:text-ink hover:underline">
                          {formatShort(row.date)}
                        </Link>
                      </td>
                      <td className="border-b border-line px-5 py-3 text-base font-medium text-ink">
                        {row.period || '—'}
                      </td>
                      <td className="tabular border-b border-line px-5 py-3 text-right text-base font-semibold">
                        <ActualValue value={row.actual} surprise={row.surprise} />
                      </td>
                      <td className="tabular border-b border-line px-5 py-3 text-right text-base">
                        <Value value={row.forecast} />
                      </td>
                      <td className="tabular border-b border-line px-5 py-3 text-right text-base">
                        <Value value={row.previous} />
                      </td>
                    </tr>
                  ))}
                  {priorReleases.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-base text-ink-3">
                        No earlier releases in the archive.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <CardHeader title={`Other ${country?.country ?? event.currency} releases`} />
            <ul className="grid gap-3 px-5 py-4 sm:grid-cols-2">
              {related.map((row) => (
                <li key={row.key}>
                  <Link
                    href={`/events/${row.key}`}
                    className="flex h-full items-start gap-3 rounded-lg border border-line bg-subtle px-3 py-3 transition-colors duration-150 hover:border-brand"
                  >
                    <ImpactDots level={row.impact} className="mt-1.5" />
                    <span className="min-w-0">
                      <span className="block truncate text-base font-medium text-ink">{row.title}</span>
                      <span className="mt-0.5 block text-sm text-ink-3">
                        {row.category} · {formatShort(row.date)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <aside className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Affected markets" action="Avg. move" />
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-medium text-ink-3">
                  <th scope="col" className="px-5 pt-3 font-medium">
                    Market
                  </th>
                  <th scope="col" className="px-2 pt-3 text-right font-medium">
                    Avg. move
                  </th>
                  <th scope="col" className="px-5 pt-3 text-right font-medium">
                    Impact
                  </th>
                </tr>
              </thead>
              <tbody>
                {markets.map((market) => (
                  <tr key={market.symbol} className="border-b border-line last:border-0">
                    <td className="px-5 py-2.5 text-base font-medium text-ink">{market.symbol}</td>
                    <td className="tabular px-2 py-2.5 text-right text-base font-semibold text-ink">
                      {market.move}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <ImpactDots level={market.impact} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card>
            <CardHeader title="Event details" />
            <dl className="px-5 py-2">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="flex items-center justify-between gap-4 border-b border-line py-2.5 last:border-0"
                >
                  <dt className="shrink-0 text-sm text-ink-2">{fact.label}</dt>
                  <dd className="text-right text-sm font-medium text-ink">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="text-md font-semibold text-ink">Never miss this release</h2>
            <p className="mt-1.5 text-base leading-relaxed text-ink-2">
              Set an alert and we will tell you before the number lands — push, email or both.
            </p>
            <Button className="mt-4 w-full" onClick={() => setReminderOpen(true)}>
              {reminder ? <BellRing size={15} /> : <BellPlus size={15} />}
              {reminder ? 'Edit reminder' : 'Set reminder'}
            </Button>
            {reminder ? (
              <p className="mt-2 text-center text-2xs text-ink-3">
                Alerting {reminder.lead} minutes before · {reminder.channels.join(', ')}
              </p>
            ) : null}
          </Card>
        </aside>
      </div>

      <ReminderDialog event={event} open={reminderOpen} onClose={() => setReminderOpen(false)} />
    </div>
  );
}

function scheduleLabel(entry) {
  if (!entry) return 'Irregular';
  const { schedule } = entry;
  if (schedule.type === 'weekly') return 'Weekly';
  if (schedule.type === 'interval') return `Every ${schedule.weeks} weeks`;
  if (schedule.type === 'quarterly' || schedule.type === 'quarterlyNth') return 'Quarterly';
  return 'Monthly';
}

function defaultWhy(event, country) {
  return [
    {
      title: 'Policy path',
      body: `A surprise here feeds straight into what the market expects from the ${country?.bankShort ?? 'central bank'} at its next meeting.`,
    },
    {
      title: 'Currency reaction',
      body: `${event.impact === 'high' ? 'High-impact' : 'Moderate'} releases in this category typically move ${event.currency} crosses by around ${event.volatility} pips in the first minutes.`,
    },
    {
      title: 'Trend over level',
      body: 'One print rarely changes the picture — the direction across the last three releases is what shifts positioning.',
    },
  ];
}
