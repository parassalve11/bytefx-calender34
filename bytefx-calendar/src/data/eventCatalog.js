/**
 * The catalog of recurring economic releases.
 *
 * Each entry describes an event *series* rather than a single dated event —
 * `schedule` says when it recurs, and `value` describes the shape of the number
 * it prints. `lib/calendarEngine.js` expands these over any date range and
 * generates the actual / forecast / previous figures deterministically, so any
 * day the user navigates to is populated with plausible data.
 *
 * schedule types
 *   monthlyNth  { weekday, nth }        nth weekday of every month (-1 = last)
 *   monthlyDay  { day }                 fixed day of month, pushed off weekends
 *   weekly      { weekday }             every week
 *   quarterly   { months, day }         given months (0-indexed), fixed day
 *   quarterlyNth{ months, weekday, nth }
 *   interval    { weeks, anchor }       every n weeks from an anchor date
 *   annual      { dates: ['MM-DD'] }    same calendar dates each year
 *
 * value
 *   base    centre of the distribution
 *   swing   how far a print typically strays from base
 *   dp      decimal places
 *   unit    suffix ('%', 'K', 'M', 'B', '')
 *   prefix  '$' etc.
 *   signed  show a leading + on positive values
 *   grouped thousands separators
 */

import { countries } from './countries';
import { hashString } from '@/lib/seed';

const primaryEvents = [
  /* ------------------------------------------------------------------ */
  /* United States                                                       */
  /* ------------------------------------------------------------------ */
  { id: 'us-nonfarm-payrolls', title: 'Nonfarm Payrolls', currency: 'USD', category: 'Employment', impact: 'high', time: '12:30', schedule: { type: 'monthlyNth', weekday: 5, nth: 1 }, value: { base: 175, swing: 95, dp: 0, unit: 'K', signed: true }, source: 'Bureau of Labor Statistics', period: 'prevMonth', revised: true,
    description: 'Measures the change in the number of people employed during the previous month, excluding the farming industry. It is the single most closely watched indicator of U.S. labour market health.',
    why: [
      { title: 'Monetary policy', body: 'Strong job growth supports higher rates for longer; a weak print pulls forward expectations of easing.' },
      { title: 'Market volatility', body: 'Historically one of the highest-volatility events of the month for USD pairs, indices and gold.' },
      { title: 'Economic health', body: 'Reflects business confidence, consumer spending potential and overall momentum in the economy.' },
    ] },
  { id: 'us-unemployment-rate', title: 'Unemployment Rate', currency: 'USD', category: 'Employment', impact: 'high', time: '12:30', schedule: { type: 'monthlyNth', weekday: 5, nth: 1 }, value: { base: 4.2, swing: 0.3, dp: 1, unit: '%' }, source: 'Bureau of Labor Statistics', period: 'prevMonth',
    description: 'The share of the labour force that is unemployed and actively seeking work. Released alongside nonfarm payrolls.' },
  { id: 'us-average-hourly-earnings', title: 'Average Hourly Earnings (MoM)', currency: 'USD', category: 'Employment', impact: 'high', time: '12:30', schedule: { type: 'monthlyNth', weekday: 5, nth: 1 }, value: { base: 0.3, swing: 0.2, dp: 1, unit: '%' }, source: 'Bureau of Labor Statistics', period: 'prevMonth',
    description: 'Wage growth for private non-farm employees. A key input to the inflation outlook because wages feed directly into services prices.' },
  { id: 'us-participation-rate', title: 'Labor Force Participation Rate', currency: 'USD', category: 'Employment', impact: 'low', time: '12:30', schedule: { type: 'monthlyNth', weekday: 5, nth: 1 }, value: { base: 62.5, swing: 0.3, dp: 1, unit: '%' }, source: 'Bureau of Labor Statistics', period: 'prevMonth' },
  { id: 'us-cpi-mom', title: 'CPI (MoM)', currency: 'USD', category: 'Inflation', impact: 'high', time: '12:30', schedule: { type: 'monthlyDay', day: 12 }, value: { base: 0.25, swing: 0.2, dp: 1, unit: '%' }, source: 'Bureau of Labor Statistics', period: 'prevMonth',
    description: 'Change in the price of goods and services purchased by consumers. The headline inflation print, and the biggest single driver of front-end rate expectations.',
    why: [
      { title: 'Rate expectations', body: 'A 0.1pp surprise in either direction routinely repricing the entire Fed path for the year.' },
      { title: 'Real yields', body: 'Feeds directly into the inflation breakevens that anchor gold and long-dated Treasuries.' },
    ] },
  { id: 'us-core-cpi-mom', title: 'Core CPI (MoM)', currency: 'USD', category: 'Inflation', impact: 'high', time: '12:30', schedule: { type: 'monthlyDay', day: 12 }, value: { base: 0.28, swing: 0.15, dp: 1, unit: '%' }, source: 'Bureau of Labor Statistics', period: 'prevMonth',
    description: 'Consumer prices excluding food and energy. The cleaner read on underlying inflation and the number the Fed actually watches.' },
  { id: 'us-cpi-yoy', title: 'CPI (YoY)', currency: 'USD', category: 'Inflation', impact: 'high', time: '12:30', schedule: { type: 'monthlyDay', day: 12 }, value: { base: 2.9, swing: 0.4, dp: 1, unit: '%' }, source: 'Bureau of Labor Statistics', period: 'prevMonth' },
  { id: 'us-ppi-mom', title: 'PPI (MoM)', currency: 'USD', category: 'Inflation', impact: 'medium', time: '12:30', schedule: { type: 'monthlyDay', day: 14 }, value: { base: 0.2, swing: 0.3, dp: 1, unit: '%' }, source: 'Bureau of Labor Statistics', period: 'prevMonth',
    description: 'Producer prices — inflation at the factory gate, and a leading indicator for consumer prices a few months out.' },
  { id: 'us-core-pce', title: 'Core PCE Price Index (YoY)', currency: 'USD', category: 'Inflation', impact: 'high', time: '12:30', schedule: { type: 'monthlyDay', day: 27 }, value: { base: 2.7, swing: 0.3, dp: 1, unit: '%' }, source: 'Bureau of Economic Analysis', period: 'prevMonth',
    description: 'The Federal Reserve’s preferred inflation gauge. Broader coverage and a more flexible basket than CPI, which is why the FOMC targets it.',
    why: [
      { title: 'The Fed’s target', body: 'The 2% objective is defined against this series, not CPI.' },
      { title: 'Slower to move', body: 'Because the basket adjusts for substitution, it typically runs a few tenths below CPI.' },
    ] },
  { id: 'us-personal-spending', title: 'Personal Spending (MoM)', currency: 'USD', category: 'Consumer', impact: 'medium', time: '12:30', schedule: { type: 'monthlyDay', day: 27 }, value: { base: 0.4, swing: 0.3, dp: 1, unit: '%' }, source: 'Bureau of Economic Analysis', period: 'prevMonth' },
  { id: 'us-personal-income', title: 'Personal Income (MoM)', currency: 'USD', category: 'Consumer', impact: 'low', time: '12:30', schedule: { type: 'monthlyDay', day: 27 }, value: { base: 0.4, swing: 0.25, dp: 1, unit: '%' }, source: 'Bureau of Economic Analysis', period: 'prevMonth' },
  { id: 'us-retail-sales', title: 'Retail Sales (MoM)', currency: 'USD', category: 'Consumer', impact: 'high', time: '12:30', schedule: { type: 'monthlyDay', day: 16 }, value: { base: 0.35, swing: 0.6, dp: 1, unit: '%' }, source: 'Census Bureau', period: 'prevMonth',
    description: 'The primary gauge of U.S. consumer spending, which accounts for roughly two thirds of overall economic activity.' },
  { id: 'us-core-retail-sales', title: 'Core Retail Sales (MoM)', currency: 'USD', category: 'Consumer', impact: 'medium', time: '12:30', schedule: { type: 'monthlyDay', day: 16 }, value: { base: 0.3, swing: 0.5, dp: 1, unit: '%' }, source: 'Census Bureau', period: 'prevMonth',
    description: 'Retail sales excluding automobiles, which swing the headline around month to month.' },
  { id: 'us-ism-manufacturing', title: 'ISM Manufacturing PMI', currency: 'USD', category: 'PMI & surveys', impact: 'high', time: '14:00', schedule: { type: 'monthlyNth', weekday: 1, nth: 1 }, value: { base: 49.2, swing: 2.2, dp: 1, unit: '' }, source: 'Institute for Supply Management', period: 'currentMonth',
    description: 'Survey of purchasing managers at U.S. factories. Readings above 50 signal expansion, below 50 contraction.' },
  { id: 'us-ism-services', title: 'ISM Services PMI', currency: 'USD', category: 'PMI & surveys', impact: 'high', time: '14:00', schedule: { type: 'monthlyNth', weekday: 3, nth: 1 }, value: { base: 52.4, swing: 2.4, dp: 1, unit: '' }, source: 'Institute for Supply Management', period: 'currentMonth',
    description: 'The services counterpart to the ISM manufacturing survey. Services are the larger share of the economy, so this print usually moves markets more.' },
  { id: 'us-sp-manufacturing-flash', title: 'S&P Global Manufacturing PMI', currency: 'USD', category: 'PMI & surveys', impact: 'medium', time: '13:45', schedule: { type: 'monthlyDay', day: 23 }, value: { base: 50.8, swing: 2, dp: 1, unit: '' }, source: 'S&P Global', period: 'currentMonth', preliminary: true },
  { id: 'us-sp-services-flash', title: 'S&P Global Services PMI', currency: 'USD', category: 'PMI & surveys', impact: 'medium', time: '13:45', schedule: { type: 'monthlyDay', day: 23 }, value: { base: 53.1, swing: 2.2, dp: 1, unit: '' }, source: 'S&P Global', period: 'currentMonth', preliminary: true },
  { id: 'us-gdp-advance', title: 'GDP (QoQ) — Advance', currency: 'USD', category: 'GDP & growth', impact: 'high', time: '12:30', schedule: { type: 'quarterly', months: [0, 3, 6, 9], day: 30 }, value: { base: 2.3, swing: 1.1, dp: 1, unit: '%' }, source: 'Bureau of Economic Analysis', period: 'prevQuarter', preliminary: true,
    description: 'First estimate of quarterly economic growth, annualised. Revised twice over the following two months as fuller source data arrives.' },
  { id: 'us-gdp-second', title: 'GDP (QoQ) — Second estimate', currency: 'USD', category: 'GDP & growth', impact: 'medium', time: '12:30', schedule: { type: 'quarterly', months: [1, 4, 7, 10], day: 28 }, value: { base: 2.3, swing: 0.8, dp: 1, unit: '%' }, source: 'Bureau of Economic Analysis', period: 'prevQuarter' },
  { id: 'us-jobless-claims', title: 'Initial Jobless Claims', currency: 'USD', category: 'Employment', impact: 'medium', time: '12:30', schedule: { type: 'weekly', weekday: 4 }, value: { base: 222, swing: 18, dp: 0, unit: 'K' }, source: 'Department of Labor', period: 'week',
    description: 'Weekly count of new claims for unemployment insurance. The highest-frequency read on the labour market, so the four-week average matters more than any single week.' },
  { id: 'us-continuing-claims', title: 'Continuing Jobless Claims', currency: 'USD', category: 'Employment', impact: 'low', time: '12:30', schedule: { type: 'weekly', weekday: 4 }, value: { base: 1890, swing: 60, dp: 0, unit: 'K', grouped: true }, source: 'Department of Labor', period: 'week' },
  { id: 'us-adp-employment', title: 'ADP Non-Farm Employment Change', currency: 'USD', category: 'Employment', impact: 'medium', time: '12:15', schedule: { type: 'monthlyNth', weekday: 3, nth: 1 }, value: { base: 145, swing: 75, dp: 0, unit: 'K', signed: true }, source: 'ADP Research Institute', period: 'prevMonth',
    description: 'Private payrolls estimate published two days before the official figure. A weak historical correlation with NFP, but it still moves rates on the day.' },
  { id: 'us-jolts', title: 'JOLTS Job Openings', currency: 'USD', category: 'Employment', impact: 'medium', time: '14:00', schedule: { type: 'monthlyDay', day: 4 }, value: { base: 7.4, swing: 0.4, dp: 2, unit: 'M' }, source: 'Bureau of Labor Statistics', period: 'twoMonthsBack' },
  { id: 'us-durable-goods', title: 'Durable Goods Orders (MoM)', currency: 'USD', category: 'Manufacturing', impact: 'medium', time: '12:30', schedule: { type: 'monthlyDay', day: 26 }, value: { base: 0.4, swing: 4.5, dp: 1, unit: '%' }, source: 'Census Bureau', period: 'prevMonth',
    description: 'Orders for long-lasting manufactured goods. Aircraft orders make the headline series extremely volatile month to month.' },
  { id: 'us-core-durable-goods', title: 'Core Durable Goods Orders (MoM)', currency: 'USD', category: 'Manufacturing', impact: 'medium', time: '12:30', schedule: { type: 'monthlyDay', day: 26 }, value: { base: 0.2, swing: 0.5, dp: 1, unit: '%' }, source: 'Census Bureau', period: 'prevMonth',
    description: 'Durable goods orders excluding transport — a cleaner read on business investment intentions.' },
  { id: 'us-industrial-production', title: 'Industrial Production (MoM)', currency: 'USD', category: 'Manufacturing', impact: 'low', time: '13:15', schedule: { type: 'monthlyDay', day: 17 }, value: { base: 0.2, swing: 0.5, dp: 1, unit: '%' }, source: 'Federal Reserve', period: 'prevMonth' },
  { id: 'us-capacity-utilization', title: 'Capacity Utilization Rate', currency: 'USD', category: 'Manufacturing', impact: 'low', time: '13:15', schedule: { type: 'monthlyDay', day: 17 }, value: { base: 77.4, swing: 0.6, dp: 1, unit: '%' }, source: 'Federal Reserve', period: 'prevMonth' },
  { id: 'us-empire-state', title: 'Empire State Manufacturing Index', currency: 'USD', category: 'PMI & surveys', impact: 'low', time: '12:30', schedule: { type: 'monthlyDay', day: 15 }, value: { base: 1.2, swing: 12, dp: 1, unit: '', signed: true }, source: 'New York Fed', period: 'currentMonth' },
  { id: 'us-philly-fed', title: 'Philadelphia Fed Manufacturing Index', currency: 'USD', category: 'PMI & surveys', impact: 'medium', time: '12:30', schedule: { type: 'monthlyNth', weekday: 4, nth: 3 }, value: { base: 4.6, swing: 11, dp: 1, unit: '', signed: true }, source: 'Philadelphia Fed', period: 'currentMonth' },
  { id: 'us-chicago-pmi', title: 'Chicago PMI', currency: 'USD', category: 'PMI & surveys', impact: 'low', time: '13:45', schedule: { type: 'monthlyDay', day: 30 }, value: { base: 46.8, swing: 3.5, dp: 1, unit: '' }, source: 'ISM-Chicago', period: 'currentMonth' },
  { id: 'us-cb-consumer-confidence', title: 'CB Consumer Confidence', currency: 'USD', category: 'Consumer', impact: 'high', time: '14:00', schedule: { type: 'monthlyNth', weekday: 2, nth: -1 }, value: { base: 98.4, swing: 5, dp: 1, unit: '' }, source: 'The Conference Board', period: 'currentMonth',
    description: 'Household confidence in the economy and the labour market. Confidence leads discretionary spending by a quarter or two.' },
  { id: 'us-michigan-sentiment', title: 'Michigan Consumer Sentiment', currency: 'USD', category: 'Consumer', impact: 'medium', time: '15:00', schedule: { type: 'monthlyNth', weekday: 5, nth: -1 }, value: { base: 62.5, swing: 5, dp: 1, unit: '' }, source: 'University of Michigan', period: 'currentMonth' },
  { id: 'us-michigan-inflation-expectations', title: 'Michigan 5-Year Inflation Expectations', currency: 'USD', category: 'Inflation', impact: 'medium', time: '15:00', schedule: { type: 'monthlyNth', weekday: 5, nth: -1 }, value: { base: 3.3, swing: 0.3, dp: 1, unit: '%' }, source: 'University of Michigan', period: 'currentMonth',
    description: 'Long-run household inflation expectations. Fed officials cite this series directly when arguing that expectations remain anchored.' },
  { id: 'us-existing-home-sales', title: 'Existing Home Sales', currency: 'USD', category: 'Housing', impact: 'medium', time: '14:00', schedule: { type: 'monthlyDay', day: 21 }, value: { base: 4.06, swing: 0.2, dp: 2, unit: 'M' }, source: 'National Association of Realtors', period: 'prevMonth' },
  { id: 'us-new-home-sales', title: 'New Home Sales', currency: 'USD', category: 'Housing', impact: 'low', time: '14:00', schedule: { type: 'monthlyDay', day: 24 }, value: { base: 672, swing: 45, dp: 0, unit: 'K' }, source: 'Census Bureau', period: 'prevMonth' },
  { id: 'us-pending-home-sales', title: 'Pending Home Sales (MoM)', currency: 'USD', category: 'Housing', impact: 'low', time: '14:00', schedule: { type: 'monthlyDay', day: 29 }, value: { base: 0.3, swing: 2.5, dp: 1, unit: '%' }, source: 'National Association of Realtors', period: 'prevMonth' },
  { id: 'us-building-permits', title: 'Building Permits', currency: 'USD', category: 'Housing', impact: 'medium', time: '12:30', schedule: { type: 'monthlyDay', day: 18 }, value: { base: 1.42, swing: 0.08, dp: 2, unit: 'M' }, source: 'Census Bureau', period: 'prevMonth' },
  { id: 'us-housing-starts', title: 'Housing Starts', currency: 'USD', category: 'Housing', impact: 'low', time: '12:30', schedule: { type: 'monthlyDay', day: 18 }, value: { base: 1.36, swing: 0.09, dp: 2, unit: 'M' }, source: 'Census Bureau', period: 'prevMonth' },
  { id: 'us-case-shiller', title: 'S&P/Case-Shiller Home Price Index (YoY)', currency: 'USD', category: 'Housing', impact: 'low', time: '13:00', schedule: { type: 'monthlyDay', day: 25 }, value: { base: 4.1, swing: 0.8, dp: 1, unit: '%' }, source: 'S&P Dow Jones Indices', period: 'twoMonthsBack' },
  { id: 'us-trade-balance', title: 'Trade Balance', currency: 'USD', category: 'Trade & current account', impact: 'low', time: '12:30', schedule: { type: 'monthlyDay', day: 5 }, value: { base: -71.2, swing: 6, dp: 1, unit: 'B', prefix: '$' }, source: 'Census Bureau', period: 'twoMonthsBack' },
  { id: 'us-fed-rate-decision', title: 'Fed Interest Rate Decision', currency: 'USD', category: 'Interest rates', impact: 'high', time: '18:00', schedule: { type: 'interval', weeks: 6, anchor: '2026-01-28' }, value: { base: 4.5, swing: 0, dp: 2, unit: '%', policy: true }, source: 'Federal Reserve', period: 'none',
    description: 'The FOMC’s decision on the federal funds target range, together with the policy statement and, at alternate meetings, the updated dot plot.',
    why: [
      { title: 'The anchor rate', body: 'Every dollar-denominated asset is priced off this rate, so a surprise repositions the entire curve.' },
      { title: 'The statement matters more', body: 'With the decision itself usually pre-priced, the wording changes and the press conference drive the move.' },
    ] },
  { id: 'us-fomc-press-conference', title: 'FOMC Press Conference', currency: 'USD', category: 'Interest rates', impact: 'high', time: '18:30', schedule: { type: 'interval', weeks: 6, anchor: '2026-01-28' }, type: 'speech', source: 'Federal Reserve', period: 'none',
    description: 'The Fed Chair takes questions on the decision. Historically the higher-volatility half of the event.' },
  { id: 'us-fomc-minutes', title: 'FOMC Meeting Minutes', currency: 'USD', category: 'Interest rates', impact: 'medium', time: '18:00', schedule: { type: 'interval', weeks: 6, anchor: '2026-02-18' }, type: 'minutes', source: 'Federal Reserve', period: 'none',
    description: 'Full account of the discussion at the meeting three weeks earlier, including the range of views on the committee.' },
  { id: 'us-powell-speaks', title: 'Fed Chair Powell Speaks', currency: 'USD', category: 'Speeches', impact: 'high', time: '16:00', schedule: { type: 'interval', weeks: 3, anchor: '2026-01-13' }, type: 'speech', source: 'Federal Reserve', period: 'none',
    description: 'Remarks from the Federal Reserve Chair. Any comment on the inflation path or the policy rate is watched closely.' },
  { id: 'us-fed-member-speaks', title: 'FOMC Member Speaks', currency: 'USD', category: 'Speeches', impact: 'medium', time: '15:30', schedule: { type: 'weekly', weekday: 2 }, type: 'speech', source: 'Federal Reserve', period: 'none', rotate: ['Williams', 'Waller', 'Bowman', 'Jefferson', 'Cook', 'Barr', 'Kugler', 'Daly', 'Goolsbee', 'Bostic', 'Logan', 'Kashkari'],
    description: 'Scheduled remarks from a voting member of the Federal Open Market Committee.' },
  { id: 'us-beige-book', title: 'Beige Book', currency: 'USD', category: 'Interest rates', impact: 'low', time: '19:00', schedule: { type: 'interval', weeks: 6, anchor: '2026-01-14' }, type: 'report', source: 'Federal Reserve', period: 'none' },
  { id: 'us-fed-balance-sheet', title: 'Fed Balance Sheet', currency: 'USD', category: 'Interest rates', impact: 'low', time: '20:30', schedule: { type: 'weekly', weekday: 4 }, value: { base: 6.62, swing: 0.03, dp: 2, unit: 'T', prefix: '$' }, source: 'Federal Reserve', period: 'week' },
  { id: 'us-crude-inventories', title: 'Crude Oil Inventories', currency: 'USD', category: 'Energy & inventories', impact: 'medium', time: '14:30', schedule: { type: 'weekly', weekday: 3 }, value: { base: -0.6, swing: 4.2, dp: 3, unit: 'M', signed: true }, source: 'Energy Information Administration', period: 'week',
    description: 'Weekly change in U.S. commercial crude stockpiles. The main scheduled driver of intraday oil volatility.' },
  { id: 'us-natgas-storage', title: 'Natural Gas Storage', currency: 'USD', category: 'Energy & inventories', impact: 'low', time: '14:30', schedule: { type: 'weekly', weekday: 4 }, value: { base: 48, swing: 40, dp: 0, unit: 'B', signed: true }, source: 'Energy Information Administration', period: 'week' },
  { id: 'us-10y-auction', title: '10-Year Note Auction', currency: 'USD', category: 'Bond auctions', impact: 'low', time: '17:00', schedule: { type: 'monthlyDay', day: 11 }, value: { base: 4.28, swing: 0.25, dp: 2, unit: '%' }, source: 'U.S. Treasury', period: 'none' },
  { id: 'us-30y-auction', title: '30-Year Bond Auction', currency: 'USD', category: 'Bond auctions', impact: 'low', time: '17:00', schedule: { type: 'monthlyDay', day: 12 }, value: { base: 4.71, swing: 0.25, dp: 2, unit: '%' }, source: 'U.S. Treasury', period: 'none' },
  { id: 'us-factory-orders', title: 'Factory Orders (MoM)', currency: 'USD', category: 'Manufacturing', impact: 'low', time: '14:00', schedule: { type: 'monthlyDay', day: 3 }, value: { base: 0.3, swing: 2.4, dp: 1, unit: '%' }, source: 'Census Bureau', period: 'twoMonthsBack' },

  /* ------------------------------------------------------------------ */
  /* Euro area                                                           */
  /* ------------------------------------------------------------------ */
  { id: 'eu-ecb-rate-decision', title: 'ECB Interest Rate Decision', currency: 'EUR', category: 'Interest rates', impact: 'high', time: '12:15', schedule: { type: 'interval', weeks: 6, anchor: '2026-01-29' }, value: { base: 2.15, swing: 0, dp: 2, unit: '%', policy: true }, source: 'European Central Bank', period: 'none',
    description: 'The Governing Council’s decision on the deposit facility rate, the rate that actually sets the floor for euro money markets.',
    why: [
      { title: 'The euro’s anchor', body: 'The gap between this rate and the Fed funds rate is the dominant medium-term driver of EUR/USD.' },
      { title: 'Two-part event', body: 'The decision lands at 12:15 GMT, the press conference 45 minutes later — the second half is usually the mover.' },
    ] },
  { id: 'eu-ecb-press-conference', title: 'ECB Press Conference', currency: 'EUR', category: 'Interest rates', impact: 'high', time: '13:00', schedule: { type: 'interval', weeks: 6, anchor: '2026-01-29' }, type: 'speech', source: 'European Central Bank', period: 'none' },
  { id: 'eu-ecb-accounts', title: 'ECB Monetary Policy Meeting Accounts', currency: 'EUR', category: 'Interest rates', impact: 'medium', time: '11:30', schedule: { type: 'interval', weeks: 6, anchor: '2026-02-19' }, type: 'minutes', source: 'European Central Bank', period: 'none' },
  { id: 'eu-lagarde-speaks', title: 'ECB President Lagarde Speaks', currency: 'EUR', category: 'Speeches', impact: 'high', time: '09:00', schedule: { type: 'interval', weeks: 3, anchor: '2026-01-15' }, type: 'speech', source: 'European Central Bank', period: 'none' },
  { id: 'eu-ecb-member-speaks', title: 'ECB Member Speaks', currency: 'EUR', category: 'Speeches', impact: 'low', time: '08:30', schedule: { type: 'weekly', weekday: 1 }, type: 'speech', source: 'European Central Bank', period: 'none', rotate: ['Lane', 'Schnabel', 'de Guindos', 'Villeroy', 'Nagel', 'Knot', 'Panetta', 'Centeno'] },
  { id: 'eu-cpi-flash-yoy', title: 'CPI (YoY) — Flash', currency: 'EUR', category: 'Inflation', impact: 'high', time: '10:00', schedule: { type: 'monthlyNth', weekday: 2, nth: -1 }, value: { base: 2.2, swing: 0.4, dp: 1, unit: '%' }, source: 'Eurostat', period: 'currentMonth', preliminary: true,
    description: 'Flash estimate of euro-area harmonised consumer inflation, published on the last working days of the month it covers.' },
  { id: 'eu-core-cpi-flash', title: 'Core CPI (YoY) — Flash', currency: 'EUR', category: 'Inflation', impact: 'high', time: '10:00', schedule: { type: 'monthlyNth', weekday: 2, nth: -1 }, value: { base: 2.4, swing: 0.3, dp: 1, unit: '%' }, source: 'Eurostat', period: 'currentMonth', preliminary: true },
  { id: 'eu-hicp-final', title: 'HICP (YoY) — Final', currency: 'EUR', category: 'Inflation', impact: 'low', time: '10:00', schedule: { type: 'monthlyDay', day: 18 }, value: { base: 2.2, swing: 0.1, dp: 1, unit: '%' }, source: 'Eurostat', period: 'prevMonth' },
  { id: 'eu-hcob-manufacturing-flash', title: 'HCOB Manufacturing PMI — Flash', currency: 'EUR', category: 'PMI & surveys', impact: 'medium', time: '09:00', schedule: { type: 'monthlyDay', day: 23 }, value: { base: 48.6, swing: 1.8, dp: 1, unit: '' }, source: 'HCOB / S&P Global', period: 'currentMonth', preliminary: true,
    description: 'Flash reading of euro-area factory activity. Below 50 signals contraction; the direction of travel matters more than the level.' },
  { id: 'eu-hcob-services-flash', title: 'HCOB Services PMI — Flash', currency: 'EUR', category: 'PMI & surveys', impact: 'medium', time: '09:00', schedule: { type: 'monthlyDay', day: 23 }, value: { base: 51.4, swing: 1.6, dp: 1, unit: '' }, source: 'HCOB / S&P Global', period: 'currentMonth', preliminary: true },
  { id: 'eu-hcob-composite-flash', title: 'HCOB Composite PMI — Flash', currency: 'EUR', category: 'PMI & surveys', impact: 'low', time: '09:00', schedule: { type: 'monthlyDay', day: 23 }, value: { base: 50.6, swing: 1.5, dp: 1, unit: '' }, source: 'HCOB / S&P Global', period: 'currentMonth', preliminary: true },
  { id: 'eu-gdp-flash', title: 'GDP (QoQ) — Flash', currency: 'EUR', category: 'GDP & growth', impact: 'high', time: '10:00', schedule: { type: 'quarterly', months: [0, 3, 6, 9], day: 30 }, value: { base: 0.3, swing: 0.3, dp: 1, unit: '%' }, source: 'Eurostat', period: 'prevQuarter', preliminary: true },
  { id: 'eu-unemployment-rate', title: 'Unemployment Rate', currency: 'EUR', category: 'Employment', impact: 'medium', time: '10:00', schedule: { type: 'monthlyDay', day: 2 }, value: { base: 6.3, swing: 0.2, dp: 1, unit: '%' }, source: 'Eurostat', period: 'twoMonthsBack' },
  { id: 'eu-retail-sales', title: 'Retail Sales (MoM)', currency: 'EUR', category: 'Consumer', impact: 'low', time: '10:00', schedule: { type: 'monthlyDay', day: 6 }, value: { base: 0.2, swing: 0.6, dp: 1, unit: '%' }, source: 'Eurostat', period: 'twoMonthsBack' },
  { id: 'eu-industrial-production', title: 'Industrial Production (MoM)', currency: 'EUR', category: 'Manufacturing', impact: 'low', time: '10:00', schedule: { type: 'monthlyDay', day: 13 }, value: { base: 0.1, swing: 1.4, dp: 1, unit: '%' }, source: 'Eurostat', period: 'twoMonthsBack' },
  { id: 'eu-zew-sentiment', title: 'ZEW Economic Sentiment', currency: 'EUR', category: 'PMI & surveys', impact: 'medium', time: '10:00', schedule: { type: 'monthlyNth', weekday: 2, nth: 2 }, value: { base: 22.4, swing: 12, dp: 1, unit: '', signed: true }, source: 'ZEW', period: 'currentMonth' },
  { id: 'eu-sentix', title: 'Sentix Investor Confidence', currency: 'EUR', category: 'PMI & surveys', impact: 'low', time: '09:30', schedule: { type: 'monthlyNth', weekday: 1, nth: 1 }, value: { base: -6.4, swing: 6, dp: 1, unit: '', signed: true }, source: 'Sentix', period: 'currentMonth' },
  { id: 'eu-consumer-confidence', title: 'Consumer Confidence — Flash', currency: 'EUR', category: 'Consumer', impact: 'low', time: '15:00', schedule: { type: 'monthlyDay', day: 22 }, value: { base: -14.2, swing: 1.6, dp: 1, unit: '', signed: true }, source: 'European Commission', period: 'currentMonth', preliminary: true },
  { id: 'eu-trade-balance', title: 'Trade Balance', currency: 'EUR', category: 'Trade & current account', impact: 'low', time: '10:00', schedule: { type: 'monthlyDay', day: 15 }, value: { base: 16.4, swing: 5, dp: 1, unit: 'B', prefix: '€' }, source: 'Eurostat', period: 'twoMonthsBack' },
  { id: 'eu-ppi', title: 'PPI (MoM)', currency: 'EUR', category: 'Inflation', impact: 'low', time: '10:00', schedule: { type: 'monthlyDay', day: 4 }, value: { base: 0.1, swing: 0.7, dp: 1, unit: '%' }, source: 'Eurostat', period: 'twoMonthsBack' },

  /* --- Germany ------------------------------------------------------- */
  { id: 'de-ifo-business-climate', title: 'German Ifo Business Climate', currency: 'DEM', category: 'PMI & surveys', impact: 'medium', time: '09:00', schedule: { type: 'monthlyDay', day: 25 }, value: { base: 87.6, swing: 2, dp: 1, unit: '' }, source: 'Ifo Institute', period: 'currentMonth',
    description: 'Survey of around 9,000 German firms on current conditions and expectations. The most watched single sentiment gauge in the euro area.' },
  { id: 'de-zew-sentiment', title: 'German ZEW Economic Sentiment', currency: 'DEM', category: 'PMI & surveys', impact: 'medium', time: '10:00', schedule: { type: 'monthlyNth', weekday: 2, nth: 2 }, value: { base: 18.6, swing: 12, dp: 1, unit: '', signed: true }, source: 'ZEW', period: 'currentMonth' },
  { id: 'de-cpi-prelim', title: 'German CPI (MoM) — Preliminary', currency: 'DEM', category: 'Inflation', impact: 'medium', time: '13:00', schedule: { type: 'monthlyNth', weekday: 1, nth: -1 }, value: { base: 0.2, swing: 0.3, dp: 1, unit: '%' }, source: 'Destatis', period: 'currentMonth', preliminary: true },
  { id: 'de-factory-orders', title: 'German Factory Orders (MoM)', currency: 'DEM', category: 'Manufacturing', impact: 'low', time: '07:00', schedule: { type: 'monthlyDay', day: 6 }, value: { base: 0.4, swing: 3.4, dp: 1, unit: '%' }, source: 'Destatis', period: 'twoMonthsBack' },
  { id: 'de-industrial-production', title: 'German Industrial Production (MoM)', currency: 'DEM', category: 'Manufacturing', impact: 'low', time: '07:00', schedule: { type: 'monthlyDay', day: 8 }, value: { base: 0.1, swing: 1.8, dp: 1, unit: '%' }, source: 'Destatis', period: 'twoMonthsBack' },
  { id: 'de-hcob-manufacturing', title: 'German HCOB Manufacturing PMI', currency: 'DEM', category: 'PMI & surveys', impact: 'medium', time: '08:30', schedule: { type: 'monthlyDay', day: 23 }, value: { base: 47.8, swing: 2, dp: 1, unit: '' }, source: 'HCOB / S&P Global', period: 'currentMonth', preliminary: true },
  { id: 'de-unemployment-change', title: 'German Unemployment Change', currency: 'DEM', category: 'Employment', impact: 'medium', time: '08:55', schedule: { type: 'monthlyNth', weekday: 3, nth: -1 }, value: { base: 8, swing: 16, dp: 0, unit: 'K', signed: true }, source: 'Bundesagentur für Arbeit', period: 'currentMonth' },
  { id: 'de-gfk-consumer-climate', title: 'German GfK Consumer Climate', currency: 'DEM', category: 'Consumer', impact: 'low', time: '07:00', schedule: { type: 'monthlyDay', day: 27 }, value: { base: -22.4, swing: 2.5, dp: 1, unit: '', signed: true }, source: 'GfK', period: 'nextMonth' },
  { id: 'de-trade-balance', title: 'German Trade Balance', currency: 'DEM', category: 'Trade & current account', impact: 'low', time: '07:00', schedule: { type: 'monthlyDay', day: 9 }, value: { base: 18.2, swing: 3.5, dp: 1, unit: 'B', prefix: '€' }, source: 'Destatis', period: 'twoMonthsBack' },
  { id: 'de-retail-sales', title: 'German Retail Sales (MoM)', currency: 'DEM', category: 'Consumer', impact: 'low', time: '07:00', schedule: { type: 'monthlyDay', day: 31 }, value: { base: 0.2, swing: 1.4, dp: 1, unit: '%' }, source: 'Destatis', period: 'prevMonth' },

  /* --- France / Italy / Spain ---------------------------------------- */
  { id: 'fr-cpi-prelim', title: 'French CPI (MoM) — Preliminary', currency: 'FRF', category: 'Inflation', impact: 'low', time: '07:45', schedule: { type: 'monthlyNth', weekday: 5, nth: -1 }, value: { base: 0.2, swing: 0.3, dp: 1, unit: '%' }, source: 'INSEE', period: 'currentMonth', preliminary: true },
  { id: 'fr-consumer-spending', title: 'French Consumer Spending (MoM)', currency: 'FRF', category: 'Consumer', impact: 'low', time: '07:45', schedule: { type: 'monthlyDay', day: 28 }, value: { base: 0.2, swing: 1.1, dp: 1, unit: '%' }, source: 'INSEE', period: 'prevMonth' },
  { id: 'fr-hcob-services', title: 'French HCOB Services PMI', currency: 'FRF', category: 'PMI & surveys', impact: 'low', time: '08:15', schedule: { type: 'monthlyDay', day: 23 }, value: { base: 49.6, swing: 1.8, dp: 1, unit: '' }, source: 'HCOB / S&P Global', period: 'currentMonth', preliminary: true },
  { id: 'it-cpi', title: 'Italian CPI (MoM)', currency: 'ITL', category: 'Inflation', impact: 'low', time: '09:00', schedule: { type: 'monthlyNth', weekday: 5, nth: -1 }, value: { base: 0.1, swing: 0.3, dp: 1, unit: '%' }, source: 'Istat', period: 'currentMonth', preliminary: true },
  { id: 'it-industrial-production', title: 'Italian Industrial Production (MoM)', currency: 'ITL', category: 'Manufacturing', impact: 'low', time: '09:00', schedule: { type: 'monthlyDay', day: 10 }, value: { base: 0, swing: 1.4, dp: 1, unit: '%' }, source: 'Istat', period: 'twoMonthsBack' },
  { id: 'es-cpi', title: 'Spanish CPI (YoY) — Flash', currency: 'ESP', category: 'Inflation', impact: 'low', time: '08:00', schedule: { type: 'monthlyNth', weekday: 5, nth: -1 }, value: { base: 2.4, swing: 0.4, dp: 1, unit: '%' }, source: 'INE', period: 'currentMonth', preliminary: true },
  { id: 'es-unemployment-change', title: 'Spanish Unemployment Change', currency: 'ESP', category: 'Employment', impact: 'low', time: '08:00', schedule: { type: 'monthlyDay', day: 2 }, value: { base: -12, swing: 30, dp: 1, unit: 'K', signed: true }, source: 'Ministerio de Trabajo', period: 'prevMonth' },

  /* ------------------------------------------------------------------ */
  /* United Kingdom                                                      */
  /* ------------------------------------------------------------------ */
  { id: 'gb-boe-rate-decision', title: 'BoE Interest Rate Decision', currency: 'GBP', category: 'Interest rates', impact: 'high', time: '11:00', schedule: { type: 'interval', weeks: 6, anchor: '2026-02-05' }, value: { base: 4.0, swing: 0, dp: 2, unit: '%', policy: true }, source: 'Bank of England', period: 'none',
    description: 'The Monetary Policy Committee’s Bank Rate decision, published with the vote split and the minutes of the meeting.',
    why: [
      { title: 'The vote split', body: 'A 9-0 versus a 5-4 vote can move sterling more than the decision itself.' },
      { title: 'Same-day minutes', body: 'Unlike the Fed and ECB, the BoE publishes the meeting minutes at the same moment as the decision.' },
    ] },
  { id: 'gb-mpc-vote', title: 'MPC Official Bank Rate Votes', currency: 'GBP', category: 'Interest rates', impact: 'high', time: '11:00', schedule: { type: 'interval', weeks: 6, anchor: '2026-02-05' }, type: 'report', source: 'Bank of England', period: 'none' },
  { id: 'gb-bailey-speaks', title: 'BoE Gov Bailey Speaks', currency: 'GBP', category: 'Speeches', impact: 'high', time: '10:00', schedule: { type: 'interval', weeks: 3, anchor: '2026-01-20' }, type: 'speech', source: 'Bank of England', period: 'none' },
  { id: 'gb-mpc-member-speaks', title: 'MPC Member Speaks', currency: 'GBP', category: 'Speeches', impact: 'low', time: '13:00', schedule: { type: 'weekly', weekday: 3 }, type: 'speech', source: 'Bank of England', period: 'none', rotate: ['Pill', 'Ramsden', 'Mann', 'Greene', 'Dhingra', 'Lombardelli', 'Breeden'] },
  { id: 'gb-cpi-yoy', title: 'CPI (YoY)', currency: 'GBP', category: 'Inflation', impact: 'high', time: '07:00', schedule: { type: 'monthlyNth', weekday: 3, nth: 3 }, value: { base: 3.4, swing: 0.4, dp: 1, unit: '%' }, source: 'Office for National Statistics', period: 'prevMonth',
    description: 'UK headline consumer inflation. Services inflation within the release is what the MPC actually reacts to.' },
  { id: 'gb-core-cpi-yoy', title: 'Core CPI (YoY)', currency: 'GBP', category: 'Inflation', impact: 'high', time: '07:00', schedule: { type: 'monthlyNth', weekday: 3, nth: 3 }, value: { base: 3.6, swing: 0.3, dp: 1, unit: '%' }, source: 'Office for National Statistics', period: 'prevMonth' },
  { id: 'gb-rpi', title: 'RPI (YoY)', currency: 'GBP', category: 'Inflation', impact: 'low', time: '07:00', schedule: { type: 'monthlyNth', weekday: 3, nth: 3 }, value: { base: 4.2, swing: 0.4, dp: 1, unit: '%' }, source: 'Office for National Statistics', period: 'prevMonth' },
  { id: 'gb-retail-sales', title: 'Retail Sales (MoM)', currency: 'GBP', category: 'Consumer', impact: 'high', time: '07:00', schedule: { type: 'monthlyNth', weekday: 5, nth: 3 }, value: { base: 0.2, swing: 0.8, dp: 1, unit: '%' }, source: 'Office for National Statistics', period: 'prevMonth',
    description: 'Month-on-month change in the volume of retail sales — the primary gauge of UK consumer spending.' },
  { id: 'gb-gdp-mom', title: 'GDP (MoM)', currency: 'GBP', category: 'GDP & growth', impact: 'medium', time: '07:00', schedule: { type: 'monthlyDay', day: 12 }, value: { base: 0.1, swing: 0.3, dp: 1, unit: '%' }, source: 'Office for National Statistics', period: 'twoMonthsBack',
    description: 'The UK is one of the few major economies to publish a monthly GDP estimate, which makes the quarterly figure far less of a surprise.' },
  { id: 'gb-gdp-qoq', title: 'GDP (QoQ) — Preliminary', currency: 'GBP', category: 'GDP & growth', impact: 'high', time: '07:00', schedule: { type: 'quarterly', months: [1, 4, 7, 10], day: 12 }, value: { base: 0.3, swing: 0.3, dp: 1, unit: '%' }, source: 'Office for National Statistics', period: 'prevQuarter', preliminary: true },
  { id: 'gb-claimant-count', title: 'Claimant Count Change', currency: 'GBP', category: 'Employment', impact: 'medium', time: '07:00', schedule: { type: 'monthlyNth', weekday: 2, nth: 2 }, value: { base: 12.4, swing: 22, dp: 1, unit: 'K', signed: true }, source: 'Office for National Statistics', period: 'prevMonth' },
  { id: 'gb-unemployment-rate', title: 'Unemployment Rate', currency: 'GBP', category: 'Employment', impact: 'medium', time: '07:00', schedule: { type: 'monthlyNth', weekday: 2, nth: 2 }, value: { base: 4.7, swing: 0.2, dp: 1, unit: '%' }, source: 'Office for National Statistics', period: 'threeMonthsBack' },
  { id: 'gb-average-earnings', title: 'Average Earnings Index +Bonus (3m/YoY)', currency: 'GBP', category: 'Employment', impact: 'high', time: '07:00', schedule: { type: 'monthlyNth', weekday: 2, nth: 2 }, value: { base: 4.8, swing: 0.4, dp: 1, unit: '%' }, source: 'Office for National Statistics', period: 'threeMonthsBack',
    description: 'UK wage growth. The MPC has repeatedly named this series as the single indicator it needs to see cool before cutting further.' },
  { id: 'gb-sp-manufacturing', title: 'S&P Global Manufacturing PMI', currency: 'GBP', category: 'PMI & surveys', impact: 'medium', time: '08:30', schedule: { type: 'monthlyDay', day: 23 }, value: { base: 48.4, swing: 2, dp: 1, unit: '' }, source: 'S&P Global / CIPS', period: 'currentMonth', preliminary: true },
  { id: 'gb-sp-services', title: 'S&P Global Services PMI', currency: 'GBP', category: 'PMI & surveys', impact: 'medium', time: '08:30', schedule: { type: 'monthlyDay', day: 23 }, value: { base: 51.8, swing: 1.8, dp: 1, unit: '' }, source: 'S&P Global / CIPS', period: 'currentMonth', preliminary: true },
  { id: 'gb-halifax-hpi', title: 'Halifax House Price Index (MoM)', currency: 'GBP', category: 'Housing', impact: 'low', time: '07:00', schedule: { type: 'monthlyDay', day: 7 }, value: { base: 0.2, swing: 0.8, dp: 1, unit: '%' }, source: 'Halifax', period: 'prevMonth' },
  { id: 'gb-nationwide-hpi', title: 'Nationwide House Price Index (MoM)', currency: 'GBP', category: 'Housing', impact: 'low', time: '07:00', schedule: { type: 'monthlyDay', day: 1 }, value: { base: 0.2, swing: 0.7, dp: 1, unit: '%' }, source: 'Nationwide', period: 'prevMonth' },
  { id: 'gb-brc-retail', title: 'BRC Retail Sales Monitor (YoY)', currency: 'GBP', category: 'Consumer', impact: 'low', time: '00:01', schedule: { type: 'monthlyNth', weekday: 2, nth: 1 }, value: { base: 1.8, swing: 1.6, dp: 1, unit: '%' }, source: 'British Retail Consortium', period: 'prevMonth' },
  { id: 'gb-gfk-confidence', title: 'GfK Consumer Confidence', currency: 'GBP', category: 'Consumer', impact: 'low', time: '00:01', schedule: { type: 'monthlyNth', weekday: 5, nth: 3 }, value: { base: -18.4, swing: 3, dp: 0, unit: '', signed: true }, source: 'GfK', period: 'currentMonth' },
  { id: 'gb-public-borrowing', title: 'Public Sector Net Borrowing', currency: 'GBP', category: 'Government & fiscal', impact: 'low', time: '07:00', schedule: { type: 'monthlyDay', day: 20 }, value: { base: 14.8, swing: 5, dp: 1, unit: 'B', prefix: '£' }, source: 'Office for National Statistics', period: 'prevMonth' },
  { id: 'gb-manufacturing-production', title: 'Manufacturing Production (MoM)', currency: 'GBP', category: 'Manufacturing', impact: 'low', time: '07:00', schedule: { type: 'monthlyDay', day: 12 }, value: { base: 0, swing: 1.2, dp: 1, unit: '%' }, source: 'Office for National Statistics', period: 'twoMonthsBack' },

  /* ------------------------------------------------------------------ */
  /* Japan                                                               */
  /* ------------------------------------------------------------------ */
  { id: 'jp-boj-policy-rate', title: 'BoJ Policy Rate', currency: 'JPY', category: 'Interest rates', impact: 'high', time: '03:00', schedule: { type: 'interval', weeks: 7, anchor: '2026-01-23' }, value: { base: 0.5, swing: 0, dp: 2, unit: '%', policy: true }, source: 'Bank of Japan', period: 'none',
    description: 'The Bank of Japan’s short-term policy rate. After decades at or below zero, each move is a genuine event for global carry trades.',
    why: [
      { title: 'The carry trade', body: 'Japan funds a large share of global carry positions; a hike unwinds them and moves every yen cross at once.' },
      { title: 'No fixed release time', body: 'The BoJ announces when discussion concludes, which is what makes the window around it so volatile.' },
    ] },
  { id: 'jp-boj-press-conference', title: 'BoJ Press Conference', currency: 'JPY', category: 'Interest rates', impact: 'high', time: '06:30', schedule: { type: 'interval', weeks: 7, anchor: '2026-01-23' }, type: 'speech', source: 'Bank of Japan', period: 'none' },
  { id: 'jp-boj-summary', title: 'BoJ Summary of Opinions', currency: 'JPY', category: 'Interest rates', impact: 'low', time: '23:50', schedule: { type: 'interval', weeks: 7, anchor: '2026-02-02' }, type: 'minutes', source: 'Bank of Japan', period: 'none' },
  { id: 'jp-national-core-cpi', title: 'National Core CPI (YoY)', currency: 'JPY', category: 'Inflation', impact: 'high', time: '23:30', schedule: { type: 'monthlyNth', weekday: 4, nth: 3 }, value: { base: 2.8, swing: 0.3, dp: 1, unit: '%' }, source: 'Statistics Bureau of Japan', period: 'prevMonth',
    description: 'Japan’s headline inflation gauge excluding fresh food. The Bank of Japan’s normalisation path is priced directly off this series.' },
  { id: 'jp-tokyo-core-cpi', title: 'Tokyo Core CPI (YoY)', currency: 'JPY', category: 'Inflation', impact: 'medium', time: '23:30', schedule: { type: 'monthlyNth', weekday: 4, nth: -1 }, value: { base: 2.6, swing: 0.3, dp: 1, unit: '%' }, source: 'Statistics Bureau of Japan', period: 'currentMonth',
    description: 'Tokyo prices are published three weeks ahead of the national figure and reliably lead it, which makes this the earlier tradeable signal.' },
  { id: 'jp-gdp-prelim', title: 'GDP (QoQ) — Preliminary', currency: 'JPY', category: 'GDP & growth', impact: 'high', time: '23:50', schedule: { type: 'quarterly', months: [1, 4, 7, 10], day: 14 }, value: { base: 0.2, swing: 0.5, dp: 1, unit: '%' }, source: 'Cabinet Office', period: 'prevQuarter', preliminary: true },
  { id: 'jp-tankan-manufacturing', title: 'Tankan Large Manufacturers Index', currency: 'JPY', category: 'PMI & surveys', impact: 'medium', time: '23:50', schedule: { type: 'quarterly', months: [0, 3, 6, 9], day: 1 }, value: { base: 13, swing: 4, dp: 0, unit: '', signed: true }, source: 'Bank of Japan', period: 'currentQuarter' },
  { id: 'jp-jibun-manufacturing', title: 'au Jibun Bank Manufacturing PMI', currency: 'JPY', category: 'PMI & surveys', impact: 'low', time: '00:30', schedule: { type: 'monthlyDay', day: 23 }, value: { base: 49.4, swing: 1.6, dp: 1, unit: '' }, source: 'au Jibun Bank / S&P Global', period: 'currentMonth', preliminary: true },
  { id: 'jp-industrial-production', title: 'Industrial Production (MoM) — Preliminary', currency: 'JPY', category: 'Manufacturing', impact: 'low', time: '23:50', schedule: { type: 'monthlyNth', weekday: 5, nth: -1 }, value: { base: 0.2, swing: 2.5, dp: 1, unit: '%' }, source: 'METI', period: 'prevMonth', preliminary: true },
  { id: 'jp-retail-sales', title: 'Retail Sales (YoY)', currency: 'JPY', category: 'Consumer', impact: 'low', time: '23:50', schedule: { type: 'monthlyNth', weekday: 3, nth: -1 }, value: { base: 2.2, swing: 1.4, dp: 1, unit: '%' }, source: 'METI', period: 'prevMonth' },
  { id: 'jp-unemployment-rate', title: 'Unemployment Rate', currency: 'JPY', category: 'Employment', impact: 'low', time: '23:30', schedule: { type: 'monthlyNth', weekday: 4, nth: -1 }, value: { base: 2.5, swing: 0.2, dp: 1, unit: '%' }, source: 'Statistics Bureau of Japan', period: 'prevMonth' },
  { id: 'jp-household-spending', title: 'Household Spending (YoY)', currency: 'JPY', category: 'Consumer', impact: 'low', time: '23:30', schedule: { type: 'monthlyDay', day: 6 }, value: { base: 1.2, swing: 2.2, dp: 1, unit: '%' }, source: 'Statistics Bureau of Japan', period: 'twoMonthsBack' },
  { id: 'jp-trade-balance', title: 'Trade Balance', currency: 'JPY', category: 'Trade & current account', impact: 'low', time: '23:50', schedule: { type: 'monthlyDay', day: 17 }, value: { base: -320, swing: 420, dp: 0, unit: 'B', prefix: '¥', signed: true }, source: 'Ministry of Finance', period: 'prevMonth' },
  { id: 'jp-machinery-orders', title: 'Core Machinery Orders (MoM)', currency: 'JPY', category: 'Manufacturing', impact: 'low', time: '23:50', schedule: { type: 'monthlyDay', day: 15 }, value: { base: 0.5, swing: 4.5, dp: 1, unit: '%' }, source: 'Cabinet Office', period: 'twoMonthsBack' },

  /* ------------------------------------------------------------------ */
  /* Australia & New Zealand                                             */
  /* ------------------------------------------------------------------ */
  { id: 'au-rba-rate-decision', title: 'RBA Interest Rate Decision', currency: 'AUD', category: 'Interest rates', impact: 'high', time: '03:30', schedule: { type: 'interval', weeks: 6, anchor: '2026-02-03' }, value: { base: 3.6, swing: 0, dp: 2, unit: '%', policy: true }, source: 'Reserve Bank of Australia', period: 'none',
    description: 'The RBA cash rate decision, now published together with the statement and followed by a press conference.' },
  { id: 'au-rba-statement', title: 'RBA Rate Statement', currency: 'AUD', category: 'Interest rates', impact: 'high', time: '03:30', schedule: { type: 'interval', weeks: 6, anchor: '2026-02-03' }, type: 'report', source: 'Reserve Bank of Australia', period: 'none' },
  { id: 'au-rba-minutes', title: 'RBA Meeting Minutes', currency: 'AUD', category: 'Interest rates', impact: 'medium', time: '00:30', schedule: { type: 'interval', weeks: 6, anchor: '2026-02-17' }, type: 'minutes', source: 'Reserve Bank of Australia', period: 'none' },
  { id: 'au-cpi-qoq', title: 'CPI (QoQ)', currency: 'AUD', category: 'Inflation', impact: 'high', time: '00:30', schedule: { type: 'quarterly', months: [0, 3, 6, 9], day: 29 }, value: { base: 0.8, swing: 0.3, dp: 1, unit: '%' }, source: 'Australian Bureau of Statistics', period: 'prevQuarter' },
  { id: 'au-trimmed-mean-cpi', title: 'Trimmed Mean CPI (QoQ)', currency: 'AUD', category: 'Inflation', impact: 'high', time: '00:30', schedule: { type: 'quarterly', months: [0, 3, 6, 9], day: 29 }, value: { base: 0.7, swing: 0.2, dp: 1, unit: '%' }, source: 'Australian Bureau of Statistics', period: 'prevQuarter',
    description: 'The RBA’s preferred underlying inflation measure — it strips the largest price moves in both directions rather than fixed categories.' },
  { id: 'au-monthly-cpi', title: 'Monthly CPI Indicator (YoY)', currency: 'AUD', category: 'Inflation', impact: 'medium', time: '00:30', schedule: { type: 'monthlyNth', weekday: 3, nth: -1 }, value: { base: 2.9, swing: 0.5, dp: 1, unit: '%' }, source: 'Australian Bureau of Statistics', period: 'prevMonth' },
  { id: 'au-employment-change', title: 'Employment Change', currency: 'AUD', category: 'Employment', impact: 'high', time: '00:30', schedule: { type: 'monthlyNth', weekday: 4, nth: 3 }, value: { base: 24, swing: 30, dp: 1, unit: 'K', signed: true }, source: 'Australian Bureau of Statistics', period: 'prevMonth' },
  { id: 'au-unemployment-rate', title: 'Unemployment Rate', currency: 'AUD', category: 'Employment', impact: 'high', time: '00:30', schedule: { type: 'monthlyNth', weekday: 4, nth: 3 }, value: { base: 4.3, swing: 0.2, dp: 1, unit: '%' }, source: 'Australian Bureau of Statistics', period: 'prevMonth' },
  { id: 'au-retail-sales', title: 'Retail Sales (MoM)', currency: 'AUD', category: 'Consumer', impact: 'medium', time: '00:30', schedule: { type: 'monthlyDay', day: 4 }, value: { base: 0.3, swing: 0.6, dp: 1, unit: '%' }, source: 'Australian Bureau of Statistics', period: 'twoMonthsBack' },
  { id: 'au-gdp-qoq', title: 'GDP (QoQ)', currency: 'AUD', category: 'GDP & growth', impact: 'high', time: '00:30', schedule: { type: 'quarterly', months: [2, 5, 8, 11], day: 4 }, value: { base: 0.5, swing: 0.3, dp: 1, unit: '%' }, source: 'Australian Bureau of Statistics', period: 'prevQuarter' },
  { id: 'au-trade-balance', title: 'Trade Balance', currency: 'AUD', category: 'Trade & current account', impact: 'low', time: '00:30', schedule: { type: 'monthlyDay', day: 5 }, value: { base: 5.2, swing: 2, dp: 2, unit: 'B', prefix: 'A$' }, source: 'Australian Bureau of Statistics', period: 'twoMonthsBack' },
  { id: 'au-building-approvals', title: 'Building Approvals (MoM)', currency: 'AUD', category: 'Housing', impact: 'low', time: '00:30', schedule: { type: 'monthlyDay', day: 3 }, value: { base: 0.4, swing: 5, dp: 1, unit: '%' }, source: 'Australian Bureau of Statistics', period: 'twoMonthsBack' },
  { id: 'au-wage-price-index', title: 'Wage Price Index (QoQ)', currency: 'AUD', category: 'Employment', impact: 'medium', time: '00:30', schedule: { type: 'quarterly', months: [1, 4, 7, 10], day: 19 }, value: { base: 0.8, swing: 0.2, dp: 1, unit: '%' }, source: 'Australian Bureau of Statistics', period: 'prevQuarter' },
  { id: 'au-nab-business-confidence', title: 'NAB Business Confidence', currency: 'AUD', category: 'PMI & surveys', impact: 'low', time: '00:30', schedule: { type: 'monthlyNth', weekday: 2, nth: 2 }, value: { base: 4, swing: 4, dp: 0, unit: '', signed: true }, source: 'National Australia Bank', period: 'prevMonth' },
  { id: 'nz-rbnz-rate-decision', title: 'RBNZ Interest Rate Decision', currency: 'NZD', category: 'Interest rates', impact: 'high', time: '01:00', schedule: { type: 'interval', weeks: 7, anchor: '2026-02-18' }, value: { base: 3.0, swing: 0, dp: 2, unit: '%', policy: true }, source: 'Reserve Bank of New Zealand', period: 'none' },
  { id: 'nz-cpi-qoq', title: 'CPI (QoQ)', currency: 'NZD', category: 'Inflation', impact: 'high', time: '21:45', schedule: { type: 'quarterly', months: [0, 3, 6, 9], day: 16 }, value: { base: 0.7, swing: 0.3, dp: 1, unit: '%' }, source: 'Stats NZ', period: 'prevQuarter' },
  { id: 'nz-employment-change', title: 'Employment Change (QoQ)', currency: 'NZD', category: 'Employment', impact: 'high', time: '21:45', schedule: { type: 'quarterly', months: [1, 4, 7, 10], day: 4 }, value: { base: 0.2, swing: 0.4, dp: 1, unit: '%' }, source: 'Stats NZ', period: 'prevQuarter' },
  { id: 'nz-gdp-qoq', title: 'GDP (QoQ)', currency: 'NZD', category: 'GDP & growth', impact: 'high', time: '21:45', schedule: { type: 'quarterly', months: [2, 5, 8, 11], day: 18 }, value: { base: 0.4, swing: 0.5, dp: 1, unit: '%' }, source: 'Stats NZ', period: 'prevQuarter' },
  { id: 'nz-trade-balance', title: 'Trade Balance', currency: 'NZD', category: 'Trade & current account', impact: 'low', time: '21:45', schedule: { type: 'monthlyDay', day: 24 }, value: { base: -680, swing: 500, dp: 0, unit: 'M', prefix: 'NZ$', signed: true }, source: 'Stats NZ', period: 'prevMonth' },
  { id: 'nz-anz-business-confidence', title: 'ANZ Business Confidence', currency: 'NZD', category: 'PMI & surveys', impact: 'low', time: '01:00', schedule: { type: 'monthlyNth', weekday: 4, nth: -1 }, value: { base: 42, swing: 8, dp: 1, unit: '', signed: true }, source: 'ANZ', period: 'currentMonth' },

  /* ------------------------------------------------------------------ */
  /* Canada & Switzerland                                                */
  /* ------------------------------------------------------------------ */
  { id: 'ca-boc-rate-decision', title: 'BoC Interest Rate Decision', currency: 'CAD', category: 'Interest rates', impact: 'high', time: '14:45', schedule: { type: 'interval', weeks: 6, anchor: '2026-01-28' }, value: { base: 2.75, swing: 0, dp: 2, unit: '%', policy: true }, source: 'Bank of Canada', period: 'none' },
  { id: 'ca-boc-press-conference', title: 'BoC Press Conference', currency: 'CAD', category: 'Interest rates', impact: 'medium', time: '15:30', schedule: { type: 'interval', weeks: 6, anchor: '2026-01-28' }, type: 'speech', source: 'Bank of Canada', period: 'none' },
  { id: 'ca-cpi-yoy', title: 'CPI (YoY)', currency: 'CAD', category: 'Inflation', impact: 'high', time: '13:30', schedule: { type: 'monthlyNth', weekday: 2, nth: 3 }, value: { base: 2.4, swing: 0.4, dp: 1, unit: '%' }, source: 'Statistics Canada', period: 'prevMonth' },
  { id: 'ca-core-cpi', title: 'Core CPI (MoM)', currency: 'CAD', category: 'Inflation', impact: 'medium', time: '13:30', schedule: { type: 'monthlyNth', weekday: 2, nth: 3 }, value: { base: 0.2, swing: 0.3, dp: 1, unit: '%' }, source: 'Statistics Canada', period: 'prevMonth' },
  { id: 'ca-employment-change', title: 'Employment Change', currency: 'CAD', category: 'Employment', impact: 'high', time: '13:30', schedule: { type: 'monthlyNth', weekday: 5, nth: 1 }, value: { base: 22, swing: 40, dp: 1, unit: 'K', signed: true }, source: 'Statistics Canada', period: 'prevMonth' },
  { id: 'ca-unemployment-rate', title: 'Unemployment Rate', currency: 'CAD', category: 'Employment', impact: 'high', time: '13:30', schedule: { type: 'monthlyNth', weekday: 5, nth: 1 }, value: { base: 6.9, swing: 0.2, dp: 1, unit: '%' }, source: 'Statistics Canada', period: 'prevMonth' },
  { id: 'ca-gdp-mom', title: 'GDP (MoM)', currency: 'CAD', category: 'GDP & growth', impact: 'medium', time: '13:30', schedule: { type: 'monthlyNth', weekday: 5, nth: -1 }, value: { base: 0.1, swing: 0.3, dp: 1, unit: '%' }, source: 'Statistics Canada', period: 'twoMonthsBack' },
  { id: 'ca-retail-sales', title: 'Retail Sales (MoM)', currency: 'CAD', category: 'Consumer', impact: 'medium', time: '13:30', schedule: { type: 'monthlyDay', day: 22 }, value: { base: 0.3, swing: 0.9, dp: 1, unit: '%' }, source: 'Statistics Canada', period: 'twoMonthsBack' },
  { id: 'ca-ivey-pmi', title: 'Ivey PMI', currency: 'CAD', category: 'PMI & surveys', impact: 'low', time: '15:00', schedule: { type: 'monthlyDay', day: 5 }, value: { base: 51.2, swing: 3.5, dp: 1, unit: '' }, source: 'Ivey Business School', period: 'prevMonth' },
  { id: 'ca-trade-balance', title: 'Trade Balance', currency: 'CAD', category: 'Trade & current account', impact: 'low', time: '13:30', schedule: { type: 'monthlyDay', day: 5 }, value: { base: -0.9, swing: 1.4, dp: 2, unit: 'B', prefix: 'C$', signed: true }, source: 'Statistics Canada', period: 'twoMonthsBack' },
  { id: 'ch-snb-policy-rate', title: 'SNB Policy Rate', currency: 'CHF', category: 'Interest rates', impact: 'high', time: '08:30', schedule: { type: 'quarterly', months: [2, 5, 8, 11], day: 19 }, value: { base: 0, swing: 0, dp: 2, unit: '%', policy: true }, source: 'Swiss National Bank', period: 'none',
    description: 'The SNB reviews policy only four times a year, which concentrates an entire quarter of expectations into one release.' },
  { id: 'ch-cpi-mom', title: 'CPI (MoM)', currency: 'CHF', category: 'Inflation', impact: 'medium', time: '07:30', schedule: { type: 'monthlyDay', day: 3 }, value: { base: 0, swing: 0.3, dp: 1, unit: '%' }, source: 'Federal Statistical Office', period: 'prevMonth' },
  { id: 'ch-kof-barometer', title: 'KOF Economic Barometer', currency: 'CHF', category: 'PMI & surveys', impact: 'low', time: '08:00', schedule: { type: 'monthlyNth', weekday: 4, nth: -1 }, value: { base: 98.6, swing: 3, dp: 1, unit: '' }, source: 'KOF Swiss Economic Institute', period: 'currentMonth' },
  { id: 'ch-gdp-qoq', title: 'GDP (QoQ)', currency: 'CHF', category: 'GDP & growth', impact: 'medium', time: '08:00', schedule: { type: 'quarterly', months: [2, 5, 8, 11], day: 1 }, value: { base: 0.3, swing: 0.3, dp: 1, unit: '%' }, source: 'SECO', period: 'prevQuarter' },
  { id: 'ch-unemployment-rate', title: 'Unemployment Rate', currency: 'CHF', category: 'Employment', impact: 'low', time: '06:45', schedule: { type: 'monthlyDay', day: 8 }, value: { base: 2.9, swing: 0.1, dp: 1, unit: '%' }, source: 'SECO', period: 'prevMonth' },

  /* ------------------------------------------------------------------ */
  /* China                                                               */
  /* ------------------------------------------------------------------ */
  { id: 'cn-nbs-manufacturing-pmi', title: 'NBS Manufacturing PMI', currency: 'CNY', category: 'PMI & surveys', impact: 'high', time: '01:30', schedule: { type: 'monthlyNth', weekday: 2, nth: -1 }, value: { base: 49.4, swing: 0.8, dp: 1, unit: '' }, source: 'National Bureau of Statistics', period: 'currentMonth',
    description: 'The official Chinese factory survey, weighted toward large state-owned enterprises. Moves the Australian dollar and industrial metals as much as anything domestic does.' },
  { id: 'cn-nbs-services-pmi', title: 'NBS Non-Manufacturing PMI', currency: 'CNY', category: 'PMI & surveys', impact: 'medium', time: '01:30', schedule: { type: 'monthlyNth', weekday: 2, nth: -1 }, value: { base: 50.4, swing: 0.9, dp: 1, unit: '' }, source: 'National Bureau of Statistics', period: 'currentMonth' },
  { id: 'cn-caixin-manufacturing', title: 'Caixin Manufacturing PMI', currency: 'CNY', category: 'PMI & surveys', impact: 'medium', time: '01:45', schedule: { type: 'monthlyDay', day: 1 }, value: { base: 50.6, swing: 1.1, dp: 1, unit: '' }, source: 'Caixin / S&P Global', period: 'prevMonth',
    description: 'The private-sector counterpart to the NBS survey, skewed toward smaller exporters — the two often disagree.' },
  { id: 'cn-caixin-services', title: 'Caixin Services PMI', currency: 'CNY', category: 'PMI & surveys', impact: 'low', time: '01:45', schedule: { type: 'monthlyDay', day: 5 }, value: { base: 51.8, swing: 1.2, dp: 1, unit: '' }, source: 'Caixin / S&P Global', period: 'prevMonth' },
  { id: 'cn-cpi-yoy', title: 'CPI (YoY)', currency: 'CNY', category: 'Inflation', impact: 'medium', time: '01:30', schedule: { type: 'monthlyDay', day: 9 }, value: { base: 0.4, swing: 0.4, dp: 1, unit: '%' }, source: 'National Bureau of Statistics', period: 'prevMonth' },
  { id: 'cn-ppi-yoy', title: 'PPI (YoY)', currency: 'CNY', category: 'Inflation', impact: 'low', time: '01:30', schedule: { type: 'monthlyDay', day: 9 }, value: { base: -2.4, swing: 0.6, dp: 1, unit: '%', signed: true }, source: 'National Bureau of Statistics', period: 'prevMonth' },
  { id: 'cn-gdp-yoy', title: 'GDP (YoY)', currency: 'CNY', category: 'GDP & growth', impact: 'high', time: '02:00', schedule: { type: 'quarterly', months: [0, 3, 6, 9], day: 17 }, value: { base: 4.9, swing: 0.4, dp: 1, unit: '%' }, source: 'National Bureau of Statistics', period: 'prevQuarter' },
  { id: 'cn-industrial-production', title: 'Industrial Production (YoY)', currency: 'CNY', category: 'Manufacturing', impact: 'medium', time: '02:00', schedule: { type: 'monthlyDay', day: 15 }, value: { base: 5.4, swing: 1.1, dp: 1, unit: '%' }, source: 'National Bureau of Statistics', period: 'prevMonth' },
  { id: 'cn-retail-sales', title: 'Retail Sales (YoY)', currency: 'CNY', category: 'Consumer', impact: 'medium', time: '02:00', schedule: { type: 'monthlyDay', day: 15 }, value: { base: 3.6, swing: 1.2, dp: 1, unit: '%' }, source: 'National Bureau of Statistics', period: 'prevMonth' },
  { id: 'cn-fixed-asset-investment', title: 'Fixed Asset Investment (YoY)', currency: 'CNY', category: 'GDP & growth', impact: 'low', time: '02:00', schedule: { type: 'monthlyDay', day: 15 }, value: { base: 1.8, swing: 0.9, dp: 1, unit: '%' }, source: 'National Bureau of Statistics', period: 'ytd' },
  { id: 'cn-trade-balance', title: 'Trade Balance', currency: 'CNY', category: 'Trade & current account', impact: 'medium', time: '03:00', schedule: { type: 'monthlyDay', day: 7 }, value: { base: 96.4, swing: 18, dp: 1, unit: 'B', prefix: '$' }, source: 'General Administration of Customs', period: 'prevMonth' },
  { id: 'cn-exports-yoy', title: 'Exports (YoY)', currency: 'CNY', category: 'Trade & current account', impact: 'medium', time: '03:00', schedule: { type: 'monthlyDay', day: 7 }, value: { base: 5.2, swing: 4, dp: 1, unit: '%', signed: true }, source: 'General Administration of Customs', period: 'prevMonth' },
  { id: 'cn-loan-prime-rate', title: 'PBoC Loan Prime Rate', currency: 'CNY', category: 'Interest rates', impact: 'medium', time: '01:15', schedule: { type: 'monthlyDay', day: 20 }, value: { base: 3.0, swing: 0, dp: 2, unit: '%', policy: true }, source: "People's Bank of China", period: 'none' },
  { id: 'cn-new-loans', title: 'New Yuan Loans', currency: 'CNY', category: 'Interest rates', impact: 'low', time: '09:00', schedule: { type: 'monthlyDay', day: 12 }, value: { base: 980, swing: 600, dp: 0, unit: 'B', prefix: '¥' }, source: "People's Bank of China", period: 'prevMonth' },

  /* ------------------------------------------------------------------ */
  /* Rest of world                                                       */
  /* ------------------------------------------------------------------ */
  { id: 'in-rbi-rate-decision', title: 'RBI Interest Rate Decision', currency: 'INR', category: 'Interest rates', impact: 'high', time: '04:30', schedule: { type: 'interval', weeks: 8, anchor: '2026-02-06' }, value: { base: 5.5, swing: 0, dp: 2, unit: '%', policy: true }, source: 'Reserve Bank of India', period: 'none' },
  { id: 'in-cpi-yoy', title: 'CPI (YoY)', currency: 'INR', category: 'Inflation', impact: 'high', time: '12:00', schedule: { type: 'monthlyDay', day: 12 }, value: { base: 3.4, swing: 0.8, dp: 2, unit: '%' }, source: 'MoSPI', period: 'prevMonth' },
  { id: 'in-wpi-yoy', title: 'WPI Inflation (YoY)', currency: 'INR', category: 'Inflation', impact: 'low', time: '06:30', schedule: { type: 'monthlyDay', day: 14 }, value: { base: 1.4, swing: 0.9, dp: 2, unit: '%', signed: true }, source: 'Ministry of Commerce', period: 'prevMonth' },
  { id: 'in-industrial-production', title: 'Industrial Production (YoY)', currency: 'INR', category: 'Manufacturing', impact: 'low', time: '12:00', schedule: { type: 'monthlyDay', day: 12 }, value: { base: 3.8, swing: 1.8, dp: 1, unit: '%' }, source: 'MoSPI', period: 'twoMonthsBack' },
  { id: 'in-gdp-yoy', title: 'GDP (YoY)', currency: 'INR', category: 'GDP & growth', impact: 'high', time: '12:00', schedule: { type: 'quarterly', months: [1, 4, 7, 10], day: 28 }, value: { base: 7.2, swing: 0.8, dp: 1, unit: '%' }, source: 'MoSPI', period: 'prevQuarter' },
  { id: 'in-hsbc-manufacturing', title: 'HSBC Manufacturing PMI', currency: 'INR', category: 'PMI & surveys', impact: 'low', time: '05:00', schedule: { type: 'monthlyDay', day: 1 }, value: { base: 57.4, swing: 1.4, dp: 1, unit: '' }, source: 'HSBC / S&P Global', period: 'prevMonth' },
  { id: 'in-trade-balance', title: 'Trade Balance', currency: 'INR', category: 'Trade & current account', impact: 'low', time: '11:30', schedule: { type: 'monthlyDay', day: 15 }, value: { base: -24.2, swing: 5, dp: 2, unit: 'B', prefix: '$', signed: true }, source: 'Ministry of Commerce', period: 'prevMonth' },
  { id: 'br-selic-rate', title: 'BCB Selic Rate Decision', currency: 'BRL', category: 'Interest rates', impact: 'high', time: '21:30', schedule: { type: 'interval', weeks: 7, anchor: '2026-01-28' }, value: { base: 14.75, swing: 0, dp: 2, unit: '%', policy: true }, source: 'Banco Central do Brasil', period: 'none' },
  { id: 'br-ipca-inflation', title: 'IPCA Inflation (MoM)', currency: 'BRL', category: 'Inflation', impact: 'medium', time: '12:00', schedule: { type: 'monthlyDay', day: 10 }, value: { base: 0.4, swing: 0.3, dp: 2, unit: '%' }, source: 'IBGE', period: 'prevMonth' },
  { id: 'br-unemployment-rate', title: 'Unemployment Rate', currency: 'BRL', category: 'Employment', impact: 'low', time: '12:00', schedule: { type: 'monthlyNth', weekday: 5, nth: -1 }, value: { base: 6.2, swing: 0.3, dp: 1, unit: '%' }, source: 'IBGE', period: 'threeMonthsBack' },
  { id: 'mx-banxico-rate', title: 'Banxico Interest Rate Decision', currency: 'MXN', category: 'Interest rates', impact: 'high', time: '19:00', schedule: { type: 'interval', weeks: 7, anchor: '2026-02-05' }, value: { base: 8.5, swing: 0, dp: 2, unit: '%', policy: true }, source: 'Banco de México', period: 'none' },
  { id: 'mx-cpi-yoy', title: 'CPI (YoY)', currency: 'MXN', category: 'Inflation', impact: 'medium', time: '12:00', schedule: { type: 'monthlyDay', day: 9 }, value: { base: 3.8, swing: 0.4, dp: 2, unit: '%' }, source: 'INEGI', period: 'prevMonth' },
  { id: 'za-sarb-rate', title: 'SARB Interest Rate Decision', currency: 'ZAR', category: 'Interest rates', impact: 'high', time: '13:00', schedule: { type: 'interval', weeks: 8, anchor: '2026-01-29' }, value: { base: 7.0, swing: 0, dp: 2, unit: '%', policy: true }, source: 'South African Reserve Bank', period: 'none' },
  { id: 'za-cpi-yoy', title: 'CPI (YoY)', currency: 'ZAR', category: 'Inflation', impact: 'medium', time: '08:00', schedule: { type: 'monthlyNth', weekday: 3, nth: 3 }, value: { base: 3.6, swing: 0.5, dp: 1, unit: '%' }, source: 'Statistics South Africa', period: 'prevMonth' },
  { id: 'za-retail-sales', title: 'Retail Sales (YoY)', currency: 'ZAR', category: 'Consumer', impact: 'low', time: '11:00', schedule: { type: 'monthlyDay', day: 17 }, value: { base: 2.4, swing: 1.6, dp: 1, unit: '%' }, source: 'Statistics South Africa', period: 'twoMonthsBack' },
  { id: 'kr-bok-rate', title: 'BoK Interest Rate Decision', currency: 'KRW', category: 'Interest rates', impact: 'medium', time: '00:00', schedule: { type: 'interval', weeks: 6, anchor: '2026-01-15' }, value: { base: 2.5, swing: 0, dp: 2, unit: '%', policy: true }, source: 'Bank of Korea', period: 'none' },
  { id: 'kr-trade-balance', title: 'Trade Balance', currency: 'KRW', category: 'Trade & current account', impact: 'low', time: '00:00', schedule: { type: 'monthlyDay', day: 1 }, value: { base: 4.2, swing: 2.5, dp: 2, unit: 'B', prefix: '$', signed: true }, source: 'Ministry of Trade', period: 'prevMonth' },
  { id: 'kr-cpi-yoy', title: 'CPI (YoY)', currency: 'KRW', category: 'Inflation', impact: 'low', time: '23:00', schedule: { type: 'monthlyDay', day: 2 }, value: { base: 2.0, swing: 0.4, dp: 1, unit: '%' }, source: 'Statistics Korea', period: 'prevMonth' },
  { id: 'sg-gdp-yoy', title: 'GDP (YoY) — Advance', currency: 'SGD', category: 'GDP & growth', impact: 'low', time: '00:00', schedule: { type: 'quarterly', months: [0, 3, 6, 9], day: 14 }, value: { base: 3.8, swing: 1.2, dp: 1, unit: '%' }, source: 'Ministry of Trade and Industry', period: 'prevQuarter', preliminary: true },
  { id: 'sg-mas-statement', title: 'MAS Monetary Policy Statement', currency: 'SGD', category: 'Interest rates', impact: 'medium', time: '00:00', schedule: { type: 'quarterly', months: [0, 3, 6, 9], day: 14 }, type: 'report', source: 'Monetary Authority of Singapore', period: 'none' },
  { id: 'hk-gdp-yoy', title: 'GDP (YoY)', currency: 'HKD', category: 'GDP & growth', impact: 'low', time: '08:30', schedule: { type: 'quarterly', months: [1, 4, 7, 10], day: 15 }, value: { base: 2.8, swing: 1, dp: 1, unit: '%' }, source: 'Census and Statistics Department', period: 'prevQuarter' },
  { id: 'tw-export-orders', title: 'Export Orders (YoY)', currency: 'TWD', category: 'Trade & current account', impact: 'low', time: '08:00', schedule: { type: 'monthlyDay', day: 20 }, value: { base: 12.4, swing: 8, dp: 1, unit: '%', signed: true }, source: 'Ministry of Economic Affairs', period: 'prevMonth' },
  { id: 'id-bi-rate', title: 'BI Interest Rate Decision', currency: 'IDR', category: 'Interest rates', impact: 'low', time: '07:20', schedule: { type: 'monthlyNth', weekday: 3, nth: 3 }, value: { base: 4.75, swing: 0, dp: 2, unit: '%', policy: true }, source: 'Bank Indonesia', period: 'none' },
  { id: 'th-bot-rate', title: 'BoT Interest Rate Decision', currency: 'THB', category: 'Interest rates', impact: 'low', time: '07:05', schedule: { type: 'interval', weeks: 7, anchor: '2026-02-04' }, value: { base: 1.5, swing: 0, dp: 2, unit: '%', policy: true }, source: 'Bank of Thailand', period: 'none' },
  { id: 'se-riksbank-rate', title: 'Riksbank Interest Rate Decision', currency: 'SEK', category: 'Interest rates', impact: 'medium', time: '08:30', schedule: { type: 'interval', weeks: 7, anchor: '2026-01-28' }, value: { base: 2.0, swing: 0, dp: 2, unit: '%', policy: true }, source: 'Sveriges Riksbank', period: 'none' },
  { id: 'se-cpif-yoy', title: 'CPIF (YoY)', currency: 'SEK', category: 'Inflation', impact: 'medium', time: '07:00', schedule: { type: 'monthlyDay', day: 13 }, value: { base: 2.6, swing: 0.4, dp: 1, unit: '%' }, source: 'Statistics Sweden', period: 'prevMonth' },
  { id: 'no-norges-rate', title: 'Norges Bank Interest Rate Decision', currency: 'NOK', category: 'Interest rates', impact: 'medium', time: '09:00', schedule: { type: 'interval', weeks: 7, anchor: '2026-01-22' }, value: { base: 4.25, swing: 0, dp: 2, unit: '%', policy: true }, source: 'Norges Bank', period: 'none' },
  { id: 'no-cpi-yoy', title: 'Core CPI (YoY)', currency: 'NOK', category: 'Inflation', impact: 'low', time: '07:00', schedule: { type: 'monthlyDay', day: 10 }, value: { base: 3.0, swing: 0.4, dp: 1, unit: '%' }, source: 'Statistics Norway', period: 'prevMonth' },
  { id: 'pl-nbp-rate', title: 'NBP Interest Rate Decision', currency: 'PLN', category: 'Interest rates', impact: 'low', time: '14:00', schedule: { type: 'monthlyNth', weekday: 3, nth: 1 }, value: { base: 5.0, swing: 0, dp: 2, unit: '%', policy: true }, source: 'Narodowy Bank Polski', period: 'none' },
  { id: 'cz-cnb-rate', title: 'ČNB Interest Rate Decision', currency: 'CZK', category: 'Interest rates', impact: 'low', time: '13:30', schedule: { type: 'interval', weeks: 7, anchor: '2026-02-05' }, value: { base: 3.5, swing: 0, dp: 2, unit: '%', policy: true }, source: 'Česká národní banka', period: 'none' },
  { id: 'hu-mnb-rate', title: 'MNB Interest Rate Decision', currency: 'HUF', category: 'Interest rates', impact: 'low', time: '13:00', schedule: { type: 'monthlyNth', weekday: 2, nth: -1 }, value: { base: 6.5, swing: 0, dp: 2, unit: '%', policy: true }, source: 'Magyar Nemzeti Bank', period: 'none' },
  { id: 'tr-cbrt-rate', title: 'CBRT Interest Rate Decision', currency: 'TRY', category: 'Interest rates', impact: 'medium', time: '11:00', schedule: { type: 'interval', weeks: 6, anchor: '2026-01-22' }, value: { base: 43.0, swing: 0, dp: 2, unit: '%', policy: true }, source: 'CBRT', period: 'none' },
  { id: 'tr-cpi-yoy', title: 'CPI (YoY)', currency: 'TRY', category: 'Inflation', impact: 'medium', time: '07:00', schedule: { type: 'monthlyDay', day: 3 }, value: { base: 32.4, swing: 2.5, dp: 2, unit: '%' }, source: 'TurkStat', period: 'prevMonth' },
  { id: 'ru-cbr-rate', title: 'CBR Interest Rate Decision', currency: 'RUB', category: 'Interest rates', impact: 'low', time: '10:30', schedule: { type: 'interval', weeks: 7, anchor: '2026-02-13' }, value: { base: 17.0, swing: 0, dp: 2, unit: '%', policy: true }, source: 'Bank of Russia', period: 'none' },
  { id: 'il-boi-rate', title: 'BoI Interest Rate Decision', currency: 'ILS', category: 'Interest rates', impact: 'low', time: '14:00', schedule: { type: 'interval', weeks: 7, anchor: '2026-01-05' }, value: { base: 4.5, swing: 0, dp: 2, unit: '%', policy: true }, source: 'Bank of Israel', period: 'none' },
];

/* -------------------------------------------------------------------- */
/* Secondary series                                                      */
/* -------------------------------------------------------------------- */

/**
 * Every economy publishes the same routine block of statistics, and a calendar
 * that only listed the headline releases would look far emptier than a real
 * one. Rather than hand-writing another few hundred near-identical entries,
 * these templates are applied to each country in `countries.js`.
 *
 * `minWeight` gates how much of the block a country gets — the largest
 * economies publish (and matter for) considerably more than the smallest.
 * Release days and times are spread deterministically off the country code so
 * the month fills evenly instead of everything landing on the 1st.
 */
const SECONDARY_TEMPLATES = [
  { key: 'mfg-pmi', title: 'Manufacturing PMI', category: 'PMI & surveys', minWeight: 3, day: 1, value: { base: 50.2, swing: 2.4, dp: 1, unit: '' }, period: 'currentMonth' },
  { key: 'services-pmi', title: 'Services PMI', category: 'PMI & surveys', minWeight: 5, day: 3, value: { base: 51.6, swing: 2.2, dp: 1, unit: '' }, period: 'currentMonth' },
  { key: 'cpi-yoy', title: 'CPI (YoY)', category: 'Inflation', minWeight: 2, day: 11, value: { base: 2.6, swing: 0.7, dp: 1, unit: '%' }, period: 'prevMonth' },
  { key: 'ppi-yoy', title: 'PPI (YoY)', category: 'Inflation', minWeight: 5, day: 13, value: { base: 1.4, swing: 1.2, dp: 1, unit: '%', signed: true }, period: 'prevMonth' },
  { key: 'trade-balance', title: 'Trade Balance', category: 'Trade & current account', minWeight: 2, day: 8, value: { base: 1.8, swing: 4.2, dp: 2, unit: 'B', prefix: '$', signed: true }, period: 'twoMonthsBack' },
  { key: 'industrial-production', title: 'Industrial Production (YoY)', category: 'Manufacturing', minWeight: 3, day: 14, value: { base: 1.6, swing: 2.4, dp: 1, unit: '%', signed: true }, period: 'twoMonthsBack' },
  { key: 'retail-sales-yoy', title: 'Retail Sales (YoY)', category: 'Consumer', minWeight: 3, day: 19, value: { base: 2.2, swing: 2, dp: 1, unit: '%', signed: true }, period: 'twoMonthsBack' },
  { key: 'unemployment-rate', title: 'Unemployment Rate', category: 'Employment', minWeight: 3, day: 16, value: { base: 5.2, swing: 0.6, dp: 1, unit: '%' }, period: 'prevMonth' },
  { key: 'business-confidence', title: 'Business Confidence', category: 'PMI & surveys', minWeight: 4, day: 22, value: { base: 2.4, swing: 6, dp: 1, unit: '', signed: true }, period: 'currentMonth' },
  { key: 'consumer-confidence', title: 'Consumer Confidence', category: 'Consumer', minWeight: 4, day: 24, value: { base: -8.4, swing: 5, dp: 1, unit: '', signed: true }, period: 'currentMonth' },
  { key: 'fx-reserves', title: 'Foreign Exchange Reserves', category: 'Government & fiscal', minWeight: 4, day: 7, value: { base: 284, swing: 12, dp: 1, unit: 'B', prefix: '$' }, period: 'prevMonth' },
  { key: 'money-supply', title: 'M2 Money Supply (YoY)', category: 'Interest rates', minWeight: 5, day: 25, value: { base: 4.6, swing: 1.6, dp: 1, unit: '%' }, period: 'prevMonth' },
  { key: 'car-registrations', title: 'New Car Registrations (YoY)', category: 'Consumer', minWeight: 6, day: 5, value: { base: 2.8, swing: 8, dp: 1, unit: '%', signed: true }, period: 'prevMonth' },
  { key: 'construction-output', title: 'Construction Output (MoM)', category: 'Manufacturing', minWeight: 6, day: 20, value: { base: 0.2, swing: 1.6, dp: 1, unit: '%', signed: true }, period: 'twoMonthsBack' },
  { key: 'bond-auction-10y', title: '10-Year Bond Auction', category: 'Bond auctions', minWeight: 6, day: 17, value: { base: 3.4, swing: 0.8, dp: 2, unit: '%' }, period: 'none' },
  { key: 'cb-speech', title: 'Central Bank Official Speaks', category: 'Speeches', minWeight: 6, day: 27, type: 'speech', period: 'none' },
  { key: 'gdp-yoy', title: 'GDP (YoY)', category: 'GDP & growth', minWeight: 3, day: 26, quarterly: true, value: { base: 2.1, swing: 1.4, dp: 1, unit: '%', signed: true }, period: 'prevQuarter' },
  { key: 'current-account', title: 'Current Account', category: 'Trade & current account', minWeight: 5, day: 21, quarterly: true, value: { base: 2.4, swing: 6, dp: 2, unit: 'B', prefix: '$', signed: true }, period: 'prevQuarter' },
];

/** Local release windows, so times spread realistically across the trading day. */
const REGION_WINDOW = {
  'Asia-Pacific': [30, 390],
  Europe: [360, 660],
  Americas: [690, 1020],
  'Middle East & Africa': [420, 780],
};

function minutesToTime(minutes) {
  const rounded = Math.round(minutes / 15) * 15;
  const hours = Math.floor(rounded / 60) % 24;
  return `${String(hours).padStart(2, '0')}:${String(rounded % 60).padStart(2, '0')}`;
}

function buildSecondarySeries() {
  const taken = new Set(primaryEvents.map((entry) => `${entry.currency}|${entry.title}`));
  // Ids end up in URLs and are the key the detail page resolves, so a derived
  // id must never shadow a hand-written one.
  const usedIds = new Set(primaryEvents.map((entry) => entry.id));
  const series = [];

  for (const country of countries) {
    const spread = hashString(country.code);
    const [windowStart, windowEnd] = REGION_WINDOW[country.region] ?? REGION_WINDOW.Europe;

    SECONDARY_TEMPLATES.forEach((template, index) => {
      if (country.weight < template.minWeight) return;
      if (taken.has(`${country.code}|${template.title}`)) return;

      const jitter = (spread >> (index % 12)) % 23;
      const day = ((template.day + jitter) % 27) + 1;
      const time = minutesToTime(windowStart + ((spread + index * 47) % (windowEnd - windowStart)));

      // The bigger the economy, the more a routine release actually moves things.
      const impact = country.weight >= 8 && index < 6 ? 'medium' : 'low';

      let id = `${country.iso}-${template.key}`;
      if (usedIds.has(id)) id = `${id}-annual`;
      usedIds.add(id);

      series.push({
        id,
        title: template.title,
        currency: country.code,
        category: template.category,
        impact,
        time,
        type: template.type,
        schedule: template.quarterly
          ? { type: 'quarterly', months: [(spread % 3), (spread % 3) + 3, (spread % 3) + 6, (spread % 3) + 9], day }
          : { type: 'monthlyDay', day },
        value: template.value,
        period: template.period,
        source: template.key === 'cb-speech' ? country.bank : `${country.country} statistics office`,
      });
    });
  }

  return series;
}

export const eventCatalog = [...primaryEvents, ...buildSecondarySeries()];

/** Public holidays that close a market for the day. */
export const marketHolidays = [
  { date: '01-01', name: "New Year's Day", currencies: ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY'] },
  { date: '01-26', name: 'Australia Day', currencies: ['AUD'] },
  { date: '02-06', name: 'Waitangi Day', currencies: ['NZD'] },
  { date: '03-17', name: "St Patrick's Day (Ireland)", currencies: ['EUR'] },
  { date: '04-25', name: 'Anzac Day', currencies: ['AUD', 'NZD'] },
  { date: '05-01', name: 'Labour Day', currencies: ['EUR', 'CNY', 'CHF'] },
  { date: '07-04', name: 'Independence Day', currencies: ['USD'] },
  { date: '08-15', name: 'Assumption Day', currencies: ['EUR'] },
  { date: '10-03', name: 'German Unity Day', currencies: ['EUR'] },
  { date: '11-11', name: 'Remembrance Day', currencies: ['CAD'] },
  { date: '12-25', name: 'Christmas Day', currencies: ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'NZD'] },
  { date: '12-26', name: 'Boxing Day', currencies: ['GBP', 'AUD', 'CAD', 'NZD'] },
];

export const catalogById = eventCatalog.reduce((map, entry) => {
  map[entry.id] = entry;
  return map;
}, {});

export const impactLevels = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export const viewOptions = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];
