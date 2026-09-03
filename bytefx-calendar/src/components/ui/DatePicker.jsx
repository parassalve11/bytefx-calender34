'use client';

import { useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { getDailyCounts } from '@/lib/calendarEngine';
import {
  MONTHS,
  addDays,
  addMonths,
  daysInMonth,
  endOfWeek,
  formatLong,
  formatMedium,
  fromISODate,
  startOfMonth,
  startOfWeek,
  todayISO,
  toISODate,
  weekdayOf,
} from '@/lib/datetime';
import { useDismiss, useStableNow } from '@/lib/useNow';

const WEEK_HEADS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/** Build the 6×7 grid of the month containing `iso`, Monday first. */
function monthGrid(iso) {
  const first = startOfMonth(iso);
  const firstDate = fromISODate(first);
  const year = firstDate.getUTCFullYear();
  const monthIndex = firstDate.getUTCMonth();
  const leading = (weekdayOf(first) + 6) % 7; // Monday = 0
  const total = daysInMonth(year, monthIndex);

  const cells = [];
  for (let i = 0; i < leading; i += 1) {
    cells.push({ iso: addDays(first, i - leading), outside: true });
  }
  for (let day = 1; day <= total; day += 1) {
    cells.push({ iso: toISODate(new Date(Date.UTC(year, monthIndex, day))), outside: false });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ iso: addDays(cells[cells.length - 1].iso, 1), outside: true });
  }
  while (cells.length < 42) {
    cells.push({ iso: addDays(cells[cells.length - 1].iso, 1), outside: true });
  }
  return cells;
}

/**
 * The calendar panel itself. Kept separate so it can be embedded inline (the
 * weekly overview does this) as well as inside the popover below.
 */
export function CalendarPanel({ value, onSelect, currencies, mode = 'day', footer = true }) {
  const now = useStableNow();
  const today = todayISO();
  const [cursor, setCursor] = useState(() => startOfMonth(value || today));

  const cells = useMemo(() => monthGrid(cursor), [cursor]);

  // Only count events for the visible grid, which keeps this cheap.
  const counts = useMemo(
    () => getDailyCounts(cells[0].iso, cells[cells.length - 1].iso, now, currencies),
    [cells, now, currencies],
  );

  const weekStart = mode === 'week' && value ? startOfWeek(value) : null;
  const weekEnd = mode === 'week' && value ? endOfWeek(value) : null;

  const monthLabel = `${MONTHS[fromISODate(cursor).getUTCMonth()]} ${fromISODate(cursor).getUTCFullYear()}`;

  return (
    <div className="w-[304px] select-none p-3">
      <div className="flex items-center justify-between gap-1">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setCursor(addMonths(cursor, -1))}
          className="flex h-7 w-7 items-center justify-center rounded text-ink-2 transition-colors duration-150 hover:bg-subtle hover:text-ink"
        >
          <ChevronLeft size={15} />
        </button>
        <p className="text-sm font-semibold text-ink" aria-live="polite">
          {monthLabel}
        </p>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setCursor(addMonths(cursor, 1))}
          className="flex h-7 w-7 items-center justify-center rounded text-ink-2 transition-colors duration-150 hover:bg-subtle hover:text-ink"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-0.5">
        {WEEK_HEADS.map((head) => (
          <div key={head} className="pb-1 text-center text-2xs font-semibold uppercase text-ink-3">
            {head}
          </div>
        ))}

        {cells.map((cell) => {
          const count = counts[cell.iso] ?? { total: 0, high: 0, medium: 0, low: 0 };
          const isToday = cell.iso === today;
          const isSelected = cell.iso === value;
          const inWeek = weekStart && cell.iso >= weekStart && cell.iso <= weekEnd;

          return (
            <button
              key={cell.iso}
              type="button"
              aria-label={`${formatLong(cell.iso)} — ${count.total} events`}
              aria-current={isSelected ? 'date' : undefined}
              onClick={() => onSelect?.(cell.iso)}
              className={`flex h-9 flex-col items-center justify-center gap-1 rounded transition-colors duration-150 ${
                isSelected
                  ? 'bg-brand font-semibold text-white'
                  : inWeek
                    ? 'bg-brand/10 text-ink'
                    : cell.outside
                      ? 'text-ink-3 hover:bg-subtle'
                      : 'text-ink hover:bg-subtle'
              } ${isToday && !isSelected ? 'ring-1 ring-inset ring-accent' : ''}`}
            >
              <span className="tabular text-xs leading-none">{fromISODate(cell.iso).getUTCDate()}</span>
              <span className="flex h-1 items-center gap-0.5">
                {count.high > 0 ? (
                  <span className={`h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-impact-high'}`} />
                ) : null}
                {count.medium > 0 ? (
                  <span className={`h-1 w-1 rounded-full ${isSelected ? 'bg-white/70' : 'bg-impact-medium'}`} />
                ) : null}
                {count.low > 0 ? (
                  <span className={`h-1 w-1 rounded-full ${isSelected ? 'bg-white/50' : 'bg-impact-low'}`} />
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      {footer ? (
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
          <span className="flex items-center gap-2 text-2xs text-ink-3">
            <span className="h-1.5 w-1.5 rounded-full bg-impact-high" /> High
            <span className="h-1.5 w-1.5 rounded-full bg-impact-medium" /> Med
            <span className="h-1.5 w-1.5 rounded-full bg-impact-low" /> Low
          </span>
          <button
            type="button"
            onClick={() => {
              setCursor(startOfMonth(today));
              onSelect?.(today);
            }}
            className="rounded border border-line-strong px-2.5 py-1 text-2xs font-semibold text-ink transition-colors duration-150 hover:border-brand"
          >
            Today
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Trigger button + popover. This is the control in the calendar page header. */
export default function DatePicker({
  value,
  onChange,
  currencies,
  mode = 'day',
  label,
  className = '',
  align = 'right',
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  useDismiss(containerRef, open, () => setOpen(false));

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`flex w-full items-center justify-between gap-3 rounded border bg-surface px-4 py-2 text-base font-semibold text-ink transition-colors duration-150 ${
          open ? 'border-brand' : 'border-line hover:border-line-strong'
        }`}
      >
        <span className="truncate">{label ?? formatMedium(value)}</span>
        <CalendarDays size={15} className="shrink-0 text-ink-3" />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Choose a date"
          className={`absolute z-50 mt-2 rounded-xl border border-line bg-surface shadow-panel ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          <CalendarPanel
            value={value}
            currencies={currencies}
            mode={mode}
            onSelect={(iso) => {
              onChange?.(iso);
              setOpen(false);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
