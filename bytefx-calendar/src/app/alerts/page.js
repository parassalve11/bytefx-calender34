'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BellOff,
  BellRing,
  CalendarPlus,
  Download,
  Pencil,
  Plus,
  Star,
  Trash2,
} from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button, Checkbox, SearchInput, Segmented, Select, Toggle } from '@/components/ui/Controls';
import { CurrencyFlag, ImpactDots } from '@/components/ui/Indicators';
import Modal from '@/components/ui/Modal';
import CountrySelect from '@/components/ui/CountrySelect';
import ReminderDialog from '@/components/calendar/ReminderDialog';
import { impactLevels } from '@/data/eventCatalog';
import { timezoneById } from '@/data/countries';
import { getEventByKey, getEventsInRange } from '@/lib/calendarEngine';
import {
  addDays,
  epochOf,
  formatCountdown,
  formatShort,
  relativeDayLabel,
  shiftTime,
  todayISO,
} from '@/lib/datetime';
import { useAppState } from '@/lib/store';
import { useNow, useStableNow } from '@/lib/useNow';

const STATUS_FILTERS = ['All', 'Active', 'Paused', 'Triggered'];

/** Channel ids are lowercase; CSS `capitalize` would render SMS as "Sms". */
const CHANNEL_LABEL = { push: 'Push', email: 'Email', sms: 'SMS', inapp: 'In-app' };

const LEAD_LABEL = {
  5: '5 min',
  15: '15 min',
  30: '30 min',
  60: '1 hour',
  240: '4 hours',
  1440: '1 day',
};

export default function AlertsPage() {
  const {
    hydrated,
    reminders,
    updateReminder,
    removeReminder,
    saved,
    toggleSaved,
    notifications,
    updateNotifications,
    preferences,
    toast,
  } = useAppState();

  const snapshot = useStableNow();
  const now = useNow(1000);
  const today = todayISO();
  const zone = timezoneById(preferences.timezone);

  const [status, setStatus] = useState('All');
  const [impacts, setImpacts] = useState(['high', 'medium', 'low']);
  const [currencies, setCurrencies] = useState([]);
  const [query, setQuery] = useState('');
  const [reminderEvent, setReminderEvent] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createQuery, setCreateQuery] = useState('');

  /* Resolve each stored reminder back to its live event record. */
  const rows = useMemo(
    () =>
      reminders.map((reminder) => {
        const releaseEpoch = epochOf(reminder.date, reminder.time);
        const fireEpoch = releaseEpoch - reminder.lead * 60000;
        const local = shiftTime(reminder.date, reminder.time, zone.offset);
        return {
          ...reminder,
          releaseEpoch,
          fireEpoch,
          localDate: local.date,
          localTime: local.time,
          triggered: now >= fireEpoch,
          past: now >= releaseEpoch,
        };
      }),
    [reminders, zone.offset, now],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows
      .filter((row) => {
        if (status === 'Active' && row.status !== 'active') return false;
        if (status === 'Paused' && row.status !== 'paused') return false;
        if (status === 'Triggered' && !row.triggered) return false;
        if (!impacts.includes(row.impact)) return false;
        if (currencies.length > 0 && !currencies.includes(row.currency)) return false;
        if (needle && !row.title.toLowerCase().includes(needle)) return false;
        return true;
      })
      .sort((a, b) => a.releaseEpoch - b.releaseEpoch);
  }, [rows, status, impacts, currencies, query]);

  const queue = useMemo(
    () => rows.filter((row) => row.status === 'active' && !row.past).sort((a, b) => a.fireEpoch - b.fireEpoch).slice(0, 5),
    [rows],
  );

  const savedEvents = useMemo(
    () => saved.map((key) => getEventByKey(key, snapshot, today)).filter(Boolean).slice(0, 8),
    [saved, snapshot, today],
  );

  /* Candidate events for the "create alert" picker. */
  const candidates = useMemo(() => {
    const needle = createQuery.trim().toLowerCase();
    const existing = new Set(reminders.map((reminder) => reminder.eventKey));
    return getEventsInRange(today, addDays(today, 45), snapshot)
      .filter((event) => !existing.has(event.key))
      .filter((event) => (needle ? `${event.title} ${event.currency} ${event.category}`.toLowerCase().includes(needle) : event.impact === 'high'))
      .slice(0, 40);
  }, [createQuery, reminders, snapshot, today]);

  function setAll(nextStatus) {
    reminders.forEach((reminder) => updateReminder(reminder.id, { status: nextStatus }));
    toast(nextStatus === 'active' ? 'All alerts resumed' : 'All alerts paused', 'info');
  }

  const activeCount = rows.filter((row) => row.status === 'active').length;

  return (
    <>
      <PageHero
        title="Alerts & saved events"
        description="Create alerts for economic events and market-moving releases. Get notified before the events that matter most."
        aside={
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <Button onClick={() => setCreateOpen(true)}>
              <Plus size={15} />
              Create alert
            </Button>
            <dl className="flex gap-2">
              <div className="rounded border border-line bg-surface px-3 py-2">
                <dt className="text-2xs text-ink-3">Active</dt>
                <dd className="tabular text-md font-semibold text-pos">{activeCount}</dd>
              </div>
              <div className="rounded border border-line bg-surface px-3 py-2">
                <dt className="text-2xs text-ink-3">Total alerts</dt>
                <dd className="tabular text-md font-semibold text-ink">{rows.length}</dd>
              </div>
              <div className="rounded border border-line bg-surface px-3 py-2">
                <dt className="text-2xs text-ink-3">Watchlist</dt>
                <dd className="tabular text-md font-semibold text-ink">{saved.length}</dd>
              </div>
            </dl>
          </div>
        }
      />

      <div className="mx-auto grid max-w-shell grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[268px_minmax(0,1fr)] lg:px-8 xl:grid-cols-[268px_minmax(0,1fr)_300px]">
        <aside className="flex flex-col gap-6">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-md font-semibold text-ink">Filters</h2>
              <button
                type="button"
                onClick={() => {
                  setImpacts(['high', 'medium', 'low']);
                  setCurrencies([]);
                  setQuery('');
                  setStatus('All');
                }}
                className="text-sm font-medium text-brand-soft hover:underline"
              >
                Reset
              </button>
            </div>

            <SearchInput
              id="alert-search"
              label="Search alerts"
              value={query}
              onChange={setQuery}
              placeholder="Search events or keywords"
              className="mt-5"
            />

            <fieldset className="mt-5">
              <legend className="mb-1 text-xs font-medium text-ink-3">Impact level</legend>
              {impactLevels.map((level) => (
                <Checkbox
                  key={level.value}
                  checked={impacts.includes(level.value)}
                  onChange={(checked) =>
                    setImpacts((current) =>
                      checked ? [...current, level.value] : current.filter((item) => item !== level.value),
                    )
                  }
                  trailing={<ImpactDots level={level.value} />}
                >
                  {level.label} impact
                </Checkbox>
              ))}
            </fieldset>

            <div className="mt-5">
              <p className="mb-1.5 text-xs font-medium text-ink-3">Countries</p>
              <CountrySelect value={currencies} onChange={setCurrencies} />
              <p className="mt-1.5 text-2xs text-ink-3">Leave empty to show every country.</p>
            </div>

            <div className="mt-5">
              <p className="mb-1.5 text-xs font-medium text-ink-3">Alert status</p>
              <Segmented
                options={STATUS_FILTERS.map((item) => ({ value: item, label: item }))}
                value={status}
                onChange={setStatus}
                size="sm"
                className="flex-wrap"
              />
            </div>
          </Card>

          <Card>
            <CardHeader title="Quick actions" />
            <ul className="px-5 py-2">
              {[
                { label: 'Create new alert', icon: CalendarPlus, run: () => setCreateOpen(true) },
                { label: 'Resume all alerts', icon: BellRing, run: () => setAll('active') },
                { label: 'Pause all alerts', icon: BellOff, run: () => setAll('paused') },
                {
                  label: 'Export alerts (CSV)',
                  icon: Download,
                  run: () => toast(`${rows.length} alerts queued for export`, 'success'),
                },
              ].map((action) => (
                <li key={action.label}>
                  <button
                    type="button"
                    onClick={action.run}
                    className="flex w-full items-center gap-2.5 border-b border-line py-3 text-left text-base text-ink-2 transition-colors duration-150 last:border-0 hover:text-ink"
                  >
                    <action.icon size={15} className="text-ink-3" />
                    {action.label}
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </aside>

        <div className="min-w-0">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 className="text-xl font-semibold text-ink">
                Alerts ({filtered.length}
                {filtered.length !== rows.length ? ` of ${rows.length}` : ''})
              </h2>
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <Plus size={14} />
                Create alert
              </Button>
            </div>

            <div className="thin-scroll overflow-x-auto">
              <table className="w-full min-w-[860px] text-left">
                <thead>
                  <tr className="text-xs font-medium text-ink-3">
                    <th scope="col" className="border-b border-line px-5 py-3 font-medium">
                      Event
                    </th>
                    <th scope="col" className="border-b border-line px-2.5 py-3 font-medium">
                      Country
                    </th>
                    <th scope="col" className="border-b border-line px-2.5 py-3 font-medium">
                      Impact
                    </th>
                    <th scope="col" className="border-b border-line px-2.5 py-3 font-medium">
                      Release
                    </th>
                    <th scope="col" className="border-b border-line px-2.5 py-3 font-medium">
                      Notify
                    </th>
                    <th scope="col" className="border-b border-line px-2.5 py-3 font-medium">
                      Channels
                    </th>
                    <th scope="col" className="border-b border-line px-2.5 py-3 font-medium">
                      Active
                    </th>
                    <th scope="col" className="relative border-b border-line px-5 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id} className="transition-colors duration-150 hover:bg-subtle">
                      <td className="max-w-[240px] border-b border-line px-5 py-3">
                        <Link
                          href={`/events/${row.eventKey}`}
                          className="block truncate text-base font-medium text-ink hover:text-brand-soft hover:underline"
                          title={row.title}
                        >
                          {row.title}
                        </Link>
                        <span className="text-xs text-ink-3">
                          {row.period || row.category}
                          {row.note ? ` · ${row.note}` : ''}
                        </span>
                      </td>
                      <td className="border-b border-line px-2.5 py-3">
                        <CurrencyFlag code={row.currency} />
                      </td>
                      <td className="border-b border-line px-2.5 py-3">
                        <ImpactDots level={row.impact} />
                      </td>
                      <td className="border-b border-line px-2.5 py-3">
                        <span className="tabular block whitespace-nowrap text-sm text-ink">
                          {formatShort(row.localDate)}, {row.localTime}
                        </span>
                        <span
                          className={`text-xs font-medium ${row.past ? 'text-ink-3' : 'text-brand-soft'}`}
                        >
                          {row.past
                            ? relativeDayLabel(row.date, today)
                            : `In ${formatCountdown(row.releaseEpoch - now)}`}
                        </span>
                      </td>
                      <td className="whitespace-nowrap border-b border-line px-2.5 py-3 text-sm text-ink-2">
                        {LEAD_LABEL[row.lead] ?? `${row.lead} min`} before
                        <span className="block text-2xs text-ink-3">
                          {row.repeat === 'series' ? 'Every release' : 'This release'}
                        </span>
                      </td>
                      <td className="border-b border-line px-2.5 py-3">
                        <span className="flex flex-wrap gap-1">
                          {row.channels.map((channel) => (
                            <span
                              key={channel}
                              className="rounded border border-line bg-subtle px-1.5 py-0.5 text-2xs font-medium text-ink-2"
                            >
                              {CHANNEL_LABEL[channel] ?? channel}
                            </span>
                          ))}
                        </span>
                      </td>
                      <td className="border-b border-line px-2.5 py-3">
                        <Toggle
                          size="sm"
                          srLabel={`${row.status === 'active' ? 'Pause' : 'Resume'} alert for ${row.title}`}
                          checked={row.status === 'active'}
                          onChange={(next) => {
                            updateReminder(row.id, { status: next ? 'active' : 'paused' });
                            toast(
                              next ? `Alert resumed for ${row.title}` : `Alert paused for ${row.title}`,
                              'info',
                            );
                          }}
                        />
                      </td>
                      <td className="border-b border-line px-5 py-3">
                        <span className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setReminderEvent(getEventByKey(row.eventKey, snapshot, today))
                            }
                            aria-label={`Edit reminder for ${row.title}`}
                            title="Edit"
                            className="flex h-7 w-7 items-center justify-center rounded text-ink-3 transition-colors duration-150 hover:bg-subtle hover:text-ink"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              removeReminder(row.id);
                              toast(`Alert deleted for ${row.title}`, 'info');
                            }}
                            aria-label={`Delete reminder for ${row.title}`}
                            title="Delete"
                            className="flex h-7 w-7 items-center justify-center rounded text-ink-3 transition-colors duration-150 hover:bg-subtle hover:text-neg"
                          >
                            <Trash2 size={14} />
                          </button>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <p className="text-md font-semibold text-ink">
                  {hydrated && rows.length === 0 ? 'No alerts yet' : 'No alerts match these filters'}
                </p>
                <p className="mt-1 text-base text-ink-2">
                  {hydrated && rows.length === 0
                    ? 'Set a reminder from the calendar, or create one here.'
                    : 'Clear the search or widen the impact levels to see your alerts.'}
                </p>
                <Button className="mt-5" onClick={() => setCreateOpen(true)}>
                  <Plus size={14} />
                  Create alert
                </Button>
              </div>
            ) : null}
          </Card>
        </div>

        <aside className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Notification settings" />
            <div className="px-5 py-2">
              <Toggle
                checked={notifications.inApp}
                onChange={(value) => updateNotifications({ inApp: value })}
                label="In-app notifications"
                description="Show a banner while you are on ByteFX."
              />
              <Toggle
                checked={notifications.push}
                onChange={(value) => updateNotifications({ push: value })}
                label="Push notifications"
                description="Send to your phone and desktop."
              />
              <Toggle
                checked={notifications.email}
                onChange={(value) => updateNotifications({ email: value })}
                label="Email notifications"
                description="Delivered to your account address."
              />
              <Toggle
                checked={notifications.sms}
                onChange={(value) => updateNotifications({ sms: value })}
                label="SMS notifications"
                description="High-impact releases only."
              />
              <Toggle
                checked={notifications.weeklyDigest}
                onChange={(value) => updateNotifications({ weeklyDigest: value })}
                label="Weekly digest"
                description="A Sunday summary of the week ahead."
              />
              <Toggle
                checked={notifications.quietHours}
                onChange={(value) => updateNotifications({ quietHours: value })}
                label="Quiet hours"
                description={`Mute alerts between ${notifications.quietFrom} and ${notifications.quietTo}.`}
              />
              {notifications.quietHours ? (
                <div className="grid grid-cols-2 gap-2 pb-3">
                  <Select
                    id="quiet-from"
                    label="From"
                    options={HOURS}
                    value={notifications.quietFrom}
                    onChange={(quietFrom) => updateNotifications({ quietFrom })}
                  />
                  <Select
                    id="quiet-to"
                    label="To"
                    options={HOURS}
                    value={notifications.quietTo}
                    onChange={(quietTo) => updateNotifications({ quietTo })}
                  />
                </div>
              ) : null}
            </div>
          </Card>

          <Card>
            <CardHeader title="Upcoming alert queue" action={`${queue.length} queued`} />
            <ul className="px-5 py-2">
              {queue.length === 0 ? (
                <li className="py-6 text-center text-sm text-ink-3">No alerts scheduled to fire.</li>
              ) : null}
              {queue.map((item) => (
                <li key={item.id} className="border-b border-line py-3 last:border-0">
                  <p className="flex items-center gap-2 text-base font-medium text-ink">
                    <CurrencyFlag code={item.currency} showCode={false} />
                    <span className="truncate">{item.title}</span>
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-ink-3">
                    <span>{item.currency}</span>
                    <ImpactDots level={item.impact} />
                    <span className="tabular">
                      {formatShort(item.localDate)}, {item.localTime}
                    </span>
                  </p>
                  <p className="tabular mt-1 text-sm font-semibold text-brand-soft">
                    Fires in {formatCountdown(item.fireEpoch - now)}
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
            <CardHeader title="Watchlist" action={`${saved.length} saved`} />
            <ul className="px-5 py-2">
              {savedEvents.length === 0 ? (
                <li className="py-6 text-center text-sm text-ink-3">
                  Star an event on the calendar to keep it here.
                </li>
              ) : null}
              {savedEvents.map((event) => (
                <li
                  key={event.key}
                  className="flex items-center gap-2 border-b border-line py-2.5 last:border-0"
                >
                  <CurrencyFlag code={event.currency} showCode={false} />
                  <Link
                    href={`/events/${event.key}`}
                    className="min-w-0 flex-1 truncate text-base font-medium text-ink hover:text-brand-soft hover:underline"
                  >
                    {event.title}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      toggleSaved(event.key);
                      toast('Removed from your watchlist', 'info');
                    }}
                    aria-label={`Remove ${event.title} from watchlist`}
                    className="text-impact-medium transition-colors duration-150 hover:text-neg"
                  >
                    <Star size={14} fill="currentColor" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </aside>
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create an alert"
        description="Pick an upcoming release, then choose when and how you want to be told."
        width="max-w-2xl"
      >
        <SearchInput
          value={createQuery}
          onChange={setCreateQuery}
          placeholder="Search the next 45 days — payrolls, CPI, ECB…"
        />
        <p className="mt-3 text-2xs text-ink-3">
          {createQuery ? `${candidates.length} matching releases` : 'High-impact releases in the next 45 days'}
        </p>

        <ul className="mt-2">
          {candidates.map((event) => (
            <li key={event.key}>
              <button
                type="button"
                onClick={() => {
                  setCreateOpen(false);
                  setReminderEvent(event);
                }}
                className="flex w-full items-center gap-3 rounded border-b border-line px-1 py-3 text-left transition-colors duration-150 hover:bg-subtle"
              >
                <CurrencyFlag code={event.currency} showCode={false} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-medium text-ink">
                    {event.displayTitle}
                  </span>
                  <span className="mt-0.5 flex items-center gap-2 text-sm text-ink-3">
                    <ImpactDots level={event.impact} />
                    {event.category} · {formatShort(event.date)} {event.time}
                  </span>
                </span>
                <span className="shrink-0 rounded border border-line-strong px-2.5 py-1 text-2xs font-semibold text-ink">
                  Set reminder
                </span>
              </button>
            </li>
          ))}
          {candidates.length === 0 ? (
            <li className="py-10 text-center text-base text-ink-3">
              No matching releases — try a different search.
            </li>
          ) : null}
        </ul>
      </Modal>

      <ReminderDialog
        event={reminderEvent}
        open={Boolean(reminderEvent)}
        onClose={() => setReminderEvent(null)}
      />
    </>
  );
}

const HOURS = Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, '0')}:00`);
