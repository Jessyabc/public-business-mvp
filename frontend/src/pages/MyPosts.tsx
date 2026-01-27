import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/ui/components/GlassCard';
import { Brain, Plus, FileText, Calendar, Eye, Heart, MessageCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useComposerStore } from '@/hooks/useComposerStore';
import { usePosts } from '@/hooks/usePosts';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeedContainer } from '@/features/feed/FeedContainer';
import { PostReaderModal } from '@/components/posts/PostReaderModal';
import { PullToRefresh } from '@/components/layout/PullToRefresh';
import type { Post } from '@/types/post';

const MyPosts = () => {
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
    <PullToRefresh onRefresh={() => fetchUserPosts()}>
      <div className="min-h-screen p-6 pb-32 relative">

        <div className="relative z-10 max-w-4xl mx-auto">
        <header className="mb-8">
          <GlassCard className="rounded-3xl glass-ios-triple glass-corner-distort transition-all duration-700 border-white/40 bg-white/10 backdrop-blur-xl shadow-lg shadow-primary/20" padding="lg">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Brain className="w-8 h-8 text-primary drop-shadow-lg" />
              <h1 className="text-4xl font-light tracking-wide text-foreground drop-shadow-md">
                My Posts
              </h1>
            </div>
            <p className="mt-2 font-light max-w-2xl mx-auto text-center text-muted-foreground">
              Your brainstorms, insights, and contributions to the community
            </p>
          </GlassCard>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass-ios-triple mb-6 border-white/40 bg-white/10 backdrop-blur-xl shadow-lg shadow-primary/20">
            <TabsTrigger value="posts" className="data-[state=active]:bg-primary/30 data-[state=active]:text-foreground">My Posts</TabsTrigger>
            <TabsTrigger value="lastSeen" className="data-[state=active]:bg-primary/30 data-[state=active]:text-foreground">
              <Clock className="w-4 h-4 mr-2" />
              Last Seen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            {/* Loading State */}
            {loading && (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <GlassCard key={i} className="glass-ios-triple transition-all duration-700 border-white/40 bg-white/10 backdrop-blur-xl">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </GlassCard>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <GlassCard className="glass-ios-triple glass-corner-distort transition-all duration-700 border-red-400/40 bg-red-500/10 backdrop-blur-xl shadow-lg shadow-red-500/20">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400 drop-shadow-md" />
                  <h3 className="text-lg font-medium mb-2 text-foreground drop-shadow-sm">
                    Failed to Load Posts
                  </h3>
                  <p className="mb-4 text-muted-foreground">
                    {error}
                  </p>
                  <Button 
                    onClick={() => fetchUserPosts()}
                    variant="outline"
                    className="glass-ios-triple border-red-400/60 text-red-300 hover:bg-red-400/20 shadow-lg shadow-red-500/30"
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
                  <GlassCard className="text-center glass-ios-triple glass-corner-distort transition-all duration-700 border-white/40 bg-white/10 backdrop-blur-xl shadow-lg shadow-primary/20" padding="lg">
                    <div className="space-y-4">
                      <FileText className="w-16 h-16 mx-auto text-muted-foreground/60 drop-shadow-md" />
                      <h3 className="text-xl font-medium text-foreground drop-shadow-sm">
                        No Posts Yet
                      </h3>
                      <p className="text-lg text-muted-foreground">
                        You haven't created any posts yet. Share your ideas!
                      </p>
                      <Button 
                        onClick={() => openComposer()}
                        className="glass-ios-triple transition-all duration-300 bg-primary/30 hover:bg-primary/40 text-foreground border-primary/60 shadow-lg shadow-primary/30"
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
                      <p className="text-sm text-muted-foreground">
                        {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                      </p>
                      <Button 
                        onClick={() => openComposer()}
                        size="sm"
                        className="glass-ios-triple transition-all duration-300 bg-primary/30 hover:bg-primary/40 text-foreground border-primary/60 shadow-lg shadow-primary/30 hover:shadow-primary/40"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        New Post
                      </Button>
                    </div>

                    {posts.map((post) => (
                      <GlassCard 
                        key={post.id} 
                        className="glass-ios-triple glass-corner-distort transition-all duration-300 cursor-pointer border-white/40 bg-white/10 hover:bg-white/15 hover:border-white/50 hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02]"
                        onClick={() => {
                          setSelectedPost(post);
                          setIsModalOpen(true);
                        }}
                      >
                        <div className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant={post.mode === 'public' ? 'default' : 'secondary'} className="bg-primary/30 text-foreground border-primary/50">
                                  {post.mode}
                                </Badge>
                                <Badge variant="outline" className="border-white/40 text-muted-foreground bg-white/10">
                                  {post.type}
                                </Badge>
                                <Badge variant="outline" className="border-white/40 text-muted-foreground bg-white/10">
                                  {post.visibility}
                                </Badge>
                              </div>
                              {post.title && (
                                <h3 className="text-lg font-semibold mb-2 text-foreground drop-shadow-sm">
                                  {post.title}
                                </h3>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {formatDate(post.created_at)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="pt-0">
                          <p className="mb-4 line-clamp-3 text-muted-foreground">
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
    </PullToRefresh>
  );
};

export default MyPosts;
