import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { fetchRelatedPosts, type RelatedPosts } from '@/lib/brainstormRelations';
import type { Post } from '@/types/post';

interface CrossLinkEntry {
  id: string;
  title: string;
  excerpt: string;
  relation: 'hard' | 'soft';
  created_at?: string;
  author?: string | null;
  likes_count?: number;
  views_count?: number;
}

interface CrossLinksFeedProps {
  postId: string | null;
  className?: string;
}

export function CrossLinksFeed({ postId, className }: CrossLinksFeedProps) {
  const [relatedPosts, setRelatedPosts] = useState<RelatedPosts>({
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
        const related = await fetchRelatedPosts(postId);
        setRelatedPosts(related);
      } catch (error) {
        console.error('Failed to load related posts:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadRelatedPosts();
  }, [postId]);

  // Combine all related posts into cross-links
  const crossLinks: CrossLinkEntry[] = [];

  // Add hard children (branches)
  relatedPosts.hardChildren.forEach((post: Post) => {
    crossLinks.push({
      id: post.id,
      title: post.title || 'Untitled',
      excerpt: post.content?.substring(0, 150) || '',
      relation: 'hard',
      created_at: post.created_at,
      likes_count: post.likes_count,
      views_count: post.views_count,
    });
  });

  // Add soft links (associative)
  [...relatedPosts.softChildren, ...relatedPosts.softParents].forEach((post: Post) => {
    // Avoid duplicates
    if (!crossLinks.find((link) => link.id === post.id)) {
      crossLinks.push({
        id: post.id,
        title: post.title || 'Untitled',
        excerpt: post.content?.substring(0, 150) || '',
        relation: 'soft',
        created_at: post.created_at,
        likes_count: post.likes_count,
        views_count: post.views_count,
      });
    }
  });

  return (
    <div className={`space-y-4 ${className || ''}`}>
      <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Cross-links</p>
        {loading ? (
          <div className="mt-6 flex items-center justify-center text-slate-300">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : !postId ? (
          <p className="mt-4 text-sm text-slate-300">
            Select a post to see its cross-links.
          </p>
        ) : crossLinks.length === 0 ? (
          <p className="mt-4 text-sm text-slate-300">No cross-links yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {crossLinks.map((link) => (
              <li key={link.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
                  <span>{link.relation === 'hard' ? 'Hard link' : 'Soft link'}</span>
                  {link.created_at && (
                    <span>{new Date(link.created_at).toLocaleDateString()}</span>
                  )}
                </div>
                <p className="mt-2 text-base font-semibold text-white">{link.title}</p>
                {link.excerpt && (
                  <p className="text-sm text-slate-300 line-clamp-3">{link.excerpt}</p>
                )}
                {(link.likes_count !== undefined || link.views_count !== undefined) && (
                  <div className="mt-2 flex gap-4 text-xs text-slate-400">
                    {link.likes_count !== undefined && (
                      <span>❤️ {link.likes_count}</span>
                    )}
                    {link.views_count !== undefined && (
                      <span>👁️ {link.views_count}</span>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
