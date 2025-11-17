import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, GitBranch, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import type { BasePost } from '@/types/post';

interface BrainstormWithLineage
  extends Pick<BasePost, 'id' | 'likes_count' | 'comments_count' | 'created_at' | 'updated_at'> {
  title: BasePost['title'];
  content: BasePost['content'] | null;
  user_id: BasePost['user_id'] | null;
  parent_id: string | null;
  parent_type: string | null;
}

/**
 * BrainstormMap - Main visualization area for connected brainstorm ideas
 * 
 * Displays live brainstorm data from the brainstorms table with parent-child hierarchy
 * Subscribes to realtime updates for instant synchronization
 */
export function BrainstormMap() {
  const [brainstorms, setBrainstorms] = useState<BrainstormWithLineage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrainstorms();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('brainstorms-realtime')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'brainstorms' 
        },
        () => {
          fetchBrainstorms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBrainstorms = async () => {
    try {
      const { data, error } = await supabase
        .from('brainstorms' as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setBrainstorms((data || []) as unknown as BrainstormWithLineage[]);
    } catch (error) {
      console.error('Error fetching brainstorms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    );
  }

  if (brainstorms.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center space-y-4">
          <Sparkles className="w-12 h-12 text-blue-400 mx-auto" />
          <p className="text-white/80 text-lg">No brainstorms yet. Start exploring!</p>
        </div>
      </div>
    );
  }

  // Separate roots (no parent) from children
  const roots = brainstorms.filter(b => !b.parent_id);
  const childrenMap = brainstorms.reduce((acc, b) => {
    if (b.parent_id) {
      if (!acc[b.parent_id]) acc[b.parent_id] = [];
      acc[b.parent_id].push(b);
    }
    return acc;
  }, {} as Record<string, BrainstormWithLineage[]>);

  // Get related brainstorms (other roots)
  const relatedRoots = roots.slice(1, 4);

  return (
    <div className="flex items-center justify-center h-full w-full p-8 overflow-y-auto no-scrollbar">
      <div className="flex items-start justify-center gap-12 w-full max-w-6xl">
        
        {/* Main Central Idea */}
        {roots.length > 0 && (
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-8 shadow-lg hover:bg-white/15 transition-all duration-300 max-w-md"
            >
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-blue-300" />
                <h3 className="text-2xl font-bold text-white">
                  {roots[0].title || 'Brainstorm'}
                </h3>
              </div>
              <p className="text-white/80 leading-relaxed">
                {roots[0].content}
              </p>
              <div className="flex items-center gap-4 mt-4 text-sm text-white/60">
                <span>❤️ {roots[0].likes_count || 0}</span>
                <span>💬 {roots[0].comments_count || 0}</span>
              </div>
            </motion.div>
            
            {/* Child Ideas (continuations) */}
            {childrenMap[roots[0].id] && childrenMap[roots[0].id].length > 0 && (
              <div className="flex flex-col space-y-3 pl-8 w-full">
                {childrenMap[roots[0].id].slice(0, 3).map((child, idx) => (
                  <motion.div
                    key={child.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.1 }}
                    className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 px-6 py-4 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <GitBranch className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-semibold text-white/90">
                        {child.title || 'Related Idea'}
                      </span>
                    </div>
                    <p className="text-sm text-white/70 line-clamp-2">{child.content}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Related Brainstorms (other root-level brainstorms) */}
        {relatedRoots.length > 0 && (
          <div className="flex flex-col space-y-4 max-w-xs">
            <h4 className="text-lg font-semibold text-white/90">Related Brainstorms</h4>
            
            {relatedRoots.map((root, idx) => (
              <motion.div
                key={root.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3 hover:bg-white/10 transition-all duration-200 cursor-pointer"
              >
                {root.title && (
                  <p className="text-sm font-semibold text-white/90 mb-1">{root.title}</p>
                )}
                <p className="text-sm text-white/70 line-clamp-2">{root.content}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-white/50">
                  <span>❤️ {root.likes_count || 0}</span>
                  <span>💬 {root.comments_count || 0}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
}
