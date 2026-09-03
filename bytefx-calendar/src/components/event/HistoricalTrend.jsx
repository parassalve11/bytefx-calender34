'use client';

import { useState } from 'react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Segmented } from '@/components/ui/Controls';

const ranges = [
  { value: '1Y', label: '1Y', count: 6 },
  { value: '2Y', label: '2Y', count: 14 },
  { value: '5Y', label: '5Y', count: 14 },
];

/**
 * Plain SVG column chart — no chart library, so the markup stays predictable
 * and translates cleanly into Figma.
 */
export default function HistoricalTrend({ history, unit = 'K' }) {
  const [range, setRange] = useState('2Y');
  const count = ranges.find((r) => r.value === range)?.count ?? history.length;
  const data = history.slice(-count);

  const peak = Math.max(...data.map((d) => Math.max(d.actual, d.forecast)));
  const step = Math.ceil((peak * 1.15) / 4 / 50) * 50;
  const max = step * 4;
  const ticks = [0, 1, 2, 3, 4].map((i) => step * i);

  return (
    <Card>
      <CardHeader
        title="Historical trend"
        action={<Segmented options={ranges} value={range} onChange={setRange} size="sm" />}
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
        </ul>

        <div className="flex gap-3">
          <ul className="tabular flex w-10 shrink-0 flex-col justify-between py-1 text-right text-2xs text-ink-3">
            {[...ticks].reverse().map((tick) => (
              <li key={tick}>
                {tick}
                {unit}
              </li>
            ))}
          </ul>

          <div className="min-w-0 flex-1">
            <div className="flex h-52 items-end gap-1.5 border-b border-l border-line pl-2">
              {data.map((point) => {
                const height = (point.actual / max) * 100;
                const forecastHeight = (point.forecast / max) * 100;
                return (
                  <div
                    key={point.label}
                    className="group relative flex h-full flex-1 items-end"
                    title={`${point.label}: ${point.actual}${unit} actual vs ${point.forecast}${unit} forecast`}
                  >
                    <div
                      className={`w-full rounded-t-sm transition-opacity duration-150 group-hover:opacity-80 ${
                        point.result === 'beat' ? 'bg-accent' : 'bg-impact-high'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                    <span
                      aria-hidden="true"
                      className="absolute left-0 right-0 border-t border-dashed border-line-strong"
                      style={{ bottom: `${forecastHeight}%` }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-2 flex gap-1.5 pl-2">
              {data.map((point, index) => (
                <span
                  key={point.label}
                  className="flex-1 text-center text-2xs text-ink-3"
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
