import React, { useState } from 'react';
import { MarketAsset } from '../types/market';
import { ASSETS } from '../data/marketData';
import { 
  FileSearch, 
  Send, 
  AlertTriangle, 
  ShieldCheck, 
  History, 
  Clock, 
  Search, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';

interface AIInvestigatorProps {
  symbol: MarketAsset;
}

export const AIInvestigator: React.FC<AIInvestigatorProps> = ({ symbol }) => {
  const asset = ASSETS[symbol] || ASSETS.NQ;
  const [query, setQuery] = useState('Why did the 10:15 breakout stall near previous day high?');
  const [loading, setLoading] = useState(false);
  const [investigation, setInvestigation] = useState<any>(null);

  const presetQuestions = [
    `Why did the recent ${symbol} breakout stall at the highs?`,
    `Was the drop below Asian low a genuine breakdown or a liquidity trap?`,
    `Where did cumulative volume delta (CVD) diverge from price?`,
    `Why did the pullback long qualify under the current Market Regime Brain?`,
  ];

  const runInvestigation = async (customQuery?: string) => {
    const q = customQuery || query;
    setLoading(true);
    try {
      const res = await fetch('/api/ai-investigator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          symbol,
          context: {
            price: asset.price,
            regime: asset.regime,
            atr: asset.atr,
          },
        }),
      });

      const json = await res.json();
      if (json.data) {
        setInvestigation(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    runInvestigation();
  }, [symbol]);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">MODULE 05</span>
              <span className="text-slate-600">/</span>
              <h2 className="text-xl font-bold text-white tracking-tight">Apex AI Forensic Investigator</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Conducts forensic order flow post-mortems on trade setups, stop hunts, false breakouts, and institutional absorption traps.
            </p>
          </div>
        </div>

        {/* Query Input Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              runInvestigation();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask forensic order flow question..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-medium shadow-md shadow-cyan-600/20 transition-all disabled:opacity-50 shrink-0"
            >
              <Sparkles className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Investigating...' : 'Investigate'}</span>
            </button>
          </form>

          {/* Quick presets */}
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono text-slate-500">Suggested Inquiries:</span>
            {presetQuestions.map((pq, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(pq);
                  runInvestigation(pq);
                }}
                className="text-[11px] text-slate-400 hover:text-cyan-300 bg-slate-900/60 hover:bg-slate-850 px-2 py-1 rounded border border-slate-800 transition-colors truncate max-w-xs"
              >
                {pq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Investigation Report Result */}
      {investigation && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Forensic Evidence (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">FORENSIC VERDICT</div>
                  <h3 className="font-bold text-base text-white mt-0.5">
                    {investigation.investigationTitle}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded bg-amber-950/80 text-amber-300 font-mono font-bold text-xs border border-amber-800/60">
                    {investigation.verdict}
                  </span>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">
                    Confidence: {investigation.confidenceScore}%
                  </div>
                </div>
              </div>

              {/* Anomaly Callout */}
              <div className="mt-4 p-3 bg-amber-950/20 border border-amber-800/40 rounded-lg text-xs leading-relaxed text-amber-200">
                <strong>Primary Anomaly: </strong>
                {investigation.primaryAnomaly}
              </div>

              {/* Forensic Timeline */}
              <div className="mt-5 space-y-3">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Microstructure Sequence Timeline:
                </div>

                <div className="space-y-2.5">
                  {investigation.forensicTimeline?.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-xs flex items-start gap-3"
                    >
                      <span className="font-mono font-bold text-cyan-400 shrink-0">{item.time}</span>
                      <div className="space-y-1">
                        <div className="font-bold text-white">{item.event}</div>
                        <div className="text-slate-400 text-[11px]">{item.institutionalSignificance}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Rail: Delta Analysis & Actionable Takeaway (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="font-bold text-sm text-white">Delta &amp; Trap Mechanism</h3>
                <div className="text-[10px] font-mono text-slate-400">Order Flow Footprint Diagnostic</div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-mono">Market Aggression:</div>
                  <div className="text-slate-200 mt-1">{investigation.deltaAnalysis?.buyersAggression}</div>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px] uppercase font-mono">Passive Absorption:</div>
                  <div className="text-slate-200 mt-1">{investigation.deltaAnalysis?.passiveAbsorption}</div>
                </div>

                <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-lg">
                  <div className="text-rose-400 text-[10px] uppercase font-mono">Trap Mechanism:</div>
                  <div className="text-rose-200 mt-1">{investigation.deltaAnalysis?.trapMechanism}</div>
                </div>
              </div>
            </div>

            <div className="bg-[#0b0e17] border border-emerald-500/30 rounded-xl p-5 shadow-xl">
              <div className="pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-sm text-white">Actionable Rule for Future Setups</h3>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-200 leading-relaxed font-sans">
                {investigation.actionableTakeaway}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
