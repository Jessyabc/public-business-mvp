import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, TrendingUp, Award, Clock, Sparkles, Building2, Loader2, Users } from 'lucide-react';
import { CompanySearch } from '@/components/orgs/CompanySearch';
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


const Research = () => {
  const { isOpen, openComposer, closeComposer } = useComposerStore();
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
    fetchData();
  }, [activeTab, sortBy, filterIndustry]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <>
      <div className="min-h-screen p-6 pb-32 transition-colors duration-300 bg-background">
        <div className="max-w-6xl mx-auto">
          {/* Simple Header */}
          <header className="mb-8 text-center">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <Search className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-light tracking-wide text-foreground">
                Research Hub
              </h1>
            </div>
            <p className="font-light max-w-2xl mx-auto text-muted-foreground">
              Explore sparks, business insights, and companies
            </p>
          </header>

          {/* Search and Filter Controls */}
          <div className="mb-8 p-4 rounded-2xl backdrop-blur-xl bg-card border border-border shadow-sm">
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search for insights, sparks, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-background border-input text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 bg-background border-input text-foreground">
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
                  <SelectTrigger className="w-40 bg-background border-input text-foreground">
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
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>

          {/* Research Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 backdrop-blur-xl bg-muted border border-border">
              <TabsTrigger value="sparks" className="flex items-center gap-2 data-[state=active]:bg-background">
                <Sparkles className="h-4 w-4" />
                Sparks
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2 data-[state=active]:bg-background">
                <Building2 className="h-4 w-4" />
                Business Insights
              </TabsTrigger>
              <TabsTrigger value="companies" className="flex items-center gap-2 data-[state=active]:bg-background">
                <Users className="h-4 w-4" />
                Companies
              </TabsTrigger>
            </TabsList>

            {/* Sparks & Insights Content */}
            <TabsContent value="sparks" className="mt-0">
              <div className="min-h-[400px]">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-muted border border-border">
                      <Sparkles className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No sparks found</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        className="rounded-2xl overflow-hidden backdrop-blur-xl transition-all duration-300 animate-feed-card-enter bg-card border border-border shadow-sm hover:shadow-md hover:border-border/80"
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
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-muted border border-border">
                      <Building2 className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No insights found</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        className="rounded-2xl overflow-hidden backdrop-blur-xl transition-all duration-300 animate-feed-card-enter bg-card border border-border shadow-sm hover:shadow-md hover:border-border/80"
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
                            kind: 'BusinessInsight',
                            user_id: '',
                            mode: 'business',
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

            <TabsContent value="companies" className="mt-0">
              <div className="min-h-[400px]">
                <CompanySearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
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
