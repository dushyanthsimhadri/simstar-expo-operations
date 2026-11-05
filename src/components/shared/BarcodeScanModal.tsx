import React, { useState } from 'react';
import { useOperations } from '../../context/OperationsContext';
import {
  X,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

interface BarcodeScanModalProps {
  requestId: string;
  onClose: () => void;
  onSuccessDispatch?: () => void;
}

export const BarcodeScanModal: React.FC<BarcodeScanModalProps> = ({
  requestId,
  onClose,
  onSuccessDispatch,
}) => {
  const {
    requests,
    simulateBarcodeScan,
    dispatchRunner,
    users,
    currentUser,
  } = useOperations();

  const [scanResult, setScanResult] = useState<{
    attempted: boolean;
    success?: boolean;
    error?: string;
  }>({ attempted: false });

  const [selectedRunnerId, setSelectedRunnerId] = useState<string>('usr_runner_arjun');

  const request = requests.find((r) => r.id === requestId);
  if (!request) return null;

  const runners = users.filter((u) => u.role === 'RUNNER' && u.active);

  const handleScan = (type: 'CORRECT' | 'MISMATCH') => {
    const res = simulateBarcodeScan(requestId, type);
    setScanResult({
      attempted: true,
      success: res.success,
      error: res.error,
    });
  };

  const handleDispatch = () => {
    const res = dispatchRunner(requestId, selectedRunnerId);
    if (res.success) {
      if (onSuccessDispatch) onSuccessDispatch();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-navy-950 text-white flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-brand-600/30 text-brand-400 border border-brand-500/30">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Physical Barcode Verification
              </h3>
              <p className="text-[11px] text-slate-400">
                Stockroom Safe Dispatch Gate · Request #{request.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Stone Information Banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Target Diamond Required
              </span>
              <span className="font-mono text-xl font-bold text-slate-900">{request.stoneId}</span>
              <span className="text-xs text-slate-600 font-medium ml-2">({request.cabinId})</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                Controller
              </span>
              <span className="text-xs font-semibold text-slate-900">{currentUser.name}</span>
            </div>
          </div>

          {/* Scanner Simulation Controls */}
          {!scanResult.attempted ? (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5">
                <span>Select Handheld Scanner Simulation Mode:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: Correct Scan */}
                <button
                  onClick={() => handleScan('CORRECT')}
                  className="p-4 rounded-xl border-2 border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-left transition group active:scale-95"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-emerald-900">
                      Option A: Correct Scan
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-snug">
                    Simulate scanning the verified cassette tag matching <strong>{request.stoneId}</strong>.
                  </p>
                </button>

                {/* Option 2: Mismatch Scan */}
                <button
                  onClick={() => handleScan('MISMATCH')}
                  className="p-4 rounded-xl border-2 border-rose-300 bg-rose-50/50 hover:bg-rose-50 text-left transition group active:scale-95"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-rose-900">
                      Option B: Mismatched Scan
                    </span>
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                  </div>
                  <p className="text-[11px] text-rose-700 leading-snug">
                    Simulate scanning an incorrect cassette tag. Tests security block & mismatch event.
                  </p>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 italic text-center font-medium">
                SimStar Rule: Physical dispatch is strictly prohibited until handheld laser scanner confirms barcode identity.
              </p>
            </div>
          ) : scanResult.success ? (
            /* Success Scan Result & Runner Assignment */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-xs uppercase tracking-wide">
                    Barcode Verification Confirmed
                  </div>
                  <p className="text-xs text-emerald-800 mt-1">
                    Laser scan matched cassette optical tag to diamond record <strong>{request.stoneId}</strong>. Dispatch gate unlocked.
                  </p>
                </div>
              </div>

              {/* Runner Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Assign Available Floor Runner for Secure Transit:
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {runners.map((runner) => (
                    <label
                      key={runner.id}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                        selectedRunnerId === runner.id
                          ? 'border-brand-500 bg-brand-50/60 font-semibold'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="runner"
                          checked={selectedRunnerId === runner.id}
                          onChange={() => setSelectedRunnerId(runner.id)}
                          className="text-brand-600 focus:ring-brand-500"
                        />
                        <span className="text-slate-900">{runner.name}</span>
                        <span className="text-slate-400">({runner.title})</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-medium">Available</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => setScanResult({ attempted: false })}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Rescan
                </button>
                <button
                  onClick={handleDispatch}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-brand-600 text-white hover:bg-brand-700 shadow-sm flex items-center space-x-1.5 transition active:scale-95"
                >
                  <span>Confirm Dispatch & Hand Over Custody</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Mismatch Blocked Alert */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-xs uppercase tracking-wide text-rose-800">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <span>Security Block Triggered · Barcode Mismatch</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  {scanResult.error}
                </p>
                <div className="p-2 rounded bg-rose-100/70 border border-rose-200 text-[11px] text-rose-900">
                  <strong>Operational Audit Record:</strong> Event MOV-VERIF-MISMATCH created. Notification dispatched to Security & Chief Controller. Request preserved.
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setScanResult({ attempted: false })}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition"
                >
                  Try Correct Scan
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Close & Inspect Exception
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
