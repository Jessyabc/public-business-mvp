import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, GitBranch, Loader2 } from 'lucide-react';

interface Post {
  id: string;
  title: string | null;
  content: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  comments_count: number;
}

/**
 * BrainstormMap - Main visualization area for connected brainstorm ideas
 */
export function BrainstormMap() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrainstorms();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('brainstorm-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: 'type=eq.brainstorm'
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
        .from('posts')
        .select('id, title, content, created_at, user_id, likes_count, comments_count')
        .eq('type', 'brainstorm')
        .eq('visibility', 'public')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPosts(data || []);
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

  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="text-center space-y-4">
          <Sparkles className="w-12 h-12 text-blue-400 mx-auto" />
          <p className="text-white/80 text-lg">No brainstorms yet. Start exploring!</p>
        </div>
      </div>
    );
  }

  const mainPost = posts[0];
  const relatedPosts = posts.slice(1, 4);

  return (
    <div className="flex items-center justify-center h-full w-full p-8 overflow-y-auto no-scrollbar">
      <div className="flex items-start justify-center gap-12 w-full max-w-6xl">
        
        {/* Main Central Idea */}
        <div className="flex flex-col items-center space-y-4">
          <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-8 shadow-lg hover:bg-white/15 transition-all duration-300 max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-blue-300" />
              <h3 className="text-2xl font-bold text-white">
                {mainPost.title || 'Brainstorm'}
              </h3>
            </div>
            <p className="text-white/80 leading-relaxed">
              {mainPost.content}
            </p>
            <div className="flex items-center gap-4 mt-4 text-sm text-white/60">
              <span>❤️ {mainPost.likes_count}</span>
              <span>💬 {mainPost.comments_count}</span>
            </div>
          </div>
          
          {/* Related Ideas from same thread */}
          {posts.slice(1, 3).length > 0 && (
            <div className="flex flex-col space-y-3 pl-8">
              {posts.slice(1, 3).map((post) => (
                <div 
                  key={post.id}
                  className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 px-6 py-4 hover:bg-white/10 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <GitBranch className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-semibold text-white/90">
                      {post.title || 'Related Idea'}
                    </span>
                  </div>
                  <p className="text-sm text-white/70 line-clamp-2">{post.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related Brainstorms */}
        {relatedPosts.length > 0 && (
          <div className="flex flex-col space-y-4 max-w-xs">
            <h4 className="text-lg font-semibold text-white/90">Related Brainstorms</h4>
            
            {relatedPosts.map((post) => (
              <div 
                key={post.id}
                className="rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 px-4 py-3 hover:bg-white/10 transition-all duration-200 cursor-pointer"
              >
                {post.title && (
                  <p className="text-sm font-semibold text-white/90 mb-1">{post.title}</p>
                )}
                <p className="text-sm text-white/70 line-clamp-2">{post.content}</p>
              </div>
            ))}
          </div>
        )}
        
      </div>
    </div>
  );
}
