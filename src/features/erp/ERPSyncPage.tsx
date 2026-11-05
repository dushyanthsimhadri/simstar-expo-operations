import React, { useState } from 'react';
import { useOperations } from '../../context/OperationsContext';
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Clock,
  Send,
  ShieldCheck,
  Server,
  ArrowRight,
  Database,
  Layers,
  FileCheck,
} from 'lucide-react';
import { formatDateTime, getERPSyncBadge } from '../../utils/formatters';

export const ERPSyncPage: React.FC = () => {
  const {
    erpEvents,
    stones,
    simulateERPResponse,
    retryERPSync,
    openStoneDetail,
  } = useOperations();

  const [filterState, setFilterState] = useState<string>('ALL');

  const filteredEvents = erpEvents.filter((e) => {
    if (filterState === 'ALL') return true;
    return e.syncStatus === filterState;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Central ERP Synchronisation & Transactional Outbox
          </h2>
          <p className="text-xs text-slate-500">
            Resilient transactional outbox architecture with per-event sequence numbering and idempotency guarantees
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-800 border border-sky-200 font-bold text-xs flex items-center space-x-1.5 shrink-0">
          <Server className="w-3.5 h-3.5 text-sky-600" />
          <span>Simulated SAP Enterprise Bridge</span>
        </span>
      </div>

      {/* Mandatory Disclaimer Note from Section 13 */}
      <div className="p-4 rounded-xl bg-slate-900 text-white text-xs border border-slate-800 space-y-1">
        <div className="font-bold text-sky-400 uppercase tracking-wider text-[10px]">
          Architectural Boundary Principle
        </div>
        <p className="text-slate-300">
          "The expo application captures operational events. The ERP remains the official record for stock, customer and accounting information."
        </p>
      </div>

      {/* Visual Architectural Pipeline Diagram (Section 13) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2">
          <Layers className="w-4 h-4 text-brand-600" />
          <span>Outbox Integration Pipeline (End-to-End Reliability)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2 text-xs">
          {/* Step 1 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">1. Source</span>
            <div className="font-bold text-slate-900">Expo Floor App</div>
            <p className="text-[10px] text-slate-600 font-medium">Salesperson logs commercial commitment</p>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">2. Operational Record</span>
            <div className="font-bold text-slate-900">Event Ledger</div>
            <p className="text-[10px] text-slate-600 font-medium">Immutable time-stamped local event sequence</p>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-200 text-center space-y-1">
            <span className="text-[10px] text-brand-700 font-bold uppercase block">3. Resilient Buffer</span>
            <div className="font-bold text-brand-900">Transactional Outbox</div>
            <p className="text-[10px] text-brand-700 font-medium">Idempotency keys prevent double-posting</p>
          </div>

          {/* Step 4 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">4. Integration Layer</span>
            <div className="font-bold text-slate-900">ERP Gateway Bridge</div>
            <p className="text-[10px] text-slate-600 font-medium">HTTP REST / Webhook relay to SAP Diamond Ledger</p>
          </div>

          {/* Step 5 */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
            <span className="text-[10px] text-emerald-600 font-bold uppercase block">5. Final Settlement</span>
            <div className="font-bold text-emerald-900">ERP Confirmation</div>
            <p className="text-[10px] text-emerald-700">Official post confirms commercial ownership</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs">
        {['ALL', 'Pending', 'Captured', 'Accepted', 'Failed', 'Requires Review'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterState(st)}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filterState === st ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {st} ({st === 'ALL' ? erpEvents.length : erpEvents.filter((e) => e.syncStatus === st).length})
          </button>
        ))}
      </div>

      {/* Outbox Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 tracking-wider">
              <tr>
                <th className="px-4 py-3">Event ID</th>
                <th className="px-4 py-3">Target Stone</th>
                <th className="px-4 py-3">Event Type</th>
                <th className="px-4 py-3">Payload Summary</th>
                <th className="px-4 py-3">Idempotency Key</th>
                <th className="px-4 py-3">Retries</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3 text-right">Simulation Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEvents.map((evt) => {
                const erpBadge = getERPSyncBadge(evt.syncStatus);

                return (
                  <tr key={evt.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {evt.id}
                      <span className="block text-[10px] text-slate-500 font-normal">Seq #{evt.sequenceNumber}</span>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-brand-600 hover:underline cursor-pointer" onClick={() => openStoneDetail(evt.stoneId)}>
                      {evt.stoneId}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {evt.eventType}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-800 max-w-[240px] truncate">
                      {evt.payloadSummary}
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-500 truncate max-w-[150px]">
                      {evt.idempotencyKey}
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-semibold">
                      {evt.retryCount}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${erpBadge.bg} ${erpBadge.text} ${erpBadge.border}`}>
                        {erpBadge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-800 font-medium">
                      {evt.assignedOwner || 'System'}
                    </td>
                    <td className="px-4 py-3 text-right space-x-1.5 shrink-0">
                      <button
                        onClick={() => simulateERPResponse(evt.id, 'ACCEPTED')}
                        className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] border border-emerald-200 transition"
                        title="Simulate successful acceptance by ERP"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => simulateERPResponse(evt.id, 'FAILED')}
                        className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px] border border-rose-200 transition"
                        title="Simulate network or ERP failure"
                      >
                        Fail
                      </button>
                      <button
                        onClick={() => retryERPSync(evt.id)}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px] border border-slate-300 transition"
                        title="Execute idempotent retry"
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
