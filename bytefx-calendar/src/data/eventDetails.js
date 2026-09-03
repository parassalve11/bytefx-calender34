/** Keyed by event id. Anything not listed falls back to a generated shell. */
export const eventDetails = {
  'us-nonfarm-payrolls': {
    id: 'us-nonfarm-payrolls',
    title: 'U.S. Nonfarm Payrolls',
    period: 'May',
    currency: 'USD',
    country: 'United States',
    category: 'Employment',
    impact: 'high',
    preliminary: true,
    releaseDate: 'Friday, May 30, 2025',
    releaseTime: '12:30',
    timezone: '(UTC-04:00)',
    countdown: 'In 2 days',
    description:
      'Measures the change in the number of employed people during the previous month, excluding the farming industry.',
    stats: [
      { label: 'Actual', value: '+272K', period: 'May 2025', note: '↑ 82K vs forecast', tone: 'pos', noteTone: 'pos' },
      { label: 'Forecast', value: '+190K', period: 'May 2025', note: 'Consensus +185K' },
      { label: 'Previous', value: '+175K', period: 'Apr 2025', note: 'Revised ↓ 158K', noteTone: 'neg' },
      {
        label: 'Surprise / deviation',
        value: '+82K',
        period: '+43.2% vs forecast',
        note: 'Better than expected',
        tone: 'pos',
        noteTone: 'pos',
      },
    ],
    history: [
      { label: "May '23", actual: 165, forecast: 180, result: 'miss' },
      { label: "Jul '23", actual: 216, forecast: 200, result: 'beat' },
      { label: "Sep '23", actual: 187, forecast: 195, result: 'miss' },
      { label: "Nov '23", actual: 245, forecast: 210, result: 'beat' },
      { label: "Jan '24", actual: 142, forecast: 175, result: 'miss' },
      { label: "Mar '24", actual: 268, forecast: 220, result: 'beat' },
      { label: "May '24", actual: 218, forecast: 205, result: 'beat' },
      { label: "Jul '24", actual: 314, forecast: 240, result: 'beat' },
      { label: "Sep '24", actual: 178, forecast: 195, result: 'miss' },
      { label: "Nov '24", actual: 226, forecast: 210, result: 'beat' },
      { label: "Jan '25", actual: 168, forecast: 200, result: 'miss' },
      { label: "Mar '25", actual: 289, forecast: 225, result: 'beat' },
      { label: "Apr '25", actual: 175, forecast: 190, result: 'miss' },
      { label: "May '25", actual: 272, forecast: 190, result: 'beat' },
    ],
    whyItMatters: [
      {
        title: 'Monetary policy',
        body: 'Strong job growth may support higher rates for longer. Weak data may signal easing ahead.',
      },
      {
        title: 'Market volatility',
        body: 'Historically one of the highest volatility events for USD pairs, indices and gold.',
      },
      {
        title: 'Economic health',
        body: 'Reflects business sentiment, consumer spending potential and overall economic momentum.',
      },
    ],
    summary:
      'The nonfarm payrolls report is the most closely watched indicator of U.S. labour market health and a key driver of Federal Reserve policy decisions.',
    affectedMarkets: [
      { symbol: 'EUR/USD', move: '45 pips', impact: 'high' },
      { symbol: 'GBP/USD', move: '62 pips', impact: 'high' },
      { symbol: 'USD/JPY', move: '53 pips', impact: 'high' },
      { symbol: 'AUD/USD', move: '41 pips', impact: 'medium' },
      { symbol: 'XAU/USD', move: '$18.60', impact: 'high' },
      { symbol: 'US500', move: '0.64%', impact: 'medium' },
      { symbol: 'NAS100', move: '0.81%', impact: 'high' },
    ],
    facts: [
      { label: 'Country', value: 'United States' },
      { label: 'Category', value: 'Employment' },
      { label: 'Source', value: 'Bureau of Labor Statistics' },
      { label: 'Release schedule', value: 'Monthly' },
      { label: 'Next release', value: 'Jun 06, 2025' },
      { label: 'Methodology', value: 'Seasonally adjusted' },
      { label: 'Revision', value: 'Usually revised' },
    ],
    related: [
      { date: 'May 30', title: 'Unemployment Rate (May)', actual: '3.9%', forecast: '3.9%', previous: '3.9%' },
      { date: 'May 30', title: 'Average Hourly Earnings (MoM)', actual: '0.4%', forecast: '0.3%', previous: '0.2%' },
      { date: 'May 28', title: 'JOLTS Job Openings (Apr)', actual: '8.06M', forecast: '8.34M', previous: '8.36M' },
      { date: 'May 22', title: 'Initial Jobless Claims', actual: '215K', forecast: '220K', previous: '223K' },
    ],
  },
};

export function getEventDetail(id) {
  return eventDetails[id] ?? null;
}
