/**
 * Country flags.
 *
 * Rendered as images from flagcdn.com rather than emoji: emoji flags are simply
 * not present in the Windows system fonts, so an emoji-based calendar shows two
 * grey letters where every flag should be. Non-country codes (metals, crypto,
 * indices) fall back to a tinted monogram chip.
 */

import { countryByCode, symbolMeta } from '@/data/countries';

const SIZES = {
  xs: { w: 16, h: 12, src: 'w20' },
  sm: { w: 20, h: 15, src: 'w40' },
  md: { w: 24, h: 18, src: 'w40' },
  lg: { w: 32, h: 24, src: 'w80' },
  xl: { w: 44, h: 33, src: 'w80' },
};

export default function Flag({ code, size = 'sm', className = '', title }) {
  const dimensions = SIZES[size] ?? SIZES.sm;
  const country = countryByCode[code];

  if (!country) {
    const symbol = symbolMeta[code];
    return (
      <span
        title={title ?? symbol?.label ?? code}
        className={`inline-flex shrink-0 items-center justify-center rounded-sm border border-line text-2xs font-bold leading-none ${className}`}
        style={{
          width: dimensions.w,
          height: dimensions.h,
          color: symbol?.tint ?? 'var(--bfx-ink-2)',
          backgroundColor: 'var(--bfx-subtle)',
        }}
      >
        {symbol?.glyph ?? code.slice(0, 2)}
      </span>
    );
  }

  return (
    /* eslint-disable-next-line @next/next/no-img-element -- flags come from a CDN
       and are far too small to benefit from the image optimiser */
    <img
      src={`https://flagcdn.com/${dimensions.src}/${country.iso}.png`}
      alt=""
      width={dimensions.w}
      height={dimensions.h}
      loading="lazy"
      title={title ?? country.country}
      className={`inline-block shrink-0 rounded-sm border border-line object-cover ${className}`}
      style={{ width: dimensions.w, height: dimensions.h }}
    />
  );
}
