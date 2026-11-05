import React, { useState } from 'react';
import { useOperations } from '../../context/OperationsContext';
import {
  ClipboardList,
  Plus,
  ScanLine,
  Truck,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';
import { BarcodeScanModal } from '../../components/shared/BarcodeScanModal';

export const RequestsPage: React.FC = () => {
  const {
    requests,
    stones,
    users,
    cabins,
    currentUser,
    submitStoneRequest,
    salespersonConfirmReceipt,
    runnerDeliverToCabin,
    openStoneDetail,
  } = useOperations();

  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [scanModalReqId, setScanModalReqId] = useState<string | null>(null);
  const [isNewReqModalOpen, setIsNewReqModalOpen] = useState(false);

  // New Request state
  const [reqStoneId, setReqStoneId] = useState('DIA-2048');
  const [reqCabinId, setReqCabinId] = useState('CABIN-04');
  const [reqPriority, setReqPriority] = useState<'Normal' | 'Urgent' | 'VIP Immediate'>('Normal');

  const filteredRequests = requests.filter((r) => {
    if (activeFilter === 'ALL') return true;
    return r.status === activeFilter;
  });

  const availableStones = stones.filter(
    (s) => (s.physicalStatus === 'In Safe' || s.physicalStatus === 'In Safe after return') && s.commercialStatus === 'Available'
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Exhibition Floor Requests Management Board
          </h2>
          <p className="text-xs text-slate-500">
            Enforced state machine transitions: Requested → Verified → Dispatched → Delivered → Received
          </p>
        </div>

        <button
          onClick={() => setIsNewReqModalOpen(true)}
          className="px-4 py-2 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white flex items-center space-x-1.5 shadow-sm transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Stone Request</span>
        </button>
      </div>

      {/* State Filter Tabs */}
      <div className="flex items-center space-x-1 overflow-x-auto border-b border-slate-200 pb-2 text-xs">
        {['ALL', 'Requested', 'Verified', 'Dispatched', 'Delivered', 'Received', 'Cancelled', 'Exception'].map((st) => (
          <button
            key={st}
            onClick={() => setActiveFilter(st)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition ${
              activeFilter === st
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {st} ({st === 'ALL' ? requests.length : requests.filter((r) => r.status === st).length})
          </button>
        ))}
      </div>

      {/* Requests Grid / List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="bg-white p-12 text-center text-xs text-slate-500 rounded-xl border border-slate-200">
            No requests currently in this state.
          </div>
        ) : (
          filteredRequests.map((req) => {
            const stone = stones.find((s) => s.id === req.stoneId);
            const requester = users.find((u) => u.id === req.requestedBy)?.name || req.requestedBy;
            const controller = users.find((u) => u.id === req.assignedControllerId)?.name || 'Unassigned';
            const runner = users.find((u) => u.id === req.assignedRunnerId)?.name || 'Unassigned';

            return (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2.5">
                    <button
                      onClick={() => openStoneDetail(req.stoneId)}
                      className="font-mono text-base font-bold text-brand-600 hover:underline"
                    >
                      {req.stoneId}
                    </button>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {req.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        req.status === 'Received'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : req.status === 'Dispatched'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : req.status === 'Delivered'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {req.status}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700">
                      {req.priority}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700">
                    Requested by <strong className="text-slate-900">{requester}</strong> for destination <strong className="text-slate-900">{req.cabinId}</strong> · {req.notes}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                    <span>Stock Controller: <strong className="text-slate-800">{controller}</strong></span>
                    <span>·</span>
                    <span>Floor Runner: <strong className="text-slate-800">{runner}</strong></span>
                    <span>·</span>
                    <span>Time: <strong className="text-slate-800">{formatDateTime(req.createdAt)}</strong></span>
                  </div>
                </div>

                {/* State Advance Action Controls */}
                <div className="flex items-center space-x-2 shrink-0">
                  {req.status === 'Requested' && (
                    <button
                      onClick={() => setScanModalReqId(req.id)}
                      className="px-3.5 py-2 rounded-lg text-xs font-bold bg-brand-600 text-white hover:bg-brand-500 flex items-center space-x-1.5 shadow-sm transition active:scale-95"
                    >
                      <ScanLine className="w-3.5 h-3.5" />
                      <span>Verify Barcode</span>
                    </button>
                  )}

                  {req.status === 'Verified' && (
                    <button
                      onClick={() => setScanModalReqId(req.id)}
                      className="px-3.5 py-2 rounded-lg text-xs font-bold bg-brand-600 text-white hover:bg-brand-500 flex items-center space-x-1.5 shadow-sm transition active:scale-95"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Assign Runner</span>
                    </button>
                  )}

                  {req.status === 'Dispatched' && (
                    <button
                      onClick={() => runnerDeliverToCabin(req.id)}
                      className="px-3.5 py-2 rounded-lg text-xs font-bold bg-amber-600 text-white hover:bg-amber-500 flex items-center space-x-1.5 shadow-sm transition active:scale-95"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Runner: Confirm Handover</span>
                    </button>
                  )}

                  {req.status === 'Delivered' && (
                    <button
                      onClick={() => salespersonConfirmReceipt(req.id)}
                      className="px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 flex items-center space-x-1.5 shadow-sm transition active:scale-95"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Salesperson: Confirm Receipt</span>
                    </button>
                  )}

                  {req.status === 'Received' && (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Handover Complete</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Barcode Laser Modal */}
      {scanModalReqId && (
        <BarcodeScanModal
          requestId={scanModalReqId}
          onClose={() => setScanModalReqId(null)}
        />
      )}

      {/* New Request Modal */}
      {isNewReqModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Submit New Diamond Request
            </h3>
            <p className="text-xs text-slate-500">
              Select an available stone currently secured in the vault.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                  Diamond Target
                </label>
                <select
                  value={reqStoneId}
                  onChange={(e) => setReqStoneId(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 font-mono text-xs"
                >
                  {availableStones.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id} · {s.carat}ct {s.shape} ({s.colour}/{s.clarity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                  Destination Cabin
                </label>
                <select
                  value={reqCabinId}
                  onChange={(e) => setReqCabinId(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 text-xs"
                >
                  {cabins.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.vipTier})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                  Priority Tier
                </label>
                <select
                  value={reqPriority}
                  onChange={(e) => setReqPriority(e.target.value as any)}
                  className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 text-xs"
                >
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                  <option value="VIP Immediate">VIP Immediate</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsNewReqModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  submitStoneRequest(reqStoneId, reqCabinId, reqPriority);
                  setIsNewReqModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-sm"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
