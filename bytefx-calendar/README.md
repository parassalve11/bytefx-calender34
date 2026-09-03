# ByteFX — Economic Calendar

Frontend for the ByteFX Economic Calendar / Market Intelligence product.
Next.js 14 (App Router), JavaScript + JSX, Tailwind CSS. No TypeScript.

All data is generated mock data. Rather than a fixed list of dated events, the
app carries a catalog of recurring release *series* (`src/data/eventCatalog.js`)
that `src/lib/calendarEngine.js` expands over whatever date range the UI asks
for, generating actual / forecast / previous figures from a seeded PRNG. Every
date in the calendar is therefore populated, and the same date always produces
the same numbers — on the server, on the client, and on every revisit.

Swapping in a real API later touches `src/lib/calendarEngine.js` and the files
in `src/data/` only; the component layer consumes the event shape it returns.

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
| `/` | Economic calendar — date picker, filters, events table, market rail |
| `/events/[id]` | Event detail. `id` is `seriesId__YYYY-MM-DD` (a specific release) or a bare `seriesId`, which resolves to the next scheduled one |
| `/weekly` | Weekly overview — heatmap, day breakdown, themes |
| `/alerts` | Alerts & saved events, backed by the reminder store |
| `/markets` | Markets — simulated live pricing |
| `/news` | Market news |
| `/insights` | Research and explainers, with Unsplash photography |

Trade and Support are intentionally not part of this project.

The calendar section (`/`, `/events/*`, `/weekly`, `/alerts`) shows a secondary
tab bar under the main header. The other routes don't.

## Project structure

```
src/
  app/
    layout.js              root layout, header, state provider, toaster
    globals.css            Tailwind entry + light/dark colour tokens
    page.js                economic calendar
    events/[id]/page.js    event detail
    weekly/  alerts/  markets/  news/  insights/
  components/
    layout/                Header, CalendarTabs, ThemeToggle, PageHero
    ui/                    Card, Controls (Segmented/Select/Checkbox/Toggle/
                           Button/SearchInput/OptionPills), Indicators, Flag,
                           Photo, Modal, Toaster, DatePicker, CountrySelect
    calendar/              FilterSidebar, EventsTable, SideRail, ReminderDialog
    event/                 HistoricalTrend
  lib/
    calendarEngine.js      expands the catalog into dated events + figures
    datetime.js            ISO-date helpers, formatting, timezone shifting
    seed.js                seeded PRNG — deterministic figures
    store.jsx              reminders, watchlist, preferences (localStorage)
    priceFeed.js           simulated live prices for the markets tables
    useNow.js              ticking clock, mounted flag, dismiss-on-outside
  data/
    navigation.js          main nav + calendar tabs
    countries.js           ~39 countries, regions, central banks, timezones
    eventCatalog.js        ~620 recurring release series and their schedules
    markets.js             instruments, sessions, sentiment
    news.js  insights.js   editorial content
```

### How the calendar data works

`eventCatalog.js` holds hand-written entries for the headline releases (NFP,
CPI, rate decisions and so on), each with a `schedule` rule — "first Friday
monthly", "every six weeks from this anchor", "every Thursday". A second block
of templates is then applied across every country to fill in the routine
statistics each economy publishes, which is what takes a typical weekday from a
handful of events to the twenty-plus a real calendar shows.

`calendarEngine.js` turns those rules into dated events. Figures come from
`seed.js`, keyed on the series id plus the release date, so they are stable and
identical between server and client. Anything with a release time in the past is
marked released and gets an actual; anything ahead of it shows only a forecast.

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

The event shape returned by `buildEvent()` in `calendarEngine.js` is what every
component consumes, so it is the contract to match. To go live:

1. Replace `getEventsInRange(from, to, now)` with a `fetch()` against the real
   calendar endpoint, returning the same event objects.
2. `getEventByKey`, `getSeriesHistory`, `getRelatedEvents` and
   `getAffectedMarkets` are the other four entry points; each maps to an
   obvious endpoint.
3. Filtering currently happens in `useMemo` over the generated list
   (`filterEvents`) — move it to query parameters once the API supports it.
4. `priceFeed.js` is a simulation; swap `useLivePrices` for a WebSocket
   subscription that yields the same decorated quote shape.
5. `store.jsx` persists reminders and the watchlist to localStorage. Point its
   mutators at the user's account instead and the rest of the UI is unchanged.

Two external hosts are used for imagery: `flagcdn.com` for country flags and
`images.unsplash.com` for editorial photography. Flags are images rather than
emoji because emoji flags do not render on Windows; `Photo.jsx` falls back to a
gradient if a photo fails to load.
