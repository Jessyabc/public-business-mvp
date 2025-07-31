import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Video, Presentation, Plus, TrendingUp } from "lucide-react";

const mockBusinessPosts = [
  {
    id: 1,
    title: "Q4 Market Analysis: Tech Sector Trends",
    type: "Report",
    uScore: 85,
    engagement: "12 shares",
    author: "TechCorp Analytics",
    timestamp: "2 hours ago",
    preview: "Comprehensive analysis of emerging technologies and their market impact...",
  },
  {
    id: 2,
    title: "Remote Work Best Practices",
    type: "White Paper",
    uScore: 72,
    engagement: "8 links",
    author: "WorkFlow Solutions",
    timestamp: "5 hours ago",
    preview: "Evidence-based strategies for maintaining productivity in distributed teams...",
  },
  {
    id: 3,
    title: "AI Implementation Webinar",
    type: "Webinar",
    uScore: 91,
    engagement: "24 attendees",
    author: "Innovation Labs",
    timestamp: "1 day ago",
    preview: "Live session covering practical AI integration for business processes...",
  },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Report': return FileText;
    case 'White Paper': return FileText;
    case 'Webinar': return Video;
    case 'Video': return Video;
    default: return Presentation;
  }
};

const getUScoreColor = (score: number) => {
  if (score >= 80) return "text-green-400 border-green-500/30 bg-green-500/20";
  if (score >= 60) return "text-blue-400 border-blue-500/30 bg-blue-500/20";
  return "text-slate-400 border-slate-500/30 bg-slate-500/20";
};

export function BusinessFeed() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <TrendingUp className="w-8 h-8 text-slate-300" />
            <h1 className="text-4xl font-light text-slate-100 tracking-wide">
              Business Insights
            </h1>
          </div>
          <p className="text-slate-300/80 mt-2 font-light max-w-2xl mx-auto">
            Professional insights • Industry reports • Strategic analysis
          </p>
        </header>

        {/* Sort Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="border-slate-500/30 text-slate-300">
              U-Score
            </Button>
            <Button variant="outline" size="sm" className="border-slate-500/30 text-slate-300">
              Industry
            </Button>
            <Button variant="outline" size="sm" className="border-slate-500/30 text-slate-300">
              Recency
            </Button>
          </div>
          
          <Button className="bg-slate-600 hover:bg-slate-500 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Insight
          </Button>
        </div>

        {/* Business Posts Grid */}
        <div className="grid gap-6">
          {mockBusinessPosts.map((post) => {
            const TypeIcon = getTypeIcon(post.type);
            
            return (
              <Card key={post.id} className="glass-card border-slate-500/20 hover:border-slate-400/30 transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-slate-600/30">
                        <TypeIcon className="w-5 h-5 text-slate-300" />
                      </div>
                      <div>
                        <CardTitle className="text-slate-100 text-lg font-semibold">
                          {post.title}
                        </CardTitle>
                        <div className="flex items-center space-x-3 mt-1">
                          <Badge variant="outline" className="text-xs border-slate-500/30 text-slate-400">
                            {post.type}
                          </Badge>
                          <span className="text-xs text-slate-400">{post.author}</span>
                          <span className="text-xs text-slate-500">{post.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* U-Score Progress Ring */}
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${getUScoreColor(post.uScore)}`}>
                        <span className="text-sm font-bold">{post.uScore}</span>
                      </div>
                      <span className="text-xs text-slate-500 mt-1">U-Score</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-slate-300/80 text-sm leading-relaxed mb-4">
                    {post.preview}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-slate-400">{post.engagement}</span>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
                        Share
                      </Button>
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200">
                        Link
                      </Button>
                    </div>
                    
                    <Button size="sm" className="bg-slate-600 hover:bg-slate-500 text-white">
                      View Full
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}