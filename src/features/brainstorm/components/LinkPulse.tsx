import { motion } from 'framer-motion';

export function LinkPulse({ type }: { type: 'hard' | 'soft' }) {
  return (
    <motion.div
      className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-[3px] rounded-full pointer-events-none z-50"
      initial={{ opacity: 0, scaleY: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scaleY: [0, 1, 1],
      }}
      transition={{
        duration: 1.6,
        ease: 'easeInOut',
      }}
      style={{
        background:
          type === 'hard'
            ? 'linear-gradient(to bottom, #489FE3, #67FFD8)'
            : 'repeating-linear-gradient(to bottom, #67FFD8, #FFC85B 4px, transparent 8px)',
        boxShadow:
          type === 'hard'
            ? '0 0 16px rgba(72,159,227,0.6), 0 0 36px rgba(103,255,216,0.4)'
            : '0 0 12px rgba(255,200,91,0.6), 0 0 36px rgba(103,255,216,0.3)',
      }}
    />
  );
}
