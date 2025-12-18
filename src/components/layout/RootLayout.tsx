import { Outlet } from 'react-router-dom';
import { ThemeInjector } from '@/styles/ThemeInjector';
import { DiscussLensProvider } from '@/contexts/DiscussLensContext';

export function RootLayout() {
  return (
    <DiscussLensProvider>
      <ThemeInjector />
      <Outlet />
    </DiscussLensProvider>
  );
}
