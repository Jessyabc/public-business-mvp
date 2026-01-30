import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GlassSurface } from "@/components/ui/GlassSurface";
import { Share2, Bookmark, Eye, Calendar, User, Reply, TrendingUp, Sparkles } from "lucide-react";
import type { Post } from "@/types/post";
import { useComposerStore } from "@/hooks/useComposerStore";
import { LineageCard } from "@/components/brainstorm/LineageCard";
import { ContinuationsCard } from "@/components/brainstorm/ContinuationsCard";
import { CrossLinksSection } from "@/components/brainstorm/CrossLinksSection";
import { UScoreRating } from "./UScoreRating";
import { usePostRating } from "@/hooks/usePostRating";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import uScoreIcon from '@/assets/u-score-icon.png';
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserOrgId } from "@/features/orgs/hooks/useUserOrgId";

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
  const { user } = useAuth();
  const { data: selectedOrgId } = useUserOrgId();
  const { userRating, averageScore, ratingCount, submitRating } = usePostRating(post?.id ?? '');
  const [authorInfo, setAuthorInfo] = useState<AuthorInfo | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [hasGivenThought, setHasGivenThought] = useState(false);
  const [tScore, setTScore] = useState(0);
  const location = useLocation();

  // Use selectedPost if available, otherwise use the prop post
  const displayPost = selectedPost || post;
  
  // Determine if we should use neumorphic styling (business mode or business route)
  const isBusinessMode = displayPost?.mode === 'business';
  const isBusinessRoute = location.pathname.startsWith('/business-dashboard') || 
                         location.pathname.startsWith('/admin') ||
                         location.pathname.startsWith('/insights');
  const useNeumorphic = isBusinessMode || isBusinessRoute;
  
  // Check if user can rate this post (cannot rate own posts or posts from their organization)
  const canRatePost = displayPost && user && (
    displayPost.user_id !== user.id && 
    (!displayPost.org_id || displayPost.org_id !== selectedOrgId)
  );

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
      setHasGivenThought(false);
    }
  }, [isOpen]);

  // Fetch user's existing thought interaction and set initial t_score
  useEffect(() => {
    if (!displayPost?.id) return;
    
    setTScore(displayPost.t_score || 0);
    
    if (!user) {
      setHasGivenThought(false);
      return;
    }

    const checkExistingThought = async () => {
      const { data } = await supabase
        .from('post_interactions')
        .select('id')
        .eq('post_id', displayPost.id)
        .eq('user_id', user.id)
        .eq('kind', 'like')
        .maybeSingle();
      
      setHasGivenThought(!!data);
    };

    checkExistingThought();
  }, [displayPost?.id, user]);

  // Handler for T-Score "This Made Me Think" button
  const handleGiveThought = async () => {
    if (!displayPost || !user) {
      toast.error('Please sign in to give thoughts');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('interact-post', {
        body: {
          post_id: displayPost.id,
          type: 'like'
        }
      });

      if (error) {
        console.error('Error giving thought:', error);
        toast.error('Failed to record your thought');
        return;
      }

      // Toggle state based on response
      if (data?.action === 'unliked') {
        setHasGivenThought(false);
        setTScore(prev => Math.max(0, prev - 1));
        toast.success('Thought removed');
      } else {
        setHasGivenThought(true);
        setTScore(prev => prev + 1);
        toast.success('Thought given!');
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('Failed to record your thought');
    }
  };
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
      <DialogContent 
        className={`w-[calc(100%-2rem)] sm:max-w-2xl md:max-w-4xl max-w-4xl max-h-[90vh] overflow-y-auto p-0 z-50 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] ${
          useNeumorphic 
            ? 'bg-transparent backdrop-blur-none border-0 shadow-none' 
            : 'border-[var(--glass-border)] bg-transparent backdrop-blur-none'
        }`}
      >
        {useNeumorphic ? (
          <div
            className="p-6 rounded-2xl"
            style={{
              background: '#EAE6E2',
              boxShadow: '8px 8px 20px rgba(166, 150, 130, 0.3), -8px -8px 20px rgba(255, 255, 255, 0.85)',
            }}
          >
            <DialogHeader>
              <DialogTitle className="sr-only">Post Details</DialogTitle>
              <DialogDescription className="sr-only">View post details and navigate through continuations</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Lineage Card (parents) */}
              <LineageCard postId={displayPost.id} currentPost={displayPost} onSelectPost={handleSelectPost} />
              
              {/* Continuations Card (children) */}
              <ContinuationsCard postId={displayPost.id} currentPost={displayPost} onSelectPost={handleSelectPost} />

              {/* Post Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={authorAvatar} />
                    <AvatarFallback className="bg-[#4A7C9B]/20 text-[#4A7C9B]">
                      {authorName.charAt(0).toUpperCase() || <User className="h-6 w-6" />}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-[#3A3530]">{authorName}</p>
                    <div className="flex items-center space-x-2 text-sm text-[#6B635B]">
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
              <div 
                className="space-y-4 p-4 rounded-xl"
                style={{
                  boxShadow: 'inset 6px 6px 12px rgba(166, 150, 130, 0.4), inset -6px -6px 12px rgba(255, 255, 255, 0.6)',
                }}
              >
                {displayPost.title && (
                  <h2 className="text-2xl font-bold text-[#3A3530] mb-2">
                    {displayPost.title}
                  </h2>
                )}
                
                <div className="max-w-none">
                  <p className="text-[#3A3530] whitespace-pre-wrap leading-relaxed">
                    {displayPost.content}
                  </p>
                </div>
              </div>

              {/* U-Score Rating Section - Only for Business Insights */}
              {displayPost.mode === 'business' && (
                <div 
                  className="mt-4 p-4 rounded-xl"
                  style={{
                    boxShadow: 'inset 6px 6px 12px rgba(166, 150, 130, 0.4), inset -6px -6px 12px rgba(255, 255, 255, 0.6)',
                  }}
                >
                  <UScoreRating
                    postId={displayPost.id}
                    currentScore={averageScore}
                    ratingCount={ratingCount}
                    userRating={userRating}
                    onRate={submitRating}
                    disabled={!canRatePost}
                  />
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[#D4CEC5]">
                <div className="flex items-center space-x-6">
                  {/* U-Score - only for Business Insights */}
                  {displayPost.mode === 'business' && (
                    <div className="flex items-center gap-1.5 text-sm text-blue-500 font-semibold">
                      <img src={uScoreIcon} alt="U-Score" className="w-4 h-4 object-contain" />
                      <span>{averageScore?.toFixed(1) ?? '—'}</span>
                      {ratingCount > 0 && (
                        <span className="text-[#6B635B] font-normal">({ratingCount})</span>
                      )}
                    </div>
                  )}
                  {/* T-Score Button - only for Sparks (public mode) */}
                  {displayPost.mode === 'public' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleGiveThought}
                      disabled={!user}
                      className={`${hasGivenThought ? 'text-purple-500' : 'text-[#6B635B]'} hover:text-purple-500`}
                    >
                      <Sparkles className={`h-4 w-4 mr-2 ${hasGivenThought ? 'fill-current' : ''}`} />
                      {hasGivenThought ? 'Thought given' : 'This made me think'}
                      <span className="ml-2 font-semibold">({tScore})</span>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#6B635B] hover:text-[#3A3530]"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {displayPost.views_count || 0}
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#6B635B] hover:text-[#3A3530]"
                    onClick={() => openComposer({ parentPostId: displayPost.id, relationType: 'continuation' })}
                  >
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#6B635B] hover:text-[#3A3530]"
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#6B635B] hover:text-[#3A3530]"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Cross-links Section */}
              <CrossLinksSection postId={displayPost.id} onSelectPost={handleSelectPost} />
            </div>
          </div>
        ) : (
          <GlassSurface>
            <DialogHeader>
              <DialogTitle className="sr-only">Post Details</DialogTitle>
              <DialogDescription className="sr-only">View post details and navigate through continuations</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Lineage Card (parents) */}
              <LineageCard postId={displayPost.id} currentPost={displayPost} onSelectPost={handleSelectPost} />
              
              {/* Continuations Card (children) */}
              <ContinuationsCard postId={displayPost.id} currentPost={displayPost} onSelectPost={handleSelectPost} />

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
                    disabled={!canRatePost}
                  />
                </GlassSurface>
              )}

              {/* Post Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[var(--glass-border)]">
                <div className="flex items-center space-x-6">
                  {/* U-Score - only for Business Insights */}
                  {displayPost.mode === 'business' && (
                    <div className="flex items-center gap-1.5 text-sm text-blue-500 font-semibold">
                      <img src={uScoreIcon} alt="U-Score" className="w-4 h-4 object-contain" />
                      <span>{averageScore?.toFixed(1) ?? '—'}</span>
                      {ratingCount > 0 && (
                        <span className="text-muted-foreground font-normal">({ratingCount})</span>
                      )}
                    </div>
                  )}
                  {/* T-Score Button - only for Sparks (public mode) */}
                  {displayPost.mode === 'public' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleGiveThought}
                      disabled={!user}
                      className={`${hasGivenThought ? 'text-purple-500' : 'text-[var(--text-secondary)]'} hover:text-purple-500`}
                    >
                      <Sparkles className={`h-4 w-4 mr-2 ${hasGivenThought ? 'fill-current' : ''}`} />
                      {hasGivenThought ? 'Thought given' : 'This made me think'}
                      <span className="ml-2 font-semibold">({tScore})</span>
                    </Button>
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
        )}
      </DialogContent>
    </Dialog>
  );
}
