import * as React from 'react';
const { createContext, useContext, useState } = React;
type ReactNode = React.ReactNode;

export type AppMode = 'public' | 'business';

interface AppModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  toggleMode: () => void;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

export function AppModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AppMode>(() => {
    const stored = localStorage.getItem('pb-ui-mode');
    return (stored === 'public' || stored === 'business') ? stored : 'public';
  });

  const handleSetMode = (newMode: AppMode) => {
    setMode(newMode);
    localStorage.setItem('pb-ui-mode', newMode);
  };

  const toggleMode = () => {
    const newMode = mode === 'public' ? 'business' : 'public';
    handleSetMode(newMode);
  };

  return (
    <AppModeContext.Provider value={{ mode, setMode: handleSetMode, toggleMode }}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  const context = useContext(AppModeContext);
  if (context === undefined) {
    throw new Error('useAppMode must be used within an AppModeProvider');
  }
  return context;
}