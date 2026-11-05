import React from 'react';
import { useOperations } from '../../context/OperationsContext';
import {
  LayoutDashboard,
  PlayCircle,
  ClipboardList,
  Boxes,
  ArrowLeftRight,
  Tag,
  Scale,
  RefreshCw,
  Bell,
  BarChart3,
  UserCog,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const {
    currentUser,
    notifications,
    metrics,
    resetDemoData,
  } = useOperations();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    {
      id: 'overview',
      label: 'Split-Screen Ops',
      subtitle: 'Primary Workflow Engine',
      icon: LayoutDashboard,
      badge: 'Core',
    },
    {
      id: 'walkthrough',
      label: 'Guided Scenario',
      subtitle: 'DIA-2048 Walkthrough',
      icon: PlayCircle,
      badge: '9 Steps',
    },
    {
      id: 'role-console',
      label: 'Role-Based Consoles',
      subtitle: 'Controller / Sales / Runner',
      icon: UserCog,
      badge: currentUser.role.split('_')[0],
    },
    {
      id: 'requests',
      label: 'Requests Board',
      subtitle: 'Cabin Viewing Queue',
      icon: ClipboardList,
      count: metrics.activeRequestsCount,
    },
    {
      id: 'inventory',
      label: 'Diamond Inventory',
      subtitle: 'Catalog & 4Cs Specs',
      icon: Boxes,
      count: metrics.totalInventoryCount,
    },
    {
      id: 'custody',
      label: 'Custody Movements',
      subtitle: 'Single Custodian Ledger',
      icon: ArrowLeftRight,
    },
    {
      id: 'commercial',
      label: 'Hold / Memo / Sale',
      subtitle: 'Commercial States',
      icon: Tag,
      badge: `${metrics.onHoldCount}H · ${metrics.onMemoCount}M`,
    },
    {
      id: 'reconciliation',
      label: 'Reconciliation',
      subtitle: 'Opening & Closing Audits',
      icon: Scale,
    },
    {
      id: 'erp',
      label: 'ERP Synchronisation',
      subtitle: 'Transactional Outbox',
      icon: RefreshCw,
      badge: `${metrics.erpSyncReliabilityPercent}%`,
    },
    {
      id: 'exceptions',
      label: 'Exception Center',
      subtitle: 'Security & Mismatches',
      icon: AlertTriangle,
      count: metrics.exceptionCount,
      isAlert: metrics.exceptionCount > 0,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      subtitle: 'Operational Feed',
      icon: Bell,
      count: unreadCount,
    },
    {
      id: 'metrics',
      label: 'Management KPIs',
      subtitle: 'Targets & Performance',
      icon: BarChart3,
    },
  ];

  return (
    <aside className="w-64 bg-navy-950 text-slate-300 flex flex-col justify-between shrink-0 select-none border-r border-navy-800">
      {/* Top Section: Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Floor Operations
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition group ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-navy-900 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3 text-left min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand-400'
                  }`}
                />
                <div className="truncate">
                  <div className="leading-tight">{item.label}</div>
                  <div
                    className={`text-[10px] leading-tight truncate ${
                      isActive ? 'text-brand-100' : 'text-slate-400'
                    }`}
                  >
                    {item.subtitle}
                  </div>
                </div>
              </div>

              {/* Badge or Counter */}
              <div className="shrink-0 ml-2">
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      item.isAlert
                        ? 'bg-rose-500 text-white animate-pulse'
                        : isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-navy-800 text-slate-300'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-navy-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Section: Active User & Environment Card */}
      <div className="p-3 border-t border-navy-800/80 bg-navy-900/60 space-y-2.5">
        {/* Environment Indicator */}
        <div className="px-2.5 py-2 rounded-md bg-navy-950/80 border border-navy-800 text-[11px]">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold">Environment</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          </div>
          <div className="font-semibold text-slate-200">Basel Exhibition Hall 2</div>
          <div className="text-[10px] text-slate-400">Vault Safe A · 8 VIP Cabins</div>
        </div>

        {/* Current User Card */}
        <div className="px-2.5 py-2 rounded-md bg-navy-800/60 border border-navy-700/60 flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-brand-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
              {currentUser.avatarInitials}
            </div>
            <div className="min-w-0 text-left">
              <div className="text-xs font-semibold text-slate-100 truncate">{currentUser.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{currentUser.title}</div>
            </div>
          </div>
        </div>

        {/* Quick Reset Button */}
        <button
          onClick={() => {
            if (window.confirm('Reset all demo state back to default?')) {
              resetDemoData();
            }
          }}
          className="w-full flex items-center justify-center space-x-1.5 px-2 py-1.5 rounded text-[11px] text-slate-400 hover:text-slate-200 hover:bg-navy-800 transition border border-transparent hover:border-navy-700"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </aside>
  );
};
