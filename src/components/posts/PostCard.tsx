import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, FileText, Eye, MessageCircle, Heart, Share2, MoreHorizontal } from 'lucide-react';
import { useAppMode } from '@/contexts/AppModeContext';
import { Post } from '@/hooks/usePosts';
import { PostReaderModal } from './PostReaderModal';

interface PostCardProps {
  post: Post;
  onEdit?: (post: Post) => void;
  onDelete?: (post: Post) => void;
}

export function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  const { mode } = useAppMode();
  const [showReader, setShowReader] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'brainstorm':
        return <Brain className="w-4 h-4 text-primary" />;
      default:
        return <FileText className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'brainstorm':
        return <Badge className="bg-primary/20 text-primary border-primary/20">Brainstorm</Badge>;
      case 'insight':
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/20">Insight</Badge>;
      case 'report':
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/20">Report</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-600 border-gray-500/20">{type}</Badge>;
    }
  };

  const cardClass = mode === 'public' 
    ? 'glass-ios-card hover:glass-ios-widget transition-all duration-300' 
    : 'glass-business-card hover:glass-business transition-all duration-300';

  return (
    <Card className={cardClass}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getTypeIcon(post.type)}
            <div>
              {post.title && (
                <CardTitle className={`text-lg ${
                  mode === 'public' ? 'text-white' : 'text-slate-800'
                }`}>
                  {post.title}
                </CardTitle>
              )}
              <div className="flex items-center gap-2 mt-1">
                {getTypeBadge(post.type)}
                <Badge className={`text-xs ${
                  post.mode === 'public' 
                    ? 'bg-primary/20 text-primary border-primary/20'
                    : 'bg-blue-500/20 text-blue-600 border-blue-500/20'
                }`}>
                  {post.mode === 'public' ? 'Public' : 'Business'}
                </Badge>
                <span className={`text-xs ${
                  mode === 'public' ? 'text-white/60' : 'text-slate-500'
                }`}>
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
          
          {(post.t_score || post.u_score) && (
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                mode === 'public' 
                  ? 'text-primary border-primary/30 bg-primary/20'
                  : 'text-blue-600 border-blue-500/30 bg-blue-500/20'
              }`}>
                <span className="text-sm font-bold">{post.t_score || post.u_score}</span>
              </div>
              <span className="text-xs text-muted-foreground mt-1">
                {post.t_score ? 'T-Score' : 'U-Score'}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div 
          className={`text-sm mb-4 line-clamp-3 cursor-pointer ${
            mode === 'public' ? 'text-white/80' : 'text-slate-600'
          }`}
          onClick={() => setShowReader(true)}
        >
          {post.content}
        </div>

        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-4 text-xs ${
            mode === 'public' ? 'text-white/60' : 'text-slate-500'
          }`}>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {post.views_count}
            </div>
            <div className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {post.likes_count}
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {post.comments_count}
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`text-xs p-1 h-8 w-8 ${
                mode === 'public'
                  ? 'text-white/60 hover:text-white hover:bg-white/10' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
              }`}
            >
              <Share2 className="w-3 h-3" />
            </Button>
            
            {(onEdit || onDelete) && (
              <Button 
                variant="ghost" 
                size="sm" 
                className={`text-xs p-1 h-8 w-8 ${
                  mode === 'public'
                    ? 'text-white/60 hover:text-white hover:bg-white/10' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50'
                }`}
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      <PostReaderModal 
        isOpen={showReader}
        onClose={() => setShowReader(false)}
        post={post}
      />
    </Card>
  );
}