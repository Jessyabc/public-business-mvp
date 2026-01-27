export function GlowDefs() {
  return (
    <svg width="0" height="0" className="absolute">
      <defs>
        {/* Solid PB blue with glow for HARD links */}
        <filter id="pb-glow">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#489FE3" floodOpacity="0.85" />
        </filter>

        {/* Gradient for dotted SOFT handoff */}
        <linearGradient id="pb-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#489FE3" />
          <stop offset="50%" stopColor="#E8F7FF" />
          <stop offset="100%" stopColor="#67FFD8" />
        </linearGradient>
        <filter id="pb-grad-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
