export type MarketRegime =
  | 'TRENDING_BULL'
  | 'TRENDING_BEAR'
  | 'RANGING'
  | 'VOLATILE_EXPANSION'
  | 'LOW_QUALITY';

export type MarketAsset = 'NQ' | 'ES' | 'BTC' | 'ETH' | 'EURUSD' | 'GOLD';

export interface AssetInfo {
  symbol: MarketAsset;
  name: string;
  category: 'Futures' | 'Crypto' | 'FX' | 'Commodity' | 'Indices' | 'Metals' | 'Energy' | 'Synthetics';
  price: number;
  change24h: number;
  change24hPct: number;
  regime: MarketRegime;
  atr: number;
  volume24h: string;
  tickSize: number;
}

export interface Candle {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  delta: number;
  session?: 'ASIA' | 'LONDON' | 'NY_AM' | 'NY_PM';
  marker?: 'BOS' | 'CHOCH' | 'SWEEP' | 'FVG' | 'OB';
}

export interface SetupDNA {
  id: string;
  name: string;
  symbol: MarketAsset;
  timeframe: string;
  session: 'ASIA' | 'LONDON' | 'NY_AM' | 'NY_PM';
  structure: 'BOS Continuation' | 'CHoCH Reversal' | 'Liquidity Sweep' | 'FVG Mitigation' | 'Range SFP';
  volatilityCondition: 'Compression' | 'Expansion' | 'Exhaustion' | 'Equilibrium';
  qualityScore: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C';
  status: 'ACTIVE' | 'FORMING' | 'TRIGGERED' | 'INVALIDATED';
  trendAlignment: 'Aligned' | 'Neutral' | 'Counter-Trend';
  invalidationLevel: number;
  entryZone: [number, number];
  targets: { tp1: number; tp2: number; tp3: number };
  riskReward: number;
  dnaFingerprint: string;
  qualificationRationale: string;
  disqualificationCriteria: string;
  failurePatterns: string[];
  historicalMatches: {
    totalMatches: number;
    winRate: number;
    avgR: number;
    avgDurationBars: number;
    similarInstances: Array<{
      date: string;
      symbol: string;
      outcome: 'TARGET_HIT' | 'STOPPED_OUT' | 'SCRATCH';
      rMultiple: number;
      duration: string;
      notes: string;
    }>;
  };
}

export interface DecisionEngineStatus {
  score: number;
  status: string;
  notes: string;
}

export interface MarketDecisionReport {
  symbol: MarketAsset;
  regime: MarketRegime;
  regimeWeights: {
    trendEngine: number;
    structureEngine: number;
    liquidityEngine: number;
    volatilityEngine: number;
    auctionEngine: number;
    momentumEngine: number;
  };
  whatIsHappening: string;
  whyIsItHappening: string;
  whatCouldHappenNext: {
    primary: { title: string; prob: number; description: string };
    alternate: { title: string; prob: number; description: string };
  };
  whatConfirms: string[];
  whatInvalidates: string[];
  entryAndTargets: {
    entryLow: number;
    entryHigh: number;
    stopLoss: number;
    tp1: number;
    tp2: number;
    tp3: number;
    rrRatio: number;
  };
  engines: {
    structure: DecisionEngineStatus;
    volatility: DecisionEngineStatus & { compressionPct: number; expansionProb: number };
    momentum: DecisionEngineStatus & { rsi: number; deltaDivergence: boolean };
    auction: DecisionEngineStatus & { poc: number; vah: number; val: number };
    liquidity: DecisionEngineStatus & { bsl: number; ssl: number };
    regime: DecisionEngineStatus & { activeRegime: string };
    setupValidation: DecisionEngineStatus & { grade: 'A+' | 'A' | 'B' | 'NO_TRADE' };
  };
}

export interface VolatilityMetrics {
  compressionScore: number; // 0 - 100
  expansionProbability: number; // 0 - 100
  currentATR: number;
  baselineATR: number;
  atrRatio: number;
  sessionExhaustionPct: number;
  breakoutPressure: 'HIGH_BULL' | 'HIGH_BEAR' | 'NEUTRAL_COIL';
  expectedRangeUpper: number;
  expectedRangeLower: number;
  keltnerWidth: number;
  bollingerWidth: number;
}

export interface LiquidityRadarData {
  bslPools: Array<{ price: number; volume: number; description: string; distanceTicks: number }>;
  sslPools: Array<{ price: number; volume: number; description: string; distanceTicks: number }>;
  absorptionIndex: number; // 0 - 100
  restingStopEstimate: number;
  poc: number;
  vah: number;
  val: number;
  vwap: number;
  orderBookImbalance: number; // e.g. +38% buyers or -24% sellers
}

export interface SessionMetrics {
  currentSession: 'ASIA' | 'LONDON' | 'NY_AM' | 'NY_LUNCH' | 'NY_PM' | 'CLOSED';
  timeUtc: string;
  sessionHigh: number;
  sessionLow: number;
  sessionRange: number;
  initialBalanceHigh: number;
  initialBalanceLow: number;
  sessionWinRates: Record<string, { winRate: number; avgR: number; bestSetup: string }>;
}
