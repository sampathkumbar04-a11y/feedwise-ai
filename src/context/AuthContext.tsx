import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'farmer' | 'cooperative' | 'veterinarian' | 'admin';

export interface UserProfile {
  name: string;
  role: UserRole;
  farmOrOrgName: string;
  district: string;
}

interface AuthContextType {
  user: UserProfile;
  setRole: (role: UserRole) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

const DEFAULT_USER: UserProfile = {
  name: 'Ramesh Patel (रमेश भाई)',
  role: 'farmer',
  farmOrOrgName: 'Shree Krishna Dairy Farm',
  district: 'Anand, Gujarat',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);

  const setRole = (role: UserRole) => {
    setUser((prev) => {
      let farmOrOrgName = prev.farmOrOrgName;
      if (role === 'cooperative') farmOrOrgName = 'Amul District Milk Producers Union';
      if (role === 'veterinarian') farmOrOrgName = 'District Animal Health Polyclinic';
      if (role === 'farmer') farmOrOrgName = 'Shree Krishna Dairy Farm';
      if (role === 'admin') farmOrOrgName = 'FeedWise Central Platform Operations';

      return {
        ...prev,
        role,
        farmOrOrgName,
      };
    });
  };

  const updateProfile = (profile: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...profile }));
  };

  return (
    <AuthContext.Provider value={{ user, setRole, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
