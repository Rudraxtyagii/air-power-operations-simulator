import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import type { NavItem } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Missions } from './pages/Missions';
import { Resources } from './pages/Resources';
import { Optimization } from './pages/Optimization';
import { Simulation } from './pages/Simulation';
import { Weather } from './pages/Weather';
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
      case 'weather':
        return <Weather onNavigateToOptimization={() => setActiveTab('optimization')} />;
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
    <div className="flex h-screen w-screen overflow-hidden bg-[#EAF2FC] text-[#14264A] antialiased font-sans">
      {/* Left Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#EAF2FC]">
        {/* Top Header */}
        <Header
          onOpenOptimization={() => setGlobalOptModal(true)}
          onOpenDisruption={() => setGlobalDisruptModal(true)}
          onNavigateToWeather={() => setActiveTab('weather')}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto bg-[#EAF2FC]">
          <div className="max-w-[1600px] mx-auto min-h-full flex flex-col justify-between p-2">
            <div>{renderActiveView()}</div>

            {/* Tactical Prototype Compliance Footer */}
            <footer className="mt-8 py-4 px-6 border-t border-[#C2D5ED]/60 bg-[#EAF2FC] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#607391]">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#4285F4] font-mono">SIH26250</span>
                <span>•</span>
                <span className="text-[#14264A] font-semibold">
                  AI-Powered Air Operations & Resource Optimisation Simulator
                </span>
                <span>•</span>
                <span className="text-[#607391]">Tactical Decision Support System</span>
              </div>
              <div className="text-[#607391] font-medium text-[11px] bg-white/70 px-3 py-1 rounded-full border border-[#C2D5ED]/50 shadow-xs">
                ⚠️ Academic simulation using 100% synthetic data for research demonstration.
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
