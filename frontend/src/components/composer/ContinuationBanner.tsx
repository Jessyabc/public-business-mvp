import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, X, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePendingReferencesStore } from '@/stores/pendingReferencesStore';

interface ContinuationBannerProps {
  parentPostId?: string;
  onClear?: () => void;
}

interface ParentPost {
  id: string;
  title: string | null;
  content: string;
}

export function ContinuationBanner({ 
  parentPostId, 
  onClear 
}: ContinuationBannerProps) {
  const [parentPost, setParentPost] = useState<ParentPost | null>(null);
  const { pendingRefs, clearRefs, removeRef } = usePendingReferencesStore();
  const [refTitles, setRefTitles] = useState<Record<string, string>>({});

  // Fetch parent post if continuing
  useEffect(() => {
    if (!parentPostId) {
      setParentPost(null);
      return;
    }

    const fetchParent = async () => {
      const { data } = await supabase
        .from('posts')
        .select('id, title, content')
        .eq('id', parentPostId)
        .single();
      
      if (data) {
        setParentPost(data);
      }
    };

    fetchParent();
  }, [parentPostId]);


  // Fetch titles for pending references
  useEffect(() => {
    if (pendingRefs.length === 0) {
      setRefTitles({});
      return;
    }

    const fetchTitles = async () => {
      const { data } = await supabase
        .from('posts')
        .select('id, title, content')
        .in('id', pendingRefs);

      if (data) {
        const titles: Record<string, string> = {};
        data.forEach(post => {
          titles[post.id] = post.title || (post.content ? post.content.slice(0, 30) + '...' : 'Untitled');
        });
        setRefTitles(titles);
      }
    };

    fetchTitles();
  }, [pendingRefs]);

  const hasContext = parentPostId || pendingRefs.length > 0;
  
  if (!hasContext) return null;

  return (
    <div className="space-y-2 mb-4">
      {/* Continuation banner */}
      {parentPost && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-[hsl(var(--accent)/0.1)] border border-[hsl(var(--accent)/0.3)]">
          <Sparkles className="w-4 h-4 text-[hsl(var(--accent))] flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[hsl(var(--accent))]">Continuing Spark</p>
            <p className="text-sm text-white/80 truncate">
              {parentPost.title || parentPost.content.slice(0, 60)}
            </p>
          </div>
          {onClear && (
            <button 
              onClick={onClear}
              className="text-white/40 hover:text-white/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Pending references */}
      {pendingRefs.length > 0 && (
        <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-purple-400" />
              <p className="text-xs font-medium text-purple-400">
                Cross-linking to {pendingRefs.length} Spark{pendingRefs.length > 1 ? 's' : ''}
              </p>
            </div>
            <button 
              onClick={clearRefs}
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {pendingRefs.map(refId => (
              <span 
                key={refId}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
                  "text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30"
                )}
              >
                {refTitles[refId] || 'Loading...'}
                <button 
                  onClick={() => removeRef(refId)}
                  className="hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
