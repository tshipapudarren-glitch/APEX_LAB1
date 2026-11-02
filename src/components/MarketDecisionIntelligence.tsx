import React, { useState } from 'react';
import { MarketAsset, MarketDecisionReport, MarketRegime } from '../types/market';
import { ASSETS } from '../data/marketData';
import { 
  BrainCircuit, 
  HelpCircle, 
  Compass, 
  CheckCircle, 
  XCircle, 
  Crosshair, 
  Activity, 
  Sparkles, 
  TrendingUp, 
  BarChart, 
  ShieldCheck, 
  RefreshCw,
  Gauge,
  Flame,
  Layers,
  ArrowUpRight,
  Sliders
} from 'lucide-react';

interface MarketDecisionIntelligenceProps {
  symbol: MarketAsset;
  regime: MarketRegime;
}

export const MarketDecisionIntelligence: React.FC<MarketDecisionIntelligenceProps> = ({
  symbol,
  regime,
}) => {
  const asset = ASSETS[symbol] || ASSETS.NQ;
  const [report, setReport] = useState<MarketDecisionReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDecisionReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/market-data/decision-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          timeframe: '15m',
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to generate intelligence report: ${res.statusText}`);
      }

      const json = await res.json();
      if (json.data) {
        setReport(json.data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Error fetching report');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDecisionReport();
  }, [symbol, regime]);

  const engines = report?.engines;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">FLAGSHIP CONCEPT</span>
              <span className="text-slate-600">/</span>
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-widest">32</span>
              <span className="text-slate-600">/</span>
              <h2 className="text-xl font-bold text-white tracking-tight">Apex Market Decision Intelligence</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Central institutional intelligence combining 7 specialized engines. Produces an exhaustive situational diagnosis rather than binary BUY/SELL signals.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDecisionReport}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg text-xs font-medium shadow-md shadow-amber-600/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Re-synthesizing Engines...' : 'Synthesize 7 Engines'}</span>
            </button>
          </div>
        </div>

        {/* 7 Analytical Engine Matrix Bar */}
        {engines && (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 pt-4 border-t border-slate-800/80">
            {/* 1. Structure Engine */}
            <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-[10px] text-slate-500 font-mono">ENGINE 01</div>
                <div className="text-xs font-bold text-white mt-0.5 truncate">Structure</div>
              </div>
              <div className="mt-2 flex items-baseline justify-between font-mono">
                <span className="text-xs font-bold text-cyan-400">{engines.structure.score}/100</span>
                <span className="text-[9px] text-slate-400 truncate max-w-[70px]">{engines.structure.status}</span>
              </div>
            </div>

            {/* 2. Volatility Engine */}
            <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-[10px] text-slate-500 font-mono">ENGINE 02</div>
                <div className="text-xs font-bold text-white mt-0.5 truncate">Volatility</div>
              </div>
              <div className="mt-2 flex items-baseline justify-between font-mono">
                <span className="text-xs font-bold text-amber-400">{engines.volatility.score}/100</span>
                <span className="text-[9px] text-slate-400">{engines.volatility.compressionPct}% Coil</span>
              </div>
            </div>

            {/* 3. Momentum Engine */}
            <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-[10px] text-slate-500 font-mono">ENGINE 03</div>
                <div className="text-xs font-bold text-white mt-0.5 truncate">Momentum</div>
              </div>
              <div className="mt-2 flex items-baseline justify-between font-mono">
                <span className="text-xs font-bold text-emerald-400">{engines.momentum.score}/100</span>
                <span className="text-[9px] text-slate-400">RSI {engines.momentum.rsi}</span>
              </div>
            </div>

            {/* 4. Auction Engine */}
            <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-[10px] text-slate-500 font-mono">ENGINE 04</div>
                <div className="text-xs font-bold text-white mt-0.5 truncate">Auction &amp; Value</div>
              </div>
              <div className="mt-2 flex items-baseline justify-between font-mono">
                <span className="text-xs font-bold text-purple-400">{engines.auction.score}/100</span>
                <span className="text-[9px] text-slate-400">Value Up</span>
              </div>
            </div>

            {/* 5. Liquidity Engine */}
            <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-[10px] text-slate-500 font-mono">ENGINE 05</div>
                <div className="text-xs font-bold text-white mt-0.5 truncate">Liquidity</div>
              </div>
              <div className="mt-2 flex items-baseline justify-between font-mono">
                <span className="text-xs font-bold text-blue-400">{engines.liquidity.score}/100</span>
                <span className="text-[9px] text-slate-400">BSL Target</span>
              </div>
            </div>

            {/* 6. Regime Engine */}
            <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="text-[10px] text-slate-500 font-mono">ENGINE 06</div>
                <div className="text-xs font-bold text-white mt-0.5 truncate">Regime Brain</div>
              </div>
              <div className="mt-2 flex items-baseline justify-between font-mono">
                <span className="text-xs font-bold text-emerald-400">{engines.regime.score}/100</span>
                <span className="text-[9px] text-emerald-300">Trend Bull</span>
              </div>
            </div>

            {/* 7. Setup Validation Engine */}
            <div className="p-2.5 bg-cyan-950/30 rounded-lg border border-cyan-800/60 flex flex-col justify-between">
              <div>
                <div className="text-[10px] text-cyan-400 font-mono">ENGINE 07</div>
                <div className="text-xs font-bold text-white mt-0.5 truncate">Validation</div>
              </div>
              <div className="mt-2 flex items-baseline justify-between font-mono">
                <span className="text-xs font-bold text-cyan-300">{engines.setupValidation.score}/100</span>
                <span className="text-[9px] font-bold px-1 rounded bg-cyan-900/60 text-cyan-200">
                  {engines.setupValidation.grade}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Decision Report Content */}
      {report && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main 6-Section Decision Report (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Section 1: What is happening? */}
            <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                  SECTION 01
                </span>
                <h3 className="font-bold text-base text-white">What is happening?</h3>
              </div>
              <div className="mt-3.5 text-sm text-slate-200 leading-relaxed font-sans">
                {report.whatIsHappening}
              </div>
            </div>

            {/* Section 2: Why is it happening? */}
            <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800/60">
                  SECTION 02
                </span>
                <h3 className="font-bold text-base text-white">Why is it happening?</h3>
              </div>
              <div className="mt-3.5 text-sm text-slate-300 leading-relaxed font-sans">
                {report.whyIsItHappening}
              </div>
            </div>

            {/* Section 3: What could happen next? */}
            <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/60">
                  SECTION 03
                </span>
                <h3 className="font-bold text-base text-white">What could happen next?</h3>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Primary Scenario */}
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/50 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Primary Scenario</span>
                    <span className="text-lg font-mono font-bold text-emerald-300">
                      {report.whatCouldHappenNext.primary.prob}%
                    </span>
                  </div>
                  <div className="font-bold text-white text-sm mt-1">
                    {report.whatCouldHappenNext.primary.title}
                  </div>
                  <div className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {report.whatCouldHappenNext.primary.description}
                  </div>
                </div>

                {/* Alternate Scenario */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase">Alternate Scenario</span>
                    <span className="text-lg font-mono font-bold text-slate-300">
                      {report.whatCouldHappenNext.alternate.prob}%
                    </span>
                  </div>
                  <div className="font-bold text-slate-200 text-sm mt-1">
                    {report.whatCouldHappenNext.alternate.title}
                  </div>
                  <div className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {report.whatCouldHappenNext.alternate.description}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4 & 5: Confirmation & Invalidation Rules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Section 4: What confirms the scenario? */}
              <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-sm text-white">What confirms the scenario?</h3>
                </div>
                <div className="mt-3.5 space-y-2.5 text-xs">
                  {report.whatConfirms.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-200">
                      <span className="text-emerald-400 font-mono mt-0.5">•</span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 5: What invalidates it? */}
              <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <h3 className="font-bold text-sm text-white">What invalidates it?</h3>
                </div>
                <div className="mt-3.5 space-y-2.5 text-xs">
                  {report.whatInvalidates.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-rose-200">
                      <span className="text-rose-400 font-mono mt-0.5">•</span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Rail: Execution Zones & Quantitative Risk Matrix (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Section 6: Where are potential entry and target zones? */}
            <div className="bg-[#0b0e17] border border-cyan-500/40 rounded-xl p-5 shadow-xl relative">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-sm text-white">Entry &amp; Target Zones</h3>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                  R:R 1 : {report.entryAndTargets.rrRatio}
                </span>
              </div>

              <div className="mt-4 space-y-3 font-mono text-xs">
                {/* Entry Range */}
                <div className="p-3 bg-cyan-950/20 border border-cyan-800/60 rounded-lg">
                  <div className="text-slate-400 text-[10px] uppercase font-sans">Potential Entry Range:</div>
                  <div className="text-base font-bold text-cyan-300 mt-0.5">
                    {report.entryAndTargets.entryLow} - {report.entryAndTargets.entryHigh}
                  </div>
                </div>

                {/* Invalidation Stop Loss */}
                <div className="p-3 bg-rose-950/30 border border-rose-850 rounded-lg">
                  <div className="text-slate-400 text-[10px] uppercase font-sans">Structural Invalidation (Stop Loss):</div>
                  <div className="text-base font-bold text-rose-400 mt-0.5">
                    {report.entryAndTargets.stopLoss}
                  </div>
                </div>

                {/* Target Zones */}
                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg space-y-2">
                  <div className="flex justify-between items-center text-emerald-400">
                    <span className="font-sans text-[11px] text-slate-400">Target 1 (Liquidity Sweep):</span>
                    <span className="font-bold">{report.entryAndTargets.tp1}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-400 pt-1 border-t border-slate-800">
                    <span className="font-sans text-[11px] text-slate-400">Target 2 (Value Area High):</span>
                    <span className="font-bold">{report.entryAndTargets.tp2}</span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-400 pt-1 border-t border-slate-800">
                    <span className="font-sans text-[11px] text-slate-400">Target 3 (Extension Runner):</span>
                    <span className="font-bold">{report.entryAndTargets.tp3}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Institutional Analytical Engine Details */}
            <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Sliders className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-sm text-white">Engine Weight Diagnostics</h3>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                {Object.entries(engines || {}).map(([key, engineVal]: [string, any]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="capitalize text-slate-400 font-mono">{key} Engine:</span>
                      <span className="font-mono font-bold text-slate-200">{engineVal.score}/100</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full"
                        style={{ width: `${engineVal.score}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{engineVal.notes}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
