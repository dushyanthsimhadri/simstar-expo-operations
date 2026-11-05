import React, { useState } from 'react';
import { useOperations } from '../../context/OperationsContext';
import {
  ArrowLeftRight,
  ShieldCheck,
  Clock,
  History,
  CheckCircle2,
  AlertTriangle,
  Lock,
  List,
  GitCommit,
  Filter,
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const CustodyMovementsPage: React.FC = () => {
  const { movementEvents, users, openStoneDetail } = useOperations();

  const [viewMode, setViewMode] = useState<'TABLE' | 'TIMELINE'>('TABLE');
  const [filterResult, setFilterResult] = useState<string>('ALL');

  const filteredEvents = movementEvents.filter((e) => {
    if (filterResult === 'ALL') return true;
    return e.result === filterResult;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Immutable Chain of Custody Movement Ledger
          </h2>
          <p className="text-xs text-slate-500">
            Cryptographically ordered movement ledger enforcing strict single physical custodian policy
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 transition ${
                viewMode === 'TABLE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table Ledger</span>
            </button>
            <button
              onClick={() => setViewMode('TIMELINE')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 transition ${
                viewMode === 'TIMELINE' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Visual Timeline</span>
            </button>
          </div>
        </div>
      </div>

      {/* Custody Principles Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center space-x-3 shadow-sm">
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900">Single Active Custodian</div>
            <div className="text-[11px] text-slate-500">Strictly 1 physical holder per diamond</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center space-x-3 shadow-sm">
          <div className="p-2 rounded-lg bg-brand-50 text-brand-600 border border-brand-100">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900">Laser Scan Guard</div>
            <div className="text-[11px] text-slate-500">Mismatches block physical gate dispatch</div>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex items-center space-x-3 shadow-sm">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-slate-900">Verified Handover Only</div>
            <div className="text-[11px] text-slate-500">Custody shifts on receipt confirmation</div>
          </div>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'TABLE' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200 tracking-wider">
                <tr>
                  <th className="px-4 py-3">Movement ID</th>
                  <th className="px-4 py-3">Stone ID</th>
                  <th className="px-4 py-3">Event Type</th>
                  <th className="px-4 py-3">From Location</th>
                  <th className="px-4 py-3">To Location</th>
                  <th className="px-4 py-3">Previous Custodian</th>
                  <th className="px-4 py-3">New Custodian</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Result</th>
                  <th className="px-4 py-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((evt) => {
                  const prevUser = users.find((u) => u.id === evt.previousCustodianId)?.name || evt.previousCustodianId;
                  const newUser = users.find((u) => u.id === evt.newCustodianId)?.name || evt.newCustodianId;
                  const actor = users.find((u) => u.id === evt.actorId)?.name || evt.actorId;
                  const isSuccess = evt.result === 'SUCCESS';
                  const isBlocked = evt.result === 'BLOCKED';

                  return (
                    <tr
                      key={evt.id}
                      onClick={() => openStoneDetail(evt.stoneId)}
                      className="hover:bg-slate-50/70 cursor-pointer transition group"
                    >
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 group-hover:text-brand-600">
                        {evt.id}
                        <span className="block text-[10px] text-slate-500 font-normal">Seq #{evt.sequenceNumber}</span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-slate-800">
                        {evt.stoneId}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {evt.eventType}
                      </td>
                      <td className="px-4 py-3 text-slate-700 truncate max-w-[120px]">
                        {evt.fromLocation}
                      </td>
                      <td className="px-4 py-3 text-slate-700 truncate max-w-[120px]">
                        {evt.toLocation}
                      </td>
                      <td className="px-4 py-3 text-slate-600 truncate max-w-[110px]">
                        {prevUser}
                      </td>
                      <td className="px-4 py-3 text-slate-900 font-semibold truncate max-w-[110px]">
                        {newUser}
                      </td>
                      <td className="px-4 py-3 text-slate-800 font-medium">
                        {actor}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isSuccess
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : isBlocked
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {evt.result}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[11px] text-slate-500">
                        {formatDateTime(evt.timestamp)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* TIMELINE VIEW */
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {filteredEvents.map((evt) => {
              const actor = users.find((u) => u.id === evt.actorId)?.name || evt.actorId;
              const isSuccess = evt.result === 'SUCCESS';
              const isBlocked = evt.result === 'BLOCKED';

              return (
                <div
                  key={evt.id}
                  onClick={() => openStoneDetail(evt.stoneId)}
                  className="relative p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 cursor-pointer transition"
                >
                  <div
                    className={`absolute -left-[27px] top-4 w-4 h-4 rounded-full border-2 ${
                      isSuccess
                        ? 'bg-emerald-500 border-white ring-2 ring-emerald-200'
                        : isBlocked
                        ? 'bg-rose-500 border-white ring-2 ring-rose-200'
                        : 'bg-amber-500 border-white ring-2 ring-amber-200'
                    }`}
                  />

                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900 text-sm">{evt.stoneId}</span>
                      <span className="font-mono text-xs px-2 py-0.2 rounded bg-slate-200 text-slate-700">
                        {evt.eventType}
                      </span>
                      <span className="text-xs px-2 py-0.2 rounded font-bold bg-slate-100 text-slate-600">
                        {evt.result}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 font-medium">{formatDateTime(evt.timestamp)}</span>
                  </div>

                  <p className="text-xs text-slate-800 leading-snug">{evt.reason}</p>

                  <div className="mt-2 pt-2 border-t border-slate-200/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
                    <div>From: <strong className="text-slate-800">{evt.fromLocation}</strong></div>
                    <div>To: <strong className="text-slate-800">{evt.toLocation}</strong></div>
                    <div>Actor: <strong className="text-slate-800">{actor}</strong></div>
                    <div>Channel: <strong className="text-slate-800">{evt.deviceChannel}</strong></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
