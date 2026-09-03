'use client';

import { useEffect, useState } from 'react';

/**
 * A ticking clock for countdowns.
 *
 * The first value is captured once and used for both the server render and the
 * first client render, so hydration matches; the interval only starts afterwards.
 */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return now;
}

/** A stable timestamp for the lifetime of the component — no re-renders. */
export function useStableNow() {
  const [now] = useState(() => Date.now());
  return now;
}

/** True once the component has mounted on the client. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/** Fires `handler` on a click or focus outside `ref`, and on Escape. */
export function useDismiss(ref, active, handler) {
  useEffect(() => {
    if (!active) return undefined;

    function onPointerDown(event) {
      if (ref.current && !ref.current.contains(event.target)) handler();
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') handler();
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [ref, active, handler]);
}
