import { useState, useEffect } from 'react';
import { useAppMode } from '@/contexts/AppModeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, TrendingUp, Award, Clock, Sparkles, Building2, Lightbulb, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { PostToSparkCard } from '@/components/brainstorm/PostToSparkCard';
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

const Research = () => {
  const { mode } = useAppMode();
  const [activeTab, setActiveTab] = useState('sparks');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [items, setItems] = useState<ResearchItem[]>([]);
  const [loading, setLoading] = useState(false);

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

      // Filter by type based on tab
      if (activeTab === 'sparks') {
        query = query.eq('type', 'brainstorm');
      } else if (activeTab === 'insights') {
        query = query.eq('type', 'insight');
      }

      // Search filter
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      // Sort
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

  const fetchOpenIdeas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('open_ideas_public_view')
        .select('id, content, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setItems((data || []).map(item => ({
        id: item.id || '',
        title: null,
        content: item.content || '',
        created_at: item.created_at || '',
        type: 'open_idea'
      })));
    } catch (err) {
      console.error('Error fetching open ideas:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'open-ideas') {
      fetchOpenIdeas();
    } else {
      fetchData();
    }
  }, [activeTab, sortBy, filterIndustry]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'open-ideas') {
      fetchOpenIdeas();
    } else {
      fetchData();
    }
  };

  const isBusinessMode = mode === 'business';

  return (
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

          {/* Content Area */}
          <div className="min-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className={cn(
                  "w-8 h-8 animate-spin",
                  isBusinessMode ? "text-primary" : "text-[var(--accent)]"
                )} />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-20">
                <div className={cn(
                  "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center",
                  isBusinessMode 
                    ? "bg-muted border border-border" 
                    : "bg-[var(--glass-bg)] border border-[var(--glass-border)]"
                )}>
                  {activeTab === 'sparks' && <Sparkles className={cn("w-8 h-8", isBusinessMode ? "text-muted-foreground" : "text-[var(--text-tertiary)]")} />}
                  {activeTab === 'insights' && <Building2 className={cn("w-8 h-8", isBusinessMode ? "text-muted-foreground" : "text-[var(--text-tertiary)]")} />}
                  {activeTab === 'open-ideas' && <Lightbulb className={cn("w-8 h-8", isBusinessMode ? "text-muted-foreground" : "text-[var(--text-tertiary)]")} />}
                </div>
                <p className={cn(isBusinessMode ? "text-muted-foreground" : "text-[var(--text-secondary)]")}>
                  No {activeTab === 'sparks' ? 'sparks' : activeTab === 'insights' ? 'insights' : 'open ideas'} found
                </p>
              </div>
            ) : (
              <TabsContent value={activeTab} className="mt-0">
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
                      {activeTab === 'open-ideas' ? (
                        <div className="p-6">
                          <p className={cn("line-clamp-3", isBusinessMode ? "text-foreground" : "text-[var(--text-primary)]")}>{item.content}</p>
                          <p className={cn("text-xs mt-3", isBusinessMode ? "text-muted-foreground" : "text-[var(--text-tertiary)]")}>
                            {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <PostToSparkCard 
                          post={{
                            id: item.id,
                            title: item.title,
                            content: item.content,
                            created_at: item.created_at,
                            updated_at: item.created_at,
                            type: item.type as 'brainstorm' | 'insight',
                            kind: item.type === 'brainstorm' ? 'Spark' : 'BusinessInsight',
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
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Research;
