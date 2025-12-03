import { motion, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CosmicPullRefreshProps {
  pullDistance: number;
  isRefreshing: boolean;
  threshold?: number;
}

export function CosmicPullRefresh({ 
  pullDistance, 
  isRefreshing, 
  threshold = 80 
}: CosmicPullRefreshProps) {
  const progress = Math.min(pullDistance / threshold, 1);
  const springProgress = useSpring(progress, { stiffness: 300, damping: 30 });
  
  const scale = useTransform(springProgress, [0, 1], [0.5, 1]);
  const rotate = useTransform(springProgress, [0, 1], [0, 180]);
  const opacity = useTransform(springProgress, [0, 0.3, 1], [0, 0.5, 1]);

  const numStars = 12;
  const stars = Array.from({ length: numStars }, (_, i) => ({
    angle: (i / numStars) * 360,
    delay: i * 0.05
  }));

  if (pullDistance <= 0 && !isRefreshing) return null;

  return (
    <div className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none z-50">
      <motion.div
        style={{ 
          y: Math.min(pullDistance * 0.5, 60),
          opacity
        }}
        className="relative w-20 h-20"
      >
        {/* Central orb */}
        <motion.div
          style={{ scale }}
          className={cn(
            "absolute inset-0 m-auto w-8 h-8 rounded-full",
            "bg-gradient-to-br from-[var(--accent)] to-purple-500",
            "shadow-[0_0_20px_rgba(72,159,227,0.5)]",
            isRefreshing && "animate-pulse"
          )}
        />

        {/* Orbiting stars */}
        {stars.map((star, i) => (
          <motion.div
            key={i}
            animate={isRefreshing ? {
              rotate: [star.angle, star.angle + 360],
            } : {
              rotate: star.angle + progress * 90
            }}
            transition={isRefreshing ? {
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            } : {
              type: "spring"
            }}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transformOrigin: '0 0',
            }}
          >
            <motion.div
              style={{
                x: 25 + progress * 10,
                y: -2,
                scale: 0.5 + progress * 0.5,
                opacity: 0.3 + progress * 0.7
              }}
              className={cn(
                "w-2 h-2 rounded-full",
                i % 3 === 0 ? "bg-[var(--accent)]" :
                i % 3 === 1 ? "bg-purple-400" : "bg-white"
              )}
            />
          </motion.div>
        ))}

        {/* Scatter effect on threshold */}
        {progress >= 1 && !isRefreshing && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`scatter-${i}`}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ 
                  scale: [0, 1.5, 0],
                  opacity: [1, 0.5, 0],
                  x: Math.cos((i / 8) * Math.PI * 2) * 40,
                  y: Math.sin((i / 8) * Math.PI * 2) * 40
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute left-1/2 top-1/2 w-1 h-1 rounded-full bg-white"
              />
            ))}
          </>
        )}

        {/* Loading text */}
        {isRefreshing && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/60 whitespace-nowrap"
          >
            Discovering...
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
