import React, { useState, useRef } from 'react';
import { MarketAsset, SetupDNA } from '../types/market';
import { ASSETS } from '../data/marketData';
import { 
  Upload, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  Target, 
  Crosshair, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  ArrowRight,
  Layers,
  Zap,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react';

interface SetupGeneratorProps {
  symbol: MarketAsset;
  onApplySetupToChart?: (setup: any) => void;
  onOpenDecisionIntelligence?: () => void;
}

export const SetupGenerator: React.FC<SetupGeneratorProps> = ({
  symbol,
  onApplySetupToChart,
  onOpenDecisionIntelligence,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const asset = ASSETS[symbol] || ASSETS.NQ;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, or WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedImage(base64);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRunAnalysis = async (useLiveChart = false) => {
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const payload: any = {
        symbol,
        timeframe: '15m',
        currentPrice: asset.price,
      };

      if (!useLiveChart && selectedImage) {
        payload.imageBase64 = selectedImage;
      }

      const res = await fetch('/api/analyze-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned error: ${res.statusText}`);
      }

      const json = await res.json();
      if (json.data) {
        setAnalysisResult(json.data);
      } else {
        throw new Error('Invalid analysis response format');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMsg(err.message || 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Pre-load default analysis if none yet
  React.useEffect(() => {
    if (!analysisResult) {
      handleRunAnalysis(true);
    }
  }, [symbol]);

  return (
    <div className="space-y-6">
      {/* Banner / Mode Selector */}
      <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">MODULE 01</span>
              <span className="text-slate-600">/</span>
              <h2 className="text-xl font-bold text-white tracking-tight">Market Behaviour &amp; Setup Generator</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Upload any chart screenshot (TradingView, NinjaTrader, Bookmap, Sierra Chart) or run instant multi-engine analysis on the live {symbol} feed.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium border border-slate-700 shadow-sm transition-all"
            >
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Upload Screenshot</span>
            </button>

            <button
              onClick={() => handleRunAnalysis(true)}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium shadow-md shadow-cyan-600/20 transition-all"
            >
              <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Analyzing Order Flow...' : 'Analyze Live Chart'}</span>
            </button>
          </div>
        </div>

        {/* Upload preview or Live Chart status */}
        {selectedImage && (
          <div className="mt-4 p-3 bg-slate-900/90 rounded-lg border border-slate-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded border border-slate-700 overflow-hidden bg-black shrink-0">
                <img src={selectedImage} alt="Uploaded chart preview" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Custom Chart Screenshot Loaded</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Ready for Vision Engine</span>
                </div>
                <div className="text-[11px] text-slate-400">Gemini 3.8 Flash Vision will scan market structure, imbalances, and order blocks.</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleRunAnalysis(false)}
                disabled={isAnalyzing}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium shadow transition-colors"
              >
                {isAnalyzing ? 'Processing...' : 'Run Vision Scan'}
              </button>
              <button
                onClick={() => setSelectedImage(null)}
                className="px-2 py-1.5 text-slate-400 hover:text-slate-200 text-xs"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-950/40 border border-rose-800/80 rounded-lg text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Structured Analysis Results Grid */}
      {analysisResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Market Structure & Price Levels */}
          <div className="space-y-6">
            {/* Market Structure Card */}
            <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-bold text-sm text-white">Market Structure</h3>
                </div>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-700/50">
                  {analysisResult.marketStructure?.structureState || 'BOS_CONTINUATION'}
                </span>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                  <span className="text-slate-400">Primary Trend:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {analysisResult.marketStructure?.trend || 'BULLISH'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                  <span className="text-slate-400">Break of Structure (BOS):</span>
                  <span className="font-mono text-cyan-300">
                    {analysisResult.marketStructure?.bosLevel || '20,490.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                  <span className="text-slate-400">Change of Character (CHoCH):</span>
                  <span className="font-mono text-amber-300">
                    {analysisResult.marketStructure?.chochLevel || '20,380.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-850">
                  <span className="text-slate-400">Key Swing High:</span>
                  <span className="font-mono text-slate-200">
                    {analysisResult.marketStructure?.keySwingHigh || '20,520.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-slate-400">Key Swing Low:</span>
                  <span className="font-mono text-slate-200">
                    {analysisResult.marketStructure?.keySwingLow || '20,360.00'}
                  </span>
                </div>
              </div>

              {/* Order Blocks and FVGs */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                <div className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                  Detected Order Blocks &amp; FVGs
                </div>
                {analysisResult.marketStructure?.orderBlocks?.map((ob: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded bg-slate-900/80 border border-slate-800 text-[11px]">
                    <div className="flex items-center justify-between font-mono font-bold">
                      <span className={ob.type === 'BULLISH' ? 'text-emerald-400' : 'text-rose-400'}>
                        {ob.type} Demand Block
                      </span>
                      <span className="text-slate-300">[{ob.bottom} - {ob.top}]</span>
                    </div>
                    <div className="text-slate-400 text-[10px] mt-1">{ob.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Levels & Liquidity Radar Card */}
            <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-sm text-white">Important Price Levels</h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-400">ORDERBOOK POOLS</span>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="p-2.5 rounded bg-cyan-950/30 border border-cyan-800/40">
                  <div className="text-slate-400 text-[11px]">Buy-Side Liquidity (BSL) Pool:</div>
                  <div className="text-base font-mono font-bold text-cyan-300 mt-0.5">
                    {analysisResult.liquidityAnalysis?.buySideLiquidity || '20,540.00'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">High concentration of retail stop-buy and breakout orders.</div>
                </div>

                <div className="p-2.5 rounded bg-purple-950/30 border border-purple-800/40">
                  <div className="text-slate-400 text-[11px]">Sell-Side Liquidity (SSL) Pool:</div>
                  <div className="text-base font-mono font-bold text-purple-300 mt-0.5">
                    {analysisResult.liquidityAnalysis?.sellSideLiquidity || '20,380.00'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {analysisResult.liquidityAnalysis?.sweepZone || 'Asian low liquidity engineered & swept.'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Potential Setup Detection & Quality Scoring */}
          <div className="space-y-6">
            <div className="bg-[#0b0e17] border border-cyan-500/40 rounded-xl p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">DETECTED SETUP</div>
                  <h3 className="font-bold text-base text-white mt-0.5">
                    {analysisResult.setupQualification?.setupName || 'ICT SFP Liquidity Sweep & Displacement'}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-mono font-bold text-emerald-400">
                    {analysisResult.setupQualification?.qualityScore || 92}
                    <span className="text-xs text-slate-400">/100</span>
                  </div>
                  <div className="text-[10px] font-mono text-emerald-300">GRADE A+ SETUP</div>
                </div>
              </div>

              {/* Setup Fingerprint */}
              <div className="mt-4 p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">DNA Fingerprint:</span>
                <span className="text-cyan-300 font-bold tracking-wider">
                  {analysisResult.setupQualification?.dnaFingerprint || 'DNA-NQ-SWEEP-NYAM-042'}
                </span>
              </div>

              {/* Trend Alignment & Invalidation Points */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Trend Alignment:</div>
                  <div className="font-mono font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>{analysisResult.setupQualification?.trendAlignment || 'STRONGLY_ALIGNED'}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[11px]">Risk-to-Reward:</div>
                  <div className="font-mono font-bold text-cyan-400 mt-1">
                    1 : {analysisResult.setupQualification?.riskRewardRatio || '3.45'}
                  </div>
                </div>
              </div>

              {/* Execution Zones */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="p-3 bg-cyan-950/20 border border-cyan-800/60 rounded-lg">
                  <div className="text-cyan-300 font-mono font-bold flex items-center justify-between">
                    <span>QUALIFIED ENTRY ZONE</span>
                    <span>
                      {Array.isArray(analysisResult.setupQualification?.entryZone)
                        ? `[${analysisResult.setupQualification.entryZone.join(' - ')}]`
                        : '[20,410.00 - 20,425.00]'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-rose-950/30 border border-rose-850 rounded-lg">
                  <div className="text-rose-300 font-mono font-bold flex items-center justify-between">
                    <span>INVALIDATION STOP LOSS</span>
                    <span>{analysisResult.setupQualification?.invalidationPoint || '20,380.00'}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Disqualified immediately if 5m candle closes below this level.
                  </div>
                </div>

                <div className="p-3 bg-emerald-950/20 border border-emerald-800/50 rounded-lg">
                  <div className="text-emerald-300 font-mono font-bold flex items-center justify-between">
                    <span>PROFIT TARGET 1 (1.5R)</span>
                    <span>{analysisResult.setupQualification?.targets?.tp1 || '20,475.00'}</span>
                  </div>
                  <div className="text-emerald-300 font-mono font-bold flex items-center justify-between mt-1 pt-1 border-t border-emerald-900/40">
                    <span>PROFIT TARGET 2 (2.8R)</span>
                    <span>{analysisResult.setupQualification?.targets?.tp2 || '20,530.00'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: Institutional Qualification & Disqualification Rationale */}
          <div className="space-y-6">
            <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-5 shadow-xl">
              <div className="pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-sm text-white">Why This Setup Qualifies</h3>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Algorithmic confirmation requirements</div>
              </div>

              <div className="mt-4 p-3.5 bg-emerald-950/20 border border-emerald-850 rounded-lg text-xs leading-relaxed text-slate-200">
                {analysisResult.setupQualification?.qualificationRationale ||
                  'Confluence of HTF 4H uptrend, London session Sell-Side Liquidity purge, bullish market structure shift on the 5m, and instantaneous delta absorption.'}
              </div>

              {/* Disqualification / Invalidation Rules */}
              <div className="mt-5 pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm text-white">Why It Would Fail / Invalidation</h3>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Structural boundary failure conditions</div>
              </div>

              <div className="mt-4 p-3.5 bg-amber-950/20 border border-amber-850 rounded-lg text-xs leading-relaxed text-amber-200/90">
                {analysisResult.setupQualification?.disqualificationRisks ||
                  'Disqualified if price closes below the SFP candle low with aggressive high sell delta, or if HTF dollar index breaks into an impulsive continuation run.'}
              </div>

              {/* Action buttons */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col gap-2.5">
                <button
                  onClick={async () => {
                    if (!analysisResult?.setupQualification) return;
                    const sq = analysisResult.setupQualification;
                    try {
                      await fetch('/api/signals/record', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          symbol,
                          setupName: sq.setupName,
                          dnaFingerprint: sq.dnaFingerprint,
                          direction: sq.trendAlignment === 'COUNTER_TREND' ? 'SHORT' : 'LONG',
                          entryPrice: Array.isArray(sq.entryZone) ? sq.entryZone[1] : asset.price,
                          stopLoss: sq.invalidationPoint,
                          tp1: sq.targets?.tp1 || asset.price * 1.01,
                          tp2: sq.targets?.tp2 || asset.price * 1.02,
                          tp3: sq.targets?.tp3 || asset.price * 1.03,
                          currentPrice: asset.price,
                        }),
                      });
                      alert(`Setup ${sq.dnaFingerprint} successfully recorded to Live Signal Tracker!`);
                    } catch (e: any) {
                      console.error(e);
                    }
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold tracking-wide shadow-lg shadow-emerald-700/20 transition-all"
                >
                  <Target className="w-4 h-4 text-emerald-200" />
                  <span>Track This Setup in Live Signal Monitor</span>
                </button>

                <button
                  onClick={onOpenDecisionIntelligence}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold tracking-wide shadow-lg shadow-cyan-600/20 transition-all"
                >
                  <span>Produce Complete 7-Engine Decision Report</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
