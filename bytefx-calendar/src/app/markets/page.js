'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import { Card, CardHeader } from '@/components/ui/Card';
import { Segmented } from '@/components/ui/Controls';
import { CurrencyFlag, Delta, ImpactDots } from '@/components/ui/Indicators';
import {
  clientSentiment,
  eventsAffectingMarkets,
  instruments,
  marketTabs,
  sessions,
  topMovers,
} from '@/data/markets';

/** Small inline sparkline; deterministic so server and client markup match. */
function Sparkline({ trend }) {
  const points =
    trend === 'up'
      ? [14, 12, 13, 10, 11, 8, 9, 6, 4, 5, 3]
      : [3, 5, 4, 6, 5, 8, 7, 10, 9, 12, 13];
  const path = points
    .map((y, i) => `${(i / (points.length - 1)) * 72},${y}`)
    .join(' L ');

  return (
    <svg viewBox="0 0 72 16" className="h-4 w-[72px]" role="img" aria-label={`7-day trend ${trend}`}>
      <path
        d={`M ${path}`}
        fill="none"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={trend === 'up' ? 'stroke-accent' : 'stroke-impact-high'}
      />
    </svg>
  );
}

export default function MarketsPage() {
  const [tab, setTab] = useState('Forex');
  const [query, setQuery] = useState('');

  const rows = useMemo(
    () =>
      instruments[tab].filter((row) =>
        row.symbol.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [tab, query],
  );

  return (
    <>
      <PageHero
        title="Markets"
        description="Live pricing across forex, indices, commodities and crypto. Spreads shown are typical during peak liquidity."
        aside={
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {sessions.map((session) => (
              <li
                key={session.name}
                className="rounded border border-line bg-surface px-3 py-2 text-center"
              >
                <p className="text-xs text-ink-3">{session.name}</p>
                <p className="mt-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-ink">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      session.open ? 'bg-accent' : 'bg-impact-off'
                    }`}
                  />
                  {session.open ? 'Open' : 'Closed'}
                </p>
              </li>
            ))}
          </ul>
        }
      />

      <div className="mx-auto grid max-w-shell grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:px-8 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <Segmented
              options={marketTabs.map((t) => ({ value: t, label: t }))}
              value={tab}
              onChange={setTab}
              size="sm"
            />
            <div className="relative">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
              />
              <input
                aria-label="Search instruments"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search instruments"
                className="w-full rounded border border-line bg-subtle py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-3 sm:w-56"
              />
            </div>
          </div>

          <div className="thin-scroll overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="text-xs font-medium text-ink-3">
                  <th scope="col" className="border-b border-line px-5 py-3 font-medium">
                    Instrument
                  </th>
                  <th scope="col" className="border-b border-line px-3 py-3 text-right font-medium">
                    Bid
                  </th>
                  <th scope="col" className="border-b border-line px-3 py-3 text-right font-medium">
                    Ask
                  </th>
                  <th scope="col" className="border-b border-line px-3 py-3 text-right font-medium">
                    Spread
                  </th>
                  <th scope="col" className="border-b border-line px-3 py-3 text-right font-medium">
                    Change
                  </th>
                  <th scope="col" className="border-b border-line px-3 py-3 font-medium">
                    Day range
                  </th>
                  <th scope="col" className="border-b border-line px-5 py-3 text-right font-medium">
                    7-day trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.symbol} className="transition-colors duration-150 hover:bg-subtle">
                    <td className="border-b border-line px-5 py-3">
                      <span className="flex items-center gap-2.5">
                        <CurrencyFlag code={row.currency} showCode={false} />
                        <span className="text-base font-medium text-ink">{row.symbol}</span>
                      </span>
                    </td>
                    <td className="tabular border-b border-line px-3 py-3 text-right text-base font-semibold">
                      <span className={row.trend === 'up' ? 'text-pos' : 'text-neg'}>{row.bid}</span>
                    </td>
                    <td className="tabular border-b border-line px-3 py-3 text-right text-base font-semibold text-ink">
                      {row.ask}
                    </td>
                    <td className="tabular border-b border-line px-3 py-3 text-right text-base text-ink-2">
                      {row.spread}
                    </td>
                    <td className="tabular border-b border-line px-3 py-3 text-right text-base font-semibold">
                      <Delta value={row.change} />
                    </td>
                    <td className="border-b border-line px-3 py-3">
                      <span className="flex items-center gap-2">
                        <span className="tabular text-2xs text-ink-3">{row.low}</span>
                        <span className="relative h-0.5 w-24 rounded-full bg-line-strong">
                          <span
                            className="absolute top-1/2 h-2.5 w-0.5 -translate-y-1/2 rounded-full bg-ink"
                            style={{ left: `${row.position}%` }}
                          />
                        </span>
                        <span className="tabular text-2xs text-ink-3">{row.high}</span>
                      </span>
                    </td>
                    <td className="border-b border-line px-5 py-3 text-right">
                      <span className="flex justify-end">
                        <Sparkline trend={row.trend} />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-3 text-sm text-ink-3">
            <span>
              Showing {rows.length} of {instruments[tab].length} {tab.toLowerCase()} instruments
            </span>
            <Link href="/" className="font-medium text-brand-soft hover:underline">
              Open economic calendar
            </Link>
          </div>
        </Card>

        <aside className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Top movers" />
            <ul className="px-5 py-2">
              {topMovers.map((mover) => (
                <li
                  key={mover.symbol}
                  className="flex items-center justify-between border-b border-line py-2.5 last:border-0"
                >
                  <span className="flex items-center gap-2.5">
                    <CurrencyFlag code={mover.currency} showCode={false} />
                    <span className="text-base font-medium text-ink">{mover.symbol}</span>
                  </span>
                  <Delta value={mover.change} className="tabular text-base font-semibold" />
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Client sentiment" action="Long / short" />
            <ul className="px-5 py-4">
              {clientSentiment.map((row) => (
                <li key={row.symbol} className="py-2">
                  <p className="flex items-center justify-between text-base">
                    <span className="font-medium text-ink">{row.symbol}</span>
                    <span className="tabular font-semibold text-ink">
                      {row.long}% / {100 - row.long}%
                    </span>
                  </p>
                  <span className="mt-1.5 flex h-2 overflow-hidden rounded-full bg-subtle">
                    <span className="bg-accent" style={{ width: `${row.long}%` }} />
                    <span className="bg-impact-high" style={{ width: `${100 - row.long}%` }} />
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Events affecting these markets" />
            <ul className="px-5 py-2">
              {eventsAffectingMarkets.map((event) => (
                <li key={event.title} className="border-b border-line py-3 last:border-0">
                  <p className="flex items-center gap-2 text-base font-medium text-ink">
                    <CurrencyFlag code={event.currency} showCode={false} />
                    {event.title}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-ink-3">
                    <span>{event.currency}</span>
                    <ImpactDots level={event.impact} />
                    <span className="tabular">{event.time}</span>
                  </p>
                </li>
              ))}
            </ul>
            <div className="px-5 pb-4">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-soft hover:underline"
              >
                Open economic calendar
                <ArrowRight size={13} />
              </Link>
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}
