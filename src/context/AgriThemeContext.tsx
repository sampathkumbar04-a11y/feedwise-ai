import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AgriScenery = 'lush-pasture' | 'golden-harvest';
export type AgriIntensity = 'balanced' | 'vibrant' | 'subtle';

interface AgriThemeContextType {
  scenery: AgriScenery;
  setScenery: (scenery: AgriScenery) => void;
  intensity: AgriIntensity;
  setIntensity: (intensity: AgriIntensity) => void;
  showFurrows: boolean;
  setShowFurrows: (show: boolean) => void;
  currentBgUrl: string;
}

const AgriThemeContext = createContext<AgriThemeContextType | undefined>(undefined);

export const AgriThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [scenery, setSceneryState] = useState<AgriScenery>(() => {
    const saved = localStorage.getItem('feedwise_agri_scenery');
    return (saved as AgriScenery) || 'lush-pasture';
  });

  const [intensity, setIntensityState] = useState<AgriIntensity>(() => {
    const saved = localStorage.getItem('feedwise_agri_intensity');
    return (saved as AgriIntensity) || 'balanced';
  });

  const [showFurrows, setShowFurrowsState] = useState<boolean>(() => {
    const saved = localStorage.getItem('feedwise_agri_furrows');
    return saved !== null ? saved === 'true' : true;
  });

  const setScenery = (s: AgriScenery) => {
    setSceneryState(s);
    localStorage.setItem('feedwise_agri_scenery', s);
  };

  const setIntensity = (i: AgriIntensity) => {
    setIntensityState(i);
    localStorage.setItem('feedwise_agri_intensity', i);
  };

  const setShowFurrows = (f: boolean) => {
    setShowFurrowsState(f);
    localStorage.setItem('feedwise_agri_furrows', String(f));
  };

  const currentBgUrl = scenery === 'golden-harvest' ? '/golden_harvest_bg.jpg' : '/agri_farm_bg.jpg';

  return (
    <AgriThemeContext.Provider
      value={{
        scenery,
        setScenery,
        intensity,
        setIntensity,
        showFurrows,
        setShowFurrows,
        currentBgUrl,
      }}
    >
      {children}
    </AgriThemeContext.Provider>
  );
};

export const useAgriTheme = () => {
  const context = useContext(AgriThemeContext);
  if (!context) {
    throw new Error('useAgriTheme must be used within an AgriThemeProvider');
  }
  return context;
};
