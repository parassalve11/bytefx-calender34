'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, X } from 'lucide-react';
import { mainNav } from '@/data/navigation';
import ThemeToggle from './ThemeToggle';
import CalendarTabs from './CalendarTabs';

function isActive(pathname, href) {
  if (href === '/') {
    return pathname === '/' || pathname.startsWith('/events') || pathname === '/weekly' || pathname === '/alerts';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-raised">
      <div className="mx-auto flex h-16 max-w-shell items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center" aria-label="ByteFX home">
            <Image
              src="/bytefx-logo.png"
              alt="ByteFX"
              width={132}
              height={28}
              priority
              className="h-7 w-auto"
            />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {mainNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex h-16 items-center px-3.5 text-base transition-colors duration-150 ${
                    active
                      ? 'font-semibold text-ink shadow-[inset_0_-2px_0_#4CD301]'
                      : 'font-medium text-ink-2 hover:text-ink'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Search"
            className="hidden h-9 w-9 items-center justify-center rounded text-ink-2 transition-colors duration-150 hover:bg-subtle hover:text-ink sm:flex"
          >
            <Search size={16} strokeWidth={1.8} />
          </button>

          <ThemeToggle />

          <Link
            href="/"
            className="hidden h-9 items-center rounded border border-line-strong px-4 text-base font-medium text-ink transition-colors duration-150 hover:border-brand sm:flex"
          >
            Log in
          </Link>
          <Link
            href="/"
            className="hidden h-9 items-center rounded bg-accent px-4 text-base font-semibold text-accent-ink transition-colors duration-150 hover:bg-accent-hover sm:flex"
          >
            Open account
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="flex h-9 w-9 items-center justify-center rounded border border-line-strong text-ink-2 lg:hidden"
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line px-4 py-3 lg:hidden" aria-label="Mobile">
          <ul className="flex flex-col gap-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded px-3 py-2.5 text-base ${
                    isActive(pathname, item.href)
                      ? 'bg-brand font-semibold text-white'
                      : 'font-medium text-ink-2 hover:bg-subtle hover:text-ink'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2 border-t border-line pt-3">
            <Link
              href="/"
              className="flex h-9 flex-1 items-center justify-center rounded border border-line-strong text-base font-medium text-ink"
            >
              Log in
            </Link>
            <Link
              href="/"
              className="flex h-9 flex-1 items-center justify-center rounded bg-accent text-base font-semibold text-accent-ink"
            >
              Open account
            </Link>
          </div>
        </nav>
      )}

      <CalendarTabs />
    </header>
  );
}
