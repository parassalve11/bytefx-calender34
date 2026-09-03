'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button, Checkbox, SearchInput, Segmented, Select, Toggle } from '@/components/ui/Controls';
import { ImpactDots } from '@/components/ui/Indicators';
import CountrySelect from '@/components/ui/CountrySelect';
import DatePicker from '@/components/ui/DatePicker';
import { categories, currencyPresets, timezones } from '@/data/countries';
import { impactLevels, viewOptions } from '@/data/eventCatalog';
import { endOfWeek, formatMedium, formatRange, startOfWeek } from '@/lib/datetime';

const TIME_WINDOWS = [
  { value: 'all', label: 'All day', from: 0, to: 1439 },
  { value: 'asia', label: 'Asia session · 00:00–08:00', from: 0, to: 479 },
  { value: 'london', label: 'London session · 07:00–16:00', from: 420, to: 959 },
  { value: 'newyork', label: 'New York session · 12:00–21:00', from: 720, to: 1259 },
  { value: 'morning', label: 'Morning · 06:00–12:00', from: 360, to: 719 },
  { value: 'afternoon', label: 'Afternoon · 12:00–18:00', from: 720, to: 1079 },
];

export function timeWindowById(id) {
  return TIME_WINDOWS.find((window) => window.value === id) ?? TIME_WINDOWS[0];
}

export default function FilterSidebar({
  filters,
  onChange,
  onReset,
  date,
  onDateChange,
  resultCount,
  impactCounts,
  categoryCounts,
}) {
  const [open, setOpen] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const rangeLabel = useMemo(() => {
    if (filters.view === 'week') return formatRange(startOfWeek(date), endOfWeek(date));
    if (filters.view === 'month') return formatRange(`${date.slice(0, 7)}-01`, date);
    return formatMedium(date);
  }, [filters.view, date]);

  function patch(next) {
    onChange({ ...filters, ...next });
  }

  function toggleImpact(level, checked) {
    patch({
      impacts: checked ? [...filters.impacts, level] : filters.impacts.filter((item) => item !== level),
    });
  }

  function toggleCategory(category, checked) {
    const current = filters.categories.filter((item) => item !== 'All categories');
    const next = checked ? [...current, category] : current.filter((item) => item !== category);
    patch({ categories: next.length === 0 ? ['All categories'] : next });
  }

  const allCategories = filters.categories.includes('All categories');

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="mb-4 flex w-full items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 text-base font-semibold text-ink lg:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={16} />
          Filters
        </span>
        <span className="text-sm font-medium text-ink-3">
          {filters.currencies.length} countries · {filters.impacts.length} levels
        </span>
      </button>

      <Card className={`${open ? 'block' : 'hidden'} p-5 lg:block`}>
        <div className="flex items-center justify-between">
          <h2 className="text-md font-semibold text-ink">Filters</h2>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-soft hover:underline"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        </div>

        <div className="mt-5">
          <p className="mb-1.5 text-xs font-medium text-ink-3">Date</p>
          <DatePicker
            value={date}
            onChange={onDateChange}
            currencies={filters.currencies}
            mode={filters.view === 'week' ? 'week' : 'day'}
            label={rangeLabel}
            align="left"
          />
        </div>

        <div className="mt-5">
          <p className="mb-1.5 text-xs font-medium text-ink-3">View</p>
          <Segmented
            options={viewOptions}
            value={filters.view}
            onChange={(view) => patch({ view })}
            className="w-full"
          />
        </div>

        <SearchInput
          id="calendar-search"
          label="Search events"
          value={filters.query}
          onChange={(query) => patch({ query })}
          placeholder="Payrolls, CPI, Powell…"
          className="mt-5"
        />

        <div className="mt-5">
          <p className="mb-1.5 text-xs font-medium text-ink-3">Countries</p>
          <CountrySelect
            value={filters.currencies}
            onChange={(currencies) => patch({ currencies })}
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {currencyPresets.slice(0, 3).map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => patch({ currencies: preset.codes })}
                className="rounded-full border border-line bg-subtle px-2.5 py-1 text-2xs font-medium text-ink-2 transition-colors duration-150 hover:border-brand hover:text-ink"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="mb-1 text-xs font-medium text-ink-3">Impact level</legend>
          {impactLevels.map((level) => (
            <Checkbox
              key={level.value}
              checked={filters.impacts.includes(level.value)}
              onChange={(checked) => toggleImpact(level.value, checked)}
              trailing={
                <span className="flex items-center gap-2">
                  {impactCounts ? (
                    <span className="tabular text-2xs text-ink-3">{impactCounts[level.value] ?? 0}</span>
                  ) : null}
                  <ImpactDots level={level.value} />
                </span>
              }
            >
              {level.label}
            </Checkbox>
          ))}
        </fieldset>

        <div className="mt-5">
          <button
            type="button"
            onClick={() => setShowCategories((current) => !current)}
            aria-expanded={showCategories}
            className="flex w-full items-center justify-between text-xs font-medium text-ink-3"
          >
            Categories
            <span className="flex items-center gap-1.5 text-ink-2">
              {allCategories ? 'All' : `${filters.categories.length} selected`}
              <ChevronDown
                size={13}
                className={`transition-transform duration-150 ${showCategories ? 'rotate-180' : ''}`}
              />
            </span>
          </button>

          {showCategories ? (
            <div className="thin-scroll mt-2 max-h-56 overflow-y-auto rounded border border-line bg-subtle px-3 py-1">
              <Checkbox
                checked={allCategories}
                onChange={(checked) => patch({ categories: checked ? ['All categories'] : [] })}
              >
                All categories
              </Checkbox>
              {categories.map((category) => (
                <Checkbox
                  key={category}
                  checked={!allCategories && filters.categories.includes(category)}
                  onChange={(checked) => toggleCategory(category, checked)}
                  trailing={
                    categoryCounts ? (
                      <span className="tabular text-2xs text-ink-3">{categoryCounts[category] ?? 0}</span>
                    ) : null
                  }
                >
                  {category}
                </Checkbox>
              ))}
            </div>
          ) : null}
        </div>

        <Select
          id="time-window"
          label="Time of day"
          options={TIME_WINDOWS.map((window) => ({ value: window.value, label: window.label }))}
          value={filters.timeWindow ?? 'all'}
          onChange={(timeWindow) => patch({ timeWindow })}
          className="mt-5"
        />

        <Select
          id="timezone"
          label="Timezone"
          options={timezones.map((zone) => ({ value: zone.id, label: zone.label }))}
          value={filters.timezone}
          onChange={(timezone) => patch({ timezone })}
          className="mt-5"
          hint="All release times below are shown in this zone."
        />

        <div className="mt-5 border-t border-line pt-1">
          <Toggle
            checked={filters.onlyUpcoming}
            onChange={(onlyUpcoming) => patch({ onlyUpcoming })}
            label="Upcoming only"
            description="Hide releases that have already printed."
          />
          <Toggle
            checked={filters.hideNoData}
            onChange={(hideNoData) => patch({ hideNoData })}
            label="Hide events without data"
            description="Skip speeches and reports with no numeric release."
          />
        </div>

        <Button className="mt-6 w-full" onClick={() => setOpen(false)}>
          Show {resultCount} {resultCount === 1 ? 'event' : 'events'}
        </Button>
      </Card>
    </>
  );
}
