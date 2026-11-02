// Frontend API client for Apex Lab Live Trading Intelligence Platform

export interface LiveMarketSummary {
  symbol: string;
  name: string;
  category: string;
  price: number;
  change24h: number;
  change24hPct: number;
  high24h: number;
  low24h: number;
  volume24h: string;
  provider: string;
  timestamp: number;
}

export interface ProviderStatus {
  name: string;
  status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  latencyMs: number;
  lastChecked: string;
  error?: string;
}

export interface LiveCandle {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  delta: number;
  marker?: 'BOS' | 'CHOCH' | 'SWEEP' | 'FVG' | 'OB';
}

export interface LiveSetupAnalysis {
  symbol: string;
  currentPrice: number;
  direction: 'LONG' | 'SHORT';
  setupName: string;
  dnaFingerprint: string;
  regime: 'TRENDING_BULL' | 'TRENDING_BEAR' | 'RANGING' | 'VOLATILE_EXPANSION' | 'LOW_QUALITY';
  regimeRationale: string;
  weights: { trend: number; meanReversion: number; liquiditySweep: number; breakout: number; fvg: number };
  qualityScore: number;
  grade: 'A+' | 'A' | 'B';
  atr: number;
  rsi: number;
  volumeProfile: { poc: number; vah: number; val: number; vwap: number };
  entryZone: [number, number];
  stopLoss: number;
  targets: { tp1: number; tp2: number; tp3: number };
  riskRewardRatio: number;
}

export interface LiveSignalRecord {
  id: string;
  symbol: string;
  setupName: string;
  dnaFingerprint: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  stopLoss: number;
  tp1: number;
  tp2: number;
  tp3: number;
  currentPrice: number;
  status: 'ACTIVE' | 'HIT_TP1' | 'HIT_TP2' | 'HIT_TP3' | 'STOPPED_OUT';
  pnlR: number;
  createdAt: string;
  resolvedAt?: string;
  exitPrice?: number;
}

export interface CorrelationAssetInfo {
  symbol: string;
  name: string;
  category: string;
  price: number;
  change24hPct: number;
}

export interface CorrelationDivergenceAlert {
  pair: [string, string];
  correlation: number;
  expectedCorr: number;
  divergenceType: 'SMT_BULLISH' | 'SMT_BEARISH' | 'MACRO_DECOUPLING';
  divergenceDescription: string;
  leader: string;
  laggard: string;
}

export interface CorrelationMatrixResult {
  assets: CorrelationAssetInfo[];
  matrix: Record<string, Record<string, number>>;
  lookbackPeriod: string;
  timeframe: string;
  divergences: CorrelationDivergenceAlert[];
}

export interface SyncedPosition {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  contracts: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  unrealizedPnlR: number;
  stopLoss?: number;
  takeProfit?: number;
  openTime: string;
}

export interface SyncedAccountRecord {
  id: string;
  userId: string;
  platform: 'TRADOVATE' | 'RITHMIC' | 'METATRADER_5' | 'METATRADER_4' | 'INTERACTIVE_BROKERS' | 'BINANCE' | 'BYBIT' | 'APEX_TRADER_FUNDING' | 'TOPSTEP';
  accountName: string;
  accountNumber: string;
  server: string;
  environment: 'LIVE' | 'DEMO_PROP';
  currency: string;
  balance: number;
  equity: number;
  marginUsed: number;
  freeMargin: number;
  maxDailyDrawdown: number;
  trailingDrawdownThreshold: number;
  currentDrawdown: number;
  drawdownStatus: 'HEALTHY' | 'WARNING' | 'BREACHED';
  syncStatus: 'CONNECTED' | 'SYNCING' | 'DISCONNECTED';
  lastSyncTime: string;
  positions: SyncedPosition[];
}

// -------------------------------------------------------------
// API CALLS
// -------------------------------------------------------------

export async function fetchLiveMarketSummary(): Promise<{
  summaries: LiveMarketSummary[];
  providers: Record<string, ProviderStatus>;
}> {
  const res = await fetch('/api/market-data/summary');
  if (!res.ok) throw new Error(`Market summary failed: ${res.statusText}`);
  const json = await res.json();
  return {
    summaries: json.data || [],
    providers: json.providers || {},
  };
}

export async function fetchLiveCandles(symbol: string, timeframe: string = '15m'): Promise<{
  candles: LiveCandle[];
  currentPrice: number;
  atr: number;
  rsi: number;
  volumeProfile: { poc: number; vah: number; val: number; vwap: number };
}> {
  const res = await fetch(`/api/market-data/candles?symbol=${symbol}&timeframe=${timeframe}`);
  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error || `Failed to fetch live candles for ${symbol}`);
  }
  const json = await res.json();
  return {
    candles: json.candles || [],
    currentPrice: json.currentPrice,
    atr: json.atr,
    rsi: json.rsi,
    volumeProfile: json.volumeProfile,
  };
}

export async function fetchLiveAnalysis(symbol: string, timeframe: string = '15m'): Promise<LiveSetupAnalysis> {
  const res = await fetch('/api/market-data/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol, timeframe }),
  });
  if (!res.ok) throw new Error('Analysis request failed');
  const json = await res.json();
  return json.data;
}

export async function fetchMultiMarketScan(): Promise<LiveSetupAnalysis[]> {
  const res = await fetch('/api/market-data/scan', { method: 'POST' });
  if (!res.ok) throw new Error('Market scan failed');
  const json = await res.json();
  return json.setups || [];
}

export async function fetchDecisionReport(symbol: string, timeframe: string = '15m'): Promise<any> {
  const res = await fetch('/api/market-data/decision-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol, timeframe }),
  });
  if (!res.ok) throw new Error('Decision report request failed');
  const json = await res.json();
  return json.data;
}

export async function runHistoricalBacktest(symbol: string, timeframe: string = '15m'): Promise<BacktestResult> {
  const res = await fetch('/api/market-data/backtest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbol, timeframe }),
  });
  if (!res.ok) throw new Error('Backtest request failed');
  const json = await res.json();
  return json.data;
}

export async function fetchLiveSignals(): Promise<{
  signals: LiveSignalRecord[];
  stats: {
    totalSignals: number;
    activeSignals: number;
    closedSignals: number;
    wins: number;
    losses: number;
    winRate: number;
    totalProfitR: number;
  };
}> {
  const res = await fetch('/api/signals');
  if (!res.ok) throw new Error('Failed to fetch signals');
  return res.json();
}

export async function recordLiveSignal(data: any): Promise<LiveSignalRecord> {
  const res = await fetch('/api/signals/record', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to record signal');
  const json = await res.json();
  return json.signal;
}

export interface BacktestResult {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  totalProfitR: number;
  trades: Array<{
    entryTime: string;
    entryPrice: number;
    exitPrice: number;
    outcome: 'WIN' | 'LOSS';
    pnlR: number;
    durationBars: number;
  }>;
}

export async function fetchProviderHealth(): Promise<Record<string, ProviderStatus>> {
  const res = await fetch('/api/market-data/status');
  if (!res.ok) throw new Error('Provider status check failed');
  const json = await res.json();
  return json.providers || {};
}

export async function fetchMarketCorrelations(
  category: string = 'ALL',
  timeframe: string = '15m'
): Promise<CorrelationMatrixResult> {
  const res = await fetch(`/api/market-data/correlations?category=${category}&timeframe=${timeframe}`);
  if (!res.ok) throw new Error('Failed to fetch correlation matrix');
  const json = await res.json();
  return {
    assets: json.assets || [],
    matrix: json.matrix || {},
    lookbackPeriod: json.lookbackPeriod || '',
    timeframe: json.timeframe || '',
    divergences: json.divergences || [],
  };
}

export async function fetchSyncedAccounts(): Promise<SyncedAccountRecord[]> {
  const res = await fetch('/api/accounts/current');
  if (!res.ok) throw new Error('Failed to fetch synced accounts');
  const json = await res.json();
  return json.accounts || [];
}

export async function syncBrokerAccount(accountData: Partial<SyncedAccountRecord>): Promise<SyncedAccountRecord> {
  const res = await fetch('/api/accounts/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(accountData),
  });
  if (!res.ok) throw new Error('Failed to sync account');
  const json = await res.json();
  return json.account;
}

export async function disconnectBrokerAccount(id: string): Promise<boolean> {
  const res = await fetch('/api/accounts/disconnect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error('Failed to disconnect account');
  const json = await res.json();
  return json.success;
}
