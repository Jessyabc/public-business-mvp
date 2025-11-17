import { useState } from 'react';
import { GlobalBackground } from '@/components/layout/GlobalBackground';
import { GlowDefs } from '@/components/graphics/GlowDefs';
import { RefreshCcw } from 'lucide-react';
import { NodeForm } from '@/features/brainstorm/components/NodeForm';
import { LinkPicker } from '@/features/brainstorm/components/LinkPicker';
import { FeedContainer } from '@/components/feeds/FeedContainer';
import {
  BrainstormLayout,
  type Spark,
  type PostSummary,
  type OpenIdeaSummary,
} from '@/components/brainstorm/BrainstormLayout';

// Constant fallback timestamp for items without a created_at field
// Using epoch time (1970-01-01) to indicate unknown timestamp
const UNKNOWN_TIMESTAMP = '1970-01-01T00:00:00.000Z';

export default function BrainstormFeed() {
  const [activeSparkId, setActiveSparkId] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState<'root' | 'continue'>('root');
  const [composerParentId, setComposerParentId] = useState<string | null>(null);
  const [linkPickerOpen, setLinkPickerOpen] = useState(false);
  const [linkSourceId, setLinkSourceId] = useState<string | null>(null);


  const handleSelectSpark = (sparkId: string) => {
    setActiveSparkId(sparkId);
  };

  const handleContinueFromSpark = (sparkId: string) => {
    setComposerMode('continue');
    setComposerParentId(sparkId);
    setComposerOpen(true);
  };

  const handleSaveReferenceFromSpark = (sparkId: string) => {
    setLinkSourceId(sparkId);
    setLinkPickerOpen(true);
  };

  const handleViewSpark = async (sparkId: string) => {
    // Placeholder for now – later we can call an API to increment view counts.
    // Leave this as a no-op or console.log so it doesn't break anything.
    console.debug('Viewed spark', sparkId);
  };

  const handleGiveThought = async (sparkId: string, _alreadyGiven: boolean) => {
    // Placeholder for now – later we will wire this to Supabase to increment T-score.
    console.debug('Thought given on spark', sparkId);
  };

  return (
    <main className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <GlobalBackground />
      <GlowDefs />

      <section className="relative h-screen overflow-hidden p-4 md:p-6">
        <FeedContainer
          mode="public"
          initialKinds={['brainstorm']}
          renderFeed={(items, feed) => {
            // Map feed items into the Spark shape expected by BrainstormLayout.
            // Look at the item structure used elsewhere in the feed (for example in BrainstormFeedRenderer
            // or convertFeedPostToUniversal) and pick reasonable fields for id, title/body, etc.
            const sparks: Spark[] = items
              .map((item: any) => {
                // Adjust this mapping based on the actual fields on "item".
                // Prefer the post id and text content that best represents the Spark.
                const id = item.id ?? item.post_id ?? item.post?.id;
                
                // Filter out items with undefined/null IDs to prevent "undefined" string conversion
                if (id === undefined || id === null) {
                  return null;
                }

                const title =
                  item.title ??
                  item.post?.title ??
                  (item.kind === 'brainstorm' ? item.post?.headline : null);
                const body =
                  item.body ??
                  item.post?.body ??
                  item.summary ??
                  item.post?.summary ??
                  '';

                return {
                  id: String(id),
                  title: title ?? null,
                  body,
                  created_at: item.created_at ?? item.post?.created_at ?? UNKNOWN_TIMESTAMP,
                  author_display_name:
                    item.author_display_name ??
                    item.author_name ??
                    item.post?.author_display_name ??
                    null,
                  author_avatar_url:
                    item.author_avatar_url ?? item.post?.author_avatar_url ?? null,
                  is_anonymous: !!item.is_anonymous,
                  t_score: item.t_score ?? 0,
                  view_count: item.view_count ?? 0,
                  has_given_thought: item.has_given_thought ?? false,
                };
              })
              .filter((spark): spark is Spark => spark !== null);

            // Determine currentSpark from the activeSparkId or default to the first spark.
            const currentSpark =
              sparks.find((s) => s.id === activeSparkId) ?? sparks[0] ?? null;

            // For now, Last Seen is just the full list of sparks in reverse chronological order.
            const lastSeenSparks = sparks;

            // Referenced posts and open ideas are empty placeholders for now.
            const referencedPosts: PostSummary[] = [];
            const openIdeas: OpenIdeaSummary[] = [];

            return (
              <>
                <div className="mb-4 flex items-center gap-2">
                  <button
                    onClick={feed.refresh}
                    className="inline-flex items-center gap-2 rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10"
                  >
                    <RefreshCcw size={16} /> Refresh
                  </button>
                </div>

                <BrainstormLayout
                  lastSeenSparks={lastSeenSparks}
                  currentSpark={currentSpark}
                  referencedPosts={referencedPosts}
                  openIdeas={openIdeas}
                  onSelectSpark={handleSelectSpark}
                  onGiveThought={handleGiveThought}
                  onContinueBrainstorm={handleContinueFromSpark}
                  onSaveReference={handleSaveReferenceFromSpark}
                  onViewSpark={handleViewSpark}
                />
              </>
            );
          }}
        />
      </section>

      {/* NodeForm Modal */}
      <NodeForm
        open={composerOpen}
        onOpenChange={(open) => {
          setComposerOpen(open);
          if (!open) {
            setComposerParentId(null);
          }
        }}
        mode={composerMode}
        parentId={composerParentId}
      />

      {/* LinkPicker Modal */}
      <LinkPicker
        open={linkPickerOpen}
        onOpenChange={(open) => {
          setLinkPickerOpen(open);
          if (!open) {
            setLinkSourceId(null);
          }
        }}
        sourceId={linkSourceId}
      />
    </main>
  );
}
