import { useCallback, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Eye, Heart, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import styles from '@/components/effects/glassSurface.module.css';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string;
  type: 'brainstorm' | 'business' | 'open_idea' | 'history';
  title?: string;
  content: string;
  author?: string;
  created_at: string;
  stats?: {
    views?: number;
    likes?: number;
    comments?: number;
  };
  emoji?: string;
  tags?: string[];
}

export function PostModal({
  isOpen,
  onClose,
  id,
  type,
  title,
  content,
  author,
  created_at,
  stats,
  emoji,
  tags
}: PostModalProps) {
  const [isTracked, setIsTracked] = useState(false);

  const trackEvent = useCallback(async () => {
    try {
      await supabase.rpc('api_track_event', {
        p_event: 'open_post',
        p_target: id,
        p_kind: type,
        p_props: {
          has_title: !!title,
          content_length: content?.length || 0,
          author: author || 'anonymous'
        }
      });
      setIsTracked(true);
    } catch (error) {
      console.warn('Failed to track modal open:', error);
    }
  }, [author, content, id, setIsTracked, title, type]);

  // Track open event when modal opens
  useEffect(() => {
    if (isOpen && !isTracked) {
      trackEvent();
    } else if (!isOpen && isTracked) {
      setIsTracked(false);
    }
  }, [isOpen, isTracked, trackEvent]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'brainstorm': return 'bg-primary/20 text-primary border-primary/30';
      case 'business': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'open_idea': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'history': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl max-h-[80vh] overflow-y-auto ${styles.glassSurface} border-white/20 backdrop-blur-xl`}>
        {/* Header */}
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              {emoji && (
                <div className="text-3xl">{emoji}</div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className={getTypeColor(type)}>
                    {type.replace('_', ' ')}
                  </Badge>
                  {stats?.views && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      {stats.views}
                    </div>
                  )}
                </div>
                {title && (
                  <h2 className="text-xl font-semibold text-foreground mb-1">{title}</h2>
                )}
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Author and Date */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs">
                  {author?.charAt(0).toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
              <span>{author || 'Anonymous'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(created_at)}
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs bg-white/10 border-white/20"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Stats */}
          {stats && (
            <div className="flex items-center gap-4 pt-4 border-t border-white/10">
              {stats.likes && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Heart className="w-4 h-4" />
                  {stats.likes}
                </div>
              )}
              {stats.comments && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MessageCircle className="w-4 h-4" />
                  {stats.comments}
                </div>
              )}
              {stats.views && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  {stats.views} views
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}