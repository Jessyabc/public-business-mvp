/**
 * Think Space: Break Composer Modal
 * 
 * Appears after the break gesture snaps. Styled with PB Blue glow skin.
 * User writes their first thought for the new chain here.
 * On anchor (blur/submit), the new chain is officially started.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const PB_BLUE = '#489FE3';

interface BreakComposerProps {
  isOpen: boolean;
  onSubmit: (content: string, chainLabel: string) => void;
  onCancel: () => void;
}

export function BreakComposer({ isOpen, onSubmit, onCancel }: BreakComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const labelRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [chainLabel, setChainLabel] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const isMobile = useIsMobile();

  // Auto-focus textarea when opening
  useEffect(() => {
    if (isOpen) {
      setContent('');
      setChainLabel('');
      // Slight delay for animation to start
      setTimeout(() => textareaRef.current?.focus(), 250);
    }
  }, [isOpen]);

  // Auto-resize textarea
  const handleInput = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = content.trim();
    if (trimmed) {
      onSubmit(trimmed, chainLabel.trim());
    } else {
      onCancel();
    }
  }, [content, chainLabel, onSubmit, onCancel]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  }, [handleSubmit, onCancel]);

  // Click backdrop to submit (if has content) or cancel
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleSubmit();
    }
  }, [handleSubmit]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 md:pt-32 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleBackdropClick}
          style={{ background: 'rgba(0, 0, 0, 0.15)', backdropFilter: 'blur(4px)' }}
        >
          <motion.div
            className="w-full max-w-2xl"
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Blue glow aura */}
            <div 
              className="absolute -inset-4 rounded-3xl pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at center, ${PB_BLUE}18 0%, transparent 70%)`,
                filter: 'blur(20px)',
              }}
            />
            
            {/* Composer card */}
            <div 
              className="relative rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.45)',
                backdropFilter: 'blur(32px)',
                WebkitBackdropFilter: 'blur(32px)',
                border: `1.5px solid ${PB_BLUE}40`,
                boxShadow: `
                  0 0 0 1px ${PB_BLUE}10,
                  0 8px 40px rgba(72, 159, 227, 0.2),
                  0 2px 12px rgba(72, 159, 227, 0.1),
                  inset 0 0 0 1px rgba(255, 255, 255, 0.3)
                `,
              }}
            >
              {/* Glass shine */}
              <div 
                className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 40%, rgba(72, 159, 227, 0.05) 100%)'
                }}
              />
              
              {/* Header: "New Chain" label + optional name */}
              <div className="relative z-10 px-6 pt-5 pb-2 flex items-center gap-3">
                <motion.div
                  className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ background: PB_BLUE, boxShadow: `0 0 8px ${PB_BLUE}60` }}
                  />
                  <span className="text-xs font-medium" style={{ color: PB_BLUE }}>
                    New Chain
                  </span>
                </motion.div>
                <input
                  ref={labelRef}
                  type="text"
                  value={chainLabel}
                  onChange={e => setChainLabel(e.target.value)}
                  placeholder="Name (optional)..."
                  className="flex-1 bg-transparent border-none outline-none text-xs min-w-0"
                  style={{ color: '#6B635B' }}
                  onKeyDown={handleKeyDown}
                />
              </div>
              
              {/* Writing area */}
              <textarea
                ref={textareaRef}
                value={content}
                onChange={e => { setContent(e.target.value); handleInput(); }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => {
                  setIsFocused(false);
                  // Don't auto-submit on blur for modal - user might be clicking the label input
                }}
                onKeyDown={handleKeyDown}
                placeholder="First thought on this new thread..."
                className={cn(
                  "relative z-10 w-full min-h-[100px] px-6 pb-6 pt-2",
                  "bg-transparent border-none outline-none resize-none",
                  "text-lg leading-relaxed",
                  "placeholder:opacity-35",
                  "focus:outline-none focus:ring-0"
                )}
                style={{
                  color: '#3D3833',
                  caretColor: PB_BLUE,
                }}
              />
              
              {/* Bottom hint */}
              <div className="relative z-10 px-6 pb-4 flex items-center justify-between">
                <span className="text-xs opacity-40" style={{ color: '#6B635B' }}>
                  {isMobile ? 'Tap outside to save' : '⌘↵ to save · Esc to cancel'}
                </span>
                <button
                  onClick={handleSubmit}
                  className="text-xs px-3 py-1 rounded-lg font-medium transition-colors"
                  style={{ 
                    color: content.trim() ? '#fff' : PB_BLUE,
                    background: content.trim() ? PB_BLUE : `${PB_BLUE}15`,
                  }}
                >
                  Anchor
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
