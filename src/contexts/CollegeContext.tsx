import React, { createContext, useContext, useState } from 'react';
import type { College } from '@/types';

interface CollegeContextType {
  college: College | null;
  setCollege: (c: College | null) => void;
}

const CollegeContext = createContext<CollegeContextType | undefined>(undefined);

export const CollegeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [college, setCollegeState] = useState<College | null>(() => {
    const stored = localStorage.getItem('selectedCollege');
    return stored ? JSON.parse(stored) : null;
  });

  const setCollege = (c: College | null) => {
    setCollegeState(c);
    if (c) localStorage.setItem('selectedCollege', JSON.stringify(c));
    else localStorage.removeItem('selectedCollege');
  };

  return (
    <CollegeContext.Provider value={{ college, setCollege }}>
      {children}
    </CollegeContext.Provider>
  );
};

export const useCollege = () => {
  const ctx = useContext(CollegeContext);
  if (!ctx) throw new Error('useCollege must be used within CollegeProvider');
  return ctx;
};
