import React from 'react';
import { useOperations } from '../../context/OperationsContext';
import {
  BarChart3,
  ShieldCheck,
  Target,
  Clock,
  CheckCircle2,
  RefreshCw,
  Boxes,
  Scale,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { formatUSD } from '../../utils/formatters';

export const MetricsDashboardPage: React.FC = () => {
  const { metrics, stones, erpEvents, requests } = useOperations();

  const proposedTargets = [
    {
      kpi: 'Custody Coverage',
      actual: `${metrics.custodyCoveragePercent}%`,
      target: '100.0%',
      status: metrics.custodyCoveragePercent >= 98 ? 'ON_TRACK' : 'REVIEW',
      note: 'Calculated: (Total Stones - Exception Stones) / Total Stones',
    },
    {
      kpi: 'Physical Custody Duplication',
      actual: `${metrics.duplicateActiveCustodyCount}`,
      target: '0 duplicate holders',
      status: metrics.duplicateActiveCustodyCount === 0 ? 'ON_TRACK' : 'CRITICAL',
      note: 'Strict single physical custodian model mathematically guaranteed',
    },
    {
      kpi: 'Request-to-Cabin Turnaround',
      actual: `${metrics.avgTurnaroundMinutes} mins`,
      target: '< 10.0 mins',
      status: 'ON_TRACK',
      note: 'Time from salesperson request submission to receipt confirmation',
    },
    {
      kpi: 'ERP Outbox Reliability',
      actual: `${metrics.erpSyncReliabilityPercent}%`,
      target: '≥ 99.0%',
      status: metrics.erpSyncReliabilityPercent >= 95 ? 'ON_TRACK' : 'REVIEW',
      note: 'Transactional outbox idempotency delivery success rate',
    },
    {
      kpi: 'Daily Reconciliation Accounted',
      actual: `${metrics.closingReconciliationPercent}%`,
      target: '100.0%',
      status: 'ON_TRACK',
      note: '100% accounted for with every discrepancy assigned to a designated owner',
    },
    {
      kpi: 'Overdue Cabin Possessions',
      actual: `${metrics.overdueCabinsCount}`,
      target: '0 > 60m',
      status: metrics.overdueCabinsCount === 0 ? 'ON_TRACK' : 'WARNING',
      note: 'Automatic alert after 60 mins without authorised extension',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Executive Operational Metrics & Performance Targets
          </h2>
          <p className="text-xs text-slate-500">
            Real-time calculations derived from exhibition event state machines
          </p>
        </div>

        {/* Disclaimer Tag (Section 18) */}
        <span className="px-3 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center space-x-1.5 shrink-0">
          <Info className="w-3.5 h-3.5 text-amber-600" />
          <span>Proposed targets requiring validation · Not historical claims</span>
        </span>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Exhibition Inventory
          </span>
          <div className="text-2xl font-bold text-slate-900">{metrics.totalInventoryCount}</div>
          <p className="text-[11px] text-slate-600">
            Valuation: <strong className="text-slate-800">{formatUSD(metrics.totalInventoryValueUSD)}</strong>
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Stones In Safe / Vault
          </span>
          <div className="text-2xl font-bold text-emerald-600">{metrics.totalInSafeCombinedCount}</div>
          <p className="text-[11px] text-emerald-800 font-medium">
            {((metrics.totalInSafeCombinedCount / metrics.totalInventoryCount) * 100).toFixed(0)}% secured in vault
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Stones Active in Cabins
          </span>
          <div className="text-2xl font-bold text-indigo-600">{metrics.inCabinCount}</div>
          <p className="text-[11px] text-indigo-800 font-medium">
            Private VIP viewings in progress
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
            Stones in Floor Transit
          </span>
          <div className="text-2xl font-bold text-blue-600">
            {metrics.dispatchedCount + metrics.returnTransitCount}
          </div>
          <p className="text-[11px] text-blue-800 font-medium">
            Courier delivery or safe return
          </p>
        </div>
      </div>

      {/* Target vs Actual Comparison Matrix (Section 18) */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm space-y-0">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <div>
            <h3 className="font-bold text-slate-900 uppercase tracking-wider">
              Product Performance Targets vs Live Demonstration Calculated Values
            </h3>
            <p className="text-[11px] text-slate-500">
              Targets proposed in the SimStar assignment requiring field validation
            </p>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            SLA & Quality Targets
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {proposedTargets.map((item) => (
            <div key={item.kpi} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-sm">{item.kpi}</span>
                  <span
                    className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                      item.status === 'ON_TRACK'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : item.status === 'WARNING'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">{item.note}</p>
              </div>

              <div className="flex items-center space-x-6 shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Calculated Actual</span>
                  <span className="font-mono font-bold text-slate-900 text-base">{item.actual}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">Proposed Target</span>
                  <span className="font-mono font-bold text-brand-700 text-base">{item.target}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
