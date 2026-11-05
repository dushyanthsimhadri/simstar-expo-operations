import React, { useState } from 'react';
import { useOperations } from '../../context/OperationsContext';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Eye,
  Lock,
  UserCheck,
  FileCheck,
  ShieldCheck,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';
import { ExceptionStatus } from '../../types';

export const ExceptionCenter: React.FC = () => {
  const {
    exceptions,
    users,
    currentUser,
    assignException,
    startExceptionInvestigation,
    resolveException,
    verifyException,
    openStoneDetail,
  } = useOperations();

  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  // Modal / workflow state for investigation and resolution
  const [activeModalExcId, setActiveModalExcId] = useState<string | null>(null);
  const [modalMode, setModalMode] = useState<'ASSIGN' | 'INVESTIGATE' | 'RESOLVE' | 'VERIFY'>('ASSIGN');
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('usr_ctrl_ananya');
  const [investigationNotes, setInvestigationNotes] = useState<string>('');
  const [resolutionEvidence, setResolutionEvidence] = useState<string>('');

  const filtered = exceptions.filter((e) => {
    if (activeFilter === 'ALL') return true;
    return e.status === activeFilter;
  });

  const openActionModal = (excId: string, mode: 'ASSIGN' | 'INVESTIGATE' | 'RESOLVE' | 'VERIFY') => {
    const exc = exceptions.find((e) => e.id === excId);
    setActiveModalExcId(excId);
    setModalMode(mode);
    if (exc) {
      setSelectedOwnerId(exc.assignedOwnerId || 'usr_ctrl_ananya');
      setInvestigationNotes(exc.investigationNotes || '');
      setResolutionEvidence(exc.resolutionEvidence || '');
    }
  };

  const handleModalSubmit = () => {
    if (!activeModalExcId) return;

    if (modalMode === 'ASSIGN') {
      assignException(activeModalExcId, selectedOwnerId);
    } else if (modalMode === 'INVESTIGATE') {
      startExceptionInvestigation(activeModalExcId, investigationNotes);
    } else if (modalMode === 'RESOLVE') {
      resolveException(activeModalExcId, investigationNotes, resolutionEvidence);
    } else if (modalMode === 'VERIFY') {
      verifyException(activeModalExcId, currentUser.id);
    }

    setActiveModalExcId(null);
  };

  const activeExc = exceptions.find((e) => e.id === activeModalExcId);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <span>Operational Exception Governance Center</span>
          </h2>
          <p className="text-xs text-slate-500">
            Mandatory 5-stage lifecycle: Open → Assigned → Investigating → Resolved → Verified
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-bold">
            {exceptions.filter((e) => e.status !== 'VERIFIED').length} Unclosed Exceptions
          </span>
        </div>
      </div>

      {/* Lifecycle Flow Indicator */}
      <div className="p-4 rounded-xl bg-slate-900 text-white text-xs border border-slate-800">
        <span className="text-[10px] text-brand-400 font-bold uppercase tracking-wider block mb-2">
          Mandatory Governance Pipeline (No Bypass Permitted)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[11px]">
          <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
            <span className="font-bold block text-rose-400">1. Open</span>
            <span className="text-[10px] text-slate-400">System Flagged</span>
          </div>
          <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
            <span className="font-bold block text-amber-400">2. Assigned</span>
            <span className="text-[10px] text-slate-400">Owner Designated</span>
          </div>
          <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
            <span className="font-bold block text-blue-400">3. Investigating</span>
            <span className="text-[10px] text-slate-400">Audit Notes</span>
          </div>
          <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
            <span className="font-bold block text-teal-400">4. Resolved</span>
            <span className="text-[10px] text-slate-400">Evidence Provided</span>
          </div>
          <div className="p-2 rounded bg-slate-800/80 border border-slate-700">
            <span className="font-bold block text-emerald-400">5. Verified</span>
            <span className="text-[10px] text-slate-400">Supervisor Signed</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs overflow-x-auto">
        {['ALL', 'OPEN', 'ASSIGNED', 'INVESTIGATING', 'RESOLVED', 'VERIFIED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeFilter === tab ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab} ({tab === 'ALL' ? exceptions.length : exceptions.filter((e) => e.status === tab).length})
          </button>
        ))}
      </div>

      {/* Exception Cards */}
      <div className="space-y-4">
        {filtered.map((exc) => {
          const isCritical = exc.severity === 'CRITICAL';
          const isVerified = exc.status === 'VERIFIED';

          return (
            <div
              key={exc.id}
              className={`p-5 rounded-2xl border transition shadow-sm bg-white ${
                isVerified
                  ? 'border-slate-200 opacity-70'
                  : isCritical
                  ? 'border-rose-300 ring-1 ring-rose-200'
                  : 'border-amber-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {exc.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCritical ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {exc.severity} SEVERITY
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {exc.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{exc.title}</h3>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      exc.status === 'VERIFIED'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : exc.status === 'RESOLVED'
                        ? 'bg-teal-50 text-teal-800 border border-teal-200'
                        : exc.status === 'INVESTIGATING'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : exc.status === 'ASSIGNED'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    Status: {exc.status}
                  </span>
                </div>
              </div>

              {/* Rule & System Behaviour */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 my-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                    Product Principle / Guardrail
                  </span>
                  <p className="text-slate-800 font-medium">{exc.ruleViolated}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                    Enforced System Response
                  </span>
                  <p className="text-slate-800 font-medium">{exc.systemAction}</p>
                </div>
              </div>

              {/* Assigned Owner, Notes & Evidence */}
              <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200 text-xs space-y-1.5 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Designated Investigation Owner:</span>
                  <span className="font-semibold text-slate-900">
                    {exc.assignedOwnerName || 'Unassigned (Action Required)'}
                  </span>
                </div>
                {exc.investigationNotes && (
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Investigation Audit Notes:</span>
                    <p className="text-slate-700 mt-0.5">{exc.investigationNotes}</p>
                  </div>
                )}
                {exc.resolutionEvidence && (
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase text-teal-700 font-bold">
                      Documented Resolution Evidence:
                    </span>
                    <p className="text-teal-900 font-medium mt-0.5">{exc.resolutionEvidence}</p>
                  </div>
                )}
                {exc.verifiedBy && (
                  <div className="text-[11px] text-emerald-700 font-semibold pt-1 border-t border-slate-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Verified by Supervisor {exc.verifiedBy} at {formatDateTime(exc.verifiedAt || '')}</span>
                  </div>
                )}
              </div>

              {/* Remedy & Progressive Governance Controls */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-slate-600">
                  Recommended Remedy: <strong className="text-slate-900">{exc.suggestedRemedy}</strong>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {exc.stoneId && (
                    <button
                      onClick={() => openStoneDetail(exc.stoneId!)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                    >
                      Inspect {exc.stoneId}
                    </button>
                  )}

                  {/* Stage 1: Open -> Assign */}
                  {exc.status === 'OPEN' && (
                    <button
                      onClick={() => openActionModal(exc.id, 'ASSIGN')}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition shadow-sm"
                    >
                      Step 1: Assign Owner
                    </button>
                  )}

                  {/* Stage 2: Assigned -> Investigate */}
                  {exc.status === 'ASSIGNED' && (
                    <button
                      onClick={() => openActionModal(exc.id, 'INVESTIGATE')}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold transition shadow-sm"
                    >
                      Step 2: Enter Audit Notes
                    </button>
                  )}

                  {/* Stage 3: Investigating -> Resolve with Evidence */}
                  {exc.status === 'INVESTIGATING' && (
                    <button
                      onClick={() => openActionModal(exc.id, 'RESOLVE')}
                      className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold transition shadow-sm"
                    >
                      Step 3: Document Evidence & Resolve
                    </button>
                  )}

                  {/* Stage 4: Resolved -> Supervisor Verify */}
                  {exc.status === 'RESOLVED' && (
                    <button
                      onClick={() => openActionModal(exc.id, 'VERIFY')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-sm flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Step 4: Supervisor Verification Sign-Off</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Exception Governance Workflow Modal */}
      {activeModalExcId && activeExc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">
                Exception Governance: {modalMode} ({activeExc.id})
              </h3>
              <button
                onClick={() => setActiveModalExcId(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-600">
              {modalMode === 'ASSIGN' && 'Assign a responsible controller or account director to lead investigation.'}
              {modalMode === 'INVESTIGATE' && 'Document physical inspection findings and root cause analysis in the audit ledger.'}
              {modalMode === 'RESOLVE' && 'Submit verifiable corrective evidence (e.g. optical certificate match, safe intake scan, bank wire confirmation).'}
              {modalMode === 'VERIFY' && 'Supervisor formal audit closure. Confirms all corrective actions are fully compliant.'}
            </p>

            {modalMode === 'ASSIGN' && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-600 uppercase block">
                  Select Accountable Owner:
                </label>
                <select
                  value={selectedOwnerId}
                  onChange={(e) => setSelectedOwnerId(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 bg-white text-xs text-slate-900"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.title})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(modalMode === 'INVESTIGATE' || modalMode === 'RESOLVE') && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                    Investigation Findings & Audit Notes:
                  </label>
                  <textarea
                    rows={3}
                    value={investigationNotes}
                    onChange={(e) => setInvestigationNotes(e.target.value)}
                    placeholder="Enter factual inspection notes (e.g., dual loupe check, serial verified, cassette swapped)..."
                    className="w-full p-2 rounded border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-500"
                  />
                </div>

                {modalMode === 'RESOLVE' && (
                  <div>
                    <label className="text-[10px] font-bold uppercase block mb-1 text-teal-800">
                      Required Corrective Evidence:
                    </label>
                    <input
                      type="text"
                      value={resolutionEvidence}
                      onChange={(e) => setResolutionEvidence(e.target.value)}
                      placeholder="e.g. Dual-scanned tag RFID-9902-7740 verified with GIA Cert #DEMO-7740"
                      className="w-full p-2 rounded border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-500 font-medium"
                    />
                  </div>
                )}
              </div>
            )}

            {modalMode === 'VERIFY' && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Supervisor Audit Verification Checklist</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  Confirmed: Corrective evidence has been reviewed. Physical inventory is accounted for with zero custody discrepancy.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setActiveModalExcId(null)}
                className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                className="px-4 py-2 rounded-lg text-white font-bold bg-slate-900 hover:bg-slate-800 shadow-sm transition active:scale-95"
              >
                Confirm {modalMode}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
