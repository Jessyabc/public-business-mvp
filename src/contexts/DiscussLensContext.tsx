import * as React from 'react';
const { createContext, useContext, useState } = React;
type ReactNode = React.ReactNode;

export type DiscussLens = 'public' | 'business';

interface DiscussLensContextType {
  lens: DiscussLens;
  setLens: (lens: DiscussLens) => void;
  toggleLens: () => void;
}

const DiscussLensContext = createContext<DiscussLensContextType | undefined>(undefined);

export function DiscussLensProvider({ children }: { children: ReactNode }) {
  const [lens, setLens] = useState<DiscussLens>(() => {
    const stored = localStorage.getItem('pb-discuss-lens');
    return (stored === 'public' || stored === 'business') ? stored : 'public';
  });

  const handleSetLens = (newLens: DiscussLens) => {
    setLens(newLens);
    localStorage.setItem('pb-discuss-lens', newLens);
  };

  const toggleLens = () => {
    const newLens = lens === 'public' ? 'business' : 'public';
    handleSetLens(newLens);
  };

  return (
    <DiscussLensContext.Provider value={{ lens, setLens: handleSetLens, toggleLens }}>
      {children}
    </DiscussLensContext.Provider>
  );
}

export function useDiscussLens() {
  const context = useContext(DiscussLensContext);
  if (context === undefined) {
    throw new Error('useDiscussLens must be used within a DiscussLensProvider');
  }
  return context;
}

/**
 * Safe hook that returns default lens when outside DiscussLensProvider
 * Use this in components that may render both inside and outside Discuss
 */
export function useDiscussLensSafe(): DiscussLensContextType {
  const context = useContext(DiscussLensContext);
  if (context === undefined) {
    return {
      lens: 'public',
      setLens: () => {},
      toggleLens: () => {},
    };
  }
  return context;
}
