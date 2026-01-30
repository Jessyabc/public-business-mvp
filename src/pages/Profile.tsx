import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/ui/components/GlassCard";
import { Plus, Building2, Clock, FileText, Calendar, Eye, Heart, MessageCircle, AlertCircle, User } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useUserRoles } from "@/hooks/useUserRoles";
import { usePosts } from "@/hooks/usePosts";
import { useUserOrgId } from "@/features/orgs/hooks/useUserOrgId";
import { ComposerModal } from "@/components/composer/ComposerModal";
import { PostReaderModal } from "@/components/posts/PostReaderModal";
import { PullToRefresh } from "@/components/layout/PullToRefresh";
import { FeedContainer } from "@/features/feed/FeedContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import type { Post } from "@/types/post";

export default function Profile() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { isBusinessMember, isAdmin } = useUserRoles();
  const { posts, loading: postsLoading, error, fetchUserPosts } = usePosts();
  const { data: orgId } = useUserOrgId();
  const [showComposer, setShowComposer] = useState(false);
  const initialTab = searchParams.get('tab') || 'posts';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <ProtectedRoute requireAuth={true}>
      <PullToRefresh onRefresh={() => fetchUserPosts()}>
        <div className="min-h-screen p-6 pb-32 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Profile</h1>
              <p className="text-muted-foreground">Manage your profile and view your content</p>
            </div>

            {/* Quick Actions - Inline buttons (removed business dashboard button - now accessible via swipe) */}
            <div className={`grid gap-4 mb-6 ${
              !orgId 
                ? 'grid-cols-1 md:grid-cols-3' 
                : 'grid-cols-1 md:grid-cols-2'
            }`}>
              <Button 
                onClick={() => setShowComposer(true)}
                className="glass-ios-triple h-16 text-left justify-start"
                variant="outline"
              >
                <Plus className="h-5 w-5 mr-2" />
                <div>
                  <div className="font-medium">Create Post</div>
                  <div className="text-xs text-muted-foreground">Share your insights</div>
                </div>
              </Button>

              {!orgId && (
                <Button 
                  onClick={() => navigate("/org/new")}
                  className="glass-ios-triple h-16 text-left justify-start"
                  variant="outline"
                >
                  <Building2 className="h-5 w-5 mr-2" />
                  <div>
                    <div className="font-medium">Create Organization</div>
                    <div className="text-xs text-muted-foreground">Set up your business</div>
                  </div>
                </Button>
              )}

              <Button 
                onClick={() => navigate("/settings")}
                className="glass-ios-triple h-16 text-left justify-start"
                variant="outline"
              >
                <User className="h-5 w-5 mr-2" />
                <div>
                  <div className="font-medium">Profile Settings</div>
                  <div className="text-xs text-muted-foreground">Edit profile & preferences</div>
                </div>
              </Button>
            </div>

            {/* My Posts Section - Now embedded */}
            <GlassCard className="glass-ios-triple glass-corner-distort">
              <Tabs
                value={activeTab}
                onValueChange={(value) => {
                  setActiveTab(value);
                  const nextParams = new URLSearchParams(searchParams);
                  nextParams.set('tab', value);
                  setSearchParams(nextParams, { replace: true });
                }}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 glass-ios-triple mb-6 border-white/40 bg-white/10 backdrop-blur-xl shadow-lg shadow-primary/20">
                  <TabsTrigger value="posts" className="flex items-center gap-2 data-[state=active]:bg-primary/30 data-[state=active]:text-foreground">
                    <FileText className="w-4 h-4" />
                    My Posts
                  </TabsTrigger>
                  <TabsTrigger value="lastSeen" className="flex items-center gap-2 data-[state=active]:bg-primary/30 data-[state=active]:text-foreground">
                    <Clock className="w-4 h-4" />
                    Last Seen
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="posts" className="mt-0">
                  {/* Loading State */}
                  {postsLoading && (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
                          <Skeleton className="h-6 w-3/4 mb-4" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Error State */}
                  {error && !postsLoading && (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
                      <h3 className="text-lg font-medium mb-2">Failed to Load Posts</h3>
                      <p className="text-muted-foreground mb-4">{error}</p>
                      <Button onClick={() => fetchUserPosts()} variant="outline">
                        Try Again
                      </Button>
                    </div>
                  )}

                  {/* Posts List */}
                  {!postsLoading && !error && (
                    <div className="space-y-4">
                      {posts.length === 0 ? (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-medium mb-2">No Posts Yet</h3>
                          <p className="text-muted-foreground mb-4">
                            You haven't created any posts yet. Share your ideas!
                          </p>
                          <Button onClick={() => setShowComposer(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Post
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-center mb-4">
                            <p className="text-sm text-muted-foreground">
                              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                            </p>
                            <Button onClick={() => setShowComposer(true)} size="sm" variant="outline">
                              <Plus className="w-4 h-4 mr-2" />
                              New Post
                            </Button>
                          </div>

                          {posts.map((post) => (
                            <div
                              key={post.id}
                              onClick={() => {
                                setSelectedPost(post);
                                setIsModalOpen(true);
                              }}
                              className="p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant={post.mode === 'public' ? 'default' : 'secondary'}>
                                    {post.mode}
                                  </Badge>
                                  <Badge variant="outline">{post.type}</Badge>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(post.created_at)}
                                </div>
                              </div>
                              
                              {post.title && (
                                <h3 className="font-semibold mb-2">{post.title}</h3>
                              )}
                              
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {post.content}
                              </p>
                              
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
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="lastSeen" className="mt-0">
                  <div className="h-[400px]">
                    <FeedContainer mode="brainstorm_last_seen" />
                  </div>
                </TabsContent>
              </Tabs>
            </GlassCard>

          </div>

          <ComposerModal 
            isOpen={showComposer} 
            onClose={() => setShowComposer(false)} 
          />
          
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
    </ProtectedRoute>
  );
}
