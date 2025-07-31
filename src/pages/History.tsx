import { useState } from 'react';
import { useAppMode } from '@/contexts/AppModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  FileText, 
  Video, 
  Clock, 
  TrendingUp, 
  Filter,
  Calendar,
  BarChart3,
  Presentation
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Mock history data
const mockHistory = [
  {
    id: '1',
    type: 'brainstorm',
    title: 'The future of remote work collaboration',
    content: 'What if we could create virtual spaces that feel more natural than current video calls?',
    timestamp: new Date('2024-01-20T10:30:00'),
    tScore: 85,
    uScore: null,
    interactions: 12,
    views: 150,
    mode: 'public'
  },
  {
    id: '2',
    type: 'report',
    title: 'Q1 Digital Transformation Trends',
    content: 'Comprehensive analysis of enterprise digital adoption patterns...',
    timestamp: new Date('2024-01-18T14:20:00'),
    tScore: null,
    uScore: 78,
    interactions: 8,
    views: 320,
    mode: 'business'
  },
  {
    id: '3',
    type: 'brainstorm',
    title: 'Sustainable cities of tomorrow',
    content: 'Reimagining urban infrastructure with nature-integrated design principles',
    timestamp: new Date('2024-01-15T09:15:00'),
    tScore: 92,
    uScore: null,
    interactions: 18,
    views: 240,
    mode: 'public'
  },
  {
    id: '4',
    type: 'webinar',
    title: 'AI Implementation Workshop',
    content: 'Live session on practical AI integration strategies for small businesses',
    timestamp: new Date('2024-01-12T16:00:00'),
    tScore: null,
    uScore: 88,
    interactions: 25,
    views: 150,
    mode: 'business'
  }
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'brainstorm': return Brain;
    case 'report': return FileText;
    case 'webinar': return Video;
    case 'video': return Video;
    default: return Presentation;
  }
};

const getScoreColor = (score: number, isPublic: boolean) => {
  if (score >= 80) return isPublic ? "text-green-400 border-green-500/30 bg-green-500/20" : "text-green-400 border-green-500/30 bg-green-500/20";
  if (score >= 60) return isPublic ? "text-blue-400 border-blue-500/30 bg-blue-500/20" : "text-slate-300 border-slate-500/30 bg-slate-500/20";
  return isPublic ? "text-purple-400 border-purple-500/30 bg-purple-500/20" : "text-slate-400 border-slate-500/30 bg-slate-500/20";
};

export default function History() {
  const { mode } = useAppMode();
  const { user } = useAuth();
  const [viewType, setViewType] = useState<'chronological' | 'popular'>('chronological');
  const [filterType, setFilterType] = useState<'all' | 'brainstorm' | 'report' | 'webinar'>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'public' | 'business'>('all');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-light text-foreground mb-2">Sign in to view your history</h2>
          <p className="text-muted-foreground">Track your brainstorms and insights over time</p>
        </div>
      </div>
    );
  }

  // Filter the data
  let filteredHistory = mockHistory;
  
  if (filterType !== 'all') {
    filteredHistory = filteredHistory.filter(item => item.type === filterType);
  }
  
  if (filterMode !== 'all') {
    filteredHistory = filteredHistory.filter(item => item.mode === filterMode);
  }

  // Sort the data
  if (viewType === 'popular') {
    filteredHistory = [...filteredHistory].sort((a, b) => {
      const aScore = a.tScore || a.uScore || 0;
      const bScore = b.tScore || b.uScore || 0;
      return bScore - aScore;
    });
  } else {
    filteredHistory = [...filteredHistory].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className={`w-8 h-8 ${mode === 'public' ? 'text-blue-400' : 'text-slate-300'}`} />
            <h1 className={`text-4xl font-light tracking-wide ${mode === 'public' ? 'text-blue-100' : 'text-slate-100'}`}>
              Your History
            </h1>
          </div>
          <p className={`font-light max-w-2xl ${mode === 'public' ? 'text-blue-300/80' : 'text-slate-300/80'}`}>
            Track your thoughts and insights over time • Discover patterns in your creativity
          </p>
        </header>

        {/* View Toggle and Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <Tabs value={viewType} onValueChange={(value) => setViewType(value as 'chronological' | 'popular')}>
            <TabsList className="glass bg-white/5">
              <TabsTrigger value="chronological" className="data-[state=active]:bg-white/10 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Chronological</span>
              </TabsTrigger>
              <TabsTrigger value="popular" className="data-[state=active]:bg-white/10 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Popular</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex space-x-2">
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as 'all' | 'public' | 'business')}
              className="glass border border-white/20 rounded-md px-3 py-2 text-sm bg-transparent text-foreground"
            >
              <option value="all" className="bg-background">All Modes</option>
              <option value="public" className="bg-background">Public Only</option>
              <option value="business" className="bg-background">Business Only</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'brainstorm' | 'report' | 'webinar')}
              className="glass border border-white/20 rounded-md px-3 py-2 text-sm bg-transparent text-foreground"
            >
              <option value="all" className="bg-background">All Types</option>
              <option value="brainstorm" className="bg-background">Brainstorms</option>
              <option value="report" className="bg-background">Reports</option>
              <option value="webinar" className="bg-background">Webinars</option>
            </select>
          </div>
        </div>

        {/* History Grid */}
        <div className="grid gap-6">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No items found with current filters</p>
            </div>
          ) : (
            filteredHistory.map((item) => {
              const TypeIcon = getTypeIcon(item.type);
              const isPublic = item.mode === 'public';
              const score = item.tScore || item.uScore;
              
              return (
                <Card 
                  key={item.id} 
                  className={`glass-card border-0 hover:bg-white/5 transition-all duration-300 ${
                    isPublic 
                      ? 'border-l-4 border-l-blue-500/50' 
                      : 'border-l-4 border-l-slate-500/50'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          isPublic ? 'bg-blue-500/20' : 'bg-slate-600/30'
                        }`}>
                          <TypeIcon className={`w-5 h-5 ${
                            isPublic ? 'text-blue-400' : 'text-slate-300'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <CardTitle className={`text-lg font-semibold mb-1 ${
                            isPublic ? 'text-blue-100' : 'text-slate-100'
                          }`}>
                            {item.title}
                          </CardTitle>
                          <div className="flex items-center space-x-3">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                isPublic 
                                  ? 'border-blue-500/30 text-blue-400' 
                                  : 'border-slate-500/30 text-slate-400'
                              }`}
                            >
                              {item.type}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                isPublic 
                                  ? 'border-blue-500/30 text-blue-300' 
                                  : 'border-slate-500/30 text-slate-300'
                              }`}
                            >
                              {isPublic ? 'Public' : 'Business'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {score && (
                        <div className="flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${getScoreColor(score, isPublic)}`}>
                            <span className="text-sm font-bold">{score}</span>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1">
                            {isPublic ? 'T-Score' : 'U-Score'}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className={`text-sm leading-relaxed mb-4 ${
                      isPublic ? 'text-blue-100/80' : 'text-slate-300/80'
                    }`}>
                      {item.content}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <BarChart3 className="w-3 h-3" />
                          <span>{item.interactions} interactions</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>{item.views} views</span>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`text-xs ${
                            isPublic 
                              ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10' 
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-500/10'
                          }`}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`text-xs ${
                            isPublic 
                              ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10' 
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-500/10'
                          }`}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}