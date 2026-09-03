'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import { Card, CardHeader } from '@/components/ui/Card';
import { CurrencyFlag, ImpactDots } from '@/components/ui/Indicators';
import {
  categoryFocus,
  impactHeatmap,
  keyEventsTimeline,
  watchedCurrencies,
  weekDays,
  weekRange,
  weekThemes,
} from '@/data/weekly';

/* Heat scale runs green (quiet) → amber → red (busy). */
function heatColor(score) {
  if (score >= 4) return 'bg-impact-high';
  if (score >= 3) return 'bg-[#EE6B23]';
  if (score >= 2) return 'bg-impact-medium';
  if (score >= 1) return 'bg-[#7FA80B]';
  return 'bg-[#2F8A08]';
}

const TAG_TONE = {
  High: 'border-impact-high/30 bg-impact-high/10 text-neg',
  Medium: 'border-impact-medium/30 bg-impact-medium/10 text-[#B0730A] dark:text-impact-medium',
  Speech: 'border-line bg-subtle text-ink-2',
};

const THEME_DOT = {
  high: 'bg-impact-high',
  medium: 'bg-impact-medium',
  low: 'bg-impact-low',
  brand: 'bg-brand',
};

export default function WeeklyPage() {
  const [activeDay, setActiveDay] = useState('wed');

  return (
    <>
      <PageHero
        title="Weekly overview"
        description="Your week ahead at a glance. Track the most important economic events, central bank decisions and market-moving releases."
      >
        <div className="mt-5 inline-flex items-center gap-3 rounded border border-line bg-surface px-4 py-2">
          <span className="text-base font-semibold text-ink">{weekRange}</span>
          <span className="text-sm text-ink-3">UTC +00:00</span>
        </div>
      </PageHero>

      <div className="mx-auto max-w-shell px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-stretch gap-3">
          <button
            type="button"
            aria-label="Previous week"
            className="flex w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-ink-2 transition-colors duration-150 hover:border-brand hover:text-ink"
          >
            <ChevronLeft size={16} />
          </button>

          <ul className="thin-scroll flex flex-1 gap-3 overflow-x-auto">
            {weekDays.map((day) => {
              const active = day.id === activeDay;
              return (
                <li key={day.id} className="min-w-[132px] flex-1">
                  <button
                    type="button"
                    onClick={() => setActiveDay(day.id)}
                    aria-pressed={active}
                    className={`w-full rounded-xl border bg-surface px-4 py-4 text-center transition-colors duration-150 ${
                      active ? 'border-accent' : 'border-line hover:border-line-strong'
                    }`}
                  >
                    <p className="text-base font-semibold text-ink">{day.name}</p>
                    <p className="text-sm text-ink-3">{day.date}</p>
                    <p className="mt-2 text-base font-semibold text-ink">{day.events} events</p>
                    <span className="mt-2 flex justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`h-1.5 w-1.5 rounded-full ${
                            i < day.intensity[0]
                              ? 'bg-impact-high'
                              : i < day.intensity[0] + day.intensity[1]
                                ? 'bg-impact-medium'
                                : i < day.intensity[0] + day.intensity[1] + day.intensity[2]
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

          <button
            type="button"
            aria-label="Next week"
            className="flex w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-surface text-ink-2 transition-colors duration-150 hover:border-brand hover:text-ink"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_300px]">
          <Card>
            <CardHeader title="Market impact heatmap" />
            <div className="thin-scroll overflow-x-auto px-5 py-4">
              <table className="w-full min-w-[380px] border-separate border-spacing-1 text-left">
                <thead>
                  <tr className="text-xs text-ink-3">
                    <th scope="col" className="font-medium">
                      Currency
                    </th>
                    {impactHeatmap.columns.map((col) => (
                      <th key={col} scope="col" className="text-center font-medium">
                        {col}
                      </th>
                    ))}
                    <th scope="col" className="text-right font-medium">
                      Overall
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {impactHeatmap.rows.map((row) => (
                    <tr key={row.currency}>
                      <th scope="row" className="pr-2 text-left">
                        <CurrencyFlag code={row.currency} />
                      </th>
                      {row.scores.map((score, i) => (
                        <td key={i} className="p-0">
                          <span
                            title={`${row.currency} · ${impactHeatmap.columns[i]} — impact score ${score.toFixed(1)} / 5`}
                            className={`block h-7 w-full rounded-sm ${heatColor(score)}`}
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
              <p className="mt-4 flex flex-wrap items-center gap-4 text-xs text-ink-3">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-[#2F8A08]" /> Low
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-impact-medium" /> Medium
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-impact-high" /> High
                </span>
                <span className="ml-auto">Hover a cell for the score</span>
              </p>
            </div>
          </Card>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader
                title="Economic focus by category"
                action={
                  <Link href="/" className="font-medium text-brand-soft hover:underline">
                    All categories
                  </Link>
                }
              />
              <ul className="grid grid-cols-2 gap-3 px-5 py-4 sm:grid-cols-5">
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
              <CardHeader title="Key events timeline" action="All times in (UTC+00:00)" />
              <div className="thin-scroll flex gap-3 overflow-x-auto px-5 py-4">
                {keyEventsTimeline.map((day) => (
                  <div
                    key={day.day}
                    className={`min-w-[168px] flex-1 rounded-lg border px-3 py-3 ${
                      day.active ? 'border-accent bg-subtle' : 'border-line'
                    }`}
                  >
                    <p className="text-sm font-semibold text-ink">{day.day}</p>
                    <ul className="mt-3 flex flex-col gap-3">
                      {day.events.map((event) => (
                        <li key={event.title} className="rounded border border-line bg-surface p-2.5">
                          <p className="flex items-center gap-2 text-xs text-ink-3">
                            <span className="tabular font-semibold text-ink">{event.time}</span>
                            <CurrencyFlag code={event.currency} />
                          </p>
                          <p className="mt-1 text-sm font-medium leading-snug text-ink">
                            {event.title}
                          </p>
                          <span
                            className={`mt-2 inline-block rounded border px-1.5 py-0.5 text-2xs font-semibold ${
                              TAG_TONE[event.tag] ?? TAG_TONE.Speech
                            }`}
                          >
                            {event.tag}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader title="This week's key themes" />
              <ul className="flex flex-col gap-4 px-5 py-4">
                {weekThemes.map((theme) => (
                  <li key={theme.title} className="flex gap-2.5">
                    <span
                      aria-hidden="true"
                      className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${THEME_DOT[theme.tone]}`}
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
              <CardHeader title="Most watched currencies" action="High-impact events" />
              <ul className="px-5 py-4">
                {watchedCurrencies.map((row) => (
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
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
