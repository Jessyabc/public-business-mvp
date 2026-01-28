
export const SHOW_RIGHT_SIDEBAR =
  (import.meta.env.VITE_SHOW_RIGHT_SIDEBAR ?? 'true') !== 'false';

// Enable writes by default in dev, require explicit enable in production
export const BRAINSTORM_WRITES_ENABLED =
  import.meta.env.VITE_BRAINSTORM_WRITES_ENABLED !== 'false';
