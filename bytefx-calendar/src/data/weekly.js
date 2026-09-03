export const weekRange = 'May 19 – May 25, 2025';

export const weekDays = [
  { id: 'mon', name: 'Mon', date: 'May 19', events: 10, intensity: [3, 2, 1] },
  { id: 'tue', name: 'Tue', date: 'May 20', events: 13, intensity: [4, 2, 1] },
  { id: 'wed', name: 'Wed', date: 'May 21', events: 32, intensity: [5, 3, 2], active: true },
  { id: 'thu', name: 'Thu', date: 'May 22', events: 14, intensity: [3, 3, 1] },
  { id: 'fri', name: 'Fri', date: 'May 23', events: 18, intensity: [4, 2, 2] },
  { id: 'sat', name: 'Sat', date: 'May 24', events: 2, intensity: [0, 1, 1] },
  { id: 'sun', name: 'Sun', date: 'May 25', events: 0, intensity: [0, 0, 0] },
];

/** Score 0–5 per currency per weekday, drives the heatmap. */
export const impactHeatmap = {
  columns: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  rows: [
    { currency: 'USD', scores: [2.4, 3.6, 4.6, 4.2, 4.4], overall: 'high' },
    { currency: 'EUR', scores: [2.1, 3.2, 2.8, 2.4, 2.6], overall: 'high' },
    { currency: 'GBP', scores: [1.8, 3.0, 1.6, 1.4, 2.2], overall: 'medium' },
    { currency: 'JPY', scores: [1.4, 1.6, 1.8, 2.6, 3.8], overall: 'medium' },
    { currency: 'AUD', scores: [1.2, 2.8, 4.0, 2.2, 1.6], overall: 'medium' },
    { currency: 'CAD', scores: [1.0, 3.4, 3.6, 2.0, 1.2], overall: 'medium' },
    { currency: 'CHF', scores: [0.8, 1.2, 1.8, 1.4, 1.0], overall: 'low' },
    { currency: 'CNY', scores: [1.0, 1.6, 1.2, 0.8, 0.6], overall: 'low' },
  ],
};

export const categoryFocus = [
  { name: 'Inflation', count: 12, impact: 'high' },
  { name: 'Interest rates', count: 6, impact: 'high' },
  { name: 'Employment', count: 15, impact: 'medium' },
  { name: 'GDP', count: 8, impact: 'medium' },
  { name: 'PMI', count: 10, impact: 'low' },
];

export const keyEventsTimeline = [
  {
    day: 'Mon, May 19',
    events: [
      { time: '08:30', currency: 'USD', title: 'Fed Vice Chair Jefferson Speaks', tag: 'Speech' },
      { time: '14:00', currency: 'EUR', title: 'ECB Lane Speaks', tag: 'Speech' },
    ],
  },
  {
    day: 'Tue, May 20',
    events: [
      { time: '08:30', currency: 'GBP', title: 'CPI (YoY) (Apr)', tag: 'High' },
      { time: '12:30', currency: 'CAD', title: 'CPI (YoY) (Apr)', tag: 'Medium' },
    ],
  },
  {
    day: 'Wed, May 21',
    active: true,
    events: [
      { time: '18:00', currency: 'USD', title: 'FOMC Minutes', tag: 'High' },
      { time: '22:45', currency: 'NZD', title: 'RBNZ Gov Orr Speaks', tag: 'Speech' },
    ],
  },
  {
    day: 'Thu, May 22',
    events: [
      { time: '01:30', currency: 'AUD', title: 'RBA Interest Rate Decision', tag: 'High' },
      { time: '12:30', currency: 'USD', title: 'Initial Jobless Claims', tag: 'Medium' },
    ],
  },
  {
    day: 'Fri, May 23',
    events: [
      { time: '08:30', currency: 'GBP', title: 'Retail Sales (MoM) (Apr)', tag: 'High' },
      { time: '14:00', currency: 'USD', title: 'Existing Home Sales (Apr)', tag: 'Medium' },
    ],
  },
];

export const weekThemes = [
  {
    title: 'Inflation still in focus',
    body: 'CPI readings from the UK, Canada and Japan could set the tone for rate expectations.',
    tone: 'high',
  },
  {
    title: 'Central banks take the stage',
    body: 'FOMC Minutes and the RBA decision headline a busy week for policy.',
    tone: 'brand',
  },
  {
    title: 'Jobs reports in focus',
    body: 'Canada and Japan employment data may trigger volatility across FX markets.',
    tone: 'medium',
  },
  {
    title: 'Growth signals',
    body: 'Flash PMIs and Q1 GDP releases offer a pulse on global growth.',
    tone: 'low',
  },
];

export const watchedCurrencies = [
  { currency: 'USD', events: 11, share: 100 },
  { currency: 'EUR', events: 9, share: 82 },
  { currency: 'GBP', events: 7, share: 64 },
  { currency: 'JPY', events: 6, share: 55 },
  { currency: 'AUD', events: 4, share: 36 },
  { currency: 'CAD', events: 3, share: 27 },
];
