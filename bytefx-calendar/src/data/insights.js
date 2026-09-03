/**
 * Long-form research for the Insights section. `photo` is an Unsplash photo id
 * resolved by `components/ui/Photo.jsx`.
 */

export const insightTopics = [
  'All',
  'Macro',
  'FX strategy',
  'Rates',
  'Commodities',
  'Emerging markets',
  'Education',
];

export const insights = [
  {
    id: 'positioning-into-payrolls',
    topic: 'FX strategy',
    title: 'How to position into payrolls without guessing the number',
    standfirst:
      'The trade that works on nonfarm Friday is rarely a directional one. A look at what the options market prices, and what actually happens.',
    author: 'Marta Reyes',
    role: 'Head of FX Strategy',
    readTime: '8 min',
    published: 'This week',
    featured: true,
    photo: 'photo-1590283603385-17ffb3a7f29f',
    tags: ['USD', 'Employment', 'Volatility'],
    excerpt:
      'Implied volatility on the day of the release consistently overprices the realised move in the hour that follows — but underprices the move over the full session. That gap is the trade.',
  },
  {
    id: 'reading-a-dot-plot',
    topic: 'Rates',
    title: 'Reading a dot plot properly',
    standfirst:
      'The median dot gets the headline. The dispersion around it tells you far more about what the committee will actually do.',
    author: 'Daniel Osei',
    role: 'Rates Strategist',
    readTime: '6 min',
    published: 'This week',
    photo: 'photo-1554224155-6726b3ff858f',
    tags: ['USD', 'Interest rates', 'Fed'],
    excerpt:
      'A tightly clustered set of projections and a widely dispersed one can share the same median while implying completely different probabilities of a change in direction.',
  },
  {
    id: 'carry-trade-anatomy',
    topic: 'FX strategy',
    title: 'Anatomy of a carry trade unwind',
    standfirst:
      'Carry positions build slowly and unwind in hours. What the last three episodes had in common.',
    author: 'Marta Reyes',
    role: 'Head of FX Strategy',
    readTime: '9 min',
    published: 'Last week',
    photo: 'photo-1518186285589-2f7649de83e0',
    tags: ['JPY', 'Carry', 'Risk'],
    excerpt:
      'Every unwind in the past decade began in the funding currency rather than the high-yielder — which is why watching yen volatility beats watching peso spot.',
  },
  {
    id: 'inflation-basket-mechanics',
    topic: 'Macro',
    title: 'Why CPI and PCE tell different stories',
    standfirst:
      'Two inflation measures, two baskets, two answers — and one of them is the one the Fed targets.',
    author: 'Ines Kovač',
    role: 'Senior Economist',
    readTime: '7 min',
    published: 'Last week',
    photo: 'photo-1526304640581-d334cdbbf45e',
    tags: ['USD', 'Inflation', 'Education'],
    excerpt:
      'The weight given to shelter is the single biggest source of the gap. Understanding it explains most of the persistent spread between the two series.',
  },
  {
    id: 'commodity-currencies',
    topic: 'Commodities',
    title: 'The commodity currencies are not what they were',
    standfirst:
      'The old relationship between crude and the Canadian dollar has weakened considerably. Here is what replaced it.',
    author: 'Tom Whitfield',
    role: 'Commodities Analyst',
    readTime: '6 min',
    published: 'Last week',
    photo: 'photo-1582560475093-ba66accbc424',
    tags: ['CAD', 'AUD', 'Oil'],
    excerpt:
      'Rate differentials now explain more of the variance in CAD than oil does — a reversal of the relationship that held for most of the previous two decades.',
  },
  {
    id: 'em-fx-after-the-cuts',
    topic: 'Emerging markets',
    title: 'Emerging market FX after the first cut',
    standfirst:
      'The historical record on how EM currencies behave once the Fed starts easing is less encouraging than the consensus assumes.',
    author: 'Daniel Osei',
    role: 'Rates Strategist',
    readTime: '10 min',
    published: '2 weeks ago',
    photo: 'photo-1518546305927-5a555bb7020d',
    tags: ['EM', 'USD', 'Rates'],
    excerpt:
      'In four of the past six easing cycles, EM currencies weakened in the three months following the first cut. The reason is what usually causes the cut.',
  },
  {
    id: 'central-bank-communication',
    topic: 'Macro',
    title: 'How central banks say things without saying them',
    standfirst:
      'A short field guide to the phrases that matter, and the ones that are there to fill space.',
    author: 'Ines Kovač',
    role: 'Senior Economist',
    readTime: '5 min',
    published: '2 weeks ago',
    photo: 'photo-1541354329998-f4d54f6cbef1',
    tags: ['Central banks', 'Education'],
    excerpt:
      '“Data dependent” means nothing on its own. Which data, and over what horizon, is where the actual information sits.',
  },
  {
    id: 'volatility-around-releases',
    topic: 'Education',
    title: 'What actually happens in the ten minutes after a release',
    standfirst:
      'Spreads widen, liquidity thins, and the first print is frequently not the one that sticks.',
    author: 'Tom Whitfield',
    role: 'Commodities Analyst',
    readTime: '5 min',
    published: '3 weeks ago',
    photo: 'photo-1611974789855-9c2a0a7236a3',
    tags: ['Execution', 'Volatility', 'Education'],
    excerpt:
      'Median spread widening across the majors in the first sixty seconds after a high-impact release is roughly four times the session average.',
  },
  {
    id: 'gold-central-bank-bid',
    topic: 'Commodities',
    title: 'The official-sector bid under gold',
    standfirst:
      'Central bank purchases have changed the metal’s relationship with real yields. The question is for how long.',
    author: 'Tom Whitfield',
    role: 'Commodities Analyst',
    readTime: '7 min',
    published: '3 weeks ago',
    photo: 'photo-1610375461246-83df859d849d',
    tags: ['Gold', 'Reserves', 'Macro'],
    excerpt:
      'Official-sector demand is price-insensitive in a way speculative flow is not, which is why the usual inverse relationship with real yields has broken down.',
  },
  {
    id: 'yield-curve-signal',
    topic: 'Rates',
    title: 'The yield curve still works — just not as a timing tool',
    standfirst:
      'Inversion has preceded every recession in the modern record. The lag has ranged from six months to over two years.',
    author: 'Daniel Osei',
    role: 'Rates Strategist',
    readTime: '8 min',
    published: 'Last month',
    photo: 'photo-1543286386-713bdd548da4',
    tags: ['Rates', 'Recession', 'Macro'],
    excerpt:
      'A signal with a two-year confidence interval on its timing is a positioning input, not a trigger.',
  },
  {
    id: 'japan-normalisation',
    topic: 'Macro',
    title: 'Japan’s long walk away from zero',
    standfirst:
      'Three decades of unconventional policy are being unwound one meeting at a time. The global consequences are larger than Japan’s share of GDP suggests.',
    author: 'Ines Kovač',
    role: 'Senior Economist',
    readTime: '11 min',
    published: 'Last month',
    photo: 'photo-1503899036084-c55cdd92da26',
    tags: ['JPY', 'Central banks', 'Macro'],
    excerpt:
      'Japanese institutions are among the largest foreign holders of US Treasuries and European sovereign debt. Rates at home change that calculus.',
  },
  {
    id: 'building-an-alert-strategy',
    topic: 'Education',
    title: 'Building an alert strategy that you will actually read',
    standfirst:
      'Most traders set too many alerts, ignore all of them, then miss the one that mattered.',
    author: 'Marta Reyes',
    role: 'Head of FX Strategy',
    readTime: '4 min',
    published: 'Last month',
    photo: 'photo-1461749280684-dccba630e2f6',
    tags: ['Education', 'Alerts', 'Workflow'],
    excerpt:
      'Tier your alerts by what you would actually do differently on receiving them. Anything that fails that test is noise you have chosen to receive.',
  },
];

export const researchTeam = [
  { name: 'Marta Reyes', role: 'Head of FX Strategy', focus: 'G10 FX, volatility', initials: 'MR' },
  { name: 'Daniel Osei', role: 'Rates Strategist', focus: 'Front end, central banks', initials: 'DO' },
  { name: 'Ines Kovač', role: 'Senior Economist', focus: 'Inflation, growth', initials: 'IK' },
  { name: 'Tom Whitfield', role: 'Commodities Analyst', focus: 'Energy, metals', initials: 'TW' },
];

export const learnSeries = [
  {
    title: 'Reading an economic calendar',
    lessons: 6,
    minutes: 42,
    level: 'Beginner',
    photo: 'photo-1454165804606-c3d57bc86b40',
  },
  {
    title: 'Central banks and the rate path',
    lessons: 8,
    minutes: 64,
    level: 'Intermediate',
    photo: 'photo-1601597111158-2fceff292cdc',
  },
  {
    title: 'Trading the release window',
    lessons: 5,
    minutes: 38,
    level: 'Advanced',
    photo: 'photo-1590283603385-17ffb3a7f29f',
  },
];
