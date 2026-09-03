# ByteFX — Economic Calendar

Frontend for the ByteFX Economic Calendar / Market Intelligence product.
Next.js 14 (App Router), JavaScript + JSX, Tailwind CSS. No TypeScript.

All data is static mock data for now; the component layer is written so that
swapping in API calls later touches the files in `src/data/` only.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm start        # serve the production build
```

Node 18.17 or newer.

## Routes

| Route | Screen |
| --- | --- |
| `/` | Economic calendar — filters, events table, market intelligence rail |
| `/events/[id]` | Event detail (e.g. `/events/us-nonfarm-payrolls`) |
| `/weekly` | Weekly overview — heatmap, timeline, themes |
| `/alerts` | Alerts & saved events |
| `/markets` | Markets — instrument pricing |
| `/news` | Market news |

Trade, Insights and Support are intentionally not part of this project.

The calendar section (`/`, `/events/*`, `/weekly`, `/alerts`) shows a secondary
tab bar under the main header. The other routes don't.

## Project structure

```
src/
  app/
    layout.js              root layout, header, theme bootstrap script
    globals.css            Tailwind entry + light/dark colour tokens
    page.js                economic calendar
    events/[id]/page.js    event detail
    weekly/page.js
    alerts/page.js
    markets/page.js
    news/page.js
  components/
    layout/                Header, CalendarTabs, ThemeToggle, PageHero
    ui/                    Card, Controls (Segmented/Select/Checkbox/Button),
                           Indicators (ImpactDots, ImpactBadge, CurrencyFlag,
                           Delta, Value)
    calendar/              FilterSidebar, EventsTable, SideRail
    event/                 HistoricalTrend
  data/
    navigation.js          main nav + calendar tabs
    currencies.js          currency/country metadata, filter options
    economicEvents.js      calendar events, impact levels, view options
    marketIntelligence.js  affected markets, central banks, upcoming releases
    eventDetails.js        per-event detail records
    weekly.js  alerts.js  markets.js  news.js
```

## Theming

Light mode is the default. Colours are CSS custom properties defined in
`globals.css` — `:root` holds the light palette, `.dark` overrides the same
token names with the dark palette. Tailwind maps them to semantic class names
in `tailwind.config.js`:

| Class | Meaning |
| --- | --- |
| `bg-app` | page background |
| `bg-surface` / `bg-subtle` / `bg-raised` | card, hover, header surfaces |
| `border-line` / `border-line-strong` | separators, control borders |
| `text-ink` / `text-ink-2` / `text-ink-3` | primary, secondary, muted text |
| `text-pos` / `text-neg` | beat / miss values |
| `brand`, `accent`, `impact-high/medium/low` | fixed brand and signal colours |

Use these instead of raw colours so both themes stay in sync. The toggle lives
in the header, writes to `localStorage` under `bytefx-theme`, and an inline
script in `layout.js` applies the stored value before first paint so there is
no flash on load.

## Notes for the Figma conversion

- Layout is flexbox and CSS grid only. No absolute positioning for layout, no
  transforms, no canvas, no pseudo-element decoration.
- Consistent scale: spacing on a 4px grid, radii `6/8/10/12px`, one type scale
  defined in `tailwind.config.js`.
- Every section is a `Card` with the same border, radius and shadow, so panels
  map one-to-one onto Figma frames.
- Wide tables scroll inside their own container rather than resizing the page.
  `main` uses `overflow-x: clip` (not `hidden`, which would break the sticky
  header) so that inner scrolling never scrolls the page itself.
- `sr-only` elements inside wide tables need a `relative` ancestor, otherwise
  they are positioned against the page and stretch the document.

## Fonts

Inter is loaded via a stylesheet link in `layout.js` rather than
`next/font/google`, so the production build does not need network access to
fonts.googleapis.com. If you would rather have the font self-hosted and
optimised by Next, switch to `next/font/google` — the build machine will then
need access to Google Fonts.

## Connecting the API later

Each data module exports plain objects and arrays shaped the way the backend is
expected to respond. To go live:

1. Replace the import in a page with a `fetch()` (server component) or a data
   hook (client component).
2. Keep the exported shapes, or update the components that destructure them.
3. The pages that filter (`/`, `/alerts`, `/markets`, `/news`) do so in
   `useMemo` over the imported arrays — move that to query parameters when the
   API supports it.
