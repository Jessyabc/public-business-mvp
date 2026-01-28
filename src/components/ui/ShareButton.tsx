import { useState } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { usePostInteractions } from '@/hooks/usePostInteractions';

interface ShareButtonProps {
  postId: string;
  postTitle?: string;
  postContent?: string;
  shareCount?: number;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showCount?: boolean;
}

export function ShareButton({ 
  postId, 
  postTitle,
  postContent,
  shareCount = 0,
  variant = 'ghost',
  size = 'icon',
  showCount = false
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const { interactWithPost } = usePostInteractions();

  const handleShare = async () => {
    const url = `${window.location.origin}/brainstorm/feed?post=${postId}`;
    const text = postTitle || postContent?.slice(0, 100) || 'Check out this post';

    // Try native share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: postTitle,
          text: text,
          url: url,
        });
        
        // Record the share interaction
        await interactWithPost(postId, 'share');
        return;
      } catch (err) {
        // User cancelled or share failed, fall through to copy
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }

    // Fallback to copy link
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      
      // Record the share interaction
      await interactWithPost(postId, 'share');
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        onClick={handleShare}
        variant={variant}
        size={size}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        {copied ? (
          <Check className="w-4 h-4 text-success" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
      </Button>
      {showCount && shareCount > 0 && (
        <span className="text-xs text-muted-foreground">
          {shareCount}
        </span>
      )}
    </div>
  );
}
