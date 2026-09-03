'use client';

import { useEffect, useState } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { Button, OptionPills, TextInput, Toggle } from '@/components/ui/Controls';
import { CurrencyFlag, ImpactDots } from '@/components/ui/Indicators';
import { useAppState } from '@/lib/store';
import { formatLong, shiftTime } from '@/lib/datetime';
import { timezoneById } from '@/data/countries';

const LEAD_OPTIONS = [
  { value: 5, label: '5 min before' },
  { value: 15, label: '15 min before' },
  { value: 30, label: '30 min before' },
  { value: 60, label: '1 hour before' },
  { value: 240, label: '4 hours before' },
  { value: 1440, label: '1 day before' },
];

const CHANNEL_OPTIONS = [
  { value: 'push', label: 'Push', icon: <Smartphone size={12} /> },
  { value: 'email', label: 'Email', icon: <Mail size={12} /> },
  { value: 'sms', label: 'SMS', icon: <MessageSquare size={12} /> },
  { value: 'inapp', label: 'In-app', icon: <Bell size={12} /> },
];

const REPEAT_OPTIONS = [
  { value: 'once', label: 'This release only' },
  { value: 'series', label: 'Every release in this series' },
];

/**
 * Create or edit the reminder attached to a single event. Writes straight to
 * the shared store, so the alerts screen picks it up immediately.
 */
export default function ReminderDialog({ event, open, onClose }) {
  const { reminderFor, addReminder, updateReminder, removeReminder, preferences, toast } = useAppState();
  const existing = event ? reminderFor(event.key) : null;

  const [lead, setLead] = useState(30);
  const [channels, setChannels] = useState(['push', 'email']);
  const [repeat, setRepeat] = useState('once');
  const [note, setNote] = useState('');
  const [active, setActive] = useState(true);

  // Reload the form whenever a different event's dialog is opened.
  useEffect(() => {
    if (!open) return;
    setLead(existing?.lead ?? 30);
    setChannels(existing?.channels ?? ['push', 'email']);
    setRepeat(existing?.repeat ?? 'once');
    setNote(existing?.note ?? '');
    setActive((existing?.status ?? 'active') === 'active');
    // `existing` is intentionally read only when the dialog opens — editing the
    // form should not be clobbered by a store update mid-edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, event?.key]);

  if (!event) return null;

  const zone = timezoneById(preferences.timezone);
  const local = shiftTime(event.date, event.time, zone.offset);

  function save() {
    const payload = {
      eventKey: event.key,
      catalogId: event.catalogId,
      date: event.date,
      time: event.time,
      title: event.title,
      period: event.period,
      currency: event.currency,
      impact: event.impact,
      category: event.category,
      lead,
      channels,
      repeat,
      note: note.trim(),
      status: active ? 'active' : 'paused',
    };

    if (existing) {
      updateReminder(existing.id, payload);
      toast(`Reminder updated for ${event.title}`, 'reminder');
    } else {
      addReminder(payload);
      const leadLabel = LEAD_OPTIONS.find((option) => option.value === lead)?.label ?? '';
      toast(`Reminder set — ${leadLabel.toLowerCase()} ${event.title}`, 'reminder');
    }
    onClose();
  }

  function remove() {
    removeReminder(existing.id);
    toast(`Reminder removed for ${event.title}`, 'info');
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existing ? 'Edit reminder' : 'Set reminder'}
      description="Choose how far ahead you want to be told, and where the alert should arrive."
      footer={
        <>
          {existing ? (
            <Button variant="danger" onClick={remove} className="mr-auto">
              <Trash2 size={14} />
              Delete
            </Button>
          ) : null}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={channels.length === 0}>
            {existing ? 'Save changes' : 'Set reminder'}
          </Button>
        </>
      }
    >
      <div className="rounded-lg border border-line bg-subtle p-4">
        <div className="flex flex-wrap items-center gap-2">
          <CurrencyFlag code={event.currency} size="md" />
          <ImpactDots level={event.impact} />
          <span className="rounded border border-line bg-surface px-2 py-0.5 text-2xs font-medium text-ink-2">
            {event.category}
          </span>
        </div>
        <p className="mt-2 text-md font-semibold text-ink">{event.displayTitle ?? event.title}</p>
        <p className="mt-1 text-sm text-ink-2">
          {formatLong(local.date)} · <span className="tabular">{local.time}</span>{' '}
          <span className="text-ink-3">{zone.label.split(') ')[1]}</span>
        </p>
      </div>

      <fieldset className="mt-5">
        <legend className="mb-2 text-xs font-medium text-ink-3">Notify me</legend>
        <OptionPills options={LEAD_OPTIONS} value={lead} onChange={setLead} />
      </fieldset>

      <fieldset className="mt-5">
        <legend className="mb-2 text-xs font-medium text-ink-3">Deliver via</legend>
        <OptionPills options={CHANNEL_OPTIONS} value={channels} onChange={setChannels} multiple />
        {channels.length === 0 ? (
          <p className="mt-2 text-2xs text-neg">Pick at least one delivery channel.</p>
        ) : null}
      </fieldset>

      <fieldset className="mt-5">
        <legend className="mb-2 text-xs font-medium text-ink-3">Repeat</legend>
        <OptionPills options={REPEAT_OPTIONS} value={repeat} onChange={setRepeat} />
      </fieldset>

      <TextInput
        id="reminder-note"
        label="Note (optional)"
        value={note}
        maxLength={120}
        onChange={(changeEvent) => setNote(changeEvent.target.value)}
        placeholder="e.g. watch the revision to the prior month"
        className="mt-5"
        hint={`${note.length}/120`}
      />

      <div className="mt-4 border-t border-line pt-2">
        <Toggle
          checked={active}
          onChange={setActive}
          label="Reminder active"
          description={active ? 'You will be alerted at the time above.' : 'Saved but paused — no alert will fire.'}
        />
      </div>
    </Modal>
  );
}
