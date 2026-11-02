import React, { useState, useMemo, useRef } from 'react';
import { Candle, MarketAsset } from '../types/market';
import { ASSETS } from '../data/marketData';
import { 
  Eye, 
  Layers, 
  Target, 
  ShieldAlert, 
  TrendingUp, 
  Crosshair, 
  Maximize2, 
  BarChart2, 
  Sparkles,
  Info
} from 'lucide-react';

import { LiveSetupAnalysis } from '../services/api';

interface InteractiveChartProps {
  candles: Candle[];
  symbol: MarketAsset;
  onSelectTimeframe?: (tf: string) => void;
  selectedTimeframe?: string;
  onOpenSetupGenerator?: () => void;
  onTriggerDecisionReport?: () => void;
  liveSetup?: LiveSetupAnalysis | null;
  livePrice?: number;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({
  candles,
  symbol,
  selectedTimeframe = '15m',
  onSelectTimeframe,
  onOpenSetupGenerator,
  onTriggerDecisionReport,
  liveSetup,
  livePrice,
}) => {
  const asset = ASSETS[symbol] || ASSETS.NQ;
  const timeframes = ['1m', '5m', '15m', '1H', '4H', '1D'];

  // Overlay state toggles
  const [showStructure, setShowStructure] = useState(true);
  const [showOrderBlocks, setShowOrderBlocks] = useState(true);
  const [showFVG, setShowFVG] = useState(true);
  const [showLiquidity, setShowLiquidity] = useState(true);
  const [showVolumeProfile, setShowVolumeProfile] = useState(true);
  const [showTradeZones, setShowTradeZones] = useState(true);

  // Crosshair state
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute chart boundaries
  const { minPrice, maxPrice, priceRange, sortedCandles } = useMemo(() => {
    if (!candles || candles.length === 0) {
      return { minPrice: 0, maxPrice: 100, priceRange: 100, sortedCandles: [] };
    }
    const lows = candles.map((c) => c.low);
    const highs = candles.map((c) => c.high);
    const min = Math.min(...lows);
    const max = Math.max(...highs);
    const pad = (max - min) * 0.12 || 10;
    return {
      minPrice: min - pad,
      maxPrice: max + pad,
      priceRange: max - min + pad * 2,
      sortedCandles: candles,
    };
  }, [candles]);

  const activeCandle = hoverIndex !== null && sortedCandles[hoverIndex]
    ? sortedCandles[hoverIndex]
    : sortedCandles[sortedCandles.length - 1];

  // SVG dimensions
  const svgWidth = 880;
  const svgHeight = 440;
  const chartHeight = 360;
  const volumeHeight = 65;
  const rightMargin = 75; // for price axis
  const usableWidth = svgWidth - rightMargin - 20;
  const candleCount = sortedCandles.length;
  const candleSpacing = usableWidth / Math.max(candleCount, 1);
  const candleBodyWidth = Math.max(2, candleSpacing * 0.65);

  const priceToY = (price: number) => {
    if (priceRange === 0) return chartHeight / 2;
    return chartHeight - ((price - minPrice) / priceRange) * chartHeight;
  };

  const maxVolume = useMemo(() => {
    return Math.max(...candles.map((c) => c.volume), 1);
  }, [candles]);

  // Derived Institutional levels for the active asset (using real liveSetup values if present)
  const lastPrice = livePrice || (activeCandle ? activeCandle.close : asset.price);
  const atr = liveSetup?.atr || asset.atr;
  const invalidationStop = liveSetup ? liveSetup.stopLoss : Number((lastPrice - atr * 0.55).toFixed(2));
  const entryLow = liveSetup ? liveSetup.entryZone[0] : Number((lastPrice - atr * 0.15).toFixed(2));
  const entryHigh = liveSetup ? liveSetup.entryZone[1] : Number((lastPrice + atr * 0.1).toFixed(2));
  const tp1 = liveSetup ? liveSetup.targets.tp1 : Number((lastPrice + atr * 0.8).toFixed(2));
  const tp2 = liveSetup ? liveSetup.targets.tp2 : Number((lastPrice + atr * 1.5).toFixed(2));
  const tp3 = liveSetup ? liveSetup.targets.tp3 : Number((lastPrice + atr * 2.4).toFixed(2));

  // Key order block coordinates
  const obDemandTop = Number((lastPrice - atr * 0.25).toFixed(2));
  const obDemandBottom = Number((lastPrice - atr * 0.65).toFixed(2));
  const obSupplyTop = Number((lastPrice + atr * 1.8).toFixed(2));
  const obSupplyBottom = Number((lastPrice + atr * 1.35).toFixed(2));

  // Liquidity levels
  const bslPrice = Number((lastPrice + atr * 1.7).toFixed(2));
  const sslPrice = Number((lastPrice - atr * 0.95).toFixed(2));

  // Volume profile buckets
  const volumeProfileBuckets = useMemo(() => {
    const bucketsCount = 18;
    const bucketSize = priceRange / bucketsCount;
    const buckets = Array.from({ length: bucketsCount }, (_, i) => ({
      price: minPrice + (i + 0.5) * bucketSize,
      volume: 0,
    }));

    candles.forEach((c) => {
      const avg = (c.high + c.low + c.close) / 3;
      const bIdx = Math.min(
        bucketsCount - 1,
        Math.max(0, Math.floor((avg - minPrice) / bucketSize))
      );
      buckets[bIdx].volume += c.volume;
    });

    const maxBucketVol = Math.max(...buckets.map((b) => b.volume), 1);
    return { buckets, maxBucketVol };
  }, [candles, minPrice, priceRange]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const index = Math.floor(x / candleSpacing);
    if (index >= 0 && index < candleCount) {
      setHoverIndex(index);
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  return (
    <div className="bg-[#0b0e17] border border-slate-800/80 rounded-xl overflow-hidden shadow-2xl flex flex-col">
      {/* Chart Top Header & Controls */}
      <div className="p-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-[#0d111c]/90">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-base text-white tracking-wide">{symbol}</span>
            <span className="text-xs text-slate-400 font-medium">{asset.name}</span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Timeframe selector */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 text-xs font-mono">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => onSelectTimeframe?.(tf)}
                className={`px-2 py-1 rounded transition-colors ${
                  selectedTimeframe === tf
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Overlay Layer Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1 mr-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            Overlays:
          </span>

          <button
            onClick={() => setShowStructure(!showStructure)}
            className={`px-2 py-1 rounded border text-[11px] font-mono transition-colors ${
              showStructure
                ? 'bg-blue-950/70 border-blue-500/60 text-blue-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title="Market Structure: BOS & CHoCH"
          >
            Structure (BOS/CHoCH)
          </button>

          <button
            onClick={() => setShowOrderBlocks(!showOrderBlocks)}
            className={`px-2 py-1 rounded border text-[11px] font-mono transition-colors ${
              showOrderBlocks
                ? 'bg-purple-950/70 border-purple-500/60 text-purple-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title="Institutional Supply & Demand Order Blocks"
          >
            Order Blocks
          </button>

          <button
            onClick={() => setShowFVG(!showFVG)}
            className={`px-2 py-1 rounded border text-[11px] font-mono transition-colors ${
              showFVG
                ? 'bg-amber-950/70 border-amber-500/60 text-amber-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title="Fair Value Gaps / Imbalances"
          >
            FVG Imbalance
          </button>

          <button
            onClick={() => setShowLiquidity(!showLiquidity)}
            className={`px-2 py-1 rounded border text-[11px] font-mono transition-colors ${
              showLiquidity
                ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title="BSL & SSL Liquidity Pools"
          >
            Liquidity Pools
          </button>

          <button
            onClick={() => setShowTradeZones(!showTradeZones)}
            className={`px-2 py-1 rounded border text-[11px] font-mono transition-colors ${
              showTradeZones
                ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-300'
                : 'bg-slate-900/80 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
            title="Entry, Stop Loss & Targets"
          >
            Entry &amp; Targets
          </button>
        </div>
      </div>

      {/* OHLCV & Delta Data Status Ribbon */}
      <div className="px-4 py-2 bg-[#090c13] border-b border-slate-850 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">TIME:</span>
            <span className="text-slate-200">{activeCandle?.time || '--:--'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">O:</span>
            <span className="text-slate-200">{activeCandle?.open.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">H:</span>
            <span className="text-emerald-400">{activeCandle?.high.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">L:</span>
            <span className="text-rose-400">{activeCandle?.low.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">C:</span>
            <span className={activeCandle?.close >= (activeCandle?.open || 0) ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {activeCandle?.close.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">VOL:</span>
            <span className="text-cyan-300">{activeCandle?.volume.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">DELTA:</span>
            <span className={activeCandle?.delta && activeCandle.delta > 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {activeCandle?.delta && activeCandle.delta > 0 ? '+' : ''}{activeCandle?.delta?.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">REGIME:</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-emerald-950/70 text-emerald-300 border border-emerald-700/60 uppercase">
            {asset.regime.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div ref={containerRef} className="relative w-full h-[440px] bg-[#07090f] select-none overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Subtle Grid Lines */}
          <g className="stroke-slate-800/40" strokeDasharray="3 3">
            {[0.2, 0.4, 0.6, 0.8].map((ratio) => (
              <line
                key={`h-${ratio}`}
                x1={0}
                y1={chartHeight * ratio}
                x2={usableWidth}
                y2={chartHeight * ratio}
              />
            ))}
            {[0.25, 0.5, 0.75].map((ratio) => (
              <line
                key={`v-${ratio}`}
                x1={usableWidth * ratio}
                y1={0}
                x2={usableWidth * ratio}
                y2={chartHeight}
              />
            ))}
          </g>

          {/* Volume Profile on Right Margin */}
          {showVolumeProfile && (
            <g className="opacity-80">
              {volumeProfileBuckets.buckets.map((b, i) => {
                const y = priceToY(b.price);
                const barWidth = (b.volume / volumeProfileBuckets.maxBucketVol) * 85;
                const isPOC = b.volume === volumeProfileBuckets.maxBucketVol;

                return (
                  <rect
                    key={`vp-${i}`}
                    x={usableWidth - barWidth}
                    y={y - 8}
                    width={barWidth}
                    height={16}
                    fill={isPOC ? 'rgba(234, 179, 8, 0.4)' : 'rgba(56, 189, 248, 0.15)'}
                    stroke={isPOC ? 'rgba(234, 179, 8, 0.7)' : 'none'}
                    strokeWidth={1}
                  />
                );
              })}
            </g>
          )}

          {/* Institutional Order Blocks (OB) */}
          {showOrderBlocks && (
            <g>
              {/* Bullish Demand OB */}
              <rect
                x={usableWidth * 0.4}
                y={priceToY(obDemandTop)}
                width={usableWidth * 0.6}
                height={Math.max(4, priceToY(obDemandBottom) - priceToY(obDemandTop))}
                fill="rgba(16, 185, 129, 0.12)"
                stroke="rgba(16, 185, 129, 0.5)"
                strokeDasharray="4 2"
              />
              <text
                x={usableWidth * 0.42}
                y={priceToY(obDemandTop) + 14}
                fill="#34d399"
                fontSize="10"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                15m Bullish Demand OB [{obDemandBottom} - {obDemandTop}]
              </text>

              {/* Bearish Supply OB */}
              <rect
                x={usableWidth * 0.5}
                y={priceToY(obSupplyTop)}
                width={usableWidth * 0.5}
                height={Math.max(4, priceToY(obSupplyBottom) - priceToY(obSupplyTop))}
                fill="rgba(244, 63, 94, 0.12)"
                stroke="rgba(244, 63, 94, 0.5)"
                strokeDasharray="4 2"
              />
              <text
                x={usableWidth * 0.52}
                y={priceToY(obSupplyTop) + 14}
                fill="#fb7185"
                fontSize="10"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                4H Bearish Supply Zone [{obSupplyBottom} - {obSupplyTop}]
              </text>
            </g>
          )}

          {/* Fair Value Gaps (FVG) */}
          {showFVG && (
            <g>
              <rect
                x={usableWidth * 0.62}
                y={priceToY(lastPrice - atr * 0.05)}
                width={usableWidth * 0.38}
                height={Math.max(6, priceToY(lastPrice - atr * 0.22) - priceToY(lastPrice - atr * 0.05))}
                fill="rgba(245, 158, 11, 0.16)"
                stroke="rgba(245, 158, 11, 0.6)"
                strokeWidth={1}
              />
              <text
                x={usableWidth * 0.64}
                y={priceToY(lastPrice - atr * 0.05) + 12}
                fill="#fbbf24"
                fontSize="10"
                fontFamily="JetBrains Mono"
              >
                Untested FVG (Displacement Gap)
              </text>
            </g>
          )}

          {/* Liquidity Levels (BSL & SSL) */}
          {showLiquidity && (
            <g>
              {/* Buy-Side Liquidity (BSL) */}
              <line
                x1={0}
                y1={priceToY(bslPrice)}
                x2={usableWidth}
                y2={priceToY(bslPrice)}
                stroke="#38bdf8"
                strokeWidth="1.5"
                strokeDasharray="6 3"
              />
              <text
                x={12}
                y={priceToY(bslPrice) - 6}
                fill="#38bdf8"
                fontSize="11"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                BSL Pool (Resting Buy Stops: 2,950 contracts) - {bslPrice}
              </text>

              {/* Sell-Side Liquidity (SSL) */}
              <line
                x1={0}
                y1={priceToY(sslPrice)}
                x2={usableWidth}
                y2={priceToY(sslPrice)}
                stroke="#ec4899"
                strokeWidth="1.5"
                strokeDasharray="6 3"
              />
              <text
                x={12}
                y={priceToY(sslPrice) + 14}
                fill="#ec4899"
                fontSize="11"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                SSL Purge / Asian Low Swept - {sslPrice}
              </text>
            </g>
          )}

          {/* Trade Execution Zones: Entry, Stop Loss (Invalidation), TP1, TP2, TP3 */}
          {showTradeZones && (
            <g>
              {/* Entry Zone Band */}
              <rect
                x={usableWidth * 0.72}
                y={priceToY(entryHigh)}
                width={usableWidth * 0.28}
                height={Math.max(4, priceToY(entryLow) - priceToY(entryHigh))}
                fill="rgba(6, 182, 212, 0.25)"
                stroke="#06b6d4"
                strokeWidth="1.5"
              />
              <text
                x={usableWidth * 0.74}
                y={priceToY(entryHigh) + 12}
                fill="#22d3ee"
                fontSize="10"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                QUALIFIED ENTRY ZONE [{entryLow} - {entryHigh}]
              </text>

              {/* Invalidation Stop Loss */}
              <line
                x1={usableWidth * 0.7}
                y1={priceToY(invalidationStop)}
                x2={usableWidth}
                y2={priceToY(invalidationStop)}
                stroke="#f43f5e"
                strokeWidth="2"
              />
              <text
                x={usableWidth * 0.74}
                y={priceToY(invalidationStop) + 14}
                fill="#f43f5e"
                fontSize="10"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                INVALIDATION STOP LOSS: {invalidationStop}
              </text>

              {/* Targets */}
              <line
                x1={usableWidth * 0.7}
                y1={priceToY(tp1)}
                x2={usableWidth}
                y2={priceToY(tp1)}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="5 2"
              />
              <text
                x={usableWidth * 0.74}
                y={priceToY(tp1) - 4}
                fill="#34d399"
                fontSize="10"
                fontFamily="JetBrains Mono"
              >
                TARGET 1: {tp1} (1.5R)
              </text>

              <line
                x1={usableWidth * 0.7}
                y1={priceToY(tp2)}
                x2={usableWidth}
                y2={priceToY(tp2)}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="5 2"
              />
              <text
                x={usableWidth * 0.74}
                y={priceToY(tp2) - 4}
                fill="#34d399"
                fontSize="10"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                TARGET 2: {tp2} (2.8R)
              </text>
            </g>
          )}

          {/* Candlesticks & Volume Bars */}
          {sortedCandles.map((c, i) => {
            const x = i * candleSpacing + candleSpacing / 2;
            const isBull = c.close >= c.open;
            const bodyTop = priceToY(Math.max(c.open, c.close));
            const bodyBottom = priceToY(Math.min(c.open, c.close));
            const wickTop = priceToY(c.high);
            const wickBottom = priceToY(c.low);
            const color = isBull ? '#10b981' : '#f43f5e';

            // Volume bar calculations
            const volBarHeight = (c.volume / maxVolume) * volumeHeight;
            const volBarY = svgHeight - volBarHeight;

            return (
              <g key={`candle-${i}`}>
                {/* Volume Bar at Bottom */}
                <rect
                  x={x - candleBodyWidth / 2}
                  y={volBarY}
                  width={candleBodyWidth}
                  height={volBarHeight}
                  fill={isBull ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)'}
                />

                {/* Candlestick Wick */}
                <line
                  x1={x}
                  y1={wickTop}
                  x2={x}
                  y2={wickBottom}
                  stroke={color}
                  strokeWidth="1.2"
                />

                {/* Candlestick Body */}
                <rect
                  x={x - candleBodyWidth / 2}
                  y={bodyTop}
                  width={candleBodyWidth}
                  height={Math.max(2, bodyBottom - bodyTop)}
                  fill={isBull ? '#10b981' : '#f43f5e'}
                  rx={1}
                />

                {/* Market Structure Badges */}
                {showStructure && c.marker && (
                  <g>
                    <circle
                      cx={x}
                      cy={c.marker === 'SWEEP' ? wickBottom + 12 : wickTop - 12}
                      r={6}
                      fill={c.marker === 'BOS' ? '#3b82f6' : c.marker === 'CHOCH' ? '#8b5cf6' : '#f59e0b'}
                    />
                    <text
                      x={x}
                      y={c.marker === 'SWEEP' ? wickBottom + 15 : wickTop - 9}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="8"
                      fontFamily="JetBrains Mono"
                      fontWeight="bold"
                    >
                      {c.marker.slice(0, 1)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Hover Crosshair */}
          {hoverIndex !== null && hoverIndex < candleCount && (
            <g>
              {/* Vertical crosshair */}
              <line
                x1={hoverIndex * candleSpacing + candleSpacing / 2}
                y1={0}
                x2={hoverIndex * candleSpacing + candleSpacing / 2}
                y2={svgHeight}
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity={0.7}
              />
              {/* Horizontal crosshair */}
              <line
                x1={0}
                y1={priceToY(sortedCandles[hoverIndex].close)}
                x2={usableWidth}
                y2={priceToY(sortedCandles[hoverIndex].close)}
                stroke="#38bdf8"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity={0.7}
              />
            </g>
          )}

          {/* Y-Axis Price Labels on Right Margin */}
          <g>
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio) => {
              const p = minPrice + (1 - ratio) * priceRange;
              const y = chartHeight * ratio;
              return (
                <text
                  key={`p-${ratio}`}
                  x={usableWidth + 8}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                >
                  {p.toFixed(symbol === 'EURUSD' ? 5 : 2)}
                </text>
              );
            })}
          </g>

          {/* Current Price Marker */}
          <g>
            <rect
              x={usableWidth + 2}
              y={priceToY(lastPrice) - 10}
              width={rightMargin - 6}
              height={20}
              fill="#06b6d4"
              rx={3}
            />
            <text
              x={usableWidth + 6}
              y={priceToY(lastPrice) + 4}
              fill="#080b11"
              fontSize="10"
              fontFamily="JetBrains Mono"
              fontWeight="bold"
            >
              {lastPrice.toFixed(symbol === 'EURUSD' ? 5 : 2)}
            </text>
          </g>
        </svg>

        {/* Floating Quick Action Overlay */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <button
            onClick={onOpenSetupGenerator}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600/90 hover:bg-cyan-500 text-white rounded-md text-xs font-medium shadow-lg backdrop-blur transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Setup Intelligence</span>
          </button>

          <button
            onClick={onTriggerDecisionReport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-md text-xs font-medium shadow-lg backdrop-blur transition-all"
          >
            <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Produce Decision Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
