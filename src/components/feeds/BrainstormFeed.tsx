import { useEffect, useRef, useState } from 'react';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/contexts/AuthContext';
import { useComposerStore } from '@/hooks/useComposerStore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Sparkles, Plus, ToggleLeft } from 'lucide-react';
import { useAppMode } from '@/contexts/AppModeContext';
import { useNavigate } from 'react-router-dom';

export function BrainstormFeed() {
  const { posts, loading, fetchPosts } = usePosts();
  const { user } = useAuth();
  const { openComposer } = useComposerStore();
  const { toggleMode } = useAppMode();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch brainstorm posts
  useEffect(() => {
    fetchPosts('public');
  }, []);

  // Filter to only brainstorm posts
  const brainstormPosts = posts.filter(post => post.type === 'brainstorm' && post.mode === 'public');

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
    // In a real implementation, you'd fetch more posts here
  };

  const handleCreateBrainstorm = () => {
    if (!user) {
      toast.error("Please login to create brainstorms");
      return;
    }
    openComposer({});
  };

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-8 h-8 mx-auto mb-4 text-blue-400 animate-pulse" />
          <div className="text-blue-200">Loading brainstorms...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 pb-4">
        <div className="glass-card max-w-4xl mx-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Brainstorm Network
              </h1>
              <p className="text-blue-200">
                Explore ideas, connect thoughts, and spark innovation
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={toggleMode}
                variant="ghost"
                size="sm"
                className="text-blue-200 hover:text-white hover:bg-white/10"
              >
                <ToggleLeft className="w-4 h-4 mr-2" />
                Switch to Business
              </Button>
              
              <Button
                onClick={handleCreateBrainstorm}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Brainstorm
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Feed Content */}
      <div className="px-6 pb-32">
        <div className="max-w-4xl mx-auto">
          {brainstormPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="glass-card p-8">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-blue-400" />
                <h3 className="text-xl font-medium text-white mb-2">No brainstorms yet</h3>
                <p className="text-blue-200 mb-6">Be the first to share an idea and start the conversation!</p>
                <Button onClick={handleCreateBrainstorm} className="bg-blue-600 hover:bg-blue-700">
                  Start Your First Brainstorm
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {brainstormPosts.map((post, index) => (
                <div key={post.id} className="relative">
                  <div 
                    className="glass-card p-6 cursor-pointer hover:scale-[1.02] transition-all duration-200"
                    onClick={() => navigate(`/app/public/brainstorms/${post.id}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2 leading-tight">
                          {post.title || 'Untitled Brainstorm'}
                        </h3>
                        <p className="text-blue-200 leading-relaxed line-clamp-3">
                          {post.content.substring(0, 200)}
                          {post.content.length > 200 && "..."}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-blue-300">
                        <span>By Anonymous</span>
                        <span>•</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-300 hover:text-white hover:bg-blue-600/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            openComposer({ 
                              parentPostId: post.id, 
                              relationType: 'continuation'
                            });
                          }}
                        >
                          Continue
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-300 hover:text-white hover:bg-blue-600/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            openComposer({ 
                              parentPostId: post.id, 
                              relationType: 'linking'
                            });
                          }}
                        >
                          Link
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Connection line to next post */}
                  {index < brainstormPosts.length - 1 && (
                    <div className="flex justify-center my-4">
                      <div className="w-0.5 h-8 bg-gradient-to-b from-blue-400/50 to-transparent"></div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Load More */}
              {hasMore && (
                <div className="text-center pt-6">
                  <Button 
                    onClick={handleLoadMore}
                    variant="outline" 
                    className="glass-card hover:bg-white/10 text-blue-200 border-blue-400/30"
                    size="lg"
                  >
                    Load More Brainstorms
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}