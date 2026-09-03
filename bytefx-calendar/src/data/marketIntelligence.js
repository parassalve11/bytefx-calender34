export const affectedMarkets = {
  Forex: [
    { symbol: 'EUR/USD', price: '1.0814', change: '+0.36%' },
    { symbol: 'GBP/USD', price: '1.2678', change: '-0.12%' },
    { symbol: 'USD/JPY', price: '156.73', change: '+0.21%' },
    { symbol: 'AUD/USD', price: '0.6621', change: '-0.08%' },
    { symbol: 'USD/CAD', price: '1.3687', change: '+0.18%' },
  ],
  Indices: [
    { symbol: 'US500', price: '5,304.72', change: '-0.31%' },
    { symbol: 'NAS100', price: '18,672.4', change: '+0.42%' },
    { symbol: 'GER40', price: '18,693.4', change: '+0.11%' },
    { symbol: 'UK100', price: '8,339.2', change: '-0.24%' },
    { symbol: 'JP225', price: '38,646.1', change: '+0.63%' },
  ],
  Commodities: [
    { symbol: 'XAU/USD', price: '2,341.86', change: '+0.74%' },
    { symbol: 'XAG/USD', price: '30.42', change: '+1.12%' },
    { symbol: 'USOIL', price: '77.42', change: '-1.08%' },
    { symbol: 'UKOIL', price: '81.36', change: '-0.92%' },
    { symbol: 'NATGAS', price: '2.812', change: '+2.04%' },
  ],
};

export const centralBanks = [
  {
    name: 'Federal Reserve (Fed)',
    meeting: 'Next meeting: Jun 18, 2025',
    pricing: [
      { label: 'Hold', value: '86%' },
      { label: 'Cut', value: '12%' },
    ],
  },
  {
    name: 'European Central Bank (ECB)',
    meeting: 'Next meeting: Jun 5, 2025',
    pricing: [
      { label: 'Cut', value: '62%' },
      { label: 'Hold', value: '38%' },
    ],
  },
  {
    name: 'Bank of England (BoE)',
    meeting: 'Next meeting: Jun 19, 2025',
    pricing: [
      { label: 'Cut', value: '41%' },
      { label: 'Hold', value: '59%' },
    ],
  },
];

export const upcomingReleases = [
  {
    id: 'us-core-pce',
    month: 'May',
    day: '24',
    title: 'Core PCE Price Index (YoY)',
    currency: 'USD',
    impact: 'high',
    time: '12:30',
  },
  {
    id: 'us-cb-consumer-confidence',
    month: 'May',
    day: '27',
    title: 'CB Consumer Confidence (May)',
    currency: 'USD',
    impact: 'high',
    time: '14:00',
  },
  {
    id: 'eu-unemployment',
    month: 'May',
    day: '30',
    title: 'Unemployment Rate (Apr)',
    currency: 'EUR',
    impact: 'medium',
    time: '12:30',
  },
  {
    id: 'us-nonfarm-payrolls-upcoming',
    month: 'Jun',
    day: '06',
    title: 'Nonfarm Payrolls (May)',
    currency: 'USD',
    impact: 'high',
    time: '12:30',
  },
];
