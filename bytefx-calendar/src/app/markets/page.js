'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpDown, Pause, Play, Star } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import { Card, CardHeader } from '@/components/ui/Card';
import { SearchInput, Segmented, Toggle } from '@/components/ui/Controls';
import { CurrencyFlag, Delta, ImpactDots } from '@/components/ui/Indicators';
import Flag from '@/components/ui/Flag';
import {
  clientSentiment,
  instrumentDrivers,
  instruments,
  marketTabs,
  sessions,
} from '@/data/markets';
import { timezoneById } from '@/data/countries';
import { getEventsInRange } from '@/lib/calendarEngine';
import { addDays, formatShort, shiftTime, todayISO } from '@/lib/datetime';
import { sessionState, useLivePrices } from '@/lib/priceFeed';
import { useAppState } from '@/lib/store';
import { useNow, useStableNow } from '@/lib/useNow';

/** Small inline sparkline, shaped by the instrument's own recent direction. */
function Sparkline({ trend, seed }) {
  const points = useMemo(() => {
    const values = [];
    let value = 8;
    for (let i = 0; i < 12; i += 1) {
      const wobble = ((seed.charCodeAt(i % seed.length) % 7) - 3) * 0.6;
      value += wobble + (trend === 'up' ? -0.55 : 0.55);
      values.push(Math.max(1.5, Math.min(14.5, value)));
    }
    return values;
  }, [trend, seed]);

  const path = points.map((y, i) => `${(i / (points.length - 1)) * 72},${y.toFixed(2)}`).join(' L ');

  return (
    <svg viewBox="0 0 72 16" className="h-4 w-[72px]" role="img" aria-label={`Recent trend ${trend}`}>
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

const SORTS = [
  { value: 'default', label: 'Default' },
  { value: 'gainers', label: 'Top gainers' },
  { value: 'losers', label: 'Top losers' },
  { value: 'symbol', label: 'A–Z' },
];

export default function MarketsPage() {
  const { saved, toggleSaved, toast, preferences } = useAppState();
  const [tab, setTab] = useState('Forex');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('default');
  const [live, setLive] = useState(true);

  const snapshot = useStableNow();
  const now = useNow(60000);
  const today = todayISO();
  const zone = timezoneById(preferences.timezone);

  const tabInstruments = useMemo(() => instruments[tab], [tab]);
  const quotes = useLivePrices(tabInstruments, live);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = quotes.filter(
      (row) =>
        row.symbol.toLowerCase().includes(needle) || row.name.toLowerCase().includes(needle),
    );

    if (sort === 'gainers') return [...filtered].sort((a, b) => b.change / b.prevClose - a.change / a.prevClose);
    if (sort === 'losers') return [...filtered].sort((a, b) => a.change / a.prevClose - b.change / b.prevClose);
    if (sort === 'symbol') return [...filtered].sort((a, b) => a.symbol.localeCompare(b.symbol));
    return filtered;
  }, [quotes, query, sort]);

  const movers = useMemo(
    () =>
      [...quotes]
        .sort((a, b) => Math.abs(b.change / b.prevClose) - Math.abs(a.change / a.prevClose))
        .slice(0, 6),
    [quotes],
  );

  const openSessions = useMemo(
    () => sessionState(sessions, new Date(now).getUTCHours()),
    [now],
  );

  /* Releases in the next three days that move the instruments on this tab. */
  const drivingEvents = useMemo(() => {
    const codes = new Set(
      tabInstruments.flatMap((instrument) => instrumentDrivers[instrument.symbol] ?? [instrument.currency]),
    );
    return getEventsInRange(today, addDays(today, 4), snapshot)
      .filter((event) => codes.has(event.currency) && event.impact !== 'low')
      .slice(0, 6);
  }, [tabInstruments, snapshot, today]);

  return (
    <>
      <PageHero
        title="Markets"
        description="Live pricing across forex, indices, commodities and crypto. Spreads shown are typical during peak liquidity."
        aside={
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {openSessions.map((session) => (
                <li
                  key={session.name}
                  className="rounded border border-line bg-surface px-3 py-2 text-center"
                >
                  <p className="text-xs text-ink-3">{session.name}</p>
                  <p className="mt-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-ink">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${session.open ? 'bg-accent' : 'bg-impact-off'}`}
                    />
                    {session.open ? 'Open' : 'Closed'}
                  </p>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 rounded border border-line bg-surface px-3 py-1.5">
              <span className="text-sm text-ink-2">Live feed</span>
              <Toggle checked={live} onChange={setLive} size="sm" srLabel="Live feed" />
              {live ? <Pause size={13} className="text-ink-3" /> : <Play size={13} className="text-ink-3" />}
            </div>
          </div>
        }
      />

      <div className="mx-auto grid max-w-shell grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:px-8 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <Segmented
              options={marketTabs.map((item) => ({ value: item, label: item }))}
              value={tab}
              onChange={setTab}
              size="sm"
            />
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1.5 text-sm text-ink-3">
                <ArrowUpDown size={13} />
                <select
                  value={sort}
                  onChange={(event) => setSort(event.target.value)}
                  aria-label="Sort instruments"
                  className="cursor-pointer rounded border border-line bg-subtle px-2 py-1.5 text-sm font-medium text-ink hover:border-line-strong"
                >
                  {SORTS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Search instruments"
                className="w-full sm:w-56"
              />
            </div>
          </div>

          <div className="thin-scroll overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
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
                  <th scope="col" className="border-b border-line px-3 py-3 text-right font-medium">
                    Trend
                  </th>
                  <th scope="col" className="relative border-b border-line px-5 py-3">
                    <span className="sr-only">Watchlist</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const watched = saved.includes(`market:${row.symbol}`);
                  return (
                    <tr key={row.symbol} className="transition-colors duration-150 hover:bg-subtle">
                      <td className="border-b border-line px-5 py-3">
                        <span className="flex items-center gap-2.5">
                          <Flag code={row.currency} size="sm" />
                          <span className="min-w-0">
                            <span className="block text-base font-medium text-ink">{row.symbol}</span>
                            <span className="block truncate text-2xs text-ink-3">{row.name}</span>
                          </span>
                        </span>
                      </td>
                      <td
                        className={`tabular border-b border-line px-3 py-3 text-right text-base font-semibold transition-colors duration-300 ${
                          row.tickDirection === 'up'
                            ? 'text-pos'
                            : row.tickDirection === 'down'
                              ? 'text-neg'
                              : 'text-ink'
                        }`}
                      >
                        {row.bid}
                      </td>
                      <td className="tabular border-b border-line px-3 py-3 text-right text-base font-semibold text-ink">
                        {row.ask}
                      </td>
                      <td className="tabular border-b border-line px-3 py-3 text-right text-base text-ink-2">
                        {row.spread}
                      </td>
                      <td className="tabular border-b border-line px-3 py-3 text-right text-base font-semibold">
                        <Delta value={row.changeText} />
                      </td>
                      <td className="border-b border-line px-3 py-3">
                        <span className="flex items-center gap-2">
                          <span className="tabular text-2xs text-ink-3">{row.lowText}</span>
                          <span className="relative h-0.5 w-24 rounded-full bg-line-strong">
                            <span
                              className="absolute top-1/2 h-2.5 w-0.5 -translate-y-1/2 rounded-full bg-ink transition-all duration-500"
                              style={{ left: `${row.position}%` }}
                            />
                          </span>
                          <span className="tabular text-2xs text-ink-3">{row.highText}</span>
                        </span>
                      </td>
                      <td className="border-b border-line px-3 py-3 text-right">
                        <span className="flex justify-end">
                          <Sparkline trend={row.trend} seed={row.symbol} />
                        </span>
                      </td>
                      <td className="border-b border-line px-5 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            const added = toggleSaved(`market:${row.symbol}`);
                            toast(
                              added ? `${row.symbol} added to your watchlist` : `${row.symbol} removed`,
                              added ? 'success' : 'info',
                            );
                          }}
                          aria-pressed={watched}
                          aria-label={watched ? `Unwatch ${row.symbol}` : `Watch ${row.symbol}`}
                          className={`transition-colors duration-150 ${
                            watched ? 'text-impact-medium' : 'text-ink-3 hover:text-ink'
                          }`}
                        >
                          <Star size={14} fill={watched ? 'currentColor' : 'none'} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-5 py-3 text-sm text-ink-3">
            <span>
              Showing {rows.length} of {tabInstruments.length} {tab.toLowerCase()} instruments
              {live ? ' · streaming' : ' · paused'}
            </span>
            <Link href="/" className="font-medium text-brand-soft hover:underline">
              Open economic calendar
            </Link>
          </div>
        </Card>

        <aside className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Top movers" action={tab} />
            <ul className="px-5 py-2">
              {movers.map((mover) => (
                <li
                  key={mover.symbol}
                  className="flex items-center justify-between border-b border-line py-2.5 last:border-0"
                >
                  <span className="flex items-center gap-2.5">
                    <Flag code={mover.currency} size="xs" />
                    <span className="text-base font-medium text-ink">{mover.symbol}</span>
                  </span>
                  <Delta value={mover.changeText} className="tabular text-base font-semibold" />
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
              {drivingEvents.map((event) => {
                const local = shiftTime(event.date, event.time, zone.offset);
                return (
                  <li key={event.key} className="border-b border-line py-3 last:border-0">
                    <Link
                      href={`/events/${event.key}`}
                      className="flex items-center gap-2 text-base font-medium text-ink hover:text-brand-soft hover:underline"
                    >
                      <CurrencyFlag code={event.currency} showCode={false} />
                      <span className="truncate">{event.title}</span>
                    </Link>
                    <p className="mt-1 flex items-center gap-2 text-sm text-ink-3">
                      <span>{event.currency}</span>
                      <ImpactDots level={event.impact} />
                      <span className="tabular">
                        {formatShort(local.date)} {local.time}
                      </span>
                    </p>
                  </li>
                );
              })}
              {drivingEvents.length === 0 ? (
                <li className="py-6 text-center text-sm text-ink-3">
                  No major releases in the next few days.
                </li>
              ) : null}
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
