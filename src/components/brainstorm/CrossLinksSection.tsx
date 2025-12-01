/**
 * CrossLinksSection component
 * 
 * Displays cross-links (soft relations) for a post.
 * Shows posts that reference or are referenced by the current post.
 */

import { useEffect, useState } from 'react';
import { useCrossLinks } from '@/hooks/useCrossLinks';
import { supabase } from '@/integrations/supabase/client';
import type { CrossLink } from '@/hooks/useCrossLinks';
import { Link2, ArrowRight, ArrowLeft, Lightbulb, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface CrossLinksSectionProps {
  postId: string;
}

export function CrossLinksSection({ postId }: CrossLinksSectionProps) {
  const { data: crossLinks, isLoading } = useCrossLinks(postId);
  const [authorNames, setAuthorNames] = useState<Map<string, string>>(new Map());

  // Fetch author names
  useEffect(() => {
    if (!crossLinks || crossLinks.length === 0) return;

    const fetchAuthors = async () => {
      const userIds = Array.from(new Set(crossLinks.map((cl) => cl.post.user_id)));
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds);

      if (profiles) {
        const names = new Map<string, string>();
        profiles.forEach((profile) => {
          names.set(profile.id, profile.display_name || 'Unknown');
        });
        setAuthorNames(names);
      }
    };

    fetchAuthors();
  }, [crossLinks]);

  if (isLoading) {
    return null;
  }

  if (!crossLinks || crossLinks.length === 0) {
    return null;
  }

  // Group by direction
  const incoming = crossLinks.filter((cl) => cl.direction === 'incoming');
  const outgoing = crossLinks.filter((cl) => cl.direction === 'outgoing');

  const renderCrossLinkCard = (crossLink: CrossLink) => {
    const { post, direction, relationType } = crossLink;
    const isSpark = post.kind === 'Spark';
    const isInsight = post.kind === 'BusinessInsight';

    return (
      <div
        key={crossLink.id}
        className={cn(
          'rounded-xl p-4',
          'bg-white/5 backdrop-blur-xl border border-white/10',
          'transition-all duration-200 hover:bg-white/8 hover:border-white/20',
          'group cursor-pointer'
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Icon */}
            <div className={cn(
              'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
              isSpark && 'bg-primary/20',
              isInsight && 'bg-purple-500/20'
            )}>
              {isSpark && <Lightbulb className="w-4 h-4 text-primary" />}
              {isInsight && <Building2 className="w-4 h-4 text-purple-400" />}
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">
                {post.title || post.content.slice(0, 50)}
              </h4>
              <div className="text-xs text-white/60">
                by {authorNames.get(post.user_id) || 'Unknown'}
              </div>
            </div>
          </div>

          {/* Direction indicator */}
          <div className="flex-shrink-0">
            {direction === 'incoming' ? (
              <ArrowLeft className="w-4 h-4 text-white/40" />
            ) : (
              <ArrowRight className="w-4 h-4 text-white/40" />
            )}
          </div>
        </div>

        {/* Content snippet */}
        <p className="text-xs text-white/70 line-clamp-2 mb-3">
          {post.content}
        </p>

        {/* Footer badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant="outline"
            className={cn(
              'text-[10px] border-white/20',
              isSpark && 'bg-primary/10 text-primary',
              isInsight && 'bg-purple-500/10 text-purple-400'
            )}
          >
            {post.kind}
          </Badge>

          <Badge
            variant="outline"
            className="text-[10px] bg-white/5 border-white/20 text-white/60"
          >
            {relationType === 'cross_link' || relationType === 'soft' ? 'Reference' : relationType}
          </Badge>

          {direction === 'incoming' && (
            <Badge
              variant="outline"
              className="text-[10px] bg-white/5 border-white/20 text-white/60"
            >
              Referenced by
            </Badge>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-8 pt-6 border-t border-white/10">
      <div className="flex items-center gap-2 mb-4">
        <Link2 className="w-5 h-5 text-white/80" />
        <h3 className="text-lg font-semibold text-white">Cross-Links & References</h3>
        <div className="text-sm text-white/60">
          ({crossLinks.length})
        </div>
      </div>

      {/* Incoming references */}
      {incoming.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-white/80 mb-3">
            Referenced By ({incoming.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {incoming.map(renderCrossLinkCard)}
          </div>
        </div>
      )}

      {/* Outgoing references */}
      {outgoing.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-white/80 mb-3">
            References ({outgoing.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {outgoing.map(renderCrossLinkCard)}
          </div>
        </div>
      )}
    </div>
  );
}
