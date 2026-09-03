'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Segmented } from '@/components/ui/Controls';

const RANGES = [
  { value: '1Y', label: '1Y', count: 6 },
  { value: '2Y', label: '2Y', count: 12 },
  { value: '5Y', label: '5Y', count: 18 },
];

/**
 * Plain SVG-free column chart — divs and CSS heights only, so it stays crisp in
 * both themes and maps one-to-one onto a Figma frame.
 */
export default function HistoricalTrend({ history, unit = '' }) {
  const [range, setRange] = useState('2Y');
  const count = RANGES.find((option) => option.value === range)?.count ?? history.length;

  const data = useMemo(() => history.slice(-count), [history, count]);

  const { min, max, ticks, zero } = useMemo(() => {
    if (data.length === 0) return { min: 0, max: 1, ticks: [0, 1], zero: 0 };
    const values = data.flatMap((point) => [point.actual, point.forecast]);
    const rawMax = Math.max(...values);
    const rawMin = Math.min(...values, 0);
    const padded = rawMax + (rawMax - rawMin) * 0.12 || 1;
    const floor = rawMin < 0 ? rawMin - Math.abs(rawMin) * 0.12 : 0;
    const span = padded - floor || 1;
    const tickList = [0, 1, 2, 3, 4].map((i) => floor + (span / 4) * i);
    return { min: floor, max: padded, ticks: tickList, zero: (-floor / span) * 100 };
  }, [data]);

  const span = max - min || 1;
  const heightOf = (value) => Math.max(1.5, ((value - min) / span) * 100);

  const beats = data.filter((point) => point.result === 'beat').length;

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader title="Historical trend" />
        <p className="px-5 py-10 text-center text-base text-ink-3">
          This event has no numeric series to chart.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        title="Historical trend"
        action={<Segmented options={RANGES} value={range} onChange={setRange} size="sm" />}
      />

      <div className="px-5 pb-5 pt-4">
        <ul className="mb-4 flex flex-wrap items-center gap-4 text-xs text-ink-2">
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-accent" /> Beat
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-impact-high" /> Miss
          </li>
          <li className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 border-t border-dashed border-line-strong" /> Forecast
          </li>
          <li className="ml-auto tabular text-ink-3">
            {beats}/{data.length} beat consensus
          </li>
        </ul>

        <div className="flex gap-3">
          <ul className="tabular flex w-12 shrink-0 flex-col justify-between py-1 text-right text-2xs text-ink-3">
            {[...ticks].reverse().map((tick, index) => (
              <li key={index}>
                {tick.toFixed(Math.abs(tick) < 10 ? 1 : 0)}
                {unit}
              </li>
            ))}
          </ul>

          <div className="min-w-0 flex-1">
            <div className="relative flex h-52 items-end gap-1.5 border-b border-l border-line pl-2">
              {zero > 1 && zero < 99 ? (
                <span
                  aria-hidden="true"
                  className="absolute left-0 right-0 border-t border-line-strong"
                  style={{ bottom: `${zero}%` }}
                />
              ) : null}

              {data.map((point) => (
                <div
                  key={point.date}
                  className="group relative flex h-full flex-1 items-end"
                  title={`${point.label} · actual ${point.actualText} vs forecast ${point.forecastText}`}
                >
                  <div
                    className={`w-full rounded-t-sm transition-opacity duration-150 group-hover:opacity-75 ${
                      point.result === 'beat' ? 'bg-accent' : 'bg-impact-high'
                    }`}
                    style={{ height: `${heightOf(point.actual)}%` }}
                  />
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 border-t border-dashed border-line-strong"
                    style={{ bottom: `${heightOf(point.forecast)}%` }}
                  />
                </div>
              ))}
            </div>

            <div className="mt-2 flex gap-1.5 pl-2">
              {data.map((point, index) => (
                <span
                  key={point.date}
                  className="flex-1 truncate text-center text-2xs text-ink-3"
                  aria-hidden={index % 2 === 1}
                >
                  {index % 2 === 0 ? point.label : ''}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
