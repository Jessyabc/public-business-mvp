// Centralized feature flags (Vite env)
export const SHOW_RIGHT_SIDEBAR =
  (import.meta.env.VITE_SHOW_RIGHT_SIDEBAR ?? 'true') !== 'false';

export const BRAINSTORM_WRITES_ENABLED =
  import.meta.env.VITE_BRAINSTORM_WRITES_ENABLED === 'true';
