import React from 'react';
import { MarketAsset } from '../types/market';
import { LiveMarketSummary, ProviderStatus, SyncedAccountRecord } from '../services/api';
import { ProviderStatusBadge } from './ProviderStatusBadge';
import { 
  Zap, 
  Activity, 
  Clock, 
  Radio, 
  BarChart3, 
  Dna, 
  BrainCircuit, 
  Radar, 
  Flame, 
  Search, 
  PlaySquare, 
  FileSearch,
  Sparkles,
  Target,
  ShieldCheck
} from 'lucide-react';

interface HeaderProps {
  currentAsset: MarketAsset;
  onSelectAsset: (asset: MarketAsset) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  liveSummaries: LiveMarketSummary[];
  providers: Record<string, ProviderStatus>;
  onOpenUploadModal: () => void;
  onRefreshData?: () => void;
  onOpenAccountModal?: () => void;
  activeAccount?: SyncedAccountRecord | null;
}

export const Header: React.FC<HeaderProps> = ({
  currentAsset,
  onSelectAsset,
  activeTab,
  onSelectTab,
  liveSummaries,
  providers,
  onOpenUploadModal,
  onRefreshData,
  onOpenAccountModal,
  activeAccount,
}) => {
  const tabs = [
    { id: 'chart-setup', label: 'Setup Generator', icon: BarChart3 },
    { id: 'decision-intelligence', label: 'Decision Intelligence', icon: BrainCircuit, badge: 'Flagship' },
    { id: 'live-signals', label: 'Live Signal Tracker', icon: Target, badge: 'Real PnL' },
    { id: 'setup-dna', label: 'Setup DNA Lab', icon: Dna },
    { id: 'regime-brain', label: 'Adaptive Intelligence', icon: Activity },
    { id: 'liquidity-radar', label: 'Liquidity Radar', icon: Radar },
    { id: 'volatility-lab', label: 'Volatility Lab', icon: Flame },
    { id: 'trade-scanner', label: 'Trade Scanner', icon: Search },
    { id: 'ai-investigator', label: 'AI Investigator', icon: FileSearch },
    { id: 'replay-lab', label: 'Replay & Evolution', icon: PlaySquare },
  ];

  return (
    <header className="border-b border-slate-800/80 bg-[#07090e]/95 backdrop-blur-md sticky top-0 z-50">
      {/* Top Bar: Brand, Live Market Tickers, Exchange Status */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-900/90 text-xs">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#090b10] rounded-[7px] flex items-center justify-center">
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold tracking-wider text-sm text-white">
                <span>APEX</span>
                <span className="text-cyan-400">LAB</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/50 font-mono font-medium">LIVE PRODUCTION</span>
              </div>
              <div className="text-[10px] text-slate-400 tracking-tight">Institutional Trading Intelligence &amp; Live Order Flow</div>
            </div>
          </div>
        </div>

        {/* Real-time Live Ticker Strip */}
        <div className="hidden lg:flex items-center gap-2 overflow-x-auto no-scrollbar">
          {liveSummaries.map((item) => {
            const isSelected = item.symbol === currentAsset;
            const isPositive = item.change24hPct >= 0;

            return (
              <button
                key={item.symbol}
                onClick={() => onSelectAsset(item.symbol as MarketAsset)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-left transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500/60 shadow-sm shadow-cyan-500/10 text-white'
                    : 'bg-slate-900/50 border-slate-800/60 hover:bg-slate-850 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-mono font-bold text-[11px] flex items-center gap-1">
                  <span>{item.symbol}</span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                </div>
                <div className="font-mono text-[11px] text-slate-100 font-semibold">
                  {item.price.toLocaleString(undefined, { minimumFractionDigits: item.symbol === 'EURUSD' ? 5 : item.symbol === 'BTC' ? 1 : 2 })}
                </div>
                <div className={`text-[10px] font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPositive ? '+' : ''}{item.change24hPct}%
                </div>
              </button>
            );
          })}
        </div>

        {/* Global Controls & Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Live Broker / Prop Firm Account Sync */}
          {onOpenAccountModal && (
            <button
              onClick={onOpenAccountModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-md font-mono text-xs transition-all shadow-sm hover:border-cyan-500/50"
              title="Connect Live Broker / Prop Firm Account (Apex, Topstep, Tradovate, MT4/MT5, Rithmic, Interactive Brokers)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className={`w-2 h-2 rounded-full ${activeAccount?.syncStatus === 'CONNECTED' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-bold text-white text-[11px] tracking-tight">
                {activeAccount ? `${activeAccount.accountName.split(' ')[0]}: $${(activeAccount.equity / 1000).toFixed(1)}k` : 'SYNC ACCOUNT'}
              </span>
            </button>
          )}

          {/* Chart Screenshot AI Upload CTA */}
          <button
            onClick={onOpenUploadModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium rounded-md shadow-md shadow-cyan-600/25 transition-all text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
            <span>Upload Chart Screenshot</span>
          </button>

          {/* Real Live Exchange Data Status Badge */}
          <ProviderStatusBadge providers={providers} onRefresh={onRefreshData} />

          {/* Session Clock */}
          <div className="hidden sm:flex items-center gap-1.5 text-slate-400 font-mono text-xs px-2 py-1 bg-slate-900/80 rounded border border-slate-800">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300 font-medium">NY AM</span>
            <span className="text-slate-500">·</span>
            <span>{new Date().toISOString().substring(11, 16)} UTC</span>
          </div>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="px-4 py-1.5 flex items-center gap-1 overflow-x-auto no-scrollbar bg-[#090c13]/90">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase tracking-wider ${
                    tab.id === 'live-signals'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
