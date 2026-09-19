import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cattle, FeedScanReport, WeatherRiskStatus } from '../types';
import { INITIAL_CATTLE, INITIAL_SCAN_REPORTS } from '../data/mockData';
import { evaluateFarmWeatherRisk } from '../services/weatherRiskEngine';

interface AppDataContextType {
  cattleList: Cattle[];
  scanReports: FeedScanReport[];
  selectedCattleId: string;
  setSelectedCattleId: (id: string) => void;
  weatherStatus: WeatherRiskStatus;
  refreshWeather: (temp?: number, humidity?: number, rain?: number) => void;
  addCattle: (cattle: Omit<Cattle, 'id' | 'lastUpdated'>) => void;
  updateCattle: (id: string, cattle: Partial<Cattle>) => void;
  deleteCattle: (id: string) => void;
  addScanReport: (report: FeedScanReport) => void;
  deleteScanReport: (id: string) => void;
  feedCostOverrides: Record<string, number>;
  setFeedCostOverride: (feedId: string, cost: number) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cattleList, setCattleList] = useState<Cattle[]>(() => {
    const saved = localStorage.getItem('feedwise_cattle');
    return saved ? JSON.parse(saved) : INITIAL_CATTLE;
  });

  const [scanReports, setScanReports] = useState<FeedScanReport[]>(() => {
    const saved = localStorage.getItem('feedwise_scans');
    return saved ? JSON.parse(saved) : INITIAL_SCAN_REPORTS;
  });

  const [selectedCattleId, setSelectedCattleId] = useState<string>(
    cattleList[0]?.id || 'c1'
  );

  const [weatherStatus, setWeatherStatus] = useState<WeatherRiskStatus>(() =>
    evaluateFarmWeatherRisk(33, 67, 12)
  );

  const [feedCostOverrides, setFeedCostOverrides] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('feedwise_costs');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('feedwise_cattle', JSON.stringify(cattleList));
  }, [cattleList]);

  useEffect(() => {
    localStorage.setItem('feedwise_scans', JSON.stringify(scanReports));
  }, [scanReports]);

  useEffect(() => {
    localStorage.setItem('feedwise_costs', JSON.stringify(feedCostOverrides));
  }, [feedCostOverrides]);

  const refreshWeather = (temp: number = 33, humidity: number = 67, rain: number = 12) => {
    setWeatherStatus(evaluateFarmWeatherRisk(temp, humidity, rain));
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

  const setFeedCostOverride = (feedId: string, cost: number) => {
    setFeedCostOverrides((prev) => ({ ...prev, [feedId]: cost }));
  };

  return (
    <AppDataContext.Provider
      value={{
        cattleList,
        scanReports,
        selectedCattleId,
        setSelectedCattleId,
        weatherStatus,
        refreshWeather,
        addCattle,
        updateCattle,
        deleteCattle,
        addScanReport,
        deleteScanReport,
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
