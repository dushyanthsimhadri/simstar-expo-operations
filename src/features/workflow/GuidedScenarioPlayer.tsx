import React, { useState } from 'react';
import { useOperations } from '../../context/OperationsContext';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Send,
  ScanLine,
  Truck,
  UserCheck,
  Tag,
  DollarSign,
  FileText,
  Clock,
  RefreshCw,
  Scale,
  Sparkles,
  Info,
  MapPin,
  Lock,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  formatUSD,
  formatDateTime,
  getPhysicalStatusBadge,
  getCommercialStatusBadge,
  getERPSyncBadge,
} from '../../utils/formatters';

interface StepSpecification {
  number: number;
  title: string;
  actor: string;
  actorRole: string;
  action: string;
  actionDetails: string;
  systemResponseTitle: string;
  systemResponse: string;
  businessControlTitle: string;
  businessControl: string;
}

export const GuidedScenarioPlayer: React.FC = () => {
  const {
    walkthroughStep,
    nextWalkthroughStep,
    prevWalkthroughStep,
    jumpToWalkthroughStep,
    walkthroughAutoPlaying,
    toggleWalkthroughAutoPlay,
    resetDemoData,
    stones,
    requests,
    movementEvents,
    commercialTransactions,
    erpEvents,
    notifications,
    users,
    cabins,
    currentUser,
    submitStoneRequest,
    simulateBarcodeScan,
    dispatchRunner,
    runnerAcceptPickup,
    runnerDeliverToCabin,
    salespersonConfirmReceipt,
    createHold,
    releaseHold,
    createMemo,
    initiateSale,
    requestReturn,
    runnerCollectReturn,
    stockroomConfirmSafeReceipt,
    simulateERPResponse,
    retryERPSync,
    openStoneDetail,
  } = useOperations();

  // Find hero stone DIA-2048
  const heroStone = stones.find((s) => s.id === 'DIA-2048') || stones[0];
  const heroRequest = requests.find((r) => r.stoneId === 'DIA-2048');
  const heroTx = commercialTransactions.find((t) => t.stoneId === 'DIA-2048');
  const heroERP = erpEvents.find((e) => e.stoneId === 'DIA-2048');

  // Local state for Step 2 Barcode Scan test
  const [scanResult, setScanResult] = useState<{ type?: 'CORRECT' | 'MISMATCH'; message?: string } | null>(null);

  // Local state for Step 6 Commercial Branch selection ('HOLD' | 'MEMO' | 'SALE')
  const [selectedBranch, setSelectedBranch] = useState<'HOLD' | 'MEMO' | 'SALE'>('SALE');

  // Form inputs for commercial branch
  const [buyerRef, setBuyerRef] = useState('BUYER-GEN-9021');
  const [buyerName, setBuyerName] = useState('Cartier Heritage Collections');
  const [holdMinutes, setHoldMinutes] = useState(45);
  const [memoDays, setMemoDays] = useState(3);
  const [salePrice, setSalePrice] = useState(68500);

  const physicalBadge = getPhysicalStatusBadge(heroStone.physicalStatus);
  const commercialBadge = getCommercialStatusBadge(heroStone.commercialStatus);

  const stepsSpec: StepSpecification[] = [
    {
      number: 1,
      title: 'Salesperson Requests Stone',
      actor: 'Priya Shah',
      actorRole: 'Salesperson · Cabin 04 (Geneva VIP Salon)',
      action: 'Submit viewing request for DIA-2048',
      actionDetails: 'Selects diamond DIA-2048 from available vault stock with VIP Immediate priority.',
      systemResponseTitle: 'Request Registered & Vault Alerted',
      systemResponse: 'Validates diamond is currently In Safe, creates Request REQ-0101, and alerts the Stockroom Controller queue.',
      businessControlTitle: 'Availability & Non-Duplication Rule',
      businessControl: 'A stone cannot be requested if already in transit, in another cabin, or under active exclusive hold.',
    },
    {
      number: 2,
      title: 'Inventory Verification (Laser Scan)',
      actor: 'Ananya Rao',
      actorRole: 'Stock Controller & Vault Master · Safe Room',
      action: 'Scan cassette barcode prior to vault gate exit',
      actionDetails: 'Retrieves physical diamond cassette from vault tray and scans 2D barcode before dispatch unlock.',
      systemResponseTitle: 'Positive Match Unlocks Dispatch Gate',
      systemResponse: 'Laser scan verifies physical diamond tag against request record. Mismatch aborts immediately and logs security event.',
      businessControlTitle: 'Optical Identification Mandate',
      businessControl: 'No diamond may leave the vault without positive optical verification. Manual bypass without barcode scan is strictly blocked.',
    },
    {
      number: 3,
      title: 'Runner Assignment & Safe Gate Pickup',
      actor: 'Ananya Rao (Controller) & Arjun Kumar (Runner)',
      actorRole: 'Inventory Controller + Floor Runner Courier',
      action: 'Controller stages stone; Runner signs for physical pickup',
      actionDetails: 'Controller assigns Runner Arjun Kumar. Runner acknowledges physical possession at the safe gate counter.',
      systemResponseTitle: 'Custody Shifts to Runner Courier',
      systemResponse: 'Physical status updates to Dispatched; active custodian legally transfers from Ananya to Arjun with timestamped custody record.',
      businessControlTitle: 'Two-Party Custody Handover Rule',
      businessControl: 'Physical custody never transitions implicitly. Controller release and runner acceptance must both occur for custody transfer.',
    },
    {
      number: 4,
      title: 'Runner Arrives at Cabin 04',
      actor: 'Arjun Kumar',
      actorRole: 'Floor Runner Courier · En Route to Cabin 04',
      action: 'Confirm arrival at Cabin 04 threshold',
      actionDetails: 'Runner taps handover on mobile console upon reaching Cabin 04. Cassette handed to salesperson.',
      systemResponseTitle: 'Handover Staged Awaiting Salesperson Receipt',
      systemResponse: 'Sets handover awaiting salesperson confirmation flag. Cabin terminal alerts Priya Shah to verify diamond seals.',
      businessControlTitle: 'Custody Retention Until Verification',
      businessControl: 'The runner remains 100% accountable for the diamond until the salesperson inspects and confirms receipt inside the cabin.',
    },
    {
      number: 5,
      title: 'Salesperson Confirms Physical Receipt',
      actor: 'Priya Shah',
      actorRole: 'Salesperson · Inside Cabin 04',
      action: 'Verify cassette seal and confirm physical receipt',
      actionDetails: 'Salesperson visually checks security seal, accepts cassette, and taps confirm physical receipt.',
      systemResponseTitle: 'Custody Transferred to Cabin & Timer Started',
      systemResponse: 'Physical status becomes In Cabin; Priya Shah becomes active custodian; 60-minute VIP possession countdown begins.',
      businessControlTitle: 'Single Active Custodian Principle',
      businessControl: 'At any given second, exactly one named individual holds physical responsibility. Shared or ambiguous custody is strictly impossible.',
    },
    {
      number: 6,
      title: 'Commercial Action (Hold / Memo / Sale)',
      actor: 'Priya Shah',
      actorRole: 'Salesperson · Client Negotiation',
      action: 'Record commercial commitment (Hold, Memo, or Sale)',
      actionDetails: 'Enters buyer details and selects branch: Exclusive Hold, Consignment Memo, or Firm Sale Commitment.',
      systemResponseTitle: 'Commercial State Mutates Independently',
      systemResponse: 'Commercial status updates without altering physical status. Prepares transactional ERP Outbox payload.',
      businessControlTitle: 'Orthogonal State Separation',
      businessControl: 'Physical custody and commercial commitment are independent dimensions. Commercial intent never overwrites physical location.',
    },
    {
      number: 7,
      title: 'Return Flow or Sale Execution',
      actor: 'Priya Shah → Arjun Kumar → Ananya Rao',
      actorRole: 'Salesperson / Floor Runner / Vault Controller',
      action: 'Initiate return, runner collection, and safe scan',
      actionDetails: 'Salesperson requests return; runner collects from cabin; stockroom controller scans cassette back into vault.',
      systemResponseTitle: 'Step-by-Step Custody Return to Vault',
      systemResponse: 'Advances: Return Requested → Return Transit → In Safe after return. Zero untracked intervals.',
      businessControlTitle: 'Closed-Loop Safe Receipt Mandate',
      businessControl: 'A return is never complete until the stockroom controller scans and confirms physical receipt back into the vault safe.',
    },
    {
      number: 8,
      title: 'Transactional Outbox & Central ERP Sync',
      actor: 'ERP Outbox Gateway (Simulated SAP Ledger)',
      actorRole: 'Integration Worker · Transactional Outbox Engine',
      action: 'Dispatch payload to central ERP with retry handling',
      actionDetails: 'Processes outbox queue with unique idempotency key, sequence counter, and response validator.',
      systemResponseTitle: 'ERP Acceptance Posts Commercial Record',
      systemResponse: 'Upon ERP confirmation, commercial status advances to ERP Accepted. On failure, logged for retry with idempotency preservation.',
      businessControlTitle: 'Captured ≠ Posted Principle',
      businessControl: 'A floor transaction is provisional. No transaction is legally binding or officially posted until central ERP confirms acceptance.',
    },
    {
      number: 9,
      title: 'Closing Manifest Reconciliation',
      actor: 'Ananya Rao & Internal Audit Lead',
      actorRole: 'Stock Controller & Independent Auditor',
      action: 'Run mathematical reconciliation across all 60 stones',
      actionDetails: 'Computes physical location breakdown against master exhibition register; verifies audit event chain.',
      systemResponseTitle: '100% Reconciled Zero-Discrepancy Manifest',
      systemResponse: 'Formula verified: In Safe + In Cabin + In Transit + Exceptions ≡ 60. Full time-stamped ledger verified for DIA-2048.',
      businessControlTitle: 'Zero-Discrepancy Manifest Integrity',
      businessControl: 'Every single stone must be accounted for by physical location and custodian. Floor operations cannot close with unverified assets.',
    },
  ];

  const currentStepSpec = stepsSpec[walkthroughStep];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Walkthrough Navigation Header */}
      <div className="bg-navy-950 text-white rounded-2xl p-5 shadow-xl border border-navy-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-navy-800/80 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
                INTERACTIVE SCENARIO WALKTHROUGH
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-300 font-mono">DIA-2048 · 2.10ct D VVS1 Round</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Step {walkthroughStep + 1} of 9: {currentStepSpec.title}
            </h2>
            <p className="text-xs text-slate-400">
              Active Operational Actor: <strong className="text-brand-300">{currentStepSpec.actor}</strong> ({currentStepSpec.actorRole})
            </p>
          </div>

          {/* Player Controls: Prev, Next, Auto-Play, Pause, Reset */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={prevWalkthroughStep}
              disabled={walkthroughStep === 0}
              className="p-2 rounded-lg bg-navy-800 hover:bg-navy-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 border border-navy-700 transition"
              title="Previous Step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={toggleWalkthroughAutoPlay}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                walkthroughAutoPlaying
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold'
                  : 'bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700'
              }`}
            >
              {walkthroughAutoPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Auto-Play</span>
                </>
              )}
            </button>

            <button
              onClick={nextWalkthroughStep}
              disabled={walkthroughStep >= 8}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-500 disabled:opacity-40 disabled:pointer-events-none text-white shadow-md shadow-brand-600/30 transition active:scale-95"
            >
              <span>Next Step</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                if (window.confirm('Reset walkthrough and restore DIA-2048 to initial vault state?')) {
                  resetDemoData();
                  jumpToWalkthroughStep(0);
                }
              }}
              className="p-2 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-400 hover:text-white border border-navy-700 transition"
              title="Reset Scenario to Step 1"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Step Indicator Chips */}
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 pt-4">
          {stepsSpec.map((s, idx) => {
            const isCurrent = walkthroughStep === idx;
            const isPast = walkthroughStep > idx;
            return (
              <button
                key={s.number}
                onClick={() => jumpToWalkthroughStep(idx)}
                className={`p-2 rounded-lg text-left transition border ${
                  isCurrent
                    ? 'bg-brand-600 border-brand-400 text-white shadow-md shadow-brand-600/30 ring-1 ring-white/20'
                    : isPast
                    ? 'bg-navy-900 border-navy-700 text-emerald-400 hover:bg-navy-800'
                    : 'bg-navy-950/60 border-navy-800 text-slate-500 hover:bg-navy-900'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span>Step {s.number}</span>
                  {isPast && <span>✓</span>}
                </div>
                <div className="text-[10px] truncate font-medium text-slate-200 mt-0.5">
                  {s.title.split(' ')[0]} {s.title.split(' ')[1] || ''}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4-Pillar Operational Governance Card for the Active Step */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-xs">
        <div className="space-y-1 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center space-x-1.5 text-navy-900 font-bold uppercase tracking-wider text-[10px]">
            <UserCheck className="w-3.5 h-3.5 text-brand-600" />
            <span>1. Operational Actor</span>
          </div>
          <div className="text-slate-900 font-bold text-xs">{currentStepSpec.actor}</div>
          <p className="text-[11px] text-slate-600 leading-snug">{currentStepSpec.actorRole}</p>
        </div>

        <div className="space-y-1 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center space-x-1.5 text-navy-900 font-bold uppercase tracking-wider text-[10px]">
            <Play className="w-3.5 h-3.5 text-indigo-600" />
            <span>2. Explicit Action</span>
          </div>
          <div className="text-slate-900 font-bold text-xs">{currentStepSpec.action}</div>
          <p className="text-[11px] text-slate-600 leading-snug">{currentStepSpec.actionDetails}</p>
        </div>

        <div className="space-y-1 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center space-x-1.5 text-navy-900 font-bold uppercase tracking-wider text-[10px]">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>3. System Response</span>
          </div>
          <div className="text-slate-900 font-bold text-xs">{currentStepSpec.systemResponseTitle}</div>
          <p className="text-[11px] text-slate-600 leading-snug">{currentStepSpec.systemResponse}</p>
        </div>

        <div className="space-y-1 p-2.5 rounded-xl bg-brand-50/70 border border-brand-200">
          <div className="flex items-center space-x-1.5 text-brand-900 font-bold uppercase tracking-wider text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            <span>4. Business Control</span>
          </div>
          <div className="text-brand-950 font-bold text-xs">{currentStepSpec.businessControlTitle}</div>
          <p className="text-[11px] text-brand-900 leading-snug font-medium">{currentStepSpec.businessControl}</p>
        </div>
      </div>

      {/* Main Two-Column Interactive Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN: INTERACTIVE STEP ENGINE (7 Cols)           */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          {/* STEP 1: SALESPERSON REQUESTS STONE */}
          {walkthroughStep === 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-brand-700 uppercase tracking-wider">
                <Send className="w-4 h-4 text-brand-600" />
                <span>Step 1: Salesperson Requests Diamond for Cabin Viewing</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Salesperson Priya Shah needs diamond <strong>DIA-2048</strong> for a private VIP viewing in <strong>Cabin 04</strong>. The system validates availability in the vault safe, registers a timestamped request record, and triggers an inventory queue alert for the stockroom controller.
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Requested Stone</span>
                    <span className="font-mono font-bold text-slate-900">DIA-2048</span>
                    <span className="text-[11px] text-slate-600 block">2.10ct · Round · D VVS1</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Destination</span>
                    <span className="font-bold text-slate-900">Cabin 04 · Geneva Private Salon</span>
                    <span className="text-[11px] text-slate-600 block">VIP Platinum Tier</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-600">
                    Physical Status: <strong className="text-slate-900">{heroStone.physicalStatus}</strong>
                  </span>
                  {heroStone.physicalStatus === 'In Safe' ? (
                    <button
                      onClick={() => {
                        submitStoneRequest('DIA-2048', 'CABIN-04', 'VIP Immediate', 'VIP buyer requested diamond DIA-2048 for Geneva Salon');
                      }}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white flex items-center space-x-1.5 transition active:scale-95 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Execute: Submit Request for DIA-2048</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Request Created #{heroRequest?.id}</span>
                      </span>
                      <button
                        onClick={nextWalkthroughStep}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition"
                      >
                        Proceed to Step 2
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: INVENTORY CONTROLLER LASER SCAN CHECK */}
          {walkthroughStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-brand-700 uppercase tracking-wider">
                <ScanLine className="w-4 h-4 text-brand-600" />
                <span>Step 2: Inventory Controller Barcode Verification</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Stockroom Controller Ananya Rao opens the request. Before releasing the diamond cassette from the safe room, she must scan the 2D laser barcode. Try both options to verify that a barcode mismatch strictly blocks dispatch.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option A: Correct scan */}
                <button
                  onClick={() => {
                    if (heroRequest) {
                      simulateBarcodeScan(heroRequest.id, 'CORRECT');
                      setScanResult({ type: 'CORRECT', message: 'Barcode tag verified successfully! Laser check matched DIA-2048.' });
                    }
                  }}
                  className="p-4 rounded-xl border-2 border-emerald-300 bg-emerald-50/60 hover:bg-emerald-50 text-left transition group active:scale-95"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-emerald-900">Simulate Correct Scan</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-[11px] text-emerald-700 leading-snug">
                    Scan tag matching <strong>DIA-2048</strong>. Unlocks runner dispatch.
                  </p>
                </button>

                {/* Option B: Mismatched scan */}
                <button
                  onClick={() => {
                    if (heroRequest) {
                      const res = simulateBarcodeScan(heroRequest.id, 'MISMATCH');
                      setScanResult({ type: 'MISMATCH', message: res.error || 'Barcode mismatch flagged!' });
                    }
                  }}
                  className="p-4 rounded-xl border-2 border-rose-300 bg-rose-50/60 hover:bg-rose-50 text-left transition group active:scale-95"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-rose-900">Simulate Mismatch Scan</span>
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                  </div>
                  <p className="text-[11px] text-rose-700 leading-snug">
                    Scan incorrect cassette tag. Dispatch is blocked & security incident logged.
                  </p>
                </button>
              </div>

              {scanResult && (
                <div
                  className={`p-4 rounded-xl border text-xs ${
                    scanResult.type === 'CORRECT'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="font-bold flex items-center space-x-1.5 mb-1">
                    {scanResult.type === 'CORRECT' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                    )}
                    <span>{scanResult.type === 'CORRECT' ? 'Verification Passed' : 'Dispatch Blocked by Security Rule'}</span>
                  </div>
                  <p className="leading-snug">{scanResult.message}</p>
                </div>
              )}

              {heroRequest?.status === 'Verified' && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={nextWalkthroughStep}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition flex items-center space-x-1"
                  >
                    <span>Proceed to Step 3: Runner Dispatch</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: RUNNER ASSIGNMENT & SAFE GATE PICKUP */}
          {walkthroughStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-brand-700 uppercase tracking-wider">
                <Truck className="w-4 h-4 text-brand-600" />
                <span>Step 3: Runner Assignment & Safe Room Gate Pickup</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                With the stone verified, Controller Ananya Rao stages the cassette for Floor Runner <strong>Arjun Kumar</strong>. <strong>Key Rule:</strong> Custody transfers only when the runner physically accepts pickup at the safe gate!
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Assigning Courier</span>
                    <span className="font-semibold text-slate-900">Arjun Kumar (Lead Floor Runner)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Transit Destination</span>
                    <span className="font-semibold text-slate-900">Cabin 04</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600">
                      Physical Status: <strong className="text-slate-900">{heroStone.physicalStatus}</strong>
                    </span>
                    <span className="text-slate-600">
                      Active Custodian: <strong className="text-slate-900">{users.find(u => u.id === heroStone.activeCustodianId)?.name || heroStone.activeCustodianId}</strong>
                    </span>
                  </div>

                  {/* Stage 1: Controller stages for runner */}
                  {heroStone.physicalStatus !== 'Dispatched' && heroStone.physicalStatus !== 'In Cabin' ? (
                    <button
                      onClick={() => {
                        if (heroRequest) {
                          dispatchRunner(heroRequest.id, 'usr_runner_arjun');
                        }
                      }}
                      className="w-full py-2.5 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center space-x-1.5 transition active:scale-95 shadow-sm"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Stage Diamond at Safe Gate for Courier Arjun Kumar</span>
                    </button>
                  ) : heroStone.activeCustodianId !== 'usr_runner_arjun' && heroStone.physicalStatus !== 'In Cabin' ? (
                    /* Stage 2: Runner physically signs and accepts pickup at gate */
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                      <p className="text-[11px] text-amber-800">
                        Stone is staged at Safe Gate. Runner Arjun Kumar must now accept physical custody before departing.
                      </p>
                      <button
                        onClick={() => {
                          if (heroRequest) {
                            runnerAcceptPickup(heroRequest.id);
                          }
                        }}
                        className="w-full py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center space-x-1.5 transition active:scale-95 shadow-sm"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Runner Arjun Kumar: Accept Physical Pickup at Safe Gate</span>
                      </button>
                    </div>
                  ) : (
                    /* Stage 3: Pickup complete, proceed */
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-blue-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Pickup Signed & Accepted · Custody: Arjun Kumar</span>
                      </span>
                      <button
                        onClick={nextWalkthroughStep}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition"
                      >
                        Proceed to Step 4
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: RUNNER DELIVERS AT CABIN */}
          {walkthroughStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-brand-700 uppercase tracking-wider">
                <Truck className="w-4 h-4 text-brand-600" />
                <span>Step 4: Runner Arrives at Cabin 04</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Runner Arjun Kumar arrives at Cabin 04 and confirms arrival on his mobile console. <strong>Important Custody Rule:</strong> Handover is marked awaiting salesperson confirmation. Physical custody does NOT transfer to the salesperson yet!
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Courier Action</span>
                    <span className="font-semibold text-slate-900">Arjun Kumar arriving at Cabin 04</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Handover State</span>
                    <span className="font-semibold text-amber-700">Awaiting Salesperson Receipt</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-600">
                    Custodian: <strong className="text-slate-900">Runner Arjun Kumar</strong> (until receipt confirmed)
                  </span>

                  {!heroRequest?.handoverAwaitingSalesperson && heroStone.physicalStatus !== 'In Cabin' ? (
                    <button
                      onClick={() => {
                        if (heroRequest) {
                          runnerDeliverToCabin(heroRequest.id);
                        }
                      }}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center space-x-1.5 transition active:scale-95 shadow-sm"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Runner: Confirm Handover Hand-in</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Awaiting Salesperson Receipt</span>
                      </span>
                      <button
                        onClick={nextWalkthroughStep}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition"
                      >
                        Proceed to Step 5
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: SALESPERSON CONFIRMS RECEIPT */}
          {walkthroughStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-brand-700 uppercase tracking-wider">
                <UserCheck className="w-4 h-4 text-brand-600" />
                <span>Step 5: Salesperson Confirms Physical Receipt</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Salesperson Priya Shah physically verifies the diamond cassette inside Cabin 04 and confirms receipt in the app. Status changes to <strong>In Cabin</strong>, Priya becomes active custodian, and the cabin possession timer begins.
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Accountable Salesperson</span>
                    <span className="font-semibold text-slate-900">Priya Shah (VP High-Jewellery Accounts)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Location</span>
                    <span className="font-semibold text-slate-900">Cabin 04 · Geneva Private Salon</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-600">
                    Physical Status: <strong className="text-slate-900">{heroStone.physicalStatus}</strong>
                  </span>

                  {heroStone.physicalStatus !== 'In Cabin' ? (
                    <button
                      onClick={() => {
                        if (heroRequest) {
                          salespersonConfirmReceipt(heroRequest.id);
                        }
                      }}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1.5 transition active:scale-95 shadow-sm"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Salesperson: Confirm Physical Receipt</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>In Cabin · Custodian: Priya Shah</span>
                      </span>
                      <button
                        onClick={nextWalkthroughStep}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition"
                      >
                        Proceed to Step 6
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: COMMERCIAL ACTION (HOLD / MEMO / SALE BRANCHES) */}
          {walkthroughStep === 5 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-brand-700 uppercase tracking-wider">
                <Tag className="w-4 h-4 text-brand-600" />
                <span>Step 6: Commercial Action Selection</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Choose one commercial action branch. Each branch enforces its own business rules, client fields, and resulting status.
              </p>

              {/* 3 Branch Selector Tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedBranch('HOLD')}
                  className={`p-3 rounded-xl border text-left transition ${
                    selectedBranch === 'HOLD'
                      ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs">Branch A</div>
                  <div className="text-sm font-bold">Exclusive Hold</div>
                  <div className="text-[10px] text-slate-500 font-normal">Temporary reservation</div>
                </button>

                <button
                  onClick={() => setSelectedBranch('MEMO')}
                  className={`p-3 rounded-xl border text-left transition ${
                    selectedBranch === 'MEMO'
                      ? 'border-purple-500 bg-purple-50 text-purple-900 font-bold shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs">Branch B</div>
                  <div className="text-sm font-bold">Consignment Memo</div>
                  <div className="text-[10px] text-slate-500 font-normal">Evaluation agreement</div>
                </button>

                <button
                  onClick={() => setSelectedBranch('SALE')}
                  className={`p-3 rounded-xl border text-left transition ${
                    selectedBranch === 'SALE'
                      ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-xs">Branch C (Recommended)</div>
                  <div className="text-sm font-bold">Firm Sale Commitment</div>
                  <div className="text-[10px] text-slate-500 font-normal">Sale Pending ERP</div>
                </button>
              </div>

              {/* Branch Forms */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-700 font-bold uppercase tracking-wider block mb-1">
                      Buyer Reference
                    </label>
                    <input
                      type="text"
                      value={buyerRef}
                      onChange={(e) => setBuyerRef(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs font-mono font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-700 font-bold uppercase tracking-wider block mb-1">
                      Buyer Name / Organization
                    </label>
                    <input
                      type="text"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs font-semibold text-slate-900"
                    />
                  </div>
                </div>

                {selectedBranch === 'HOLD' && (
                  <div className="text-xs space-y-2">
                    <label className="text-[10px] text-slate-700 font-bold uppercase tracking-wider block">
                      Hold Duration (Minutes)
                    </label>
                    <input
                      type="number"
                      value={holdMinutes}
                      onChange={(e) => setHoldMinutes(Number(e.target.value))}
                      className="w-32 px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs font-semibold text-slate-900"
                    />
                    <p className="text-[11px] text-amber-800 font-medium">
                      Locks stone against competing offers. Commercial state becomes <strong>Hold</strong>. Physical state remains <strong>In Cabin</strong>.
                    </p>
                  </div>
                )}

                {selectedBranch === 'MEMO' && (
                  <div className="text-xs space-y-2">
                    <label className="text-[10px] text-slate-700 font-bold uppercase tracking-wider block">
                      Memo Duration (Days)
                    </label>
                    <input
                      type="number"
                      value={memoDays}
                      onChange={(e) => setMemoDays(Number(e.target.value))}
                      className="w-32 px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs font-semibold text-slate-900"
                    />
                    <p className="text-[11px] text-purple-800 font-medium">
                      Consignment agreement where SimStar retains ownership. Commercial state becomes <strong>Memo</strong>.
                    </p>
                  </div>
                )}

                {selectedBranch === 'SALE' && (
                  <div className="text-xs space-y-2">
                    <label className="text-[10px] text-slate-700 font-bold uppercase tracking-wider block">
                      Agreed Valuation (USD)
                    </label>
                    <input
                      type="number"
                      value={salePrice}
                      onChange={(e) => setSalePrice(Number(e.target.value))}
                      className="w-40 px-2.5 py-1.5 rounded border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900"
                    />
                    <p className="text-[11px] text-blue-800 font-medium">
                      Creates <strong>Sale Pending ERP</strong> state. Crucial principle: Not officially completed until ERP confirms acceptance!
                    </p>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      if (selectedBranch === 'HOLD') {
                        createHold('DIA-2048', buyerRef, buyerName, holdMinutes);
                      } else if (selectedBranch === 'MEMO') {
                        const dueDate = new Date(Date.now() + memoDays * 86400000).toISOString();
                        createMemo('DIA-2048', buyerRef, buyerName, dueDate);
                      } else if (selectedBranch === 'SALE') {
                        initiateSale('DIA-2048', buyerRef, buyerName, salePrice);
                      }
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white flex items-center space-x-1.5 transition active:scale-95 shadow-sm"
                  >
                    <span>Execute Commercial Branch: {selectedBranch}</span>
                  </button>

                  {heroStone.commercialStatus !== 'Available' && (
                    <button
                      onClick={nextWalkthroughStep}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition"
                    >
                      Proceed to Step 7
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: RETURN OR SALE FLOW */}
          {walkthroughStep === 6 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-brand-700 uppercase tracking-wider">
                <ArrowRight className="w-4 h-4 text-brand-600" />
                <span>Step 7: Return or Sale Flow Execution</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                If Hold: test release. If Memo or Return requested: test runner return pickup and safe closing. If Sale: proceed to ERP synchronisation.
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Commercial State:</span>
                  <span className="font-bold text-slate-900">{heroStone.commercialStatus}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Physical Custody:</span>
                  <span className="font-bold text-slate-900">{heroStone.physicalStatus}</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-2 justify-end">
                  {heroStone.commercialStatus === 'Hold' && (
                    <button
                      onClick={() => releaseHold('DIA-2048')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition"
                    >
                      Release Hold (Return to Available)
                    </button>
                  )}

                  {heroStone.physicalStatus === 'In Cabin' && (
                    <button
                      onClick={() => requestReturn('DIA-2048')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-700 text-white hover:bg-slate-800 transition"
                    >
                      Request Return to Safe
                    </button>
                  )}

                  {heroStone.physicalStatus === 'Return Requested' && (
                    <button
                      onClick={() => runnerCollectReturn('DIA-2048', 'usr_runner_arjun')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-600 text-white hover:bg-orange-700 transition"
                    >
                      Runner: Collect Return (Status: Return Transit)
                    </button>
                  )}

                  {heroStone.physicalStatus === 'Return Transit' && (
                    <button
                      onClick={() => stockroomConfirmSafeReceipt('DIA-2048')}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                    >
                      Stockroom: Scan & Confirm Safe Receipt
                    </button>
                  )}

                  <button
                    onClick={nextWalkthroughStep}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition"
                  >
                    Proceed to Step 8: ERP Sync
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: ERP SYNCHRONISATION */}
          {walkthroughStep === 7 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-brand-700 uppercase tracking-wider">
                <RefreshCw className="w-4 h-4 text-sky-600" />
                <span>Step 8: Transactional Outbox & Central ERP Sync</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Test ERP resilience. Simulate ERP Accepted or ERP Failure. Crucial rules: Captured is not Posted; a sale is not complete until ERP confirms acceptance. Retrying is idempotent.
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Outbox Event</span>
                    <span className="font-mono font-bold text-slate-900">{heroERP?.id || 'ERP-OUTBOX-AUTO'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Sync Status</span>
                    <span className="font-bold text-brand-700">{heroERP?.syncStatus || 'Pending'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => {
                      if (heroERP) simulateERPResponse(heroERP.id, 'ACCEPTED');
                    }}
                    className="p-3 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-left text-xs font-bold text-emerald-900 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span>Simulate ERP Accepted</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-[10px] text-emerald-800 font-medium mt-0.5">
                      Confirms stock posting in SAP ERP. Commercial status becomes <strong>ERP Accepted</strong>.
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      if (heroERP) simulateERPResponse(heroERP.id, 'FAILED');
                    }}
                    className="p-3 rounded-lg border border-rose-300 bg-rose-50 hover:bg-rose-100 text-left text-xs font-bold text-rose-900 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span>Simulate ERP Failure</span>
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                    </div>
                    <p className="text-[10px] text-rose-800 font-medium mt-0.5">
                      Simulate network gateway timeout. Transaction remains in Outbox for retry.
                    </p>
                  </button>
                </div>

                {heroERP?.syncStatus === 'Failed' && (
                  <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
                    <span>Retry count: {heroERP.retryCount} · Retries use unique idempotency key</span>
                    <button
                      onClick={() => retryERPSync(heroERP.id)}
                      className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px]"
                    >
                      Retry Idempotent Sync
                    </button>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={nextWalkthroughStep}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition"
                  >
                    Proceed to Step 9: Closing Reconciliation
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 9: CLOSING RECONCILIATION */}
          {walkthroughStep === 8 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-xs font-bold text-brand-700 uppercase tracking-wider">
                <Scale className="w-4 h-4 text-brand-600" />
                <span>Step 9: Closing Manifest Physical Reconciliation</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                At the end of operating day 2, the inventory team runs closing reconciliation. 100% of show inventory must be accounted for. Every exception must have an assigned owner and resolution status.
              </p>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Expected Show Stones</span>
                    <span className="font-bold text-slate-900 text-sm">{stones.length}</span>
                  </div>
                  <div className="p-2.5 rounded bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Physical in Safe</span>
                    <span className="font-bold text-emerald-600 text-sm">
                      {stones.filter(s => s.physicalStatus === 'In Safe' || s.physicalStatus === 'In Safe after return').length}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Active in Cabins</span>
                    <span className="font-bold text-indigo-600 text-sm">
                      {stones.filter(s => s.physicalStatus === 'In Cabin').length}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">In Transit</span>
                    <span className="font-bold text-blue-600 text-sm">
                      {stones.filter(s => s.physicalStatus === 'Dispatched' || s.physicalStatus === 'Return Transit').length}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Reconciliation Audit Verified · 60/60 Stones Reconciled</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-1">
                    DIA-2048 is completely accounted for with full timestamped audit logs. Zero untracked stones on the exhibition floor.
                  </p>
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <button
                    onClick={() => {
                      resetDemoData();
                      jumpToWalkthroughStep(0);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                  >
                    Restart Walkthrough
                  </button>
                  <button
                    onClick={() => openStoneDetail('DIA-2048')}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-brand-600 text-white hover:bg-brand-500 transition shadow-sm"
                  >
                    Inspect Final DIA-2048 Audit Ledger
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: LIVE TIME-STAMPED AUDIT & STATE (5 Cols)   */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Stone Card: DIA-2048 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-base font-bold text-slate-900">DIA-2048</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-medium">
                  DEMO-CERT-2048
                </span>
              </div>
              <button
                onClick={() => openStoneDetail('DIA-2048')}
                className="text-xs text-brand-600 hover:text-brand-800 font-semibold"
              >
                Inspect Record →
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Physical Custody</span>
                <span className={`font-bold mt-0.5 block ${physicalBadge.text}`}>
                  {physicalBadge.label}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Commercial State</span>
                <span className={`font-bold mt-0.5 block ${commercialBadge.text}`}>
                  {commercialBadge.label}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Active Custodian</span>
                <span className="font-semibold text-slate-900 mt-0.5 truncate block">
                  {users.find((u) => u.id === heroStone.activeCustodianId)?.name || heroStone.activeCustodianId}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Location</span>
                <span className="font-semibold text-slate-900 mt-0.5 truncate block">
                  {heroStone.currentLocationId}
                </span>
              </div>
            </div>
          </div>

          {/* Real-Time Operational Event Feed for DIA-2048 */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-600" />
                <span>Live Event Stream (DIA-2048)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono font-medium">
                {movementEvents.filter((e) => e.stoneId === 'DIA-2048').length} recorded
              </span>
            </div>

            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {movementEvents
                .filter((e) => e.stoneId === 'DIA-2048')
                .map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-900 text-[10px]">
                        {evt.eventType}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono font-medium">
                        {formatDateTime(evt.timestamp).split(',')[1] || evt.timestamp}
                      </span>
                    </div>
                    <p className="text-slate-700 leading-snug">{evt.reason}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Actor: <strong className="text-slate-800">{users.find(u => u.id === evt.actorId)?.name || evt.actorId}</strong></span>
                      <span className="font-mono text-slate-600">{evt.deviceChannel}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
