import React, { useState } from 'react';
import { MarketAsset, SetupDNA } from '../types/market';
import { ASSETS, SETUP_DNA_DATABASE, SESSION_METRICS } from '../data/marketData';
import { 
  Search, 
  Clock, 
  Filter, 
  ArrowUpRight, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

import { fetchMultiMarketScan, LiveSetupAnalysis } from '../services/api';
import { RefreshCw, Zap } from 'lucide-react';

interface TradeScannerProps {
  onSelectSetup: (setup: SetupDNA) => void;
  onSelectAsset: (asset: MarketAsset) => void;
}

export const TradeScanner: React.FC<TradeScannerProps> = ({
  onSelectSetup,
  onSelectAsset,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');
  const [selectedSessionFilter, setSelectedSessionFilter] = useState<string>('ALL');
  const [liveScans, setLiveScans] = useState<LiveSetupAnalysis[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  const runLiveScan = async () => {
    setIsScanning(true);
    try {
      const scans = await fetchMultiMarketScan();
      if (scans && scans.length > 0) {
        setLiveScans(scans);
      }
    } catch (e: any) {
      console.warn('Scan warning:', e.message);
    } finally {
      setIsScanning(false);
    }
  };

  React.useEffect(() => {
    runLiveScan();
  }, []);

  const filteredSetups = SETUP_DNA_DATABASE.filter((s) => {
    if (selectedGrade !== 'ALL' && s.grade !== selectedGrade) return false;
    if (selectedSessionFilter !== 'ALL' && s.session !== selectedSessionFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">MODULE 04 &amp; 07</span>
              <span className="text-slate-600">/</span>
              <h2 className="text-xl font-bold text-white tracking-tight">Trade Scanner &amp; Session Intelligence</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Cross-asset institutional scanner. Filters by Setup Quality Score, active session edges, institutional order flow, and risk-to-reward metrics.
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <span className="text-slate-500 px-2">GRADE:</span>
              {['ALL', 'A+', 'A', 'B'].map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGrade(g)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    selectedGrade === g
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <span className="text-slate-500 px-2">SESSION:</span>
              {['ALL', 'NY_AM', 'LONDON', 'ASIA'].map((sess) => (
                <button
                  key={sess}
                  onClick={() => setSelectedSessionFilter(sess)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    selectedSessionFilter === sess
                      ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sess.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Session Intelligence Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          {Object.entries(SESSION_METRICS.sessionWinRates).map(([sessKey, sessVal]) => (
            <div key={sessKey} className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold">{sessKey.replace('_', ' ')} Session:</span>
                <span className="text-emerald-400 font-bold">{sessVal.winRate}% WR</span>
              </div>
              <div className="text-[10px] text-cyan-300 mt-1 font-sans truncate">
                Best: {sessVal.bestSetup}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Avg Edge: +{sessVal.avgR}R</div>
            </div>
          ))}
        </div>
      </div>

      {/* Opportunities Table & Grid */}
      <div className="bg-[#0b0e17] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-white">Top Quant Opportunities Ranked by Setup DNA Quality</h3>
          </div>
          <span className="text-xs font-mono text-slate-400">{filteredSetups.length} Setups Identified</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {filteredSetups.map((setup) => {
            const asset = ASSETS[setup.symbol];

            return (
              <div
                key={setup.id}
                className="p-4 hover:bg-slate-900/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Asset & Name */}
                <div className="flex items-start gap-3 min-w-[280px]">
                  <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex flex-col items-center justify-center shrink-0">
                    <span className="font-mono font-bold text-white text-xs">{setup.symbol}</span>
                    <span className="text-[9px] text-cyan-400 font-mono">{setup.timeframe.split(' ')[0]}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{setup.name}</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-800/60">
                        {setup.grade}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-1">
                      <span>{setup.dnaFingerprint}</span>
                      <span>·</span>
                      <span className="text-slate-300">{setup.structure}</span>
                      <span>·</span>
                      <span className="text-purple-300">{setup.session}</span>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-6 text-xs font-mono">
                  <div>
                    <div className="text-slate-500 text-[10px]">QUALITY SCORE</div>
                    <div className="text-base font-bold text-cyan-300 mt-0.5">{setup.qualityScore}/100</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">HISTORICAL WIN RATE</div>
                    <div className="text-base font-bold text-emerald-400 mt-0.5">{setup.historicalMatches.winRate}%</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px]">RISK-TO-REWARD</div>
                    <div className="text-base font-bold text-amber-300 mt-0.5">1 : {setup.riskReward}</div>
                  </div>
                </div>

                {/* Target Levels & Action CTA */}
                <div className="flex items-center gap-3">
                  <div className="hidden lg:block text-right font-mono text-xs">
                    <div className="text-slate-400 text-[10px]">INVALIDATION: {setup.invalidationLevel}</div>
                    <div className="text-emerald-400 font-bold">TP1: {setup.targets.tp1}</div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectAsset(setup.symbol);
                      onSelectSetup(setup);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-cyan-600 text-white rounded-lg text-xs font-medium border border-slate-700 transition-all shrink-0"
                  >
                    <span>Load Trade</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
