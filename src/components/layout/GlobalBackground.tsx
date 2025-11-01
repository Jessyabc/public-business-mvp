import { useAuth } from '@/contexts/AuthContext';
import { useAppMode } from '@/contexts/AppModeContext';
import { OrbitalBackground } from './OrbitalBackground';

/**
 * GlobalBackground - Single source of truth for all background visuals
 * 
 * Rules:
 * - Logged-out users: Always see dark "public" mode
 * - Logged-in users: Respect mode toggle (public = dark, business = light)
 */
export function GlobalBackground() {
  const { user } = useAuth();
  const { mode } = useAppMode();

  // Determine the background mode
  // If not logged in, always use public (dark) mode
  // If logged in, respect the user's mode selection
  const backgroundMode = !user ? 'public' : mode;

  return <OrbitalBackground mode={backgroundMode} />;
}
