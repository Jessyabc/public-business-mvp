import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getPostRelations } from '@/lib/getPostRelations';
import type { Post } from '@/types/post';
import { cn } from '@/lib/utils';

interface CrossLinkEntry {
  id: string;
  title: string;
  excerpt: string;
  relation: 'hard-child' | 'hard-parent' | 'soft-child' | 'soft-parent';
  created_at?: string;
}

interface CrossLinksFeedProps {
  postId: string | null;
  onSelectPost?: (postId: string) => void;
  className?: string;
}

// Map relation types to readable labels
const getRelationLabel = (relation: CrossLinkEntry['relation']): string => {
  switch (relation) {
    case 'hard-child':
      return 'Continuation';
    case 'hard-parent':
      return 'Came from';
    case 'soft-child':
      return 'Referenced';
    case 'soft-parent':
      return 'Referenced by';
    default:
      return 'Related';
  }
};

export function CrossLinksFeed({ postId, onSelectPost, className }: CrossLinksFeedProps) {
  const [relatedPosts, setRelatedPosts] = useState<{
    hardChildren: Post[];
    hardParents: Post[];
    softChildren: Post[];
    softParents: Post[];
  }>({
    hardChildren: [],
    hardParents: [],
    softChildren: [],
    softParents: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!postId) {
      setRelatedPosts({
        hardChildren: [],
        hardParents: [],
        softChildren: [],
        softParents: [],
      });
      return;
    }

    const loadRelatedPosts = async () => {
      setLoading(true);
      try {
        const relationsResult = await getPostRelations(postId);
        setRelatedPosts({
          hardChildren: relationsResult.hardChildren,
          hardParents: relationsResult.parentHard,
          softChildren: relationsResult.softChildren,
          softParents: relationsResult.parentSoft,
        });
      } catch (error) {
        console.error('Failed to load related posts:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadRelatedPosts();
  }, [postId]);

  // Combine all related posts into cross-links with proper relation types
  const crossLinks: CrossLinkEntry[] = [];

  // Add hard children (continuations)
  relatedPosts.hardChildren.forEach((post: Post) => {
    crossLinks.push({
      id: post.id,
      title: post.title || 'Untitled',
      excerpt: (post.content || post.body || '').substring(0, 150),
      relation: 'hard-child',
      created_at: post.created_at,
    });
  });

  // Add hard parents (came from)
  relatedPosts.hardParents.forEach((post: Post) => {
    crossLinks.push({
      id: post.id,
      title: post.title || 'Untitled',
      excerpt: (post.content || post.body || '').substring(0, 150),
      relation: 'hard-parent',
      created_at: post.created_at,
    });
  });

  // Add soft children (referenced)
  relatedPosts.softChildren.forEach((post: Post) => {
    // Avoid duplicates
    if (!crossLinks.find((link) => link.id === post.id)) {
      crossLinks.push({
        id: post.id,
        title: post.title || 'Untitled',
        excerpt: (post.content || post.body || '').substring(0, 150),
        relation: 'soft-child',
        created_at: post.created_at,
      });
    }
  });

  // Add soft parents (referenced by)
  relatedPosts.softParents.forEach((post: Post) => {
    // Avoid duplicates
    if (!crossLinks.find((link) => link.id === post.id)) {
      crossLinks.push({
        id: post.id,
        title: post.title || 'Untitled',
        excerpt: (post.content || post.body || '').substring(0, 150),
        relation: 'soft-parent',
        created_at: post.created_at,
      });
    }
  });

  const handleLinkClick = (linkId: string) => {
    if (onSelectPost) {
      onSelectPost(linkId);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">Cross-links</p>
        {loading ? (
          <div className="mt-6 flex items-center justify-center text-white/70">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : !postId ? (
          <p className="mt-4 text-sm text-white/50">
            Select a post to see its cross-links.
          </p>
        ) : crossLinks.length === 0 ? (
          <p className="mt-4 text-sm text-white/50">No cross-links yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {crossLinks.map((link) => (
              <li
                key={link.id}
                onClick={() => handleLinkClick(link.id)}
                className={cn(
                  "rounded-2xl px-4 py-3",
                  "bg-white/4 hover:bg-white/7",
                  "backdrop-blur-xl",
                  "border border-white/12",
                  "shadow-[0_12px_40px_rgba(0,0,0,0.45)]",
                  "cursor-pointer",
                  "transition-all duration-200",
                  "hover:scale-[1.01]"
                )}
              >
                {/* Top row: badge + timestamp */}
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "text-[10px] font-medium px-2 py-0.5 rounded-full",
                    "bg-white/10 border border-white/15",
                    "text-white/80"
                  )}>
                    {getRelationLabel(link.relation)}
                  </span>
                  {link.created_at && (
                    <span className="text-[10px] text-white/50">
                      {new Date(link.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </div>
                
                {/* Title */}
                <p className="text-sm font-semibold text-white mb-1 line-clamp-1">
                  {link.title}
                </p>
                
                {/* Excerpt */}
                {link.excerpt && (
                  <p className="text-xs text-white/70 line-clamp-2">
                    {link.excerpt}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
