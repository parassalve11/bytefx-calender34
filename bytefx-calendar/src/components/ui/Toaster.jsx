'use client';

import { BellRing, Check, Info, X } from 'lucide-react';
import { useAppState } from '@/lib/store';

const TONE = {
  success: { icon: Check, ring: 'border-accent/50', dot: 'text-pos' },
  reminder: { icon: BellRing, ring: 'border-brand/40', dot: 'text-brand-soft' },
  info: { icon: Info, ring: 'border-line-strong', dot: 'text-ink-2' },
};

/** Bottom-right confirmations for actions that would otherwise be silent. */
export default function Toaster() {
  const { toasts, dismissToast } = useAppState();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2"
    >
      {toasts.map((item) => {
        const tone = TONE[item.tone] ?? TONE.info;
        const Icon = tone.icon;
        return (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border bg-surface px-4 py-3 shadow-panel ${tone.ring}`}
          >
            <Icon size={16} className={`mt-0.5 shrink-0 ${tone.dot}`} />
            <p className="min-w-0 flex-1 text-sm text-ink">{item.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(item.id)}
              aria-label="Dismiss"
              className="shrink-0 text-ink-3 transition-colors duration-150 hover:text-ink"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
