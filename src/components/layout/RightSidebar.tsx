import { formatDistanceToNow } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeedContainer } from '@/features/feed/FeedContainer';
import { BrainstormPostCard } from '@/features/brainstorm/components/BrainstormPostCard';
import { useBrainstormExperienceStore } from '@/features/brainstorm/stores/experience';

interface RightSidebarProps {
  variant?: 'default' | 'feed';
}

/**
 * Brainstorm sidebar companion:
 * - Breadcrumbs tab reflects active canvas history
 * - Open Ideas tab hosts the spark-only FeedContainer
 */
export function RightSidebar({ variant = 'feed' }: RightSidebarProps) {
  const breadcrumbs = useBrainstormExperienceStore((state) => state.breadcrumbs);
  const navigateBreadcrumb = useBrainstormExperienceStore((state) => state.navigateBreadcrumb);
  const clearBreadcrumbs = useBrainstormExperienceStore((state) => state.clearBreadcrumbs);
  const setActivePost = useBrainstormExperienceStore((state) => state.setActivePost);
  const recordPosts = useBrainstormExperienceStore((state) => state.recordPosts);

  if (variant !== 'feed') {
    return null;
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4">
        <Tabs defaultValue="breadcrumbs" className="h-full flex flex-col">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="breadcrumbs">Breadcrumbs</TabsTrigger>
            <TabsTrigger value="ideas">Open Ideas</TabsTrigger>
          </TabsList>

          <TabsContent value="breadcrumbs" className="mt-4 flex-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-white/80">Navigation trail</p>
              {breadcrumbs.length > 0 && (
                <button
                  className="text-xs text-cyan-300 hover:text-cyan-200"
                  onClick={clearBreadcrumbs}
                >
                  Clear
                </button>
              )}
            </div>
            {breadcrumbs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Select nodes in the canvas to build a breadcrumb path.
              </p>
            ) : (
              <div className="space-y-2 overflow-y-auto pr-1 max-h-[280px]">
                {breadcrumbs.map((crumb, index) => (
                  <button
                    key={crumb.id}
                    onClick={() => navigateBreadcrumb(index)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left transition hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between text-xs text-primary/70">
                      <span>{crumb.kind}</span>
                      <span className="text-white/60">
                        {formatDistanceToNow(new Date(crumb.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white truncate">
                      {crumb.title || 'Untitled'}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ideas" className="mt-4 flex-1">
            <FeedContainer
              mode="brainstorm_open_ideas"
              initialKinds={['open_idea']}
              onItemsChange={recordPosts}
              renderFeed={(items) => (
                <div className="flex flex-col gap-3 overflow-y-auto pr-1 max-h-[320px]">
                  {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No open ideas yet. Share one from the community feed.
                    </p>
                  ) : (
                    items.map((post) => (
                      <BrainstormPostCard
                        key={post.id}
                        post={post}
                        variant="compact"
                        showActions={false}
                        onSelect={setActivePost}
                      />
                    ))
                  )}
                </div>
              )}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default RightSidebar;
