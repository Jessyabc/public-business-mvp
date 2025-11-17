import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GlassCard } from '@/ui/components/GlassCard';

interface RightSidebarProps {
  variant?: 'default' | 'feed';
}

interface SidebarBrainstorm {
  id: string;
  title: string | null;
  content: string;
  created_at: string;
}

interface SidebarIdea {
  id: string;
  content: string;
  created_at: string;
}

/**
 * Brainstorm sidebar companion:
 * - Breadcrumbs tab reflects active canvas history
 * - Open Ideas tab hosts the spark-only FeedContainer
 */
export function RightSidebar({ variant = 'default' }: RightSidebarProps) {
  const [openIdeasFeed, setOpenIdeasFeed] = useState<SidebarIdea[]>([]);
  const [recentBrainstorms, setRecentBrainstorms] = useState<SidebarBrainstorm[]>([]);
  const [activeTab, setActiveTab] = useState<'breadcrumbs' | 'openIdeas'>('breadcrumbs');

  useEffect(() => {
    if (variant === 'feed') {
      fetchFeeds();
      
      // Subscribe to realtime updates
      const channel = supabase
        .channel('sidebar-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'posts',
            filter: 'type=eq.brainstorm'
          },
          () => {
            fetchFeeds();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [variant]);

  const fetchFeeds = async () => {
    try {
      // Fetch recent brainstorms from posts table
      const { data: brainstorms } = await supabase
        .from('posts')
        .select('id, title, content, created_at')
        .eq('type', 'brainstorm')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentBrainstorms((brainstorms || []) as SidebarBrainstorm[]);

      // Fetch open ideas from open_ideas_public_view
      const { data: openIdeas } = await supabase
        .from('open_ideas_public_view')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setOpenIdeasFeed((openIdeas || []) as SidebarIdea[]);
    } catch (error) {
      console.error('Error fetching sidebar feeds:', error);
    }
  };

  if (variant === 'feed') {
    const renderBreadcrumbs = () => {
      if (recentBrainstorms.length === 0) {
        return <p className="text-sm text-white/70">No breadcrumbs yet.</p>;
      }

      return (
        <ol className="space-y-3">
          {recentBrainstorms.map((item, index) => (
            <li key={item.id} className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white/80">
                {index + 1}
              </span>
              <GlassCard
                padding="sm"
                className="flex-1 border-white/15 bg-white/5 backdrop-blur"
              >
                {item.title && (
                  <p className="text-sm font-semibold text-white/90">{item.title}</p>
                )}
                <p className="text-xs text-white/70 line-clamp-2">{item.content}</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-white/50">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </GlassCard>
            </li>
          ))}
        </ol>
      );
    };

    const renderOpenIdeas = () => {
      if (openIdeasFeed.length === 0) {
        return <p className="text-sm text-white/70">No open ideas yet.</p>;
      }

      return (
        <div className="space-y-3">
          {openIdeasFeed.map((idea) => (
            <GlassCard
              key={idea.id}
              padding="sm"
              className="border-white/15 bg-white/5 backdrop-blur"
            >
              <p className="text-sm text-white/85">{idea.content}</p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-white/50">
                {new Date(idea.created_at).toLocaleDateString()}
              </p>
            </GlassCard>
          ))}
        </div>
      );
    };

    return (
      <div className="flex h-full flex-col">
        <div className="rounded-full bg-white/5 p-1 text-xs uppercase tracking-[0.3em] text-white/60">
          <div className="grid grid-cols-2 gap-1">
            {[
              { id: 'breadcrumbs' as const, label: 'Breadcrumbs' },
              { id: 'openIdeas' as const, label: 'Open Ideas' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-3 py-1 text-xs transition ${
                  activeTab === tab.id
                    ? 'bg-white/90 text-black'
                    : 'text-white/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto rounded-3xl border border-white/10 bg-black/20 p-4">
            {activeTab === 'breadcrumbs' ? renderBreadcrumbs() : renderOpenIdeas()}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default RightSidebar;
