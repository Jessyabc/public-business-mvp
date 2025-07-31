import { useEffect } from 'react';

export function useGlassCursor() {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Only run if there are elements with the class, but exclude dialogs
      const glassElements = document.querySelectorAll('.glass-follow-cursor:not([data-radix-dialog-content])');
      
      if (glassElements.length === 0) return;
      
      glassElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        (element as HTMLElement).style.setProperty('--mouse-x', `${x}%`);
        (element as HTMLElement).style.setProperty('--mouse-y', `${y}%`);
      });
    };

    // Use passive listener for better performance
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);
}