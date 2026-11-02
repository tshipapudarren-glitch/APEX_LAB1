import React, { useState } from 'react';
import { MarketAsset, SetupDNA } from '../types/market';
import { SETUP_DNA_DATABASE } from '../data/marketData';
import { 
  Dna, 
  Search, 
  History, 
  TrendingUp, 
  AlertOctagon, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Sparkles, 
  Flame, 
  Layers,
  ChevronRight,
  ShieldAlert,
  BarChart2
} from 'lucide-react';

interface SetupDNALabProps {
  currentSymbol: MarketAsset;
  onSelectSetup?: (setup: SetupDNA) => void;
}

export const SetupDNALab: React.FC<SetupDNALabProps> = ({
  currentSymbol,
  onSelectSetup,
}) => {
  const [selectedSetupId, setSelectedSetupId] = useState<string>(
    SETUP_DNA_DATABASE[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');

  const activeSetup = SETUP_DNA_DATABASE.find((s) => s.id === selectedSetupId) || SETUP_DNA_DATABASE[0];

  const filteredSetups = SETUP_DNA_DATABASE.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.dnaFingerprint.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">LABORATORY</span>
              <span className="text-slate-600">/</span>
              <span className="text-xs font-mono text-purple-400 font-bold uppercase tracking-widest">ALGORYZE X</span>
              <span className="text-slate-600">/</span>
              <h2 className="text-xl font-bold text-white tracking-tight">Apex Setup DNA Laboratory</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Gives every trading setup its own measurable identity. Matches current market conditions against our historical quantitative database to reveal actual historical outcomes and failure patterns.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search DNA Fingerprint / Setup..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-64"
              />
            </div>
          </div>
        </div>

        {/* Setup Selector Strip */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {filteredSetups.map((s) => {
            const isSelected = s.id === selectedSetupId;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedSetupId(s.id)}
                className={`px-3 py-2 rounded-lg border text-left shrink-0 transition-all ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-500/70 shadow-sm shadow-cyan-500/10'
                    : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="font-bold text-white">{s.symbol}</span>
                  <span className="text-cyan-400 text-[10px]">{s.dnaFingerprint}</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-300 font-bold text-[9px] border border-emerald-800/60">
                    {s.grade}
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-medium truncate max-w-[220px] mt-0.5">
                  {s.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Laboratory Grid */}
      {activeSetup && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: DNA Fingerprint & Setup Metrics (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Setup DNA Card */}
            <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center">
                    <Dna className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{activeSetup.name}</h3>
                    <div className="text-[10px] font-mono text-slate-400">{activeSetup.timeframe} · {activeSetup.session} Session</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-mono font-bold text-cyan-300">
                    {activeSetup.qualityScore}
                    <span className="text-xs text-slate-400">/100</span>
                  </div>
                  <div className="text-[10px] font-mono text-cyan-400">QUALITY SCORE</div>
                </div>
              </div>

              {/* Unique DNA Fingerprint Barcode View */}
              <div className="mt-4 p-3 bg-slate-900/90 rounded-lg border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">SETUP FINGERPRINT IDENTITY</div>
                <div className="mt-1 flex items-center justify-between font-mono">
                  <span className="text-sm font-bold text-cyan-300 tracking-wider">{activeSetup.dnaFingerprint}</span>
                  <span className="text-[10px] text-slate-400">HASH: #{activeSetup.id.split('-').pop()}</span>
                </div>
                {/* Visual simulated DNA barcode strips */}
                <div className="mt-2 flex items-center gap-1 h-3">
                  {[4, 2, 8, 1, 6, 3, 5, 2, 7, 3, 5, 2, 9, 3, 6, 2, 4, 8, 2, 5, 3, 7, 2, 6].map((w, i) => (
                    <div
                      key={i}
                      className="h-full bg-gradient-to-t from-cyan-600 to-cyan-300 rounded-[1px] opacity-80"
                      style={{ width: `${w * 2}px` }}
                    />
                  ))}
                </div>
              </div>

              {/* Performance by Session & Volatility */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px] font-sans">Performance by Session:</div>
                  <div className="text-emerald-400 font-bold text-sm mt-0.5">
                    {activeSetup.historicalMatches.winRate}% WR
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-sans">
                    Peak edge during {activeSetup.session}
                  </div>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px] font-sans">Performance by Volatility:</div>
                  <div className="text-amber-400 font-bold text-sm mt-0.5">
                    +{activeSetup.historicalMatches.avgR}R Avg
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 font-sans">
                    {activeSetup.volatilityCondition} state
                  </div>
                </div>
              </div>

              {/* Qualification Rationale */}
              <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                <div className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  Qualification Criteria
                </div>
                <div className="text-xs text-slate-300 leading-relaxed bg-emerald-950/20 p-2.5 rounded border border-emerald-900/40">
                  {activeSetup.qualificationRationale}
                </div>
              </div>

              {/* Disqualification Threshold */}
              <div className="mt-3 space-y-2">
                <div className="text-[11px] font-mono text-rose-400 font-bold uppercase tracking-wider">
                  Disqualification Invalidation
                </div>
                <div className="text-xs text-rose-200/90 leading-relaxed bg-rose-950/20 p-2.5 rounded border border-rose-900/40">
                  {activeSetup.disqualificationCriteria}
                </div>
              </div>
            </div>

            {/* Failure Pattern Detection Card */}
            <div className="bg-[#0b0e17] border border-amber-900/50 rounded-xl p-5 shadow-xl">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <AlertOctagon className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Failure Pattern Detection</h3>
              </div>
              <div className="text-xs text-slate-400 mt-2">
                Algorithmic warning flags detected in past instances that failed:
              </div>

              <div className="mt-3 space-y-2 text-xs">
                {activeSetup.failurePatterns.map((pattern, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded bg-amber-950/20 border border-amber-900/40 text-amber-200 flex items-start gap-2"
                  >
                    <span className="text-amber-400 font-mono">⚠</span>
                    <span>{pattern}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Historical Similarity Matching & Actual Outcomes (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-cyan-400" />
                  <div>
                    <h3 className="font-bold text-sm text-white">Historical Similarity Matching</h3>
                    <div className="text-[11px] text-slate-400">
                      Found <strong className="text-cyan-300 font-mono">{activeSetup.historicalMatches.totalMatches}</strong> historical setups with identical DNA fingerprint
                    </div>
                  </div>
                </div>

                {/* Aggregate Outcome Badges */}
                <div className="flex items-center gap-2 font-mono text-xs">
                  <div className="px-2.5 py-1 rounded bg-emerald-950/70 border border-emerald-700/60 text-emerald-300">
                    {activeSetup.historicalMatches.winRate}% Win Rate
                  </div>
                  <div className="px-2.5 py-1 rounded bg-cyan-950/70 border border-cyan-700/60 text-cyan-300">
                    +{activeSetup.historicalMatches.avgR}R Expectancy
                  </div>
                </div>
              </div>

              {/* Historical Instance Cards */}
              <div className="mt-4 space-y-3">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Actual Historical Match Logs:
                </div>

                {activeSetup.historicalMatches.similarInstances.map((match, idx) => {
                  const isWin = match.outcome === 'TARGET_HIT';
                  const isLoss = match.outcome === 'STOPPED_OUT';

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400">{match.date}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-white font-bold">{match.symbol}</span>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {match.duration}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isWin
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : isLoss
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {match.outcome}
                          </span>
                          <span
                            className={`font-bold ${
                              match.rMultiple > 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {match.rMultiple > 0 ? '+' : ''}{match.rMultiple}R
                          </span>
                        </div>
                      </div>

                      <div className="mt-2 text-xs text-slate-300 leading-relaxed font-sans">
                        {match.notes}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Execution Guidance */}
              <div className="mt-6 p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Ready to Execute this Setup?</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    R:R 1:{activeSetup.riskReward} · Stop Loss: {activeSetup.invalidationLevel} · TP1: {activeSetup.targets.tp1}
                  </div>
                </div>

                <button
                  onClick={() => onSelectSetup?.(activeSetup)}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium shadow-md shadow-cyan-600/20 transition-all shrink-0"
                >
                  Load into Execution Terminal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
