import { useEffect } from 'react';
import { useAppMode } from '@/contexts/AppModeContext';

export function BackgroundModeManager() {
  const { mode } = useAppMode();

  useEffect(() => {
    // Apply the current mode as a data attribute to the body
    document.body.setAttribute('data-mode', mode);
    
    // Cleanup function to ensure proper mode switching
    return () => {
      document.body.removeAttribute('data-mode');
    };
  }, [mode]);

  return null; // This component doesn't render anything
}