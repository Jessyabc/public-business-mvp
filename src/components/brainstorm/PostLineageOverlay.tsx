import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight } from 'lucide-react';
import { BasePost } from '@/types/post';
import { supabase } from '@/integrations/supabase/client';
import { BrainstormPostCard } from '@/features/brainstorm/components/BrainstormPostCard';
import { Button } from '@/components/ui/button';

interface PostLineageOverlayProps {
  postId: string | null;
  onClose: () => void;
}

export function PostLineageOverlay({ postId, onClose }: PostLineageOverlayProps) {
  const [rootPost, setRootPost] = useState<BasePost | null>(null);
  const [linkedPosts, setLinkedPosts] = useState<BasePost[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!postId) {
      setRootPost(null);
      setLinkedPosts([]);
      return;
    }

    const fetchLineage = async () => {
      setLoading(true);
      try {
        // Fetch root post
        const { data: post } = await supabase
          .from('posts')
          .select('*')
          .eq('id', postId)
          .single();

        if (post) {
          setRootPost(post as BasePost);
        }

        // Fetch all posts linked to this one (children)
        const { data: relations } = await supabase
          .from('post_relations')
          .select('child_post_id')
          .eq('parent_post_id', postId);

        if (relations && relations.length > 0) {
          const childIds = relations.map(r => r.child_post_id);
          const { data: children } = await supabase
            .from('posts')
            .select('*')
            .in('id', childIds)
            .order('created_at', { ascending: false });

          setLinkedPosts((children || []) as BasePost[]);
        } else {
          setLinkedPosts([]);
        }
      } catch (error) {
        console.error('Error fetching lineage:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLineage();
  }, [postId]);

  return (
    <AnimatePresence>
      {postId && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed inset-x-0 bottom-0 z-50 h-[80vh] glass-ios-triple border-t border-white/20 overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.10)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Post Lineage</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="text-white/70 text-center py-8">Loading lineage...</div>
              ) : (
                <>
                  {/* Root Post */}
                  {rootPost && (
                    <div>
                      <div className="text-xs uppercase tracking-wider text-white/50 mb-2">
                        Original Post
                      </div>
                      <BrainstormPostCard post={rootPost} variant="compact" />
                    </div>
                  )}

                  {/* Linked Posts */}
                  {linkedPosts.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/50 mb-2">
                        <ChevronRight className="w-4 h-4" />
                        Continuations ({linkedPosts.length})
                      </div>
                      <div className="space-y-3 pl-4">
                        {linkedPosts.map((post) => (
                          <BrainstormPostCard key={post.id} post={post} variant="compact" />
                        ))}
                      </div>
                    </div>
                  )}

                  {linkedPosts.length === 0 && rootPost && (
                    <div className="text-white/50 text-center py-8">
                      No continuations yet. Be the first to continue this thread!
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
