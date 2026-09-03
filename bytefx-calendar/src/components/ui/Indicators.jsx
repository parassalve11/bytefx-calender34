import { countryByCode } from '@/data/countries';
import Flag from './Flag';

const IMPACT_COLOR = {
  high: 'bg-impact-high',
  medium: 'bg-impact-medium',
  low: 'bg-impact-low',
};

const IMPACT_FILLED = { high: 3, medium: 2, low: 1 };

const IMPACT_LABEL = { high: 'High impact', medium: 'Medium impact', low: 'Low impact' };

/** Three dots, filled according to impact level — the calendar's core signal. */
export function ImpactDots({ level = 'low', className = '' }) {
  const filled = IMPACT_FILLED[level] ?? 1;
  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      role="img"
      aria-label={IMPACT_LABEL[level]}
      title={IMPACT_LABEL[level]}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${i < filled ? IMPACT_COLOR[level] : 'bg-impact-off'}`}
        />
      ))}
    </span>
  );
}

const BADGE_TONE = {
  high: 'border-impact-high/30 bg-impact-high/10 text-neg',
  medium: 'border-impact-medium/30 bg-impact-medium/10 text-[#B0730A] dark:text-impact-medium',
  low: 'border-impact-low/30 bg-impact-low/10 text-pos',
  neutral: 'border-line bg-subtle text-ink-2',
  brand: 'border-brand/25 bg-brand/10 text-brand-soft',
  accent: 'border-accent/40 bg-accent/10 text-pos',
};

export function Badge({ tone = 'neutral', children, className = '', ...props }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-2xs font-semibold ${
        BADGE_TONE[tone] ?? BADGE_TONE.neutral
      } ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export function ImpactBadge({ level = 'low', withDots = true, className = '' }) {
  return (
    <Badge tone={level} className={className}>
      {IMPACT_LABEL[level]}
      {withDots ? <ImpactDots level={level} /> : null}
    </Badge>
  );
}

/** Flag image + currency code, the standard identifier used in every table. */
export function CurrencyFlag({ code, showCode = true, showCountry = false, size = 'sm', className = '' }) {
  const country = countryByCode[code];
  const label = country?.country ?? code;
  return (
    <span className={`relative inline-flex items-center gap-2 ${className}`}>
      <Flag code={code} size={size} />
      {showCode ? (
        <span className="text-sm font-medium text-ink">{country?.currencyOf ?? code}</span>
      ) : null}
      {showCountry ? <span className="truncate text-sm text-ink-2">{label}</span> : null}
      {!showCode && !showCountry ? <span className="sr-only">{label}</span> : null}
    </span>
  );
}

/** Positive values green, negative red, dashes muted. */
export function Delta({ value, className = '' }) {
  if (value === null || value === undefined || value === '') {
    return <span className={`text-ink-3 ${className}`}>–</span>;
  }
  const negative = String(value).trim().startsWith('-');
  return <span className={`${negative ? 'text-neg' : 'text-pos'} ${className}`}>{value}</span>;
}

/**
 * An actual reading, coloured by whether it beat or missed the forecast rather
 * than by its own sign — which is what a trader is actually looking for.
 */
export function ActualValue({ value, surprise, className = '' }) {
  if (value === null || value === undefined || value === '') {
    return <span className={`text-ink-3 ${className}`}>–</span>;
  }
  const tone =
    surprise === 'beat' ? 'text-pos' : surprise === 'miss' ? 'text-neg' : 'text-ink';
  return (
    <span
      className={`${tone} ${className}`}
      title={
        surprise === 'beat'
          ? 'Better than forecast'
          : surprise === 'miss'
            ? 'Worse than forecast'
            : 'In line with forecast'
      }
    >
      {value}
    </span>
  );
}

export function Value({ value, emphasis = false, className = '' }) {
  if (value === null || value === undefined || value === '') {
    return <span className={`text-ink-3 ${className}`}>–</span>;
  }
  return (
    <span className={`${emphasis ? 'font-semibold text-ink' : 'text-ink-2'} ${className}`}>
      {value}
    </span>
  );
}
