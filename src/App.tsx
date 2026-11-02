import React, { useState, useEffect, useCallback } from 'react';
import { MarketAsset, MarketRegime, SetupDNA } from './types/market';
import { ASSETS } from './data/marketData';
import { Header } from './components/Header';
import { InteractiveChart } from './components/InteractiveChart';
import { SetupGenerator } from './components/SetupGenerator';
import { MarketDecisionIntelligence } from './components/MarketDecisionIntelligence';
import { SetupDNALab } from './components/SetupDNALab';
import { AdaptiveRegimeBrain } from './components/AdaptiveRegimeBrain';
import { LiquidityRadar } from './components/LiquidityRadar';
import { VolatilityLab } from './components/VolatilityLab';
import { TradeScanner } from './components/TradeScanner';
import { AIInvestigator } from './components/AIInvestigator';
import { ReplayLab } from './components/ReplayLab';
import { LiveSignalsTracker } from './components/LiveSignalsTracker';
import { UploadScreenshotModal } from './components/UploadScreenshotModal';
import { LiveAccountSyncModal } from './components/LiveAccountSyncModal';
import { 
  fetchLiveMarketSummary, 
  fetchLiveCandles, 
  fetchLiveAnalysis, 
  recordLiveSignal,
  fetchSyncedAccounts,
  LiveMarketSummary, 
  ProviderStatus, 
  LiveSetupAnalysis,
  SyncedAccountRecord
} from './services/api';
import { AlertCircle, RefreshCw, Radio } from 'lucide-react';

export default function App() {
  const [currentAsset, setCurrentAsset] = useState<MarketAsset>('NQ');
  const [activeTab, setActiveTab] = useState<string>('chart-setup');
  const [selectedTimeframe, setSelectedTimeframe] = useState('15m');
  
  // Real Live Data States
  const [liveSummaries, setLiveSummaries] = useState<LiveMarketSummary[]>([]);
  const [providers, setProviders] = useState<Record<string, ProviderStatus>>({});
  const [candles, setCandles] = useState<any[]>([]);
  const [liveSetup, setLiveSetup] = useState<LiveSetupAnalysis | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(ASSETS.NQ.price);
  const [currentRegime, setCurrentRegime] = useState<MarketRegime>(ASSETS.NQ.regime);
  
  const [isLoadingCandles, setIsLoadingCandles] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [syncedAccounts, setSyncedAccounts] = useState<SyncedAccountRecord[]>([]);
  const [signalRefreshTrigger, setSignalRefreshTrigger] = useState(0);

  // Poll Live Summaries (real-time price ticker & provider status)
  const refreshSummaries = useCallback(async () => {
    try {
      const { summaries, providers: provs } = await fetchLiveMarketSummary();
      if (summaries && summaries.length > 0) {
        setLiveSummaries(summaries);
        setProviders(provs);
        
        // Update current asset price from the real feed
        const match = summaries.find((s) => s.symbol === currentAsset);
        if (match && match.price) {
          setCurrentPrice(match.price);
        }
      }
    } catch (err: any) {
      console.warn('Live summary poll warning:', err.message);
    }
  }, [currentAsset]);

  // Load Connected Live Broker / Prop Firm Accounts
  const loadAccounts = useCallback(async () => {
    try {
      const accs = await fetchSyncedAccounts();
      setSyncedAccounts(accs);
    } catch (e) {
      console.warn('Failed to load synced accounts:', e);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  useEffect(() => {
    refreshSummaries();
    // Poll real prices every 4 seconds
    const interval = setInterval(() => {
      refreshSummaries();
      loadAccounts();
    }, 4000);
    return () => clearInterval(interval);
  }, [refreshSummaries, loadAccounts]);

  // Load Real Candles & Technical Setup for Active Asset
  const loadAssetData = useCallback(async (symbol: MarketAsset, tf: string) => {
    setIsLoadingCandles(true);
    setFeedError(null);
    try {
      // 1. Fetch real exchange candles
      const candleData = await fetchLiveCandles(symbol, tf);
      setCandles(candleData.candles);
      if (candleData.currentPrice) {
        setCurrentPrice(candleData.currentPrice);
      }

      // 2. Fetch real technical setup & regime
      const analysis = await fetchLiveAnalysis(symbol, tf);
      setLiveSetup(analysis);
      if (analysis.regime) {
        setCurrentRegime(analysis.regime as MarketRegime);
      }
    } catch (err: any) {
      console.error(`Error loading market data for ${symbol}:`, err);
      setFeedError(err.message || `Failed to fetch live market data for ${symbol}`);
    } finally {
      setIsLoadingCandles(false);
    }
  }, []);

  useEffect(() => {
    loadAssetData(currentAsset, selectedTimeframe);
  }, [currentAsset, selectedTimeframe, loadAssetData]);

  // Handle publishing active setup as a live tracked signal
  const handlePublishCurrentSetup = async () => {
    if (!liveSetup) return;
    try {
      await recordLiveSignal({
        symbol: liveSetup.symbol,
        setupName: liveSetup.setupName,
        dnaFingerprint: liveSetup.dnaFingerprint,
        direction: liveSetup.direction,
        entryPrice: liveSetup.entryZone[1],
        stopLoss: liveSetup.stopLoss,
        tp1: liveSetup.targets.tp1,
        tp2: liveSetup.targets.tp2,
        tp3: liveSetup.targets.tp3,
        currentPrice: liveSetup.currentPrice,
      });
      setSignalRefreshTrigger((prev) => prev + 1);
      setActiveTab('live-signals');
    } catch (e: any) {
      alert(`Could not record signal: ${e.message}`);
    }
  };

  const handleSelectSetup = (setup: SetupDNA) => {
    setCurrentAsset(setup.symbol);
    setActiveTab('chart-setup');
  };

  const handleAnalysisComplete = (result: any) => {
    if (result.symbol && ASSETS[result.symbol as MarketAsset]) {
      setCurrentAsset(result.symbol as MarketAsset);
    }
    setActiveTab('chart-setup');
  };

  return (
    <div className="min-h-screen bg-[#07090f] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header Command Bar */}
      <Header
        currentAsset={currentAsset}
        onSelectAsset={setCurrentAsset}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        liveSummaries={liveSummaries}
        providers={providers}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
        activeAccount={syncedAccounts.find((a) => a.syncStatus === 'CONNECTED') || syncedAccounts[0] || null}
        onRefreshData={() => {
          refreshSummaries();
          loadAccounts();
          loadAssetData(currentAsset, selectedTimeframe);
        }}
      />

      {/* Connection Alert Banner if an exchange provider has issues */}
      {feedError && (
        <div className="bg-rose-950/80 border-b border-rose-800 px-4 py-2 text-xs font-mono text-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>EXCHANGE FEED WARNING: {feedError}</span>
          </div>
          <button
            onClick={() => loadAssetData(currentAsset, selectedTimeframe)}
            className="flex items-center gap-1 px-2.5 py-1 bg-rose-900 hover:bg-rose-800 text-white rounded text-[11px] font-bold"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Retry Feed</span>
          </button>
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Module 1: Market Behaviour & Setup Generator */}
        {activeTab === 'chart-setup' && (
          <div className="space-y-6 animate-fade-in">
            {/* Real Candlestick Chart */}
            <InteractiveChart
              candles={candles}
              symbol={currentAsset}
              selectedTimeframe={selectedTimeframe}
              onSelectTimeframe={setSelectedTimeframe}
              onOpenSetupGenerator={() => {}}
              onTriggerDecisionReport={() => setActiveTab('decision-intelligence')}
              liveSetup={liveSetup}
              livePrice={currentPrice}
            />

            {/* Setup Generator */}
            <SetupGenerator
              symbol={currentAsset}
              onOpenDecisionIntelligence={() => setActiveTab('decision-intelligence')}
            />
          </div>
        )}

        {/* Module 2: Market Decision Intelligence (Flagship Concept) */}
        {activeTab === 'decision-intelligence' && (
          <div className="animate-fade-in">
            <MarketDecisionIntelligence
              symbol={currentAsset}
              regime={currentRegime}
            />
          </div>
        )}

        {/* Module 3: Live Signal Performance Tracker */}
        {activeTab === 'live-signals' && (
          <div className="animate-fade-in">
            <LiveSignalsTracker
              onPublishCurrentSetup={handlePublishCurrentSetup}
              activeSetupName={liveSetup?.setupName}
              refreshTrigger={signalRefreshTrigger}
            />
          </div>
        )}

        {/* Module 4: Setup DNA Laboratory */}
        {activeTab === 'setup-dna' && (
          <div className="animate-fade-in">
            <SetupDNALab
              currentSymbol={currentAsset}
              onSelectSetup={handleSelectSetup}
            />
          </div>
        )}

        {/* Module 5: Adaptive Intelligence & Regime Brain */}
        {activeTab === 'regime-brain' && (
          <div className="animate-fade-in">
            <AdaptiveRegimeBrain
              currentSymbol={currentAsset}
              currentRegime={currentRegime}
              onSelectRegime={setCurrentRegime}
            />
          </div>
        )}

        {/* Module 6: Liquidity Radar */}
        {activeTab === 'liquidity-radar' && (
          <div className="animate-fade-in">
            <LiquidityRadar
              symbol={currentAsset}
              livePrice={currentPrice}
              liveVolumeProfile={liveSetup?.volumeProfile}
            />
          </div>
        )}

        {/* Module 7: Volatility Lab */}
        {activeTab === 'volatility-lab' && (
          <div className="animate-fade-in">
            <VolatilityLab symbol={currentAsset} />
          </div>
        )}

        {/* Module 8: Trade Scanner & Session Intelligence */}
        {activeTab === 'trade-scanner' && (
          <div className="animate-fade-in">
            <TradeScanner
              onSelectAsset={setCurrentAsset}
              onSelectSetup={handleSelectSetup}
            />
          </div>
        )}

        {/* Module 9: AI Investigator */}
        {activeTab === 'ai-investigator' && (
          <div className="animate-fade-in">
            <AIInvestigator symbol={currentAsset} />
          </div>
        )}

        {/* Module 10: Replay Lab, Strategy Evolution & Backtest */}
        {activeTab === 'replay-lab' && (
          <div className="animate-fade-in">
            <ReplayLab symbol={currentAsset} candles={candles} />
          </div>
        )}
      </main>

      {/* Upload Screenshot Modal for Multimodal Vision Analysis */}
      <UploadScreenshotModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        currentSymbol={currentAsset}
        onAnalysisComplete={handleAnalysisComplete}
      />

      {/* Live Broker / Prop Firm Account Sync Modal */}
      <LiveAccountSyncModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        onAccountUpdated={loadAccounts}
      />

      {/* Production Footer Status Bar */}
      <footer className="border-t border-slate-900 bg-[#06080d] py-2 px-4 text-xs font-mono text-slate-500 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-bold">APEX LAB LIVE QUANT WORKSTATION</span>
          <span>·</span>
          <span>FEEDS: BINANCE SPOT &amp; CME REAL-TIME</span>
          <span>·</span>
          <span>DB: PERSISTENT ATOMIC SIGNAL LOG</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>LIVE SYNC ACTIVE ({currentPrice.toLocaleString(undefined, { minimumFractionDigits: currentAsset === 'EURUSD' ? 5 : 2 })})</span>
          </span>
          <span className="text-slate-600">|</span>
          <span>SERVER TIME: {new Date().toISOString().substring(11, 19)} UTC</span>
        </div>
      </footer>
    </div>
  );
}
