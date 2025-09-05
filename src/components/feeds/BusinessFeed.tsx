import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PostCard as BusinessPostCard } from "@/components/business/PostCard";
import { PostCard } from "@/components/posts/PostCard";
import { BusinessFeedFilters } from "@/types/business-post";
import { Search, Filter, ToggleLeft, Sparkles, Plus } from "lucide-react";
import { useAppMode } from "@/contexts/AppModeContext";
import { usePosts } from "@/hooks/usePosts";
import { BrainstormPreview } from "@/components/feeds/BrainstormPreview";
import { useNavigate } from "react-router-dom";
import { useComposerStore } from "@/hooks/useComposerStore";
import { useAuth } from "@/contexts/AuthContext";

export function BusinessFeed() {
  const { toggleMode } = useAppMode();
  const { posts, loading, fetchPosts } = usePosts();
  const { openComposer } = useComposerStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filters, setFilters] = useState<BusinessFeedFilters>({
    search: "",
    sortBy: "most_useful",
    industries: []
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPosts('business');
  }, []);

  // Infinite scroll observer
  const lastPostRef = useCallback((node: HTMLDivElement) => {
    if (loading || isLoadingMore || !hasMore) return;
    if (observerRef.current) observerRef.current = null;
    
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        handleLoadMore();
      }
    });
    
    if (node) {
      observer.observe(node);
      observerRef.current = node;
    }
  }, [loading, isLoadingMore, hasMore]);

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    // In a real implementation, you'd fetch more posts here
    setTimeout(() => {
      setPage(prev => prev + 1);
      setIsLoadingMore(false);
      // Set hasMore to false when no more posts
      if (page >= 3) setHasMore(false);
    }, 1000);
  };

  const handleCreatePost = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    openComposer({});
  };

  useEffect(() => {
    fetchPosts('business');
  }, []);

  // Filter posts based on current filters
  const filteredPosts = posts.filter(post => {
    const matchesSearch = !filters.search || 
      post.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      post.content.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesSearch && post.mode === 'business';
  });

  const handleViewPost = (postId: string) => {
    console.log("View post:", postId);
    // Navigate to full post view
  };

  const handleSavePost = (postId: string) => {
    console.log("Save post:", postId);
    // Save to history
  };

  const handleLinkToBrainstorm = (postId: string) => {
    console.log("Link to brainstorm:", postId);
    // Open brainstorm linking modal
  };

  const getSortLabel = (value: string) => {
    switch (value) {
      case 'most_useful': return 'Most Useful';
      case 'most_recent': return 'Most Recent';
      case 'most_shared': return 'Most Shared';
      case 'webinars_only': return 'Webinars Only';
      case 'by_industry': return 'By Industry';
      default: return 'Most Useful';
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>

      {/* Fixed Header */}
      <header className="shrink-0 p-6 pb-4 relative z-10">
        <div className="glass-business-header rounded-3xl p-6 backdrop-blur-xl max-w-4xl mx-auto">
          {/* Top bar with search and filters */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-light text-foreground tracking-wide">
                Business Feed
              </h1>
            </div>
            
            {/* Mode Toggle and Create Button */}
            <div className="flex items-center gap-3">
              <Button
                onClick={toggleMode}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary"
              >
                <ToggleLeft className="w-4 h-4" />
                Switch to Public
              </Button>
              
              <Button
                onClick={handleCreatePost}
                className="bg-primary hover:bg-primary/90 text-white"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
            </div>
          </div>

          {/* Search and Filters Row */}
          <div className="flex flex-col lg:flex-row gap-3 mb-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, company, or industry..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10 glass-business-card"
              />
            </div>

            {/* Sort Dropdown */}
            <Select
              value={filters.sortBy}
              onValueChange={(value: BusinessFeedFilters['sortBy']) => 
                setFilters(prev => ({ ...prev, sortBy: value }))
              }
            >
              <SelectTrigger className="w-full lg:w-48 glass-business-card">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="most_useful">Most Useful</SelectItem>
                <SelectItem value="most_recent">Most Recent</SelectItem>
                <SelectItem value="most_shared">Most Shared</SelectItem>
                <SelectItem value="webinars_only">Webinars Only</SelectItem>
                <SelectItem value="by_industry">By Industry</SelectItem>
              </SelectContent>
            </Select>

            {/* Industry Filter */}
            <Button variant="outline" className="glass-business-card" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Industries
            </Button>
          </div>

          {/* Active Filters */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sorted by:</span>
            <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/20">
              {getSortLabel(filters.sortBy)}
            </Badge>
          </div>
        </div>
      </header>

      {/* Scrollable Feed Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-32">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="glass-business-card p-6 animate-pulse">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-white/10 rounded-full"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-white/10 rounded w-3/4"></div>
                      <div className="h-3 bg-white/5 rounded w-1/2"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-white/5 rounded"></div>
                        <div className="h-3 bg-white/5 rounded w-4/5"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <div className="glass-business-card rounded-2xl p-8">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No posts found</h3>
                  <p className="text-muted-foreground">Be the first to share a business insight!</p>
                </div>
              </div>
            ) : (
              <>
                {filteredPosts.map((post, index) => (
                  <div 
                    key={post.id} 
                    className="transform hover:scale-[1.01] transition-transform duration-200"
                    ref={index === filteredPosts.length - 1 ? lastPostRef : undefined}
                  >
                    <PostCard post={post} />
                  </div>
                ))}
                
                {/* Loading more indicator */}
                {isLoadingMore && (
                  <div className="text-center py-6">
                    <div className="glass-business-card p-4 animate-pulse">
                      <Sparkles className="w-6 h-6 mx-auto mb-2 text-primary/50" />
                      <div className="text-muted-foreground text-sm">Loading more posts...</div>
                    </div>
                  </div>
                )}
                
                {/* End of feed message */}
                {!hasMore && filteredPosts.length > 0 && (
                  <div className="text-center py-6">
                    <div className="glass-business-card p-4">
                      <div className="text-muted-foreground text-sm">You've reached the end of the feed</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Brainstorm Network Preview */}
          <div className="mt-8">
            <BrainstormPreview onExplore={() => navigate("/")} />
          </div>
        </div>
      </div>
    </div>
  );
}