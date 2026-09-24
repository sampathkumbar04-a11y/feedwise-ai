import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cattle, FeedScanReport, FeedSafetyAssessment, WeatherRiskStatus } from '../types';
import { INITIAL_CATTLE, INITIAL_SCAN_REPORTS, INITIAL_SAFETY_ASSESSMENTS } from '../data/mockData';
import { evaluateFarmWeatherRisk, getCachedWeatherData } from '../services/weatherRiskEngine';
import { safeGetItem, safeSetItem, sanitizeScanReportsForStorage } from '../utils/storage';

interface AppDataContextType {
  cattleList: Cattle[];
  scanReports: FeedScanReport[];
  safetyAssessments: FeedSafetyAssessment[];
  selectedCattleId: string;
  setSelectedCattleId: (id: string) => void;
  weatherStatus: WeatherRiskStatus;
  setWeatherStatus: (status: WeatherRiskStatus) => void;
  refreshWeather: (
    temp?: number,
    humidity?: number,
    rain?: number,
    location?: string,
    options?: Parameters<typeof evaluateFarmWeatherRisk>[4]
  ) => void;
  addCattle: (cattle: Omit<Cattle, 'id' | 'lastUpdated'>) => void;
  updateCattle: (id: string, cattle: Partial<Cattle>) => void;
  deleteCattle: (id: string) => void;
  addScanReport: (report: FeedScanReport) => void;
  deleteScanReport: (id: string) => void;
  clearAllScans: () => void;
  saveSafetyAssessment: (assessment: FeedSafetyAssessment, linkToReportId?: string) => void;
  feedCostOverrides: Record<string, number>;
  setFeedCostOverride: (feedId: string, cost: number) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cattleList, setCattleList] = useState<Cattle[]>(() => {
    return safeGetItem<Cattle[]>('feedwise_cattle', INITIAL_CATTLE);
  });

  const [scanReports, setScanReports] = useState<FeedScanReport[]>(() => {
    const loaded = safeGetItem<FeedScanReport[]>('feedwise_scans', INITIAL_SCAN_REPORTS);
    return Array.isArray(loaded) && loaded.length > 0 ? loaded : INITIAL_SCAN_REPORTS;
  });

  const [safetyAssessments, setSafetyAssessments] = useState<FeedSafetyAssessment[]>(() => {
    return safeGetItem<FeedSafetyAssessment[]>('feedwise_safety_assessments', INITIAL_SAFETY_ASSESSMENTS);
  });

  const [selectedCattleId, setSelectedCattleId] = useState<string>(
    cattleList[0]?.id || 'c1'
  );

  const [weatherStatus, setWeatherStatus] = useState<WeatherRiskStatus>(() => {
    const cached = getCachedWeatherData();
    if (cached?.weatherStatus) {
      return cached.weatherStatus;
    }
    return evaluateFarmWeatherRisk(33, 67, 12);
  });

  const [feedCostOverrides, setFeedCostOverrides] = useState<Record<string, number>>(() => {
    return safeGetItem<Record<string, number>>('feedwise_costs', {});
  });

  useEffect(() => {
    safeSetItem('feedwise_cattle', cattleList);
  }, [cattleList]);

  useEffect(() => {
    // Sanitize before persisting to guarantee no QuotaExceededError
    const safeScans = sanitizeScanReportsForStorage(scanReports);
    safeSetItem('feedwise_scans', safeScans);
  }, [scanReports]);

  useEffect(() => {
    safeSetItem('feedwise_safety_assessments', safetyAssessments);
  }, [safetyAssessments]);

  useEffect(() => {
    safeSetItem('feedwise_costs', feedCostOverrides);
  }, [feedCostOverrides]);

  const refreshWeather = (
    temp: number = 33,
    humidity: number = 67,
    rain: number = 12,
    location: string = 'District Dairy Cluster / Farm',
    options?: Parameters<typeof evaluateFarmWeatherRisk>[4]
  ) => {
    setWeatherStatus(evaluateFarmWeatherRisk(temp, humidity, rain, location, options));
  };

  const addCattle = (newCattle: Omit<Cattle, 'id' | 'lastUpdated'>) => {
    const created: Cattle = {
      ...newCattle,
      id: `c_${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setCattleList((prev) => [created, ...prev]);
    setSelectedCattleId(created.id);
  };

  const updateCattle = (id: string, updates: Partial<Cattle>) => {
    setCattleList((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, ...updates, lastUpdated: new Date().toISOString().split('T')[0] }
          : c
      )
    );
  };

  const deleteCattle = (id: string) => {
    setCattleList((prev) => prev.filter((c) => c.id !== id));
    if (selectedCattleId === id && cattleList.length > 1) {
      const next = cattleList.find((c) => c.id !== id);
      if (next) setSelectedCattleId(next.id);
    }
  };

  const addScanReport = (report: FeedScanReport) => {
    setScanReports((prev) => [report, ...prev]);
  };

  const deleteScanReport = (id: string) => {
    setScanReports((prev) => prev.filter((r) => r.id !== id));
  };

  const clearAllScans = () => {
    setScanReports(INITIAL_SCAN_REPORTS);
    safeSetItem('feedwise_scans', INITIAL_SCAN_REPORTS);
  };

  const saveSafetyAssessment = (assessment: FeedSafetyAssessment, linkToReportId?: string) => {
    setSafetyAssessments((prev) => [assessment, ...prev.filter((a) => a.id !== assessment.id)]);

    // Automatically synchronize into existing FeedScanReport if matched
    const targetId = linkToReportId || assessment.sampleId;
    setScanReports((prev) =>
      prev.map((r) =>
        r.id === targetId || r.sampleName === assessment.sampleName
          ? { ...r, safetyAssessment: assessment }
          : r
      )
    );
  };

  const setFeedCostOverride = (feedId: string, cost: number) => {
    setFeedCostOverrides((prev) => ({ ...prev, [feedId]: cost }));
  };

  return (
    <AppDataContext.Provider
      value={{
        cattleList,
        scanReports,
        safetyAssessments,
        selectedCattleId,
        setSelectedCattleId,
        weatherStatus,
        setWeatherStatus,
        refreshWeather,
        addCattle,
        updateCattle,
        deleteCattle,
        addScanReport,
        deleteScanReport,
        clearAllScans,
        saveSafetyAssessment,
        feedCostOverrides,
        setFeedCostOverride,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};
