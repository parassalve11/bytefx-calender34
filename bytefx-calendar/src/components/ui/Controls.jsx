'use client';

import { Check, ChevronDown } from 'lucide-react';

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

export function Select({ label, options, value, onChange, id, className = '' }) {
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
          className="w-full appearance-none rounded border border-line bg-subtle px-3 py-2 pr-9 text-sm font-medium text-ink transition-colors duration-150 hover:border-line-strong"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-3"
        />
      </div>
    </div>
  );
}

export function Checkbox({ checked, onChange, children, trailing }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange?.(event.target.checked)}
        className="sr-only"
      />
      <span
        aria-hidden="true"
        className={`flex h-4 w-4 items-center justify-center rounded-sm border transition-colors duration-150 ${
          checked ? 'border-accent bg-accent text-accent-ink' : 'border-line-strong bg-surface'
        }`}
      >
        {checked ? <Check size={11} strokeWidth={3} /> : null}
      </span>
      <span className="flex-1 text-sm text-ink-2">{children}</span>
      {trailing}
    </label>
  );
}

export function Button({ variant = 'primary', className = '', children, ...props }) {
  const styles = {
    primary: 'bg-brand text-white hover:bg-brand-hover',
    accent: 'bg-accent text-accent-ink hover:bg-accent-hover',
    outline: 'border border-line-strong text-ink hover:border-brand',
    ghost: 'text-ink-2 hover:bg-subtle hover:text-ink',
  };
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-base font-semibold transition-colors duration-150 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
