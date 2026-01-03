import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

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

export function RightSidebar({
  variant = 'default',
  onSelectPost
}: RightSidebarProps) {
  const [recentBrainstorms, setRecentBrainstorms] = useState<SidebarBrainstorm[]>([]);

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
    } catch (error) {
      console.error('Error fetching sidebar feeds:', error);
    }
  };

  if (variant === 'feed') {
    if (recentBrainstorms.length === 0) {
      return (
        <div className={cn(
          "h-full overflow-y-auto rounded-2xl p-4",
          "bg-black/30 backdrop-blur-sm",
          "border border-white/10",
          "shadow-[inset_0_0_30px_rgba(72,159,227,0.05)]"
        )}>
          <p className="text-sm text-white/50 text-center py-8">No breadcrumbs yet.</p>
        </div>
      );
    }
    
    return (
      <div className={cn(
        "h-full overflow-y-auto rounded-2xl p-4",
        "bg-black/30 backdrop-blur-sm",
        "border border-white/10",
        "shadow-[inset_0_0_30px_rgba(72,159,227,0.05)]"
      )}>
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
      </div>
    );
  }

  return null;
}

export default RightSidebar;
