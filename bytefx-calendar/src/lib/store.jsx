'use client';

/**
 * App-wide client state: reminders, saved events, filter preferences and the
 * notification settings, all persisted to localStorage so a reminder created on
 * the calendar is there on the alerts screen and still there after a reload.
 *
 * State starts at the defaults during SSR and is replaced from storage in an
 * effect, so the first client render matches the server exactly. `hydrated`
 * tells components when the stored values have landed.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { majorCurrencies } from '@/data/countries';
import { getEventsInRange } from './calendarEngine';
import { addDays, todayISO } from './datetime';

const STORAGE_KEY = 'bytefx-app-state';

export const defaultPreferences = {
  currencies: majorCurrencies,
  impacts: ['high', 'medium', 'low'],
  categories: ['All categories'],
  timezone: 'london',
  timeWindow: 'all',
  view: 'day',
  onlyUpcoming: false,
  hideNoData: false,
  density: 'comfortable',
  query: '',
};

export const defaultNotifications = {
  inApp: true,
  email: true,
  push: true,
  sms: false,
  weeklyDigest: true,
  quietHours: false,
  quietFrom: '22:00',
  quietTo: '07:00',
  soundAlerts: false,
};

const AppStateContext = createContext(null);

function readStored() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

/** Seed a few reminders on first visit so the alerts screen is never empty. */
function seedReminders() {
  const today = todayISO();
  const events = getEventsInRange(today, addDays(today, 21), Date.now())
    .filter((event) => event.impact === 'high' && event.status === 'upcoming')
    .slice(0, 6);

  return events.map((event, index) => ({
    id: `seed-${event.key}`,
    eventKey: event.key,
    catalogId: event.catalogId,
    date: event.date,
    time: event.time,
    title: event.title,
    period: event.period,
    currency: event.currency,
    impact: event.impact,
    category: event.category,
    lead: [15, 30, 60, 60, 1440, 15][index % 6],
    channels: index % 3 === 0 ? ['push', 'email'] : ['push'],
    repeat: index % 4 === 0 ? 'series' : 'once',
    note: '',
    status: index === 5 ? 'paused' : 'active',
    createdAt: Date.now() - index * 3600000,
  }));
}

export function AppStateProvider({ children }) {
  const [hydrated, setHydrated] = useState(false);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [notifications, setNotifications] = useState(defaultNotifications);
  const [reminders, setReminders] = useState([]);
  const [saved, setSaved] = useState([]);
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  // Load once on mount.
  useEffect(() => {
    const stored = readStored();
    if (stored) {
      setPreferences({ ...defaultPreferences, ...(stored.preferences ?? {}) });
      setNotifications({ ...defaultNotifications, ...(stored.notifications ?? {}) });
      setReminders(Array.isArray(stored.reminders) ? stored.reminders : []);
      setSaved(Array.isArray(stored.saved) ? stored.saved : []);
    } else {
      setReminders(seedReminders());
    }
    setHydrated(true);
  }, []);

  // Persist on every change, but only after the initial load.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ preferences, notifications, reminders, saved }),
      );
    } catch (error) {
      /* storage full or blocked — the session still works, it just won't persist */
    }
  }, [hydrated, preferences, notifications, reminders, saved]);

  const toast = useCallback((message, tone = 'info') => {
    toastId.current += 1;
    const id = toastId.current;
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3600);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  /* --- reminders ---------------------------------------------------- */

  const addReminder = useCallback(
    (reminder) => {
      const id = `r-${reminder.eventKey}-${Date.now()}`;
      setReminders((current) => {
        const existing = current.findIndex((item) => item.eventKey === reminder.eventKey);
        const next = { status: 'active', createdAt: Date.now(), ...reminder, id };
        if (existing >= 0) {
          const copy = [...current];
          copy[existing] = { ...copy[existing], ...next, id: copy[existing].id };
          return copy;
        }
        return [next, ...current];
      });
      return id;
    },
    [],
  );

  const updateReminder = useCallback((id, patch) => {
    setReminders((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const removeReminder = useCallback((id) => {
    setReminders((current) => current.filter((item) => item.id !== id));
  }, []);

  const removeReminderForEvent = useCallback((eventKey) => {
    setReminders((current) => current.filter((item) => item.eventKey !== eventKey));
  }, []);

  const reminderFor = useCallback(
    (eventKey) => reminders.find((item) => item.eventKey === eventKey) ?? null,
    [reminders],
  );

  /* --- saved events ------------------------------------------------- */

  const toggleSaved = useCallback((eventKey) => {
    let added = false;
    setSaved((current) => {
      if (current.includes(eventKey)) return current.filter((key) => key !== eventKey);
      added = true;
      return [eventKey, ...current];
    });
    return added;
  }, []);

  const isSaved = useCallback((eventKey) => saved.includes(eventKey), [saved]);

  /* --- preferences -------------------------------------------------- */

  const updatePreferences = useCallback((patch) => {
    setPreferences((current) => ({ ...current, ...(typeof patch === 'function' ? patch(current) : patch) }));
  }, []);

  const resetPreferences = useCallback(() => setPreferences(defaultPreferences), []);

  const updateNotifications = useCallback((patch) => {
    setNotifications((current) => ({ ...current, ...patch }));
  }, []);

  const value = useMemo(
    () => ({
      hydrated,
      preferences,
      updatePreferences,
      resetPreferences,
      notifications,
      updateNotifications,
      reminders,
      addReminder,
      updateReminder,
      removeReminder,
      removeReminderForEvent,
      reminderFor,
      saved,
      toggleSaved,
      isSaved,
      toasts,
      toast,
      dismissToast,
    }),
    [
      hydrated,
      preferences,
      updatePreferences,
      resetPreferences,
      notifications,
      updateNotifications,
      reminders,
      addReminder,
      updateReminder,
      removeReminder,
      removeReminderForEvent,
      reminderFor,
      saved,
      toggleSaved,
      isSaved,
      toasts,
      toast,
      dismissToast,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used inside <AppStateProvider>');
  return context;
}
