import React, { useState } from 'react';
import { useOperations } from '../../context/OperationsContext';
import {
  ShieldAlert,
  ScanLine,
  Boxes,
  Truck,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Eye,
} from 'lucide-react';
import { formatUSD, formatDateTime, getElapsedTimeMinutes } from '../../utils/formatters';
import { BarcodeScanModal } from '../../components/shared/BarcodeScanModal';

export const InventoryControllerView: React.FC = () => {
  const {
    stones,
    requests,
    users,
    currentUser,
    openStoneDetail,
    stockroomConfirmSafeReceipt,
  } = useOperations();

  const [activeTab, setActiveTab] = useState<'DISPATCH_QUEUE' | 'RETURN_QUEUE' | 'OUTSIDE_SAFE' | 'OVERDUE'>('DISPATCH_QUEUE');
  const [scanModalRequestId, setScanModalRequestId] = useState<string | null>(null);

  // Queues
  const pendingRequests = requests.filter((r) => r.status === 'Requested' || r.status === 'Verified');
  const returnQueueStones = stones.filter((s) => s.physicalStatus === 'Return Requested' || s.physicalStatus === 'Return Transit');
  const stonesOutsideSafe = stones.filter((s) => s.physicalStatus !== 'In Safe' && s.physicalStatus !== 'In Safe after return');
  const overdueStones = stones.filter((s) => {
    if (s.physicalStatus === 'In Cabin' && s.cabinPossessionStartedAt) {
      return getElapsedTimeMinutes(s.cabinPossessionStartedAt) > 60;
    }
    return false;
  });

  return (
    <div className="space-y-5">
      {/* Role Summary Banner */}
      <div className="p-4 rounded-xl bg-navy-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-navy-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-brand-600/30 border border-brand-500/40 flex items-center justify-center font-bold text-brand-300">
            AR
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-white">Ananya Rao</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                Stock Controller & Vault Master
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Responsible for physical safe security, barcode scan verification, runner dispatch & safe return closing.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-navy-950 border border-navy-800 text-slate-300">
            <span className="text-[10px] text-slate-500 block uppercase">Stones Outside Safe</span>
            <span className="font-bold text-white text-sm">{stonesOutsideSafe.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-navy-950 border border-navy-800 text-slate-300">
            <span className="text-[10px] text-slate-500 block uppercase">Pending Dispatches</span>
            <span className="font-bold text-brand-400 text-sm">{pendingRequests.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('DISPATCH_QUEUE')}
          className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'DISPATCH_QUEUE'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ScanLine className="w-3.5 h-3.5" />
          <span>Dispatch Queue ({pendingRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('RETURN_QUEUE')}
          className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'RETURN_QUEUE'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Safe Return Queue ({returnQueueStones.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('OUTSIDE_SAFE')}
          className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'OUTSIDE_SAFE'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Boxes className="w-3.5 h-3.5" />
          <span>Active Outside Safe ({stonesOutsideSafe.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('OVERDUE')}
          className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center space-x-1.5 ${
            activeTab === 'OVERDUE'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Overdue Cabins ({overdueStones.length})</span>
        </button>
      </div>

      {/* TAB 1: PENDING DISPATCH QUEUE */}
      {activeTab === 'DISPATCH_QUEUE' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 uppercase tracking-wider">
              Pending Viewing Requests Awaiting Barcode Verification & Dispatch
            </span>
            <span className="text-slate-500 font-medium">Laser scan required for dispatch gate unlock</span>
          </div>

          <div className="divide-y divide-slate-100">
            {pendingRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No pending stone requests awaiting dispatch.
              </div>
            ) : (
              pendingRequests.map((req) => {
                const requester = users.find((u) => u.id === req.requestedBy)?.name || req.requestedBy;
                const stone = stones.find((s) => s.id === req.stoneId);

                return (
                  <div key={req.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">{req.stoneId}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                          {req.id}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          {req.status}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700">
                          {req.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700">
                        Destination: <strong className="text-slate-900">{req.cabinId}</strong> · Requested by <strong className="text-slate-900">{requester}</strong> · {formatDateTime(req.createdAt)}
                      </p>
                      {stone && (
                        <p className="text-[11px] text-slate-600">
                          {stone.carat}ct {stone.shape} · {stone.colour}/{stone.clarity} · Stored in {stone.currentLocationId}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => openStoneDetail(req.stoneId)}
                        className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200"
                        title="Inspect Stone"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setScanModalRequestId(req.id)}
                        className="px-4 py-2 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white flex items-center space-x-1.5 transition active:scale-95 shadow-sm"
                      >
                        <ScanLine className="w-3.5 h-3.5" />
                        <span>Scan Barcode & Assign Runner</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SAFE RETURN QUEUE */}
      {activeTab === 'RETURN_QUEUE' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 uppercase tracking-wider">
              Safe Return Queue (Closing Custody)
            </span>
            <span className="text-slate-500 font-medium">
              Custody only closes when stockroom scans cassette
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {returnQueueStones.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No diamonds currently awaiting return intake.
              </div>
            ) : (
              returnQueueStones.map((st) => {
                const custodian = users.find((u) => u.id === st.activeCustodianId)?.name || st.activeCustodianId;
                return (
                  <div key={st.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">{st.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          st.physicalStatus === 'Return Transit'
                            ? 'bg-orange-50 text-orange-800 border border-orange-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {st.physicalStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700">
                        Current Holder: <strong className="text-slate-900">{custodian}</strong> · Location: {st.currentLocationId}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        {st.carat}ct {st.shape} · Est. {formatUSD(st.estimatedValueUSD)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {st.physicalStatus === 'Return Transit' ? (
                        <button
                          onClick={() => stockroomConfirmSafeReceipt(st.id, 'Safe Compartment A-04')}
                          className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1.5 transition active:scale-95 shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Scan Cassette & Confirm Safe Receipt</span>
                        </button>
                      ) : (
                        <span className="text-xs text-amber-700 italic">
                          Awaiting floor runner to collect from cabin
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ACTIVE OUTSIDE SAFE */}
      {activeTab === 'OUTSIDE_SAFE' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 uppercase tracking-wider">
              All Stones Currently Outside the Safe Room ({stonesOutsideSafe.length})
            </span>
            <span className="text-slate-400 font-medium">Single active custodian enforced</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Stone ID</th>
                  <th className="px-4 py-2.5">Specs</th>
                  <th className="px-4 py-2.5">Physical Status</th>
                  <th className="px-4 py-2.5">Current Location</th>
                  <th className="px-4 py-2.5">Active Custodian</th>
                  <th className="px-4 py-2.5">Commercial State</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stonesOutsideSafe.map((st) => {
                  const custodian = users.find((u) => u.id === st.activeCustodianId)?.name || st.activeCustodianId;
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{st.id}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {st.carat}ct {st.shape} · {st.colour}/{st.clarity}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                          {st.physicalStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{st.currentLocationId}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{custodian}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-50 text-brand-700">
                          {st.commercialStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => openStoneDetail(st.id)}
                          className="text-brand-600 hover:text-brand-800 font-semibold"
                        >
                          Inspect →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: OVERDUE CABIN POSSESSIONS */}
      {activeTab === 'OVERDUE' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-5 py-3 bg-rose-50 border-b border-rose-200 flex items-center justify-between text-xs text-rose-900">
            <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Overdue Cabin Possessions (&gt; 60 Minutes)</span>
            </span>
            <span>Security audit threshold exceeded</span>
          </div>

          <div className="p-4 space-y-3">
            {overdueStones.length === 0 ? (
              <p className="text-xs text-slate-500 italic text-center py-6">
                Zero overdue cabin possessions. All active viewings are within the standard 60-minute window.
              </p>
            ) : (
              overdueStones.map((st) => (
                <div key={st.id} className="p-3 rounded-lg border border-rose-200 bg-rose-50/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-rose-950">{st.id}</span>
                    <span className="text-rose-700 ml-2">in {st.currentLocationId}</span>
                    <div className="text-[11px] text-slate-500">
                      Elapsed: {getElapsedTimeMinutes(st.cabinPossessionStartedAt)} minutes (Limit: 60 mins)
                    </div>
                  </div>
                  <button
                    onClick={() => openStoneDetail(st.id)}
                    className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                  >
                    Contact Salesperson
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Barcode Modal */}
      {scanModalRequestId && (
        <BarcodeScanModal
          requestId={scanModalRequestId}
          onClose={() => setScanModalRequestId(null)}
        />
      )}
    </div>
  );
};
