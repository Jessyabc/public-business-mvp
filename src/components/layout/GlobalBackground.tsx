import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDiscussLensSafe } from '@/contexts/DiscussLensContext';
import { OrbitalBackground } from './OrbitalBackground';

/**
 * GlobalBackground - Route-aware background
 * 
 * Rules:
 * - Logged-out users: Animated orbs (public mode)
 * - Think page (/): Static neumorphic (workspace mode) - light, paper-like
 * - Discuss (/discuss): Respects lens toggle (public = dark animated, business = light static)
 * - Other routes for logged-in users: Dark animated (public mode)
 */
export function GlobalBackground() {
  const { user } = useAuth();
  const location = useLocation();
  const { lens } = useDiscussLensSafe();

  // Logged-out users on landing page get animated orbs
  if (!user) {
    return <OrbitalBackground mode="public" />;
  }

  // ONLY Think page uses neumorphic workspace background
  const isThinkPage = location.pathname === '/' || location.pathname === '/workspace';
  if (isThinkPage) {
    return <OrbitalBackground mode="workspace" />;
  }

  // Discuss respects the lens
  if (location.pathname.startsWith('/discuss')) {
    return <OrbitalBackground mode={lens} />;
  }

  // All other logged-in pages: use dark animated (public mode)
  return <OrbitalBackground mode="public" />;
}
