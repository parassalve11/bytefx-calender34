export const marketTabs = ['Forex', 'Indices', 'Commodities', 'Crypto'];

/**
 * Instrument reference data. `price` is the opening snapshot — the live feed in
 * `lib/priceFeed.js` walks it from there once the client has mounted, so the
 * server render and the first client render are identical.
 *
 * `dp` is the price precision, `pip` the value of one pip for the spread
 * display, and `currency` picks the flag shown next to the symbol.
 */
export const instruments = {
  Forex: [
    { symbol: 'EUR/USD', name: 'Euro / US Dollar', currency: 'EUR', price: 1.0814, dp: 5, pip: 0.0001, spread: 0.6, volatility: 0.00035, session: 'London' },
    { symbol: 'GBP/USD', name: 'British Pound / US Dollar', currency: 'GBP', price: 1.26778, dp: 5, pip: 0.0001, spread: 0.9, volatility: 0.00045, session: 'London' },
    { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', currency: 'JPY', price: 156.734, dp: 3, pip: 0.01, spread: 0.8, volatility: 0.045, session: 'Tokyo' },
    { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', currency: 'AUD', price: 0.66214, dp: 5, pip: 0.0001, spread: 1.1, volatility: 0.0003, session: 'Sydney' },
    { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', currency: 'CAD', price: 1.36871, dp: 5, pip: 0.0001, spread: 1.3, volatility: 0.00038, session: 'New York' },
    { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', currency: 'CHF', price: 0.90412, dp: 5, pip: 0.0001, spread: 1.4, volatility: 0.00032, session: 'London' },
    { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', currency: 'NZD', price: 0.61183, dp: 5, pip: 0.0001, spread: 1.6, volatility: 0.00031, session: 'Sydney' },
    { symbol: 'EUR/GBP', name: 'Euro / British Pound', currency: 'EUR', price: 0.85305, dp: 5, pip: 0.0001, spread: 1.4, volatility: 0.00024, session: 'London' },
    { symbol: 'EUR/JPY', name: 'Euro / Japanese Yen', currency: 'EUR', price: 169.512, dp: 3, pip: 0.01, spread: 1.6, volatility: 0.052, session: 'Tokyo' },
    { symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen', currency: 'GBP', price: 198.694, dp: 3, pip: 0.01, spread: 2.4, volatility: 0.068, session: 'Tokyo' },
    { symbol: 'EUR/CHF', name: 'Euro / Swiss Franc', currency: 'EUR', price: 0.97768, dp: 5, pip: 0.0001, spread: 1.7, volatility: 0.00022, session: 'London' },
    { symbol: 'AUD/JPY', name: 'Australian Dollar / Japanese Yen', currency: 'AUD', price: 103.782, dp: 3, pip: 0.01, spread: 1.9, volatility: 0.041, session: 'Sydney' },
    { symbol: 'USD/CNH', name: 'US Dollar / Offshore Yuan', currency: 'CNY', price: 7.2418, dp: 4, pip: 0.001, spread: 3.2, volatility: 0.0022, session: 'Hong Kong' },
    { symbol: 'USD/MXN', name: 'US Dollar / Mexican Peso', currency: 'MXN', price: 18.4126, dp: 4, pip: 0.001, spread: 12, volatility: 0.0075, session: 'New York' },
    { symbol: 'USD/ZAR', name: 'US Dollar / South African Rand', currency: 'ZAR', price: 17.8642, dp: 4, pip: 0.001, spread: 18, volatility: 0.0092, session: 'London' },
    { symbol: 'USD/INR', name: 'US Dollar / Indian Rupee', currency: 'INR', price: 88.246, dp: 3, pip: 0.01, spread: 4.5, volatility: 0.018, session: 'Mumbai' },
    { symbol: 'USD/TRY', name: 'US Dollar / Turkish Lira', currency: 'TRY', price: 41.284, dp: 3, pip: 0.01, spread: 42, volatility: 0.036, session: 'London' },
    { symbol: 'USD/SEK', name: 'US Dollar / Swedish Krona', currency: 'SEK', price: 9.4218, dp: 4, pip: 0.001, spread: 9, volatility: 0.0046, session: 'London' },
  ],
  Indices: [
    { symbol: 'US500', name: 'S&P 500', currency: 'USD', price: 5304.7, dp: 1, pip: 0.1, spread: 0.5, volatility: 1.8, session: 'New York' },
    { symbol: 'NAS100', name: 'Nasdaq 100', currency: 'USD', price: 18672, dp: 0, pip: 1, spread: 1.8, volatility: 9.4, session: 'New York' },
    { symbol: 'US30', name: 'Dow Jones 30', currency: 'USD', price: 39065, dp: 0, pip: 1, spread: 3.6, volatility: 14, session: 'New York' },
    { symbol: 'US2000', name: 'Russell 2000', currency: 'USD', price: 2094.6, dp: 1, pip: 0.1, spread: 1.2, volatility: 1.4, session: 'New York' },
    { symbol: 'GER40', name: 'DAX 40', currency: 'DEM', price: 18693, dp: 0, pip: 1, spread: 2.4, volatility: 11, session: 'Frankfurt' },
    { symbol: 'UK100', name: 'FTSE 100', currency: 'GBP', price: 8339.2, dp: 1, pip: 0.1, spread: 1.4, volatility: 4.2, session: 'London' },
    { symbol: 'FRA40', name: 'CAC 40', currency: 'FRF', price: 7814.6, dp: 1, pip: 0.1, spread: 1.6, volatility: 4.6, session: 'Frankfurt' },
    { symbol: 'EU50', name: 'Euro Stoxx 50', currency: 'EUR', price: 5142.8, dp: 1, pip: 0.1, spread: 1.5, volatility: 3.4, session: 'Frankfurt' },
    { symbol: 'JP225', name: 'Nikkei 225', currency: 'JPY', price: 38646, dp: 0, pip: 1, spread: 5.8, volatility: 22, session: 'Tokyo' },
    { symbol: 'HK50', name: 'Hang Seng', currency: 'HKD', price: 24186, dp: 0, pip: 1, spread: 6.4, volatility: 28, session: 'Hong Kong' },
    { symbol: 'AUS200', name: 'ASX 200', currency: 'AUD', price: 8412.4, dp: 1, pip: 0.1, spread: 2.0, volatility: 5.1, session: 'Sydney' },
    { symbol: 'IND50', name: 'Nifty 50', currency: 'INR', price: 24862, dp: 0, pip: 1, spread: 7.2, volatility: 19, session: 'Mumbai' },
  ],
  Commodities: [
    { symbol: 'XAU/USD', name: 'Gold', currency: 'XAU', price: 2341.86, dp: 2, pip: 0.01, spread: 28, volatility: 1.35, session: 'London' },
    { symbol: 'XAG/USD', name: 'Silver', currency: 'XAG', price: 30.418, dp: 3, pip: 0.001, spread: 24, volatility: 0.028, session: 'London' },
    { symbol: 'XPT/USD', name: 'Platinum', currency: 'XPT', price: 1042.6, dp: 2, pip: 0.01, spread: 42, volatility: 1.1, session: 'London' },
    { symbol: 'USOIL', name: 'WTI Crude Oil', currency: 'OIL', price: 77.42, dp: 2, pip: 0.01, spread: 3.0, volatility: 0.09, session: 'New York' },
    { symbol: 'UKOIL', name: 'Brent Crude Oil', currency: 'OIL', price: 81.36, dp: 2, pip: 0.01, spread: 4.0, volatility: 0.088, session: 'London' },
    { symbol: 'NATGAS', name: 'Natural Gas', currency: 'OIL', price: 2.812, dp: 3, pip: 0.001, spread: 6.0, volatility: 0.011, session: 'New York' },
    { symbol: 'XCU/USD', name: 'Copper', currency: 'OIL', price: 4.6142, dp: 4, pip: 0.0001, spread: 15, volatility: 0.0072, session: 'London' },
    { symbol: 'WHEAT', name: 'Wheat', currency: 'USD', price: 584.25, dp: 2, pip: 0.01, spread: 22, volatility: 1.6, session: 'New York' },
  ],
  Crypto: [
    { symbol: 'BTC/USD', name: 'Bitcoin', currency: 'BTC', price: 68214, dp: 0, pip: 1, spread: 32, volatility: 78, session: '24/7' },
    { symbol: 'ETH/USD', name: 'Ethereum', currency: 'ETH', price: 3742.6, dp: 1, pip: 0.1, spread: 2.5, volatility: 6.4, session: '24/7' },
    { symbol: 'LTC/USD', name: 'Litecoin', currency: 'BTC', price: 84.62, dp: 2, pip: 0.01, spread: 0.17, volatility: 0.32, session: '24/7' },
    { symbol: 'XRP/USD', name: 'Ripple', currency: 'BTC', price: 0.6284, dp: 4, pip: 0.0001, spread: 0.0012, volatility: 0.0031, session: '24/7' },
    { symbol: 'SOL/USD', name: 'Solana', currency: 'ETH', price: 168.42, dp: 2, pip: 0.01, spread: 0.34, volatility: 0.86, session: '24/7' },
  ],
};

export const allInstruments = Object.entries(instruments).flatMap(([group, rows]) =>
  rows.map((row) => ({ ...row, group })),
);

export const sessions = [
  { name: 'Sydney', opens: 21, closes: 6 },
  { name: 'Tokyo', opens: 0, closes: 9 },
  { name: 'London', opens: 7, closes: 16 },
  { name: 'New York', opens: 12, closes: 21 },
];

export const clientSentiment = [
  { symbol: 'EUR/USD', long: 62 },
  { symbol: 'GBP/USD', long: 44 },
  { symbol: 'USD/JPY', long: 29 },
  { symbol: 'XAU/USD', long: 78 },
  { symbol: 'US500', long: 66 },
  { symbol: 'BTC/USD', long: 71 },
];

/** Currencies whose economic releases move each instrument most. */
export const instrumentDrivers = {
  'EUR/USD': ['EUR', 'USD'],
  'GBP/USD': ['GBP', 'USD'],
  'USD/JPY': ['USD', 'JPY'],
  'AUD/USD': ['AUD', 'USD', 'CNY'],
  'USD/CAD': ['USD', 'CAD'],
  'XAU/USD': ['USD'],
  US500: ['USD'],
  NAS100: ['USD'],
  GER40: ['DEM', 'EUR'],
  UK100: ['GBP'],
  JP225: ['JPY'],
};
