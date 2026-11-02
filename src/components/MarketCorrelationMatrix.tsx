import React, { useState, useEffect } from 'react';
import { 
  fetchMarketCorrelations, 
  CorrelationMatrixResult, 
  CorrelationAssetInfo, 
  CorrelationDivergenceAlert 
} from '../services/api';
import { 
  Grid, 
  Layers, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Info, 
  Filter,
  Flame,
  ArrowRightLeft
} from 'lucide-react';

interface MarketCorrelationMatrixProps {
  onSelectPair?: (symbolA: string, symbolB: string) => void;
}

export const MarketCorrelationMatrix: React.FC<MarketCorrelationMatrixProps> = ({
  onSelectPair,
}) => {
  const [data, setData] = useState<CorrelationMatrixResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('15m');
  const [hoveredCell, setHoveredCell] = useState<{ a: string; b: string; val: number } | null>(null);

  const categories = ['ALL', 'INDICES', 'METALS', 'ENERGY', 'FX', 'SYNTHETICS', 'CRYPTO'];

  const loadCorrelations = async () => {
    setLoading(true);
    try {
      const res = await fetchMarketCorrelations(selectedCategory, selectedTimeframe);
      setData(res);
    } catch (err: any) {
      console.error('Correlation matrix error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCorrelations();
    // Refresh every 12 seconds
    const interval = setInterval(loadCorrelations, 12000);
    return () => clearInterval(interval);
  }, [selectedCategory, selectedTimeframe]);

  const getCellBgColor = (val: number) => {
    if (val >= 0.8) return 'bg-emerald-600 text-white font-bold';
    if (val >= 0.5) return 'bg-emerald-800/80 text-emerald-200';
    if (val >= 0.2) return 'bg-teal-950/80 text-teal-300 border border-teal-800/40';
    if (val > -0.2) return 'bg-slate-900 text-slate-400 border border-slate-800/60';
    if (val > -0.5) return 'bg-amber-950/80 text-amber-300 border border-amber-800/40';
    if (val > -0.8) return 'bg-rose-900/80 text-rose-200';
    return 'bg-rose-600 text-white font-bold';
  };

  const assets = data?.assets || [];
  const matrix = data?.matrix || {};
  const divergences = data?.divergences || [];

  return (
    <div className="bg-[#0b0e17] border border-cyan-500/30 rounded-xl p-5 shadow-2xl space-y-6">
      {/* Top Banner & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">LIQUIDITY UTILITY</span>
            <span className="text-slate-600">/</span>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Grid className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Market Correlation Matrix</span>
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real Pearson correlation coefficients ($-1.00$ to $+1.00$) calculated across live price series. Reveals institutional co-movement, risk-on/risk-off clustering, and SMT divergences.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-1 rounded transition-colors ${
                  selectedCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Timeframe selector */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
            {['5m', '15m', '1H', '1D'].map((tf) => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-2 py-1 rounded transition-colors ${
                  selectedTimeframe === tf
                    ? 'bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={loadCorrelations}
            disabled={loading}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
            title="Refresh Correlations"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Correlation Matrix Heatmap Table */}
      {assets.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 font-mono">
          Loading real-time market correlations from exchange feeds...
        </div>
      ) : (
        <div className="overflow-x-auto pb-2">
          <table className="w-full text-center border-collapse select-none">
            <thead>
              <tr>
                <th className="p-2 text-left text-[11px] font-mono text-slate-400 border-b border-r border-slate-800/80 bg-slate-900/60 sticky left-0 z-10">
                  ASSET / PAIR
                </th>
                {assets.map((a) => (
                  <th key={a.symbol} className="p-2 text-[10px] font-mono font-bold text-slate-300 border-b border-slate-800 min-w-[58px]">
                    <div>{a.symbol}</div>
                    <div className={`text-[9px] font-normal ${a.change24hPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {a.change24hPct >= 0 ? '+' : ''}{a.change24hPct}%
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assets.map((rowAsset) => (
                <tr key={rowAsset.symbol} className="border-b border-slate-850/60">
                  {/* Row Header */}
                  <td className="p-2 text-left text-xs font-mono font-bold text-white border-r border-slate-800 bg-slate-900/80 sticky left-0 z-10 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span>{rowAsset.symbol}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({rowAsset.category})</span>
                    </div>
                  </td>

                  {/* Matrix Cells */}
                  {assets.map((colAsset) => {
                    const val = matrix[rowAsset.symbol]?.[colAsset.symbol] ?? (rowAsset.symbol === colAsset.symbol ? 1.0 : 0);
                    const isSelf = rowAsset.symbol === colAsset.symbol;

                    return (
                      <td
                        key={colAsset.symbol}
                        onMouseEnter={() => setHoveredCell({ a: rowAsset.symbol, b: colAsset.symbol, val })}
                        onMouseLeave={() => setHoveredCell(null)}
                        onClick={() => onSelectPair?.(rowAsset.symbol, colAsset.symbol)}
                        className={`p-1.5 text-[11px] font-mono transition-all cursor-pointer ${
                          isSelf
                            ? 'bg-slate-850 text-slate-500 font-bold'
                            : getCellBgColor(val)
                        } hover:ring-2 hover:ring-cyan-400 hover:z-20`}
                      >
                        {val > 0 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend & Hover Detail Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs font-mono">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 text-[11px]">CORRELATION SCALE:</span>
          <div className="flex items-center gap-1 text-[10px]">
            <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white">+0.8 to +1.0 (Strong Positive)</span>
            <span className="px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">+0.2 to +0.7</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">-0.2 to +0.2 (Decorrelated)</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">-0.3 to -0.7</span>
            <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white">-0.8 to -1.0 (Inverse)</span>
          </div>
        </div>

        {hoveredCell && (
          <div className="text-cyan-300 font-bold bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800 text-[11px]">
            {hoveredCell.a} ↔ {hoveredCell.b}: {hoveredCell.val > 0 ? `+${hoveredCell.val}` : hoveredCell.val} (
            {hoveredCell.val > 0.75
              ? 'Move in sync'
              : hoveredCell.val < -0.75
              ? 'Inverse hedge'
              : 'Independent liquidity'}
            )
          </div>
        )}
      </div>

      {/* Smart Money Technique (SMT) Decoupling & Divergence Alerts */}
      {divergences.length > 0 && (
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <h4 className="font-bold text-xs text-white uppercase tracking-wider font-mono">
              Live SMT Divergence &amp; Decoupling Alerts
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {divergences.map((alert, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 space-y-2 text-xs font-mono"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white">{alert.pair[0]}</span>
                    <ArrowRightLeft className="w-3 h-3 text-slate-500" />
                    <span className="font-bold text-white">{alert.pair[1]}</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                    {alert.divergenceType}
                  </span>
                </div>

                <div className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  {alert.divergenceDescription}
                </div>

                <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800 flex justify-between">
                  <span>Leader: <strong className="text-emerald-400">{alert.leader}</strong></span>
                  <span>Laggard: <strong className="text-amber-400">{alert.laggard}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
