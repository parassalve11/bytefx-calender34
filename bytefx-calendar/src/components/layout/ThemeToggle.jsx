'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.toggle('dark', next === 'dark');
    try {
      localStorage.setItem('bytefx-theme', next);
    } catch (e) {
      /* storage unavailable — the toggle still works for this session */
    }
    setTheme(next);
  }

  const Icon = theme === 'dark' ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`flex h-9 w-9 items-center justify-center rounded border border-line-strong text-ink-2 transition-colors duration-150 hover:border-brand hover:text-ink ${className}`}
    >
      {mounted ? <Icon size={16} strokeWidth={1.8} /> : <span className="h-4 w-4" />}
    </button>
  );
}
