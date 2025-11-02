import { Clock, Lightbulb } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white/90 mb-3">Recent Activity</h3>
          <div className="space-y-2">
            {recentBrainstorms.length > 0 ? (
              recentBrainstorms.map((item) => (
                <div 
                  key={item.id} 
                  className="rounded-lg bg-white/5 p-3 text-sm hover:bg-white/10 transition cursor-pointer"
                >
                  {item.title && (
                    <p className="font-semibold text-white/90 mb-1">{item.title}</p>
                  )}
                  <p className="text-white/70 line-clamp-2">{item.content}</p>
                  <p className="text-xs text-white/50 mt-1">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-lg bg-white/5 p-3 text-sm text-white/50">
                No recent activity yet.
              </div>
            )}
          </div>
        </div>

        {/* Open Ideas Section */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-4">
          <h3 className="text-lg font-semibold text-white/90 mb-3">Open Ideas</h3>
          <div className="space-y-3">
            {openIdeasFeed.length > 0 ? (
              openIdeasFeed.map((idea) => (
                <div 
                  key={idea.id} 
                  className="rounded-xl bg-white/5 border border-white/10 p-3 hover:bg-white/10 transition cursor-pointer"
                >
                  <p className="text-sm text-white/80">{idea.content}</p>
                  <p className="text-xs text-white/50 mt-1">
                    {new Date(idea.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-xl bg-white/5 p-3 text-sm text-white/50">
                No open ideas yet.
              </div>
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
        <div className="p-4 border-b border-white/10 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary/60" />
          <h2 className="text-lg font-semibold text-white/90">History</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarGutter: 'stable' }}>
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
          <div className="rounded-xl bg-white/10 p-3 text-sm text-white/70 hover:bg-white/15 transition-colors cursor-pointer">
            No recent brainstorms yet.
          </div>
        </div>
      </div>

      {/* Open Ideas Section */}
      <div className="flex-1 flex flex-col border-t border-white/10">
        <div className="p-4 border-b border-white/10 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary/60" />
          <h2 className="text-lg font-semibold text-white/90">Open Ideas</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
          <div className="rounded-xl bg-white/10 p-3 text-sm text-white/70 hover:bg-white/15 transition-colors cursor-pointer">
            No open ideas yet.
          </div>
        </div>
      </div>
    </div>
  );
}

export default RightSidebar;
