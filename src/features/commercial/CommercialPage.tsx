import React, { useState } from 'react';
import { useOperations } from '../../context/OperationsContext';
import {
  Tag,
  Clock,
  FileText,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  Shield,
  Send,
} from 'lucide-react';
import {
  formatUSD,
  formatDateTime,
  getCommercialStatusBadge,
  getElapsedTimeMinutes,
} from '../../utils/formatters';

export const CommercialPage: React.FC = () => {
  const {
    commercialTransactions,
    stones,
    users,
    releaseHold,
    requestReturn,
    openStoneDetail,
  } = useOperations();

  const [activeTab, setActiveTab] = useState<'ALL' | 'HOLD' | 'MEMO' | 'SALE'>('ALL');

  const filteredTx = commercialTransactions.filter((tx) => {
    if (activeTab === 'ALL') return true;
    return tx.type === activeTab;
  });

  const activeHolds = commercialTransactions.filter((t) => t.type === 'HOLD' && t.status === 'ACTIVE');
  const activeMemos = commercialTransactions.filter((t) => t.type === 'MEMO' && t.status === 'ACTIVE');
  const pendingSales = commercialTransactions.filter((t) => t.type === 'SALE' && t.status === 'PENDING_ERP');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Commercial State Operations: Hold · Memo · Sale
          </h2>
          <p className="text-xs text-slate-500">
            Enforcing strict commercial governance separate from physical diamond custody
          </p>
        </div>

        {/* Quick Badges */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold">
            {activeHolds.length} Active Holds
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 font-bold">
            {activeMemos.length} On Memo
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 font-bold">
            {pendingSales.length} Sale Pending ERP
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3 py-1.5 rounded-lg font-bold transition ${
            activeTab === 'ALL' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Commercial Transactions ({commercialTransactions.length})
        </button>
        <button
          onClick={() => setActiveTab('HOLD')}
          className={`px-3 py-1.5 rounded-lg font-bold transition ${
            activeTab === 'HOLD' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Exclusive Holds ({activeHolds.length})
        </button>
        <button
          onClick={() => setActiveTab('MEMO')}
          className={`px-3 py-1.5 rounded-lg font-bold transition ${
            activeTab === 'MEMO' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Consignment Memos ({activeMemos.length})
        </button>
        <button
          onClick={() => setActiveTab('SALE')}
          className={`px-3 py-1.5 rounded-lg font-bold transition ${
            activeTab === 'SALE' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Floor Sales ({commercialTransactions.filter((t) => t.type === 'SALE').length})
        </button>
      </div>

      {/* Transactions Grid */}
      <div className="space-y-3">
        {filteredTx.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
            No transactions in this category.
          </div>
        ) : (
          filteredTx.map((tx) => {
            const stone = stones.find((s) => s.id === tx.stoneId);
            const authoriser = users.find((u) => u.id === tx.authorisedBy)?.name || tx.authorisedBy;

            return (
              <div
                key={tx.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2.5">
                    <button
                      onClick={() => openStoneDetail(tx.stoneId)}
                      className="font-mono text-base font-bold text-brand-600 hover:underline"
                    >
                      {tx.stoneId}
                    </button>
                    <span className="font-mono text-xs px-2 py-0.2 rounded bg-slate-100 text-slate-700">
                      {tx.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.type === 'HOLD'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : tx.type === 'MEMO'
                          ? 'bg-purple-50 text-purple-800 border border-purple-200'
                          : 'bg-blue-50 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {tx.type} · {tx.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700">
                    Client: <strong className="text-slate-900">{tx.buyerName}</strong> (Ref: <span className="font-mono text-slate-800">{tx.buyerReference}</span>) · Authorised by <strong className="text-slate-900">{authoriser}</strong>
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                    <span>Valuation: <strong className="text-slate-800 font-mono">{formatUSD(tx.agreedPriceUSD || 0)}</strong></span>
                    <span>·</span>
                    <span>Started: <strong className="text-slate-700">{formatDateTime(tx.startTimestamp)}</strong></span>
                    <span>·</span>
                    <span>Expiry/Due: <strong className="text-amber-700">{formatDateTime(tx.expiryOrDueDate)}</strong></span>
                    {tx.erpEventId && (
                      <>
                        <span>·</span>
                        <span>Outbox Event: <strong className="text-sky-700 font-mono">{tx.erpEventId}</strong></span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => openStoneDetail(tx.stoneId)}
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200"
                    title="Inspect Stone"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {tx.type === 'HOLD' && tx.status === 'ACTIVE' && (
                    <button
                      onClick={() => releaseHold(tx.stoneId)}
                      className="px-3.5 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition active:scale-95"
                    >
                      Release Hold
                    </button>
                  )}

                  {tx.type === 'MEMO' && tx.status === 'ACTIVE' && (
                    <button
                      onClick={() => requestReturn(tx.stoneId, 'Memo evaluation complete; return requested')}
                      className="px-3.5 py-2 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition active:scale-95"
                    >
                      Request Return to Safe
                    </button>
                  )}

                  {tx.type === 'SALE' && tx.status === 'PENDING_ERP' && (
                    <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>Pending ERP Confirmation</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
