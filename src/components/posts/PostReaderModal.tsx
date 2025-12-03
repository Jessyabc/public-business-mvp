import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlassSurface } from "@/components/ui/GlassSurface";
import { Share2, Bookmark, Eye, Calendar, User, Reply, TrendingUp } from "lucide-react";
import type { Post } from "@/types/post";
import { useComposerStore } from "@/hooks/useComposerStore";
import { LineageCard } from "@/components/brainstorm/LineageCard";
import { CrossLinksSection } from "@/components/brainstorm/CrossLinksSection";
import { UScoreRating } from "./UScoreRating";
import { usePostRating } from "@/hooks/usePostRating";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import uScoreIcon from '@/assets/u-score-icon.png';

interface PostReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post | null;
}

interface AuthorInfo {
  display_name: string | null;
  avatar_url: string | null;
}

export function PostReaderModal({ isOpen, onClose, post }: PostReaderModalProps) {
  const { openComposer } = useComposerStore();
  const { userRating, averageScore, ratingCount, submitRating } = usePostRating(post?.id ?? '');
  const [authorInfo, setAuthorInfo] = useState<AuthorInfo | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // Use selectedPost if available, otherwise use the prop post
  const displayPost = selectedPost || post;

  // Fetch author info when post changes
  useEffect(() => {
    if (!displayPost?.user_id) {
      setAuthorInfo(null);
      return;
    }

    const fetchAuthor = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', displayPost.user_id)
        .single();

      if (data) {
        setAuthorInfo(data);
      }
    };

    fetchAuthor();
  }, [displayPost?.user_id]);

  // Reset selected post when modal closes or main post changes
  useEffect(() => {
    if (!isOpen) {
      setSelectedPost(null);
    }
  }, [isOpen]);

  // Handler for when a cross-link or lineage card is clicked
  const handleSelectPost = (newPost: Post) => {
    setSelectedPost(newPost);
    setAuthorInfo(null); // Reset author info to trigger refetch
  };

  if (!displayPost) return null;

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${displayPost.id}`;
    await navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

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

  const authorName = authorInfo?.display_name || 'Unknown Author';
  const authorAvatar = authorInfo?.avatar_url || '';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-[var(--glass-border)] bg-transparent backdrop-blur-none p-0 z-50 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
        <GlassSurface>
          <DialogHeader>
            <DialogTitle className="sr-only">Post Details</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
          {/* Lineage Card */}
          <LineageCard postId={displayPost.id} currentPost={displayPost} onSelectPost={handleSelectPost} />

          {/* Post Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={authorAvatar} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {authorName.charAt(0).toUpperCase() || <User className="h-6 w-6" />}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-[var(--text-primary)]">{authorName}</p>
                <div className="flex items-center space-x-2 text-sm text-[var(--text-secondary)]">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(displayPost.created_at)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getTypeColor(displayPost.type)}>
                {displayPost.type}
              </Badge>
              <Badge className={getVisibilityColor(displayPost.visibility)}>
                {displayPost.visibility}
              </Badge>
            </div>
          </div>

            {/* Post Content */}
            <GlassSurface inset className="space-y-4">
              {displayPost.title && (
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                  {displayPost.title}
                </h2>
              )}
              
              <div className="prose prose-invert max-w-none">
                <p className="text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
                  {displayPost.content}
                </p>
              </div>
            </GlassSurface>

            {/* U-Score Rating Section - Only for Business Insights */}
            {displayPost.mode === 'business' && (
              <GlassSurface inset className="mt-4">
                <UScoreRating
                  postId={displayPost.id}
                  currentScore={averageScore}
                  ratingCount={ratingCount}
                  userRating={userRating}
                  onRate={submitRating}
                />
              </GlassSurface>
            )}

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[var(--glass-border)]">
              <div className="flex items-center space-x-6">
                <div className="flex items-center gap-1.5 text-sm text-blue-500 font-semibold">
                  <img src={uScoreIcon} alt="U-Score" className="w-4 h-4 object-contain" />
                  <span>{averageScore?.toFixed(1) ?? '—'}</span>
                  {ratingCount > 0 && (
                    <span className="text-muted-foreground font-normal">({ratingCount})</span>
                  )}
                </div>
                {displayPost.t_score && (
                  <div className="flex items-center gap-1 text-sm text-purple-500 font-semibold">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>T: {displayPost.t_score}</span>
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {displayPost.views_count || 0}
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  onClick={() => openComposer({ parentPostId: displayPost.id, relationType: 'continuation' })}
                >
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <Bookmark className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Cross-links Section */}
            <CrossLinksSection postId={displayPost.id} onSelectPost={handleSelectPost} />
          </div>
        </GlassSurface>
      </DialogContent>
    </Dialog>
  );
}
