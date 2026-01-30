import { SparkCard } from './SparkCard';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChevronRight, Home } from 'lucide-react';
import { GlassSurface } from '@/components/ui/GlassSurface';

export type Spark = {
  id: string;
  title?: string | null;
  body: string;
  created_at: string;
  author_display_name?: string | null;
  author_avatar_url?: string | null;
  is_anonymous: boolean;
  t_score: number;       // number of Thought reactions (for public sparks)
  u_score?: number | null; // U-score for business insights
  kind?: string;         // Post kind: 'Spark' or 'BusinessInsight'
  mode?: string;         // Post mode: 'public' or 'business'
  view_count: number;    // total views
  has_given_thought?: boolean; // optional: whether current user already reacted
};

export type PostSummary = {
  id: string;
  title?: string | null;
  excerpt: string;
  created_at: string;
};

export type BrainstormLayoutProps = {
  lastSeenSparks: Spark[];
  currentSpark: Spark | null;
  referencedPosts: PostSummary[];
  onSelectSpark?: (sparkId: string) => void;

  // new optional callbacks for the current Spark
  onGiveThought?: (sparkId: string, alreadyGiven: boolean) => Promise<void> | void;
  onContinueBrainstorm?: (sparkId: string) => void;
  onSaveReference?: (sparkId: string) => void;
  onViewSpark?: (sparkId: string) => Promise<void> | void;
};

interface BreadcrumbItem {
  id: string;
  title: string | null;
  excerpt: string;
}

export const BrainstormLayout = ({
  lastSeenSparks,
  currentSpark,
  referencedPosts,
  onSelectSpark,
  onGiveThought,
  onContinueBrainstorm,
  onSaveReference,
  onViewSpark,
}: BrainstormLayoutProps) => {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  // Build breadcrumb chain from current post to root
  const { data: breadcrumbChain } = useQuery<BreadcrumbItem[]>({
    queryKey: ['breadcrumbs', currentSpark?.id],
    queryFn: async () => {
      if (!currentSpark?.id) return [];
      
      const chain: BreadcrumbItem[] = [];
      let currentPostId = currentSpark.id;
      const visited = new Set<string>();
      
      // Build chain backwards to root
      while (currentPostId && !visited.has(currentPostId)) {
        visited.add(currentPostId);
        
        // Get current post details
        const { data: post } = await supabase
          .from('posts')
          .select('id, title, content')
          .eq('id', currentPostId)
          .single();
        
        if (!post) break;
        
        chain.unshift({
          id: post.id,
          title: post.title,
          excerpt: post.content?.slice(0, 60) || '',
        });
        
        // Find parent via continuation relations ('origin' or 'reply' - both represent continuations)
        const { data: parentRelation } = await supabase
          .from('post_relations')
          .select('parent_post_id')
          .eq('child_post_id', currentPostId)
          .in('relation_type', ['origin', 'reply'])
          .maybeSingle();
        
        if (parentRelation?.parent_post_id) {
          currentPostId = parentRelation.parent_post_id;
        } else {
          break; // Reached root
        }
      }
      
      return chain;
    },
    enabled: !!currentSpark?.id,
  });

  useEffect(() => {
    if (breadcrumbChain) {
      setBreadcrumbs(breadcrumbChain);
    }
  }, [breadcrumbChain]);

  const handleSelectSpark = (sparkId: string) => {
    onSelectSpark?.(sparkId);
  };

  const renderSparkPreview = (spark: Spark) => {
    if (spark.title && spark.title.trim().length > 0) {
      return spark.title;
    }
    if (spark.body.length <= 80) {
      return spark.body;
    }
    return `${spark.body.slice(0, 77)}...`;
  };

  return (
    <div className="pb-brainstorm-layout">
      <div className="pb-brainstorm-layout__column pb-brainstorm-layout__last-seen">
        <h3 className="pb-brainstorm-layout__column-heading">Last seen</h3>
        <ul className="pb-brainstorm-layout__list">
          {lastSeenSparks.map((spark) => (
            <li key={spark.id}>
              <button
                type="button"
                className="pb-brainstorm-layout__list-item"
                onClick={() => handleSelectSpark(spark.id)}
              >
                {renderSparkPreview(spark)}
              </button>
            </li>
          ))}
          {lastSeenSparks.length === 0 && (
            <li className="pb-brainstorm-layout__empty">No recent sparks</li>
          )}
        </ul>
      </div>

      <div className="pb-brainstorm-layout__column pb-brainstorm-layout__current">
        {currentSpark ? (
          <SparkCard
            spark={currentSpark}
            onGiveThought={onGiveThought}
            onContinueBrainstorm={onContinueBrainstorm}
            onSaveReference={onSaveReference}
            onView={onViewSpark}
          />
        ) : (
          <div className="pb-brainstorm-layout__current-empty">
            Select a Spark to open the brainstorm.
          </div>
        )}
      </div>

      <div className="pb-brainstorm-layout__column pb-brainstorm-layout__referenced-in">
        <h3 className="pb-brainstorm-layout__column-heading">Referenced in</h3>
        <div className="pb-brainstorm-layout__referenced-list">
          {referencedPosts.map((post) => (
            <button
              key={post.id}
              type="button"
              className="pb-brainstorm-layout__referenced-item"
              onClick={() => handleSelectSpark(post.id)}
            >
              <div className="pb-brainstorm-layout__referenced-title">
                {post.title || 'Untitled post'}
              </div>
              <p className="pb-brainstorm-layout__referenced-excerpt">{post.excerpt}</p>
            </button>
          ))}
          {referencedPosts.length === 0 && (
            <div className="pb-brainstorm-layout__empty">No references yet</div>
          )}
        </div>
      </div>

      <div className="pb-brainstorm-layout__column pb-brainstorm-layout__sidebar">
        <div className="pb-brainstorm-sidebar__content">
          {currentSpark && breadcrumbs.length > 0 ? (
            <GlassSurface className="p-4">
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Home className="h-4 w-4" />
                Lineage
              </h3>
              <nav className="space-y-1" aria-label="Breadcrumb">
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.id} className="flex items-center gap-1.5">
                    {index > 0 && (
                      <ChevronRight className="h-3 w-3 text-[var(--text-muted)] flex-shrink-0" />
                    )}
                    <button
                      type="button"
                      onClick={() => handleSelectSpark(crumb.id)}
                      className={`
                        text-left text-xs truncate transition-colors
                        ${index === breadcrumbs.length - 1
                          ? 'text-[var(--text-primary)] font-medium'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }
                      `}
                      title={crumb.title || crumb.excerpt}
                    >
                      {crumb.title || crumb.excerpt || 'Untitled'}
                    </button>
                  </div>
                ))}
              </nav>
            </GlassSurface>
          ) : currentSpark ? (
            <GlassSurface className="p-4">
              <p className="text-xs text-[var(--text-muted)]">No lineage available</p>
            </GlassSurface>
          ) : (
            <GlassSurface className="p-4">
              <p className="text-xs text-[var(--text-muted)]">Select a post to see lineage</p>
            </GlassSurface>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrainstormLayout;
