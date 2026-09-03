'use client';

import { Check, ChevronDown, Search, X } from 'lucide-react';

export function Segmented({ options, value, onChange, size = 'md', className = '' }) {
  const pad = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  return (
    <div
      role="tablist"
      className={`inline-flex gap-1 rounded-lg border border-line bg-subtle p-1 ${className}`}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange?.(option.value)}
            className={`whitespace-nowrap rounded transition-colors duration-150 ${pad} ${
              active
                ? 'bg-brand font-semibold text-white'
                : 'font-medium text-ink-2 hover:text-ink'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Accepts either a list of strings or a list of `{ value, label }` objects, so
 * simple option lists stay simple.
 */
export function Select({ label, options, value, onChange, id, className = '', hint }) {
  const items = options.map((option) =>
    typeof option === 'string' ? { value: option, label: option } : option,
  );
  return (
    <div className={className}>
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-ink-3">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          className="w-full cursor-pointer appearance-none rounded border border-line bg-subtle px-3 py-2 pr-9 text-sm font-medium text-ink transition-colors duration-150 hover:border-line-strong focus:border-brand"
        >
          {items.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-3"
        />
      </div>
      {hint ? <p className="mt-1.5 text-2xs text-ink-3">{hint}</p> : null}
    </div>
  );
}

export function Checkbox({ checked, onChange, children, trailing, disabled = false }) {
  return (
    <label
      className={`flex items-center gap-2.5 py-1.5 ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors duration-150 ${
          checked ? 'border-accent bg-accent text-accent-ink' : 'border-line-strong bg-surface'
        }`}
      >
        {checked ? <Check size={11} strokeWidth={3} /> : null}
      </span>
      <span className="min-w-0 flex-1 text-sm text-ink-2">{children}</span>
      {trailing}
    </label>
  );
}

/**
 * A real on/off switch — used anywhere the setting takes effect immediately.
 *
 * Pass `label` for the usual row layout (label and description on the left,
 * switch on the right). Where the caller already renders its own text, pass
 * `srLabel` instead so the control still has an accessible name without the
 * text appearing twice.
 */
export function Toggle({ checked, onChange, label, srLabel, description, id, size = 'md', disabled = false }) {
  const track = size === 'sm' ? 'h-4 w-7' : 'h-5 w-9';
  const knob = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const shift = size === 'sm' ? 'translate-x-3' : 'translate-x-4';

  const control = (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={srLabel ?? (typeof label === 'string' ? label : undefined)}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex shrink-0 items-center rounded-full border transition-colors duration-150 ${track} ${
        checked ? 'border-accent bg-accent' : 'border-line-strong bg-subtle'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      <span
        aria-hidden="true"
        className={`ml-0.5 rounded-full shadow-card transition-transform duration-150 ${knob} ${
          checked ? `${shift} bg-accent-ink` : 'translate-x-0 bg-surface'
        }`}
      />
    </button>
  );

  if (!label) return control;

  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="min-w-0">
        <span className="block text-base font-medium text-ink">{label}</span>
        {description ? <span className="mt-0.5 block text-sm text-ink-3">{description}</span> : null}
      </span>
      {control}
    </div>
  );
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  const styles = {
    primary: 'bg-brand text-white hover:bg-brand-hover',
    accent: 'bg-accent text-accent-ink hover:bg-accent-hover',
    outline: 'border border-line-strong text-ink hover:border-brand',
    subtle: 'border border-line bg-subtle text-ink-2 hover:text-ink',
    ghost: 'text-ink-2 hover:bg-subtle hover:text-ink',
    danger: 'border border-impact-high/40 text-neg hover:bg-impact-high/10',
  };
  const sizes = {
    sm: 'px-2.5 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-md',
  };
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function IconButton({ label, children, active = false, className = '', ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 items-center justify-center rounded border transition-colors duration-150 ${
        active
          ? 'border-brand bg-brand/10 text-brand-soft'
          : 'border-line-strong text-ink-2 hover:border-brand hover:text-ink'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Search', label, id, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-ink-3">
          {label}
        </label>
      ) : null}
      <div className="relative">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
        />
        <input
          id={id}
          type="search"
          value={value}
          aria-label={label ?? placeholder}
          onChange={(event) => onChange?.(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded border border-line bg-subtle py-2 pl-9 pr-8 text-sm text-ink transition-colors duration-150 placeholder:text-ink-3 hover:border-line-strong focus:border-brand"
        />
        {value ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => onChange?.('')}
            className="absolute right-2 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-ink-3 hover:bg-subtle hover:text-ink"
          >
            <X size={12} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function Chip({ children, onRemove, tone = 'neutral', className = '' }) {
  const tones = {
    neutral: 'border-line bg-subtle text-ink-2',
    brand: 'border-brand/25 bg-brand/10 text-brand-soft',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-2xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          className="text-ink-3 transition-colors duration-150 hover:text-neg"
        >
          <X size={11} />
        </button>
      ) : null}
    </span>
  );
}

export function TextInput({ label, id, className = '', hint, ...props }) {
  return (
    <div className={className}>
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-ink-3">
          {label}
        </label>
      ) : null}
      <input
        id={id}
        className="w-full rounded border border-line bg-subtle px-3 py-2 text-sm text-ink transition-colors duration-150 placeholder:text-ink-3 hover:border-line-strong focus:border-brand"
        {...props}
      />
      {hint ? <p className="mt-1.5 text-2xs text-ink-3">{hint}</p> : null}
    </div>
  );
}

/** Radio-style pill group — used for reminder lead times and channels. */
export function OptionPills({ options, value, onChange, multiple = false, className = '' }) {
  const selected = multiple ? value ?? [] : [value];

  function pick(next) {
    if (!multiple) return onChange?.(next);
    return onChange?.(selected.includes(next) ? selected.filter((v) => v !== next) : [...selected, next]);
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {options.map((option) => {
        const active = selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => pick(option.value)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-150 ${
              active
                ? 'border-brand bg-brand/10 text-brand-soft'
                : 'border-line bg-subtle text-ink-2 hover:border-line-strong hover:text-ink'
            }`}
          >
            {option.icon}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
