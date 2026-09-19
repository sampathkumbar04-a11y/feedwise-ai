import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
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
import { VeterinaryHub } from './pages/VeterinaryHub';

export function AppContent() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isScannerModalOpen, setIsScannerModalOpen] = useState<boolean>(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState<boolean>(false);
  const [isAddCattleModalOpen, setIsAddCattleModalOpen] = useState<boolean>(false);
  const [selectedReportId, setSelectedReportId] = useState<string | undefined>(undefined);

  const handleViewReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setActiveTab('analyzer');
  };

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100 selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onOpenScanner={() => setIsScannerModalOpen(true)}
        onOpenChat={() => setIsChatModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Layout Container */}
      <div className="flex flex-1 mx-auto w-full max-w-7xl">
        {/* Desktop Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 overflow-y-auto max-w-full">
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
              isScannerModalOpen={isScannerModalOpen}
              setIsScannerModalOpen={setIsScannerModalOpen}
              selectedReportId={selectedReportId}
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

          {activeTab === 'vet' && <VeterinaryHub />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScanner={() => setIsScannerModalOpen(true)}
      />

      {/* Global Footer */}
      <Footer />

      {/* Kisan AI Assistant Chat Modal */}
      <KisanChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppDataProvider>
            <AppContent />
          </AppDataProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
