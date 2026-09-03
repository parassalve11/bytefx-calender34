'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Bell, TrendingDown, TrendingUp } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Segmented } from '@/components/ui/Controls';
import { CurrencyFlag, Delta, ImpactDots } from '@/components/ui/Indicators';
import Flag from '@/components/ui/Flag';
import { instruments } from '@/data/markets';
import { catalogById } from '@/data/eventCatalog';
import { countryByCode } from '@/data/countries';
import { getEventsInRange, occurrencesInRange } from '@/lib/calendarEngine';
import { MONTHS_SHORT, addMonths, formatShort, fromISODate, relativeDayLabel, shiftTime, todayISO } from '@/lib/datetime';
import { intFor } from '@/lib/seed';
import { useLivePrices } from '@/lib/priceFeed';
import { useStableNow } from '@/lib/useNow';

const marketTabs = [
  { value: 'Forex', label: 'Forex' },
  { value: 'Indices', label: 'Indices' },
  { value: 'Commodities', label: 'Metals' },
];

export function TopMarketsCard() {
  const [tab, setTab] = useState('Forex');
  const rows = useMemo(() => instruments[tab].slice(0, 6), [tab]);
  const quotes = useLivePrices(rows);

  return (
    <Card>
      <CardHeader
        title="Top markets affected"
        action={
          <span className="flex items-center gap-1.5 text-2xs text-ink-3">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Live
          </span>
        }
      />
      <div className="px-5 pt-4">
        <Segmented options={marketTabs} value={tab} onChange={setTab} size="sm" />
      </div>
      <ul className="px-5 py-2">
        {quotes.map((row) => (
          <li
            key={row.symbol}
            className="flex items-center justify-between border-b border-line py-2.5 last:border-0"
          >
            <span className="flex items-center gap-2">
              <Flag code={row.currency} size="xs" />
              <span className="text-base font-medium text-ink">{row.symbol}</span>
            </span>
            <span className="flex items-center gap-3">
              <span
                className={`tabular text-base font-semibold transition-colors duration-300 ${
                  row.tickDirection === 'up'
                    ? 'text-pos'
                    : row.tickDirection === 'down'
                      ? 'text-neg'
                      : 'text-ink'
                }`}
              >
                {row.priceText}
              </span>
              <Delta value={row.changeText} className="tabular w-16 text-right text-sm font-semibold" />
            </span>
          </li>
        ))}
      </ul>
      <div className="px-5 pb-4">
        <Link
          href="/markets"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-soft hover:underline"
        >
          All markets
          <ArrowRight size={13} />
        </Link>
      </div>
    </Card>
  );
}

const POLICY_SERIES = [
  { id: 'us-fed-rate-decision', code: 'USD' },
  { id: 'eu-ecb-rate-decision', code: 'EUR' },
  { id: 'gb-boe-rate-decision', code: 'GBP' },
  { id: 'jp-boj-policy-rate', code: 'JPY' },
  { id: 'au-rba-rate-decision', code: 'AUD' },
  { id: 'ca-boc-rate-decision', code: 'CAD' },
];

/** Next policy meeting per central bank, with market-implied pricing. */
export function CentralBankCard({ date }) {
  const banks = useMemo(
    () =>
      POLICY_SERIES.map(({ id, code }) => {
        const entry = catalogById[id];
        const country = countryByCode[code];
        const next = occurrencesInRange(entry, date, addMonths(date, 8))[0];
        const hold = intFor(`${id}|${next}|hold`, 42, 92);
        const cut = intFor(`${id}|${next}|cut`, 4, 100 - hold);
        return {
          id,
          code,
          name: country.bank,
          short: country.bankShort,
          rate: country.rate,
          next,
          pricing: [
            { label: 'Hold', value: `${hold}%` },
            { label: 'Cut', value: `${cut}%` },
            { label: 'Hike', value: `${Math.max(0, 100 - hold - cut)}%` },
          ],
        };
      }),
    [date],
  );

  const today = todayISO();

  return (
    <Card>
      <CardHeader title="Central bank watch" action="Market-implied" />
      <ul className="px-5 py-4">
        {banks.map((bank) => (
          <li key={bank.id} className="border-l-2 border-brand py-2 pl-3">
            <p className="flex items-center gap-2 text-base font-semibold text-ink">
              <Flag code={bank.code} size="xs" />
              {bank.short}
              <span className="ml-auto tabular rounded border border-line bg-subtle px-1.5 py-0.5 text-2xs font-medium text-ink-2">
                {bank.rate}
              </span>
            </p>
            <p className="mt-0.5 text-sm text-ink-2">
              {bank.next ? `${formatShort(bank.next)} · ${relativeDayLabel(bank.next, today)}` : 'No meeting scheduled'}
            </p>
            <p className="mt-1 flex flex-wrap gap-x-3 text-sm text-ink-2">
              {bank.pricing.map((item) => (
                <span key={item.label}>
                  {item.label} <span className="tabular font-semibold text-ink">{item.value}</span>
                </span>
              ))}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** The next high-impact releases after the currently selected day. */
export function UpcomingReleasesCard({ date, currencies, offset = 0, onOpenReminder }) {
  const now = useStableNow();

  const releases = useMemo(() => {
    const allowed = currencies && currencies.length ? new Set(currencies) : null;
    return getEventsInRange(date, addMonths(date, 2), now)
      .filter((event) => event.impact === 'high' && (!allowed || allowed.has(event.currency)))
      .slice(0, 6);
  }, [date, currencies, now]);

  return (
    <Card>
      <CardHeader
        title="Upcoming high-impact releases"
        action={
          <Link href="/weekly" className="font-medium text-brand-soft hover:underline">
            Week
          </Link>
        }
      />
      <ul className="px-5 py-2">
        {releases.length === 0 ? (
          <li className="py-6 text-center text-sm text-ink-3">
            No high-impact releases for the selected countries.
          </li>
        ) : null}

        {releases.map((release) => {
          const local = shiftTime(release.date, release.time, offset);
          const day = fromISODate(local.date);
          return (
            <li
              key={release.key}
              className="flex items-start gap-3 border-b border-line py-3 last:border-0"
            >
              <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded border border-line bg-subtle">
                <span className="text-2xs font-medium uppercase text-ink-3">
                  {MONTHS_SHORT[day.getUTCMonth()]}
                </span>
                <span className="tabular text-base font-semibold leading-none text-ink">
                  {day.getUTCDate()}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base font-medium text-ink" title={release.title}>
                  {release.title}
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-3">
                  <CurrencyFlag code={release.currency} />
                  <ImpactDots level={release.impact} />
                  <span className="tabular">{local.time}</span>
                </span>
              </span>
              <button
                type="button"
                onClick={() => onOpenReminder?.(release)}
                aria-label={`Set reminder for ${release.title}`}
                title="Set reminder"
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded text-ink-3 transition-colors duration-150 hover:bg-subtle hover:text-ink"
              >
                <Bell size={14} />
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

/** A quick read on how the day's releases came in, country by country. */
export function DayScorecardCard({ events }) {
  const summary = useMemo(() => {
    const byCurrency = new Map();
    for (const event of events) {
      if (!event.surprise || event.surprise === 'inline') continue;
      const bucket = byCurrency.get(event.currency) ?? { beat: 0, miss: 0 };
      bucket[event.surprise] += 1;
      byCurrency.set(event.currency, bucket);
    }
    return [...byCurrency.entries()]
      .map(([currency, counts]) => ({ currency, ...counts, net: counts.beat - counts.miss }))
      .sort((a, b) => b.net - a.net || b.beat - a.beat)
      .slice(0, 6);
  }, [events]);

  if (summary.length === 0) return null;

  return (
    <Card>
      <CardHeader title="Data scorecard" action="Beats vs misses" />
      <ul className="px-5 py-3">
        {summary.map((row) => (
          <li key={row.currency} className="flex items-center gap-3 border-b border-line py-2.5 last:border-0">
            <CurrencyFlag code={row.currency} />
            <span className="flex flex-1 items-center gap-1">
              <span className="h-2 rounded-full bg-pos" style={{ width: `${row.beat * 14 + 6}px` }} />
              <span className="h-2 rounded-full bg-neg" style={{ width: `${row.miss * 14 + 6}px` }} />
            </span>
            <span
              className={`tabular flex items-center gap-1 text-sm font-semibold ${
                row.net > 0 ? 'text-pos' : row.net < 0 ? 'text-neg' : 'text-ink-2'
              }`}
            >
              {row.net > 0 ? <TrendingUp size={13} /> : row.net < 0 ? <TrendingDown size={13} /> : null}
              {row.beat}/{row.miss}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
