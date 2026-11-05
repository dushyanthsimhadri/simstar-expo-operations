import React, { useState } from 'react';
import { useOperations } from '../../context/OperationsContext';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  Download,
  ScanLine,
  Boxes,
  FileCheck,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const ReconciliationPage: React.FC = () => {
  const {
    stones,
    reconciliationItems,
    resolveReconciliationItem,
    openStoneDetail,
  } = useOperations();

  const [activeTab, setActiveTab] = useState<'CLOSING' | 'OPENING'>('CLOSING');
  const [resolutionNotes, setResolutionNotes] = useState<{ [stoneId: string]: string }>({});

  const matchedItems = reconciliationItems.filter((i) => i.status === 'Matched' || i.status === 'Resolved');
  const pendingItems = reconciliationItems.filter((i) => i.status === 'Pending Investigation' || i.status === 'Mismatch');

  const handleResolve = (stoneId: string) => {
    const note = resolutionNotes[stoneId] || 'Physical cassette inspected and resolved by controller.';
    resolveReconciliationItem(stoneId, note);
  };

  const handleExportCSV = () => {
    const headers = [
      'Stone ID',
      'Expected Location',
      'Actual Location',
      'Expected Custodian',
      'Actual Custodian',
      'Physical Status',
      'Commercial Status',
      'Reconciliation Status',
      'Assigned Owner',
      'Audit Notes',
    ];

    const rows = reconciliationItems.map((r) => [
      r.stoneId,
      `"${r.expectedLocation}"`,
      `"${r.actualLocation}"`,
      r.expectedCustodian,
      r.actualCustodian,
      r.physicalStatus,
      r.commercialStatus,
      r.status,
      r.assignedOwner || 'Unassigned',
      `"${r.notes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `simstar_manifest_reconciliation_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Inventory Physical Reconciliation & Manifest Audit
          </h2>
          <p className="text-xs text-slate-500">
            Mandatory audit comparing authorized show manifest against live physical cassette scans
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm flex items-center space-x-2 transition shrink-0"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export Reconciliation Audit (CSV)</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('CLOSING')}
          className={`px-3 py-1.5 rounded-lg font-bold transition ${
            activeTab === 'CLOSING' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Closing Daily Reconciliation ({reconciliationItems.length} items)
        </button>
        <button
          onClick={() => setActiveTab('OPENING')}
          className={`px-3 py-1.5 rounded-lg font-bold transition ${
            activeTab === 'OPENING' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Opening Manifest Verification (60 Diamonds Verified)
        </button>
      </div>

      {/* Audit Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Manifest Count</span>
          <span className="text-xl font-bold text-slate-900">{stones.length} unique stones</span>
          <span className="text-[10px] text-slate-600 block">0 duplicate IDs detected</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Audit Matched</span>
          <span className="text-xl font-bold text-emerald-600">{matchedItems.length} accounted</span>
          <span className="text-[10px] text-emerald-800 font-semibold block">Verified physical custodians</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Under Investigation</span>
          <span className="text-xl font-bold text-amber-600">{pendingItems.length} items</span>
          <span className="text-[10px] text-amber-800 font-semibold block">Mandatory owner assigned</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Untracked Missing</span>
          <span className="text-xl font-bold text-emerald-600">0 diamonds</span>
          <span className="text-[10px] text-slate-600 block">100% custody coverage</span>
        </div>
      </div>

      {activeTab === 'CLOSING' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm space-y-0">
          <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 uppercase tracking-wider">
              Closing Reconciliation Discrepancy Ledger
            </span>
            <span className="text-slate-500">Every exception requires owner assignment</span>
          </div>

          <div className="divide-y divide-slate-100">
            {reconciliationItems.map((item) => {
              const isMatched = item.status === 'Matched' || item.status === 'Resolved';

              return (
                <div key={item.stoneId} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openStoneDetail(item.stoneId)}
                        className="font-mono font-bold text-base text-brand-600 hover:underline"
                      >
                        {item.stoneId}
                      </button>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === 'Matched'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : item.status === 'Resolved'
                            ? 'bg-teal-50 text-teal-800 border border-teal-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700">
                      Expected: <strong>{item.expectedLocation}</strong> · Actual Live Location: <strong>{item.actualLocation}</strong>
                    </p>

                    <p className="text-[11px] text-slate-600">
                      Audit Notes: {item.notes} · Owner: <strong className="text-slate-800">{item.assignedOwner || 'Chief Controller'}</strong>
                    </p>
                  </div>

                  {/* Resolve control if pending */}
                  {!isMatched && (
                    <div className="flex items-center space-x-2 shrink-0">
                      <input
                        type="text"
                        placeholder="Resolution explanation..."
                        value={resolutionNotes[item.stoneId] || ''}
                        onChange={(e) =>
                          setResolutionNotes({ ...resolutionNotes, [item.stoneId]: e.target.value })
                        }
                        className="p-1.5 rounded border border-slate-300 bg-white text-xs text-slate-900 placeholder:text-slate-500 w-48 focus:ring-1 focus:ring-brand-500"
                      />
                      <button
                        onClick={() => handleResolve(item.stoneId)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white shadow-sm"
                      >
                        Resolve Exception
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'OPENING' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
          <div className="flex items-center space-x-2 text-emerald-700 font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm">Opening Show Inventory Manifest Fully Sealed & Verified</span>
          </div>
          <p className="text-slate-700 leading-relaxed">
            All 60 unique one-of-a-kind diamonds arrived under Armoured Transport Seal #441 at 07:30 Basel Time. Handheld optical verification confirmed unique GIA certificate serial numbers against the approved manifest. Zero duplicate or missing stones detected.
          </p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700">
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-semibold">Verified By</span>
              <span className="font-bold text-slate-900">Ananya Rao</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-semibold">Courier Authority</span>
              <span className="font-bold text-slate-900">Brink’s Global Services</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-semibold">Safe Compartments</span>
              <span className="font-bold text-slate-900">Zones A, B, C Sealed</span>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px] font-semibold">Intake Event</span>
              <span className="font-bold text-slate-900">MOV-1001 (Audit Lock)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
