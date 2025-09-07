import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, 
  Brain, 
  Zap, 
  BarChart3, 
  FileText, 
  Video,
  Eye,
  MessageCircle,
  Share2,
  CheckCircle
} from 'lucide-react';
import { PBPost, PBPostType } from '@/types/pb';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: PBPost;
  className?: string;
  onClick?: () => void;
}

const getPostTypeConfig = (type: PBPostType) => {
  const configs = {
    open_idea: {
      icon: Lightbulb,
      label: 'Open Idea',
      accent: 'accent-open',
      bgAccent: 'bg-accent-open/10',
      borderAccent: 'border-accent-open/20',
      textAccent: 'text-accent-open'
    },
    brainstorm: {
      icon: Brain,
      label: 'Brainstorm',
      accent: 'accent-brainstorm',
      bgAccent: 'bg-accent-brainstorm/10',
      borderAccent: 'border-accent-brainstorm/20',
      textAccent: 'text-accent-brainstorm'
    },
    brainstorm_continue: {
      icon: Zap,
      label: 'Continue',
      accent: 'accent-brainstorm',
      bgAccent: 'bg-accent-brainstorm/10',
      borderAccent: 'border-accent-brainstorm/20',
      textAccent: 'text-accent-brainstorm'
    },
    insight: {
      icon: BarChart3,
      label: 'Insight',
      accent: 'accent-insight',
      bgAccent: 'bg-accent-insight/10',
      borderAccent: 'border-accent-insight/20',
      textAccent: 'text-accent-insight'
    },
    insight_report: {
      icon: FileText,
      label: 'Report',
      accent: 'accent-insight',
      bgAccent: 'bg-accent-insight/10',
      borderAccent: 'border-accent-insight/20',
      textAccent: 'text-accent-insight'
    },
    insight_white_paper: {
      icon: FileText,
      label: 'White Paper',
      accent: 'accent-insight',
      bgAccent: 'bg-accent-insight/10',
      borderAccent: 'border-accent-insight/20',
      textAccent: 'text-accent-insight'
    },
    video_open_idea: {
      icon: Video,
      label: 'Video Idea',
      accent: 'accent-video',
      bgAccent: 'bg-accent-video/10',
      borderAccent: 'border-accent-video/20',
      textAccent: 'text-accent-video'
    },
    video_brainstorm: {
      icon: Video,
      label: 'Video Brainstorm',
      accent: 'accent-video',
      bgAccent: 'bg-accent-video/10',
      borderAccent: 'border-accent-video/20',
      textAccent: 'text-accent-video'
    },
    video_insight: {
      icon: Video,
      label: 'Video Insight',
      accent: 'accent-video',
      bgAccent: 'bg-accent-video/10',
      borderAccent: 'border-accent-video/20',
      textAccent: 'text-accent-video'
    }
  };
  
  return configs[type];
};

const formatMetric = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export function PostCard({ post, className, onClick }: PostCardProps) {
  const config = getPostTypeConfig(post.type);
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl",
        "backdrop-blur-[var(--glass-blur)] bg-[var(--glass-bg)]",
        "border border-[var(--glass-border)]",
        "transition-all duration-300 ease-out",
        "hover:transform hover:-translate-y-1 hover:shadow-xl",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pb-blue focus-visible:ring-offset-2",
        "cursor-pointer",
        className
      )}
      onClick={onClick}
      tabIndex={0}
      role="article"
    >
      {/* Top accent bar */}
      <div className={cn("h-1 w-full", `bg-${config.accent}`)} />
      
      <div className="p-6">
        {/* Header with type badge and author */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              config.bgAccent,
              `border ${config.borderAccent}`
            )}>
              <Icon className={cn("w-5 h-5", config.textAccent)} />
            </div>
            <div>
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs font-medium",
                  config.bgAccent,
                  config.textAccent,
                  `border-${config.accent}/20`
                )}
              >
                {config.label}
              </Badge>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {post.isPublic ? 'Public' : 'Business'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
          
          {/* Author */}
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback className="text-xs">
                {post.author.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-ink-base">
                  {post.author.name}
                </span>
                {post.author.verified && (
                  <CheckCircle className="w-3 h-3 text-pb-blue" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-ink-base mb-2 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {post.content}
          </p>
        </div>

        {/* Thumbnail */}
        {post.thumbnail && (
          <div className="mb-4 rounded-xl overflow-hidden">
            <img 
              src={post.thumbnail} 
              alt="" 
              className="w-full h-32 object-cover"
            />
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="text-xs text-muted-foreground"
              >
                #{tag}
              </Badge>
            ))}
            {post.tags.length > 3 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                +{post.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Metrics */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Scores */}
            {post.metrics.tScore && (
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-tone-t/20 border border-tone-t/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-tone-t">T</span>
                </div>
                <span className="text-sm font-medium text-tone-t">
                  {post.metrics.tScore}
                </span>
              </div>
            )}
            
            {post.metrics.uScore && (
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-tone-u/20 border border-tone-u/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-tone-u">U</span>
                </div>
                <span className="text-sm font-medium text-tone-u">
                  {post.metrics.uScore}
                </span>
              </div>
            )}

            {/* Engagement metrics */}
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span className="text-xs">{formatMetric(post.metrics.views)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span className="text-xs">{formatMetric(post.metrics.replies)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 text-muted-foreground hover:text-ink-base"
              onClick={(e) => {
                e.stopPropagation();
                // Handle share
              }}
            >
              <Share2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}