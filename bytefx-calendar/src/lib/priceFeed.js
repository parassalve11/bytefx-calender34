'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { noiseFor, randomFor } from './seed';
import { todayISO } from './datetime';

/**
 * A simulated price feed.
 *
 * The opening snapshot is derived from the instrument's reference price and the
 * current date, so it is identical on the server and on the first client render.
 * Only after mount does the interval start nudging prices around, which is what
 * makes the tables feel live without risking a hydration mismatch.
 */

function buildQuote(instrument, day) {
  const seed = `${instrument.symbol}|${day}`;
  const drift = noiseFor(`${seed}|open`) * instrument.volatility * 40;
  const price = instrument.price + drift;
  const open = instrument.price + noiseFor(`${seed}|prevclose`) * instrument.volatility * 45;
  const dayRange = instrument.volatility * (60 + randomFor(`${seed}|range`) * 60);

  const low = Math.min(price, open) - dayRange * 0.4;
  const high = Math.max(price, open) + dayRange * 0.4;

  return {
    ...instrument,
    price,
    open,
    low,
    high,
    prevClose: open,
    updatedAt: 0,
    tickDirection: 'flat',
  };
}

export function decorate(quote) {
  const change = quote.price - quote.prevClose;
  const changePct = (change / quote.prevClose) * 100;
  const bid = quote.price;
  const ask = quote.price + quote.spread * quote.pip;
  const span = Math.max(quote.high - quote.low, quote.pip);

  return {
    ...quote,
    bid: bid.toFixed(quote.dp),
    ask: ask.toFixed(quote.dp),
    priceText: quote.price.toFixed(quote.dp),
    lowText: quote.low.toFixed(quote.dp),
    highText: quote.high.toFixed(quote.dp),
    change,
    changeText: `${change >= 0 ? '+' : ''}${changePct.toFixed(2)}%`,
    changeAbsText: `${change >= 0 ? '+' : ''}${change.toFixed(quote.dp)}`,
    position: Math.min(97, Math.max(3, ((quote.price - quote.low) / span) * 100)),
    trend: change >= 0 ? 'up' : 'down',
  };
}

/**
 * @param instruments reference rows from `data/markets.js`
 * @param live        set false to freeze the feed (used when a tab is hidden)
 */
export function useLivePrices(instruments, live = true) {
  const day = useMemo(() => todayISO(), []);
  const [quotes, setQuotes] = useState(() =>
    instruments.map((instrument) => buildQuote(instrument, day)),
  );
  const tick = useRef(0);

  // Rebuild when the instrument list changes (switching market tabs).
  useEffect(() => {
    setQuotes(instruments.map((instrument) => buildQuote(instrument, day)));
    tick.current = 0;
  }, [instruments, day]);

  useEffect(() => {
    if (!live) return undefined;

    const id = window.setInterval(() => {
      tick.current += 1;
      const step = tick.current;
      setQuotes((current) =>
        current.map((quote) => {
          // Only a subset of instruments move on any given tick, which reads far
          // more like a real feed than every row flickering at once.
          if (randomFor(`${quote.symbol}|${step}|move`) > 0.55) return { ...quote, tickDirection: 'flat' };

          const delta = noiseFor(`${quote.symbol}|${step}|d`) * quote.volatility;
          const price = quote.price + delta;
          return {
            ...quote,
            price,
            low: Math.min(quote.low, price),
            high: Math.max(quote.high, price),
            tickDirection: delta >= 0 ? 'up' : 'down',
            updatedAt: step,
          };
        }),
      );
    }, 1600);

    return () => window.clearInterval(id);
  }, [live]);

  return useMemo(() => quotes.map(decorate), [quotes]);
}

/** Which trading sessions are open right now, in the viewer's local time. */
export function sessionState(sessions, hourUtc) {
  return sessions.map((session) => {
    const open =
      session.opens < session.closes
        ? hourUtc >= session.opens && hourUtc < session.closes
        : hourUtc >= session.opens || hourUtc < session.closes;
    return { ...session, open };
  });
}
