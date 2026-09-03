'use client';

import { Fragment, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpDown,
  Bell,
  BellRing,
  ChevronDown,
  FileText,
  Mic,
  Star,
} from 'lucide-react';
import { ActualValue, CurrencyFlag, ImpactDots, Value } from '@/components/ui/Indicators';
import { useAppState } from '@/lib/store';
import { formatCountdown, formatLong, relativeDayLabel, shiftTime, todayISO } from '@/lib/datetime';
import { useNow } from '@/lib/useNow';

const IMPACT_ORDER = { high: 0, medium: 1, low: 2 };

const SORTS = [
  { value: 'time', label: 'Time' },
  { value: 'impact', label: 'Impact' },
  { value: 'currency', label: 'Country' },
];

function EventDetailRow({ event, columns }) {
  const stats = [
    { label: 'Actual', value: event.actual, tone: event.surprise },
    { label: 'Forecast', value: event.forecast },
    { label: 'Previous', value: event.previous },
    { label: 'Typical volatility', value: `${event.volatility} pips` },
  ];

  return (
    <tr className="bg-subtle/60">
      <td colSpan={columns} className="border-b border-line px-4 pb-5 pt-1 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <div>
            <p className="text-base leading-relaxed text-ink-2">{event.description}</p>
            {event.commentary ? (
              <p className="mt-3 flex gap-2 text-base leading-relaxed text-ink-2">
                <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {event.commentary}
              </p>
            ) : null}
            <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-3">
              <span>Source: {event.source}</span>
              <span>Category: {event.category}</span>
              {event.period ? <span>Period: {event.period}</span> : null}
            </p>
            <Link
              href={`/events/${event.key}`}
              className="mt-4 inline-flex items-center gap-1.5 text-base font-semibold text-brand-soft hover:underline"
            >
              View full event
              <ArrowRight size={14} />
            </Link>
          </div>

          {event.type === 'data' ? (
            <dl className="grid grid-cols-2 gap-2 self-start sm:grid-cols-4 lg:grid-cols-2">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-lg border border-line bg-surface px-3 py-2.5">
                  <dt className="text-2xs text-ink-3">{stat.label}</dt>
                  <dd
                    className={`tabular mt-1 text-md font-semibold ${
                      stat.tone === 'beat' ? 'text-pos' : stat.tone === 'miss' ? 'text-neg' : 'text-ink'
                    }`}
                  >
                    {stat.value ?? '–'}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </td>
    </tr>
  );
}

export default function EventsTable({ events, offset = 0, onOpenReminder, title, subtitle }) {
  const [expanded, setExpanded] = useState(null);
  const [sort, setSort] = useState('time');
  const { reminderFor, isSaved, toggleSaved, toast } = useAppState();
  const now = useNow(1000);
  const today = todayISO();

  /* Shift every release into the selected timezone, then group by local day. */
  const groups = useMemo(() => {
    const shifted = events.map((event) => {
      const local = shiftTime(event.date, event.time, offset);
      return { ...event, localDate: local.date, localTime: local.time, localMinutes: local.minutes };
    });

    const sorted = [...shifted].sort((a, b) => {
      if (sort === 'impact') {
        return (
          IMPACT_ORDER[a.impact] - IMPACT_ORDER[b.impact] ||
          a.localDate.localeCompare(b.localDate) ||
          a.localMinutes - b.localMinutes
        );
      }
      if (sort === 'currency') {
        return (
          a.currency.localeCompare(b.currency) ||
          a.localDate.localeCompare(b.localDate) ||
          a.localMinutes - b.localMinutes
        );
      }
      return a.localDate.localeCompare(b.localDate) || a.localMinutes - b.localMinutes;
    });

    const byDay = new Map();
    for (const event of sorted) {
      if (!byDay.has(event.localDate)) byDay.set(event.localDate, []);
      byDay.get(event.localDate).push(event);
    }
    return [...byDay.entries()].map(([date, items]) => ({ date, items }));
  }, [events, offset, sort]);

  // The single next release across the whole list gets the countdown chip.
  const nextKey = useMemo(() => {
    const upcoming = events
      .filter((event) => event.epoch > now)
      .sort((a, b) => a.epoch - b.epoch);
    return upcoming[0]?.key ?? null;
  }, [events, now]);

  const multiDay = groups.length > 1;

  return (
    <div className="rounded-xl border border-line bg-surface shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-4 sm:px-6">
        <div>
          <h2 className="text-xl font-semibold text-ink">{title}</h2>
          {subtitle ? <p className="mt-0.5 text-sm text-ink-3">{subtitle}</p> : null}
        </div>
        <label className="flex items-center gap-2 text-sm text-ink-3">
          <ArrowUpDown size={13} />
          Sort
          <select
            value={sort}
            onChange={(changeEvent) => setSort(changeEvent.target.value)}
            aria-label="Sort events"
            className="cursor-pointer rounded border border-line bg-subtle px-2 py-1 text-sm font-medium text-ink hover:border-line-strong"
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="thin-scroll overflow-x-auto">
        <table className="w-full min-w-[740px] border-collapse text-left">
          <caption className="sr-only">
            Economic releases with impact, actual, forecast and previous values
          </caption>
          <thead>
            <tr className="text-xs font-medium text-ink-3">
              <th scope="col" className="border-b border-line px-4 py-3 font-medium sm:px-5">
                Time
              </th>
              <th scope="col" className="border-b border-line px-3 py-3 font-medium">
                Country
              </th>
              <th scope="col" className="border-b border-line px-3 py-3 font-medium">
                Event
              </th>
              <th scope="col" className="border-b border-line px-3 py-3 font-medium">
                Impact
              </th>
              <th scope="col" className="border-b border-line px-2.5 py-3 text-right font-medium">
                Actual
              </th>
              <th scope="col" className="border-b border-line px-2.5 py-3 text-right font-medium">
                Forecast
              </th>
              <th scope="col" className="border-b border-line px-2.5 py-3 text-right font-medium">
                Previous
              </th>
              <th scope="col" className="relative border-b border-line px-3 py-3 sm:px-4">
                <span className="sr-only">Reminder and save actions</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {groups.map((group) => (
              <Fragment key={group.date}>
                {multiDay ? (
                  <tr className="bg-raised">
                    <th
                      colSpan={8}
                      scope="colgroup"
                      className="border-b border-line px-4 py-2 text-left text-xs font-semibold text-ink-2 sm:px-6"
                    >
                      {formatLong(group.date)}
                      <span className="ml-2 font-normal text-ink-3">
                        {relativeDayLabel(group.date, today)} · {group.items.length} releases
                      </span>
                    </th>
                  </tr>
                ) : null}

                {group.items.map((event) => {
                  const isOpen = expanded === event.key;
                  const reminder = reminderFor(event.key);
                  const saved = isSaved(event.key);
                  const isNext = event.key === nextKey;

                  return (
                    <Fragment key={event.key}>
                      <tr
                        className={`transition-colors duration-150 hover:bg-subtle ${
                          isOpen ? 'bg-subtle/60' : ''
                        } ${isNext ? 'shadow-[inset_3px_0_0_#1357BC]' : ''}`}
                      >
                        <td className="tabular whitespace-nowrap border-b border-line px-4 py-3.5 text-sm text-ink-2 sm:px-5">
                          {event.localTime}
                          {event.status === 'released' ? null : (
                            <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle" />
                          )}
                        </td>

                        <td className="whitespace-nowrap border-b border-line px-3 py-3.5">
                          <CurrencyFlag code={event.currency} />
                        </td>

                        <td className="max-w-[230px] border-b border-line px-2.5 py-3.5">
                          <button
                            type="button"
                            onClick={() => setExpanded(isOpen ? null : event.key)}
                            aria-expanded={isOpen}
                            className="flex w-full items-center gap-2 text-left"
                          >
                            <span className="truncate text-base font-medium text-ink">
                              {event.title}
                              {event.period ? (
                                <span className="font-normal text-ink-3"> ({event.period})</span>
                              ) : null}
                            </span>
                            {event.preliminary ? (
                              <span
                                title="Preliminary reading"
                                className="shrink-0 rounded-sm border border-line px-1 text-2xs font-semibold text-ink-3"
                              >
                                P
                              </span>
                            ) : null}
                            {event.type === 'speech' ? (
                              <Mic size={13} className="shrink-0 text-ink-3" aria-label="Speech" />
                            ) : null}
                            {event.type === 'minutes' || event.type === 'report' ? (
                              <FileText size={13} className="shrink-0 text-ink-3" aria-label="Report" />
                            ) : null}
                            {isNext ? (
                              <span className="tabular shrink-0 rounded border border-brand/25 bg-brand/10 px-2 py-0.5 text-2xs font-semibold text-brand-soft">
                                In {formatCountdown(event.epoch - now)}
                              </span>
                            ) : null}
                            <ChevronDown
                              size={14}
                              className={`shrink-0 text-ink-3 transition-transform duration-150 ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                        </td>

                        <td className="border-b border-line px-3 py-3.5">
                          <ImpactDots level={event.impact} />
                        </td>

                        <td className="tabular border-b border-line px-2.5 py-3.5 text-right text-base font-semibold">
                          <ActualValue value={event.actual} surprise={event.surprise} />
                        </td>
                        <td className="tabular border-b border-line px-2.5 py-3.5 text-right text-base">
                          <Value value={event.forecast} />
                        </td>
                        <td className="tabular border-b border-line px-2.5 py-3.5 text-right text-base">
                          <Value value={event.previous} />
                        </td>

                        <td className="border-b border-line px-3 py-3.5 sm:px-4">
                          <span className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => onOpenReminder?.(event)}
                              aria-label={
                                reminder ? `Edit reminder for ${event.title}` : `Set reminder for ${event.title}`
                              }
                              title={reminder ? 'Edit reminder' : 'Set reminder'}
                              className={`flex h-7 w-7 items-center justify-center rounded transition-colors duration-150 ${
                                reminder
                                  ? 'bg-brand/10 text-brand-soft'
                                  : 'text-ink-3 hover:bg-subtle hover:text-ink'
                              }`}
                            >
                              {reminder ? <BellRing size={14} /> : <Bell size={14} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const added = toggleSaved(event.key);
                                toast(
                                  added
                                    ? `Saved ${event.title} to your watchlist`
                                    : `Removed ${event.title} from your watchlist`,
                                  added ? 'success' : 'info',
                                );
                              }}
                              aria-pressed={saved}
                              aria-label={saved ? `Unsave ${event.title}` : `Save ${event.title}`}
                              title={saved ? 'Remove from watchlist' : 'Save to watchlist'}
                              className={`flex h-7 w-7 items-center justify-center rounded transition-colors duration-150 ${
                                saved
                                  ? 'text-impact-medium'
                                  : 'text-ink-3 hover:bg-subtle hover:text-ink'
                              }`}
                            >
                              <Star size={14} fill={saved ? 'currentColor' : 'none'} />
                            </button>
                          </span>
                        </td>
                      </tr>

                      {isOpen ? <EventDetailRow event={event} columns={8} /> : null}
                    </Fragment>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {events.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-md font-semibold text-ink">No events match these filters</p>
          <p className="mt-1 text-base text-ink-2">
            Widen the impact level, add more countries, or clear the search to see releases for this day.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm text-ink-3 sm:px-6">
          <span>
            Showing {events.length} {events.length === 1 ? 'release' : 'releases'}
            {groups.length > 1 ? ` across ${groups.length} days` : ''}
          </span>
          <Link href="/weekly" className="font-medium text-brand-soft hover:underline">
            See the full week
          </Link>
        </div>
      )}
    </div>
  );
}
