/**
 * VoiceMicButton - Persistent mic icon for ThinkingSurface
 * 
 * Tap to start recording, tap again to stop.
 * Shows recording state with pulsing animation.
 */

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const PB_BLUE = '#489FE3';

interface VoiceMicButtonProps {
  isRecording: boolean;
  isProcessing: boolean;
  onToggle: () => void;
  className?: string;
}

export function VoiceMicButton({ isRecording, isProcessing, onToggle, className }: VoiceMicButtonProps) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle();
  }, [onToggle]);

  return (
    <motion.button
      onClick={handleClick}
      onMouseDown={(e) => e.preventDefault()} // prevent blur on textarea
      className={cn(
        "relative p-2 rounded-xl transition-all duration-200",
        "focus:outline-none focus:ring-0",
        className
      )}
      style={{
        background: isRecording 
          ? `${PB_BLUE}20` 
          : 'rgba(0, 0, 0, 0.04)',
        color: isRecording ? PB_BLUE : '#9A8F85',
      }}
      whileTap={{ scale: 0.9 }}
      aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
    >
      {/* Pulsing ring when recording */}
      {isRecording && (
        <motion.div
          className="absolute inset-0 rounded-xl"
          style={{ border: `2px solid ${PB_BLUE}` }}
          animate={{ 
            opacity: [0.6, 0.2, 0.6],
            scale: [1, 1.15, 1],
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: 'easeInOut' 
          }}
        />
      )}
      
      {isProcessing && !isRecording ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isRecording ? (
        <MicOff className="w-4 h-4" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </motion.button>
  );
}
