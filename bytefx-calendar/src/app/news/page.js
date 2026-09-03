'use client';

import { useMemo, useState } from 'react';
import { Bookmark, Share2 } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import { Card } from '@/components/ui/Card';
import { Segmented } from '@/components/ui/Controls';
import { CurrencyFlag } from '@/components/ui/Indicators';
import { newsFeed, newsFilters } from '@/data/news';

const TAG_TONE = {
  High: 'border-impact-high/30 bg-impact-high/10 text-neg',
  Medium: 'border-impact-medium/30 bg-impact-medium/10 text-[#B0730A] dark:text-impact-medium',
  Speech: 'border-line bg-subtle text-ink-2',
  Preview: 'border-brand/25 bg-brand/10 text-brand-soft',
};

export default function NewsPage() {
  const [filter, setFilter] = useState('All');
  const [activeId, setActiveId] = useState(newsFeed[0].id);

  const feed = useMemo(() => {
    if (filter === 'All') return newsFeed;
    if (filter === 'Central banks' || filter === 'Commodities') {
      return newsFeed.filter((item) => item.category === filter);
    }
    return newsFeed.filter((item) => item.currency === filter);
  }, [filter]);

  const article = newsFeed.find((item) => item.id === activeId) ?? feed[0] ?? newsFeed[0];

  return (
    <>
      <PageHero
        title="Market news"
        description="A running wire of releases, central bank commentary and price action, tagged by the currency it moves."
        aside={
          <span className="inline-flex items-center gap-2 rounded border border-line bg-surface px-3 py-2 text-sm font-medium text-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Live feed
          </span>
        }
      />

      <div className="mx-auto grid max-w-shell grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:px-8">
        <Card className="lg:sticky lg:top-32 lg:max-h-[calc(100vh-10rem)] lg:self-start lg:overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-md font-semibold text-ink">Latest</h2>
            <span className="text-sm text-ink-3">Updated 14:32</span>
          </div>

          <div className="border-b border-line px-5 py-3">
            <Segmented
              options={newsFilters.map((f) => ({ value: f, label: f }))}
              value={filter}
              onChange={setFilter}
              size="sm"
              className="flex-wrap"
            />
          </div>

          <ul className="thin-scroll lg:max-h-[60vh] lg:overflow-y-auto">
            {feed.map((item) => {
              const active = item.id === article.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    aria-current={active ? 'true' : undefined}
                    className={`w-full border-b border-line px-5 py-4 text-left transition-colors duration-150 hover:bg-subtle ${
                      active ? 'bg-subtle shadow-[inset_3px_0_0_#1357BC]' : ''
                    }`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 text-xs text-ink-3">
                        <CurrencyFlag code={item.currency} />
                        <span className="tabular">{item.time}</span>
                      </span>
                      <span
                        className={`rounded border px-1.5 py-0.5 text-2xs font-semibold ${
                          TAG_TONE[item.tag] ?? TAG_TONE.Speech
                        }`}
                      >
                        {item.tag}
                      </span>
                    </span>
                    <span className="mt-2 block text-base font-semibold leading-snug text-ink">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-xs text-ink-3">{item.source}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="min-w-0">
          <article className="px-5 py-6 sm:px-8 sm:py-8">
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-3">
              <span
                className={`rounded border px-2 py-0.5 text-2xs font-semibold ${
                  TAG_TONE[article.tag] ?? TAG_TONE.Speech
                }`}
              >
                {article.tag} impact
              </span>
              <span className="inline-flex items-center gap-1.5 rounded border border-line bg-subtle px-2 py-0.5 font-medium text-ink-2">
                <CurrencyFlag code={article.currency} />
              </span>
              <span className="rounded border border-line bg-subtle px-2 py-0.5 font-medium text-ink-2">
                {article.category}
              </span>
              <span className="tabular">
                {article.time} · {article.readTime}
              </span>
            </div>

            <h1 className="mt-4 max-w-3xl text-2xl font-bold leading-tight tracking-tight text-ink sm:text-3xl">
              {article.title}
            </h1>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-subtle text-sm font-semibold text-ink-2">
                  BN
                </span>
                <span>
                  <span className="block text-base font-semibold text-ink">ByteFX Newsdesk</span>
                  <span className="block text-sm text-ink-3">{article.source}</span>
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="Save article"
                  className="flex h-9 w-9 items-center justify-center rounded border border-line-strong text-ink-2 transition-colors duration-150 hover:border-brand hover:text-ink"
                >
                  <Bookmark size={15} />
                </button>
                <button
                  type="button"
                  aria-label="Share article"
                  className="flex h-9 w-9 items-center justify-center rounded border border-line-strong text-ink-2 transition-colors duration-150 hover:border-brand hover:text-ink"
                >
                  <Share2 size={15} />
                </button>
              </div>
            </div>

            <div className="mt-6 max-w-2xl">
              {article.body.map((paragraph, index) => (
                <p
                  key={index}
                  className={`text-md leading-relaxed ${
                    index === 0 ? 'text-ink' : 'mt-4 text-ink-2'
                  }`}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        </Card>
      </div>
    </>
  );
}
