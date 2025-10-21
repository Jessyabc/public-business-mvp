import { useEffect, useMemo, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, Building2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { FeedsAdapter, type FeedItem, type HistoryItem } from '@/adapters/feedsAdapter';
import { SHOW_RIGHT_SIDEBAR } from '@/config/flags';
import styles from '@/components/effects/glassSurface.module.css';
import { useAppMode } from '@/contexts/AppModeContext';
import { usePosts } from '@/hooks/usePosts';

export function RightSidebar() {
  const showSidebar = SHOW_RIGHT_SIDEBAR;
  const { mode } = useAppMode();
  const { posts } = usePosts();
  
  const adapter = useMemo(() => new FeedsAdapter(), []);
  const [ideas, setIdeas] = useState<FeedItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  const [loadingHist, setLoadingHist] = useState(true);
  const [visible, setVisible] = useState({ ideas: 12 });
  const [showBusinessPreview, setShowBusinessPreview] = useState(false);
  
  // Get business posts for preview
  const businessPosts = posts.filter(p => p.mode === 'business').slice(0, 3);

  useEffect(() => {
    if (!showSidebar) {
      return;
    }

    (async () => {
      try {
        const list = await adapter.getOpenIdeasFeed();      // uses existing adapter
        setIdeas(list ?? []);
      } catch (e) {
        console.warn('Open ideas load failed:', e);
      } finally {
        setLoadingIdeas(false);
      }
    })();

    (async () => {
      try {
        const list = await adapter.getHistory();            // recent views/opens
        setHistory(list ?? []);
      } catch (e) {
        console.warn('History load failed:', e);
      } finally {
        setLoadingHist(false);
      }
    })();
  }, [adapter, showSidebar]);

  const loadMoreIdeas = () =>
    setVisible(v => ({ ...v, ideas: Math.min(v.ideas + 12, ideas.length) }));

  if (!showSidebar) return null;

  return (
    <aside className="right-sidebar-overlay glass-card glass-med p-3"
      aria-label="Right sidebar overlay"
    >
      {/* Business Feed Preview Toggle */}
      {mode === 'public' && (
        <div className="mb-3">
          <Button
            onClick={() => setShowBusinessPreview(!showBusinessPreview)}
            variant="outline"
            size="sm"
            className="w-full glass-low justify-between"
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="text-sm">Business Feed Preview</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${showBusinessPreview ? 'rotate-180' : ''}`} />
          </Button>
          
          {showBusinessPreview && (
            <div className="mt-2 space-y-2 accordion-content expanded">
              <div className="text-xs text-muted-foreground px-2 pb-1 border-b border-border/40">
                Latest Business Insights
              </div>
              {businessPosts.length === 0 ? (
                <div className="text-xs text-muted-foreground p-2">No business posts yet</div>
              ) : (
                businessPosts.map((post) => (
                  <Card key={post.id} className={`${styles.glassSurface} glass-low cursor-pointer`}>
                    <CardContent className="p-3">
                      <div className="text-sm font-medium line-clamp-2">{post.title || post.content}</div>
                      <div className="mt-1 text-xs text-muted-foreground flex items-center justify-between">
                        <span>T-Score: {post.t_score || 'N/A'}</span>
                        <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
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
    </aside>
  );
}

export default RightSidebar;
