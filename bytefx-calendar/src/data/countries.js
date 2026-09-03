/**
 * Country / currency reference data.
 *
 * `iso` is the ISO-3166 alpha-2 code used to build the flag image URL. Flags are
 * served as images rather than emoji because emoji flags do not render at all on
 * Windows, which is where most of this app is viewed.
 *
 * `region` drives the grouping in the country selector, `bank` the central-bank
 * panels, and `weight` roughly how market-moving that economy's data tends to be.
 */

export const countries = [
  // --- Americas -----------------------------------------------------------
  { code: 'USD', iso: 'us', country: 'United States', region: 'Americas', bank: 'Federal Reserve', bankShort: 'Fed', rate: '4.50%', weight: 10 },
  { code: 'CAD', iso: 'ca', country: 'Canada', region: 'Americas', bank: 'Bank of Canada', bankShort: 'BoC', rate: '2.75%', weight: 7 },
  { code: 'BRL', iso: 'br', country: 'Brazil', region: 'Americas', bank: 'Banco Central do Brasil', bankShort: 'BCB', rate: '14.75%', weight: 5 },
  { code: 'MXN', iso: 'mx', country: 'Mexico', region: 'Americas', bank: 'Banco de México', bankShort: 'Banxico', rate: '8.50%', weight: 5 },
  { code: 'ARS', iso: 'ar', country: 'Argentina', region: 'Americas', bank: 'Banco Central de la República Argentina', bankShort: 'BCRA', rate: '29.00%', weight: 3 },
  { code: 'CLP', iso: 'cl', country: 'Chile', region: 'Americas', bank: 'Banco Central de Chile', bankShort: 'BCCh', rate: '4.75%', weight: 3 },
  { code: 'COP', iso: 'co', country: 'Colombia', region: 'Americas', bank: 'Banco de la República', bankShort: 'BanRep', rate: '9.25%', weight: 2 },

  // --- Europe -------------------------------------------------------------
  { code: 'EUR', iso: 'eu', country: 'Euro area', region: 'Europe', bank: 'European Central Bank', bankShort: 'ECB', rate: '2.15%', weight: 10 },
  { code: 'GBP', iso: 'gb', country: 'United Kingdom', region: 'Europe', bank: 'Bank of England', bankShort: 'BoE', rate: '4.00%', weight: 9 },
  { code: 'CHF', iso: 'ch', country: 'Switzerland', region: 'Europe', bank: 'Swiss National Bank', bankShort: 'SNB', rate: '0.00%', weight: 7 },
  { code: 'SEK', iso: 'se', country: 'Sweden', region: 'Europe', bank: 'Sveriges Riksbank', bankShort: 'Riksbank', rate: '2.00%', weight: 5 },
  { code: 'NOK', iso: 'no', country: 'Norway', region: 'Europe', bank: 'Norges Bank', bankShort: 'Norges', rate: '4.25%', weight: 5 },
  { code: 'DKK', iso: 'dk', country: 'Denmark', region: 'Europe', bank: 'Danmarks Nationalbank', bankShort: 'DN', rate: '1.85%', weight: 3 },
  { code: 'PLN', iso: 'pl', country: 'Poland', region: 'Europe', bank: 'Narodowy Bank Polski', bankShort: 'NBP', rate: '5.00%', weight: 4 },
  { code: 'CZK', iso: 'cz', country: 'Czechia', region: 'Europe', bank: 'Česká národní banka', bankShort: 'ČNB', rate: '3.50%', weight: 3 },
  { code: 'HUF', iso: 'hu', country: 'Hungary', region: 'Europe', bank: 'Magyar Nemzeti Bank', bankShort: 'MNB', rate: '6.50%', weight: 3 },
  { code: 'TRY', iso: 'tr', country: 'Türkiye', region: 'Europe', bank: 'Türkiye Cumhuriyet Merkez Bankası', bankShort: 'CBRT', rate: '43.00%', weight: 4 },
  { code: 'RUB', iso: 'ru', country: 'Russia', region: 'Europe', bank: 'Bank of Russia', bankShort: 'CBR', rate: '17.00%', weight: 3 },

  // Individual euro-area members still publish their own national data.
  { code: 'DEM', iso: 'de', country: 'Germany', region: 'Europe', bank: 'Deutsche Bundesbank', bankShort: 'Buba', currencyOf: 'EUR', weight: 8 },
  { code: 'FRF', iso: 'fr', country: 'France', region: 'Europe', bank: 'Banque de France', bankShort: 'BdF', currencyOf: 'EUR', weight: 7 },
  { code: 'ITL', iso: 'it', country: 'Italy', region: 'Europe', bank: 'Banca d’Italia', bankShort: 'BdI', currencyOf: 'EUR', weight: 6 },
  { code: 'ESP', iso: 'es', country: 'Spain', region: 'Europe', bank: 'Banco de España', bankShort: 'BdE', currencyOf: 'EUR', weight: 5 },

  // --- Asia-Pacific -------------------------------------------------------
  { code: 'JPY', iso: 'jp', country: 'Japan', region: 'Asia-Pacific', bank: 'Bank of Japan', bankShort: 'BoJ', rate: '0.50%', weight: 9 },
  { code: 'CNY', iso: 'cn', country: 'China', region: 'Asia-Pacific', bank: "People's Bank of China", bankShort: 'PBoC', rate: '3.00%', weight: 9 },
  { code: 'AUD', iso: 'au', country: 'Australia', region: 'Asia-Pacific', bank: 'Reserve Bank of Australia', bankShort: 'RBA', rate: '3.60%', weight: 8 },
  { code: 'NZD', iso: 'nz', country: 'New Zealand', region: 'Asia-Pacific', bank: 'Reserve Bank of New Zealand', bankShort: 'RBNZ', rate: '3.00%', weight: 6 },
  { code: 'INR', iso: 'in', country: 'India', region: 'Asia-Pacific', bank: 'Reserve Bank of India', bankShort: 'RBI', rate: '5.50%', weight: 7 },
  { code: 'KRW', iso: 'kr', country: 'South Korea', region: 'Asia-Pacific', bank: 'Bank of Korea', bankShort: 'BoK', rate: '2.50%', weight: 5 },
  { code: 'SGD', iso: 'sg', country: 'Singapore', region: 'Asia-Pacific', bank: 'Monetary Authority of Singapore', bankShort: 'MAS', rate: '1.55%', weight: 4 },
  { code: 'HKD', iso: 'hk', country: 'Hong Kong', region: 'Asia-Pacific', bank: 'Hong Kong Monetary Authority', bankShort: 'HKMA', rate: '4.75%', weight: 4 },
  { code: 'TWD', iso: 'tw', country: 'Taiwan', region: 'Asia-Pacific', bank: 'Central Bank of the R.O.C.', bankShort: 'CBC', rate: '2.00%', weight: 3 },
  { code: 'IDR', iso: 'id', country: 'Indonesia', region: 'Asia-Pacific', bank: 'Bank Indonesia', bankShort: 'BI', rate: '4.75%', weight: 3 },
  { code: 'THB', iso: 'th', country: 'Thailand', region: 'Asia-Pacific', bank: 'Bank of Thailand', bankShort: 'BoT', rate: '1.50%', weight: 3 },
  { code: 'MYR', iso: 'my', country: 'Malaysia', region: 'Asia-Pacific', bank: 'Bank Negara Malaysia', bankShort: 'BNM', rate: '2.75%', weight: 2 },
  { code: 'PHP', iso: 'ph', country: 'Philippines', region: 'Asia-Pacific', bank: 'Bangko Sentral ng Pilipinas', bankShort: 'BSP', rate: '4.75%', weight: 2 },

  // --- Middle East & Africa ----------------------------------------------
  { code: 'ZAR', iso: 'za', country: 'South Africa', region: 'Middle East & Africa', bank: 'South African Reserve Bank', bankShort: 'SARB', rate: '7.00%', weight: 4 },
  { code: 'ILS', iso: 'il', country: 'Israel', region: 'Middle East & Africa', bank: 'Bank of Israel', bankShort: 'BoI', rate: '4.50%', weight: 3 },
  { code: 'AED', iso: 'ae', country: 'United Arab Emirates', region: 'Middle East & Africa', bank: 'Central Bank of the UAE', bankShort: 'CBUAE', rate: '4.40%', weight: 2 },
  { code: 'SAR', iso: 'sa', country: 'Saudi Arabia', region: 'Middle East & Africa', bank: 'Saudi Central Bank', bankShort: 'SAMA', rate: '5.00%', weight: 2 },
];

/** Non-country codes that still need a symbol in tables (metals, energy, crypto). */
export const symbolMeta = {
  XAU: { label: 'Gold', glyph: 'Au', tint: '#C79A2E' },
  XAG: { label: 'Silver', glyph: 'Ag', tint: '#8A96A3' },
  XPT: { label: 'Platinum', glyph: 'Pt', tint: '#6E7B8B' },
  OIL: { label: 'Crude oil', glyph: 'Oil', tint: '#3D4653' },
  BTC: { label: 'Bitcoin', glyph: '₿', tint: '#F0972B' },
  ETH: { label: 'Ethereum', glyph: 'Ξ', tint: '#6A7FD1' },
  ALL: { label: 'Global', glyph: '🌐', tint: '#1357BC' },
};

export const countryByCode = countries.reduce((map, country) => {
  map[country.code] = country;
  return map;
}, {});

/** Region → countries, in the order regions should appear in the selector. */
export const regions = ['Americas', 'Europe', 'Asia-Pacific', 'Middle East & Africa'];

export const countriesByRegion = regions.map((region) => ({
  region,
  countries: countries.filter((country) => country.region === region),
}));

/** The eight majors — the default filter selection and the "majors" preset. */
export const majorCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];

export const currencyPresets = [
  { id: 'majors', label: 'Majors', codes: majorCurrencies },
  { id: 'g7', label: 'G7', codes: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'DEM', 'FRF', 'ITL'] },
  { id: 'emerging', label: 'Emerging', codes: ['CNY', 'INR', 'BRL', 'MXN', 'ZAR', 'TRY', 'IDR', 'PLN'] },
  { id: 'apac', label: 'Asia-Pacific', codes: countries.filter((c) => c.region === 'Asia-Pacific').map((c) => c.code) },
  { id: 'all', label: 'All', codes: countries.map((c) => c.code) },
];

export const categories = [
  'Employment',
  'Inflation',
  'Interest rates',
  'GDP & growth',
  'PMI & surveys',
  'Housing',
  'Consumer',
  'Manufacturing',
  'Trade & current account',
  'Government & fiscal',
  'Energy & inventories',
  'Speeches',
  'Bond auctions',
  'Holidays',
];

/**
 * Timezones as fixed UTC offsets in minutes. A fixed offset keeps the
 * conversion deterministic — no DST ambiguity between server and client render.
 */
export const timezones = [
  { id: 'utc', label: '(UTC+00:00) UTC', offset: 0 },
  { id: 'london', label: '(UTC+01:00) London', offset: 60 },
  { id: 'frankfurt', label: '(UTC+02:00) Frankfurt · Paris', offset: 120 },
  { id: 'newyork', label: '(UTC-04:00) New York', offset: -240 },
  { id: 'chicago', label: '(UTC-05:00) Chicago', offset: -300 },
  { id: 'losangeles', label: '(UTC-07:00) Los Angeles', offset: -420 },
  { id: 'saopaulo', label: '(UTC-03:00) São Paulo', offset: -180 },
  { id: 'johannesburg', label: '(UTC+02:00) Johannesburg', offset: 120 },
  { id: 'dubai', label: '(UTC+04:00) Dubai', offset: 240 },
  { id: 'mumbai', label: '(UTC+05:30) Mumbai', offset: 330 },
  { id: 'singapore', label: '(UTC+08:00) Singapore', offset: 480 },
  { id: 'hongkong', label: '(UTC+08:00) Hong Kong', offset: 480 },
  { id: 'tokyo', label: '(UTC+09:00) Tokyo', offset: 540 },
  { id: 'sydney', label: '(UTC+10:00) Sydney', offset: 600 },
  { id: 'auckland', label: '(UTC+12:00) Auckland', offset: 720 },
];

export function timezoneById(id) {
  return timezones.find((zone) => zone.id === id) ?? timezones[0];
}

/** Back-compat shim for anything still importing the old currency map. */
export const currencyMeta = countries.reduce((map, country) => {
  map[country.code] = { country: country.country, iso: country.iso };
  return map;
}, {});
