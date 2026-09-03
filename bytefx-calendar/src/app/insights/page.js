'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Bookmark, Clock, Mail } from 'lucide-react';
import PageHero from '@/components/layout/PageHero';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button, SearchInput, Segmented, TextInput, Toggle } from '@/components/ui/Controls';
import Photo from '@/components/ui/Photo';
import { insightTopics, insights, learnSeries, researchTeam } from '@/data/insights';
import { useAppState } from '@/lib/store';

const LEVEL_TONE = {
  Beginner: 'border-accent/40 bg-accent/10 text-pos',
  Intermediate: 'border-brand/25 bg-brand/10 text-brand-soft',
  Advanced: 'border-impact-high/30 bg-impact-high/10 text-neg',
};

export default function InsightsPage() {
  const { saved, toggleSaved, toast, notifications, updateNotifications } = useAppState();

  const [topic, setTopic] = useState('All');
  const [query, setQuery] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const featured = insights.find((item) => item.featured) ?? insights[0];

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return insights.filter((item) => {
      if (item.id === featured.id) return false;
      if (topic !== 'All' && item.topic !== topic) return false;
      if (!needle) return true;
      return `${item.title} ${item.standfirst} ${item.tags.join(' ')} ${item.author}`
        .toLowerCase()
        .includes(needle);
    });
  }, [topic, query, featured.id]);

  function subscribe(submitEvent) {
    submitEvent.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setEmailError('Enter a valid email address.');
      return;
    }
    setEmailError('');
    setEmail('');
    toast(`Subscribed — the weekly briefing will arrive at ${value}`, 'success');
  }

  return (
    <>
      <PageHero
        title="Market insights"
        description="Research, strategy notes and explainers from the ByteFX desk — the context behind the numbers on the calendar."
        aside={
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search research"
              className="w-full sm:w-64"
            />
            <span className="text-sm text-ink-3">
              {insights.length} pieces · {researchTeam.length} analysts
            </span>
          </div>
        }
      />

      <div className="mx-auto max-w-shell px-4 py-8 sm:px-6 lg:px-8">
        {/* Featured -------------------------------------------------- */}
        <Card className="overflow-hidden">
          <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <Photo
              id={featured.photo}
              alt={featured.title}
              caption={featured.title}
              ratio="aspect-[16/10] lg:aspect-auto lg:h-full"
              width={1400}
            />
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <span className="flex flex-wrap items-center gap-2 text-xs text-ink-3">
                <span className="rounded border border-brand/25 bg-brand/10 px-2 py-0.5 text-2xs font-semibold text-brand-soft">
                  Featured
                </span>
                <span className="rounded border border-line bg-subtle px-2 py-0.5 text-2xs font-medium text-ink-2">
                  {featured.topic}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={11} />
                  {featured.readTime} · {featured.published}
                </span>
              </span>

              <h2 className="mt-4 text-2xl font-bold leading-tight tracking-tight text-ink sm:text-3xl">
                {featured.title}
              </h2>
              <p className="mt-3 text-md leading-relaxed text-ink-2">{featured.standfirst}</p>
              <p className="mt-4 border-l-2 border-accent pl-3 text-base leading-relaxed text-ink-2">
                {featured.excerpt}
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-subtle text-sm font-semibold text-ink-2">
                    {featured.author
                      .split(' ')
                      .map((part) => part[0])
                      .join('')}
                  </span>
                  <span>
                    <span className="block text-base font-semibold text-ink">{featured.author}</span>
                    <span className="block text-sm text-ink-3">{featured.role}</span>
                  </span>
                </span>
                <Button
                  variant={saved.includes(`insight:${featured.id}`) ? 'accent' : 'outline'}
                  onClick={() => {
                    const added = toggleSaved(`insight:${featured.id}`);
                    toast(added ? 'Saved to your reading list' : 'Removed from your reading list', added ? 'success' : 'info');
                  }}
                >
                  <Bookmark size={14} />
                  {saved.includes(`insight:${featured.id}`) ? 'Saved' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Topic filter ----------------------------------------------- */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <Segmented
            options={insightTopics.map((item) => ({ value: item, label: item }))}
            value={topic}
            onChange={setTopic}
            size="sm"
            className="flex-wrap"
          />
          <span className="text-sm text-ink-3">
            {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}
          </span>
        </div>

        {/* Grid -------------------------------------------------------- */}
        <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            {filtered.length === 0 ? (
              <Card className="px-6 py-20 text-center">
                <p className="text-md font-semibold text-ink">Nothing matches that</p>
                <p className="mt-1 text-base text-ink-2">
                  Try another topic, or clear the search to see everything.
                </p>
                <Button
                  variant="outline"
                  className="mt-5"
                  onClick={() => {
                    setTopic('All');
                    setQuery('');
                  }}
                >
                  Clear filters
                </Button>
              </Card>
            ) : (
              <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((item) => {
                  const bookmarked = saved.includes(`insight:${item.id}`);
                  return (
                    <li key={item.id} className="flex">
                      <article className="flex w-full flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-card transition-colors duration-150 hover:border-brand">
                        <Photo id={item.photo} alt={item.title} caption={item.title} width={700} />

                        <div className="flex flex-1 flex-col p-4">
                          <span className="flex items-center gap-2 text-xs text-ink-3">
                            <span className="rounded border border-line bg-subtle px-2 py-0.5 text-2xs font-medium text-ink-2">
                              {item.topic}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock size={10} />
                              {item.readTime}
                            </span>
                          </span>

                          <h3 className="mt-2.5 text-md font-semibold leading-snug text-ink">
                            {item.title}
                          </h3>
                          <p className="mt-2 flex-1 text-base leading-relaxed text-ink-2">
                            {item.standfirst}
                          </p>

                          <ul className="mt-3 flex flex-wrap gap-1.5">
                            {item.tags.map((tag) => (
                              <li
                                key={tag}
                                className="rounded-full border border-line bg-subtle px-2 py-0.5 text-2xs font-medium text-ink-3"
                              >
                                {tag}
                              </li>
                            ))}
                          </ul>

                          <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-ink">
                                {item.author}
                              </span>
                              <span className="block text-2xs text-ink-3">{item.published}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const added = toggleSaved(`insight:${item.id}`);
                                toast(
                                  added ? 'Saved to your reading list' : 'Removed from your reading list',
                                  added ? 'success' : 'info',
                                );
                              }}
                              aria-pressed={bookmarked}
                              aria-label={bookmarked ? `Unsave ${item.title}` : `Save ${item.title}`}
                              className={`shrink-0 transition-colors duration-150 ${
                                bookmarked ? 'text-brand-soft' : 'text-ink-3 hover:text-ink'
                              }`}
                            >
                              <Bookmark size={15} fill={bookmarked ? 'currentColor' : 'none'} />
                            </button>
                          </div>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Rail ------------------------------------------------------ */}
          <aside className="flex flex-col gap-6">
            <Card className="overflow-hidden">
              <CardHeader title="Weekly briefing" />
              <form onSubmit={subscribe} className="px-5 py-4">
                <p className="text-base leading-relaxed text-ink-2">
                  The week ahead, the releases that matter and what the desk is watching — every
                  Sunday evening.
                </p>
                <TextInput
                  id="briefing-email"
                  type="email"
                  label="Email address"
                  value={email}
                  onChange={(changeEvent) => {
                    setEmail(changeEvent.target.value);
                    if (emailError) setEmailError('');
                  }}
                  placeholder="you@example.com"
                  className="mt-4"
                />
                {emailError ? <p className="mt-1.5 text-2xs text-neg">{emailError}</p> : null}

                <Button type="submit" className="mt-3 w-full">
                  <Mail size={14} />
                  Subscribe
                </Button>

                <div className="mt-2 border-t border-line pt-1">
                  <Toggle
                    size="sm"
                    checked={notifications.weeklyDigest}
                    onChange={(value) => updateNotifications({ weeklyDigest: value })}
                    label="Also send the digest in-app"
                  />
                </div>
              </form>
            </Card>

            <Card>
              <CardHeader title="Learn" action={<BookOpen size={14} className="text-ink-3" />} />
              <ul className="px-5 py-3">
                {learnSeries.map((series) => (
                  <li key={series.title} className="border-b border-line py-3 last:border-0">
                    <span className="flex gap-3">
                      <Photo
                        id={series.photo}
                        alt=""
                        caption={series.title}
                        width={200}
                        ratio="aspect-square"
                        className="w-16 shrink-0 rounded-lg"
                      />
                      <span className="min-w-0">
                        <span className="block text-base font-medium leading-snug text-ink">
                          {series.title}
                        </span>
                        <span className="mt-1 block text-sm text-ink-3">
                          {series.lessons} lessons · {series.minutes} min
                        </span>
                        <span
                          className={`mt-1.5 inline-block rounded border px-1.5 py-0.5 text-2xs font-semibold ${LEVEL_TONE[series.level]}`}
                        >
                          {series.level}
                        </span>
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card>
              <CardHeader title="The research desk" />
              <ul className="px-5 py-3">
                {researchTeam.map((member) => (
                  <li
                    key={member.name}
                    className="flex items-center gap-3 border-b border-line py-2.5 last:border-0"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-subtle text-sm font-semibold text-ink-2">
                      {member.initials}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-base font-medium text-ink">
                        {member.name}
                      </span>
                      <span className="block truncate text-sm text-ink-3">{member.focus}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-5">
              <h2 className="text-md font-semibold text-ink">Put it to work</h2>
              <p className="mt-1.5 text-base leading-relaxed text-ink-2">
                Every piece here references releases you can track on the calendar. Set an alert and
                let the data come to you.
              </p>
              <Link
                href="/"
                className="mt-4 inline-flex items-center gap-1.5 text-base font-semibold text-brand-soft hover:underline"
              >
                Open the calendar
                <ArrowRight size={14} />
              </Link>
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}
