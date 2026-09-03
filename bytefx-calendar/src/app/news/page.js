'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Bookmark, Clock, Share2 } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import { Card } from '@/components/ui/Card';
import { SearchInput, Segmented } from '@/components/ui/Controls';
import { CurrencyFlag } from '@/components/ui/Indicators';
import Photo from '@/components/ui/Photo';
import { newsFeed, newsFilters } from '@/data/news';
import { addDays, formatMedium, relativeDayLabel, todayISO } from '@/lib/datetime';
import { useAppState } from '@/lib/store';

const TAG_TONE = {
  High: 'border-impact-high/30 bg-impact-high/10 text-neg',
  Medium: 'border-impact-medium/30 bg-impact-medium/10 text-[#B0730A] dark:text-impact-medium',
  Speech: 'border-line bg-subtle text-ink-2',
  Preview: 'border-brand/25 bg-brand/10 text-brand-soft',
};

export default function NewsPage() {
  const { saved, toggleSaved, toast } = useAppState();
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState(newsFeed[0].id);

  const today = todayISO();

  /* Date every story relative to today so the wire always reads as current. */
  const stories = useMemo(
    () =>
      newsFeed.map((item) => {
        const date = addDays(today, item.offsetDays);
        return { ...item, date, dayLabel: relativeDayLabel(date, today) };
      }),
    [today],
  );

  const feed = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return stories.filter((item) => {
      if (needle && !`${item.title} ${item.standfirst} ${item.category}`.toLowerCase().includes(needle)) {
        return false;
      }
      if (filter === 'All') return true;
      if (filter === 'Central banks' || filter === 'Commodities' || filter === 'Crypto') {
        return item.category === filter;
      }
      return item.currency === filter;
    });
  }, [stories, filter, query]);

  const article = stories.find((item) => item.id === activeId) ?? feed[0] ?? stories[0];
  const bookmarked = saved.includes(`news:${article.id}`);

  const alsoRead = useMemo(
    () => stories.filter((item) => item.id !== article.id && item.category === article.category).slice(0, 3),
    [stories, article],
  );

  return (
    <>
      <PageHero
        title="Market news"
        description="A running wire of releases, central bank commentary and price action, tagged by the currency it moves."
        aside={
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <span className="inline-flex items-center gap-2 rounded border border-line bg-surface px-3 py-2 text-sm font-medium text-ink">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Live feed · {stories.length} stories
            </span>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search the wire"
              className="w-full sm:w-64"
            />
          </div>
        }
      />

      <div className="mx-auto grid max-w-shell grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:px-8">
        <Card className="lg:sticky lg:top-32 lg:max-h-[calc(100vh-10rem)] lg:self-start lg:overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-md font-semibold text-ink">Latest</h2>
            <span className="text-sm text-ink-3">{feed.length} stories</span>
          </div>

          <div className="border-b border-line px-5 py-3">
            <Segmented
              options={newsFilters.map((item) => ({ value: item, label: item }))}
              value={filter}
              onChange={setFilter}
              size="sm"
              className="flex-wrap"
            />
          </div>

          <ul className="thin-scroll lg:max-h-[58vh] lg:overflow-y-auto">
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
                    <span className="mt-1 block text-xs text-ink-3">{item.dayLabel}</span>
                  </button>
                </li>
              );
            })}
            {feed.length === 0 ? (
              <li className="px-5 py-12 text-center text-base text-ink-3">
                No stories match “{query}”.
              </li>
            ) : null}
          </ul>
        </Card>

        <div className="flex min-w-0 flex-col gap-6">
          <Card className="min-w-0 overflow-hidden">
            <Photo
              id={article.photo}
              alt={article.title}
              caption={article.title}
              ratio="aspect-[21/9]"
              width={1600}
            />

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
                <span className="tabular inline-flex items-center gap-1.5">
                  <Clock size={11} />
                  {formatMedium(article.date)} · {article.time} · {article.readTime}
                </span>
              </div>

              <h1 className="mt-4 max-w-3xl text-2xl font-bold leading-tight tracking-tight text-ink sm:text-3xl">
                {article.title}
              </h1>
              <p className="mt-3 max-w-2xl text-md leading-relaxed text-ink-2">{article.standfirst}</p>

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
                    onClick={() => {
                      const added = toggleSaved(`news:${article.id}`);
                      toast(added ? 'Article saved for later' : 'Article removed', added ? 'success' : 'info');
                    }}
                    aria-pressed={bookmarked}
                    aria-label={bookmarked ? 'Remove bookmark' : 'Save article'}
                    className={`flex h-9 w-9 items-center justify-center rounded border transition-colors duration-150 ${
                      bookmarked
                        ? 'border-brand bg-brand/10 text-brand-soft'
                        : 'border-line-strong text-ink-2 hover:border-brand hover:text-ink'
                    }`}
                  >
                    <Bookmark size={15} fill={bookmarked ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toast('Article link copied to your clipboard', 'success')}
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
                    className={`text-md leading-relaxed ${index === 0 ? 'text-ink' : 'mt-4 text-ink-2'}`}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-2 border-t border-line pt-5">
                <Link
                  href="/"
                  className="rounded border border-line-strong px-3 py-1.5 text-sm font-medium text-ink transition-colors duration-150 hover:border-brand"
                >
                  See the calendar
                </Link>
                <Link
                  href="/markets"
                  className="rounded border border-line-strong px-3 py-1.5 text-sm font-medium text-ink transition-colors duration-150 hover:border-brand"
                >
                  Open {article.currency} markets
                </Link>
              </div>
            </article>
          </Card>

          {alsoRead.length > 0 ? (
            <section>
              <h2 className="text-md font-semibold text-ink">More in {article.category}</h2>
              <ul className="mt-3 grid gap-4 sm:grid-cols-3">
                {alsoRead.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(item.id)}
                      className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-line bg-surface text-left shadow-card transition-colors duration-150 hover:border-brand"
                    >
                      <Photo id={item.photo} alt={item.title} caption={item.title} width={600} />
                      <span className="flex flex-1 flex-col p-4">
                        <span className="flex items-center gap-2 text-xs text-ink-3">
                          <CurrencyFlag code={item.currency} />
                          <span className="tabular">{item.dayLabel}</span>
                        </span>
                        <span className="mt-2 text-base font-semibold leading-snug text-ink">
                          {item.title}
                        </span>
                        <span className="mt-2 text-sm text-ink-3">{item.readTime}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}
