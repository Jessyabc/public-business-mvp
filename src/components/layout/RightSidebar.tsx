import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface RightSidebarProps {
  variant?: 'default' | 'feed';
  onSelectPost?: (postId: string) => void;
}

interface SidebarBrainstorm {
  id: string;
  title: string | null;
  content: string;
  created_at: string;
}

interface OpenIdeaIntake {
  id: string;
  text: string;
  created_at: string;
  status: string;
}

export function RightSidebar({
  variant = 'default',
  onSelectPost
}: RightSidebarProps) {
  const [openIdeas, setOpenIdeas] = useState<OpenIdeaIntake[]>([]);
  const [recentBrainstorms, setRecentBrainstorms] = useState<SidebarBrainstorm[]>([]);
  const [activeTab, setActiveTab] = useState<'breadcrumbs' | 'openIdeas'>('breadcrumbs');

  useEffect(() => {
    if (variant === 'feed') {
      fetchFeeds();

      const channel = supabase.channel('sidebar-changes').on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'posts',
        filter: 'type=eq.brainstorm&mode=eq.public&visibility=eq.public'
      }, () => {
        fetchFeeds();
      }).subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [variant]);

  const fetchFeeds = async () => {
    try {
      const { data: brainstorms } = await supabase
        .from('posts')
        .select('id, title, content, created_at')
        .eq('type', 'brainstorm')
        .eq('kind', 'Spark')
        .eq('mode', 'public')
        .eq('visibility', 'public')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5);
      
      setRecentBrainstorms((brainstorms || []) as SidebarBrainstorm[]);

      const { data: ideas } = await supabase
        .from('open_ideas_intake')
        .select('id, text, created_at, status')
        .order('created_at', { ascending: false })
        .limit(5);
      
      setOpenIdeas((ideas || []) as OpenIdeaIntake[]);
    } catch (error) {
      console.error('Error fetching sidebar feeds:', error);
    }
  };

  if (variant === 'feed') {
    const renderBreadcrumbs = () => {
      if (recentBrainstorms.length === 0) {
        return (
          <p className="text-sm text-white/50 text-center py-8">No breadcrumbs yet.</p>
        );
      }
      
      return (
        <ol className="space-y-3">
          {recentBrainstorms.map((item, index) => (
            <li key={item.id} className="flex items-start gap-3 text-left group">
              {/* Numbered indicator with glow */}
              <span className={cn(
                "mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full",
                "bg-gradient-to-br from-white/20 to-white/5",
                "border border-white/20",
                "font-semibold text-white/80 text-center text-xs",
                "shadow-[0_0_10px_rgba(72,159,227,0.2)]",
                "group-hover:shadow-[0_0_15px_rgba(72,159,227,0.4)]",
                "transition-all duration-300"
              )}>
                {index + 1}
              </span>
              
              <button
                onClick={() => onSelectPost?.(item.id)}
                className="flex-1 text-left group/card"
              >
                <div className={cn(
                  "p-3 rounded-xl",
                  "bg-white/5 backdrop-blur-sm",
                  "border border-white/10",
                  "hover:bg-white/10 hover:border-white/20",
                  "hover:shadow-[0_0_20px_rgba(72,159,227,0.15)]",
                  "transition-all duration-300 cursor-pointer"
                )}>
                  {item.title && (
                    <p className="text-sm font-semibold text-white/90 mb-1 line-clamp-1">
                      {item.title}
                    </p>
                  )}
                  <p className="text-xs text-white/60 line-clamp-2">{item.content}</p>
                  <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/40">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ol>
      );
    };

    const renderOpenIdeas = () => {
      if (openIdeas.length === 0) {
        return (
          <p className="text-sm text-white/50 text-center py-8">No open ideas yet.</p>
        );
      }
      
      return (
        <div className="space-y-3">
          {openIdeas.map(idea => (
            <div 
              key={idea.id} 
              className={cn(
                "p-3 rounded-xl",
                "bg-white/5 backdrop-blur-sm",
                "border border-white/10",
                "hover:bg-white/10 hover:border-white/20",
                "transition-all duration-300"
              )}
            >
              <p className="text-sm text-white/80">{idea.text}</p>
              <div className="flex justify-between items-center mt-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                  {new Date(idea.created_at).toLocaleDateString()}
                </p>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  idea.status === 'active' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-white/10 text-white/50 border border-white/20'
                )}>
                  {idea.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    };

    return (
      <div className="flex h-full flex-col">
        {/* Tab switcher */}
        <div className="relative rounded-full bg-white/5 backdrop-blur-sm p-1 border border-white/10">
          <div className="grid grid-cols-2 gap-1">
            {[
              { id: 'breadcrumbs' as const, label: 'Breadcrumbs' },
              { id: 'openIdeas' as const, label: 'Open Ideas' }
            ].map(tab => (
              <button 
                key={tab.id} 
                type="button" 
                onClick={() => setActiveTab(tab.id)} 
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200",
                  activeTab === tab.id 
                    ? 'bg-white/15 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]' 
                    : 'text-white/50 hover:text-white/70'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content area with inner glow */}
        <div className="mt-4 flex-1 overflow-hidden">
          <div className={cn(
            "h-full overflow-y-auto rounded-2xl p-4",
            "bg-black/30 backdrop-blur-sm",
            "border border-white/10",
            "shadow-[inset_0_0_30px_rgba(72,159,227,0.05)]"
          )}>
            {activeTab === 'breadcrumbs' ? renderBreadcrumbs() : renderOpenIdeas()}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default RightSidebar;
