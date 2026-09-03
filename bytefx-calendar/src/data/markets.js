export const marketTabs = ['Forex', 'Indices', 'Commodities', 'Crypto'];

export const instruments = {
  Forex: [
    { symbol: 'EUR/USD', currency: 'EUR', bid: '1.08142', ask: '1.08148', spread: '0.6', change: '+0.36%', low: '1.0768', high: '1.0829', position: 72, trend: 'up' },
    { symbol: 'GBP/USD', currency: 'GBP', bid: '1.26778', ask: '1.26787', spread: '0.9', change: '-0.12%', low: '1.2661', high: '1.2704', position: 38, trend: 'down' },
    { symbol: 'USD/JPY', currency: 'JPY', bid: '156.734', ask: '156.742', spread: '0.8', change: '+0.21%', low: '156.21', high: '156.88', position: 78, trend: 'up' },
    { symbol: 'AUD/USD', currency: 'AUD', bid: '0.66214', ask: '0.66225', spread: '1.1', change: '-0.08%', low: '0.6608', high: '0.6637', position: 42, trend: 'down' },
    { symbol: 'USD/CAD', currency: 'CAD', bid: '1.36871', ask: '1.36884', spread: '1.3', change: '+0.18%', low: '1.3661', high: '1.3702', position: 63, trend: 'up' },
    { symbol: 'USD/CHF', currency: 'CHF', bid: '0.90412', ask: '0.90426', spread: '1.4', change: '-0.24%', low: '0.9033', high: '0.9068', position: 24, trend: 'down' },
    { symbol: 'NZD/USD', currency: 'NZD', bid: '0.61183', ask: '0.61199', spread: '1.6', change: '+0.09%', low: '0.6104', high: '0.6131', position: 58, trend: 'up' },
    { symbol: 'EUR/GBP', currency: 'EUR', bid: '0.85305', ask: '0.85319', spread: '1.4', change: '+0.48%', low: '0.8489', high: '0.8534', position: 88, trend: 'up' },
    { symbol: 'EUR/JPY', currency: 'EUR', bid: '169.512', ask: '169.528', spread: '1.6', change: '+0.57%', low: '168.44', high: '169.63', position: 84, trend: 'up' },
    { symbol: 'GBP/JPY', currency: 'GBP', bid: '198.694', ask: '198.718', spread: '2.4', change: '+0.11%', low: '198.12', high: '199.05', position: 61, trend: 'up' },
  ],
  Indices: [
    { symbol: 'US500', currency: 'USD', bid: '5,304.7', ask: '5,305.2', spread: '0.5', change: '-0.31%', low: '5,288.4', high: '5,321.6', position: 44, trend: 'down' },
    { symbol: 'NAS100', currency: 'USD', bid: '18,672', ask: '18,674', spread: '1.8', change: '+0.42%', low: '18,554', high: '18,701', position: 79, trend: 'up' },
    { symbol: 'US30', currency: 'USD', bid: '39,065', ask: '39,069', spread: '3.6', change: '-0.51%', low: '38,946', high: '39,232', position: 32, trend: 'down' },
    { symbol: 'GER40', currency: 'EUR', bid: '18,693', ask: '18,696', spread: '2.4', change: '+0.11%', low: '18,612', high: '18,741', position: 66, trend: 'up' },
    { symbol: 'UK100', currency: 'GBP', bid: '8,339.2', ask: '8,340.6', spread: '1.4', change: '-0.24%', low: '8,321.4', high: '8,368.1', position: 36, trend: 'down' },
    { symbol: 'JP225', currency: 'JPY', bid: '38,646', ask: '38,652', spread: '5.8', change: '+0.63%', low: '38,402', high: '38,712', position: 82, trend: 'up' },
  ],
  Commodities: [
    { symbol: 'XAU/USD', currency: 'XAU', bid: '2,341.86', ask: '2,342.14', spread: '28', change: '+0.74%', low: '2,325.4', high: '2,349.8', position: 71, trend: 'up' },
    { symbol: 'XAG/USD', currency: 'XAU', bid: '30.418', ask: '30.442', spread: '24', change: '+1.12%', low: '30.02', high: '30.61', position: 76, trend: 'up' },
    { symbol: 'USOIL', currency: 'USD', bid: '77.42', ask: '77.45', spread: '3.0', change: '-1.08%', low: '77.11', high: '78.64', position: 21, trend: 'down' },
    { symbol: 'UKOIL', currency: 'GBP', bid: '81.36', ask: '81.40', spread: '4.0', change: '-0.92%', low: '81.02', high: '82.44', position: 26, trend: 'down' },
    { symbol: 'NATGAS', currency: 'USD', bid: '2.812', ask: '2.818', spread: '6.0', change: '+2.04%', low: '2.744', high: '2.836', position: 87, trend: 'up' },
  ],
  Crypto: [
    { symbol: 'BTC/USD', currency: 'USD', bid: '68,214', ask: '68,246', spread: '32', change: '+1.86%', low: '66,842', high: '68,704', position: 74, trend: 'up' },
    { symbol: 'ETH/USD', currency: 'USD', bid: '3,742.6', ask: '3,745.1', spread: '2.5', change: '+3.24%', low: '3,608.2', high: '3,768.4', position: 88, trend: 'up' },
    { symbol: 'LTC/USD', currency: 'USD', bid: '84.62', ask: '84.79', spread: '0.17', change: '-0.42%', low: '84.02', high: '86.11', position: 34, trend: 'down' },
  ],
};

export const sessions = [
  { name: 'Sydney', open: false },
  { name: 'Tokyo', open: false },
  { name: 'London', open: true },
  { name: 'New York', open: true },
];

export const topMovers = [
  { symbol: 'EUR/JPY', currency: 'EUR', change: '+0.57%' },
  { symbol: 'EUR/GBP', currency: 'EUR', change: '+0.48%' },
  { symbol: 'EUR/USD', currency: 'EUR', change: '+0.36%' },
  { symbol: 'USD/CHF', currency: 'CHF', change: '-0.24%' },
  { symbol: 'GBP/USD', currency: 'GBP', change: '-0.12%' },
];

export const clientSentiment = [
  { symbol: 'EUR/USD', long: 62 },
  { symbol: 'GBP/USD', long: 44 },
  { symbol: 'USD/JPY', long: 29 },
  { symbol: 'XAU/USD', long: 78 },
];

export const eventsAffectingMarkets = [
  { title: 'National Core CPI (YoY) (Apr)', currency: 'JPY', impact: 'high', time: '22:30' },
  { title: 'Monthly CPI Indicator (Apr)', currency: 'AUD', impact: 'medium', time: '23:30' },
  { title: 'Core PCE Price Index (YoY)', currency: 'USD', impact: 'high', time: 'May 24' },
];
