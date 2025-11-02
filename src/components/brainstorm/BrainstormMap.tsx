import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, GitBranch } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface BrainstormNode {
  id: string;
  title: string | null;
  content: string;
  created_at: string;
  likes_count: number;
  comments_count: number;
}

/**
 * BrainstormMap - Hierarchical visualization of brainstorm ideas
 * 
 * Displays a central main idea with connected continuation nodes
 * in a vertical tree layout with glass morphism styling.
 */
export function BrainstormMap() {
  const [brainstorms, setBrainstorms] = useState<BrainstormNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainIdea, setMainIdea] = useState<BrainstormNode | null>(null);

  useEffect(() => {
    loadBrainstorms();

    // Realtime subscription
    const channel = supabase
      .channel('posts-brainstorms')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: 'type=eq.brainstorm'
        },
        () => loadBrainstorms()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadBrainstorms = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, content, created_at, likes_count, comments_count')
        .eq('type', 'brainstorm')
        .eq('status', 'active')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const nodes = (data || []).map(post => ({
        id: post.id,
        title: post.title,
        content: post.content,
        created_at: post.created_at,
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
      }));

      setBrainstorms(nodes);
      if (nodes.length > 0) {
        setMainIdea(nodes[0]);
      }
    } catch (err) {
      console.error('Error loading brainstorms:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="w-full max-w-2xl space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-32 w-3/4 mx-auto rounded-2xl" />
          <Skeleton className="h-32 w-3/4 mx-auto rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!mainIdea) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl max-w-md">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary/60" />
          <h3 className="text-xl font-semibold mb-2">No brainstorms yet</h3>
          <p className="text-sm text-muted-foreground">
            Be the first to start a conversation
          </p>
        </div>
      </div>
    );
  }

  const continuingIdeas = brainstorms.slice(1, 4);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-4" style={{ scrollbarGutter: 'stable' }}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        {/* Central Main Idea */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative"
        >
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:bg-white/10 transition-all duration-300">
            <div className="flex items-start gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{mainIdea.title || 'Untitled'}</h2>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {mainIdea.content}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground mt-4 pt-4 border-t border-white/10">
              <span>{mainIdea.likes_count} likes</span>
              <span>{mainIdea.comments_count} comments</span>
              <span className="ml-auto">
                {new Date(mainIdea.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Connection Line */}
        {continuingIdeas.length > 0 && (
          <div className="flex justify-center">
            <div className="w-px h-12 bg-gradient-to-b from-primary/40 to-transparent" />
          </div>
        )}

        {/* Continuing Ideas */}
        <div className="space-y-6">
          {continuingIdeas.map((idea, index) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="relative pl-8"
            >
              {/* Branch connector */}
              <div className="absolute left-0 top-1/2 w-8 h-px bg-gradient-to-r from-primary/40 to-transparent" />
              <GitBranch className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />

              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-inner hover:bg-white/10 transition-all duration-200">
                <h3 className="text-lg font-semibold mb-2">{idea.title || 'Untitled'}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {idea.content}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{idea.likes_count} likes</span>
                  <span>{idea.comments_count} comments</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
