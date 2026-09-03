import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BellPlus, ChevronRight } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { CurrencyFlag, Delta, ImpactBadge, ImpactDots } from '@/components/ui/Indicators';
import HistoricalTrend from '@/components/event/HistoricalTrend';
import { eventDetails, getEventDetail } from '@/data/eventDetails';

export function generateStaticParams() {
  return Object.keys(eventDetails).map((id) => ({ id }));
}

export function generateMetadata({ params }) {
  const event = getEventDetail(params.id);
  return { title: event ? `${event.title} — ByteFX` : 'Event — ByteFX' };
}

const TONE = { pos: 'text-pos', neg: 'text-neg' };

export default function EventDetailPage({ params }) {
  const event = getEventDetail(params.id);
  if (!event) notFound();

  return (
    <div className="mx-auto max-w-shell px-4 py-6 sm:px-6 lg:px-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-ink-3">
        <Link href="/" className="hover:text-ink">
          Calendar
        </Link>
        <ChevronRight size={13} />
        <span>Economic events</span>
        <ChevronRight size={13} />
        <span className="text-ink-2">{event.title}</span>
      </nav>

      <Link
        href="/"
        className="mt-4 inline-flex items-center gap-2 rounded border border-line-strong px-3 py-2 text-base font-medium text-ink transition-colors duration-150 hover:border-brand"
      >
        <ArrowLeft size={15} />
        Back to calendar
      </Link>

      <header className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <CurrencyFlag code={event.currency} showCode={false} size="4xl" className="mt-1" />
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {event.title}{' '}
              <span className="font-normal text-ink-3">({event.period})</span>
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ImpactBadge level={event.impact} />
              <span className="inline-flex items-center gap-1.5 rounded border border-line bg-subtle px-2 py-0.5 text-2xs font-semibold text-ink-2">
                <CurrencyFlag code={event.currency} />
              </span>
              <span className="rounded border border-line bg-subtle px-2 py-0.5 text-2xs font-semibold text-ink-2">
                {event.category}
              </span>
            </div>
            <p className="mt-3 text-base leading-relaxed text-ink-2">{event.description}</p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="text-right">
            <p className="text-sm text-ink-2">{event.releaseDate}</p>
            <p className="tabular text-2xl font-bold text-ink">
              {event.releaseTime}{' '}
              <span className="text-sm font-normal text-ink-3">{event.timezone}</span>
            </p>
            <p className="text-sm font-semibold text-pos">{event.countdown}</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded border border-line-strong px-3 py-2 text-base font-medium text-ink transition-colors duration-150 hover:border-brand"
          >
            <BellPlus size={15} />
            Set reminder
          </button>
        </div>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {event.stats.map((stat) => (
              <Card key={stat.label} className="p-4">
                <p className="text-sm text-ink-2">{stat.label}</p>
                <p
                  className={`tabular mt-2 text-2xl font-bold ${TONE[stat.tone] ?? 'text-ink'}`}
                >
                  {stat.value}
                </p>
                <p className="mt-3 flex flex-wrap items-baseline justify-between gap-2 text-xs">
                  <span className="text-ink-3">{stat.period}</span>
                  <span className={TONE[stat.noteTone] ?? 'text-ink-2'}>{stat.note}</span>
                </p>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <HistoricalTrend history={event.history} />

            <Card>
              <CardHeader title="Why it matters" />
              <div className="px-5 py-4">
                <p className="text-base leading-relaxed text-ink-2">{event.summary}</p>
                <ul className="mt-4 flex flex-col gap-3">
                  {event.whyItMatters.map((item) => (
                    <li key={item.title} className="flex gap-2.5">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                      />
                      <p className="text-base leading-relaxed text-ink-2">
                        <span className="font-semibold text-ink">{item.title}.</span> {item.body}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader title="Related releases & timeline" />
            <div className="thin-scroll overflow-x-auto">
              <table className="w-full min-w-[560px] text-left">
                <thead>
                  <tr className="text-xs font-medium text-ink-3">
                    <th scope="col" className="border-b border-line px-5 py-3 font-medium">
                      Date
                    </th>
                    <th scope="col" className="border-b border-line px-5 py-3 font-medium">
                      Release
                    </th>
                    <th scope="col" className="border-b border-line px-5 py-3 text-right font-medium">
                      Actual
                    </th>
                    <th scope="col" className="border-b border-line px-5 py-3 text-right font-medium">
                      Forecast
                    </th>
                    <th scope="col" className="border-b border-line px-5 py-3 text-right font-medium">
                      Previous
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {event.related.map((row) => (
                    <tr key={row.title} className="transition-colors duration-150 hover:bg-subtle">
                      <td className="tabular whitespace-nowrap border-b border-line px-5 py-3 text-sm text-ink-2">
                        {row.date}
                      </td>
                      <td className="border-b border-line px-5 py-3 text-base font-medium text-ink">
                        {row.title}
                      </td>
                      <td className="tabular border-b border-line px-5 py-3 text-right text-base font-semibold">
                        <Delta value={row.actual} />
                      </td>
                      <td className="tabular border-b border-line px-5 py-3 text-right text-base text-ink-2">
                        {row.forecast}
                      </td>
                      <td className="tabular border-b border-line px-5 py-3 text-right text-base text-ink-2">
                        {row.previous}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <aside className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Affected markets" />
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-medium text-ink-3">
                  <th scope="col" className="px-5 pt-3 font-medium">
                    Market
                  </th>
                  <th scope="col" className="px-2 pt-3 text-right font-medium">
                    Avg. move
                  </th>
                  <th scope="col" className="px-5 pt-3 text-right font-medium">
                    Impact
                  </th>
                </tr>
              </thead>
              <tbody>
                {event.affectedMarkets.map((market) => (
                  <tr key={market.symbol} className="border-b border-line last:border-0">
                    <td className="px-5 py-2.5 text-base font-medium text-ink">{market.symbol}</td>
                    <td className="tabular px-2 py-2.5 text-right text-base font-semibold text-ink">
                      {market.move}
                    </td>
                    <td className="px-5 py-2.5 text-right">
                      <ImpactDots level={market.impact} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card>
            <CardHeader title="Event details" />
            <dl className="px-5 py-2">
              {event.facts.map((fact) => (
                <div
                  key={fact.label}
                  className="flex items-center justify-between gap-4 border-b border-line py-2.5 last:border-0"
                >
                  <dt className="text-sm text-ink-2">{fact.label}</dt>
                  <dd className="text-sm font-medium text-ink">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </aside>
      </div>
    </div>
  );
}
