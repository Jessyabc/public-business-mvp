import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDiscussLensSafe } from '@/contexts/DiscussLensContext';
import { OrbitalBackground } from './OrbitalBackground';

/**
 * GlobalBackground - Route-aware background
 * 
 * Rules:
 * - Logged-out users: Always see dark "public" mode
 * - Workspace (/): Always uses a neutral workspace aesthetic
 * - Discuss (/discuss): Respects lens toggle (public = dark, business = light)
 * - Other routes: Default to public aesthetic
 */
export function GlobalBackground() {
  const { user } = useAuth();
  const location = useLocation();
  const { lens } = useDiscussLensSafe();

  // Logged-out users always see public (dark) theme
  if (!user) {
    return <OrbitalBackground mode="public" />;
  }

  // Workspace always has a consistent, neutral aesthetic
  // Using 'public' for now as the dark, focused workspace feel
  if (location.pathname === '/' || location.pathname === '/workspace') {
    return <OrbitalBackground mode="public" />;
  }

  // Discuss respects the lens
  if (location.pathname === '/discuss') {
    return <OrbitalBackground mode={lens} />;
  }

  // Default to public for other routes
  return <OrbitalBackground mode="public" />;
}
