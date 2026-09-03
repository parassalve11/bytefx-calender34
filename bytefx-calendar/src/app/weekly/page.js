'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button, Segmented } from '@/components/ui/Controls';
import { CurrencyFlag, ImpactDots } from '@/components/ui/Indicators';
import DatePicker from '@/components/ui/DatePicker';
import ReminderDialog from '@/components/calendar/ReminderDialog';
import { categories, majorCurrencies, timezoneById } from '@/data/countries';
import { getEventsInRange } from '@/lib/calendarEngine';
import {
  WEEKDAYS,
  addDays,
  endOfWeek,
  formatRange,
  formatShort,
  fromISODate,
  rangeOfDates,
  relativeDayLabel,
  shiftTime,
  startOfWeek,
  todayISO,
} from '@/lib/datetime';
import { useAppState } from '@/lib/store';
import { useStableNow } from '@/lib/useNow';

const IMPACT_WEIGHT = { high: 3, medium: 1.6, low: 0.7 };

/* Heat scale runs green (quiet) → amber → red (busy). */
function heatColor(score) {
  if (score >= 8) return 'bg-impact-high';
  if (score >= 5) return 'bg-[#EE6B23]';
  if (score >= 3) return 'bg-impact-medium';
  if (score >= 1) return 'bg-[#7FA80B]';
  if (score > 0) return 'bg-[#2F8A08]';
  return 'bg-impact-off';
}

const TAG_TONE = {
  high: 'border-impact-high/30 bg-impact-high/10 text-neg',
  medium: 'border-impact-medium/30 bg-impact-medium/10 text-[#B0730A] dark:text-impact-medium',
  low: 'border-line bg-subtle text-ink-2',
};

export default function WeeklyPage() {
  const { preferences, updatePreferences } = useAppState();
  const snapshot = useStableNow();
  const today = todayISO();

  const [anchor, setAnchor] = useState(() => startOfWeek(todayISO()));
  const [activeDay, setActiveDay] = useState(() => todayISO());
  const [scope, setScope] = useState('selected');
  const [reminderEvent, setReminderEvent] = useState(null);

  const zone = timezoneById(preferences.timezone);
  const weekStart = startOfWeek(anchor);
  const weekEnd = endOfWeek(anchor);
  const days = useMemo(() => rangeOfDates(weekStart, weekEnd), [weekStart, weekEnd]);

  const currencies = scope === 'selected' ? preferences.currencies : majorCurrencies;

  /* Pull a day either side so timezone shifts land on the right local day. */
  const events = useMemo(() => {
    const raw = getEventsInRange(addDays(weekStart, -1), addDays(weekEnd, 1), snapshot);
    return raw
      .filter((event) => currencies.includes(event.currency))
      .map((event) => {
        const local = shiftTime(event.date, event.time, zone.offset);
        return { ...event, localDate: local.date, localTime: local.time };
      })
      .filter((event) => event.localDate >= weekStart && event.localDate <= weekEnd);
  }, [weekStart, weekEnd, snapshot, currencies, zone.offset]);

  const byDay = useMemo(() => {
    const map = new Map(days.map((day) => [day, []]));
    for (const event of events) map.get(event.localDate)?.push(event);
    return map;
  }, [days, events]);

  const dayCards = useMemo(
    () =>
      days.map((day) => {
        const items = byDay.get(day) ?? [];
        return {
          date: day,
          name: WEEKDAYS[fromISODate(day).getUTCDay()],
          label: formatShort(day),
          total: items.length,
          high: items.filter((event) => event.impact === 'high').length,
          medium: items.filter((event) => event.impact === 'medium').length,
          low: items.filter((event) => event.impact === 'low').length,
        };
      }),
    [days, byDay],
  );

  /* Currency × weekday impact scores. */
  const heatmap = useMemo(() => {
    const weekdays = days.filter((day) => {
      const weekday = fromISODate(day).getUTCDay();
      return weekday !== 0 && weekday !== 6;
    });

    const rows = currencies
      .map((currency) => {
        const scores = weekdays.map((day) =>
          (byDay.get(day) ?? [])
            .filter((event) => event.currency === currency)
            .reduce((total, event) => total + IMPACT_WEIGHT[event.impact], 0),
        );
        const peak = Math.max(0, ...scores);
        return {
          currency,
          scores,
          total: scores.reduce((sum, score) => sum + score, 0),
          overall: peak >= 6 ? 'high' : peak >= 3 ? 'medium' : 'low',
        };
      })
      .filter((row) => row.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    return { columns: weekdays, rows };
  }, [days, byDay, currencies]);

  const categoryFocus = useMemo(() => {
    const counts = new Map();
    for (const event of events) {
      const bucket = counts.get(event.category) ?? { count: 0, high: 0 };
      bucket.count += 1;
      if (event.impact === 'high') bucket.high += 1;
      counts.set(event.category, bucket);
    }
    return categories
      .map((category) => ({
        name: category,
        count: counts.get(category)?.count ?? 0,
        impact:
          (counts.get(category)?.high ?? 0) >= 3
            ? 'high'
            : (counts.get(category)?.high ?? 0) >= 1
              ? 'medium'
              : 'low',
      }))
      .filter((row) => row.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [events]);

  const watched = useMemo(() => {
    const counts = new Map();
    for (const event of events) {
      if (event.impact !== 'high') continue;
      counts.set(event.currency, (counts.get(event.currency) ?? 0) + 1);
    }
    const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
    const peak = rows[0]?.[1] ?? 1;
    return rows.map(([currency, count]) => ({
      currency,
      events: count,
      share: Math.round((count / peak) * 100),
    }));
  }, [events]);

  const themes = useMemo(() => buildThemes(events, categoryFocus), [events, categoryFocus]);

  const selectedEvents = byDay.get(activeDay) ?? [];

  return (
    <>
      <PageHero
        title="Weekly overview"
        description="Your week ahead at a glance. Track the most important economic events, central bank decisions and market-moving releases."
        aside={
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous week"
                onClick={() => setAnchor(addDays(weekStart, -7))}
                className="flex h-9 w-9 items-center justify-center rounded border border-line-strong text-ink-2 transition-colors duration-150 hover:border-brand hover:text-ink"
              >
                <ChevronLeft size={16} />
              </button>
              <DatePicker
                value={activeDay}
                onChange={(date) => {
                  setAnchor(startOfWeek(date));
                  setActiveDay(date);
                }}
                currencies={currencies}
                mode="week"
                label={formatRange(weekStart, weekEnd)}
                className="min-w-[200px]"
              />
              <button
                type="button"
                aria-label="Next week"
                onClick={() => setAnchor(addDays(weekStart, 7))}
                className="flex h-9 w-9 items-center justify-center rounded border border-line-strong text-ink-2 transition-colors duration-150 hover:border-brand hover:text-ink"
              >
                <ChevronRight size={16} />
              </button>
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={() => {
                  setAnchor(startOfWeek(today));
                  setActiveDay(today);
                }}
              >
                This week
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Segmented
                size="sm"
                options={[
                  { value: 'selected', label: 'My countries' },
                  { value: 'majors', label: 'Majors' },
                ]}
                value={scope}
                onChange={setScope}
              />
              <span className="rounded border border-line bg-surface px-3 py-1.5 text-sm text-ink-2">
                <span className="tabular font-semibold text-ink">{events.length}</span> events ·{' '}
                <span className="tabular font-semibold text-neg">
                  {events.filter((event) => event.impact === 'high').length}
                </span>{' '}
                high impact
              </span>
            </div>
          </div>
        }
      />

      <div className="mx-auto max-w-shell px-4 py-8 sm:px-6 lg:px-8">
        <ul className="thin-scroll flex gap-3 overflow-x-auto">
          {dayCards.map((day) => {
            const active = day.date === activeDay;
            const isToday = day.date === today;
            return (
              <li key={day.date} className="min-w-[132px] flex-1">
                <button
                  type="button"
                  onClick={() => setActiveDay(day.date)}
                  aria-pressed={active}
                  className={`w-full rounded-xl border bg-surface px-4 py-4 text-center transition-colors duration-150 ${
                    active ? 'border-accent' : 'border-line hover:border-line-strong'
                  }`}
                >
                  <p className="text-base font-semibold text-ink">
                    {day.name}
                    {isToday ? (
                      <span className="ml-1.5 rounded bg-brand px-1.5 py-0.5 text-2xs font-semibold text-white">
                        Today
                      </span>
                    ) : null}
                  </p>
                  <p className="text-sm text-ink-3">{day.label}</p>
                  <p className="tabular mt-2 text-base font-semibold text-ink">{day.total} events</p>
                  <span className="mt-2 flex justify-center gap-1">
                    {[...Array(5)].map((_, index) => (
                      <span
                        key={index}
                        className={`h-1.5 w-1.5 rounded-full ${
                          index < Math.min(day.high, 5)
                            ? 'bg-impact-high'
                            : index < Math.min(day.high + day.medium, 5)
                              ? 'bg-impact-medium'
                              : index < Math.min(day.high + day.medium + day.low, 5)
                                ? 'bg-impact-low'
                                : 'bg-impact-off'
                        }`}
                      />
                    ))}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)_300px]">
          <Card className="min-w-0">
            <CardHeader title="Market impact heatmap" action="Score by weekday" />
            <div className="thin-scroll overflow-x-auto px-5 py-4">
              {heatmap.rows.length === 0 ? (
                <p className="py-10 text-center text-base text-ink-3">
                  No events this week for the selected countries.
                </p>
              ) : (
                <table className="w-full min-w-[380px] border-separate border-spacing-1 text-left">
                  <thead>
                    <tr className="text-xs text-ink-3">
                      <th scope="col" className="font-medium">
                        Country
                      </th>
                      {heatmap.columns.map((column) => (
                        <th key={column} scope="col" className="text-center font-medium">
                          {WEEKDAYS[fromISODate(column).getUTCDay()]}
                        </th>
                      ))}
                      <th scope="col" className="text-right font-medium">
                        Overall
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {heatmap.rows.map((row) => (
                      <tr key={row.currency}>
                        <th scope="row" className="pr-2 text-left">
                          <CurrencyFlag code={row.currency} />
                        </th>
                        {row.scores.map((score, index) => (
                          <td key={index} className="p-0">
                            <button
                              type="button"
                              onClick={() => setActiveDay(heatmap.columns[index])}
                              title={`${row.currency} · ${formatShort(heatmap.columns[index])} — impact score ${score.toFixed(1)}`}
                              className={`block h-7 w-full rounded-sm transition-opacity duration-150 hover:opacity-80 ${heatColor(score)}`}
                            />
                          </td>
                        ))}
                        <td className="pl-2 text-right">
                          <ImpactDots level={row.overall} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <p className="mt-4 flex flex-wrap items-center gap-4 text-xs text-ink-3">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#2F8A08]" /> Quiet
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-impact-medium" /> Busy
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-impact-high" /> Heavy
                </span>
                <span className="ml-auto">Click a cell to open that day</span>
              </p>
            </div>
          </Card>

          <div className="flex min-w-0 flex-col gap-6">
            <Card>
              <CardHeader
                title="Economic focus by category"
                action={
                  <Link href="/" className="font-medium text-brand-soft hover:underline">
                    All categories
                  </Link>
                }
              />
              <ul className="grid grid-cols-2 gap-3 px-5 py-4 sm:grid-cols-3">
                {categoryFocus.map((category) => (
                  <li
                    key={category.name}
                    className="flex h-full flex-col justify-between rounded-lg border border-line bg-subtle px-3 py-3 text-center"
                  >
                    <p className="min-h-[36px] text-xs leading-snug text-ink-2">{category.name}</p>
                    <p className="tabular mt-1 text-xl font-bold text-ink">{category.count}</p>
                    <p className="text-2xs text-ink-3">Events</p>
                    <span className="mt-1.5 flex justify-center">
                      <ImpactDots level={category.impact} />
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardHeader
                title={`${formatShort(activeDay)} · ${relativeDayLabel(activeDay, today)}`}
                action={`${selectedEvents.length} releases`}
              />
              <ul className="thin-scroll max-h-[420px] overflow-y-auto px-5 py-2">
                {selectedEvents.length === 0 ? (
                  <li className="py-10 text-center text-base text-ink-3">
                    Nothing scheduled for this day.
                  </li>
                ) : null}

                {selectedEvents.map((event) => (
                  <li
                    key={event.key}
                    className="flex items-start gap-3 border-b border-line py-3 last:border-0"
                  >
                    <span className="tabular w-12 shrink-0 pt-0.5 text-sm font-semibold text-ink">
                      {event.localTime}
                    </span>
                    <span className="min-w-0 flex-1">
                      <Link
                        href={`/events/${event.key}`}
                        className="block truncate text-base font-medium text-ink hover:text-brand-soft hover:underline"
                      >
                        {event.title}
                      </Link>
                      <span className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-3">
                        <CurrencyFlag code={event.currency} />
                        <span
                          className={`rounded border px-1.5 py-0.5 text-2xs font-semibold ${TAG_TONE[event.impact]}`}
                        >
                          {event.category}
                        </span>
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setReminderEvent(event)}
                      aria-label={`Set reminder for ${event.title}`}
                      className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded text-ink-3 transition-colors duration-150 hover:bg-subtle hover:text-ink"
                    >
                      <Bell size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader title="This week's key themes" />
              <ul className="flex flex-col gap-4 px-5 py-4">
                {themes.map((theme) => (
                  <li key={theme.title} className="flex gap-2.5">
                    <span
                      aria-hidden="true"
                      className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${theme.dot}`}
                    />
                    <p className="text-base leading-relaxed text-ink-2">
                      <span className="block font-semibold text-ink">{theme.title}</span>
                      {theme.body}
                    </p>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardHeader title="Most watched countries" action="High-impact events" />
              <ul className="px-5 py-4">
                {watched.map((row) => (
                  <li key={row.currency} className="flex items-center gap-3 py-2">
                    <span className="w-20 shrink-0">
                      <CurrencyFlag code={row.currency} />
                    </span>
                    <span className="h-2 flex-1 rounded-full bg-subtle">
                      <span
                        className="block h-2 rounded-full bg-impact-high"
                        style={{ width: `${row.share}%` }}
                      />
                    </span>
                    <span className="tabular w-6 text-right text-sm font-semibold text-ink">
                      {row.events}
                    </span>
                  </li>
                ))}
                {watched.length === 0 ? (
                  <li className="py-6 text-center text-sm text-ink-3">
                    No high-impact events this week.
                  </li>
                ) : null}
              </ul>
            </Card>
          </div>
        </div>
      </div>

      <ReminderDialog
        event={reminderEvent}
        open={Boolean(reminderEvent)}
        onClose={() => setReminderEvent(null)}
      />
    </>
  );
}

/** Themes read off the week's actual composition rather than a fixed list. */
function buildThemes(events, categoryFocus) {
  const themes = [];
  const highs = events.filter((event) => event.impact === 'high');

  const rateDecisions = highs.filter((event) => event.category === 'Interest rates');
  if (rateDecisions.length > 0) {
    themes.push({
      title: 'Central banks take the stage',
      body: `${rateDecisions.length} policy ${rateDecisions.length === 1 ? 'decision' : 'decisions'} this week, including ${rateDecisions[0].currency} on ${formatShort(rateDecisions[0].date)}.`,
      dot: 'bg-brand',
    });
  }

  const inflation = events.filter((event) => event.category === 'Inflation');
  if (inflation.length > 0) {
    themes.push({
      title: 'Inflation still in focus',
      body: `${inflation.length} inflation readings land, covering ${[...new Set(inflation.map((event) => event.currency))].slice(0, 4).join(', ')}.`,
      dot: 'bg-impact-high',
    });
  }

  const jobs = events.filter((event) => event.category === 'Employment');
  if (jobs.length > 0) {
    themes.push({
      title: 'Labour market check',
      body: `${jobs.length} employment releases may trigger volatility across FX, with ${jobs.filter((event) => event.impact === 'high').length} rated high impact.`,
      dot: 'bg-impact-medium',
    });
  }

  const busiest = categoryFocus[0];
  if (busiest) {
    themes.push({
      title: `${busiest.name} dominates the schedule`,
      body: `${busiest.count} of this week's releases fall in this category — the heaviest block on the calendar.`,
      dot: 'bg-impact-low',
    });
  }

  if (themes.length === 0) {
    themes.push({
      title: 'A quiet week',
      body: 'No high-impact releases for the countries you follow. A good week to review positioning.',
      dot: 'bg-impact-low',
    });
  }

  return themes.slice(0, 4);
}
