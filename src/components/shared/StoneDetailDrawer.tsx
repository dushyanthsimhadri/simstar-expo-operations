import React from 'react';
import { useOperations } from '../../context/OperationsContext';
import {
  X,
  Shield,
  Clock,
  User as UserIcon,
  MapPin,
  Tag,
  RefreshCw,
  History,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import {
  formatUSD,
  formatDateTime,
  getPhysicalStatusBadge,
  getCommercialStatusBadge,
  getERPSyncBadge,
  getElapsedTimeMinutes,
} from '../../utils/formatters';

export const StoneDetailDrawer: React.FC = () => {
  const {
    selectedStoneId,
    isDetailDrawerOpen,
    closeStoneDetail,
    stones,
    movementEvents,
    commercialTransactions,
    erpEvents,
    users,
    currentUser,
    requestReturn,
    stockroomConfirmSafeReceipt,
  } = useOperations();

  if (!isDetailDrawerOpen || !selectedStoneId) return null;

  const stone = stones.find((s) => s.id === selectedStoneId);
  if (!stone) return null;

  const physicalBadge = getPhysicalStatusBadge(stone.physicalStatus);
  const commercialBadge = getCommercialStatusBadge(stone.commercialStatus);

  // Filter stone-specific movement history
  const stoneEvents = movementEvents.filter((e) => e.stoneId === stone.id);

  // Active commercial transaction
  const activeTx = commercialTransactions.find(
    (t) => t.stoneId === stone.id && (t.status === 'ACTIVE' || t.status === 'PENDING_ERP' || t.status === 'ERP_CONFIRMED')
  );

  // Active ERP event
  const erpEvent = erpEvents.find((e) => e.stoneId === stone.id);
  const erpBadge = erpEvent ? getERPSyncBadge(erpEvent.syncStatus) : null;

  // Active custodian lookup
  const custodianUser = users.find((u) => u.id === stone.activeCustodianId);
  const custodianName = custodianUser
    ? `${custodianUser.name} (${custodianUser.title})`
    : stone.activeCustodianId === 'SYSTEM_VAULT'
    ? 'Central Safe & Vault Master'
    : stone.activeCustodianId;

  const possessionMinutes = getElapsedTimeMinutes(stone.cabinPossessionStartedAt);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end transition-opacity">
      <div
        className="relative w-full max-w-2xl bg-white shadow-2xl h-full flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-navy-950 text-white flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-brand-600/30 border border-brand-500/40 flex items-center justify-center text-brand-300 font-mono font-bold text-sm">
              <Shield className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-lg font-bold text-white tracking-wide">
                  {stone.id}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  {stone.certificateReference}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  v{stone.version}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {stone.carat} Carat · {stone.shape} · {stone.colour} Colour · {stone.clarity} Clarity · Est. {formatUSD(stone.estimatedValueUSD)}
              </p>
            </div>
          </div>

          <button
            onClick={closeStoneDetail}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body - Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Operational Status Strip: Physical vs Commercial */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Panel 1: Physical Custody */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  <span>Physical Custody</span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1.5 ${physicalBadge.bg} ${physicalBadge.text} ${physicalBadge.border}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${physicalBadge.dot}`} />
                  <span>{physicalBadge.label}</span>
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Current Location:</span>
                  <span className="font-semibold text-slate-900">{stone.currentLocationId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Active Custodian:</span>
                  <span className="font-semibold text-slate-900 flex items-center space-x-1">
                    <UserIcon className="w-3 h-3 text-slate-400" />
                    <span>{custodianName}</span>
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Cabin Assignment:</span>
                  <span className="font-medium text-slate-800">
                    {stone.activeCabinId || 'None (In Central Safe)'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Possession Time:</span>
                  <span className="font-medium text-slate-800 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>
                      {stone.cabinPossessionStartedAt
                        ? `${possessionMinutes} mins in cabin`
                        : 'Stored in Safe'}
                    </span>
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Single Custody Rule:</span>
                  <span className="font-semibold text-emerald-600 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verified · 1 Active Holder</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Panel 2: Commercial State */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Commercial State</span>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1.5 ${commercialBadge.bg} ${commercialBadge.text} ${commercialBadge.border}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${commercialBadge.dot}`} />
                  <span>{commercialBadge.label}</span>
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Commercial Rule:</span>
                  <span className="font-medium text-slate-800">
                    {stone.commercialStatus === 'Available'
                      ? 'Available for viewing & offer'
                      : stone.commercialStatus === 'Hold'
                      ? 'Exclusively reserved for buyer'
                      : stone.commercialStatus === 'Memo'
                      ? 'Memorandum evaluation out'
                      : stone.commercialStatus === 'Sale Pending ERP'
                      ? 'Floor sale committed · Outbox queued'
                      : 'ERP Accepted · Stock posted'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Buyer Reference:</span>
                  <span className="font-semibold text-slate-900 font-mono">
                    {activeTx?.buyerReference || 'N/A (Unassigned)'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Client / Organization:</span>
                  <span className="font-medium text-slate-800">
                    {activeTx?.buyerName || 'None'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Authorised By:</span>
                  <span className="font-medium text-slate-800">
                    {activeTx?.authorisedBy
                      ? users.find((u) => u.id === activeTx.authorisedBy)?.name || activeTx.authorisedBy
                      : 'System / Catalog'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Expiry / Return Due:</span>
                  <span className="font-semibold text-amber-700">
                    {activeTx?.expiryOrDueDate
                      ? formatDateTime(activeTx.expiryOrDueDate)
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Diamond Technical Specifications Grid */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <FileCheck className="w-4 h-4 text-brand-600" />
              <span>GIA Diamond Specifications (Fictional Demo Data)</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Weight / Carat</span>
                <span className="font-bold text-slate-900 text-sm">{stone.carat} ct</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Cut Shape</span>
                <span className="font-bold text-slate-900 text-sm">{stone.shape}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Colour Grade</span>
                <span className="font-bold text-slate-900 text-sm">{stone.colour} (Rare White)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Clarity Grade</span>
                <span className="font-bold text-slate-900 text-sm">{stone.clarity}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Cut Polish Symm</span>
                <span className="font-semibold text-slate-800">{stone.cut} · {stone.polish}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Fluorescence</span>
                <span className="font-semibold text-slate-800">{stone.fluorescence}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">RFID Cassette Tag</span>
                <span className="font-mono font-semibold text-slate-800">{stone.rfidTag}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 font-semibold block uppercase">Estimated Valuation</span>
                <span className="font-bold text-brand-700">{formatUSD(stone.estimatedValueUSD)}</span>
              </div>
            </div>
          </div>

          {/* ERP Synchronisation Outbox Status Card */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <RefreshCw className="w-4 h-4 text-sky-600" />
                <span>Central ERP Integration Monitor (Transactional Outbox)</span>
              </div>
              {erpBadge ? (
                <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${erpBadge.bg} ${erpBadge.text} ${erpBadge.border}`}>
                  {erpBadge.label}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">
                  Synced · No Pending Outbox
                </span>
              )}
            </div>

            {erpEvent ? (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Event ID & Sequence:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {erpEvent.id} (Seq #{erpEvent.sequenceNumber})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Payload Message:</span>
                  <span className="font-mono text-slate-700">{erpEvent.payloadSummary}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Idempotency Key:</span>
                  <span className="font-mono text-[11px] text-slate-500">{erpEvent.idempotencyKey}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Last Attempt / Retry Count:</span>
                  <span className="text-slate-700">
                    {formatDateTime(erpEvent.lastAttemptAt)} · {erpEvent.retryCount} retries
                  </span>
                </div>
                {erpEvent.errorMessage && (
                  <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-start space-x-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
                    <span>{erpEvent.errorMessage}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                All events for {stone.id} are fully synchronised and reconciled with central ERP SAP stock records.
              </p>
            )}
          </div>

          {/* Quick Contextual Operational Actions */}
          <div className="p-4 rounded-xl border border-brand-200 bg-brand-50/40 space-y-2.5">
            <div className="flex items-center space-x-2 text-xs font-bold text-brand-900 uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5 text-brand-700" />
              <span>Contextual Operational Controls</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {stone.physicalStatus === 'In Cabin' && (
                <button
                  onClick={() => requestReturn(stone.id, 'Requested return via stone drawer')}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition shadow-sm"
                >
                  Request Return to Safe
                </button>
              )}
              {stone.physicalStatus === 'Return Transit' && (
                <button
                  onClick={() => stockroomConfirmSafeReceipt(stone.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm"
                >
                  Confirm Safe Return Receipt
                </button>
              )}
              <span className="text-xs text-slate-500 self-center">
                Operating as: <strong>{currentUser.name}</strong> ({currentUser.role})
              </span>
            </div>
          </div>

          {/* Chronological Custody & Operational Event Ledger */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <History className="w-4 h-4 text-brand-600" />
                <span>Chain of Custody & Movement Audit Trail ({stoneEvents.length})</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Time-stamped & Immutable</span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white divide-y divide-slate-100">
              {stoneEvents.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No custody movements recorded yet for this stone.
                </div>
              ) : (
                stoneEvents.map((event, idx) => {
                  const actor = users.find((u) => u.id === event.actorId)?.name || event.actorId;
                  const isSuccess = event.result === 'SUCCESS';
                  const isBlocked = event.result === 'BLOCKED';

                  return (
                    <div key={event.id || idx} className="p-3.5 text-xs hover:bg-slate-50/70 transition">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSuccess
                                ? 'bg-emerald-500'
                                : isBlocked
                                ? 'bg-rose-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          <span className="font-semibold text-slate-900 font-mono text-[11px]">
                            {event.eventType}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                              isSuccess
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : isBlocked
                                ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {event.result}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono font-medium">
                          {formatDateTime(event.timestamp)}
                        </span>
                      </div>

                      <p className="text-slate-700 text-xs mb-2">
                        {event.reason || 'Operational status updated'}
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-50 p-2 rounded border border-slate-100 text-slate-700">
                        <div>
                          <span className="text-slate-500 font-semibold block text-[9px] uppercase">From</span>
                          <span className="font-medium text-slate-900 truncate block">{event.fromLocation}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block text-[9px] uppercase">To</span>
                          <span className="font-medium text-slate-900 truncate block">{event.toLocation}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block text-[9px] uppercase">Actor</span>
                          <span className="font-medium text-slate-900 truncate block">{actor}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-semibold block text-[9px] uppercase">Channel</span>
                          <span className="font-mono text-[10px] text-slate-800 truncate block">{event.deviceChannel}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>RFID Tag: {stone.rfidTag}</span>
          <button
            onClick={closeStoneDetail}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
