import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, Bookmark, Eye, Calendar, User, Reply } from "lucide-react";
import { useAppMode } from "@/contexts/AppModeContext";
import { Post } from "@/hooks/usePosts";
import { useComposerStore } from "@/hooks/useComposerStore";

interface PostReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
}

export function PostReaderModal({ isOpen, onClose, post }: PostReaderModalProps) {
  const { mode } = useAppMode();
  const { openComposer } = useComposerStore();

  if (!post) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'brainstorm': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'insight': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'report': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'whitepaper': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'webinar': return 'bg-red-500/10 text-red-600 border-red-500/20';
      case 'video': return 'bg-pink-500/10 text-pink-600 border-pink-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'my_business': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'other_businesses': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'draft': return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-4xl max-h-[90vh] overflow-y-auto backdrop-blur-xl border ${
        mode === 'public' 
          ? 'bg-black/20 border-white/20' 
          : 'glass-business border-slate-500/30'
      }`}>
        <DialogHeader>
          <DialogTitle className="sr-only">Post Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Post Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/20 text-primary">
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{post.user_id}</p>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(post.created_at)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getTypeColor(post.type)}>
                {post.type}
              </Badge>
              <Badge className={getVisibilityColor(post.visibility)}>
                {post.visibility}
              </Badge>
            </div>
          </div>

          {/* Post Content */}
          <Card className={`${
            mode === 'public' 
              ? 'glass-ios-card border-white/20' 
              : 'glass-business-card border-slate-500/30'
          }`}>
            <CardHeader>
              {post.title && (
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {post.title}
                </h2>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-invert max-w-none">
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>
              </div>

              {/* Post Metadata */}
              {post.metadata && Object.keys(post.metadata).length > 0 && (
                <div className="mt-6 p-4 rounded-lg bg-black/20 border border-white/10">
                  <h4 className="text-sm font-medium text-foreground mb-2">Additional Information</h4>
                  <pre className="text-xs text-muted-foreground overflow-x-auto">
                    {JSON.stringify(post.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Heart className="h-4 w-4 mr-2" />
                {post.likes_count || 0}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {post.comments_count || 0}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Eye className="h-4 w-4 mr-2" />
                {post.views_count || 0}
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => openComposer({ parentPostId: post.id, relationType: 'continuation' })}
              >
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}