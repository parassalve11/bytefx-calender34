/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        app: 'var(--bfx-app)',
        surface: 'var(--bfx-surface)',
        subtle: 'var(--bfx-subtle)',
        raised: 'var(--bfx-raised)',
        line: 'var(--bfx-line)',
        'line-strong': 'var(--bfx-line-strong)',
        ink: 'var(--bfx-ink)',
        'ink-2': 'var(--bfx-ink-2)',
        'ink-3': 'var(--bfx-ink-3)',
        pos: 'var(--bfx-pos)',
        neg: 'var(--bfx-neg)',
        brand: {
          DEFAULT: '#1357BC',
          hover: '#1A66D6',
          soft: 'var(--bfx-brand-soft)',
          tint: 'var(--bfx-brand-tint)',
        },
        accent: {
          DEFAULT: '#4CD301',
          hover: '#57EE01',
          ink: '#07260A',
          text: 'var(--bfx-pos)',
        },
        impact: {
          high: '#F04438',
          medium: '#F5A524',
          low: '#4CD301',
          off: 'var(--bfx-impact-off)',
        },
      },
      borderRadius: {
        DEFAULT: '8px',
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px',
      },
      fontSize: {
        '2xs': ['11px', '16px'],
        xs: ['12px', '18px'],
        sm: ['13px', '20px'],
        base: ['14px', '22px'],
        md: ['15px', '24px'],
        lg: ['17px', '26px'],
        xl: ['20px', '28px'],
        '2xl': ['24px', '32px'],
        '3xl': ['30px', '38px'],
        '4xl': ['44px', '52px'],
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      maxWidth: {
        shell: '1440px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 35, 0.04)',
        panel: '0 10px 30px rgba(15, 23, 35, 0.10)',
      },
      transitionDuration: {
        150: '150ms',
      },
    },
  },
  plugins: [],
};
