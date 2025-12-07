import { Link } from 'react-router-dom';
import { Plus, Lightbulb, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useComposerStore } from '@/hooks/useComposerStore';
import { ComposerModal } from '@/components/composer/ComposerModal';
import { PullToRefresh } from '@/components/layout/PullToRefresh';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const REQUIRE_AUTH = true;
const PAGE_SIZE = 12;

// Type for open ideas from the public view
interface OpenIdea {
  id: string;
  content: string;
  source: string;
  created_at: string;
}

// Hook to fetch open ideas with infinite scroll
function useOpenIdeas() {
  const [ideas, setIdeas] = useState<OpenIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  const fetchIdeas = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true);
      setCursor(null);
    } else {
      setLoadingMore(true);
    }

    try {
      let query = supabase
        .from('open_ideas_public_view')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (!reset && cursor) {
        query = query.lt('created_at', cursor);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching open ideas:', error);
        return;
      }

      if (data) {
        if (reset) {
          setIdeas(data as OpenIdea[]);
        } else {
          setIdeas(prev => [...prev, ...(data as OpenIdea[])]);
        }
        
        setHasMore(data.length === PAGE_SIZE);
        if (data.length > 0) {
          setCursor(data[data.length - 1].created_at);
        }
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [cursor]);

  useEffect(() => {
    fetchIdeas(true);
  }, []);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchIdeas(false);
    }
  }, [loadingMore, hasMore, fetchIdeas]);

  const refresh = useCallback(() => {
    fetchIdeas(true);
  }, []);

  return { ideas, loading, loadingMore, hasMore, loadMore, refresh };
}

// Hook to fetch lineage counts for open ideas using idea_links table
function useIdeaLineageCounts(ideaIds: string[]) {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (ideaIds.length === 0) return;

    const fetchCounts = async () => {
      const { data, error } = await supabase
        .from('idea_links')
        .select('source_id')
        .eq('source_type', 'open_idea')
        .in('source_id', ideaIds);

      if (error) {
        console.error('Error fetching lineage counts:', error);
        return;
      }

      // Count occurrences per source_id
      const countMap: Record<string, number> = {};
      data?.forEach((row) => {
        countMap[row.source_id] = (countMap[row.source_id] || 0) + 1;
      });
      setCounts(countMap);
    };

    fetchCounts();
  }, [ideaIds.join(',')]);

  return counts;
}

// Intersection observer hook for infinite scroll
function useInfiniteScroll(callback: () => void, hasMore: boolean) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          callback();
        }
      },
      { threshold: 0.1 }
    );

    if (triggerRef.current) {
      observerRef.current.observe(triggerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [callback, hasMore]);

  return triggerRef;
}

export default function OpenIdeas() {
  const { user } = useAuth();
  const { ideas, loading, loadingMore, hasMore, loadMore, refresh } = useOpenIdeas();
  const { isOpen, openComposer, closeComposer } = useComposerStore();

  // Fetch lineage counts for all open ideas
  const ideaIds = ideas.map(idea => idea.id);
  const lineageCounts = useIdeaLineageCounts(ideaIds);

  // Infinite scroll trigger
  const triggerRef = useInfiniteScroll(loadMore, hasMore);

  if (REQUIRE_AUTH && !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 max-w-2xl mx-auto">
          <div className={cn(
            "w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center",
            "bg-[hsl(var(--accent))]/20 border border-[hsl(var(--accent))]/30",
            "shadow-[0_0_30px_rgba(72,159,227,0.3)]"
          )}>
            <Lightbulb className="w-10 h-10 text-[hsl(var(--accent))]" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-foreground">Open Ideas Bank</h1>
          <p className="text-muted-foreground mb-6">
            Access our curated collection of open ideas to spark your creativity. 
            Sign in to explore hundreds of community-submitted concepts waiting for your unique perspective.
          </p>
          <div className="space-y-4">
            <Link to="/auth">
              <Button 
                size="lg" 
                className={cn(
                  "w-full sm:w-auto",
                  "bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/90",
                  "text-white font-medium",
                  "shadow-[0_0_20px_rgba(72,159,227,0.4)]",
                  "hover:shadow-[0_0_30px_rgba(72,159,227,0.6)]",
                  "transition-all duration-300"
                )}
              >
                Sign In to Access Ideas
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              Don't have an account? <Link to="/auth" className="text-[hsl(var(--accent))] hover:underline">Create one</Link> - it's free!
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleIdeaClick = (ideaId: string) => {
    openComposer({ originOpenIdeaId: ideaId });
  };

  return (
    <>
      <PullToRefresh onRefresh={refresh}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-foreground">Open Ideas Bank</h1>
              <p className="text-muted-foreground">
                Curated ideas from the community, waiting for your creative spark
              </p>
            </div>
            <Button 
              onClick={() => openComposer()} 
              className={cn(
                "mt-4 md:mt-0",
                "bg-[hsl(var(--accent))]/20 hover:bg-[hsl(var(--accent))]/30",
                "border border-[hsl(var(--accent))]/30 hover:border-[hsl(var(--accent))]/50",
                "text-[hsl(var(--accent))] hover:text-white",
                "shadow-[0_0_15px_rgba(72,159,227,0.2)]",
                "hover:shadow-[0_0_25px_rgba(72,159,227,0.4)]",
                "transition-all duration-300"
              )}
            >
              <Plus className="w-4 h-4 mr-2" />
              Submit an Idea
            </Button>
          </div>

          {/* Ideas Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading && (
              <div className="col-span-full flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[hsl(var(--accent))]" />
                <span className="ml-2 text-muted-foreground">Loading open ideas…</span>
              </div>
            )}
            
            {!loading && ideas.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className={cn(
                  "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center",
                  "bg-white/5 border border-white/10"
                )}>
                  <Lightbulb className="w-8 h-8 text-white/40" />
                </div>
                <p className="text-muted-foreground">No open ideas yet. Be the first to submit one!</p>
              </div>
            )}
            
            {!loading && ideas.map((idea) => {
              const sparkCount = lineageCounts[idea.id] || 0;
              return (
                <button
                  key={idea.id}
                  onClick={() => handleIdeaClick(idea.id)}
                  className={cn(
                    "group text-left rounded-2xl p-5 min-h-[180px]",
                    "flex flex-col justify-between",
                    "bg-white/5 backdrop-blur-sm",
                    "border border-white/10",
                    "hover:bg-white/10 hover:border-white/20",
                    "hover:shadow-[0_0_30px_rgba(72,159,227,0.15)]",
                    "transition-all duration-300 cursor-pointer"
                  )}
                >
                  <p className="text-sm text-foreground/90 leading-relaxed line-clamp-4">
                    {idea.content}
                  </p>
                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="uppercase tracking-wider text-[10px]">
                      {idea.source === 'intake' ? 'From a visitor' : 'From the community'}
                    </span>
                    <div className="flex items-center gap-3">
                      {sparkCount > 0 && (
                        <span className="flex items-center gap-1 text-[hsl(var(--accent))]">
                          <Sparkles className="w-3 h-3" />
                          {sparkCount} spark{sparkCount !== 1 ? 's' : ''}
                        </span>
                      )}
                      <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Infinite scroll trigger */}
          <div ref={triggerRef} className="h-10 mt-4">
            {loadingMore && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--accent))]" />
                <span className="ml-2 text-sm text-muted-foreground">Loading more…</span>
              </div>
            )}
            {!hasMore && ideas.length > 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                You've reached the end
              </p>
            )}
          </div>
        </div>
      </PullToRefresh>

      <ComposerModal isOpen={isOpen} onClose={closeComposer} />
    </>
  );
}
