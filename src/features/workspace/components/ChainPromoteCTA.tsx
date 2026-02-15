/**
 * ChainPromoteCTA - "Ready to share this thread?" 
 * 
 * Appears at the bottom of chain view feed.
 * Opens the composer with chain thoughts as collapsible reference.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, ChevronUp, X, Send } from 'lucide-react';
import { useChainStore } from '../stores/chainStore';
import { useFeedStore } from '../stores/feedStore';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ThoughtObject } from '../types';

const PB_BLUE = '#489FE3';

interface ChainPromoteCTAProps {
  chainId: string;
  thoughts: ThoughtObject[];
}

export function ChainPromoteCTA({ chainId, thoughts }: ChainPromoteCTAProps) {
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isRefExpanded, setIsRefExpanded] = useState(false);
  const [sparkContent, setSparkContent] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const { user } = useAuth();
  const { getChainById } = useChainStore();
  
  const chain = getChainById(chainId);
  const chainLabel = chain?.display_label || 'this thread';

  // Only show in chain scope
  const { scope } = useFeedStore();
  if (scope !== 'chain') return null;
  if (thoughts.length === 0) return null;

  const handlePublish = async () => {
    if (!sparkContent.trim() || !user) return;
    setIsPublishing(true);

    try {
      // 1. Create the Spark post
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: sparkContent.trim(),
          type: 'spark',
          mode: 'public',
          status: 'published',
          visibility: 'public',
          published_at: new Date().toISOString(),
        } as any)
        .select('id')
        .single();

      if (postError) throw postError;

      // 2. Create the private chain-spark link
      const { error: linkError } = await supabase
        .from('chain_spark_links')
        .insert({
          user_id: user.id,
          chain_id: chainId,
          post_id: post.id,
        });

      if (linkError) throw linkError;

      toast.success('Spark published from your thread ✨');
      setSparkContent('');
      setIsComposerOpen(false);
    } catch (err) {
      console.error('Failed to publish spark:', err);
      toast.error('Failed to publish. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="w-full mt-6 mb-4">
      {!isComposerOpen ? (
        <motion.button
          onClick={() => setIsComposerOpen(true)}
          className="w-full py-4 px-5 rounded-2xl text-center transition-all duration-200"
          style={{
            background: 'rgba(72, 159, 227, 0.06)',
            border: `1px dashed ${PB_BLUE}30`,
            color: PB_BLUE,
          }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Ready to share {chainLabel}?
          </div>
          <p className="text-xs mt-1 opacity-60">
            Synthesize your thoughts into a Spark for Discuss
          </p>
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: '#FAF7F4',
            border: `1px solid ${PB_BLUE}20`,
            boxShadow: `0 4px 20px rgba(72, 159, 227, 0.08)`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: `${PB_BLUE}10` }}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: PB_BLUE }} />
              <span className="text-sm font-medium" style={{ color: '#3D3833' }}>
                Compose Spark
              </span>
            </div>
            <button 
              onClick={() => { setIsComposerOpen(false); setSparkContent(''); }}
              className="p-1 rounded-lg opacity-50 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" style={{ color: '#6B635B' }} />
            </button>
          </div>

          {/* Collapsible chain reference */}
          <div className="px-4 py-2 border-b" style={{ borderColor: `${PB_BLUE}08` }}>
            <button
              onClick={() => setIsRefExpanded(!isRefExpanded)}
              className="flex items-center gap-2 text-xs w-full"
              style={{ color: '#9A8F85' }}
            >
              {isRefExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              <span>{thoughts.length} thoughts from {chainLabel}</span>
            </button>
            
            <AnimatePresence>
              {isRefExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto pb-2">
                    {thoughts.map((t) => (
                      <div 
                        key={t.id}
                        className="text-xs p-2 rounded-lg leading-relaxed"
                        style={{ 
                          background: 'rgba(0,0,0,0.03)',
                          color: '#6B635B',
                        }}
                      >
                        {t.content}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Composer textarea */}
          <div className="p-4">
            <textarea
              value={sparkContent}
              onChange={(e) => setSparkContent(e.target.value)}
              placeholder="Write your Spark — synthesize, don't paste..."
              className="w-full min-h-[100px] bg-transparent border-none outline-none resize-none text-sm leading-relaxed placeholder:opacity-40"
              style={{ color: '#3D3833', caretColor: PB_BLUE }}
              autoFocus
            />
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: `${PB_BLUE}10` }}>
            <span className="text-xs opacity-40" style={{ color: '#6B635B' }}>
              Only you can see the link to this chain
            </span>
            <button
              onClick={handlePublish}
              disabled={!sparkContent.trim() || isPublishing}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium",
                "transition-all duration-200",
                sparkContent.trim() && !isPublishing
                  ? "opacity-100"
                  : "opacity-40 cursor-not-allowed"
              )}
              style={{
                background: PB_BLUE,
                color: 'white',
              }}
            >
              <Send className="w-3.5 h-3.5" />
              {isPublishing ? 'Publishing...' : 'Publish Spark'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
