import { useState } from 'react';
import { useAppMode } from '@/contexts/AppModeContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, TrendingUp, Award, Clock, Sparkles, Building2, Lightbulb } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Research = () => {
  const { mode } = useAppMode();
  const [activeTab, setActiveTab] = useState('sparks');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [filterIndustry, setFilterIndustry] = useState('all');

  const sortOptions = [
    { value: 'recent', label: 'Most Recent', icon: Clock },
    { value: 't_score', label: 'T-Score', icon: TrendingUp },
    { value: 'u_score', label: 'U-Score', icon: Award }
  ];

  const industries = [
    'All Industries',
    'Technology',
    'Healthcare',
    'Finance',
    'Manufacturing',
    'Education',
    'Marketing'
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const handleSort = (value: string) => {
    setSortBy(value);
    console.log('Sorting by:', value);
  };

  const handleFilter = (value: string) => {
    setFilterIndustry(value);
    console.log('Filtering by industry:', value);
  };

  return (
    <div className="min-h-screen p-6 pb-32 bg-gradient-space">
      <div className="max-w-6xl mx-auto">
        {/* Simple Header - No Card */}
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <Search className="w-8 h-8 text-[var(--accent)]" />
            <h1 className="text-4xl font-light tracking-wide text-[var(--text-primary)]">
              Research Hub
            </h1>
          </div>
          <p className="font-light max-w-2xl mx-auto text-[var(--text-secondary)]">
            Explore sparks, business insights, and open ideas
          </p>
        </header>

        {/* Search and Filter Controls */}
        <div className="mb-8 p-4 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-xl">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search for insights, sparks, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={handleSort}>
                <SelectTrigger className="w-40 bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-primary)]">
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
              <Select value={filterIndustry} onValueChange={handleFilter}>
                <SelectTrigger className="w-40 bg-[var(--glass-bg)] border-[var(--glass-border)] text-[var(--text-primary)]">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry.toLowerCase().replace(' ', '_')}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="submit" className="bg-[var(--accent)] hover:bg-[var(--accent)]/80 text-[var(--accent-on)]">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>

        {/* Research Tabs - Updated */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] backdrop-blur-xl">
            <TabsTrigger value="sparks" className="flex items-center gap-2 data-[state=active]:bg-white/10">
              <Sparkles className="h-4 w-4" />
              Sparks
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2 data-[state=active]:bg-white/10">
              <Building2 className="h-4 w-4" />
              Business Insights
            </TabsTrigger>
            <TabsTrigger value="open-ideas" className="flex items-center gap-2 data-[state=active]:bg-white/10">
              <Lightbulb className="h-4 w-4" />
              Open Ideas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sparks" className="space-y-4">
            <Card className={`p-8 text-center transition-all duration-700 ${
              mode === 'public'
                ? 'glass-card border-white/20 bg-black/20'
                : 'border-blue-200/30 bg-white/40'
            }`}>
              <Sparkles className={`w-16 h-16 mx-auto mb-4 ${
                mode === 'public' ? 'text-white/30' : 'text-slate-400'
              }`} />
              <h3 className={`text-xl font-medium mb-2 ${
                mode === 'public' ? 'text-white' : 'text-slate-800'
              }`}>
                Community Sparks
              </h3>
              <p className={`text-sm mb-4 ${
                mode === 'public' ? 'text-white/70' : 'text-slate-600'
              }`}>
                Explore innovative ideas and discussions from the community.
              </p>
              <Button onClick={() => console.log('Loading sparks...')} className={`${
                mode === 'public'
                  ? 'bg-[#489FE3] hover:bg-[#489FE3]/80'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}>
                Load Sparks
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Card className={`p-8 text-center transition-all duration-700 ${
              mode === 'public'
                ? 'glass-card border-white/20 bg-black/20'
                : 'border-blue-200/30 bg-white/40'
            }`}>
              <Building2 className={`w-16 h-16 mx-auto mb-4 ${
                mode === 'public' ? 'text-white/30' : 'text-slate-400'
              }`} />
              <h3 className={`text-xl font-medium mb-2 ${
                mode === 'public' ? 'text-white' : 'text-slate-800'
              }`}>
                Business Insights
              </h3>
              <p className={`text-sm mb-4 ${
                mode === 'public' ? 'text-white/70' : 'text-slate-600'
              }`}>
                Discover industry insights and strategic perspectives from business leaders.
              </p>
              <Button onClick={() => console.log('Loading insights...')} className={`${
                mode === 'public'
                  ? 'bg-[#489FE3] hover:bg-[#489FE3]/80'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}>
                Load Insights
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="open-ideas" className="space-y-4">
            <Card className={`p-8 text-center transition-all duration-700 ${
              mode === 'public'
                ? 'glass-card border-white/20 bg-black/20'
                : 'border-blue-200/30 bg-white/40'
            }`}>
              <Lightbulb className={`w-16 h-16 mx-auto mb-4 ${
                mode === 'public' ? 'text-white/30' : 'text-slate-400'
              }`} />
              <h3 className={`text-xl font-medium mb-2 ${
                mode === 'public' ? 'text-white' : 'text-slate-800'
              }`}>
                Open Ideas
              </h3>
              <p className={`text-sm mb-4 ${
                mode === 'public' ? 'text-white/70' : 'text-slate-600'
              }`}>
                Browse and contribute to open ideas waiting for community input.
              </p>
              <Button onClick={() => console.log('Loading open ideas...')} className={`${
                mode === 'public'
                  ? 'bg-[#489FE3] hover:bg-[#489FE3]/80'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}>
                Load Open Ideas
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Research;
