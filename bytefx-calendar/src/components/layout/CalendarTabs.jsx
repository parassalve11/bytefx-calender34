'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { calendarTabs } from '@/data/navigation';

function tabIsActive(pathname, href) {
  if (href === '/') return pathname === '/';
  if (href.startsWith('/events')) return pathname.startsWith('/events');
  return pathname === href;
}

export default function CalendarTabs() {
  const pathname = usePathname();

  const inSection =
    pathname === '/' || pathname.startsWith('/events') || pathname === '/weekly' || pathname === '/alerts';

  if (!inSection) return null;

  return (
    <div className="border-t border-line bg-surface">
      <nav
        aria-label="Economic calendar sections"
        className="thin-scroll mx-auto flex h-12 max-w-shell items-center gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8"
      >
        {calendarTabs.map((tab) => {
          const active = tabIsActive(pathname, tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? 'page' : undefined}
              className={`whitespace-nowrap rounded px-3.5 py-1.5 text-sm transition-colors duration-150 ${
                active
                  ? 'bg-brand font-semibold text-white'
                  : 'font-medium text-ink-2 hover:bg-subtle hover:text-ink'
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
