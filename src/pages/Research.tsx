import { useState } from 'react';
import { useAppMode } from '@/contexts/AppModeContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, TrendingUp, Award, Clock, Filter, FileText, Users, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Research = () => {
  const { mode } = useAppMode();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('t_score');
  const [filterIndustry, setFilterIndustry] = useState('all');

  const sortOptions = [
    { value: 't_score', label: 'T-Score', icon: TrendingUp },
    { value: 'u_score', label: 'U-Score', icon: Award },
    { value: 'recent', label: 'Most Recent', icon: Clock }
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
    // Add search functionality here
    console.log('Searching for:', searchQuery);
  };

  const handleSort = (value: string) => {
    setSortBy(value);
    // Add sort functionality here
    console.log('Sorting by:', value);
  };

  const handleFilter = (value: string) => {
    setFilterIndustry(value);
    // Add filter functionality here
    console.log('Filtering by industry:', value);
  };

  return (
    <div className={`min-h-screen p-6 pb-32 transition-all duration-700 ease-in-out ${
      mode === 'public' 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className={`glass-card rounded-3xl p-8 backdrop-blur-xl transition-all duration-700 ${
            mode === 'public'
              ? 'border-white/20 bg-black/20'
              : 'border-blue-200/30 bg-white/40'
          }`}>
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Search className={`w-8 h-8 ${
                mode === 'public' ? 'text-[#489FE3]' : 'text-blue-600'
              }`} />
              <h1 className={`text-4xl font-light tracking-wide ${
                mode === 'public' ? 'text-white' : 'text-slate-800'
              }`}>
                Research Hub
              </h1>
            </div>
            <p className={`mt-2 font-light max-w-2xl mx-auto text-center ${
              mode === 'public' ? 'text-white/80' : 'text-slate-600'
            }`}>
              Explore high-value business reports, insights, and community brainstorms
            </p>
          </div>
        </header>

        {/* Search and Filter Controls */}
        <div className={`glass-card rounded-2xl p-6 mb-8 backdrop-blur-xl transition-all duration-700 ${
          mode === 'public'
            ? 'border-white/20 bg-black/20'
            : 'border-blue-200/30 bg-white/40'
        }`}>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search for insights, reports, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${
                  mode === 'public'
                    ? 'bg-white/10 border-white/20 text-white placeholder:text-white/60'
                    : 'bg-white/50 border-blue-200/30'
                }`}
              />
            </div>
            <div className="flex gap-2">
              <Select value={sortBy} onValueChange={handleSort}>
                <SelectTrigger className={`w-40 ${
                  mode === 'public'
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-white/50 border-blue-200/30'
                }`}>
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
                <SelectTrigger className={`w-40 ${
                  mode === 'public'
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-white/50 border-blue-200/30'
                }`}>
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
              <Button type="submit" className={`${
                mode === 'public'
                  ? 'bg-[#489FE3] hover:bg-[#489FE3]/80'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>

        {/* Research Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full grid-cols-4 ${
            mode === 'public'
              ? 'bg-black/20 border-white/20'
              : 'bg-white/40 border-blue-200/30'
          }`}>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              All Content
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Business Reports
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="brainstorms" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Brainstorms
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card className={`p-8 text-center transition-all duration-700 ${
              mode === 'public'
                ? 'glass-card border-white/20 bg-black/20'
                : 'border-blue-200/30 bg-white/40'
            }`}>
              <FileText className={`w-16 h-16 mx-auto mb-4 ${
                mode === 'public' ? 'text-white/30' : 'text-slate-400'
              }`} />
              <h3 className={`text-xl font-medium mb-2 ${
                mode === 'public' ? 'text-white' : 'text-slate-800'
              }`}>
                All Research Content
              </h3>
              <p className={`text-sm mb-4 ${
                mode === 'public' ? 'text-white/70' : 'text-slate-600'
              }`}>
                Browse all available research content including business reports, insights, and community brainstorms.
              </p>
              <Button onClick={() => console.log('Loading all content...')} className={`${
                mode === 'public'
                  ? 'bg-[#489FE3] hover:bg-[#489FE3]/80'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}>
                Load Content
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
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
                Business Reports
              </h3>
              <p className={`text-sm mb-4 ${
                mode === 'public' ? 'text-white/70' : 'text-slate-600'
              }`}>
                Access detailed business reports, whitepapers, and financial insights from verified business members.
              </p>
              <Button onClick={() => console.log('Loading business reports...')} className={`${
                mode === 'public'
                  ? 'bg-[#489FE3] hover:bg-[#489FE3]/80'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}>
                Load Reports
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <Card className={`p-8 text-center transition-all duration-700 ${
              mode === 'public'
                ? 'glass-card border-white/20 bg-black/20'
                : 'border-blue-200/30 bg-white/40'
            }`}>
              <TrendingUp className={`w-16 h-16 mx-auto mb-4 ${
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
                Discover industry insights, trend analyses, and strategic perspectives from business leaders.
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

          <TabsContent value="brainstorms" className="space-y-4">
            <Card className={`p-8 text-center transition-all duration-700 ${
              mode === 'public'
                ? 'glass-card border-white/20 bg-black/20'
                : 'border-blue-200/30 bg-white/40'
            }`}>
              <Users className={`w-16 h-16 mx-auto mb-4 ${
                mode === 'public' ? 'text-white/30' : 'text-slate-400'
              }`} />
              <h3 className={`text-xl font-medium mb-2 ${
                mode === 'public' ? 'text-white' : 'text-slate-800'
              }`}>
                Community Brainstorms
              </h3>
              <p className={`text-sm mb-4 ${
                mode === 'public' ? 'text-white/70' : 'text-slate-600'
              }`}>
                Explore collaborative brainstorming sessions and innovative ideas from the community.
              </p>
              <Button onClick={() => console.log('Loading brainstorms...')} className={`${
                mode === 'public'
                  ? 'bg-[#489FE3] hover:bg-[#489FE3]/80'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}>
                Load Brainstorms
              </Button>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Research;