import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface LineagePreviewProps {
  postId: string;
  isHovered: boolean;
  position: 'above' | 'below';
}

interface PreviewPost {
  id: string;
  title: string | null;
  content: string;
  author_name: string | null;
}

export function LineagePreview({ postId, isHovered, position }: LineagePreviewProps) {
  const [posts, setPosts] = useState<PreviewPost[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isHovered) return;

    const fetchLineage = async () => {
      setLoading(true);
      try {
        const relationType = position === 'above' ? 'child_post_id' : 'parent_post_id';
        const selectColumn = position === 'above' ? 'parent_post_id' : 'child_post_id';
        
        const { data: relations } = await supabase
          .from('post_relations')
          .select(`${selectColumn}`)
          .eq(relationType, postId)
          .eq('relation_type', 'reply')
          .limit(3);

        if (!relations?.length) {
          setPosts([]);
          return;
        }

        const postIds = relations.map(r => r[selectColumn as keyof typeof r]);
        
        const { data: postsData } = await supabase
          .from('posts')
          .select('id, title, content, user_id')
          .in('id', postIds);

        if (postsData) {
          const userIds = postsData.map(p => p.user_id).filter(Boolean);
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, display_name')
            .in('id', userIds);

          const profileMap = new Map(profiles?.map(p => [p.id, p.display_name]) || []);
          
          setPosts(postsData.map(p => ({
            id: p.id,
            title: p.title,
            content: p.content,
            author_name: profileMap.get(p.user_id) || 'Anonymous'
          })));
        }
      } catch (err) {
        console.error('Error fetching lineage:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLineage();
  }, [postId, isHovered, position]);

  if (!isHovered || posts.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: position === 'above' ? 10 : -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: position === 'above' ? 10 : -10, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={cn(
          "absolute left-4 right-4 z-50 pointer-events-none",
          position === 'above' ? '-top-2 -translate-y-full' : '-bottom-2 translate-y-full'
        )}
      >
        {/* Connection indicator */}
        <div className={cn(
          "flex items-center justify-center mb-2",
          position === 'below' && 'flex-col-reverse mt-2 mb-0'
        )}>
          {position === 'above' ? (
            <ChevronUp className="w-4 h-4 text-[var(--accent)]/50 animate-pulse" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[var(--accent)]/50 animate-pulse" />
          )}
        </div>

        {/* Preview cards */}
        <div className="space-y-2">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1 - index * 0.2, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "p-3 rounded-xl",
                "bg-white/5 backdrop-blur-md border border-white/10",
                "shadow-lg shadow-black/20"
              )}
              style={{ 
                transform: `scale(${1 - index * 0.05})`,
                marginLeft: `${index * 8}px`
              }}
            >
              <p className="text-xs text-white/50 mb-1">{post.author_name}</p>
              <p className="text-sm text-white/80 line-clamp-2">
                {post.title || post.content.slice(0, 100)}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Glow effect */}
        <div className={cn(
          "absolute inset-0 rounded-xl opacity-30 blur-xl -z-10",
          "bg-gradient-to-b from-[var(--accent)]/20 to-transparent"
        )} />
      </motion.div>
    </AnimatePresence>
  );
}
