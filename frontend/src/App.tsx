import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import type { NavItem } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Missions } from './pages/Missions';
import { Resources } from './pages/Resources';
import { Optimization } from './pages/Optimization';
import { Simulation } from './pages/Simulation';
import { Analytics } from './pages/Analytics';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { OptimizationModal } from './components/OptimizationModal';
import { DisruptionModal } from './components/DisruptionModal';

export function App() {
  const [activeTab, setActiveTab] = useState<NavItem>('dashboard');
  const [globalOptModal, setGlobalOptModal] = useState(false);
  const [globalDisruptModal, setGlobalDisruptModal] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigateToTab={(tab) => setActiveTab(tab)} />;
      case 'missions':
        return <Missions />;
      case 'resources':
        return <Resources />;
      case 'optimization':
        return <Optimization />;
      case 'simulation':
        return <Simulation />;
      case 'analytics':
        return <Analytics />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigateToTab={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070b14] text-slate-100 antialiased font-sans">
      {/* Left Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          onOpenOptimization={() => setGlobalOptModal(true)}
          onOpenDisruption={() => setGlobalDisruptModal(true)}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto bg-[#070b14]">
          <div className="max-w-[1600px] mx-auto min-h-full flex flex-col justify-between">
            <div>{renderActiveView()}</div>

            {/* Tactical Prototype Compliance Footer */}
            <footer className="mt-8 py-3.5 px-6 border-t border-slate-800/80 bg-[#060911] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sky-400 font-mono">SIH26250</span>
                <span>•</span>
                <span className="text-slate-300 font-medium">
                  AI-Powered Air Operations & Resource Optimisation
                </span>
                <span>•</span>
                <span className="text-slate-400">UI Prototype (React + TypeScript)</span>
              </div>
              <div className="text-slate-400 font-mono">
                ⚠️ Academic simulation using 100% synthetic data for demonstration purposes only.
              </div>
            </footer>
          </div>
        </main>
      </div>

      {/* Global Quick Action Modals */}
      <OptimizationModal
        isOpen={globalOptModal}
        onClose={() => setGlobalOptModal(false)}
        onComplete={() => setActiveTab('optimization')}
      />

      <DisruptionModal
        isOpen={globalDisruptModal}
        onClose={() => setGlobalDisruptModal(false)}
        onTriggerDisruption={() => setActiveTab('simulation')}
      />
    </div>
  );
}

export default App;
