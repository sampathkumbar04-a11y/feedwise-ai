import React, { useState, useEffect } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AgriThemeProvider } from './context/AgriThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AppDataProvider, useAppData } from './context/AppDataContext';
import { AgriBackground } from './components/layout/AgriBackground';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';
import { KisanChatModal } from './components/chatbot/KisanChatModal';
import { CameraModal } from './components/analyzer/CameraModal';
import { Dashboard } from './pages/Dashboard';
import { FeedAnalyzer } from './pages/FeedAnalyzer';
import { SilageFliegCalculator } from './pages/SilageFliegCalculator';
import { RationPlanner } from './pages/RationPlanner';
import { CattleManager } from './pages/CattleManager';
import { WeatherAdvisor } from './pages/WeatherAdvisor';
import { ReportsHistory } from './pages/ReportsHistory';
import { CooperativePortal } from './pages/CooperativePortal';
import { FeedSafetyScanner } from './pages/FeedSafetyScanner';
import { analyzeFeedImage } from './services/computerVisionEngine';
import { FeedType } from './types';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { ErrorBoundary } from './components/common/ErrorBoundary';

export function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isScannerModalOpen, setIsScannerModalOpen] = useState<boolean>(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState<boolean>(false);
  const [isAddCattleModalOpen, setIsAddCattleModalOpen] = useState<boolean>(false);
  const [selectedReportId, setSelectedReportId] = useState<string | undefined>(undefined);
  const { addScanReport } = useAppData();
  const { isOnline, simulatedOffline, toggleOfflineSimulation } = useOnlineStatus();
  const lenis = useLenis();

  // Scroll to top immediately when active tab changes
  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeTab, lenis]);

  // Pause Lenis smooth scrolling when full-screen/dialog modals are active
  useEffect(() => {
    const isModalActive = isScannerModalOpen || isChatModalOpen || isAddCattleModalOpen;
    if (lenis) {
      if (isModalActive) {
        lenis.stop();
      } else {
        lenis.start();
      }
    }
  }, [isScannerModalOpen, isChatModalOpen, isAddCattleModalOpen, lenis]);

  const handleViewReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setActiveTab('analyzer');
  };

  const handleCaptureFeed = async (
    imageDataUrl: string,
    feedType: FeedType,
    sampleName: string,
    manualPH?: number,
    silageConditionHint?: 'auto' | 'optimal' | 'caramelized' | 'wet' | 'moldy',
    chopTextureHint?: 'auto' | 'long_coarse' | 'medium_crisp' | 'fine_chopped' | 'mushy_sludge' | 'dry_fibrous'
  ) => {
    const report = await analyzeFeedImage({
      feedType,
      sampleName,
      imageDataUrl,
      manualPH,
      silageConditionHint,
      chopTextureHint,
    });
    addScanReport(report);
    setSelectedReportId(report.id);
    setActiveTab('analyzer');
    setIsScannerModalOpen(false);
  };

  return (
    <div className="relative min-h-screen flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Agriculture Ambient Landscape Background */}
      <AgriBackground />

      {/* Main Foreground Container */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Top Navigation */}
        <Navbar
          onOpenScanner={() => setIsScannerModalOpen(true)}
          onOpenChat={() => setIsChatModalOpen(true)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOnline={isOnline}
          onToggleSimulateOffline={toggleOfflineSimulation}
          isSimulatedOffline={simulatedOffline}
        />

      {/* Main Layout Container */}
      <div className="flex flex-1 mx-auto w-full max-w-7xl">
        {/* Desktop Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 max-w-full min-w-0">
          {activeTab === 'dashboard' && (
            <Dashboard
              onOpenScanner={() => setIsScannerModalOpen(true)}
              onOpenChat={() => setIsChatModalOpen(true)}
              setActiveTab={setActiveTab}
              onViewReport={handleViewReport}
            />
          )}

          {activeTab === 'analyzer' && (
            <FeedAnalyzer
              onOpenScanner={() => setIsScannerModalOpen(true)}
              onOpenChat={() => setIsChatModalOpen(true)}
              selectedReportId={selectedReportId}
              onSelectReportId={setSelectedReportId}
              onNavigateToSafety={(reportId) => {
                setSelectedReportId(reportId);
                setActiveTab('safety');
              }}
            />
          )}

          {activeTab === 'safety' && (
            <FeedSafetyScanner
              initialReportId={selectedReportId}
              onNavigate={setActiveTab}
              onOpenScanner={() => setIsScannerModalOpen(true)}
            />
          )}

          {activeTab === 'silage' && <SilageFliegCalculator />}

          {activeTab === 'ration' && (
            <RationPlanner onOpenAddCattle={() => setIsAddCattleModalOpen(true)} />
          )}

          {activeTab === 'cattle' && (
            <CattleManager
              isAddModalOpen={isAddCattleModalOpen}
              setIsAddModalOpen={setIsAddCattleModalOpen}
            />
          )}

          {activeTab === 'weather' && <WeatherAdvisor />}

          {activeTab === 'reports' && (
            <ReportsHistory onViewReport={handleViewReport} />
          )}

          {activeTab === 'cooperative' && <CooperativePortal />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScanner={() => setIsScannerModalOpen(true)}
        isOnline={isOnline}
      />

      {/* Floating Offline Indicator Banner */}
      <OfflineIndicator
        isOnline={isOnline}
        onToggleSimulate={toggleOfflineSimulation}
        isSimulated={simulatedOffline}
      />

      {/* Global Footer */}
      <Footer />

      {/* Kisan AI Assistant Chat Modal */}
      <KisanChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        selectedReportId={selectedReportId}
        onSelectReportId={setSelectedReportId}
        onOpenScanner={() => {
          setIsChatModalOpen(false);
          setIsScannerModalOpen(true);
        }}
      />

      {/* Global Feed Scanner / Live Camera Modal */}
      <CameraModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onCapture={handleCaptureFeed}
      />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AgriThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <AppDataProvider>
                <ReactLenis
                  root
                  options={{
                    lerp: 0.09,
                    duration: 1.2,
                    smoothWheel: true,
                    wheelMultiplier: 1.0,
                    touchMultiplier: 1.5,
                  }}
                >
                  <AppContent />
                </ReactLenis>
              </AppDataProvider>
            </AuthProvider>
          </LanguageProvider>
        </AgriThemeProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
