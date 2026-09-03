'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader } from '@/components/ui/Card';
import { Segmented } from '@/components/ui/Controls';
import { CurrencyFlag, Delta, ImpactDots } from '@/components/ui/Indicators';
import { affectedMarkets, centralBanks, upcomingReleases } from '@/data/marketIntelligence';

const marketTabs = [
  { value: 'Forex', label: 'Forex' },
  { value: 'Indices', label: 'Indices' },
  { value: 'Commodities', label: 'Commodities' },
];

export function TopMarketsCard() {
  const [tab, setTab] = useState('Forex');

  return (
    <Card>
      <CardHeader title="Top markets affected" />
      <div className="px-5 pt-4">
        <Segmented options={marketTabs} value={tab} onChange={setTab} size="sm" />
      </div>
      <ul className="px-5 py-2">
        {affectedMarkets[tab].map((row) => (
          <li
            key={row.symbol}
            className="flex items-center justify-between border-b border-line py-2.5 last:border-0"
          >
            <span className="text-base font-medium text-ink">{row.symbol}</span>
            <span className="flex items-center gap-3">
              <span className="tabular text-base font-semibold text-ink">{row.price}</span>
              <Delta value={row.change} className="tabular w-16 text-right text-sm font-semibold" />
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function CentralBankCard() {
  return (
    <Card>
      <CardHeader title="Central bank watch" />
      <ul className="px-5 py-4">
        {centralBanks.map((bank) => (
          <li key={bank.name} className="border-l-2 border-brand pl-3 py-2">
            <p className="text-base font-semibold text-ink">{bank.name}</p>
            <p className="mt-0.5 text-sm text-ink-2">{bank.meeting}</p>
            <p className="mt-1 flex gap-3 text-sm text-ink-2">
              {bank.pricing.map((item) => (
                <span key={item.label}>
                  {item.label} <span className="font-semibold text-ink">{item.value}</span>
                </span>
              ))}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function UpcomingReleasesCard() {
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
        {upcomingReleases.map((release) => (
          <li
            key={release.id}
            className="flex items-start gap-3 border-b border-line py-3 last:border-0"
          >
            <span className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded border border-line bg-subtle">
              <span className="text-2xs font-medium uppercase text-ink-3">{release.month}</span>
              <span className="tabular text-base font-semibold leading-none text-ink">
                {release.day}
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-medium text-ink">{release.title}</span>
              <span className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-3">
                <CurrencyFlag code={release.currency} />
                <ImpactDots level={release.impact} />
                <span className="tabular">{release.time}</span>
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
