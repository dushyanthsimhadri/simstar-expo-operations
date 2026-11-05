import React, { useState } from 'react';
import { useOperations } from '../../context/OperationsContext';
import { InventoryControllerView } from './InventoryControllerView';
import { SalespersonView } from './SalespersonView';
import { RunnerConsoleView } from './RunnerConsoleView';
import { ShieldCheck, UserCheck, Smartphone, Info } from 'lucide-react';

export const RoleConsolePage: React.FC = () => {
  const { currentUser, switchRole } = useOperations();

  // Tab selection
  const [selectedRoleTab, setSelectedRoleTab] = useState<'CONTROLLER' | 'SALES' | 'RUNNER'>(() => {
    if (currentUser.role === 'RUNNER') return 'RUNNER';
    if (currentUser.role === 'SALESPERSON') return 'SALES';
    return 'CONTROLLER';
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header and Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Role-Based Operational Consoles
          </h2>
          <p className="text-xs text-slate-500">
            Dedicated operational interfaces with role-specific permissions and business rules
          </p>
        </div>

        {/* 3 Role Switch Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
          <button
            onClick={() => {
              setSelectedRoleTab('CONTROLLER');
              switchRole('INVENTORY_CONTROLLER');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition ${
              selectedRoleTab === 'CONTROLLER'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            <span>Stock Controller</span>
          </button>

          <button
            onClick={() => {
              setSelectedRoleTab('SALES');
              switchRole('SALESPERSON');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition ${
              selectedRoleTab === 'SALES'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Salesperson (Cabin 04)</span>
          </button>

          <button
            onClick={() => {
              setSelectedRoleTab('RUNNER');
              switchRole('RUNNER');
            }}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition ${
              selectedRoleTab === 'RUNNER'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-teal-600" />
            <span>Runner Console</span>
          </button>
        </div>
      </div>

      {/* Render Role Console */}
      {selectedRoleTab === 'CONTROLLER' && <InventoryControllerView />}
      {selectedRoleTab === 'SALES' && <SalespersonView />}
      {selectedRoleTab === 'RUNNER' && <RunnerConsoleView />}
    </div>
  );
};
