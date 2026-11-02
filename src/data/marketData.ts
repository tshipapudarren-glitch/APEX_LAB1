import { AssetInfo, Candle, SetupDNA, MarketDecisionReport, VolatilityMetrics, LiquidityRadarData, SessionMetrics } from '../types/market';

export const ASSETS: Record<string, AssetInfo> = {
  NQ: {
    symbol: 'NQ',
    name: 'E-mini Nasdaq 100 Futures',
    category: 'Futures',
    price: 20428.25,
    change24h: 184.50,
    change24hPct: 0.91,
    regime: 'TRENDING_BULL',
    atr: 168.4,
    volume24h: '482.1K contracts',
    tickSize: 0.25,
  },
  ES: {
    symbol: 'ES',
    name: 'E-mini S&P 500 Futures',
    category: 'Futures',
    price: 5894.50,
    change24h: 32.75,
    change24hPct: 0.56,
    regime: 'TRENDING_BULL',
    atr: 44.2,
    volume24h: '1.24M contracts',
    tickSize: 0.25,
  },
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin Perpetual (USDT)',
    category: 'Crypto',
    price: 91480.00,
    change24h: 2420.00,
    change24hPct: 2.71,
    regime: 'VOLATILE_EXPANSION',
    atr: 2150.0,
    volume24h: '$18.4B',
    tickSize: 1.0,
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum Perpetual (USDT)',
    category: 'Crypto',
    price: 3142.50,
    change24h: -18.20,
    change24hPct: -0.58,
    regime: 'RANGING',
    atr: 98.4,
    volume24h: '$8.2B',
    tickSize: 0.05,
  },
  EURUSD: {
    symbol: 'EURUSD',
    name: 'EUR / USD Spot',
    category: 'FX',
    price: 1.08465,
    change24h: 0.00215,
    change24hPct: 0.20,
    regime: 'LOW_QUALITY',
    atr: 0.0054,
    volume24h: '$64.2B',
    tickSize: 0.00005,
  },
  GOLD: {
    symbol: 'GOLD',
    name: 'Gold Spot XAU/USD',
    category: 'Commodity',
    price: 2748.80,
    change24h: 14.30,
    change24hPct: 0.52,
    regime: 'TRENDING_BULL',
    atr: 28.5,
    volume24h: '$22.8B',
    tickSize: 0.10,
  },
};

// Generates 60 realistic candles leading up to current price
export function generateCandlesForAsset(symbol: string): Candle[] {
  const asset = ASSETS[symbol] || ASSETS.NQ;
  const basePrice = asset.price;
  const atr = asset.atr;
  const numBars = 55;
  const candles: Candle[] = [];

  let currentClose = basePrice - atr * 1.8;
  const now = Date.now();
  const barIntervalMs = 15 * 60 * 1000; // 15-min bars

  for (let i = 0; i < numBars; i++) {
    const timestamp = now - (numBars - i) * barIntervalMs;
    const dateObj = new Date(timestamp);
    const time = `${dateObj.getUTCHours().toString().padStart(2, '0')}:${dateObj.getUTCMinutes().toString().padStart(2, '0')}`;

    // Session tag
    const hour = dateObj.getUTCHours();
    let session: 'ASIA' | 'LONDON' | 'NY_AM' | 'NY_PM' = 'ASIA';
    if (hour >= 7 && hour < 13) session = 'LONDON';
    else if (hour >= 13 && hour < 18) session = 'NY_AM';
    else if (hour >= 18 && hour < 22) session = 'NY_PM';

    // Walk with slight trend
    const drift = (i / numBars) * (atr * 0.06);
    const randomStep = (Math.sin(i * 0.4) + (Math.random() - 0.48)) * (atr * 0.12);
    const open = currentClose;
    const close = Math.round((open + drift + randomStep) * 100) / 100;
    const high = Math.round((Math.max(open, close) + Math.random() * (atr * 0.08)) * 100) / 100;
    const low = Math.round((Math.min(open, close) - Math.random() * (atr * 0.08)) * 100) / 100;
    const volume = Math.floor(1200 + Math.random() * 3400 + (session === 'NY_AM' ? 2800 : 0));
    const delta = Math.floor((close > open ? 1 : -1) * (volume * (0.15 + Math.random() * 0.35)));

    let marker: 'BOS' | 'CHOCH' | 'SWEEP' | 'FVG' | 'OB' | undefined = undefined;
    if (i === 18) marker = 'SWEEP';
    if (i === 24) marker = 'CHOCH';
    if (i === 36) marker = 'FVG';
    if (i === 44) marker = 'OB';
    if (i === 50) marker = 'BOS';

    candles.push({
      time,
      timestamp,
      open,
      high,
      low,
      close,
      volume,
      delta,
      session,
      marker,
    });
    currentClose = close;
  }

  // Anchor last candle close to asset price
  candles[candles.length - 1].close = basePrice;
  return candles;
}

export const SETUP_DNA_DATABASE: SetupDNA[] = [
  {
    id: 'DNA-NQ-SWEEP-NYAM-042',
    name: 'ICT Turtle Soup Sell-Side Liquidity Sweep & Displacement',
    symbol: 'NQ',
    timeframe: '15m / 5m Execution',
    session: 'NY_AM',
    structure: 'Liquidity Sweep',
    volatilityCondition: 'Compression',
    qualityScore: 94,
    grade: 'A+',
    status: 'ACTIVE',
    trendAlignment: 'Aligned',
    invalidationLevel: 20380.00,
    entryZone: [20410.00, 20425.00],
    targets: { tp1: 20475.00, tp2: 20530.00, tp3: 20610.00 },
    riskReward: 3.8,
    dnaFingerprint: '§94-NQ-SWP-NYAM-CMP-POSΔ',
    qualificationRationale: 'Prerequisite Asian Low liquidity purge executed. 5m Displacement candle broke structure upward with an unfilled 18-point Bullish Fair Value Gap. Cumulative delta flipped net positive (+1,820 contracts).',
    disqualificationCriteria: '5m candle body closure below 20,380.00 or Dollar Index (DXY) impulsive continuation break.',
    failurePatterns: [
      'Entering before London/NY opening liquidity purge',
      'Ignoring 1m aggressive limit absorption on the bid',
      'Trading into HTF daily bearish supply block without 5m confirmation',
    ],
    historicalMatches: {
      totalMatches: 84,
      winRate: 76.2,
      avgR: 2.94,
      avgDurationBars: 14,
      similarInstances: [
        { date: '2026-10-24', symbol: 'NQ', outcome: 'TARGET_HIT', rMultiple: 3.8, duration: '45m', notes: 'Identical Asian low sweep at 13:45 UTC, expanded straight into daily POC.' },
        { date: '2026-10-18', symbol: 'NQ', outcome: 'TARGET_HIT', rMultiple: 2.5, duration: '30m', notes: 'Reached TP2 before lunch chop commenced.' },
        { date: '2026-10-11', symbol: 'NQ', outcome: 'STOPPED_OUT', rMultiple: -1.0, duration: '12m', notes: 'CPI release triggered violent second leg down, sweeping invalidation.' },
        { date: '2026-09-29', symbol: 'NQ', outcome: 'TARGET_HIT', rMultiple: 4.1, duration: '65m', notes: 'Runner captured full session extension to +180 points.' },
      ],
    },
  },
  {
    id: 'DNA-ES-FVG-PULLBACK-118',
    name: 'Institutional Order Block & Imbalance Mitigation Long',
    symbol: 'ES',
    timeframe: '30m / 5m',
    session: 'LONDON',
    structure: 'FVG Mitigation',
    volatilityCondition: 'Equilibrium',
    qualityScore: 89,
    grade: 'A',
    status: 'ACTIVE',
    trendAlignment: 'Aligned',
    invalidationLevel: 5878.50,
    entryZone: [5886.00, 5891.00],
    targets: { tp1: 5912.00, tp2: 5928.00, tp3: 5945.00 },
    riskReward: 3.2,
    dnaFingerprint: '§89-ES-FVG-LDN-EQU-BULL',
    qualificationRationale: '4H trend structure firmly bullish. London session retested 30m bullish demand order block with tight ATR compression and negative delta absorption.',
    disqualificationCriteria: 'Acceptance below Value Area Low 5878.50 with sustained tick volume.',
    failurePatterns: [
      'Entering during pre-market vacuum without volume participation',
      'Failing to scale 50% off at TP1 before session transition',
    ],
    historicalMatches: {
      totalMatches: 62,
      winRate: 71.0,
      avgR: 2.65,
      avgDurationBars: 18,
      similarInstances: [
        { date: '2026-10-22', symbol: 'ES', outcome: 'TARGET_HIT', rMultiple: 3.1, duration: '1h 20m', notes: 'Clean mitigation into NY AM session push.' },
        { date: '2026-10-15', symbol: 'ES', outcome: 'TARGET_HIT', rMultiple: 2.8, duration: '55m', notes: 'TP1 and TP2 hit, trailed runner.' },
        { date: '2026-10-04', symbol: 'ES', outcome: 'SCRATCH', rMultiple: 0.1, duration: '40m', notes: 'Stalled at resistance, exited at breakeven.' },
      ],
    },
  },
  {
    id: 'DNA-BTC-EXP-BREAKOUT-703',
    name: 'Volatility Compression Coil & Range Expansion Breakout',
    symbol: 'BTC',
    timeframe: '1H / 15m',
    session: 'ASIA',
    structure: 'BOS Continuation',
    volatilityCondition: 'Expansion',
    qualityScore: 91,
    grade: 'A+',
    status: 'ACTIVE',
    trendAlignment: 'Aligned',
    invalidationLevel: 90200.00,
    entryZone: [91100.00, 91450.00],
    targets: { tp1: 92800.00, tp2: 94200.00, tp3: 96000.00 },
    riskReward: 4.1,
    dnaFingerprint: '§91-BTC-BOS-ASIA-EXP-CVD+',
    qualificationRationale: 'Bollinger Band width reached 6-month compression percentile (97th). Open Interest expansion combined with spot delta accumulation.',
    disqualificationCriteria: 'Rejection back into the 90,200 range with aggressive liquidation cascade.',
    failurePatterns: [
      'Buying local wicks before 1H candle closes above the breakout trigger',
      'Overleveraging during high funding rate spikes',
    ],
    historicalMatches: {
      totalMatches: 49,
      winRate: 73.5,
      avgR: 3.52,
      avgDurationBars: 22,
      similarInstances: [
        { date: '2026-10-20', symbol: 'BTC', outcome: 'TARGET_HIT', rMultiple: 4.5, duration: '3h', notes: 'Expansion reached $93,400 within 2 hours.' },
        { date: '2026-09-14', symbol: 'BTC', outcome: 'TARGET_HIT', rMultiple: 3.8, duration: '4h 15m', notes: 'Clean run after Asia 02:00 UTC compression.' },
        { date: '2026-08-28', symbol: 'BTC', outcome: 'STOPPED_OUT', rMultiple: -1.0, duration: '35m', notes: 'Fakeout wick stopped out into consolidation.' },
      ],
    },
  },
  {
    id: 'DNA-ETH-RANGE-ROT-225',
    name: 'Value Area Rotation & Failed Auction Fade',
    symbol: 'ETH',
    timeframe: '15m',
    session: 'NY_PM',
    structure: 'Range SFP',
    volatilityCondition: 'Compression',
    qualityScore: 78,
    grade: 'B',
    status: 'FORMING',
    trendAlignment: 'Neutral',
    invalidationLevel: 3175.00,
    entryZone: [3150.00, 3160.00],
    targets: { tp1: 3120.00, tp2: 3095.00, tp3: 3070.00 },
    riskReward: 2.4,
    dnaFingerprint: '§78-ETH-SFP-NYPM-CMP-NEUT',
    qualificationRationale: 'Auction failed to accept above VAH 3,165. Delta shows clear exhaustion with lower volume on the push.',
    disqualificationCriteria: 'Sustained acceptance above 3,175 with new buying participants.',
    failurePatterns: [
      'Shorting into strong Bitcoin continuation momentum',
      'Ignoring late session squeeze risk into 19:30 UTC',
    ],
    historicalMatches: {
      totalMatches: 53,
      winRate: 64.2,
      avgR: 2.1,
      avgDurationBars: 16,
      similarInstances: [
        { date: '2026-10-16', symbol: 'ETH', outcome: 'TARGET_HIT', rMultiple: 2.3, duration: '1h 10m', notes: 'Rotated straight to VAL.' },
        { date: '2026-10-09', symbol: 'ETH', outcome: 'STOPPED_OUT', rMultiple: -1.0, duration: '20m', notes: 'Late session squeeze stopped out.' },
      ],
    },
  },
  {
    id: 'DNA-GOLD-SWEEP-OB-551',
    name: 'Asian Session High Sweep into Institutional H4 Demand',
    symbol: 'GOLD',
    timeframe: '30m',
    session: 'LONDON',
    structure: 'Liquidity Sweep',
    volatilityCondition: 'Compression',
    qualityScore: 92,
    grade: 'A+',
    status: 'ACTIVE',
    trendAlignment: 'Aligned',
    invalidationLevel: 2736.00,
    entryZone: [2744.00, 2748.00],
    targets: { tp1: 2765.00, tp2: 2782.00, tp3: 2800.00 },
    riskReward: 3.6,
    dnaFingerprint: '§92-XAU-SWP-LDN-CMP-POSΔ',
    qualificationRationale: 'Geopolitical macro tailwind combined with clean London liquidity sweep of 2740 low. Absorption on tick level.',
    disqualificationCriteria: 'Break of 2736 support on hourly closing basis.',
    failurePatterns: [
      'Trading directly through London gold fixing (10:30 UTC and 15:00 UTC) with wide stops',
    ],
    historicalMatches: {
      totalMatches: 72,
      winRate: 75.0,
      avgR: 3.12,
      avgDurationBars: 19,
      similarInstances: [
        { date: '2026-10-21', symbol: 'GOLD', outcome: 'TARGET_HIT', rMultiple: 3.6, duration: '2h', notes: 'Clean breakout to fresh record levels.' },
      ],
    },
  },
];

export const VOLATILITY_DATA: Record<string, VolatilityMetrics> = {
  NQ: {
    compressionScore: 82,
    expansionProbability: 88,
    currentATR: 168.4,
    baselineATR: 122.0,
    atrRatio: 1.38,
    sessionExhaustionPct: 44,
    breakoutPressure: 'HIGH_BULL',
    expectedRangeUpper: 20560.00,
    expectedRangeLower: 20310.00,
    keltnerWidth: 142.5,
    bollingerWidth: 112.0,
  },
  ES: {
    compressionScore: 74,
    expansionProbability: 79,
    currentATR: 44.2,
    baselineATR: 36.5,
    atrRatio: 1.21,
    sessionExhaustionPct: 52,
    breakoutPressure: 'HIGH_BULL',
    expectedRangeUpper: 5932.00,
    expectedRangeLower: 5865.00,
    keltnerWidth: 38.0,
    bollingerWidth: 29.5,
  },
  BTC: {
    compressionScore: 91,
    expansionProbability: 94,
    currentATR: 2150.0,
    baselineATR: 1420.0,
    atrRatio: 1.51,
    sessionExhaustionPct: 38,
    breakoutPressure: 'HIGH_BULL',
    expectedRangeUpper: 94800.00,
    expectedRangeLower: 89200.00,
    keltnerWidth: 1980.0,
    bollingerWidth: 1420.0,
  },
};

export const LIQUIDITY_DATA: Record<string, LiquidityRadarData> = {
  NQ: {
    bslPools: [
      { price: 20485.50, volume: 1840, description: 'Previous Day High (PDH) buy stops', distanceTicks: 228 },
      { price: 20540.00, volume: 2950, description: 'Weekly Key Level resting liquidity', distanceTicks: 446 },
      { price: 20615.00, volume: 4120, description: 'Unfinished auction & ATH barrier', distanceTicks: 746 },
    ],
    sslPools: [
      { price: 20380.00, volume: 1420, description: 'Asian Session Low trailing stops (Swept)', distanceTicks: -192 },
      { price: 20320.00, volume: 2280, description: 'Single print demand boundary', distanceTicks: -432 },
    ],
    absorptionIndex: 88,
    restingStopEstimate: 12450,
    poc: 20412.50,
    vah: 20465.00,
    val: 20370.00,
    vwap: 20418.75,
    orderBookImbalance: 38.4,
  },
  ES: {
    bslPools: [
      { price: 5915.00, volume: 4200, description: 'Session swing high buy stops', distanceTicks: 82 },
      { price: 5935.00, volume: 7100, description: 'Overnight resting liquidity cluster', distanceTicks: 162 },
    ],
    sslPools: [
      { price: 5880.00, volume: 3800, description: 'Value Area Low resting sell stops', distanceTicks: -58 },
      { price: 5865.00, volume: 5400, description: 'Weekly pivot support', distanceTicks: -118 },
    ],
    absorptionIndex: 79,
    restingStopEstimate: 21800,
    poc: 5892.25,
    vah: 5908.50,
    val: 5882.00,
    vwap: 5893.10,
    orderBookImbalance: 24.2,
  },
  BTC: {
    bslPools: [
      { price: 92500.00, volume: 840, description: 'Short liquidation cluster ($140M)', distanceTicks: 1020 },
      { price: 94000.00, volume: 1650, description: 'Major psychological barrier & stops ($280M)', distanceTicks: 2520 },
    ],
    sslPools: [
      { price: 90200.00, volume: 620, description: 'Weekly range low stops ($95M)', distanceTicks: -1280 },
    ],
    absorptionIndex: 94,
    restingStopEstimate: 34200,
    poc: 91200.00,
    vah: 92100.00,
    val: 90400.00,
    vwap: 91350.00,
    orderBookImbalance: 44.8,
  },
};

export const SESSION_METRICS: SessionMetrics = {
  currentSession: 'NY_AM',
  timeUtc: '14:15:00 UTC',
  sessionHigh: 20448.50,
  sessionLow: 20376.25,
  sessionRange: 72.25,
  initialBalanceHigh: 20435.00,
  initialBalanceLow: 20388.00,
  sessionWinRates: {
    ASIA: { winRate: 64.2, avgR: 1.85, bestSetup: 'Asian Range Mean Reversion' },
    LONDON: { winRate: 74.8, avgR: 3.10, bestSetup: 'London Judas Low Liquidity Sweep' },
    NY_AM: { winRate: 78.4, avgR: 3.45, bestSetup: 'ICT SFP + Trend Alignment Breakout' },
    NY_PM: { winRate: 62.0, avgR: 1.90, bestSetup: 'Power Hour Unfinished Auction Run' },
  },
};
