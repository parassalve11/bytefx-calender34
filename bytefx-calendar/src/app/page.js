'use client';

import { useCallback, useMemo, useState } from 'react';
import { CalendarClock, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import FilterSidebar, { timeWindowById } from '@/components/calendar/FilterSidebar';
import EventsTable from '@/components/calendar/EventsTable';
import ReminderDialog from '@/components/calendar/ReminderDialog';
import {
  CentralBankCard,
  DayScorecardCard,
  TopMarketsCard,
  UpcomingReleasesCard,
} from '@/components/calendar/SideRail';
import DatePicker from '@/components/ui/DatePicker';
import { Button } from '@/components/ui/Controls';
import { timezoneById } from '@/data/countries';
import { filterEvents, getEventsInRange } from '@/lib/calendarEngine';
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  formatCountdown,
  formatLong,
  formatRange,
  relativeDayLabel,
  shiftTime,
  startOfMonth,
  startOfWeek,
  todayISO,
} from '@/lib/datetime';
import { useAppState } from '@/lib/store';
import { useNow, useStableNow } from '@/lib/useNow';

/** The date span the selected view covers. */
function viewRange(date, view) {
  if (view === 'week') return [startOfWeek(date), endOfWeek(date)];
  if (view === 'month') return [startOfMonth(date), endOfMonth(date)];
  return [date, date];
}

function step(date, view, direction) {
  if (view === 'week') return addDays(date, 7 * direction);
  if (view === 'month') return addMonths(date, direction);
  return addDays(date, direction);
}

export default function CalendarPage() {
  const { preferences, updatePreferences, resetPreferences } = useAppState();
  const [date, setDate] = useState(() => todayISO());
  const [reminderEvent, setReminderEvent] = useState(null);

  const snapshot = useStableNow();
  const now = useNow(1000);
  const today = todayISO();

  const zone = timezoneById(preferences.timezone);
  const view = preferences.view;
  const [from, to] = useMemo(() => viewRange(date, view), [date, view]);

  /**
   * Pull a day either side of the window: shifting into the viewer's timezone
   * moves late Tokyo releases forward and early Sydney releases back, and those
   * belong on the day the viewer actually sees them.
   */
  const windowEvents = useMemo(() => {
    const raw = getEventsInRange(addDays(from, -1), addDays(to, 1), snapshot);
    return raw.filter((event) => {
      const local = shiftTime(event.date, event.time, zone.offset);
      return local.date >= from && local.date <= to;
    });
  }, [from, to, snapshot, zone.offset]);

  const byCountry = useMemo(
    () => windowEvents.filter((event) => preferences.currencies.includes(event.currency)),
    [windowEvents, preferences.currencies],
  );

  const impactCounts = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0 };
    for (const event of byCountry) counts[event.impact] += 1;
    return counts;
  }, [byCountry]);

  const categoryCounts = useMemo(() => {
    const counts = {};
    for (const event of byCountry) {
      if (!preferences.impacts.includes(event.impact)) continue;
      counts[event.category] = (counts[event.category] ?? 0) + 1;
    }
    return counts;
  }, [byCountry, preferences.impacts]);

  const timeWindow = timeWindowById(preferences.timeWindow ?? 'all');

  const events = useMemo(
    () =>
      filterEvents(windowEvents, {
        currencies: preferences.currencies,
        impacts: preferences.impacts,
        categories: preferences.categories,
        query: preferences.query,
        onlyUpcoming: preferences.onlyUpcoming,
        hideNoData: preferences.hideNoData,
        fromMinutes: timeWindow.from,
        toMinutes: timeWindow.to,
        offset: zone.offset,
      }),
    [windowEvents, preferences, timeWindow, zone.offset],
  );

  const nextEvent = useMemo(
    () => events.filter((event) => event.epoch > now).sort((a, b) => a.epoch - b.epoch)[0] ?? null,
    [events, now],
  );

  const headerLabel = useMemo(() => {
    if (view === 'week') return formatRange(from, to);
    if (view === 'month') return formatRange(from, to);
    return formatLong(date);
  }, [view, from, to, date]);

  const openReminder = useCallback((event) => setReminderEvent(event), []);

  return (
    <>
      <PageHero
        title="Economic calendar"
        description="Stay ahead of market-moving events. Track key economic releases and central bank decisions that impact global markets."
        aside={
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={`Previous ${view}`}
                onClick={() => setDate(step(date, view, -1))}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-line-strong text-ink-2 transition-colors duration-150 hover:border-brand hover:text-ink"
              >
                <ChevronLeft size={16} />
              </button>

              <DatePicker
                value={date}
                onChange={setDate}
                currencies={preferences.currencies}
                mode={view === 'week' ? 'week' : 'day'}
                label={headerLabel}
                className="min-w-[220px]"
              />

              <button
                type="button"
                aria-label={`Next ${view}`}
                onClick={() => setDate(step(date, view, 1))}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-line-strong text-ink-2 transition-colors duration-150 hover:border-brand hover:text-ink"
              >
                <ChevronRight size={16} />
              </button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setDate(today)}
                disabled={date === today}
                className="h-9"
              >
                Today
              </Button>
            </div>

            <dl className="flex flex-wrap items-center gap-2">
              <div className="rounded border border-line bg-surface px-3 py-2">
                <dt className="text-2xs text-ink-3">Releases</dt>
                <dd className="tabular text-md font-semibold text-ink">{events.length}</dd>
              </div>
              <div className="rounded border border-line bg-surface px-3 py-2">
                <dt className="text-2xs text-ink-3">High impact</dt>
                <dd className="tabular text-md font-semibold text-neg">
                  {events.filter((event) => event.impact === 'high').length}
                </dd>
              </div>
              <div className="min-w-[168px] rounded border border-line bg-surface px-3 py-2">
                <dt className="flex items-center gap-1.5 text-2xs text-ink-3">
                  <CalendarClock size={11} />
                  Next release
                </dt>
                <dd className="truncate text-md font-semibold text-ink">
                  {nextEvent ? (
                    <>
                      <span className="tabular text-brand-soft">
                        {formatCountdown(nextEvent.epoch - now)}
                      </span>
                      <span className="ml-1.5 text-sm font-normal text-ink-2">
                        {nextEvent.currency}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-normal text-ink-3">Nothing scheduled</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        }
      />

      <div className="mx-auto grid max-w-shell grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[268px_minmax(0,1fr)] lg:px-8 xl:grid-cols-[268px_minmax(0,1fr)_300px]">
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <FilterSidebar
            filters={preferences}
            onChange={updatePreferences}
            onReset={resetPreferences}
            date={date}
            onDateChange={setDate}
            resultCount={events.length}
            impactCounts={impactCounts}
            categoryCounts={categoryCounts}
          />
        </aside>

        <div className="min-w-0">
          <EventsTable
            events={events}
            offset={zone.offset}
            onOpenReminder={openReminder}
            title={headerLabel}
            subtitle={`${relativeDayLabel(date, today)} · all times in ${zone.label}`}
          />
        </div>

        <aside className="flex flex-col gap-6 xl:sticky xl:top-32 xl:self-start">
          <TopMarketsCard />
          <DayScorecardCard events={events} />
          <CentralBankCard date={date} />
          <UpcomingReleasesCard
            date={date}
            currencies={preferences.currencies}
            offset={zone.offset}
            onOpenReminder={openReminder}
          />
        </aside>
      </div>

      <ReminderDialog
        event={reminderEvent}
        open={Boolean(reminderEvent)}
        onClose={() => setReminderEvent(null)}
      />
    </>
  );
}
