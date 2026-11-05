import React, { useState } from 'react';
import { useOperations } from '../../context/OperationsContext';
import {
  UserCheck,
  Send,
  Boxes,
  Tag,
  DollarSign,
  RotateCcw,
  Clock,
  Eye,
  CheckCircle2,
  Lock,
  Plus,
} from 'lucide-react';
import {
  formatUSD,
  formatDateTime,
  getPhysicalStatusBadge,
  getCommercialStatusBadge,
  getElapsedTimeMinutes,
} from '../../utils/formatters';

export const SalespersonView: React.FC = () => {
  const {
    stones,
    requests,
    users,
    cabins,
    currentUser,
    openStoneDetail,
    submitStoneRequest,
    salespersonConfirmReceipt,
    createHold,
    releaseHold,
    createMemo,
    initiateSale,
    requestReturn,
  } = useOperations();

  // Active salesperson is Priya Shah or currently active user
  const currentSalesUser = currentUser.role === 'SALESPERSON' ? currentUser : users.find((u) => u.id === 'usr_sales_priya') || users[2];
  const assignedCabinId = currentSalesUser.assignedCabinId || 'CABIN-04';
  const cabinObj = cabins.find((c) => c.id === assignedCabinId) || cabins[3];

  // Modals / forms
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedStoneForRequest, setSelectedStoneForRequest] = useState<string>('DIA-2048');
  const [requestPriority, setRequestPriority] = useState<'Normal' | 'Urgent' | 'VIP Immediate'>('VIP Immediate');

  // Commercial action modal
  const [commercialModalStoneId, setCommercialModalStoneId] = useState<string | null>(null);
  const [commercialActionType, setCommercialActionType] = useState<'HOLD' | 'MEMO' | 'SALE'>('SALE');
  const [buyerRef, setBuyerRef] = useState('BUYER-GEN-9021');
  const [buyerName, setBuyerName] = useState('Graff Private Client Trust');
  const [durationValue, setDurationValue] = useState(45); // 45m for hold, 3 days for memo
  const [salePrice, setSalePrice] = useState(68500);

  // Filter salesperson's data
  const myCabinStones = stones.filter(
    (s) => s.activeCustodianId === currentSalesUser.id || (s.physicalStatus === 'In Cabin' && s.activeCabinId === assignedCabinId)
  );

  const myRequests = requests.filter((r) => r.requestedBy === currentSalesUser.id);

  // Available stones to request
  const availableStonesToRequest = stones.filter(
    (s) => (s.physicalStatus === 'In Safe' || s.physicalStatus === 'In Safe after return') && s.commercialStatus === 'Available'
  );

  const handleOpenCommercialModal = (stoneId: string, type: 'HOLD' | 'MEMO' | 'SALE') => {
    const s = stones.find((item) => item.id === stoneId);
    setCommercialModalStoneId(stoneId);
    setCommercialActionType(type);
    if (s) setSalePrice(s.estimatedValueUSD);
  };

  const handleExecuteCommercialAction = () => {
    if (!commercialModalStoneId) return;

    if (commercialActionType === 'HOLD') {
      createHold(commercialModalStoneId, buyerRef, buyerName, durationValue);
    } else if (commercialActionType === 'MEMO') {
      const dueDate = new Date(Date.now() + durationValue * 86400000).toISOString();
      createMemo(commercialModalStoneId, buyerRef, buyerName, dueDate);
    } else if (commercialActionType === 'SALE') {
      initiateSale(commercialModalStoneId, buyerRef, buyerName, salePrice);
    }

    setCommercialModalStoneId(null);
  };

  return (
    <div className="space-y-6">
      {/* Profile & Cabin Header */}
      <div className="p-4 rounded-xl bg-navy-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-navy-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300">
            {currentSalesUser.avatarInitials}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm text-white">{currentSalesUser.name}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {cabinObj.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {currentSalesUser.title} · VIP Tier: <strong className="text-amber-400">{cabinObj.vipTier}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsRequestModalOpen(true)}
          className="px-4 py-2 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white flex items-center space-x-1.5 transition active:scale-95 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Request Diamond for {cabinObj.code}</span>
        </button>
      </div>

      {/* Deliveries awaiting receipt confirmation */}
      {myRequests.some((r) => r.handoverAwaitingSalesperson) && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2">
          <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-wide text-amber-900">
            <UserCheck className="w-4 h-4 text-amber-600" />
            <span>Runner Delivery Waiting for Your Physical Acceptance</span>
          </div>
          <p className="text-xs text-amber-800">
            A runner has delivered diamonds at {cabinObj.name}. Physical custody does not transfer until you acknowledge receipt.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {myRequests
              .filter((r) => r.handoverAwaitingSalesperson)
              .map((r) => (
                <button
                  key={r.id}
                  onClick={() => salespersonConfirmReceipt(r.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Acknowledge Physical Delivery of {r.stoneId}</span>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Cabin Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm space-y-0">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div>
            <h3 className="font-bold text-slate-900 uppercase tracking-wider">
              Diamonds Currently Under My Physical Custody ({myCabinStones.length})
            </h3>
            <p className="text-[11px] text-slate-500">
              Active possession timer and authorized commercial actions
            </p>
          </div>
          <span className="text-slate-500 font-mono text-[11px] font-medium">
            {cabinObj.name}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {myCabinStones.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No diamonds currently in your cabin. Use "Request Diamond" above to request a stone from the vault.
            </div>
          ) : (
            myCabinStones.map((st) => {
              const commercialBadge = getCommercialStatusBadge(st.commercialStatus);
              const possessionMins = getElapsedTimeMinutes(st.cabinPossessionStartedAt);

              return (
                <div key={st.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">{st.id}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-medium">
                        {st.certificateReference}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${commercialBadge.bg} ${commercialBadge.text} ${commercialBadge.border}`}>
                        {commercialBadge.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">
                      {st.carat}ct {st.shape} · {st.colour}/{st.clarity} · Valuation: <strong className="text-slate-900">{formatUSD(st.estimatedValueUSD)}</strong>
                    </p>
                    <div className="flex items-center space-x-3 text-[11px] text-slate-600">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>In cabin for {possessionMins} mins</span>
                      </span>
                      <span>·</span>
                      <span>Location: <strong className="text-slate-800">{st.currentLocationId}</strong></span>
                    </div>
                  </div>

                  {/* Commercial & Return Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      onClick={() => openStoneDetail(st.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200"
                      title="Inspect Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {st.commercialStatus === 'Available' && (
                      <>
                        <button
                          onClick={() => handleOpenCommercialModal(st.id, 'HOLD')}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition"
                        >
                          Place Hold
                        </button>
                        <button
                          onClick={() => handleOpenCommercialModal(st.id, 'MEMO')}
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-300 hover:bg-purple-100 transition"
                        >
                          Issue Memo
                        </button>
                        <button
                          onClick={() => handleOpenCommercialModal(st.id, 'SALE')}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 shadow-sm transition"
                        >
                          Initiate Sale
                        </button>
                      </>
                    )}

                    {st.commercialStatus === 'Hold' && (
                      <button
                        onClick={() => releaseHold(st.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition"
                      >
                        Release Hold
                      </button>
                    )}

                    <button
                      onClick={() => requestReturn(st.id, 'Viewing concluded by salesperson')}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition"
                    >
                      Request Return
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* My Requests History */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-800 uppercase tracking-wider">
          My Submitted Stone Requests ({myRequests.length})
        </div>
        <div className="divide-y divide-slate-100">
          {myRequests.map((req) => (
            <div key={req.id} className="p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <span className="font-mono font-bold text-slate-900">{req.stoneId}</span>
                <span className="text-slate-500">Req #{req.id}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                  {req.status}
                </span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">{formatDateTime(req.createdAt)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Submit New Stone Request */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Submit Stone Request for {cabinObj.name}
            </h3>
            <p className="text-xs text-slate-500">
              Select an available diamond from the central safe inventory.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                  Diamond Selection
                </label>
                <select
                  value={selectedStoneForRequest}
                  onChange={(e) => setSelectedStoneForRequest(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 text-xs font-mono"
                >
                  {availableStonesToRequest.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id} · {s.carat}ct {s.shape} {s.colour}/{s.clarity} (${s.estimatedValueUSD.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                  Request Priority
                </label>
                <select
                  value={requestPriority}
                  onChange={(e) => setRequestPriority(e.target.value as any)}
                  className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 text-xs"
                >
                  <option value="Normal">Normal Floor Viewing</option>
                  <option value="Urgent">Urgent Comparison</option>
                  <option value="VIP Immediate">VIP Immediate Room Request</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  submitStoneRequest(selectedStoneForRequest, assignedCabinId, requestPriority);
                  setIsRequestModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-sm"
              >
                Submit Request to Stockroom
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Commercial Action (Hold / Memo / Sale) */}
      {commercialModalStoneId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Record Commercial Action: {commercialActionType}
            </h3>
            <p className="text-xs text-slate-500">
              Diamond: <strong className="text-slate-900">{commercialModalStoneId}</strong> · Authorised Salesperson: {currentSalesUser.name}
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                  Buyer Reference
                </label>
                <input
                  type="text"
                  value={buyerRef}
                  onChange={(e) => setBuyerRef(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 font-mono text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                  Buyer Name / Entity
                </label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 text-xs font-semibold"
                />
              </div>

              {commercialActionType === 'HOLD' && (
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                    Hold Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    value={durationValue}
                    onChange={(e) => setDurationValue(Number(e.target.value))}
                    className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 text-xs font-semibold"
                  />
                  <p className="text-[11px] text-amber-800 font-medium mt-1">
                    Blocks competing offers while active. Supports authorised release.
                  </p>
                </div>
              )}

              {commercialActionType === 'MEMO' && (
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                    Memo Duration (Days)
                  </label>
                  <input
                    type="number"
                    value={durationValue}
                    onChange={(e) => setDurationValue(Number(e.target.value))}
                    className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 text-xs font-semibold"
                  />
                  <p className="text-[11px] text-purple-800 font-medium mt-1">
                    Client takes diamond for evaluation under memorandum. SimStar retains legal ownership.
                  </p>
                </div>
              )}

              {commercialActionType === 'SALE' && (
                <div>
                  <label className="text-[10px] font-bold text-slate-700 uppercase block mb-1">
                    Agreed Sale Price (USD)
                  </label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                    className="w-full p-2 rounded border border-slate-300 bg-white text-slate-900 font-mono text-xs font-bold"
                  />
                  <p className="text-[11px] text-blue-800 mt-1 font-medium">
                    Creates "Sale Pending ERP" status. Transaction is not officially posted until ERP confirms acceptance.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setCommercialModalStoneId(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteCommercialAction}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-sm"
              >
                Confirm {commercialActionType}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
