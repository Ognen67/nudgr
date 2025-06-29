import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RefreshContextType {
  triggerIdeasRefresh: () => void;
  triggerGoalsRefresh: () => void;
  ideasRefreshTrigger: number;
  goalsRefreshTrigger: number;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
};

interface RefreshProviderProps {
  children: ReactNode;
}

export const RefreshProvider: React.FC<RefreshProviderProps> = ({ children }) => {
  const [ideasRefreshTrigger, setIdeasRefreshTrigger] = useState(0);
  const [goalsRefreshTrigger, setGoalsRefreshTrigger] = useState(0);

  const triggerIdeasRefresh = () => {
    setIdeasRefreshTrigger(prev => prev + 1);
  };

  const triggerGoalsRefresh = () => {
    setGoalsRefreshTrigger(prev => prev + 1);
  };

  return (
    <RefreshContext.Provider value={{
      triggerIdeasRefresh,
      triggerGoalsRefresh,
      ideasRefreshTrigger,
      goalsRefreshTrigger
    }}>
      {children}
    </RefreshContext.Provider>
  );
}; 