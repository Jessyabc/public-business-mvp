import { useAppMode } from '@/contexts/AppModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Building2, Plus, FileText, Calendar, Eye, Heart, MessageCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComposerStore } from '@/hooks/useComposerStore';
import { usePosts } from '@/hooks/usePosts';
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const MyPosts = () => {
  const { mode } = useAppMode();
  const { user } = useAuth();
  const { openComposer } = useComposerStore();
  const { posts, loading, error, fetchUserPosts } = usePosts();

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p>Please sign in to view your posts.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`min-h-screen p-6 pb-32 transition-all duration-700 ease-in-out glass-distort ${
      mode === 'public' 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className={`glass-card rounded-3xl p-8 backdrop-blur-xl transition-all duration-700 ${
            mode === 'public'
              ? 'border-white/20 bg-black/20'
              : 'border-blue-200/30 bg-white/40'
          }`}>
            <div className="flex items-center justify-center space-x-3 mb-4">
              {mode === 'public' ? (
                <Brain className="w-8 h-8 text-[#489FE3]" />
              ) : (
                <Building2 className="w-8 h-8 text-blue-600" />
              )}
              <h1 className={`text-4xl font-light tracking-wide ${
                mode === 'public' ? 'text-white' : 'text-slate-800'
              }`}>
                My Posts
              </h1>
            </div>
            <p className={`mt-2 font-light max-w-2xl mx-auto text-center ${
              mode === 'public' ? 'text-white/80' : 'text-slate-600'
            }`}>
              {mode === 'public' 
                ? 'Your brainstorms, insights, and contributions to the community'
                : 'Your business posts, insights, and professional content'
              }
            </p>
          </div>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className={`transition-all duration-700 ${
                mode === 'public'
                  ? 'glass-card border-white/20 bg-black/20'
                  : 'border-blue-200/30 bg-white/40'
              }`}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <Card className={`transition-all duration-700 ${
            mode === 'public'
              ? 'glass-card border-red-500/20 bg-red-500/10'
              : 'border-red-200/30 bg-red-50/40'
          }`}>
            <CardContent className="p-8 text-center">
              <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${
                mode === 'public' ? 'text-red-400' : 'text-red-600'
              }`} />
              <h3 className={`text-lg font-medium mb-2 ${
                mode === 'public' ? 'text-white' : 'text-red-600'
              }`}>
                Failed to Load Posts
              </h3>
              <p className={`mb-4 ${
                mode === 'public' ? 'text-white/70' : 'text-red-600/80'
              }`}>
                {error}
              </p>
              <Button 
                onClick={() => fetchUserPosts()}
                variant="outline"
                className={
                  mode === 'public'
                    ? 'border-red-400/50 text-red-400 hover:bg-red-400/10'
                    : 'border-red-600 text-red-600 hover:bg-red-50'
                }
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Content Area */}
        {!loading && !error && (
          <div className="space-y-6">
            {posts.length === 0 ? (
              /* Empty State */
              <Card className={`p-8 text-center transition-all duration-700 ${
                mode === 'public'
                  ? 'glass-card border-white/20 bg-black/20'
                  : 'border-blue-200/30 bg-white/40'
              }`}>
                <div className="space-y-4">
                  <FileText className={`w-16 h-16 mx-auto ${
                    mode === 'public' ? 'text-white/40' : 'text-slate-400'
                  }`} />
                  <h3 className={`text-xl font-medium ${
                    mode === 'public' ? 'text-white' : 'text-slate-800'
                  }`}>
                    No Posts Yet
                  </h3>
                  <p className={`text-lg ${
                    mode === 'public' ? 'text-white/70' : 'text-slate-600'
                  }`}>
                    {mode === 'public' 
                      ? "You haven't created any posts yet. Share your ideas!"
                      : "You haven't published any business content yet."
                    }
                  </p>
                  <Button 
                    onClick={() => openComposer()}
                    className={`transition-all duration-300 ${
                      mode === 'public'
                        ? 'bg-[#489FE3]/20 hover:bg-[#489FE3]/30 text-white border-[#489FE3]/50'
                        : 'bg-blue-100/40 hover:bg-blue-100/60 text-blue-600 border-blue-300/40'
                    } glass-card backdrop-blur-xl`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Post
                  </Button>
                </div>
              </Card>
            ) : (
              /* Posts List */
              <>
                <div className="flex justify-between items-center">
                  <p className={`text-sm ${
                    mode === 'public' ? 'text-white/70' : 'text-slate-600'
                  }`}>
                    {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                  </p>
                  <Button 
                    onClick={() => openComposer()}
                    size="sm"
                    className={`transition-all duration-300 ${
                      mode === 'public'
                        ? 'bg-[#489FE3]/20 hover:bg-[#489FE3]/30 text-white border-[#489FE3]/50'
                        : 'bg-blue-100/40 hover:bg-blue-100/60 text-blue-600 border-blue-300/40'
                    } glass-card backdrop-blur-xl`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Post
                  </Button>
                </div>

                {posts.map((post) => (
                  <Card key={post.id} className={`transition-all duration-700 hover:scale-[1.02] ${
                    mode === 'public'
                      ? 'glass-card border-white/20 bg-black/20 hover:bg-black/30'
                      : 'border-blue-200/30 bg-white/40 hover:bg-white/60'
                  }`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={post.mode === 'public' ? 'default' : 'secondary'}>
                              {post.mode}
                            </Badge>
                            <Badge variant="outline">
                              {post.type}
                            </Badge>
                            <Badge variant="outline">
                              {post.visibility}
                            </Badge>
                          </div>
                          {post.title && (
                            <CardTitle className={`mb-2 ${
                              mode === 'public' ? 'text-white' : 'text-slate-800'
                            }`}>
                              {post.title}
                            </CardTitle>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.created_at)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className={`mb-4 line-clamp-3 ${
                        mode === 'public' ? 'text-white/80' : 'text-slate-700'
                      }`}>
                        {post.content}
                      </p>
                      
                      {/* Engagement Stats */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.views_count || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {post.likes_count || 0}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {post.comments_count || 0}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPosts;