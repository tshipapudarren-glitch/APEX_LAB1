import React, { useState, useEffect } from 'react';
import { LiveSignalRecord, fetchLiveSignals } from '../services/api';
import { 
  ShieldCheck, 
  Target, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Award,
  Zap
} from 'lucide-react';

interface LiveSignalsTrackerProps {
  onPublishCurrentSetup?: () => void;
  activeSetupName?: string;
  refreshTrigger?: number;
}

export const LiveSignalsTracker: React.FC<LiveSignalsTrackerProps> = ({
  onPublishCurrentSetup,
  activeSetupName,
  refreshTrigger = 0,
}) => {
  const [signals, setSignals] = useState<LiveSignalRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSignals = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLiveSignals();
      setSignals(data.signals || []);
      setStats(data.stats);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load live signals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSignals();
    // Poll signals every 8 seconds to track real prices
    const interval = setInterval(loadSignals, 8000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const activeSignals = signals.filter((s) => s.status === 'ACTIVE');
  const resolvedSignals = signals.filter((s) => s.status !== 'ACTIVE');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">LIVE EXECUTION</span>
              <span className="text-slate-600">/</span>
              <h2 className="text-xl font-bold text-white tracking-tight">Real Signal Performance Tracker</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Monitors active signals against live exchange market feeds. Tracks real-time R-multiples, automatic TP1/TP2/TP3 fills, and verified stop outs in the persistent database.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {onPublishCurrentSetup && (
              <button
                onClick={onPublishCurrentSetup}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold shadow-md shadow-cyan-600/20 transition-all"
              >
                <Zap className="w-4 h-4 text-cyan-200" />
                <span>Track Current Setup Live</span>
              </button>
            )}

            <button
              onClick={loadSignals}
              disabled={loading}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
              title="Refresh Signals"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live Performance AI Stats */}
        {stats && (
          <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500">LIVE ACTIVE SIGNALS</div>
              <div className="text-lg font-bold text-cyan-300 mt-0.5">{stats.activeSignals} Active</div>
            </div>

            <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500">RESOLVED SIGNALS</div>
              <div className="text-lg font-bold text-slate-200 mt-0.5">{stats.closedSignals} Recorded</div>
            </div>

            <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500">VERIFIED WIN RATE</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">{stats.winRate}%</div>
            </div>

            <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500">TOTAL REALIZED R</div>
              <div className="text-lg font-bold text-amber-300 mt-0.5">
                {stats.totalProfitR > 0 ? '+' : ''}{stats.totalProfitR}R
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-lg text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: Active Signals vs Resolved Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Signals (7 cols) */}
        <div className="lg:col-span-7 bg-[#0b0e17] border border-cyan-500/30 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Live Open Positions Under Active Order Flow</h3>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-bold">{activeSignals.length} Active</span>
          </div>

          {activeSignals.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-mono">
              No live signals currently active. Select any asset in the Setup Generator and click "Track Current Setup Live" to start tracking against the live feed.
            </div>
          ) : (
            <div className="space-y-3 font-mono text-xs">
              {activeSignals.map((sig) => {
                const isLong = sig.direction === 'LONG';
                return (
                  <div
                    key={sig.id}
                    className="p-4 rounded-lg bg-slate-900/90 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{sig.symbol}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isLong
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}
                        >
                          {sig.direction}
                        </span>
                        <span className="text-slate-400 text-[11px] font-sans truncate max-w-xs">{sig.setupName}</span>
                      </div>

                      <div className="text-right">
                        <div
                          className={`font-bold text-sm ${
                            sig.pnlR >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {sig.pnlR >= 0 ? '+' : ''}{sig.pnlR}R Live
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Tick: {sig.currentPrice}
                        </div>
                      </div>
                    </div>

                    {/* Price Targets Strip */}
                    <div className="grid grid-cols-4 gap-2 text-[11px] pt-2 border-t border-slate-800/80">
                      <div>
                        <div className="text-slate-500 text-[9px]">ENTRY</div>
                        <div className="font-bold text-slate-200">{sig.entryPrice}</div>
                      </div>
                      <div>
                        <div className="text-rose-400 text-[9px]">STOP LOSS</div>
                        <div className="font-bold text-rose-400">{sig.stopLoss}</div>
                      </div>
                      <div>
                        <div className="text-emerald-400 text-[9px]">TP1 (1.5R)</div>
                        <div className="font-bold text-emerald-300">{sig.tp1}</div>
                      </div>
                      <div>
                        <div className="text-emerald-400 text-[9px]">TP2 (2.5R)</div>
                        <div className="font-bold text-emerald-300">{sig.tp2}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Resolved Signals History (5 cols) */}
        <div className="lg:col-span-5 bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Verified Outcome History</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">{resolvedSignals.length} Resolved</span>
          </div>

          {resolvedSignals.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-mono">
              Signal performance will update automatically as live prices reach target zones or invalidation levels.
            </div>
          ) : (
            <div className="space-y-2 font-mono text-xs max-h-[460px] overflow-y-auto">
              {resolvedSignals.map((sig) => {
                const isWin = sig.status.startsWith('HIT_TP');
                return (
                  <div
                    key={sig.id}
                    className="p-3 rounded bg-slate-900/80 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{sig.symbol}</span>
                        <span className="text-[10px] text-slate-400">{sig.direction}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-[10px] text-slate-400">Entry: {sig.entryPrice}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                        {sig.dnaFingerprint}
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          isWin
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {sig.status}
                      </div>
                      <div
                        className={`font-bold mt-1 ${
                          sig.pnlR > 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {sig.pnlR > 0 ? '+' : ''}{sig.pnlR}R
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
