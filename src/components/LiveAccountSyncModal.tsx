import React, { useState, useEffect } from 'react';
import { 
  SyncedAccountRecord, 
  fetchSyncedAccounts, 
  syncBrokerAccount, 
  disconnectBrokerAccount 
} from '../services/api';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Radio, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Sliders,
  PowerOff,
  Plus
} from 'lucide-react';

interface LiveAccountSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountUpdated?: () => void;
}

export const LiveAccountSyncModal: React.FC<LiveAccountSyncModalProps> = ({
  isOpen,
  onClose,
  onAccountUpdated,
}) => {
  const [accounts, setAccounts] = useState<SyncedAccountRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [platform, setPlatform] = useState<SyncedAccountRecord['platform']>('APEX_TRADER_FUNDING');
  const [accountName, setAccountName] = useState('Apex PA-100K Live');
  const [accountNumber, setAccountNumber] = useState('APEX-88492');
  const [server, setServer] = useState('Rithmic Chicago Live');
  const [environment, setEnvironment] = useState<'LIVE' | 'DEMO_PROP'>('LIVE');
  const [balance, setBalance] = useState<number>(100000);
  const [maxDrawdown, setMaxDrawdown] = useState<number>(3000);
  const [apiKey, setApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const accs = await fetchSyncedAccounts();
      setAccounts(accs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAccounts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnectAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await syncBrokerAccount({
        platform,
        accountName,
        accountNumber,
        server,
        environment,
        balance,
        equity: balance,
        maxDailyDrawdown: maxDrawdown,
        trailingDrawdownThreshold: balance - maxDrawdown,
      });
      setShowAddForm(false);
      await loadAccounts();
      onAccountUpdated?.();
    } catch (err: any) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisconnect = async (id: string) => {
    if (!confirm('Disconnect this account bridge?')) return;
    try {
      await disconnectBrokerAccount(id);
      await loadAccounts();
      onAccountUpdated?.();
    } catch (err: any) {
      alert(`Disconnect failed: ${err.message}`);
    }
  };

  const activeAccount = accounts.find((a) => a.syncStatus === 'CONNECTED') || accounts[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b0e17] border border-cyan-500/40 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0e1320]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 flex items-center justify-center border border-cyan-800">
              <Radio className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Live Broker &amp; Prop Firm Account Sync</h3>
              <p className="text-[11px] text-slate-400">Rithmic, Tradovate, MT4/MT5, Topstep &amp; Binance Read-Only Bridge</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono rounded-lg border border-slate-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'View Accounts' : 'Connect New Account'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto font-sans">
          {showAddForm ? (
            /* Add / Sync Account Form */
            <form onSubmit={handleConnectAccount} className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider pb-2 border-b border-slate-800">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>Secure Read-Only Broker Connection</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="text-slate-400 block mb-1">Platform / Broker:</label>
                  <select
                    value={platform}
                    onChange={(e: any) => setPlatform(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="APEX_TRADER_FUNDING">Apex Trader Funding (Rithmic)</option>
                    <option value="TOPSTEP">Topstep (Tradovate / ProjectX)</option>
                    <option value="TRADOVATE">Tradovate Futures API</option>
                    <option value="RITHMIC">Rithmic Paper &amp; Live CME</option>
                    <option value="METATRADER_5">MetaTrader 5 (MT5 Bridge)</option>
                    <option value="METATRADER_4">MetaTrader 4 (MT4 Bridge)</option>
                    <option value="INTERACTIVE_BROKERS">Interactive Brokers TWS Gateway</option>
                    <option value="BINANCE">Binance Futures API (Read-Only)</option>
                    <option value="BYBIT">Bybit Perpetual API</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Account Display Name:</label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="e.g. Apex 100K Funded PA"
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Account Number / User ID:</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. APEX-88492"
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Server / Gateway:</label>
                  <input
                    type="text"
                    value={server}
                    onChange={(e) => setServer(e.target.value)}
                    placeholder="e.g. Rithmic Chicago Live"
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Account Balance ($):</label>
                  <input
                    type="number"
                    value={balance}
                    onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                    placeholder="100000"
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Max Trailing Drawdown ($):</label>
                  <input
                    type="number"
                    value={maxDrawdown}
                    onChange={(e) => setMaxDrawdown(parseFloat(e.target.value) || 0)}
                    placeholder="3000"
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-400 block mb-1">Read-Only Investor Password / API Token:</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="••••••••••••••••••••••••••••••••"
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Zero withdrawal permissions required. Used strictly for position mark-to-market calculations and risk drawdown tracking.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-mono font-bold shadow-lg shadow-cyan-600/20 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Verifying Bridge...' : 'Establish Live Account Sync'}
                </button>
              </div>
            </form>
          ) : activeAccount ? (
            /* Active Synced Account Dashboard */
            <div className="space-y-6">
              {/* Account Overview Header */}
              <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-base">{activeAccount.accountName}</h4>
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-800">
                        {activeAccount.syncStatus}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-slate-400 mt-0.5">
                      {activeAccount.platform} · {activeAccount.accountNumber} · {activeAccount.server}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDisconnect(activeAccount.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg text-xs font-mono border border-rose-800/60 transition-colors"
                  >
                    <PowerOff className="w-3.5 h-3.5" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </div>

              {/* Account Balance & Prop Firm Safety Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px] font-sans">ACCOUNT BALANCE</div>
                  <div className="text-lg font-bold text-white mt-0.5">
                    ${activeAccount.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="p-3.5 bg-cyan-950/30 rounded-lg border border-cyan-800/50">
                  <div className="text-cyan-400 text-[10px] font-sans">CURRENT EQUITY</div>
                  <div className="text-lg font-bold text-cyan-300 mt-0.5">
                    ${activeAccount.equity.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900 rounded-lg border border-slate-800">
                  <div className="text-slate-500 text-[10px] font-sans">FREE MARGIN</div>
                  <div className="text-lg font-bold text-slate-200 mt-0.5">
                    ${activeAccount.freeMargin.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-950/30 rounded-lg border border-emerald-800/50">
                  <div className="text-emerald-400 text-[10px] font-sans">DRAWDOWN BUFFER</div>
                  <div className="text-lg font-bold text-emerald-300 mt-0.5">
                    ${(activeAccount.equity - activeAccount.trailingDrawdownThreshold).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Live Synced Positions Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-white uppercase tracking-wider font-mono">
                    Open Synced Positions (Live Mark-to-Market)
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">
                    {activeAccount.positions?.length || 0} Open Orders
                  </span>
                </div>

                {activeAccount.positions && activeAccount.positions.length > 0 ? (
                  <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-900/60 font-mono text-xs">
                    {activeAccount.positions.map((pos) => {
                      const isLong = pos.side === 'LONG';
                      return (
                        <div key={pos.id} className="p-3.5 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-white text-sm">{pos.symbol}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                isLong
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : 'bg-rose-950 text-rose-300 border border-rose-800'
                              }`}
                            >
                              {pos.side} {pos.contracts}x
                            </span>
                            <span className="text-slate-400 text-[11px]">@{pos.entryPrice}</span>
                          </div>

                          <div className="text-right">
                            <div
                              className={`font-bold text-sm ${
                                pos.unrealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {pos.unrealizedPnl >= 0 ? '+' : ''}${pos.unrealizedPnl.toLocaleString()} (
                              {pos.unrealizedPnlR > 0 ? '+' : ''}{pos.unrealizedPnlR}R)
                            </div>
                            <div className="text-[10px] text-slate-500">
                              SL: {pos.stopLoss || 'None'} · TP: {pos.takeProfit || 'None'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500 font-mono bg-slate-900/40 rounded-xl border border-slate-800">
                    No active positions currently open in this synced account.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 font-mono">
              No synced accounts found. Click "Connect New Account" above to link your broker or prop firm account.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
