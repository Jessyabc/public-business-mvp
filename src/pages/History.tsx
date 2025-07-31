import { useState } from 'react';
import { useAppMode } from '@/contexts/AppModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Building2, User, History as HistoryIcon, Clock, Bookmark, Plus, Eye, MessageCircle, Share2, Video, FileText, TrendingUp, Filter, Calendar, BarChart3 } from 'lucide-react';
import { useComposerStore } from '@/hooks/useComposerStore';
import { formatDistanceToNow } from 'date-fns';

const History = () => {
  const { mode } = useAppMode();
  const { user } = useAuth();
  const { openComposer } = useComposerStore();
  const [viewType, setViewType] = useState<'chronological' | 'popular'>('chronological');
  const [filterType, setFilterType] = useState<'all' | 'brainstorm' | 'report' | 'webinar'>('all');
  const [filterMode, setFilterMode] = useState<'all' | 'public' | 'business'>('all');

  // Mock history data
  const mockHistory = [
    {
      id: '1',
      type: 'brainstorm',
      title: 'AI-powered customer service innovations',
      content: 'Exploring how AI can transform customer service interactions...',
      timestamp: new Date('2024-01-20T10:30:00'),
      tScore: 85,
      uScore: null,
      interactions: 12,
      views: 234,
      mode: 'public'
    },
    {
      id: '2',
      type: 'report',
      title: 'Digital Transformation ROI Analysis',
      content: 'Comprehensive analysis of digital transformation investments...',
      timestamp: new Date('2024-01-18T15:45:00'),
      tScore: null,
      uScore: 92,
      interactions: 23,
      views: 567,
      mode: 'business'
    },
    {
      id: '3',
      type: 'saved',
      title: 'Sustainable Supply Chain Transformation',
      content: 'Live discussion on implementing eco-friendly practices...',
      timestamp: new Date('2024-01-15T09:15:00'),
      author: 'GreenLogistics Co',
      interactions: 34,
      views: 456,
      mode: 'business'
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

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'brainstorm': return <Brain className="w-4 h-4 text-primary" />;
      case 'report': return <FileText className="w-4 h-4 text-blue-600" />;
      case 'webinar': return <Video className="w-4 h-4 text-green-600" />;
      case 'saved': return <Bookmark className="w-4 h-4 text-orange-500" />;
      default: return <HistoryIcon className="w-4 h-4" />;
    }
  };

  const getItemBadge = (type: string) => {
    switch (type) {
      case 'brainstorm': return <Badge className="bg-primary/20 text-primary border-primary/20">Brainstorm</Badge>;
      case 'report': return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/20">Report</Badge>;
      case 'webinar': return <Badge className="bg-green-500/20 text-green-600 border-green-500/20">Webinar</Badge>;
      case 'saved': return <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/20">Saved</Badge>;
      default: return null;
    }
  };

  const getScoreColor = (score: number, isPublic: boolean) => {
    if (score >= 80) return isPublic ? "text-green-400 border-green-500/30 bg-green-500/20" : "text-green-600 border-green-500/30 bg-green-500/20";
    if (score >= 60) return isPublic ? "text-blue-400 border-blue-500/30 bg-blue-500/20" : "text-blue-600 border-blue-500/30 bg-blue-500/20";
    return isPublic ? "text-purple-400 border-purple-500/30 bg-purple-500/20" : "text-purple-600 border-purple-500/30 bg-purple-500/20";
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-light text-foreground mb-2">Sign in to view your profile</h2>
          <p className="text-muted-foreground">Manage your profile and track your content history</p>
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
    <div className={`min-h-screen p-6 pb-32 transition-all duration-700 ease-in-out ${
      mode === 'public' 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className={`glass-card rounded-3xl p-8 backdrop-blur-xl transition-all duration-700 ${
            mode === 'public'
              ? 'border-white/20 bg-black/20'
              : 'border-blue-200/30 bg-white/40'
          }`}>
            <div className="flex items-center justify-center space-x-3 mb-4">
              <User className={`w-8 h-8 ${mode === 'public' ? 'text-[#489FE3]' : 'text-blue-600'}`} />
              <h1 className={`text-4xl font-light tracking-wide ${
                mode === 'public' ? 'text-white' : 'text-slate-800'
              }`}>
                Profile & History
              </h1>
            </div>
            <p className={`mt-2 font-light max-w-2xl mx-auto text-center ${
              mode === 'public' ? 'text-white/80' : 'text-slate-600'
            }`}>
              Manage your profile and view your content history
            </p>
          </div>
        </header>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className={`grid w-full grid-cols-2 glass-card backdrop-blur-xl ${
            mode === 'public'
              ? 'bg-black/20 border-white/20'
              : 'bg-white/40 border-blue-200/30'
          }`}>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <HistoryIcon className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileForm />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            {/* Create New Content Section */}
            <Card className={`glass-card backdrop-blur-xl transition-all duration-700 ${
              mode === 'public'
                ? 'border-white/20 bg-black/20'
                : 'border-blue-200/30 bg-white/40'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-semibold ${
                      mode === 'public' ? 'text-white' : 'text-slate-800'
                    }`}>
                      Create New Content
                    </h3>
                    <p className={`text-sm ${
                      mode === 'public' ? 'text-white/70' : 'text-slate-600'
                    }`}>
                      Share your ideas and insights with the community
                    </p>
                  </div>
                  <Button 
                    onClick={() => openComposer()}
                    className={`transition-all duration-300 ${
                      mode === 'public'
                        ? 'bg-[#489FE3]/20 hover:bg-[#489FE3]/30 text-white border-[#489FE3]/50'
                        : 'bg-blue-100/40 hover:bg-blue-100/60 text-blue-600 border-blue-300/40'
                    } glass-card backdrop-blur-xl`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Post
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* View Toggle and Filters */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <Tabs value={viewType} onValueChange={(value) => setViewType(value as 'chronological' | 'popular')}>
                <TabsList className={`glass-card backdrop-blur-xl ${
                  mode === 'public'
                    ? 'bg-black/20 border-white/20'
                    : 'bg-white/40 border-blue-200/30'
                }`}>
                  <TabsTrigger value="chronological" className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Chronological</span>
                  </TabsTrigger>
                  <TabsTrigger value="popular" className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Popular</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex space-x-2">
                <select
                  value={filterMode}
                  onChange={(e) => setFilterMode(e.target.value as 'all' | 'public' | 'business')}
                  className={`glass-card backdrop-blur-xl border rounded-md px-3 py-2 text-sm ${
                    mode === 'public'
                      ? 'bg-black/20 border-white/20 text-white'
                      : 'bg-white/40 border-blue-200/30 text-slate-800'
                  }`}
                >
                  <option value="all" className="bg-background">All Modes</option>
                  <option value="public" className="bg-background">Public Only</option>
                  <option value="business" className="bg-background">Business Only</option>
                </select>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as 'all' | 'brainstorm' | 'report' | 'webinar')}
                  className={`glass-card backdrop-blur-xl border rounded-md px-3 py-2 text-sm ${
                    mode === 'public'
                      ? 'bg-black/20 border-white/20 text-white'
                      : 'bg-white/40 border-blue-200/30 text-slate-800'
                  }`}
                >
                  <option value="all" className="bg-background">All Types</option>
                  <option value="brainstorm" className="bg-background">Brainstorms</option>
                  <option value="report" className="bg-background">Reports</option>
                  <option value="webinar" className="bg-background">Webinars</option>
                </select>
              </div>
            </div>

            {/* History Items */}
            <div className="space-y-4">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Filter className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No items found with current filters</p>
                </div>
              ) : (
                filteredHistory.map((item) => {
                  const isPublic = item.mode === 'public';
                  const score = item.tScore || item.uScore;
                  
                  return (
                    <Card key={item.id} className={`glass-card backdrop-blur-xl transition-all duration-300 hover:border-opacity-50 ${
                      mode === 'public'
                        ? 'border-white/20 bg-black/20 hover:bg-black/30'
                        : 'border-blue-200/30 bg-white/40 hover:bg-white/50'
                    } ${isPublic 
                        ? 'border-l-4 border-l-primary/50' 
                        : 'border-l-4 border-l-blue-500/50'
                      }`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getItemIcon(item.type)}
                            <div>
                              <CardTitle className={`text-lg ${
                                mode === 'public' ? 'text-white' : 'text-slate-800'
                              }`}>
                                {item.title}
                              </CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                {getItemBadge(item.type)}
                                <Badge className={`text-xs ${
                                  isPublic 
                                    ? 'bg-primary/20 text-primary border-primary/20'
                                    : 'bg-blue-500/20 text-blue-600 border-blue-500/20'
                                }`}>
                                  {isPublic ? 'Public' : 'Business'}
                                </Badge>
                                <div className={`flex items-center gap-1 text-xs ${
                                  mode === 'public' ? 'text-white/60' : 'text-slate-500'
                                }`}>
                                  <Clock className="w-3 h-3" />
                                  {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                                </div>
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
                      <CardContent>
                        <p className={`text-sm mb-4 line-clamp-2 ${
                          mode === 'public' ? 'text-white/80' : 'text-slate-600'
                        }`}>
                          {item.content}
                        </p>
                        
                        {item.author && (
                          <p className={`text-xs mb-3 ${
                            mode === 'public' ? 'text-white/60' : 'text-slate-500'
                          }`}>
                            by {item.author}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className={`flex items-center gap-4 text-xs ${
                            mode === 'public' ? 'text-white/60' : 'text-slate-500'
                          }`}>
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {item.views}
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {item.interactions}
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={`text-xs ${
                                mode === 'public'
                                  ? 'text-primary hover:text-primary/80 hover:bg-primary/10' 
                                  : 'text-blue-600 hover:text-blue-700 hover:bg-blue-500/10'
                              }`}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className={`text-xs ${
                                mode === 'public'
                                  ? 'text-primary hover:text-primary/80 hover:bg-primary/10' 
                                  : 'text-blue-600 hover:text-blue-700 hover:bg-blue-500/10'
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default History;