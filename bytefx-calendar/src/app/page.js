'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import FilterSidebar from '@/components/calendar/FilterSidebar';
import EventsTable from '@/components/calendar/EventsTable';
import {
  CentralBankCard,
  TopMarketsCard,
  UpcomingReleasesCard,
} from '@/components/calendar/SideRail';
import { Segmented } from '@/components/ui/Controls';
import { calendarDay, economicEvents, viewOptions } from '@/data/economicEvents';

const defaultFilters = {
  view: 'today',
  countries: ['USD', 'EUR', 'GBP', 'JPY', 'AUD'],
  moreCountries: 'More countries',
  impact: ['high', 'medium', 'low'],
  category: 'All categories',
  timezone: '(UTC+00:00) London',
};

export default function CalendarPage() {
  const [filters, setFilters] = useState(defaultFilters);

  const events = useMemo(
    () =>
      economicEvents.filter(
        (event) =>
          filters.countries.includes(event.currency) &&
          filters.impact.includes(event.impact) &&
          (filters.category === 'All categories' || event.category === filters.category),
      ),
    [filters],
  );

  return (
    <>
      <PageHero
        title="Economic calendar"
        description="Stay ahead of market-moving events. Track key economic releases and central bank decisions that impact global markets."
        aside={
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous day"
              className="flex h-9 w-9 items-center justify-center rounded border border-line-strong text-ink-2 transition-colors duration-150 hover:border-brand hover:text-ink"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="rounded border border-line bg-surface px-4 py-2 text-base font-semibold text-ink">
              {calendarDay.label}
            </div>
            <button
              type="button"
              aria-label="Next day"
              className="flex h-9 w-9 items-center justify-center rounded border border-line-strong text-ink-2 transition-colors duration-150 hover:border-brand hover:text-ink"
            >
              <ChevronRight size={16} />
            </button>
            <Segmented
              options={viewOptions}
              value={filters.view}
              onChange={(view) => setFilters({ ...filters, view })}
              className="ml-2 hidden sm:inline-flex"
            />
          </div>
        }
      />

      <div className="mx-auto grid max-w-shell grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8 xl:grid-cols-[260px_minmax(0,1fr)_300px]">
        <aside className="lg:sticky lg:top-32 lg:self-start">
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters(defaultFilters)}
          />
        </aside>

        <div className="min-w-0">
          <EventsTable events={events} />
        </div>

        <aside className="flex flex-col gap-6 xl:sticky xl:top-32 xl:self-start">
          <TopMarketsCard />
          <CentralBankCard />
          <UpcomingReleasesCard />
        </aside>
      </div>
    </>
  );
}
