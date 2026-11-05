import React from 'react';
import { useOperations } from '../../context/OperationsContext';
import {
  X,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ShieldCheck,
  MapPin,
  Tag,
  RefreshCw,
  Scale,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Lock,
  Layers,
  ArrowRight,
  Boxes,
  Truck,
  UserCheck,
} from 'lucide-react';
import { formatUSD } from '../../utils/formatters';

export const PresentationMode: React.FC = () => {
  const {
    presentationSlide,
    nextPresentationSlide,
    prevPresentationSlide,
    jumpToPresentationSlide,
    exitPresentation,
    resetDemoData,
    stones,
    metrics,
  } = useOperations();

  const heroStone = stones.find((s) => s.id === 'DIA-2048') || stones[0];

  const slides = [
    {
      index: 0,
      section: '1. Business Problem',
      title: 'High-Value Diamond Operations at Global Exhibitions',
      tagline: 'Multi-million dollar inventory moving rapidly across crowded exhibition floors without unified operational tracking creates extreme custody risk.',
      whyThisMatters: 'During Basel and Geneva diamond exhibitions, salespeople urgently pull one-of-a-kind rare diamonds for private VIP rooms. Traditional ERPs are designed for warehouses and lack real-time floor physical custody controls, leading to misplaced stones, untracked couriers, and commercial disputes.',
      visualDemo: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 space-y-1.5">
            <div className="text-rose-400 font-bold uppercase text-[10px]">The Operational Challenge</div>
            <div className="text-sm font-bold text-white">Rapid Cabin Pulls</div>
            <p className="text-[11px] text-slate-400">Multiple salespeople simultaneously competing for the same rare 2+ carat stones for VIP clients.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 space-y-1.5">
            <div className="text-amber-400 font-bold uppercase text-[10px]">The Custody Gap</div>
            <div className="text-sm font-bold text-white">Blind Transit Floor</div>
            <p className="text-[11px] text-slate-400">Couriers physically transporting cassettes between vault and VIP cabins without verified digital handover.</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 space-y-1.5">
            <div className="text-sky-400 font-bold uppercase text-[10px]">The Integration Risk</div>
            <div className="text-sm font-bold text-white">ERP Outages & Double Selling</div>
            <p className="text-[11px] text-slate-400">Unreliable exhibition hall Wi-Fi causing silent ERP transaction failures and unconfirmed floor promises.</p>
          </div>
        </div>
      ),
    },
    {
      index: 1,
      section: '2. Product Recommendation',
      title: 'Complementary Expo Floor Operations Engine',
      tagline: 'A fast, real-time operational layer that complements the central ERP without replacing official accounting or customer records.',
      whyThisMatters: 'The application acts as a high-speed execution front-end on the exhibition floor. It guarantees time-stamped custody, enforces barcode checks, and reliably queues commercial transactions into a transactional outbox for guaranteed ERP sync.',
      visualDemo: (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center justify-between text-slate-300">
            <span className="font-bold text-brand-300">7 Core Product Principles Embedded in System Architecture:</span>
            <span className="text-[10px] text-emerald-400 font-semibold">100% Enforced</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded bg-slate-800/80 text-slate-300">1. One stone, one unique identity.</div>
            <div className="p-2 rounded bg-slate-800/80 text-slate-300">2. One active physical custodian at a time.</div>
            <div className="p-2 rounded bg-slate-800/80 text-slate-300">3. Physical custody & commercial state are separate.</div>
            <div className="p-2 rounded bg-slate-800/80 text-slate-300">4. Every event has actor, timestamp & outcome.</div>
            <div className="p-2 rounded bg-slate-800/80 text-slate-300">5. Stale/unconfirmed data never shown as current.</div>
            <div className="p-2 rounded bg-slate-800/80 text-slate-300">6. Floor sale not posted until ERP confirms acceptance.</div>
            <div className="p-2 rounded bg-slate-800/80 text-slate-300 col-span-full">7. Return not complete until stockroom confirms physical safe receipt.</div>
          </div>
        </div>
      ),
    },
    {
      index: 2,
      section: '3. Operational Workflow',
      title: 'Connected 9-Stage Operational Journey',
      tagline: 'From opening inventory intake to closing reconciliation, every physical movement requires authorized verification.',
      whyThisMatters: 'Breaking the workflow into 9 distinct stages prevents operational shortcuts. A diamond cannot be dispatched without a laser barcode check, and custody cannot shift to a salesperson until they physically confirm delivery in the cabin.',
      visualDemo: (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
            <span>Stage 1 - 9 Workflow Sequence</span>
            <span className="text-brand-400">Strict Sequence Validation</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-9 gap-1 text-[10px] text-center font-medium">
            <div className="p-1.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800">1. Opening</div>
            <div className="p-1.5 rounded bg-brand-950/80 text-brand-300 border border-brand-800">2. Request</div>
            <div className="p-1.5 rounded bg-brand-950/80 text-brand-300 border border-brand-800">3. Verify</div>
            <div className="p-1.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800">4. Dispatch</div>
            <div className="p-1.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800">5. Receipt</div>
            <div className="p-1.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800">6. Commercial</div>
            <div className="p-1.5 rounded bg-orange-950/80 text-orange-300 border border-orange-800">7. Return/Sale</div>
            <div className="p-1.5 rounded bg-sky-950/80 text-sky-300 border border-sky-800">8. ERP Sync</div>
            <div className="p-1.5 rounded bg-teal-950/80 text-teal-300 border border-teal-800">9. Recon</div>
          </div>
        </div>
      ),
    },
    {
      index: 3,
      section: '4. Role Responsibilities',
      title: 'Three Distinct Operational Personas',
      tagline: 'Clear boundaries between Stock Controller, Salesperson, and Runner eliminate ambiguity and enforce custody accountability.',
      whyThisMatters: 'By tailoring interfaces to specific roles, each participant sees only what is relevant to their job while upholding security protocols. A runner cannot close a safe return, and a salesperson cannot dispatch a diamond without controller approval.',
      visualDemo: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 space-y-1">
            <div className="font-bold text-white text-sm">Stock Controller</div>
            <div className="text-[10px] text-brand-300 font-mono">Ananya Rao</div>
            <p className="text-[11px] text-slate-400">Vault security, barcode scanning, runner dispatch, safe return verification, closing audit.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 space-y-1">
            <div className="font-bold text-white text-sm">Account Salesperson</div>
            <div className="text-[10px] text-indigo-300 font-mono">Priya Shah (Cabin 04)</div>
            <p className="text-[11px] text-slate-400">Viewing requests, delivery receipt confirmation, authorised Hold/Memo/Sale, return initiation.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 space-y-1">
            <div className="font-bold text-white text-sm">Floor Runner</div>
            <div className="text-[10px] text-teal-300 font-mono">Arjun Kumar</div>
            <p className="text-[11px] text-slate-400">Mobile console, transit custody, delivery handover, cabin return collection.</p>
          </div>
        </div>
      ),
    },
    {
      index: 4,
      section: '5. Live Stone Simulation',
      title: 'Deterministic State Engine for DIA-2048',
      tagline: 'Simulated walkthrough moves a 2.10ct D VVS1 diamond through realistic requests, scans, handovers, and sales.',
      whyThisMatters: 'Rather than showing static mockups, the application runs a live state machine. Every click produces an immutable movement event, updates mutual inventory counts, and triggers notifications in real time.',
      visualDemo: (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
          <div>
            <span className="font-mono font-bold text-base text-brand-400">DIA-2048</span>
            <span className="text-slate-400 ml-2">2.10ct Round D VVS1 · Est. {formatUSD(heroStone.estimatedValueUSD)}</span>
            <div className="text-[11px] text-slate-300 mt-1">
              Physical: <strong className="text-white">{heroStone.physicalStatus}</strong> · Commercial: <strong className="text-white">{heroStone.commercialStatus}</strong>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
            Live State Machine Active
          </span>
        </div>
      ),
    },
    {
      index: 5,
      section: '6. Physical vs Commercial State',
      title: 'Two Separate Operational Dimensions',
      tagline: 'Physical location and commercial rights are completely orthogonal and never collapsed into a single status field.',
      whyThisMatters: 'A diamond can be physically In Cabin while commercially On Hold, or physically in safe while commercially ERP Accepted. Collapsing physical and commercial states creates catastrophic errors where sold stones are thought to be in the safe or vice versa.',
      visualDemo: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-brand-400 font-bold uppercase text-[10px] flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>Physical Custody Dimension</span>
            </span>
            <p className="text-slate-300 text-[11px]">
              Unloaded → In Safe → Requested → Dispatched → In Cabin → Return Requested → Return Transit → Safe (Returned)
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-indigo-400 font-bold uppercase text-[10px] flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>Commercial State Dimension</span>
            </span>
            <p className="text-slate-300 text-[11px]">
              Available → Hold (Exclusive Timer) → Memo (Signed Consignment) → Sale Pending ERP → ERP Accepted
            </p>
          </div>
        </div>
      ),
    },
    {
      index: 6,
      section: '7. Exception Handling',
      title: 'Security Guardrails & Proactive Exceptions',
      tagline: 'Automated blocks prevent barcode mismatches, duplicate active custodians, and premature custody transfers.',
      whyThisMatters: 'In a high-pressure exhibition, humans make mistakes under time pressure. The system prevents mistakes by physically locking dispatch if a scanned cassette does not match the requested stone ID and notifying security immediately.',
      visualDemo: (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
          <div className="font-bold text-rose-400 flex items-center gap-1.5 text-xs">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>Barcode Laser Check Demo: Correct Scan vs Mismatch Block</span>
          </div>
          <p className="text-[11px] text-slate-300">
            A wrong barcode immediately halts the dispatch gate, logs event <code>MOV-VERIF-MISMATCH</code>, preserves the request, and alerts Chief Controller Ananya Rao.
          </p>
        </div>
      ),
    },
    {
      index: 7,
      section: '8. ERP Integration',
      title: 'Transactional Outbox & Idempotent Sync',
      tagline: 'Floor transactions are captured in a local outbox with sequence numbers and unique idempotency keys before posting to ERP.',
      whyThisMatters: 'Exhibition centers frequently suffer network disruptions. The transactional outbox pattern guarantees that network timeouts never result in double sales or lost orders. Retries update the existing event without duplicating business transactions.',
      visualDemo: (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between text-sky-400 font-mono text-[11px]">
            <span>POST /v2/sales-orders · Idempotency-Key: IDEMP-DIA-2048-SALE</span>
            <span>HTTP 200 OK</span>
          </div>
          <p className="text-[11px] text-slate-300">
            Crucial principle: <strong>Sale Pending ERP</strong> is not officially posted until the central SAP ledger responds with an Accepted confirmation code.
          </p>
        </div>
      ),
    },
    {
      index: 8,
      section: '9. Reconciliation',
      title: '100% Accounted Manifest Reconciliation',
      tagline: 'Daily opening and closing reconciliations verify that every single stone is in the safe, in a cabin, or accounted for with an assigned owner.',
      whyThisMatters: 'No exhibition day can close with missing inventory. The reconciliation module flags unclosed cabin viewings, transit delays, and tag discrepancies, requiring a designated controller to sign off on resolution notes.',
      visualDemo: (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
          <div>
            <div className="font-bold text-white">Daily Closing Audit Matrix</div>
            <div className="text-[11px] text-slate-400">60 Manifest Diamonds · 0 Untracked Stones · CSV Export Ready</div>
          </div>
          <span className="px-3 py-1 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold">
            Reconciliation 100% Matched
          </span>
        </div>
      ),
    },
    {
      index: 9,
      section: '10. Success Metrics',
      title: 'Operational Targets & Performance Governance',
      tagline: 'Clear operational metrics proposed for validation: 100% custody coverage, 0 duplicate active holders, and sub-10 minute turnaround.',
      whyThisMatters: 'These proposed targets give management measurable goals to evaluate exhibition performance without inventing historical claims. The real-time metric cards reflect actual live event calculations across the floor.',
      visualDemo: (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
            <span className="text-[9px] text-slate-400 block uppercase">Custody Coverage</span>
            <span className="font-bold text-emerald-400 text-sm">100.0% Target</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
            <span className="text-[9px] text-slate-400 block uppercase">Duplicate Custody</span>
            <span className="font-bold text-emerald-400 text-sm">0 Holders</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
            <span className="text-[9px] text-slate-400 block uppercase">Turnaround</span>
            <span className="font-bold text-brand-400 text-sm">&lt; 10 Mins</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
            <span className="text-[9px] text-slate-400 block uppercase">ERP Reliability</span>
            <span className="font-bold text-sky-400 text-sm">≥ 99.0%</span>
          </div>
        </div>
      ),
    },
  ];

  const currentSlide = slides[presentationSlide];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-hidden select-none">
      {/* Top Bar */}
      <div className="px-6 py-4 bg-navy-950 border-b border-navy-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold text-xs">
            {presentationSlide + 1}
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">
              Product Strategy & Operational Architecture Presentation
            </h1>
            <p className="text-[11px] text-slate-400">
              Interviewer Walkthrough · Slide {presentationSlide + 1} of 10
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (window.confirm('Reset presentation back to Slide 1?')) {
                jumpToPresentationSlide(0);
              }
            }}
            className="p-2 rounded-lg bg-navy-900 hover:bg-navy-800 text-slate-400 hover:text-white transition"
            title="Reset to Slide 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={exitPresentation}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
          >
            <X className="w-4 h-4" />
            <span>Exit Presentation</span>
          </button>
        </div>
      </div>

      {/* Main Slide Stage */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12 flex items-center justify-center">
        <div className="w-full max-w-4xl space-y-6">
          {/* Slide Category & Number */}
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              {currentSlide.section}
            </span>
          </div>

          {/* Slide Heading & Tagline */}
          <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {currentSlide.title}
            </h2>
            <p className="text-base text-slate-300 leading-relaxed max-w-3xl">
              {currentSlide.tagline}
            </p>
          </div>

          {/* Visual Demonstration Block */}
          <div className="pt-2">
            {currentSlide.visualDemo}
          </div>

          {/* "Why This Matters" Business Control Callout */}
          <div className="p-4 rounded-2xl bg-navy-900/90 border border-teal-500/30 text-xs space-y-1.5 shadow-lg">
            <div className="flex items-center space-x-2 text-teal-400 font-bold uppercase tracking-wider text-[10px]">
              <Lightbulb className="w-4 h-4 text-teal-400" />
              <span>Why This Matters · Product & Business Control</span>
            </div>
            <p className="text-slate-200 leading-relaxed text-[12px]">
              {currentSlide.whyThisMatters}
            </p>
          </div>
        </div>
      </div>

      {/* Slide Navigation Bottom Bar */}
      <div className="px-6 py-4 bg-navy-950 border-t border-navy-800 flex items-center justify-between">
        <button
          onClick={prevPresentationSlide}
          disabled={presentationSlide === 0}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 disabled:opacity-30 disabled:pointer-events-none text-slate-200 text-xs font-semibold transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {/* Slide Progress Dots */}
        <div className="flex items-center space-x-1.5">
          {slides.map((s) => (
            <button
              key={s.index}
              onClick={() => jumpToPresentationSlide(s.index)}
              className={`h-2 rounded-full transition-all ${
                presentationSlide === s.index
                  ? 'w-8 bg-teal-400'
                  : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextPresentationSlide}
          disabled={presentationSlide === slides.length - 1}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-30 disabled:pointer-events-none text-white text-xs font-bold transition shadow-md shadow-teal-600/30"
        >
          <span>Next Slide</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
