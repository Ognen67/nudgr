import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TabBarContextType {
  isTabBarVisible: boolean;
  setTabBarVisible: (visible: boolean) => void;
  toggleTabBar: () => void;
}

const TabBarContext = createContext<TabBarContextType | undefined>(undefined);

export const TabBarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);

  const setTabBarVisible = (visible: boolean) => {
    setIsTabBarVisible(visible);
  };

  const toggleTabBar = () => {
    setIsTabBarVisible(prev => !prev);
  };

  return (
    <TabBarContext.Provider value={{ isTabBarVisible, setTabBarVisible, toggleTabBar }}>
      {children}
    </TabBarContext.Provider>
  );
};

export const useTabBar = () => {
  const context = useContext(TabBarContext);
  if (context === undefined) {
    throw new Error('useTabBar must be used within a TabBarProvider');
  }
  return context;
}; 