import React, { useState } from 'react';
import { useOperations } from '../../context/OperationsContext';
import {
  X,
  Bell,
  CheckCheck,
  Filter,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Shield,
  Truck,
  UserCheck,
  Boxes,
} from 'lucide-react';
import { formatDateTime, getSeverityBadge } from '../../utils/formatters';

export const NotificationCenterDrawer: React.FC = () => {
  const {
    isNotificationDrawerOpen,
    toggleNotificationDrawer,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    openStoneDetail,
    setActiveView,
    users,
  } = useOperations();

  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterRecipient, setFilterRecipient] = useState<string>('ALL');

  if (!isNotificationDrawerOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    const matchesSeverity =
      filterSeverity === 'ALL' || n.severity.toUpperCase() === filterSeverity;
    const matchesRecipient =
      filterRecipient === 'ALL' ||
      (n.recipient && n.recipient.toUpperCase() === filterRecipient) ||
      (!n.recipient && filterRecipient === 'ALL');
    return matchesSeverity && matchesRecipient;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getRecipientBadge = (recipient?: string) => {
    switch (recipient) {
      case 'INVENTORY_CONTROLLER':
        return { label: 'To: Controller', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'SALESPERSON':
        return { label: 'To: Salesperson', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'RUNNER':
        return { label: 'To: Runner', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'ADMIN_SUPERVISOR':
        return { label: 'To: Supervisor', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'ALL':
      default:
        return { label: 'Broadcast: All', bg: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end">
      <div
        className="relative w-full max-w-lg bg-white shadow-2xl h-full flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-navy-950 text-white flex items-center justify-between border-b border-navy-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-navy-800 text-brand-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Operational Event Feed
                </h2>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-500 text-white">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Event-driven alerts across stockroom, floor runners, cabins & ERP
              </p>
            </div>
          </div>

          <button
            onClick={toggleNotificationDrawer}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar: Recipient tabs */}
        <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-1 text-[11px] overflow-x-auto">
          <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0 mr-1">Recipient:</span>
          <div className="flex items-center space-x-1 shrink-0">
            {[
              { id: 'ALL', label: 'All Roles' },
              { id: 'INVENTORY_CONTROLLER', label: 'Controller' },
              { id: 'SALESPERSON', label: 'Sales' },
              { id: 'RUNNER', label: 'Runner' },
              { id: 'ADMIN_SUPERVISOR', label: 'Supervisor' },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => setFilterRecipient(r.id)}
                className={`px-2 py-0.5 rounded font-medium transition ${
                  filterRecipient === r.id
                    ? 'bg-navy-900 text-white font-bold'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter bar: Severity tabs & Mark All Read */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-1 overflow-x-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
            {['ALL', 'INFO', 'SUCCESS', 'WARNING', 'ERROR'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
                  filterSeverity === sev
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="text-[11px] text-brand-600 hover:text-brand-800 font-medium flex items-center space-x-1 shrink-0"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* List of Notifications */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No notifications matching the selected filters.
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const actor = users.find((u) => u.id === notif.actorId)?.name || notif.actorId;
              const recipBadge = getRecipientBadge(notif.recipient);

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationAsRead(notif.id);
                  }}
                  className={`p-3.5 rounded-xl transition text-xs border ${
                    notif.read
                      ? 'bg-white border-slate-200/80 hover:bg-slate-50'
                      : 'bg-brand-50/50 border-brand-200 hover:bg-brand-50/80 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center space-x-1.5">
                      {notif.severity === 'success' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                      {notif.severity === 'warning' && (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                      {notif.severity === 'error' && (
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      {notif.severity === 'info' && (
                        <Info className="w-4 h-4 text-brand-500 shrink-0" />
                      )}
                      <span className="font-mono text-[11px] font-bold text-slate-900">
                        {notif.type}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 shrink-0">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${recipBadge.bg}`}>
                        {recipBadge.label}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono font-medium">
                        {formatDateTime(notif.timestamp).split(',')[1] || notif.timestamp}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-800 leading-snug mb-2 pl-5.5 font-medium">
                    {notif.message}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 pl-5.5 pt-1 border-t border-slate-100">
                    <span>
                      Actor: <strong className="text-slate-900">{actor}</strong>
                    </span>

                    <div className="flex items-center space-x-2">
                      {notif.relatedStoneId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markNotificationAsRead(notif.id);
                            openStoneDetail(notif.relatedStoneId!);
                          }}
                          className="text-brand-600 hover:text-brand-800 font-semibold font-mono flex items-center space-x-0.5 text-[11px]"
                          title="Open 360° Stone Detail"
                        >
                          <span>{notif.relatedStoneId}</span>
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </button>
                      )}

                      {notif.relevantAction && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markNotificationAsRead(notif.id);
                            toggleNotificationDrawer();
                            if (notif.actionTargetView) {
                              setActiveView(notif.actionTargetView);
                            } else if (notif.recipient === 'RUNNER') {
                              setActiveView('role-console');
                            } else if (notif.recipient === 'SALESPERSON') {
                              setActiveView('role-console');
                            } else if (notif.recipient === 'INVENTORY_CONTROLLER') {
                              setActiveView('role-console');
                            }
                          }}
                          className="px-2.5 py-1 rounded bg-brand-600 hover:bg-brand-500 text-white font-bold text-[10px] flex items-center space-x-1 shadow-xs transition active:scale-95"
                        >
                          <span>{notif.relevantAction}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Event-driven notification dispatch engine</span>
          <span className="font-mono font-semibold">{notifications.length} events logged</span>
        </div>
      </div>
    </div>
  );
};
