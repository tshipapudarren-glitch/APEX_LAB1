import React, { useState } from 'react';
import { MarketAsset } from '../types/market';
import { ASSETS, LIQUIDITY_DATA } from '../data/marketData';
import { MarketCorrelationMatrix } from './MarketCorrelationMatrix';
import { Radar, Target, Eye, Layers, TrendingUp, TrendingDown, ShieldAlert, BarChart2, Grid } from 'lucide-react';

interface LiquidityRadarProps {
  symbol: MarketAsset;
  livePrice?: number;
  liveVolumeProfile?: { poc: number; vah: number; val: number; vwap: number } | null;
  onSelectPair?: (symbolA: string, symbolB: string) => void;
}

export const LiquidityRadar: React.FC<LiquidityRadarProps> = ({ 
  symbol, 
  livePrice, 
  liveVolumeProfile,
  onSelectPair 
}) => {
  const asset = ASSETS[symbol] || ASSETS.NQ;
  const data = LIQUIDITY_DATA[symbol] || LIQUIDITY_DATA.NQ;
  const currentP = livePrice || asset.price;
  const poc = liveVolumeProfile?.poc || data.poc;
  const vah = liveVolumeProfile?.vah || data.vah;
  const val = liveVolumeProfile?.val || data.val;
  const vwap = liveVolumeProfile?.vwap || data.vwap;

  const [activeSubView, setActiveSubView] = useState<'POOLS' | 'CORRELATION' | 'SPLIT'>('SPLIT');

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">MODULE 02</span>
              <span className="text-slate-600">/</span>
              <h2 className="text-xl font-bold text-white tracking-tight">Apex Liquidity Radar &amp; Market Correlation Matrix</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Maps institutional resting orders, Buy-Side &amp; Sell-Side liquidity pools (BSL/SSL), delta absorption signatures, and multi-asset cross-market correlation co-movements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Sub-view switcher */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setActiveSubView('SPLIT')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  activeSubView === 'SPLIT'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Split View
              </button>
              <button
                onClick={() => setActiveSubView('CORRELATION')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  activeSubView === 'CORRELATION'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Correlation Matrix Only
              </button>
              <button
                onClick={() => setActiveSubView('POOLS')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  activeSubView === 'POOLS'
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Liquidity Pools Only
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Correlation Matrix View (Rendered in Split View or Correlation Only) */}
      {(activeSubView === 'CORRELATION' || activeSubView === 'SPLIT') && (
        <MarketCorrelationMatrix onSelectPair={onSelectPair} />
      )}

      {/* Liquidity Grid (Rendered in Split View or Pools Only) */}
      {(activeSubView === 'POOLS' || activeSubView === 'SPLIT') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Radar & Resting Liquidity Heatmap (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Circular Radar Simulation */}
          <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col items-center justify-center relative overflow-hidden min-h-[340px]">
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Radar className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">Live Liquidity Sweep Sonar</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 animate-pulse">● RADAR SWEEPING</span>
            </div>

            {/* Radar Circular Visual */}
            <div className="relative w-64 h-64 rounded-full border border-cyan-800/40 bg-[#070a10] flex items-center justify-center my-2">
              {/* Concentric distance rings */}
              <div className="absolute w-48 h-48 rounded-full border border-cyan-800/30" />
              <div className="absolute w-32 h-32 rounded-full border border-cyan-800/20" />
              <div className="absolute w-16 h-16 rounded-full border border-cyan-800/20" />

              {/* Crosshair axes */}
              <div className="absolute w-full h-px bg-cyan-800/30" />
              <div className="absolute h-full w-px bg-cyan-800/30" />

              {/* Rotating Sweep Beam */}
              <div className="absolute w-32 h-32 origin-bottom-right top-0 left-0 animate-radar-sweep pointer-events-none">
                <div className="w-full h-full bg-gradient-to-tr from-cyan-500/25 to-transparent rounded-tl-full" />
              </div>

              {/* Center Dot (Current Asset Price) */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/80 animate-ping" />
                <span className="text-[10px] font-mono font-bold text-white mt-1">{currentP}</span>
              </div>

              {/* Simulated Liquidity Blips */}
              <div className="absolute top-10 right-14 flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-md shadow-cyan-400" />
                <span className="text-[9px] font-mono text-cyan-300 bg-slate-900/90 px-1 rounded border border-cyan-800">BSL Pool</span>
              </div>

              <div className="absolute bottom-12 left-10 flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse shadow-md shadow-rose-400" />
                <span className="text-[9px] font-mono text-rose-300 bg-slate-900/90 px-1 rounded border border-rose-800">SSL Pool</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono mt-3 text-center">
              Real-time Point of Control: {poc} · VWAP: {vwap}
            </div>
          </div>

          {/* Institutional Volume Profile Auction Card */}
          <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-sm text-white">Auction Volume Profile</h3>
              </div>
              <span className="text-[10px] font-mono text-slate-400">SESSION VALUE AREA</span>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2 font-mono text-xs text-center">
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500">VAH (70%)</div>
                <div className="font-bold text-slate-200 mt-0.5">{vah}</div>
              </div>

              <div className="p-2.5 bg-amber-950/30 rounded-lg border border-amber-800/60">
                <div className="text-[10px] text-amber-400 font-bold">POC (Point of Control)</div>
                <div className="font-bold text-amber-300 mt-0.5">{poc}</div>
              </div>

              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-500">VAL (70%)</div>
                <div className="font-bold text-slate-200 mt-0.5">{val}</div>
              </div>

              <div className="p-2.5 bg-cyan-950/30 rounded-lg border border-cyan-800/60">
                <div className="text-[10px] text-cyan-400 font-bold">VWAP</div>
                <div className="font-bold text-cyan-300 mt-0.5">{vwap}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Buy-Side & Sell-Side Order Pools (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Buy-Side Liquidity (BSL) */}
          <div className="bg-[#0b0e17] border border-cyan-500/30 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-white">Buy-Side Liquidity (BSL) Pools</h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">RESTING BUY STOPS</span>
            </div>

            <div className="mt-4 space-y-3 font-mono text-xs">
              {data.bslPools.map((pool, idx) => (
                <div key={idx} className="p-3 bg-cyan-950/20 border border-cyan-900/40 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyan-300 text-sm">{pool.price}</span>
                      <span className="text-[10px] text-slate-400 font-sans">({pool.distanceTicks} ticks away)</span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-sans mt-0.5">{pool.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{pool.volume.toLocaleString()}</div>
                    <div className="text-[9px] text-slate-400 font-sans">Contracts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sell-Side Liquidity (SSL) */}
          <div className="bg-[#0b0e17] border border-rose-500/30 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-rose-400" />
                <h3 className="font-bold text-sm text-white">Sell-Side Liquidity (SSL) Pools</h3>
              </div>
              <span className="text-[10px] font-mono text-rose-400">RESTING SELL STOPS</span>
            </div>

            <div className="mt-4 space-y-3 font-mono text-xs">
              {data.sslPools.map((pool, idx) => (
                <div key={idx} className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-rose-300 text-sm">{pool.price}</span>
                      <span className="text-[10px] text-slate-400 font-sans">({pool.distanceTicks} ticks away)</span>
                    </div>
                    <div className="text-[11px] text-slate-300 font-sans mt-0.5">{pool.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{pool.volume.toLocaleString()}</div>
                    <div className="text-[9px] text-slate-400 font-sans">Contracts</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delta Absorption Monitor */}
          <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">Delta Absorption Monitor</h3>
              <span className="text-[10px] font-mono text-emerald-400">INSTITUTIONAL LIMIT ICEBERGS</span>
            </div>

            <div className="mt-4 p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans">
              Aggressive market sell orders were absorbed between {data.val} and {asset.price}. CVD divergence confirms passive limit buyers accumulating inventory before the session expansion.
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
};
