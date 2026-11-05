import React, { useState } from 'react';
import { useOperations } from '../../context/OperationsContext';
import {
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Boxes,
  MapPin,
  Tag,
  RefreshCw,
  AlertTriangle,
  PlayCircle,
  Eye,
  ScanLine,
  Send,
  UserCheck,
  FileCheck,
  ChevronRight,
  Info,
  Activity,
  User,
  Truck,
  RotateCcw,
} from 'lucide-react';
import {
  formatUSD,
  formatDateTime,
  getPhysicalStatusBadge,
  getCommercialStatusBadge,
} from '../../utils/formatters';
import { BarcodeScanModal } from '../../components/shared/BarcodeScanModal';

export const SplitScreenOverview: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const {
    stones,
    requests,
    movementEvents,
    commercialTransactions,
    erpEvents,
    notifications,
    metrics,
    currentUser,
    openStoneDetail,
    startWalkthrough,
    submitStoneRequest,
    salespersonConfirmReceipt,
    runnerDeliverToCabin,
    requestReturn,
    stockroomConfirmSafeReceipt,
    simulateERPResponse,
  } = useOperations();

  // Selected workflow stage to inspect in the right panel (1 to 9)
  const [selectedStage, setSelectedStage] = useState<number>(2); // Default to Step 2 (Stone Request / Verification)
  const [scanModalRequestId, setScanModalRequestId] = useState<string | null>(null);

  // Focus hero stone: DIA-2048
  const heroStone = stones.find((s) => s.id === 'DIA-2048') || stones[0];
  const heroRequest = requests.find((r) => r.stoneId === heroStone.id);
  const heroTx = commercialTransactions.find((t) => t.stoneId === heroStone.id);
  const heroERP = erpEvents.find((e) => e.stoneId === heroStone.id);

  // Workflow Stages Definition (9 Stages)
  const stages = [
    {
      step: 1,
      name: 'Opening Inventory',
      role: 'Inventory Manager',
      description: 'Opening manifest check-in, seal verification & safe compartment intake.',
      status: 'Completed',
      timestamp: 'Today · 07:30 Basel Time',
      actionRequired: 'All 60 unique diamonds verified against exhibition manifest',
      isCompleted: true,
      roleKey: 'INVENTORY_CONTROLLER',
    },
    {
      step: 2,
      name: 'Stone Request',
      role: 'Salesperson',
      description: 'Salesperson requests diamond DIA-2048 for VIP viewing in Cabin 04.',
      status: heroStone.physicalStatus === 'In Safe' ? 'Pending Action' : 'Completed',
      timestamp: heroRequest ? formatDateTime(heroRequest.createdAt) : 'Pending Submission',
      actionRequired: heroStone.physicalStatus === 'In Safe' ? 'Submit request for Cabin 04' : 'Completed',
      isCompleted: heroStone.physicalStatus !== 'In Safe',
      roleKey: 'SALESPERSON',
    },
    {
      step: 3,
      name: 'Inventory Verification',
      role: 'Inventory Controller',
      description: 'Handheld barcode laser check in stockroom before releasing from vault.',
      status:
        heroRequest?.status === 'Verified' || heroStone.physicalStatus === 'Dispatched' || heroStone.physicalStatus === 'In Cabin'
          ? 'Completed'
          : heroStone.physicalStatus === 'Requested'
          ? 'Active / In Review'
          : 'Pending Previous',
      timestamp: heroRequest?.status === 'Verified' ? formatDateTime(heroRequest.updatedAt) : 'Pending Scan',
      actionRequired: heroStone.physicalStatus === 'Requested' ? 'Perform laser scan (test match or mismatch)' : 'Awaiting request',
      isCompleted:
        heroRequest?.status === 'Verified' || heroStone.physicalStatus === 'Dispatched' || heroStone.physicalStatus === 'In Cabin',
      roleKey: 'INVENTORY_CONTROLLER',
    },
    {
      step: 4,
      name: 'Runner Dispatch',
      role: 'Inventory Controller',
      description: 'Assign floor runner; transfer temporary physical custody for transit.',
      status:
        heroStone.physicalStatus === 'Dispatched' || heroStone.physicalStatus === 'In Cabin'
          ? 'Completed'
          : heroRequest?.status === 'Verified'
          ? 'Active Dispatch'
          : 'Pending',
      timestamp:
        heroStone.physicalStatus === 'Dispatched' || heroStone.physicalStatus === 'In Cabin' ? 'Dispatched' : 'Pending',
      actionRequired: heroRequest?.status === 'Verified' ? 'Assign runner & confirm physical handover' : 'Pending scan match',
      isCompleted: heroStone.physicalStatus === 'Dispatched' || heroStone.physicalStatus === 'In Cabin',
      roleKey: 'INVENTORY_CONTROLLER',
    },
    {
      step: 5,
      name: 'Cabin Receipt',
      role: 'Salesperson',
      description: 'Runner arrives at cabin; salesperson confirms physical custody in app.',
      status:
        heroStone.physicalStatus === 'In Cabin'
          ? 'Completed'
          : heroStone.physicalStatus === 'Dispatched'
          ? 'In Delivery / Handover'
          : 'Pending',
      timestamp: heroStone.cabinPossessionStartedAt ? formatDateTime(heroStone.cabinPossessionStartedAt) : 'Pending Handover',
      actionRequired: heroStone.physicalStatus === 'Dispatched' ? 'Salesperson must confirm physical delivery' : 'Pending arrival',
      isCompleted: heroStone.physicalStatus === 'In Cabin',
      roleKey: 'SALESPERSON',
    },
    {
      step: 6,
      name: 'Commercial Action',
      role: 'Salesperson',
      description: 'Select commercial branch: exclusive Hold, Memo agreement, or firm Sale.',
      status:
        heroStone.commercialStatus !== 'Available'
          ? 'Branch Selected'
          : heroStone.physicalStatus === 'In Cabin'
          ? 'Action Available'
          : 'Pending Custody',
      timestamp: heroTx ? formatDateTime(heroTx.startTimestamp) : 'Awaiting Commercial Action',
      actionRequired:
        heroStone.physicalStatus === 'In Cabin' && heroStone.commercialStatus === 'Available'
          ? 'Choose Hold, Memo, or Sale'
          : 'Completed',
      isCompleted: heroStone.commercialStatus !== 'Available',
      roleKey: 'SALESPERSON',
    },
    {
      step: 7,
      name: 'Return or Sale Flow',
      role: 'Salesperson / Runner',
      description: 'Execute return transit to safe or proceed to commercial settlement.',
      status:
        heroStone.physicalStatus === 'Return Transit' || heroStone.physicalStatus === 'In Safe after return'
          ? 'Return Flow Active'
          : heroStone.commercialStatus === 'Sale Pending ERP'
          ? 'Sale Flow Active'
          : 'Pending Selection',
      timestamp: 'Ongoing',
      actionRequired: 'Process physical return or ERP posting',
      isCompleted: heroStone.commercialStatus === 'ERP Accepted' || heroStone.physicalStatus === 'In Safe after return',
      roleKey: 'SALESPERSON',
    },
    {
      step: 8,
      name: 'ERP Synchronisation',
      role: 'System / Controller',
      description: 'Transactional outbox dispatches event to SAP ERP diamond ledger.',
      status:
        heroStone.commercialStatus === 'ERP Accepted'
          ? 'Accepted'
          : heroStone.commercialStatus === 'Sale Pending ERP'
          ? 'Outbox Pending'
          : 'Awaiting Sale',
      timestamp: heroERP ? formatDateTime(heroERP.lastAttemptAt) : 'Pending ERP Post',
      actionRequired: heroStone.commercialStatus === 'Sale Pending ERP' ? 'Simulate ERP Accepted or Rejection' : 'No pending sale',
      isCompleted: heroStone.commercialStatus === 'ERP Accepted',
      roleKey: 'ADMIN_SUPERVISOR',
    },
    {
      step: 9,
      name: 'Closing Reconciliation',
      role: 'Chief Controller',
      description: 'Full physical count vs manifest; verify safe returns & resolve discrepancies.',
      status: 'Active Audit',
      timestamp: 'Scheduled 18:00 Basel Time',
      actionRequired: 'Scan physical stock & resolve unclosed cabin items',
      isCompleted: false,
      roleKey: 'INVENTORY_CONTROLLER',
    },
  ];

  const physicalBadge = getPhysicalStatusBadge(heroStone.physicalStatus);
  const commercialBadge = getCommercialStatusBadge(heroStone.commercialStatus);

  // Stations for the physical journey pipeline
  const safeCount = metrics.totalInSafeCombinedCount;
  const transitCount = metrics.dispatchedCount;
  const cabinCount = metrics.inCabinCount;
  const returnTransitCount = metrics.returnTransitCount;
  const returnedSafeCount = stones.filter((s) => s.physicalStatus === 'In Safe after return').length;

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto text-slate-900">
      {/* ======================================================== */}
      {/* 1. TOP HEADER BANNER & HERO STONE TELEMETRY              */}
      {/* ======================================================== */}
      <div className="bg-navy-950 text-white rounded-2xl p-5 border border-navy-850 shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30">
              SIGNATURE EXPERIENCE · LIVE FLOOR ENGINE
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-300 font-mono">
              Hero Stone: <strong className="text-white">{heroStone.id}</strong> ({heroStone.carat}ct {heroStone.shape})
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            Operational Overview & Split-Screen Control
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            SimStar operational record enforces strict single-custodian custody, orthogonal commercial state, and transactional outbox ERP reconciliation.
          </p>
        </div>

        {/* Quick action buttons & Stone quick summary */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3 py-1.5 rounded-xl bg-navy-900 border border-navy-800 flex items-center space-x-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Physical Custody</span>
              <span className={`font-semibold ${physicalBadge.text}`}>{heroStone.physicalStatus}</span>
            </div>
            <div className="w-px h-6 bg-navy-800" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Commercial State</span>
              <span className={`font-semibold ${commercialBadge.text}`}>{heroStone.commercialStatus}</span>
            </div>
            <div className="w-px h-6 bg-navy-800" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Custodian</span>
              <span className="font-semibold text-white font-mono">{heroStone.activeCustodianId}</span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('walkthrough')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/30 transition active:scale-95"
          >
            <PlayCircle className="w-4 h-4" />
            <span>START WALKTHROUGH</span>
          </button>
          <button
            onClick={() => onNavigate('role-console')}
            className="px-3.5 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 font-semibold text-xs transition"
          >
            Role Consoles
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. PHYSICAL CUSTODY PIPELINE (STATION FLOW)              */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-brand-600" />
            <span>Physical Custody Station Flow</span>
          </span>
          <span className="text-[11px] text-slate-600">
            Current DIA-2048 Node: <strong className="text-slate-900">{heroStone.currentLocationId}</strong>
          </span>
        </div>

        {/* 6 Stations Horizontal Pipeline */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
          {/* Station 1: Secure Vault */}
          <div
            className={`p-3 rounded-xl border transition ${
              heroStone.physicalStatus === 'In Safe'
                ? 'bg-brand-50/70 border-brand-500 text-slate-900 ring-1 ring-brand-500/30'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-mono font-bold">
              <span>01. Vault Safe</span>
              {heroStone.physicalStatus === 'In Safe' && (
                <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
              )}
            </div>
            <div className="text-base font-bold text-slate-900 mt-1">{safeCount} <span className="text-[10px] font-normal text-slate-600">stones</span></div>
            <div className="text-[10px] text-slate-600 mt-0.5">Custodian: SYSTEM_VAULT</div>
          </div>

          {/* Station 2: Stock Controller */}
          <div
            className={`p-3 rounded-xl border transition ${
              heroStone.physicalStatus === 'Requested'
                ? 'bg-brand-50/70 border-brand-500 text-slate-900 ring-1 ring-brand-500/30'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-mono font-bold">
              <span>02. Controller Gate</span>
              {heroStone.physicalStatus === 'Requested' && (
                <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
              )}
            </div>
            <div className="text-base font-bold text-slate-900 mt-1">{metrics.requestedCount} <span className="text-[10px] font-normal text-slate-600">staged</span></div>
            <div className="text-[10px] text-slate-600 mt-0.5">Laser Barcode Check</div>
          </div>

          {/* Station 3: Courier Transit */}
          <div
            className={`p-3 rounded-xl border transition ${
              heroStone.physicalStatus === 'Dispatched'
                ? 'bg-brand-50/70 border-brand-500 text-slate-900 ring-1 ring-brand-500/30'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-mono font-bold">
              <span>03. Courier Transit</span>
              {heroStone.physicalStatus === 'Dispatched' && (
                <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
              )}
            </div>
            <div className="text-base font-bold text-slate-900 mt-1">{transitCount} <span className="text-[10px] font-normal text-slate-600">en route</span></div>
            <div className="text-[10px] text-slate-600 mt-0.5">Courier Cassette Transit</div>
          </div>

          {/* Station 4: Salesperson Cabin */}
          <div
            className={`p-3 rounded-xl border transition ${
              heroStone.physicalStatus === 'In Cabin'
                ? 'bg-brand-50/70 border-brand-500 text-slate-900 ring-1 ring-brand-500/30'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-mono font-bold">
              <span>04. VIP Cabin</span>
              {heroStone.physicalStatus === 'In Cabin' && (
                <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
              )}
            </div>
            <div className="text-base font-bold text-slate-900 mt-1">{cabinCount} <span className="text-[10px] font-normal text-slate-600">viewing</span></div>
            <div className="text-[10px] text-slate-600 mt-0.5">Cabin 04 · Priya Shah</div>
          </div>

          {/* Station 5: Return Transit */}
          <div
            className={`p-3 rounded-xl border transition ${
              heroStone.physicalStatus === 'Return Requested' || heroStone.physicalStatus === 'Return Transit'
                ? 'bg-brand-50/70 border-brand-500 text-slate-900 ring-1 ring-brand-500/30'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-mono font-bold">
              <span>05. Return Courier</span>
              {(heroStone.physicalStatus === 'Return Requested' || heroStone.physicalStatus === 'Return Transit') && (
                <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
              )}
            </div>
            <div className="text-base font-bold text-slate-900 mt-1">{returnTransitCount + metrics.returnRequestedCount} <span className="text-[10px] font-normal text-slate-600">in return</span></div>
            <div className="text-[10px] text-slate-600 mt-0.5">Courier Collection</div>
          </div>

          {/* Station 6: Vault Intake */}
          <div
            className={`p-3 rounded-xl border transition ${
              heroStone.physicalStatus === 'In Safe after return'
                ? 'bg-brand-50/70 border-brand-500 text-slate-900 ring-1 ring-brand-500/30'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase font-mono font-bold">
              <span>06. Vault Intake</span>
              {heroStone.physicalStatus === 'In Safe after return' && (
                <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
              )}
            </div>
            <div className="text-base font-bold text-slate-900 mt-1">{returnedSafeCount} <span className="text-[10px] font-normal text-slate-600">secured</span></div>
            <div className="text-[10px] text-slate-600 mt-0.5">Safe Scan Closes Custody</div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN SPLIT-SCREEN GRID (5 COLS LEFT | 7 COLS RIGHT)    */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* LEFT PANEL — CONNECTED WORKFLOW TIMELINE (5 Cols)        */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-brand-600" />
                <span>Operational Workflow Journey</span>
              </h3>
              <p className="text-[11px] text-slate-600">
                Connected 9-stage sequence with verified role ownership
              </p>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Select stage to inspect
            </span>
          </div>

          {/* Connected Vertical Timeline */}
          <div className="relative pl-6 space-y-3.5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {stages.map((stage) => {
              const isSelected = selectedStage === stage.step;
              const isCompleted = stage.isCompleted;

              return (
                <div
                  key={stage.step}
                  onClick={() => setSelectedStage(stage.step)}
                  className={`relative cursor-pointer rounded-xl p-3.5 transition border ${
                    isSelected
                      ? 'bg-brand-50/60 border-brand-500 shadow-sm ring-1 ring-brand-500/30'
                      : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-[27px] top-4 w-4 h-4 rounded-full border-2 flex items-center justify-center text-[9px] font-bold transition ${
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : isSelected
                        ? 'bg-brand-600 border-white ring-2 ring-brand-500 text-white'
                        : 'bg-white border-slate-400 text-slate-600'
                    }`}
                  >
                    {isCompleted ? '✓' : stage.step}
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Stage {stage.step}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-semibold">
                          {stage.role}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{stage.name}</h4>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        isCompleted
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : isSelected
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {stage.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-700 mt-1 leading-snug">
                    {stage.description}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-mono font-medium">{stage.timestamp}</span>
                    <span className="text-slate-800 font-medium truncate max-w-[200px]">
                      {stage.actionRequired}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT PANEL — LIVE OPERATIONAL STATUS (7 Cols)          */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top Floor KPI Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Exhibition Stock
              </span>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-xl font-bold text-slate-900">{metrics.totalInventoryCount}</span>
                <span className="text-xs text-slate-600">diamonds</span>
              </div>
              <span className="text-[10px] text-brand-700 font-semibold">
                {formatUSD(metrics.totalInventoryValueUSD)} total value
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Custody Coverage
              </span>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-xl font-bold text-emerald-700">{metrics.custodyCoveragePercent}%</span>
              </div>
              <span className="text-[10px] text-emerald-800 font-semibold">
                Active Holders: 1 per diamond
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                ERP Sync Reliability
              </span>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-xl font-bold text-sky-700">{metrics.erpSyncReliabilityPercent}%</span>
              </div>
              <span className="text-[10px] text-slate-600">
                Transactional Outbox Bridge
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Active Exceptions
              </span>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className={`text-xl font-bold ${metrics.exceptionCount > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
                  {metrics.exceptionCount}
                </span>
                <span className="text-xs text-slate-600">flagged</span>
              </div>
              <span className="text-[10px] text-slate-600">
                Mandatory owner assigned
              </span>
            </div>
          </div>

          {/* TWO SEPARATE STATUS DIMENSIONS (CRITICAL PRINCIPLE 3) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-teal-600" />
                  <span>Orthogonal Status Breakdown (Physical vs Commercial)</span>
                </h3>
                <p className="text-[11px] text-slate-600">
                  Physical custody and commercial state are independent operational dimensions
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                No Mixed Status Fields
              </span>
            </div>

            {/* Dimension 1: PHYSICAL CUSTODY COUNTS */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  <span>Physical Custody Dimension (Mutually Exclusive)</span>
                </span>
                <span className="text-[11px] text-slate-600 font-medium">
                  Sum = <strong className="text-slate-900">{metrics.totalPhysicalReconciledCount}</strong> / {metrics.totalInventoryCount} Reconciled
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-emerald-900">
                  <span className="text-[10px] text-emerald-800 block uppercase font-bold">In Safe</span>
                  <span className="text-base font-bold text-slate-950">{metrics.totalInSafeCombinedCount}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-sky-50/80 border border-sky-200 text-sky-900">
                  <span className="text-[10px] text-sky-800 block uppercase font-bold">Requested</span>
                  <span className="text-base font-bold text-slate-950">{metrics.requestedCount}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50/80 border border-blue-200 text-blue-900">
                  <span className="text-[10px] text-blue-800 block uppercase font-bold">Dispatched</span>
                  <span className="text-base font-bold text-slate-950">{metrics.dispatchedCount}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-indigo-50/80 border border-indigo-200 text-indigo-900">
                  <span className="text-[10px] text-indigo-800 block uppercase font-bold">In Cabin</span>
                  <span className="text-base font-bold text-slate-950">{metrics.inCabinCount}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900">
                  <span className="text-[10px] text-amber-800 block uppercase font-bold">Return Requested</span>
                  <span className="text-base font-bold text-slate-950">{metrics.returnRequestedCount}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-orange-50/80 border border-orange-200 text-orange-900">
                  <span className="text-[10px] text-orange-800 block uppercase font-bold">Return Transit</span>
                  <span className="text-base font-bold text-slate-950">{metrics.returnTransitCount}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-teal-50/80 border border-teal-200 text-teal-900">
                  <span className="text-[10px] text-teal-800 block uppercase font-bold">Safe after Return</span>
                  <span className="text-base font-bold text-slate-950">{returnedSafeCount}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-rose-50/80 border border-rose-200 text-rose-900">
                  <span className="text-[10px] text-rose-800 block uppercase font-bold">Custody Exception</span>
                  <span className="text-base font-bold text-slate-950">{metrics.exceptionCount}</span>
                </div>
              </div>
            </div>

            {/* Dimension 2: COMMERCIAL STATE COUNTS */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Commercial State Dimension</span>
                </span>
                <span className="text-[11px] text-slate-600 font-normal">
                  Orthogonal commercial rights
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-green-50/80 border border-green-200 text-green-900">
                  <span className="text-[10px] text-green-800 block uppercase font-bold">Available</span>
                  <span className="text-base font-bold text-slate-950">{metrics.availableCount}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900">
                  <span className="text-[10px] text-amber-800 block uppercase font-bold">On Hold</span>
                  <span className="text-base font-bold text-slate-950">{metrics.onHoldCount}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-purple-50/80 border border-purple-200 text-purple-900">
                  <span className="text-[10px] text-purple-800 block uppercase font-bold">On Memo</span>
                  <span className="text-base font-bold text-slate-950">{metrics.onMemoCount}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50/80 border border-blue-200 text-blue-900">
                  <span className="text-[10px] text-blue-800 block uppercase font-bold">Sale Pending ERP</span>
                  <span className="text-base font-bold text-slate-950">{metrics.salePendingERPCount}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-teal-50/80 border border-teal-200 text-teal-900">
                  <span className="text-[10px] text-teal-800 block uppercase font-bold">ERP Accepted</span>
                  <span className="text-base font-bold text-slate-950">{metrics.erpAcceptedCount}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-rose-50/80 border border-rose-200 text-rose-900">
                  <span className="text-[10px] text-rose-800 block uppercase font-bold">Requires Review</span>
                  <span className="text-base font-bold text-slate-950">{metrics.requiresReviewCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* INSPECTED STAGE INTERACTIVE ACTION PANEL */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-brand-500 text-white font-bold text-xs flex items-center justify-center">
                  {selectedStage}
                </span>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Live Stage Action: {stages[selectedStage - 1].name}
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Target Stone: <strong className="text-white">DIA-2048</strong> · Responsible: {stages[selectedStage - 1].role}
                  </p>
                </div>
              </div>

              <button
                onClick={() => openStoneDetail('DIA-2048')}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-brand-300 text-xs font-medium flex items-center space-x-1 border border-slate-700 transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect Stone 360°</span>
              </button>
            </div>

            {/* Contextual actions based on current selected stage */}
            <div className="space-y-3">
              {/* Stage 2 Action: Request Stone */}
              {selectedStage === 2 && (
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
                  <p className="text-xs text-slate-200">
                    Salesperson requests DIA-2048 for Cabin 04. Validates that stone is available in safe.
                  </p>
                  {heroStone.physicalStatus === 'In Safe' ? (
                    <button
                      onClick={() => submitStoneRequest('DIA-2048', 'CABIN-04', 'VIP Immediate')}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white flex items-center space-x-2 transition shadow-sm active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Request for DIA-2048 (Cabin 04)</span>
                    </button>
                  ) : (
                    <div className="text-xs text-emerald-400 flex items-center space-x-1.5 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Request already submitted (Status: {heroStone.physicalStatus})</span>
                    </div>
                  )}
                </div>
              )}

              {/* Stage 3 Action: Barcode Verification */}
              {selectedStage === 3 && (
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
                  <p className="text-xs text-slate-200">
                    Inventory Controller performs laser scan check. You can test both correct scan and mismatch block.
                  </p>
                  <button
                    onClick={() => {
                      if (heroRequest) {
                        setScanModalRequestId(heroRequest.id);
                      } else {
                        alert('Please submit request first in Stage 2.');
                      }
                    }}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white flex items-center space-x-2 transition shadow-sm active:scale-95"
                  >
                    <ScanLine className="w-3.5 h-3.5" />
                    <span>Open Handheld Barcode Laser Scanner</span>
                  </button>
                </div>
              )}

              {/* Stage 5 Action: Salesperson Confirm Receipt */}
              {selectedStage === 5 && (
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 space-y-3">
                  <p className="text-xs text-slate-200">
                    Runner arrived at cabin. Salesperson must acknowledge physical delivery before custody transfers.
                  </p>
                  {heroStone.physicalStatus === 'Dispatched' && heroRequest ? (
                    <button
                      onClick={() => salespersonConfirmReceipt(heroRequest.id)}
                      className="px-4 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-2 transition shadow-sm active:scale-95"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Confirm Physical Handover (Salesperson Acceptance)</span>
                    </button>
                  ) : heroStone.physicalStatus === 'In Cabin' ? (
                    <div className="text-xs text-emerald-400 flex items-center space-x-1.5 font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Physical custody confirmed In Cabin 04.</span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">
                      Current physical status: {heroStone.physicalStatus}. Advance dispatch first.
                    </p>
                  )}
                </div>
              )}

              {/* Generic Stage Information for others */}
              {selectedStage !== 2 && selectedStage !== 3 && selectedStage !== 5 && (
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Current DIA-2048 Physical State:</span>
                    <span className="font-semibold text-white">{heroStone.physicalStatus}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Current DIA-2048 Commercial State:</span>
                    <span className="font-semibold text-white">{heroStone.commercialStatus}</span>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={() => onNavigate('walkthrough')}
                      className="text-brand-400 hover:text-brand-300 text-xs font-semibold flex items-center space-x-1"
                    >
                      <span>Jump to full guided scenario player</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Barcode Laser Modal if open */}
      {scanModalRequestId && (
        <BarcodeScanModal
          requestId={scanModalRequestId}
          onClose={() => setScanModalRequestId(null)}
          onSuccessDispatch={() => setSelectedStage(4)}
        />
      )}
    </div>
  );
};
