'use client';

import { Fragment, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, Mic } from 'lucide-react';
import { CurrencyFlag, Delta, ImpactDots, Value } from '@/components/ui/Indicators';
import { calendarDay } from '@/data/economicEvents';

function EventDetailRow({ event }) {
  return (
    <tr className="bg-subtle/60">
      <td colSpan={7} className="border-b border-line px-4 pb-5 pt-1 sm:px-6">
        <div className="max-w-3xl">
          <p className="text-base leading-relaxed text-ink-2">{event.description}</p>
          {event.commentary ? (
            <p className="mt-3 flex gap-2 text-base leading-relaxed text-ink-2">
              <span
                aria-hidden="true"
                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
              />
              {event.commentary}
            </p>
          ) : null}
          <Link
            href={`/events/${event.id}`}
            className="mt-4 inline-flex items-center gap-1.5 text-base font-semibold text-brand-soft hover:underline"
          >
            View full event
            <ArrowRight size={14} />
          </Link>
        </div>
      </td>
    </tr>
  );
}

export default function EventsTable({ events }) {
  const [expanded, setExpanded] = useState(
    () => events.find((event) => event.highlighted)?.id ?? null,
  );

  return (
    <div className="rounded-xl border border-line bg-surface shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-4 sm:px-6">
        <h2 className="text-xl font-semibold text-ink">{calendarDay.label}</h2>
        <p className="text-sm text-ink-3">{calendarDay.timezoneNote}</p>
      </div>

      <div className="thin-scroll overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <caption className="sr-only">
            Economic releases for {calendarDay.label}, with impact, actual, forecast and previous values
          </caption>
          <thead>
            <tr className="text-xs font-medium text-ink-3">
              <th scope="col" className="border-b border-line px-4 py-3 font-medium sm:px-6">
                Time
              </th>
              <th scope="col" className="border-b border-line px-3 py-3 font-medium">
                Currency
              </th>
              <th scope="col" className="border-b border-line px-3 py-3 font-medium">
                Event
              </th>
              <th scope="col" className="border-b border-line px-3 py-3 font-medium">
                Impact
              </th>
              <th scope="col" className="border-b border-line px-3 py-3 text-right font-medium">
                Actual
              </th>
              <th scope="col" className="border-b border-line px-3 py-3 text-right font-medium">
                Forecast
              </th>
              <th scope="col" className="border-b border-line px-4 py-3 pr-4 text-right font-medium sm:pr-6">
                Previous
              </th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => {
              const isOpen = expanded === event.id;
              return (
                <Fragment key={event.id}>
                  <tr
                    onClick={() => setExpanded(isOpen ? null : event.id)}
                    aria-expanded={isOpen}
                    className={`cursor-pointer transition-colors duration-150 hover:bg-subtle ${
                      isOpen ? 'bg-subtle/60' : ''
                    } ${event.next ? 'shadow-[inset_3px_0_0_#1357BC]' : ''}`}
                  >
                    <td className="tabular whitespace-nowrap border-b border-line px-4 py-3.5 text-sm text-ink-2 sm:px-6">
                      {event.time}
                    </td>
                    <td className="whitespace-nowrap border-b border-line px-3 py-3.5">
                      <CurrencyFlag code={event.currency} />
                    </td>
                    <td className="max-w-[250px] border-b border-line px-4 py-3.5">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-base font-medium text-ink">{event.title}</span>
                        {event.preliminary ? (
                          <span
                            title="Preliminary reading"
                            className="rounded-sm border border-line px-1 text-2xs font-semibold text-ink-3"
                          >
                            P
                          </span>
                        ) : null}
                        {event.type === 'speech' ? (
                          <Mic size={13} className="text-ink-3" aria-label="Speech" />
                        ) : null}
                        {event.countdown ? (
                          <span className="rounded border border-brand/25 bg-brand/10 px-2 py-0.5 text-2xs font-semibold text-brand-soft">
                            {event.countdown}
                          </span>
                        ) : null}
                        <ChevronDown
                          size={14}
                          className={`text-ink-3 transition-transform duration-150 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </span>
                    </td>
                    <td className="border-b border-line px-3 py-3.5">
                      <ImpactDots level={event.impact} />
                    </td>
                    <td className="tabular border-b border-line px-3 py-3.5 text-right text-base font-semibold">
                      {event.actual ? (
                        <Delta value={event.actual} />
                      ) : (
                        <span className="text-ink-3">–</span>
                      )}
                    </td>
                    <td className="tabular border-b border-line px-3 py-3.5 text-right text-base">
                      <Value value={event.forecast} />
                    </td>
                    <td className="tabular border-b border-line px-4 py-3.5 pr-4 text-right text-base sm:pr-6">
                      <Value value={event.previous} />
                    </td>
                  </tr>
                  {isOpen ? <EventDetailRow event={event} /> : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {events.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-md font-semibold text-ink">No events match these filters</p>
          <p className="mt-1 text-base text-ink-2">
            Widen the impact level or add more countries to see releases for this day.
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm text-ink-3 sm:px-6">
          <span>Showing {events.length} releases</span>
          <Link href="/weekly" className="font-medium text-brand-soft hover:underline">
            See the full week
          </Link>
        </div>
      )}
    </div>
  );
}
