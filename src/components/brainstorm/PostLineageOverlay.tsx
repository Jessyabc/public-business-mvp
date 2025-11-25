import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { BasePost } from '@/types/post';
import { PostToSparkCard } from '@/components/brainstorm/PostToSparkCard';
import { CrossLinksFeed } from '@/features/brainstorm/components/CrossLinksFeed';
import { getPostRelations } from '@/lib/getPostRelations';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface PostLineageOverlayProps {
  activePost: BasePost | null;
  onClose: () => void;
}

export function PostLineageOverlay({ activePost, onClose }: PostLineageOverlayProps) {
  const [currentPost, setCurrentPost] = useState<BasePost | null>(activePost);
  const [continuations, setContinuations] = useState<BasePost[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Sync currentPost with activePost prop
  useEffect(() => {
    setCurrentPost(activePost);
  }, [activePost]);

  useEffect(() => {
    if (!currentPost) {
      setContinuations([]);
      return;
    }

    const fetchLineage = async () => {
      setLoading(true);
      try {
        // Fetch continuations using getPostRelations (hard children)
        const relations = await getPostRelations(currentPost.id);
        const hardChildren = relations.hardChildren || [];
        
        // Sort by created_at, newest first
        const sorted = [...hardChildren].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        
        setContinuations(sorted);
      } catch (error) {
        console.error('Error fetching lineage:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLineage();
  }, [currentPost]);

  // Handle cross-link selection - switch to that post
  const handleSelectPost = async (postId: string) => {
    try {
      // Fetch the post by ID
      const { data: post, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .eq('type', 'brainstorm')
        .eq('mode', 'public')
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error fetching post:', error);
        return;
      }

      if (post) {
        // Update current post
        setCurrentPost(post as BasePost);
        
        // Scroll to top of the lineage column
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (error) {
      console.error('Error selecting post:', error);
    }
  };

  // ESC key handler
  useEffect(() => {
    if (!activePost) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [activePost, onClose]);

  // Close overlay when continue event is dispatched (composer will open)
  useEffect(() => {
    if (!activePost) return;

    const handleContinue = () => {
      onClose();
    };

    window.addEventListener('pb:brainstorm:continue', handleContinue);
    return () => {
      window.removeEventListener('pb:brainstorm:continue', handleContinue);
    };
  }, [activePost, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // If no active post, render nothing
  if (!activePost || !currentPost) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={handleBackdropClick}
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
      >
        {/* Bottom Sheet Container */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none pb-20 sm:pb-24"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Spark lineage"
        >
          {/* Sheet Wrapper */}
          <div className="w-full max-w-5xl mx-auto px-4 pointer-events-auto max-h-[85vh] flex flex-col">
            {/* Glass Panel */}
            <div
              className={cn(
                "relative w-full rounded-t-3xl sm:rounded-3xl",
                "bg-slate-900/70 backdrop-blur-2xl",
                "border border-white/12",
                "shadow-[0_24px_80px_rgba(0,0,0,0.7)]",
                "overflow-hidden flex flex-col flex-1",
                "min-h-0"
              )}
            >
              {/* Inner gradient overlay */}
              <div className="pointer-events-none absolute inset-0 opacity-70 bg-gradient-to-b from-white/8 via-transparent to-[#489FE3]/16" />

              {/* Drag handle bar */}
              <div className="flex items-center justify-center pt-3 pb-2 relative z-10">
                <div className="h-1.5 w-12 rounded-full bg-white/30" />
              </div>

              {/* Content wrapper */}
              <div className="relative z-10 flex flex-col flex-1 min-h-0">
                {/* Header: title + close button */}
                <header className="flex items-center justify-between px-4 pb-2">
                  <div className="text-xs uppercase tracking-[0.25em] text-white/60">
                    Brainstorm Lineage
                  </div>
                  <button
                    onClick={onClose}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/16 border border-white/20 text-white/80 hover:text-white transition-colors"
                    aria-label="Close overlay"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </header>

                {/* Main Content Area - Side by side on desktop, stacked on mobile */}
                <div className="flex flex-col gap-4 px-4 pb-4 sm:flex-row sm:gap-6 sm:px-5 sm:pb-5 flex-1 min-h-0">
                  {/* Left: lineage column */}
                  <div 
                    ref={scrollContainerRef}
                    className="flex-1 min-w-0 max-h-[70vh] overflow-y-auto pr-1 sm:pr-2 space-y-4"
                  >
                    {loading ? (
                      <div className="text-white/70 text-center py-12">
                        <div className="inline-block w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <p className="mt-3 text-sm">Loading lineage...</p>
                      </div>
                    ) : (
                      <>
                        {/* Show currentPost using PostToSparkCard */}
                        <PostToSparkCard 
                          post={currentPost} 
                          onSelect={(post) => {
                            // Allow clicking the main post to switch (for consistency)
                            if (post.id !== currentPost.id) {
                              handleSelectPost(post.id);
                            }
                          }} 
                        />

                        {/* Continuations */}
                        {continuations.length > 0 && (
                          <div className="space-y-4">
                            {continuations.map((post) => (
                              <PostToSparkCard
                                key={post.id}
                                post={post}
                                onSelect={(selectedPost) => {
                                  // Clicking a continuation switches the overlay to that post
                                  handleSelectPost(selectedPost.id);
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Right: cross-links */}
                  <div className="w-full sm:w-80 max-w-full">
                    <CrossLinksFeed 
                      postId={currentPost.id} 
                      onSelectPost={handleSelectPost}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
