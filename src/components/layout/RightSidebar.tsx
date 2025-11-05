import { Clock, Lightbulb } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { GlassCard } from '@/ui/components/GlassCard';

interface RightSidebarProps {
  variant?: 'default' | 'feed';
}

/**
 * RightSidebar - Activity feed for brainstorm page
 * 
 * Displays:
 * - History: Recent brainstorm activity
 * - Open Ideas: Public idea submissions
 * 
 * Designed to fit within the glass-styled layout
 */
export function RightSidebar({ variant = 'default' }: RightSidebarProps) {
  const [openIdeasFeed, setOpenIdeasFeed] = useState<any[]>([]);
  const [recentBrainstorms, setRecentBrainstorms] = useState<any[]>([]);

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
            table: 'brainstorms'
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
      // Fetch recent brainstorms from brainstorms table
      const { data: brainstorms } = await supabase
        .from('brainstorms' as any)
        .select('id, title, content, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentBrainstorms((brainstorms || []) as any);

      // Fetch open ideas from open_ideas_public_view
      const { data: openIdeas } = await supabase
        .from('open_ideas_public_view')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setOpenIdeasFeed(openIdeas || []);
    } catch (error) {
      console.error('Error fetching sidebar feeds:', error);
    }
  };

  if (variant === 'feed') {
    return (
      <div className="h-full w-full flex flex-col">
        {/* Recent Brainstorms Section */}
        <div className="p-5 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white/90 mb-4">Recent Activity</h3>
          <div className="space-y-2.5">
            {recentBrainstorms.length > 0 ? (
              recentBrainstorms.map((item) => (
                <GlassCard
                  key={item.id}
                  interactive
                  padding="sm"
                  className="backdrop-blur-md border-white/15 shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {item.title && (
                    <p className="font-semibold text-white/95 mb-1.5 text-sm">{item.title}</p>
                  )}
                  <p className="text-white/75 line-clamp-2 text-xs leading-relaxed mb-2">{item.content}</p>
                  <p className="text-[11px] text-white/60">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </GlassCard>
              ))
            ) : (
              <GlassCard padding="sm" className="backdrop-blur-md border-white/15">
                <p className="text-sm text-white/60">No recent activity yet.</p>
              </GlassCard>
            )}
          </div>
        </div>

        {/* Open Ideas Section */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5">
          <h3 className="text-lg font-semibold text-white/90 mb-4">Open Ideas</h3>
          <div className="space-y-2.5">
            {openIdeasFeed.length > 0 ? (
              openIdeasFeed.map((idea) => (
                <GlassCard
                  key={idea.id}
                  interactive
                  padding="sm"
                  className="backdrop-blur-md border-white/15 shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <p className="text-sm text-white/85 leading-relaxed mb-2">{idea.content}</p>
                  <p className="text-[11px] text-white/60">
                    {new Date(idea.created_at).toLocaleDateString()}
                  </p>
                </GlassCard>
              ))
            ) : (
              <GlassCard padding="sm" className="backdrop-blur-md border-white/15">
                <p className="text-sm text-white/60">No open ideas yet.</p>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* History Section */}
      <div className="flex-1 flex flex-col">
        <div className="p-5 border-b border-white/10 flex items-center gap-2">
          <Clock className="w-5 h-5 text-white/70" />
          <h2 className="text-lg font-semibold text-white/90">History</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5" style={{ scrollbarGutter: 'stable' }}>
          <style>{`
            .no-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .no-scrollbar::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.05);
              border-radius: 3px;
            }
            .no-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.2);
              border-radius: 3px;
            }
            .no-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.3);
            }
          `}</style>
          <GlassCard 
            interactive 
            padding="sm" 
            className="backdrop-blur-md border-white/15 shadow-lg hover:shadow-xl transition-all hover:scale-[1.01]"
          >
            <p className="text-sm text-white/75">No recent brainstorms yet.</p>
          </GlassCard>
        </div>
      </div>

      {/* Open Ideas Section */}
      <div className="flex-1 flex flex-col border-t border-white/10">
        <div className="p-5 border-b border-white/10 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-white/70" />
          <h2 className="text-lg font-semibold text-white/90">Open Ideas</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-2.5">
          <GlassCard 
            interactive 
            padding="sm" 
            className="backdrop-blur-md border-white/15 shadow-lg hover:shadow-xl transition-all hover:scale-[1.01]"
          >
            <p className="text-sm text-white/75">No open ideas yet.</p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default RightSidebar;
