import React, { useState, useRef, useEffect } from 'react';
import { MarketAsset } from '../types/market';
import { ASSETS } from '../data/marketData';
import { 
  X, 
  Upload, 
  Sparkles, 
  AlertTriangle, 
  Image as ImageIcon, 
  CheckCircle2, 
  Clipboard,
  Zap
} from 'lucide-react';

interface UploadScreenshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSymbol: MarketAsset;
  onAnalysisComplete: (result: any) => void;
}

export const UploadScreenshotModal: React.FC<UploadScreenshotModalProps> = ({
  isOpen,
  onClose,
  currentSymbol,
  onAnalysisComplete,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('15m');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const asset = ASSETS[currentSymbol] || ASSETS.NQ;

  // Paste image from clipboard listener
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              setImagePreview(event.target?.result as string);
              setErrorMsg(null);
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImagePreview(event.target?.result as string);
          setErrorMsg(null);
        };
        reader.readAsDataURL(file);
      } else {
        setErrorMsg('Please drop an image file (PNG, JPG, or WEBP).');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessScan = async () => {
    if (!imagePreview) return;
    setAnalyzing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/analyze-chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePreview,
          symbol: currentSymbol,
          timeframe,
          currentPrice: asset.price,
        }),
      });

      if (!res.ok) {
        throw new Error('Analysis request failed');
      }

      const json = await res.json();
      if (json.data) {
        onAnalysisComplete(json.data);
        onClose();
      } else {
        throw new Error('No analysis data received');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Vision analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0b0e17] border border-cyan-500/40 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0e1320]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 flex items-center justify-center border border-cyan-800">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Upload Chart Screenshot for Vision Analysis</h3>
              <p className="text-[11px] text-slate-400">TradingView, Sierra Chart, Bookmap, NinjaTrader screenshots supported</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Target Symbol & Timeframe bar */}
          <div className="flex items-center justify-between text-xs font-mono p-3 bg-slate-900 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Target Asset:</span>
              <span className="text-cyan-300 font-bold">{currentSymbol} ({asset.name})</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-slate-400 mr-1">Timeframe:</span>
              {['1m', '5m', '15m', '1H', '4H', '1D'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2 py-0.5 rounded text-[11px] ${
                    timeframe === tf ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-cyan-400 bg-cyan-950/20'
                : imagePreview
                ? 'border-emerald-600/60 bg-emerald-950/10'
                : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {imagePreview ? (
              <div className="space-y-3">
                <div className="max-h-56 max-w-md overflow-hidden rounded-lg border border-slate-700 mx-auto shadow-lg">
                  <img src={imagePreview} alt="Chart screenshot preview" className="w-full h-auto object-contain" />
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-mono">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Chart screenshot ready for multimodal AI processing</span>
                </div>
                <div className="text-[11px] text-slate-500">Click or drag a new image to replace</div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto text-cyan-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Drag and drop your chart screenshot here</div>
                  <div className="text-xs text-slate-400 mt-1">or click to browse from computer · Paste directly via <kbd className="px-1.5 py-0.5 bg-slate-850 rounded border border-slate-700 text-[10px] font-mono text-cyan-300">Ctrl+V</kbd></div>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">Supports PNG, JPG, WEBP up to 25MB</div>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-lg text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Institutional Scanner Capabilities note */}
          <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="font-bold text-slate-300 font-mono flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Multimodal Vision Feature Engine:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div>• Identifies market structure &amp; swing points</div>
              <div>• Locates untested Fair Value Gaps (FVG)</div>
              <div>• Detects liquidity sweeps &amp; stop runs</div>
              <div>• Computes precise invalidation price</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0e1320] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-400 hover:text-white text-xs font-medium transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleProcessScan}
            disabled={!imagePreview || analyzing}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white rounded-lg text-xs font-bold shadow-lg shadow-cyan-600/20 transition-all"
          >
            <Sparkles className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? 'Running Multimodal Vision...' : 'Process Chart Screenshot'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
