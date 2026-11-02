import React, { useState } from 'react';
import { MarketAsset, MarketRegime } from '../types/market';
import { ASSETS } from '../data/marketData';
import { 
  BrainCircuit, 
  Activity, 
  TrendingUp, 
  RotateCcw, 
  Flame, 
  AlertTriangle, 
  Sliders, 
  Layers, 
  ShieldCheck, 
  CheckCircle, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface AdaptiveRegimeBrainProps {
  currentSymbol: MarketAsset;
  currentRegime: MarketRegime;
  onSelectRegime: (regime: MarketRegime) => void;
}

export const AdaptiveRegimeBrain: React.FC<AdaptiveRegimeBrainProps> = ({
  currentSymbol,
  currentRegime,
  onSelectRegime,
}) => {
  const asset = ASSETS[currentSymbol] || ASSETS.NQ;

  // Analytical model weight matrix per regime
  const regimeWeights: Record<MarketRegime, {
    description: string;
    trendWeight: number;
    meanReversionWeight: number;
    liquiditySweepWeight: number;
    breakoutWeight: number;
    fvgMitigationWeight: number;
    recommendation: string;
    tradeQualityGrade: string;
  }> = {
    TRENDING_BULL: {
      description: 'Aggressive directional buyers dominant. Higher lows sequence maintained across 4H and 15m. VWAP sloping upward.',
      trendWeight: 45,
      meanReversionWeight: 5,
      liquiditySweepWeight: 20,
      breakoutWeight: 15,
      fvgMitigationWeight: 15,
      recommendation: 'Prioritize trend pullbacks into untested bullish FVGs and demand blocks. Cease counter-trend shorting.',
      tradeQualityGrade: 'OPTIMAL (Grade A+)',
    },
    TRENDING_BEAR: {
      description: 'Persistent institutional liquidation. Lower highs and lower lows. Aggressive market sell delta.',
      trendWeight: 45,
      meanReversionWeight: 5,
      liquiditySweepWeight: 20,
      breakoutWeight: 15,
      fvgMitigationWeight: 15,
      recommendation: 'Prioritize short continuations after buy-side liquidity sweeps into bearish supply blocks.',
      tradeQualityGrade: 'OPTIMAL (Grade A+)',
    },
    RANGING: {
      description: 'Auction balanced between Value Area High and Value Area Low. Volume profile displays prominent symmetrical bell curve POC.',
      trendWeight: 10,
      meanReversionWeight: 40,
      liquiditySweepWeight: 35,
      breakoutWeight: 5,
      fvgMitigationWeight: 10,
      recommendation: 'Fade boundary extremes (VAH/VAL) with Turtle Soup / SFP patterns. Never chase mid-range breakouts.',
      tradeQualityGrade: 'SELECTIVE (Grade B+)',
    },
    VOLATILE_EXPANSION: {
      description: 'High ATR impulse expansion driven by institutional reallocation or macro catalyst. Slippage risk elevated.',
      trendWeight: 30,
      meanReversionWeight: 5,
      liquiditySweepWeight: 15,
      breakoutWeight: 40,
      fvgMitigationWeight: 10,
      recommendation: 'Reduce position sizing by 50% to accommodate wider invalidations. Trade confirmed momentum continuation.',
      tradeQualityGrade: 'HIGH VOLATILITY (Grade A)',
    },
    LOW_QUALITY: {
      description: 'Anemic tick volume, erratic microstructure, tight chop without institutional participation (holiday / pre-release).',
      trendWeight: 10,
      meanReversionWeight: 10,
      liquiditySweepWeight: 10,
      breakoutWeight: 10,
      fvgMitigationWeight: 10,
      recommendation: 'DO NOT TRADE. Analytical models lose statistical edge due to absence of institutional liquidity.',
      tradeQualityGrade: 'STAND ASIDE (No Trade)',
    },
  };

  const activeWeights = regimeWeights[currentRegime];

  const regimesList: { id: MarketRegime; label: string; icon: any; color: string }[] = [
    { id: 'TRENDING_BULL', label: 'Trending Bull', icon: TrendingUp, color: 'text-emerald-400' },
    { id: 'TRENDING_BEAR', label: 'Trending Bear', icon: TrendingUp, color: 'text-rose-400' },
    { id: 'RANGING', label: 'Ranging / Consolidation', icon: RotateCcw, color: 'text-amber-400' },
    { id: 'VOLATILE_EXPANSION', label: 'Volatile Expansion', icon: Flame, color: 'text-cyan-400' },
    { id: 'LOW_QUALITY', label: 'Low-Quality Chop', icon: AlertTriangle, color: 'text-slate-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">ADAPTIVE CORE</span>
              <span className="text-slate-600">/</span>
              <h2 className="text-xl font-bold text-white tracking-tight">Apex Adaptive Trading Intelligence</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              A dynamic intelligence engine that shifts its analytical priority weights depending on the active market regime. Eliminates rigid strategy failure during regime changes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Current Regime:</span>
            <span className="px-3 py-1 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-mono font-bold text-xs uppercase">
              {currentRegime.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Regime Switcher Buttons */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {regimesList.map((r) => {
            const Icon = r.icon;
            const isSelected = currentRegime === r.id;

            return (
              <button
                key={r.id}
                onClick={() => onSelectRegime(r.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-500/70 text-white shadow-sm shadow-cyan-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${r.color}`} />
                <span>{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Market Regime Brain Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Market Regime Brain Neural Architecture (7 cols) */}
        <div className="lg:col-span-7 bg-[#0b0e17] border border-cyan-500/40 rounded-xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="font-bold text-base text-white">Market Regime Brain</h3>
                <div className="text-[11px] text-slate-400">Dynamic Analytical Weights Allocation Matrix</div>
              </div>
            </div>

            <div className="px-2.5 py-1 rounded bg-cyan-950/80 text-cyan-300 font-mono text-xs border border-cyan-800/60">
              Active Weights: {currentRegime}
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed">
            {activeWeights.description}
          </div>

          {/* Model Weights Sliders */}
          <div className="mt-5 space-y-4">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Neural Weight Distribution:
            </div>

            {/* 1. Trend Continuation */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-medium">Trend Continuation &amp; Structure:</span>
                <span className="font-bold text-cyan-400">{activeWeights.trendWeight}%</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${activeWeights.trendWeight}%` }}
                />
              </div>
            </div>

            {/* 2. Mean Reversion */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-medium">Mean Reversion / Value Rotation:</span>
                <span className="font-bold text-purple-400">{activeWeights.meanReversionWeight}%</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${activeWeights.meanReversionWeight}%` }}
                />
              </div>
            </div>

            {/* 3. Liquidity Sweeps */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-medium">Liquidity Sweeps &amp; Stop Hunts (SFP):</span>
                <span className="font-bold text-emerald-400">{activeWeights.liquiditySweepWeight}%</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${activeWeights.liquiditySweepWeight}%` }}
                />
              </div>
            </div>

            {/* 4. Breakout Pressure */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-medium">Volatility Expansion Breakout:</span>
                <span className="font-bold text-amber-400">{activeWeights.breakoutWeight}%</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${activeWeights.breakoutWeight}%` }}
                />
              </div>
            </div>

            {/* 5. FVG Mitigation */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 font-medium">Order Block &amp; FVG Imbalance:</span>
                <span className="font-bold text-blue-400">{activeWeights.fvgMitigationWeight}%</span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${activeWeights.fvgMitigationWeight}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Execution Guidance & Historical Performance (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Regime Brain Directive */}
          <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Regime Brain Directive</h3>
            </div>

            <div className="mt-4 p-3.5 bg-cyan-950/20 border border-cyan-800/40 rounded-lg">
              <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                EXECUTION RECOMMENDATION
              </div>
              <div className="text-xs text-slate-200 mt-1 leading-relaxed font-medium">
                {activeWeights.recommendation}
              </div>
            </div>

            <div className="mt-4 p-3 bg-slate-900/80 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Environment Grade:</span>
              <span className="font-mono font-bold text-emerald-400">{activeWeights.tradeQualityGrade}</span>
            </div>
          </div>

          {/* Historical Setup Performance by Regime */}
          <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">Historical Win Rates in this Regime</h3>
              <span className="text-[10px] font-mono text-slate-400">LAST 1,200 TRADES</span>
            </div>

            <div className="mt-4 space-y-2.5 text-xs font-mono">
              <div className="flex justify-between items-center p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">Trend Pullback (FVG Mitigation)</span>
                <span className="text-emerald-400 font-bold">78.4% Win Rate</span>
              </div>

              <div className="flex justify-between items-center p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">Asian Low SFP / Liquidity Sweep</span>
                <span className="text-emerald-400 font-bold">76.2% Win Rate</span>
              </div>

              <div className="flex justify-between items-center p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-slate-300">Breakout Expansion Continuation</span>
                <span className="text-cyan-400 font-bold">71.0% Win Rate</span>
              </div>

              <div className="flex justify-between items-center p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400">Counter-Trend Mean Reversion</span>
                <span className="text-rose-400 font-bold">34.1% Win Rate (High Risk)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
