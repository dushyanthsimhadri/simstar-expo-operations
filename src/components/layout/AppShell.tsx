import React, { useState } from 'react';
import { useOperations } from '../../context/OperationsContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { SplitScreenOverview } from '../../features/workflow/SplitScreenOverview';
import { GuidedScenarioPlayer } from '../../features/workflow/GuidedScenarioPlayer';
import { RoleConsolePage } from '../../features/roles/RoleConsolePage';
import { InventoryPage } from '../../features/inventory/InventoryPage';
import { RequestsPage } from '../../features/requests/RequestsPage';
import { CustodyMovementsPage } from '../../features/custody/CustodyMovementsPage';
import { CommercialPage } from '../../features/commercial/CommercialPage';
import { ReconciliationPage } from '../../features/reconciliation/ReconciliationPage';
import { ERPSyncPage } from '../../features/erp/ERPSyncPage';
import { ExceptionCenter } from '../../features/exceptions/ExceptionCenter';
import { MetricsDashboardPage } from '../../features/metrics/MetricsDashboardPage';
import { StoneDetailDrawer } from '../shared/StoneDetailDrawer';
import { NotificationCenterDrawer } from '../shared/NotificationCenterDrawer';
import { PresentationMode } from '../../features/presentation/PresentationMode';

export const AppShell: React.FC = () => {
  const { presentationModeActive, isWalkthroughActive } = useOperations();
  const [currentView, setCurrentView] = useState<string>('overview');

  const renderActiveView = () => {
    switch (currentView) {
      case 'walkthrough':
        return <GuidedScenarioPlayer />;
      case 'role-console':
        return <RoleConsolePage />;
      case 'requests':
        return <RequestsPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'custody':
        return <CustodyMovementsPage />;
      case 'commercial':
        return <CommercialPage />;
      case 'reconciliation':
        return <ReconciliationPage />;
      case 'erp':
        return <ERPSyncPage />;
      case 'exceptions':
        return <ExceptionCenter />;
      case 'metrics':
        return <MetricsDashboardPage />;
      case 'notifications':
      case 'overview':
      default:
        return <SplitScreenOverview onNavigate={(view) => setCurrentView(view)} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* Persistent Left Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'notifications') {
            // Can switch to view or open drawer
            setCurrentView('overview');
          } else {
            setCurrentView(view);
          }
        }}
      />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header onNavigate={(view) => setCurrentView(view)} />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto bg-slate-50 text-slate-900">
          {renderActiveView()}
        </main>
      </div>

      {/* Persistent Overlays */}
      <StoneDetailDrawer />
      <NotificationCenterDrawer />

      {/* Fullscreen Interviewer Presentation Mode */}
      {presentationModeActive && <PresentationMode />}
    </div>
  );
};
