'use client';

import { useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import Flag from './Flag';
import { SearchInput } from './Controls';
import { countries, countriesByRegion, currencyPresets } from '@/data/countries';
import { useDismiss } from '@/lib/useNow';

/**
 * Multi-select for countries: searchable, grouped by region, with presets and
 * per-region select-all. Selection is a list of currency codes.
 */
export default function CountrySelect({ value, onChange, className = '', counts }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);
  useDismiss(containerRef, open, () => setOpen(false));

  const selected = value ?? [];

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return countriesByRegion;
    return countriesByRegion
      .map((group) => ({
        region: group.region,
        countries: group.countries.filter(
          (country) =>
            country.country.toLowerCase().includes(needle) ||
            country.code.toLowerCase().includes(needle) ||
            country.bankShort?.toLowerCase().includes(needle),
        ),
      }))
      .filter((group) => group.countries.length > 0);
  }, [query]);

  function toggle(code) {
    onChange(selected.includes(code) ? selected.filter((item) => item !== code) : [...selected, code]);
  }

  function toggleRegion(group) {
    const codes = group.countries.map((country) => country.code);
    const allSelected = codes.every((code) => selected.includes(code));
    onChange(
      allSelected
        ? selected.filter((code) => !codes.includes(code))
        : [...new Set([...selected, ...codes])],
    );
  }

  const summary =
    selected.length === 0
      ? 'No countries selected'
      : selected.length === countries.length
        ? 'All countries'
        : selected.length <= 3
          ? selected.join(', ')
          : `${selected.length} countries selected`;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className={`flex w-full items-center justify-between gap-2 rounded border bg-subtle px-3 py-2 text-sm font-medium transition-colors duration-150 ${
          open ? 'border-brand' : 'border-line hover:border-line-strong'
        }`}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected.length > 0 && selected.length <= 4 ? (
            <span className="flex -space-x-1">
              {selected.slice(0, 4).map((code) => (
                <Flag key={code} code={code} size="xs" />
              ))}
            </span>
          ) : (
            <Globe size={14} className="text-ink-3" />
          )}
          <span className="truncate text-ink">{summary}</span>
        </span>
        <ChevronDown size={14} className="shrink-0 text-ink-3" />
      </button>

      {open ? (
        <div className="absolute left-0 right-0 z-50 mt-2 rounded-xl border border-line bg-surface shadow-panel">
          <div className="border-b border-line p-3">
            <SearchInput value={query} onChange={setQuery} placeholder="Search countries" />
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {currencyPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onChange(preset.codes)}
                  className="rounded-full border border-line bg-subtle px-2.5 py-1 text-2xs font-medium text-ink-2 transition-colors duration-150 hover:border-brand hover:text-ink"
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => onChange([])}
                className="rounded-full border border-line px-2.5 py-1 text-2xs font-medium text-ink-3 transition-colors duration-150 hover:border-neg hover:text-neg"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="thin-scroll max-h-72 overflow-y-auto p-1.5">
            {groups.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-ink-3">No countries match “{query}”</p>
            ) : null}

            {groups.map((group) => {
              const codes = group.countries.map((country) => country.code);
              const allSelected = codes.every((code) => selected.includes(code));
              return (
                <div key={group.region} className="mb-1">
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <p className="text-2xs font-semibold uppercase tracking-wide text-ink-3">
                      {group.region}
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleRegion(group)}
                      className="text-2xs font-medium text-brand-soft hover:underline"
                    >
                      {allSelected ? 'Clear' : 'Select all'}
                    </button>
                  </div>
                  {group.countries.map((country) => {
                    const active = selected.includes(country.code);
                    const count = counts?.[country.code];
                    return (
                      <button
                        key={country.code}
                        type="button"
                        role="checkbox"
                        aria-checked={active}
                        onClick={() => toggle(country.code)}
                        className={`flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-left transition-colors duration-150 ${
                          active ? 'bg-brand/10' : 'hover:bg-subtle'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border ${
                            active ? 'border-accent bg-accent text-accent-ink' : 'border-line-strong bg-surface'
                          }`}
                        >
                          {active ? <Check size={11} strokeWidth={3} /> : null}
                        </span>
                        <Flag code={country.code} size="sm" />
                        <span className="min-w-0 flex-1 truncate text-sm text-ink">{country.country}</span>
                        <span className="tabular text-2xs text-ink-3">
                          {count !== undefined ? count : country.currencyOf ?? country.code}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-line px-3 py-2.5">
            <span className="text-2xs text-ink-3">{selected.length} selected</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded bg-brand px-3 py-1.5 text-2xs font-semibold text-white transition-colors duration-150 hover:bg-brand-hover"
            >
              Done
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
