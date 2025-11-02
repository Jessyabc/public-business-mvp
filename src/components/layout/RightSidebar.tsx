import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, Building2, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { FeedsAdapter, type FeedItem, type HistoryItem } from '@/adapters/feedsAdapter';
import { SHOW_RIGHT_SIDEBAR } from '@/config/flags';
import styles from '@/components/effects/glassSurface.module.css';
import { useAppMode } from '@/contexts/AppModeContext';
import { LiveBrainstormWindow } from '@/components/brainstorm/LiveBrainstormWindow';
import { supabase } from '@/integrations/supabase/client';

type RecentBrainstorm = {
  id: string;
  title: string;
  created_at: string;
  likes_count: number;
};

interface RightSidebarProps {
  variant?: 'default' | 'feed';
}

export function RightSidebar({ variant = 'default' }: RightSidebarProps) {
  const showSidebar = SHOW_RIGHT_SIDEBAR;
  const { mode } = useAppMode();
  
  const adapter = useMemo(() => new FeedsAdapter(), []);
  const [ideas, setIdeas] = useState<FeedItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [recentBrainstorms, setRecentBrainstorms] = useState<RecentBrainstorm[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  const [loadingHist, setLoadingHist] = useState(true);
  const [loadingBrainstorms, setLoadingBrainstorms] = useState(true);
  const [visible, setVisible] = useState({ ideas: 12 });
  const [showBrainstormPreview, setShowBrainstormPreview] = useState(false);

  useEffect(() => {
    if (!showSidebar) {
      return;
    }

    (async () => {
      try {
        const list = await adapter.getOpenIdeasFeed();
        setIdeas(list ?? []);
      } catch (e) {
        console.warn('Open ideas load failed:', e);
      } finally {
        setLoadingIdeas(false);
      }
    })();

    (async () => {
      try {
        const list = await adapter.getHistory();
        setHistory(list ?? []);
      } catch (e) {
        console.warn('History load failed:', e);
      } finally {
        setLoadingHist(false);
      }
    })();

    // Load recent brainstorms for feed variant
    if (variant === 'feed') {
      (async () => {
        try {
          const { data, error } = await supabase
            .from('posts')
            .select('id, title, created_at, likes_count')
            .eq('type', 'brainstorm')
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(5);

          if (error) throw error;
          setRecentBrainstorms(data || []);
        } catch (err) {
          console.error('Error loading recent brainstorms:', err);
        } finally {
          setLoadingBrainstorms(false);
        }
      })();
    }
  }, [adapter, showSidebar, variant]);

  const loadMoreIdeas = () =>
    setVisible(v => ({ ...v, ideas: Math.min(v.ideas + 12, ideas.length) }));

  if (!showSidebar) return null;

  return (
    <div className="h-full flex flex-col bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-inner overflow-hidden">
      {/* Header: Recent Brainstorms (feed variant only) */}
      {variant === 'feed' && (
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-sm">Recent Activity</h3>
          </div>
          {loadingBrainstorms ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ) : recentBrainstorms.length === 0 ? (
            <p className="text-xs text-muted-foreground">No recent activity</p>
          ) : (
            <ScrollArea className="max-h-48">
              <div className="space-y-2">
                {recentBrainstorms.map((bs) => (
                  <div
                    key={bs.id}
                    className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <p className="text-xs font-medium line-clamp-1 mb-1">{bs.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{bs.likes_count} likes</span>
                      <span>•</span>
                      <span>{new Date(bs.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}

      {/* Brainstorm Feed Preview Toggle (business mode, default variant) */}
      {variant === 'default' && mode === 'business' && (
        <div className="p-3 border-b border-white/10">
          <Button
            onClick={() => setShowBrainstormPreview(!showBrainstormPreview)}
            variant="outline"
            size="sm"
            className="w-full glass-low justify-between focus-visible:ring-2 focus-visible:ring-primary"
            aria-expanded={showBrainstormPreview}
            aria-label="Toggle brainstorm preview"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="text-sm">Brainstorm Feed Preview</span>
            </div>
            <motion.div
              animate={{ rotate: showBrainstormPreview ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </Button>
          
          <AnimatePresence>
            {showBrainstormPreview && (
              <motion.div
                initial={{ height: 0, opacity: 0, y: -10 }}
                animate={{ height: 'auto', opacity: 1, y: 0 }}
                exit={{ height: 0, opacity: 0, y: -10 }}
                transition={{ 
                  duration: 0.25,
                  ease: [0.4, 0, 0.2, 1]
                }}
                className="overflow-hidden mt-2"
              >
                <LiveBrainstormWindow dense className="!p-3" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
      
      <Tabs defaultValue="ideas" className="w-full flex-1 overflow-hidden">
        <TabsList className="grid grid-cols-2 mb-2">
          <TabsTrigger value="ideas">Open Ideas</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="ideas" className="flex flex-col h-[calc(100%-3rem)]">
          <Card className="mb-2 bg-transparent border-transparent shadow-none elevation-0">
            <CardHeader className="py-2">
              <CardTitle className="text-sm opacity-80">Open Ideas (public)</CardTitle>
            </CardHeader>
          </Card>

          <ScrollArea className="flex-1 glass-scroll pr-2">
            {loadingIdeas ? (
              <div className="text-sm text-muted-foreground p-2">Loading open ideas…</div>
            ) : ideas.length === 0 ? (
              <div className="text-sm text-muted-foreground p-2">No ideas yet.</div>
            ) : (
              <div className="space-y-2">
                {ideas.slice(0, visible.ideas).map((it) => (
                  <Card key={it.id} className={`${styles.glassSurface} interactive-glass cursor-pointer`}>
                    <CardContent className="p-3">
                      <div className="text-sm font-medium line-clamp-2">{it.title || it.content}</div>
                      <div className="mt-1 text-xs text-muted-foreground flex items-center justify-between">
                        <span>{it.author ?? 'Anonymous'}</span>
                        <span>{formatDistanceToNow(new Date(it.created_at), { addSuffix: true })}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {visible.ideas < ideas.length && (
                  <button
                    onClick={loadMoreIdeas}
                    className={`w-full text-xs py-2 rounded-md ${styles.glassButton} interactive-glass`}
                  >
                    Load more
                  </button>
                )}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="history" className="flex flex-col h-[calc(100%-3rem)]">
          <Card className="mb-2 bg-transparent border-transparent shadow-none elevation-0">
            <CardHeader className="py-2">
              <CardTitle className="text-sm opacity-80">Recent activity</CardTitle>
            </CardHeader>
          </Card>

          <ScrollArea className="flex-1 glass-scroll pr-2">
            {loadingHist ? (
              <div className="text-sm text-muted-foreground p-2">Loading history…</div>
            ) : history.length === 0 ? (
              <div className="text-sm text-muted-foreground p-2">Nothing yet.</div>
            ) : (
              <div className="space-y-2">
                {history.map((h) => (
                  <Card key={h.id} className={`${styles.glassSurface} interactive-glass cursor-pointer`}>
                    <CardContent className="p-3 flex items-center justify-between">
                      <span className="text-sm">
                        {h.action || 'viewed'}{' '}
                        {h.target && <Badge variant="outline" className="ml-1">{h.target}</Badge>}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(h.created_at), { addSuffix: true })}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default RightSidebar;
