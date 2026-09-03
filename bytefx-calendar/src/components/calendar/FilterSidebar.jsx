'use client';

import { useState } from 'react';
import { CalendarDays, SlidersHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button, Checkbox, Segmented, Select } from '@/components/ui/Controls';
import { CurrencyFlag, ImpactDots } from '@/components/ui/Indicators';
import { categories, countryFilters, timezones } from '@/data/currencies';
import { calendarDay, impactLevels, viewOptions } from '@/data/economicEvents';

export default function FilterSidebar({ filters, onChange, onReset }) {
  const [open, setOpen] = useState(false);

  function toggleCountry(code, checked) {
    const next = checked
      ? [...filters.countries, code]
      : filters.countries.filter((c) => c !== code);
    onChange({ ...filters, countries: next });
  }

  function toggleImpact(level, checked) {
    const next = checked ? [...filters.impact, level] : filters.impact.filter((i) => i !== level);
    onChange({ ...filters, impact: next });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mb-4 flex w-full items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 text-base font-semibold text-ink lg:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={16} />
          Filters
        </span>
        <span className="text-sm font-medium text-ink-3">
          {filters.countries.length} countries · {filters.impact.length} levels
        </span>
      </button>

      <Card className={`${open ? 'block' : 'hidden'} p-5 lg:block`}>
        <div className="flex items-center justify-between">
          <h2 className="text-md font-semibold text-ink">Filters</h2>
          <button
            type="button"
            onClick={onReset}
            className="text-sm font-medium text-brand-soft hover:underline"
          >
            Reset
          </button>
        </div>

        <div className="mt-5">
          <p className="mb-1.5 text-xs font-medium text-ink-3">Date range</p>
          <button
            type="button"
            className="flex w-full items-center justify-between rounded border border-line bg-subtle px-3 py-2 text-sm font-medium text-ink transition-colors duration-150 hover:border-line-strong"
          >
            {calendarDay.range}
            <CalendarDays size={14} className="text-ink-3" />
          </button>
        </div>

        <div className="mt-5">
          <p className="mb-1.5 text-xs font-medium text-ink-3">View</p>
          <Segmented
            options={viewOptions}
            value={filters.view}
            onChange={(view) => onChange({ ...filters, view })}
            className="w-full"
          />
        </div>

        <fieldset className="mt-5">
          <legend className="mb-1 text-xs font-medium text-ink-3">Countries</legend>
          {countryFilters.map((country) => (
            <Checkbox
              key={country.code}
              checked={filters.countries.includes(country.code)}
              onChange={(checked) => toggleCountry(country.code, checked)}
            >
              <span className="flex items-center gap-2">
                <CurrencyFlag code={country.code} showCode={false} />
                {country.label}
              </span>
            </Checkbox>
          ))}
          <Select
            id="more-countries"
            options={['More countries', 'Canada (CAD)', 'Switzerland (CHF)', 'New Zealand (NZD)', 'China (CNY)']}
            value={filters.moreCountries}
            onChange={(moreCountries) => onChange({ ...filters, moreCountries })}
            className="mt-2"
          />
        </fieldset>

        <fieldset className="mt-5">
          <legend className="mb-1 text-xs font-medium text-ink-3">Impact level</legend>
          {impactLevels.map((level) => (
            <Checkbox
              key={level.value}
              checked={filters.impact.includes(level.value)}
              onChange={(checked) => toggleImpact(level.value, checked)}
              trailing={<ImpactDots level={level.value} />}
            >
              {level.label}
            </Checkbox>
          ))}
        </fieldset>

        <Select
          id="category"
          label="Categories"
          options={categories}
          value={filters.category}
          onChange={(category) => onChange({ ...filters, category })}
          className="mt-5"
        />

        <Select
          id="timezone"
          label="Timezone"
          options={timezones}
          value={filters.timezone}
          onChange={(timezone) => onChange({ ...filters, timezone })}
          className="mt-5"
        />

        <Button className="mt-6 w-full" onClick={() => setOpen(false)}>
          Apply filters
        </Button>
      </Card>
    </>
  );
}
