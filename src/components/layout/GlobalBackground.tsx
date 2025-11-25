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

  // Logged-out users always see public (dark) theme
  // Logged-in users respect the mode toggle
  const backgroundMode = user ? mode : 'public';

  return <OrbitalBackground mode={backgroundMode} />;
}
