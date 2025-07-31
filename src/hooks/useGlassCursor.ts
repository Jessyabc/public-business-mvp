import { useEffect } from 'react';

export function useGlassCursor() {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const glassElements = document.querySelectorAll('.glass-follow-cursor');
      
      glassElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        (element as HTMLElement).style.setProperty('--mouse-x', `${x}%`);
        (element as HTMLElement).style.setProperty('--mouse-y', `${y}%`);
      });
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);
}