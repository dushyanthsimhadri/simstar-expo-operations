import { PhysicalStatus, CommercialStatus, ERPSyncStatus, NotificationSeverity } from '../types';

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return isoString;
  }
}

export function formatTimeOnly(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return isoString;
  }
}

export function getElapsedTimeMinutes(isoString?: string): number {
  if (!isoString) return 0;
  const start = new Date(isoString).getTime();
  const now = new Date().getTime();
  return Math.max(0, Math.floor((now - start) / (1000 * 60)));
}

export function getPhysicalStatusBadge(status: PhysicalStatus): {
  bg: string;
  text: string;
  border: string;
  dot: string;
  label: string;
} {
  switch (status) {
    case 'In Safe':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'In Safe',
      };
    case 'Requested':
      return {
        bg: 'bg-sky-50',
        text: 'text-sky-800',
        border: 'border-sky-200',
        dot: 'bg-sky-500',
        label: 'Requested',
      };
    case 'Dispatched':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
        label: 'Dispatched / In Transit',
      };
    case 'In Cabin':
      return {
        bg: 'bg-indigo-50',
        text: 'text-indigo-800',
        border: 'border-indigo-200',
        dot: 'bg-indigo-600',
        label: 'In Cabin',
      };
    case 'Return Requested':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        label: 'Return Requested',
      };
    case 'Return Transit':
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-800',
        border: 'border-orange-200',
        dot: 'bg-orange-500',
        label: 'Return Transit',
      };
    case 'In Safe after return':
      return {
        bg: 'bg-teal-50',
        text: 'text-teal-800',
        border: 'border-teal-200',
        dot: 'bg-teal-600',
        label: 'In Safe (Returned)',
      };
    case 'Exception':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-800',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
        label: 'Custody Exception',
      };
    case 'Unloaded':
    default:
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-800',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
        label: 'Unloaded',
      };
  }
}

export function getCommercialStatusBadge(status: CommercialStatus): {
  bg: string;
  text: string;
  border: string;
  dot: string;
  label: string;
} {
  switch (status) {
    case 'Available':
      return {
        bg: 'bg-green-50',
        text: 'text-green-800',
        border: 'border-green-200',
        dot: 'bg-green-500',
        label: 'Available',
      };
    case 'Hold':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        label: 'On Hold',
      };
    case 'Memo':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-800',
        border: 'border-purple-200',
        dot: 'bg-purple-500',
        label: 'On Memo',
      };
    case 'Sale Pending ERP':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
        label: 'Sale Pending ERP',
      };
    case 'ERP Accepted':
      return {
        bg: 'bg-teal-50',
        text: 'text-teal-800',
        border: 'border-teal-200',
        dot: 'bg-teal-600',
        label: 'ERP Accepted',
      };
    case 'Requires Review':
    default:
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-800',
        border: 'border-rose-200',
        dot: 'bg-rose-600',
        label: 'Requires Review',
      };
  }
}

export function getERPSyncBadge(status: ERPSyncStatus): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  switch (status) {
    case 'Accepted':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        label: 'Accepted',
      };
    case 'Pending':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        label: 'Pending Sync',
      };
    case 'Captured':
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
        label: 'Captured in Outbox',
      };
    case 'Failed':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        label: 'Sync Failed',
      };
    case 'Requires Review':
    default:
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        label: 'Requires Review',
      };
  }
}

export function getSeverityBadge(severity: NotificationSeverity): {
  bg: string;
  text: string;
  iconColor: string;
} {
  switch (severity) {
    case 'success':
      return { bg: 'bg-emerald-50', text: 'text-emerald-800', iconColor: 'text-emerald-500' };
    case 'warning':
      return { bg: 'bg-amber-50', text: 'text-amber-800', iconColor: 'text-amber-500' };
    case 'error':
      return { bg: 'bg-rose-50', text: 'text-rose-800', iconColor: 'text-rose-500' };
    case 'info':
    default:
      return { bg: 'bg-blue-50', text: 'text-blue-800', iconColor: 'text-blue-500' };
  }
}
