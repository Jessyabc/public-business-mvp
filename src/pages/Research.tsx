import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppMode } from '@/contexts/AppModeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, TrendingUp, Award, Clock, Sparkles, Building2, Lightbulb, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { PostToSparkCard } from '@/components/brainstorm/PostToSparkCard';
import { useComposerStore } from '@/hooks/useComposerStore';
import { ComposerModal } from '@/components/composer/ComposerModal';
import { cn } from '@/lib/utils';

interface ResearchItem {
  id: string;
  title: string | null;
  content: string;
  created_at: string;
  type: string;
  u_score?: number | null;
  t_score?: number | null;
}

interface OpenIdea {
  id: string;
  content: string;
  source: string;
  created_at: string;
}

const PAGE_SIZE = 12;

// Hook to fetch open ideas with infinite scroll
function useOpenIdeasInfinite() {
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

// Hook to fetch lineage counts for open ideas
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

const Research = () => {
  const { mode } = useAppMode();
  const { isOpen, openComposer, closeComposer } = useComposerStore();
  const [activeTab, setActiveTab] = useState('sparks');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [items, setItems] = useState<ResearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Open Ideas infinite scroll
  const { 
    ideas: openIdeas, 
    loading: openIdeasLoading, 
    loadingMore: openIdeasLoadingMore, 
    hasMore: openIdeasHasMore, 
    loadMore: loadMoreOpenIdeas,
    refresh: refreshOpenIdeas
  } = useOpenIdeasInfinite();

  const openIdeaIds = openIdeas.map(idea => idea.id);
  const lineageCounts = useIdeaLineageCounts(openIdeaIds);
  const infiniteScrollTrigger = useInfiniteScroll(loadMoreOpenIdeas, openIdeasHasMore);

  const sortOptions = [
    { value: 'recent', label: 'Most Recent', icon: Clock },
    { value: 't_score', label: 'T-Score', icon: TrendingUp },
    { value: 'u_score', label: 'U-Score', icon: Award }
  ];

  const industries = [
    { value: 'all', label: 'All Industries' },
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Finance' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'education', label: 'Education' },
    { value: 'marketing', label: 'Marketing' }
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select('id, title, content, created_at, type, u_score, t_score, industry_id')
        .eq('status', 'active')
        .eq('visibility', 'public');

      if (activeTab === 'sparks') {
        query = query.eq('type', 'brainstorm');
      } else if (activeTab === 'insights') {
        query = query.eq('type', 'insight');
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      if (sortBy === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 't_score') {
        query = query.order('t_score', { ascending: false, nullsFirst: false });
      } else if (sortBy === 'u_score') {
        query = query.order('u_score', { ascending: false, nullsFirst: false });
      }

      query = query.limit(20);

      const { data, error } = await query;
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Error fetching research data:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'open-ideas') {
      fetchData();
    }
  }, [activeTab, sortBy, filterIndustry]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'open-ideas') {
      refreshOpenIdeas();
    } else {
      fetchData();
    }
  };

  const handleIdeaClick = (ideaId: string) => {
    openComposer({ originOpenIdeaId: ideaId });
  };

  const isBusinessMode = mode === 'business';

  return (
    <>
      <div className={cn(
        "min-h-screen p-6 pb-32 transition-colors duration-300",
        isBusinessMode ? "bg-background" : "bg-gradient-space"
      )}>
        <div className="max-w-6xl mx-auto">
          {/* Simple Header */}
          <header className="mb-8 text-center">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <Search className={cn("w-8 h-8", isBusinessMode ? "text-primary" : "text-[var(--accent)]")} />
              <h1 className={cn(
                "text-4xl font-light tracking-wide",
                isBusinessMode ? "text-foreground" : "text-[var(--text-primary)]"
              )}>
                Research Hub
              </h1>
            </div>
            <p className={cn(
              "font-light max-w-2xl mx-auto",
              isBusinessMode ? "text-muted-foreground" : "text-[var(--text-secondary)]"
            )}>
              Explore sparks, business insights, and open ideas
            </p>
          </header>

          {/* Search and Filter Controls */}
          <div className={cn(
            "mb-8 p-4 rounded-2xl backdrop-blur-xl",
            isBusinessMode 
              ? "bg-card border border-border shadow-sm" 
              : "bg-[var(--glass-bg)] border border-[var(--glass-border)]"
          )}>
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search for insights, sparks, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    isBusinessMode 
                      ? "bg-background border-input text-foreground placeholder:text-muted-foreground" 
                      : "bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
                  )}
                />
              </div>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className={cn(
                    "w-40",
                    isBusinessMode 
                      ? "bg-background border-input text-foreground" 
                      : "bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-primary)]"
                  )}>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <option.icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterIndustry} onValueChange={setFilterIndustry}>
                  <SelectTrigger className={cn(
                    "w-40",
                    isBusinessMode 
                      ? "bg-background border-input text-foreground" 
                      : "bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-primary)]"
                  )}>
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry.value} value={industry.value}>
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" className={cn(
                  isBusinessMode 
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                    : "bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-[var(--accent-on)]"
                )}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>

          {/* Research Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className={cn(
              "grid w-full grid-cols-3 backdrop-blur-xl",
              isBusinessMode 
                ? "bg-muted border border-border" 
                : "bg-[var(--glass-bg)] border border-[var(--glass-border)]"
            )}>
              <TabsTrigger value="sparks" className={cn(
                "flex items-center gap-2",
                isBusinessMode ? "data-[state=active]:bg-background" : "data-[state=active]:bg-white/10"
              )}>
                <Sparkles className="h-4 w-4" />
                Sparks
              </TabsTrigger>
              <TabsTrigger value="insights" className={cn(
                "flex items-center gap-2",
                isBusinessMode ? "data-[state=active]:bg-background" : "data-[state=active]:bg-white/10"
              )}>
                <Building2 className="h-4 w-4" />
                Business Insights
              </TabsTrigger>
              <TabsTrigger value="open-ideas" className={cn(
                "flex items-center gap-2",
                isBusinessMode ? "data-[state=active]:bg-background" : "data-[state=active]:bg-white/10"
              )}>
                <Lightbulb className="h-4 w-4" />
                Open Ideas
              </TabsTrigger>
            </TabsList>

            {/* Sparks & Insights Content */}
            <TabsContent value="sparks" className="mt-0">
              <div className="min-h-[400px]">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className={cn("w-8 h-8 animate-spin", isBusinessMode ? "text-primary" : "text-[var(--accent)]")} />
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-center py-20">
                    <div className={cn(
                      "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center",
                      isBusinessMode ? "bg-muted border border-border" : "bg-[var(--glass-bg)] border border-[var(--glass-border)]"
                    )}>
                      <Sparkles className={cn("w-8 h-8", isBusinessMode ? "text-muted-foreground" : "text-[var(--text-tertiary)]")} />
                    </div>
                    <p className={cn(isBusinessMode ? "text-muted-foreground" : "text-[var(--text-secondary)]")}>No sparks found</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        className={cn(
                          "rounded-2xl overflow-hidden backdrop-blur-xl transition-all duration-300 animate-feed-card-enter",
                          isBusinessMode 
                            ? "bg-card border border-border shadow-sm hover:shadow-md hover:border-border/80" 
                            : "bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-white/10 hover:border-white/20"
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <PostToSparkCard 
                          post={{
                            id: item.id,
                            title: item.title,
                            content: item.content,
                            created_at: item.created_at,
                            updated_at: item.created_at,
                            type: item.type as 'brainstorm' | 'insight',
                            kind: 'Spark',
                            user_id: '',
                            mode: 'public',
                            status: 'active',
                            visibility: 'public',
                            metadata: null,
                            likes_count: 0,
                            comments_count: 0,
                            views_count: 0,
                            t_score: item.t_score,
                            u_score: item.u_score
                          }} 
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="mt-0">
              <div className="min-h-[400px]">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className={cn("w-8 h-8 animate-spin", isBusinessMode ? "text-primary" : "text-[var(--accent)]")} />
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-center py-20">
                    <div className={cn(
                      "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center",
                      isBusinessMode ? "bg-muted border border-border" : "bg-[var(--glass-bg)] border border-[var(--glass-border)]"
                    )}>
                      <Building2 className={cn("w-8 h-8", isBusinessMode ? "text-muted-foreground" : "text-[var(--text-tertiary)]")} />
                    </div>
                    <p className={cn(isBusinessMode ? "text-muted-foreground" : "text-[var(--text-secondary)]")}>No insights found</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        className={cn(
                          "rounded-2xl overflow-hidden backdrop-blur-xl transition-all duration-300 animate-feed-card-enter",
                          isBusinessMode 
                            ? "bg-card border border-border shadow-sm hover:shadow-md hover:border-border/80" 
                            : "bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-white/10 hover:border-white/20"
                        )}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <PostToSparkCard 
                          post={{
                            id: item.id,
                            title: item.title,
                            content: item.content,
                            created_at: item.created_at,
                            updated_at: item.created_at,
                            type: 'insight',
                            kind: 'BusinessInsight',
                            user_id: '',
                            mode: 'public',
                            status: 'active',
                            visibility: 'public',
                            metadata: null,
                            likes_count: 0,
                            comments_count: 0,
                            views_count: 0,
                            t_score: item.t_score,
                            u_score: item.u_score
                          }} 
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Open Ideas with Infinite Scroll */}
            <TabsContent value="open-ideas" className="mt-0">
              <div className="min-h-[400px]">
                {openIdeasLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className={cn("w-8 h-8 animate-spin", isBusinessMode ? "text-primary" : "text-[var(--accent)]")} />
                  </div>
                ) : openIdeas.length === 0 ? (
                  <div className="text-center py-20">
                    <div className={cn(
                      "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center",
                      isBusinessMode ? "bg-muted border border-border" : "bg-[var(--glass-bg)] border border-[var(--glass-border)]"
                    )}>
                      <Lightbulb className={cn("w-8 h-8", isBusinessMode ? "text-muted-foreground" : "text-[var(--text-tertiary)]")} />
                    </div>
                    <p className={cn(isBusinessMode ? "text-muted-foreground" : "text-[var(--text-secondary)]")}>No open ideas found</p>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {openIdeas.map((idea, index) => {
                        const sparkCount = lineageCounts[idea.id] || 0;
                        return (
                          <button
                            key={idea.id}
                            onClick={() => handleIdeaClick(idea.id)}
                            className={cn(
                              "group text-left rounded-2xl p-5 min-h-[180px]",
                              "flex flex-col justify-between",
                              "backdrop-blur-sm transition-all duration-300 animate-feed-card-enter cursor-pointer",
                              isBusinessMode 
                                ? "bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/30" 
                                : "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_30px_rgba(72,159,227,0.15)]"
                            )}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <p className={cn(
                              "text-sm leading-relaxed line-clamp-4",
                              isBusinessMode ? "text-foreground" : "text-foreground/90"
                            )}>
                              {idea.content}
                            </p>
                            <div className={cn(
                              "mt-4 pt-3 border-t flex items-center justify-between text-xs",
                              isBusinessMode ? "border-border text-muted-foreground" : "border-white/10 text-muted-foreground"
                            )}>
                              <span className="uppercase tracking-wider text-[10px]">
                                {idea.source === 'intake' ? 'From a visitor' : 'From the community'}
                              </span>
                              <div className="flex items-center gap-3">
                                {sparkCount > 0 && (
                                  <span className={cn(
                                    "flex items-center gap-1",
                                    isBusinessMode ? "text-primary" : "text-[hsl(var(--accent))]"
                                  )}>
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
                    <div ref={infiniteScrollTrigger} className="h-10 mt-4">
                      {openIdeasLoadingMore && (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className={cn("w-5 h-5 animate-spin", isBusinessMode ? "text-primary" : "text-[var(--accent)]")} />
                          <span className="ml-2 text-sm text-muted-foreground">Loading more…</span>
                        </div>
                      )}
                      {!openIdeasHasMore && openIdeas.length > 0 && (
                        <p className="text-center text-sm text-muted-foreground py-4">
                          You've reached the end
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ComposerModal isOpen={isOpen} onClose={closeComposer} />
    </>
  );
};

export default Research;
