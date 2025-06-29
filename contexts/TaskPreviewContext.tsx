import React, { createContext, useContext, ReactNode } from 'react';

interface TaskPreviewContextType {
  triggerTaskPreview: (thought: string) => void;
}

const TaskPreviewContext = createContext<TaskPreviewContextType | null>(null);

export const useTaskPreview = () => {
  const context = useContext(TaskPreviewContext);
  if (!context) {
    throw new Error('useTaskPreview must be used within a TaskPreviewProvider');
  }
  return context;
};

interface TaskPreviewProviderProps {
  children: ReactNode;
  triggerTaskPreview: (thought: string) => void;
}

export const TaskPreviewProvider: React.FC<TaskPreviewProviderProps> = ({
  children,
  triggerTaskPreview,
}) => {
  return (
    <TaskPreviewContext.Provider value={{ triggerTaskPreview }}>
      {children}
    </TaskPreviewContext.Provider>
  );
}; 