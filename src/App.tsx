import { OperationsProvider } from './context/OperationsContext';
import { AppShell } from './components/layout/AppShell';

export function App() {
  return (
    <OperationsProvider>
      <AppShell />
    </OperationsProvider>
  );
}

export default App;
