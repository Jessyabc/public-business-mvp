import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Brain, Building, Lightbulb, History as HistoryIcon } from 'lucide-react';
import { FeedsAdapter, type FeedItem, type HistoryItem } from '@/adapters/feedsAdapter';
import { formatDistanceToNow } from 'date-fns';
import { SHOW_RIGHT_SIDEBAR } from '@/config/flags';

export function RightSidebar() {
  const [brainstormFeed, setBrainstormFeed] = useState<FeedItem[]>([]);
  const [businessFeed, setBusinessFeed] = useState<FeedItem[]>([]);
  const [openIdeasFeed, setOpenIdeasFeed] = useState<FeedItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const feedsAdapter = new FeedsAdapter();

  useEffect(() => {
    const loadFeeds = async () => {
      try {
        const [brainstorms, business, openIdeas, historyItems] = await Promise.all([
          feedsAdapter.getBrainstormFeed(),
          feedsAdapter.getBusinessFeed(),
          feedsAdapter.getOpenIdeasFeed(),
          feedsAdapter.getHistory(),
        ]);

        setBrainstormFeed(brainstorms);
        setBusinessFeed(business);
        setOpenIdeasFeed(openIdeas);
        setHistory(historyItems);
      } catch (error) {
        console.error('Failed to load feeds:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeeds();
  }, []);

  if (!SHOW_RIGHT_SIDEBAR) return null;

  const EmptyState = ({ title, description }: { title: string; description: string }) => (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">{description}</CardContent>
    </Card>
  );

  const FeedItemCard = ({ item }: { item: FeedItem }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          {item.type === 'brainstorm' && <Brain size={16} />}
          {item.type === 'business' && <Building size={16} />}
          {item.type === 'open_idea' && <Lightbulb size={16} />}
          <CardTitle className="text-sm">{item.title}</CardTitle>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Heart size={14} />{item.stats?.likes ?? 0}</span>
          <span className="flex items-center gap-1"><MessageCircle size={14} />{item.stats?.comments ?? 0}</span>
        </div>
      </CardHeader>
      <CardContent className="text-sm">
        {item.content && <p className="mb-2">{item.content}</p>}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{item.author ?? 'Unknown'}</span>
          <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <aside className="w-full lg:w-96 p-2">
      <Tabs defaultValue="brain" className="w-full">
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="brain"><span className="inline-flex items-center gap-1"><Brain size={14} /> Brain</span></TabsTrigger>
          <TabsTrigger value="biz"><span className="inline-flex items-center gap-1"><Building size={14} /> Biz</span></TabsTrigger>
          <TabsTrigger value="ideas"><span className="inline-flex items-center gap-1"><Lightbulb size={14} /> Ideas</span></TabsTrigger>
          <TabsTrigger value="hist"><span className="inline-flex items-center gap-1"><HistoryIcon size={14} /> Hist</span></TabsTrigger>
        </TabsList>

        <TabsContent value="brain" className="space-y-2 mt-2">
          <div className="text-sm font-medium mb-1">Brainstorm Feed</div>
          {loading
            ? <EmptyState title="Loading…" description="Fetching brainstorm feed" />
            : (brainstormFeed.length ? brainstormFeed.map((i) => <FeedItemCard key={i.id} item={i} />) : <EmptyState title="No items" description="Connect backend to populate feed" />)}
        </TabsContent>

        <TabsContent value="biz" className="space-y-2 mt-2">
          <div className="text-sm font-medium mb-1">Business Feed</div>
          {loading
            ? <EmptyState title="Loading…" description="Fetching business feed" />
            : (businessFeed.length ? businessFeed.map((i) => <FeedItemCard key={i.id} item={i} />) : <EmptyState title="No items" description="Connect backend to populate feed" />)}
        </TabsContent>

        <TabsContent value="ideas" className="space-y-2 mt-2">
          <div className="text-sm font-medium mb-1">Open Ideas Feed</div>
          {loading
            ? <EmptyState title="Loading…" description="Fetching open ideas" />
            : (openIdeasFeed.length ? openIdeasFeed.map((i) => <FeedItemCard key={i.id} item={i} />) : <EmptyState title="No items" description="Connect backend to populate feed" />)}
        </TabsContent>

        <TabsContent value="hist" className="space-y-2 mt-2">
          <div className="text-sm font-medium mb-1">History</div>
          {loading
            ? <EmptyState title="Loading…" description="Fetching history" />
            : (history.length ? history.map((h) => (
                <Card key={h.id}>
                  <CardContent className="py-3 text-sm flex items-center justify-between">
                    <span>{h.action} <Badge variant="outline" className="ml-1">{h.target}</Badge></span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(h.created_at), { addSuffix: true })}
                    </span>
                  </CardContent>
                </Card>
              )) : <EmptyState title="No history" description="Nothing to show yet" />)}
        </TabsContent>
      </Tabs>
    </aside>
  );
}
