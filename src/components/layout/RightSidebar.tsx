import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Brain, Building, Lightbulb, History } from 'lucide-react';
import { FeedsAdapter, type FeedItem, type HistoryItem } from '@/adapters/feedsAdapter';
import { formatDistanceToNow } from 'date-fns';

const SHOW_RIGHT_SIDEBAR = process.env.REACT_APP_SHOW_RIGHT_SIDEBAR !== 'false';

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

  if (!SHOW_RIGHT_SIDEBAR) {
    return null;
  }

  const EmptyState = ({ icon: Icon, title, description }: { icon: any; title: string; description: string }) => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Icon className="w-12 h-12 text-muted-foreground/50 mb-3" />
      <h3 className="font-medium text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );

  const FeedItemCard = ({ item }: { item: FeedItem }) => (
    <Card className="glass-card mb-3 hover:glass-hover transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {item.type === 'brainstorm' && <Brain className="w-4 h-4 text-pb-accent-brainstorm" />}
            {item.type === 'business' && <Building className="w-4 h-4 text-pb-accent-insight" />}
            {item.type === 'open_idea' && <Lightbulb className="w-4 h-4 text-pb-accent-open" />}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-foreground truncate">{item.title}</h4>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.content}</p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">{item.author}</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span className="text-xs">{item.stats.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  <span className="text-xs">{item.stats.comments}</span>
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="mt-2 text-xs">
              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-80 h-full bg-gradient-to-b from-background/95 to-background/98 border-l border-border/50 backdrop-blur-sm">
      <div className="p-4 h-full overflow-hidden">
        <Tabs defaultValue="brainstorm" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-4 glass-surface mb-4">
            <TabsTrigger value="brainstorm" className="text-xs">
              <Brain className="w-3 h-3 mr-1" />
              Brain
            </TabsTrigger>
            <TabsTrigger value="business" className="text-xs">
              <Building className="w-3 h-3 mr-1" />
              Biz
            </TabsTrigger>
            <TabsTrigger value="ideas" className="text-xs">
              <Lightbulb className="w-3 h-3 mr-1" />
              Ideas
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              <History className="w-3 h-3 mr-1" />
              Hist
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="brainstorm" className="h-full overflow-y-auto">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground mb-3">Brainstorm Feed</h3>
                {loading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-muted/50 rounded glass-surface"></div>
                    ))}
                  </div>
                ) : brainstormFeed.length > 0 ? (
                  brainstormFeed.map(item => <FeedItemCard key={item.id} item={item} />)
                ) : (
                  <EmptyState
                    icon={Brain}
                    title="No brainstorms yet"
                    description="Connect backend to see brainstorm activities"
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="business" className="h-full overflow-y-auto">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground mb-3">Business Feed</h3>
                {loading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-muted/50 rounded glass-surface"></div>
                    ))}
                  </div>
                ) : businessFeed.length > 0 ? (
                  businessFeed.map(item => <FeedItemCard key={item.id} item={item} />)
                ) : (
                  <EmptyState
                    icon={Building}
                    title="No business insights"
                    description="Connect backend to see business activities"
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="ideas" className="h-full overflow-y-auto">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground mb-3">Open Ideas Feed</h3>
                {loading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-muted/50 rounded glass-surface"></div>
                    ))}
                  </div>
                ) : openIdeasFeed.length > 0 ? (
                  openIdeasFeed.map(item => <FeedItemCard key={item.id} item={item} />)
                ) : (
                  <EmptyState
                    icon={Lightbulb}
                    title="No open ideas yet"
                    description="Connect backend to see idea submissions"
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="h-full overflow-y-auto">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground mb-3">History</h3>
                {loading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-12 bg-muted/50 rounded glass-surface"></div>
                    ))}
                  </div>
                ) : history.length > 0 ? (
                  history.map(item => (
                    <Card key={item.id} className="glass-card mb-2">
                      <CardContent className="p-3">
                        <p className="text-xs text-foreground">{item.action}</p>
                        <p className="text-xs text-muted-foreground">{item.target}</p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <EmptyState
                    icon={History}
                    title="No history yet"
                    description="Your activity will appear here"
                  />
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}