'use client';

import { useState } from 'react';

/**
 * Editorial photography from Unsplash.
 *
 * Anything served over a network can fail — offline, blocked, or a retired
 * photo id — so a failed load falls back to a tinted gradient built from the
 * caption rather than leaving a broken image frame in the layout.
 */

const UNSPLASH = 'https://images.unsplash.com';

const GRADIENTS = [
  'linear-gradient(135deg, #1357BC 0%, #0B2E63 100%)',
  'linear-gradient(135deg, #0E7C6B 0%, #073F37 100%)',
  'linear-gradient(135deg, #B0730A 0%, #5C3C05 100%)',
  'linear-gradient(135deg, #7A2E8E 0%, #3B1745 100%)',
  'linear-gradient(135deg, #B23A3A 0%, #5E1D1D 100%)',
  'linear-gradient(135deg, #2F6E8A 0%, #163846 100%)',
];

function gradientFor(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

export default function Photo({ id, alt, caption, width = 1200, className = '', ratio = 'aspect-[16/9]' }) {
  const [failed, setFailed] = useState(false);
  const label = caption ?? alt ?? '';

  return (
    <span className={`relative block overflow-hidden bg-subtle ${ratio} ${className}`}>
      {failed || !id ? (
        <span
          aria-hidden="true"
          className="flex h-full w-full items-end p-4"
          style={{ backgroundImage: gradientFor(label || 'bytefx') }}
        >
          <span className="text-md font-semibold leading-snug text-white/90">{label}</span>
        </span>
      ) : (
        /* eslint-disable-next-line @next/next/no-img-element -- remote editorial
           imagery, already sized by the CDN query string */
        <img
          src={`${UNSPLASH}/${id}?auto=format&fit=crop&w=${width}&q=70`}
          alt={alt ?? ''}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
    </span>
  );
}
