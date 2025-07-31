import { BusinessPost } from "@/types/business-post";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Link, Eye, Share2, Bookmark, Zap, PlayCircle, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: BusinessPost;
  onViewPost: (postId: string) => void;
  onSavePost: (postId: string) => void;
  onLinkToBrainstorm: (postId: string) => void;
}

export function PostCard({ post, onViewPost, onSavePost, onLinkToBrainstorm }: PostCardProps) {
  const getPostTypeColor = (type: BusinessPost['type']) => {
    switch (type) {
      case 'insight': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'report': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'webinar': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'whitepaper': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'video': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getPostTypeIcon = (type: BusinessPost['type']) => {
    switch (type) {
      case 'webinar': return <PlayCircle className="w-3 h-3" />;
      case 'video': return <PlayCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  // Calculate U-Score progress percentage
  const uScoreProgress = (post.uScore.total / 100) * 100;

  return (
    <Card className={cn(
      "glass-card backdrop-blur-xl border border-white/10 p-6 transition-all duration-300 hover:border-white/20 hover:shadow-lg relative group",
      post.isHighlighted && "ring-2 ring-primary/30 shadow-primary/20"
    )}>
      {/* Highlight glow for linked posts */}
      {post.isHighlighted && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 rounded-lg pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10 ring-2 ring-white/10">
            <AvatarImage src={post.company.logo} alt={post.company.name} />
            <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
              {post.company.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-foreground">{post.company.name}</p>
            <p className="text-sm text-muted-foreground">{post.company.industry}</p>
          </div>
        </div>

        {/* U-Score Ring */}
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="2"
              className="opacity-20"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeDasharray={`${uScoreProgress}, 100`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-primary">{post.uScore.total}</span>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-semibold text-foreground line-clamp-2 flex-1">{post.title}</h3>
          <Badge className={cn("text-xs border", getPostTypeColor(post.type))}>
            <div className="flex items-center gap-1">
              {getPostTypeIcon(post.type)}
              {post.type}
            </div>
          </Badge>
        </div>
        
        {/* Live/Upcoming indicators for webinars */}
        {post.type === 'webinar' && (post.isLive || post.isUpcoming) && (
          <div className="flex items-center gap-2 mb-2">
            {post.isLive && (
              <Badge className="bg-red-500 text-white animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full mr-1" />
                LIVE
              </Badge>
            )}
            {post.isUpcoming && (
              <Badge className="bg-orange-500 text-white">
                <Calendar className="w-3 h-3 mr-1" />
                UPCOMING
              </Badge>
            )}
          </div>
        )}

        <p className="text-sm text-muted-foreground line-clamp-3">{post.summary}</p>
      </div>

      {/* U-Score Breakdown */}
      <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <MessageCircle className="w-3 h-3" />
          {formatCount(post.uScore.breakdown.comments)}
        </div>
        <div className="flex items-center gap-1">
          <Link className="w-3 h-3" />
          {formatCount(post.uScore.breakdown.links)}
        </div>
        <div className="flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {formatCount(post.uScore.breakdown.views)}
        </div>
        <div className="flex items-center gap-1">
          <Share2 className="w-3 h-3" />
          {formatCount(post.uScore.breakdown.shares)}
        </div>
      </div>

      {/* Link Trail */}
      {post.linkedBrainstorms > 0 && (
        <div className="mb-4 p-2 bg-primary/5 rounded-md">
          <p className="text-xs text-primary flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Cited by {post.linkedBrainstorms} brainstorm{post.linkedBrainstorms !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button 
          onClick={() => onViewPost(post.id)}
          className="flex-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20"
        >
          View Full Post
        </Button>
        <Button
          onClick={() => onSavePost(post.id)}
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
        >
          <Bookmark className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => onLinkToBrainstorm(post.id)}
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-primary"
        >
          <Zap className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}