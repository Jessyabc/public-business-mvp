import { useState, useEffect, useRef, useCallback } from "react";
import { useAppMode } from "@/contexts/AppModeContext";
import { usePosts } from "@/hooks/usePosts";
import { useComposerStore } from "@/hooks/useComposerStore";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { BusinessFeedFilters } from "@/types/business-post";
import { GlassPanel, GlassButton, GlassField } from "@/components/ui/glass";
import { AccordionCard } from "@/components/posts/AccordionCard";
import { Search, Filter, Plus, Sparkles } from "lucide-react";

export function BusinessFeed() {
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
    setTimeout(() => {
      setPage(prev => prev + 1);
      setIsLoadingMore(false);
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

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = !filters.search || 
      post.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      post.content.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesSearch && post.mode === 'business';
  });

  const handleViewPost = (postId: string) => {
    window.dispatchEvent(
      new CustomEvent('pb:post:view', {
        detail: { postId, mode: 'business' }
      })
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1729] via-[#1a1147] to-[#0f1729] pt-6 pb-32">
      <div className="max-w-4xl mx-auto px-6 space-y-6">
        {/* Header */}
        <GlassPanel variant="elevated" neonAccent="aqua" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-light text-white/95 tracking-wide">
              Business Feed
            </h1>
            {user && (
              <GlassButton 
                variant="primary" 
                glow="aqua" 
                size="icon"
                onClick={handleCreatePost}
              >
                <Plus className="w-6 h-6" />
              </GlassButton>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <GlassField
              as="input"
              placeholder="Search insights by title, company, or industry..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-12"
            />
          </div>

          {/* Sort & Filter Actions */}
          <div className="flex items-center gap-3 mt-4">
            <GlassButton variant="secondary" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </GlassButton>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-white/40">Sort:</span>
              {['Most Useful', 'Most Recent', 'Trending'].map((label) => (
                <button
                  key={label}
                  className="px-3 py-1.5 text-xs font-medium rounded-full text-white/60 hover:text-white hover:bg-white/[0.05] transition-all"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </GlassPanel>

        {/* Feed Content */}
        <div className="space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <GlassPanel key={index} className="p-6 animate-pulse">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-white/5 rounded w-3/4" />
                    <div className="h-3 bg-white/3 rounded w-1/2" />
                    <div className="space-y-2">
                      <div className="h-3 bg-white/3 rounded" />
                      <div className="h-3 bg-white/3 rounded w-4/5" />
                    </div>
                  </div>
                </div>
              </GlassPanel>
            ))
          ) : filteredPosts.length === 0 ? (
            <GlassPanel className="p-12 text-center">
              <Sparkles className="w-16 h-16 mx-auto mb-6 text-white/20" />
              <h3 className="text-xl font-semibold text-white/90 mb-3">
                {filters.search ? 'No matching insights' : 'No business insights yet'}
              </h3>
              <p className="text-white/50 mb-6 max-w-md mx-auto">
                {filters.search 
                  ? 'Try adjusting your search terms or filters'
                  : 'Be the first to share a business insight!'
                }
              </p>
              {!filters.search && user && (
                <GlassButton 
                  variant="primary" 
                  glow="aqua"
                  onClick={handleCreatePost}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Business Insight
                </GlassButton>
              )}
            </GlassPanel>
          ) : (
            <>
              {filteredPosts.map((post, index) => (
                <div 
                  key={post.id}
                  ref={index === filteredPosts.length - 1 ? lastPostRef : undefined}
                >
                  <AccordionCard
                    post={post}
                    onView={handleViewPost}
                    onSave={(postId) => console.log("Save:", postId)}
                    onShare={(postId) => console.log("Share:", postId)}
                  />
                </div>
              ))}
              
              {/* Loading more */}
              {isLoadingMore && (
                <GlassPanel className="p-6 text-center">
                  <Sparkles className="w-6 h-6 mx-auto mb-2 text-[#00D9FF]/50 animate-pulse" />
                  <div className="text-white/50 text-sm">Loading more insights...</div>
                </GlassPanel>
              )}
              
              {/* End of feed */}
              {!hasMore && filteredPosts.length > 0 && (
                <GlassPanel className="p-4 text-center">
                  <div className="text-white/40 text-sm">You've reached the end</div>
                </GlassPanel>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
