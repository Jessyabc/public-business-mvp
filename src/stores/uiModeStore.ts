import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UIMode = 'public' | 'business';

interface UIModeStore {
  uiMode: UIMode;
  setUiMode: (mode: UIMode) => void;
  lastVisitedTab: Record<UIMode, string>;
  setLastVisitedTab: (mode: UIMode, tab: string) => void;
}

export const useUIModeStore = create<UIModeStore>()(
  persist(
    (set, get) => ({
      uiMode: 'public',
      setUiMode: (mode: UIMode) => {
        set({ uiMode: mode });
        // Update body data attribute for CSS styling
        document.body.setAttribute('data-mode', mode);
      },
      lastVisitedTab: {
        public: '/public/profile',
        business: '/business/dashboard',
      },
      setLastVisitedTab: (mode: UIMode, tab: string) => {
        set({ 
          lastVisitedTab: { 
            ...get().lastVisitedTab, 
            [mode]: tab 
          } 
        });
      },
    }),
    {
      name: 'ui-mode-storage',
      onRehydrateStorage: () => (state) => {
        // Set initial body attribute on hydration
        if (state?.uiMode) {
          document.body.setAttribute('data-mode', state.uiMode);
        }
      },
    }
  )
);