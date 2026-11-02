import React from 'react';
import { MarketAsset } from '../types/market';
import { VOLATILITY_DATA, ASSETS } from '../data/marketData';
import { Flame, Gauge, Activity, ArrowUpRight, TrendingUp, Compass, Zap, Layers } from 'lucide-react';

interface VolatilityLabProps {
  symbol: MarketAsset;
}

export const VolatilityLab: React.FC<VolatilityLabProps> = ({ symbol }) => {
  const asset = ASSETS[symbol] || ASSETS.NQ;
  const vol = VOLATILITY_DATA[symbol] || VOLATILITY_DATA.NQ;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">MODULE 06</span>
              <span className="text-slate-600">/</span>
              <h2 className="text-xl font-bold text-white tracking-tight">Apex Volatility Lab</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Studies volatility cycles to forecast explosive expansion and tight compression coils. Measures ATR behaviour, session exhaustion, and standard deviation bounds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-lg text-xs font-mono">
              <div className="text-[10px] text-amber-400">EXPANSION PROBABILITY</div>
              <div className="text-xl font-bold text-amber-300 mt-0.5">{vol.expansionProbability}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Core Volatility Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Volatility Compression */}
        <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Volatility Compression</h3>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400">{vol.compressionScore}/100</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Bollinger / Keltner Squeeze:</span>
              <span className="text-white font-bold">ACTIVE COIL</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-600 to-cyan-400 h-full rounded-full"
                style={{ width: `${vol.compressionScore}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
              Price has consolidated within a 1.2-ATR band for 16 consecutive bars. Volatility pinch indicates imminent directional velocity release.
            </p>
          </div>
        </div>

        {/* 2. Expansion Probability */}
        <div className="bg-[#0b0e17] border border-amber-500/30 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Expansion Probability</h3>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400">{vol.expansionProbability}%</span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">1-4 Hour Window:</span>
              <span className="text-amber-300 font-bold">EXTREMELY HIGH</span>
            </div>
            <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-600 to-orange-500 h-full rounded-full"
                style={{ width: `${vol.expansionProbability}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
              Based on historical compression percentiles, 88 out of 100 similar coils resulted in sustained 100+ point directional expansions.
            </p>
          </div>
        </div>

        {/* 3. ATR Behaviour */}
        <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">ATR Behaviour</h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400">{vol.atrRatio}x Baseline</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-400">Current ATR (14):</span>
              <span className="text-white font-bold">{vol.currentATR}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-850">
              <span className="text-slate-400">20-Period Baseline ATR:</span>
              <span className="text-slate-300">{vol.baselineATR}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Session Range Exhaustion:</span>
              <span className="text-cyan-400 font-bold">{vol.sessionExhaustionPct}% (Ample Room)</span>
            </div>
          </div>
        </div>

        {/* 4. Session Volatility Profile */}
        <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-sm text-white">Session Volatility Curve</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">UTC CLOCK</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center p-2 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">Asian Session:</span>
              <span className="text-slate-300">24% Avg Daily Vol</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400">London Open:</span>
              <span className="text-cyan-300 font-bold">38% Avg Daily Vol</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-emerald-950/30 border border-emerald-800/60">
              <span className="text-emerald-400 font-bold">NY AM Session (Current):</span>
              <span className="text-emerald-300 font-bold">58% Peak Vol</span>
            </div>
          </div>
        </div>

        {/* 5. Breakout Pressure Gauge */}
        <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Breakout Pressure</h3>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400">{vol.breakoutPressure}</span>
          </div>

          <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-lg text-xs leading-relaxed text-slate-200">
            Orderbook depth reveals a +38.4% imbalance favoring bid aggregators. Asks within 20 ticks are heavily depleted compared to supporting limit bids.
          </div>
        </div>

        {/* 6. Expected Movement Ranges */}
        <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Expected Movement Ranges</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">±1 STD DEV</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-emerald-950/20 border border-emerald-800/50 rounded-lg flex justify-between items-center">
              <span className="text-slate-400 font-sans">Upper Expected Limit (+1σ):</span>
              <span className="text-emerald-300 font-bold">{vol.expectedRangeUpper}</span>
            </div>
            <div className="p-3 bg-rose-950/20 border border-rose-800/50 rounded-lg flex justify-between items-center">
              <span className="text-slate-400 font-sans">Lower Expected Limit (-1σ):</span>
              <span className="text-rose-300 font-bold">{vol.expectedRangeLower}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
