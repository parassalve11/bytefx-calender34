'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, MoreVertical, Plus, Search } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button, Checkbox, Segmented, Select } from '@/components/ui/Controls';
import { CurrencyFlag, Delta, ImpactDots } from '@/components/ui/Indicators';
import {
  alertQueue,
  alertStatusFilters,
  favouriteMarkets,
  notificationSettings,
  quickActions,
  savedEvents,
} from '@/data/alerts';
import { impactLevels } from '@/data/economicEvents';

export default function AlertsPage() {
  const [status, setStatus] = useState('Active');
  const [impact, setImpact] = useState(['high']);
  const [query, setQuery] = useState('');

  const rows = useMemo(
    () =>
      savedEvents.filter(
        (event) =>
          impact.includes(event.impact) &&
          event.title.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [impact, query],
  );

  function toggleImpact(level, checked) {
    setImpact((current) =>
      checked ? [...current, level] : current.filter((item) => item !== level),
    );
  }

  return (
    <>
      <PageHero
        title="Alerts & saved events"
        description="Create alerts for economic events and market-moving releases. Get notified before the events that matter most."
      />

      <div className="mx-auto grid max-w-shell grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8 xl:grid-cols-[260px_minmax(0,1fr)_300px]">
        <aside className="flex flex-col gap-6">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-md font-semibold text-ink">Filters</h2>
              <button
                type="button"
                onClick={() => {
                  setImpact(['high']);
                  setQuery('');
                  setStatus('Active');
                }}
                className="text-sm font-medium text-brand-soft hover:underline"
              >
                Reset
              </button>
            </div>

            <div className="mt-5">
              <label htmlFor="alert-search" className="mb-1.5 block text-xs font-medium text-ink-3">
                Search events
              </label>
              <div className="relative">
                <Search
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
                />
                <input
                  id="alert-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search events or keywords"
                  className="w-full rounded border border-line bg-subtle py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-3"
                />
              </div>
            </div>

            <fieldset className="mt-5">
              <legend className="mb-1 text-xs font-medium text-ink-3">Impact level</legend>
              {impactLevels.map((level) => (
                <Checkbox
                  key={level.value}
                  checked={impact.includes(level.value)}
                  onChange={(checked) => toggleImpact(level.value, checked)}
                  trailing={<ImpactDots level={level.value} />}
                >
                  {level.label} impact
                </Checkbox>
              ))}
            </fieldset>

            <Select
              id="alert-country"
              label="Countries"
              options={['All countries', 'United States', 'Euro area', 'United Kingdom', 'Japan']}
              value="All countries"
              onChange={() => {}}
              className="mt-5"
            />

            <div className="mt-5">
              <p className="mb-1.5 text-xs font-medium text-ink-3">Alert status</p>
              <Segmented
                options={alertStatusFilters.map((s) => ({ value: s, label: s }))}
                value={status}
                onChange={setStatus}
                size="sm"
                className="flex-wrap"
              />
            </div>

            <Button className="mt-6 w-full">Apply filters</Button>
          </Card>

          <Card>
            <CardHeader title="Quick actions" />
            <ul className="px-5 py-2">
              {quickActions.map((action) => (
                <li key={action}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 border-b border-line py-3 text-left text-base text-ink-2 transition-colors duration-150 last:border-0 hover:text-ink"
                  >
                    {action}
                    <ChevronRight size={14} className="text-ink-3" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </aside>

        <div className="min-w-0">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 className="text-xl font-semibold text-ink">Saved events ({savedEvents.length})</h2>
              <div className="flex items-center gap-2">
                <div className="relative hidden sm:block">
                  <Search
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
                  />
                  <input
                    aria-label="Search saved events"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search saved events"
                    className="w-56 rounded border border-line bg-subtle py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-3"
                  />
                </div>
                <Button className="px-3 py-2 text-sm">
                  <Plus size={14} />
                  Create alert
                </Button>
              </div>
            </div>

            <div className="thin-scroll overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead>
                  <tr className="text-xs font-medium text-ink-3">
                    <th scope="col" className="border-b border-line px-5 py-3 font-medium">
                      Event name
                    </th>
                    <th scope="col" className="border-b border-line px-2.5 py-3 font-medium">
                      Country
                    </th>
                    <th scope="col" className="border-b border-line px-2.5 py-3 font-medium">
                      Impact
                    </th>
                    <th scope="col" className="border-b border-line px-2.5 py-3 font-medium">
                      Next release
                    </th>
                    <th scope="col" className="border-b border-line px-2.5 py-3 font-medium">
                      Timing
                    </th>
                    <th scope="col" className="border-b border-line px-2.5 py-3 font-medium">
                      Channels
                    </th>
                    <th scope="col" className="border-b border-line px-2.5 py-3 font-medium">
                      Status
                    </th>
                    <th scope="col" className="relative border-b border-line px-5 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((event) => (
                    <tr key={event.id} className="transition-colors duration-150 hover:bg-subtle">
                      <td className="max-w-[220px] border-b border-line px-4 py-3">
                        <span className="block truncate text-base font-medium text-ink" title={event.title}>
                          {event.title}
                        </span>
                        <span className="text-xs text-ink-3">{event.period}</span>
                      </td>
                      <td className="border-b border-line px-2.5 py-3">
                        <CurrencyFlag code={event.currency} />
                      </td>
                      <td className="border-b border-line px-2.5 py-3">
                        <ImpactDots level={event.impact} />
                      </td>
                      <td className="border-b border-line px-2.5 py-3">
                        <span className="tabular block whitespace-nowrap text-sm text-ink">{event.release}</span>
                        <span className="text-xs font-medium text-brand-soft">{event.countdown}</span>
                      </td>
                      <td className="whitespace-nowrap border-b border-line px-2.5 py-3 text-sm text-ink-2">
                        {event.timing}
                      </td>
                      <td className="border-b border-line px-2.5 py-3">
                        <span className="flex gap-1.5">
                          {event.channels.map((channel) => (
                            <span
                              key={channel}
                              className="rounded border border-line bg-subtle px-2 py-0.5 text-2xs font-medium text-ink-2"
                            >
                              {channel}
                            </span>
                          ))}
                        </span>
                      </td>
                      <td className="border-b border-line px-2.5 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-2xs font-semibold ${
                            event.status === 'Active'
                              ? 'bg-accent text-accent-ink'
                              : 'border border-line bg-subtle text-ink-2'
                          }`}
                        >
                          {event.status}
                        </span>
                      </td>
                      <td className="border-b border-line px-5 py-3 text-right">
                        <button
                          type="button"
                          aria-label={`Actions for ${event.title}`}
                          className="text-ink-3 hover:text-ink"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {rows.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <p className="text-md font-semibold text-ink">No saved events match these filters</p>
                <p className="mt-1 text-base text-ink-2">
                  Clear the search or add another impact level to see your alerts.
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-3 text-sm text-ink-3">
                <span>
                  Showing {rows.length} of {savedEvents.length} events
                </span>
                <span className="flex items-center gap-1">
                  <button
                    type="button"
                    className="h-7 w-7 rounded bg-brand text-2xs font-semibold text-white"
                  >
                    1
                  </button>
                  <button
                    type="button"
                    className="h-7 w-7 rounded text-2xs font-semibold text-ink-2 hover:bg-subtle"
                  >
                    2
                  </button>
                </span>
              </div>
            )}
          </Card>
        </div>

        <aside className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Notification summary" />
            <ul className="px-5 py-2">
              {notificationSettings.map((setting) => (
                <li
                  key={setting.label}
                  className="flex items-center justify-between border-b border-line py-3 last:border-0"
                >
                  <span className="text-base text-ink-2">{setting.label}</span>
                  <span className="flex items-center gap-2 text-base font-medium text-ink">
                    {setting.value}
                    <span
                      className={`h-2 w-2 rounded-full ${setting.on ? 'bg-accent' : 'bg-impact-off'}`}
                    />
                  </span>
                </li>
              ))}
            </ul>
            <div className="px-5 pb-5">
              <Button variant="outline" className="w-full">
                Manage settings
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader title="Upcoming alert queue" />
            <ul className="px-5 py-2">
              {alertQueue.map((item) => (
                <li key={item.id} className="border-b border-line py-3 last:border-0">
                  <p className="flex items-center gap-2 text-base font-medium text-ink">
                    <CurrencyFlag code={item.currency} showCode={false} />
                    {item.title}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-ink-3">
                    <span>{item.currency}</span>
                    <ImpactDots level={item.impact} />
                  </p>
                  <p
                    className={`mt-1 text-sm ${
                      item.imminent ? 'font-semibold text-brand-soft' : 'text-ink-2'
                    }`}
                  >
                    {item.when}
                  </p>
                </li>
              ))}
            </ul>
            <div className="px-5 pb-4">
              <Link href="/" className="text-sm font-medium text-brand-soft hover:underline">
                View full calendar
              </Link>
            </div>
          </Card>

          <Card>
            <CardHeader title="Favourite markets" />
            <ul className="px-5 py-2">
              {favouriteMarkets.map((market) => (
                <li
                  key={market.symbol}
                  className="flex items-center justify-between border-b border-line py-2.5 last:border-0"
                >
                  <span className="text-base font-medium text-ink">{market.symbol}</span>
                  <span className="flex items-center gap-3">
                    <span className="tabular text-base font-semibold text-ink">{market.price}</span>
                    <Delta value={market.change} className="tabular w-16 text-right text-sm font-semibold" />
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>
    </>
  );
}
