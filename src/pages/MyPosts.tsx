import { useAppMode } from '@/contexts/AppModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/ui/components/GlassCard';
import { Brain, Building2, Plus, FileText, Calendar, Eye, Heart, MessageCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComposerStore } from '@/hooks/useComposerStore';
import { usePosts } from '@/hooks/usePosts';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeedContainer } from '@/features/feed/FeedContainer';
import { PostReaderModal } from '@/components/posts/PostReaderModal';
import type { Post } from '@/types/post';

const MyPosts = () => {
  const { mode } = useAppMode();
  const { user } = useAuth();
  const { openComposer } = useComposerStore();
  const { posts, loading, error, fetchUserPosts } = usePosts();
  const [activeTab, setActiveTab] = useState('posts');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard className="glass-ios-triple glass-corner-distort text-center" padding="lg">
          <p>Please sign in to view your posts.</p>
        </GlassCard>
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
    <div className="min-h-screen p-6 pb-32 relative">

      <div className="relative z-10 max-w-4xl mx-auto">
        <header className="mb-8">
          <GlassCard className={`rounded-3xl glass-ios-triple glass-corner-distort transition-all duration-700 ${
            mode === 'public'
              ? 'border-white/40 bg-white/10 backdrop-blur-xl shadow-lg shadow-[#489FE3]/20'
              : 'border-blue-300/50 bg-blue-50/30 backdrop-blur-xl shadow-lg shadow-blue-500/20'
          }`} padding="lg">
            <div className="flex items-center justify-center space-x-3 mb-4">
              {mode === 'public' ? (
                <Brain className="w-8 h-8 text-[#489FE3] drop-shadow-lg" />
              ) : (
                <Building2 className="w-8 h-8 text-blue-600 drop-shadow-lg" />
              )}
              <h1 className={`text-4xl font-light tracking-wide ${
                mode === 'public' ? 'text-white drop-shadow-md' : 'text-slate-800'
              }`}>
                My Posts
              </h1>
            </div>
            <p className={`mt-2 font-light max-w-2xl mx-auto text-center ${
              mode === 'public' ? 'text-white/90' : 'text-slate-700'
            }`}>
              {mode === 'public' 
                ? 'Your brainstorms, insights, and contributions to the community'
                : 'Your business posts, insights, and professional content'
              }
            </p>
          </GlassCard>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full grid-cols-2 glass-ios-triple mb-6 ${
            mode === 'public'
              ? 'border-white/40 bg-white/10 backdrop-blur-xl shadow-lg shadow-[#489FE3]/20'
              : 'border-blue-300/50 bg-blue-50/30 backdrop-blur-xl shadow-lg shadow-blue-500/20'
          }`}>
            <TabsTrigger value="posts" className={
              mode === 'public'
                ? 'data-[state=active]:bg-[#489FE3]/30 data-[state=active]:text-white'
                : 'data-[state=active]:bg-blue-200/60 data-[state=active]:text-blue-700'
            }>My Posts</TabsTrigger>
            <TabsTrigger value="lastSeen" className={
              mode === 'public'
                ? 'data-[state=active]:bg-[#489FE3]/30 data-[state=active]:text-white'
                : 'data-[state=active]:bg-blue-200/60 data-[state=active]:text-blue-700'
            }>
              <Clock className="w-4 h-4 mr-2" />
              Last Seen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            {/* Loading State */}
            {loading && (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <GlassCard key={i} className={`glass-ios-triple transition-all duration-700 ${
                    mode === 'public'
                      ? 'border-white/40 bg-white/10 backdrop-blur-xl'
                      : 'border-blue-300/50 bg-blue-50/30 backdrop-blur-xl'
                  }`}>
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </GlassCard>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <GlassCard className={`glass-ios-triple glass-corner-distort transition-all duration-700 ${
                mode === 'public'
                  ? 'border-red-400/40 bg-red-500/10 backdrop-blur-xl shadow-lg shadow-red-500/20'
                  : 'border-red-300/50 bg-red-50/30 backdrop-blur-xl shadow-lg shadow-red-500/20'
              }`}>
                <div className="text-center">
                  <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${
                    mode === 'public' ? 'text-red-400 drop-shadow-md' : 'text-red-600'
                  }`} />
                  <h3 className={`text-lg font-medium mb-2 ${
                    mode === 'public' ? 'text-white drop-shadow-sm' : 'text-red-600'
                  }`}>
                    Failed to Load Posts
                  </h3>
                  <p className={`mb-4 ${
                    mode === 'public' ? 'text-white/90' : 'text-red-700'
                  }`}>
                    {error}
                  </p>
                  <Button 
                    onClick={() => fetchUserPosts()}
                    variant="outline"
                    className={`glass-ios-triple ${
                      mode === 'public'
                        ? 'border-red-400/60 text-red-300 hover:bg-red-400/20 shadow-lg shadow-red-500/30'
                        : 'border-red-500/60 text-red-600 hover:bg-red-100 shadow-lg shadow-red-500/30'
                    }`}
                  >
                    Try Again
                  </Button>
                </div>
              </GlassCard>
            )}

            {/* Content Area */}
            {!loading && !error && (
              <div className="space-y-6">
                {posts.length === 0 ? (
                  /* Empty State */
                  <GlassCard className={`text-center glass-ios-triple glass-corner-distort transition-all duration-700 ${
                    mode === 'public'
                      ? 'border-white/40 bg-white/10 backdrop-blur-xl shadow-lg shadow-[#489FE3]/20'
                      : 'border-blue-300/50 bg-blue-50/30 backdrop-blur-xl shadow-lg shadow-blue-500/20'
                  }`} padding="lg">
                    <div className="space-y-4">
                      <FileText className={`w-16 h-16 mx-auto ${
                        mode === 'public' ? 'text-white/60 drop-shadow-md' : 'text-blue-500'
                      }`} />
                      <h3 className={`text-xl font-medium ${
                        mode === 'public' ? 'text-white drop-shadow-sm' : 'text-slate-800'
                      }`}>
                        No Posts Yet
                      </h3>
                      <p className={`text-lg ${
                        mode === 'public' ? 'text-white/90' : 'text-slate-700'
                      }`}>
                        {mode === 'public' 
                          ? "You haven't created any posts yet. Share your ideas!"
                          : "You haven't published any business content yet."
                        }
                      </p>
                      <Button 
                        onClick={() => openComposer()}
                        className={`glass-ios-triple transition-all duration-300 ${
                          mode === 'public'
                            ? 'bg-[#489FE3]/30 hover:bg-[#489FE3]/40 text-white border-[#489FE3]/60 shadow-lg shadow-[#489FE3]/30'
                            : 'bg-blue-200/60 hover:bg-blue-200/70 text-blue-700 border-blue-400/60 shadow-lg shadow-blue-500/30'
                        }`}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Post
                      </Button>
                    </div>
                  </GlassCard>
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
                        className={`glass-ios-triple transition-all duration-300 ${
                          mode === 'public'
                            ? 'bg-[#489FE3]/30 hover:bg-[#489FE3]/40 text-white border-[#489FE3]/60 shadow-lg shadow-[#489FE3]/30 hover:shadow-[#489FE3]/40'
                            : 'bg-blue-200/60 hover:bg-blue-200/70 text-blue-700 border-blue-400/60 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40'
                        }`}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New Post
                      </Button>
                    </div>

                    {posts.map((post) => (
                      <GlassCard 
                        key={post.id} 
                        className={`glass-ios-triple glass-corner-distort transition-all duration-300 cursor-pointer ${
                          mode === 'public'
                            ? 'border-white/40 bg-white/10 hover:bg-white/15 hover:border-white/50 hover:shadow-lg hover:shadow-[#489FE3]/30 hover:scale-[1.02]'
                            : 'border-blue-300/50 bg-blue-50/30 hover:bg-blue-50/40 hover:border-blue-400/60 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02]'
                        }`}
                        onClick={() => {
                          setSelectedPost(post);
                          setIsModalOpen(true);
                        }}
                      >
                        <div className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={post.mode === 'public' ? 'default' : 'secondary'} className={
                                  mode === 'public' 
                                    ? 'bg-[#489FE3]/30 text-white border-[#489FE3]/50' 
                                    : 'bg-blue-200/50 text-blue-700 border-blue-300/60'
                                }>
                                  {post.mode}
                                </Badge>
                                <Badge variant="outline" className={
                                  mode === 'public'
                                    ? 'border-white/40 text-white/90 bg-white/10'
                                    : 'border-blue-300/50 text-blue-700 bg-blue-50/40'
                                }>
                                  {post.type}
                                </Badge>
                                <Badge variant="outline" className={
                                  mode === 'public'
                                    ? 'border-white/40 text-white/90 bg-white/10'
                                    : 'border-blue-300/50 text-blue-700 bg-blue-50/40'
                                }>
                                  {post.visibility}
                                </Badge>
                              </div>
                              {post.title && (
                                <h3 className={`text-lg font-semibold mb-2 ${
                                  mode === 'public' ? 'text-white drop-shadow-sm' : 'text-slate-800'
                                }`}>
                                  {post.title}
                                </h3>
                              )}
                            </div>
                            <div className={`flex items-center gap-1 text-xs ${
                              mode === 'public' ? 'text-white/80' : 'text-slate-600'
                            }`}>
                              <Calendar className="w-3 h-3" />
                              {formatDate(post.created_at)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-0">
                          <p className={`mb-4 line-clamp-3 ${
                            mode === 'public' ? 'text-white/90' : 'text-slate-700'
                          }`}>
                            {post.content}
                          </p>
                          
                          {/* Engagement Stats */}
                          <div className={`flex items-center gap-4 text-sm ${
                            mode === 'public' ? 'text-white/80' : 'text-slate-600'
                          }`}>
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
                        </div>
                      </GlassCard>
                    ))}
                  </>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="lastSeen">
            <div className="h-[calc(100vh-300px)]">
              <FeedContainer mode="brainstorm_last_seen" />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Post Reader Modal */}
      <PostReaderModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPost(null);
        }}
        post={selectedPost}
      />
    </div>
  );
};

export default MyPosts;
