import { Fragment } from 'react';
import { ArrowRight, Link2, MessageCircle, Sparkles, User2 } from 'lucide-react';

export interface Spark {
  id: string;
  title: string | null;
  body: string;
  created_at: string;
  author_display_name: string | null;
  author_avatar_url: string | null;
  is_anonymous: boolean;
  t_score: number;
  view_count: number;
  has_given_thought: boolean;
}

export interface PostSummary {
  id: string;
  title: string;
  excerpt: string;
  created_at?: string;
  author_display_name?: string | null;
}

export interface OpenIdeaSummary {
  id: string;
  title: string;
  summary: string;
  impact?: string;
}

interface BrainstormLayoutProps {
  lastSeenSparks: Spark[];
  currentSpark: Spark | null;
  referencedPosts: PostSummary[];
  openIdeas: OpenIdeaSummary[];
  onSelectSpark: (sparkId: string) => void;
  onGiveThought: (sparkId: string) => void;
  onContinueBrainstorm: (sparkId: string) => void;
  onSaveReference: (sparkId: string) => void;
  onViewSpark: (sparkId: string) => void;
}

const formatTimestamp = (timestamp: string) => {
  try {
    return new Date(timestamp).toLocaleString();
  } catch (error) {
    console.warn('Unable to format timestamp', error);
    return timestamp;
  }
};

export function BrainstormLayout({
  lastSeenSparks,
  currentSpark,
  referencedPosts,
  openIdeas,
  onSelectSpark,
  onGiveThought,
  onContinueBrainstorm,
  onSaveReference,
  onViewSpark,
}: BrainstormLayoutProps) {
  const activeSpark = currentSpark ?? lastSeenSparks[0] ?? null;

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <section className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-widest text-slate-300">Active sparks</p>
            <h2 className="text-2xl font-semibold text-white">Shared with the collective</h2>
          </div>
          <Sparkles className="h-6 w-6 text-primary" />
        </header>

        {lastSeenSparks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-slate-300">
            <p>No sparks yet. Start the brainstorm by sharing the first idea.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {lastSeenSparks.map((spark) => (
              <article
                key={spark.id}
                className={`rounded-2xl border px-5 py-4 transition hover:border-white/40 ${
                  activeSpark?.id === spark.id
                    ? 'border-white/40 bg-white/5'
                    : 'border-white/10 bg-black/10'
                }`}
                onClick={() => onSelectSpark(spark.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-300">
                      {spark.title ?? 'Untitled spark'}
                    </p>
                    <p className="text-base text-white">
                      {spark.body}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onViewSpark(spark.id);
                    }}
                    className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-primary"
                  >
                    View
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-2">
                    <User2 className="h-4 w-4" />
                    {spark.author_display_name ?? (spark.is_anonymous ? 'Anonymous' : 'Unknown author')}
                  </span>
                  <span>{formatTimestamp(spark.created_at)}</span>
                  <span>{spark.view_count} views</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-full bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
                    onClick={(event) => {
                      event.stopPropagation();
                      onGiveThought(spark.id);
                    }}
                  >
                    <MessageCircle className="mr-1 inline h-4 w-4" />
                    {spark.has_given_thought ? 'Thank you!' : 'Give a thought'}
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary hover:bg-primary/20"
                    onClick={(event) => {
                      event.stopPropagation();
                      onContinueBrainstorm(spark.id);
                    }}
                  >
                    Continue thread
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
                    onClick={(event) => {
                      event.stopPropagation();
                      onSaveReference(spark.id);
                    }}
                  >
                    <Link2 className="mr-1 inline h-4 w-4" />
                    Save reference
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <aside className="space-y-6">
        <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur">
          <p className="text-sm uppercase tracking-widest text-slate-300">Current context</p>
          {activeSpark ? (
            <div className="mt-4 space-y-3">
              <h3 className="text-xl font-semibold text-white">
                {activeSpark.title ?? 'Untitled spark'}
              </h3>
              <p className="text-slate-200">{activeSpark.body}</p>
            </div>
          ) : (
            <p className="mt-2 text-slate-300">Select a spark to see more context.</p>
          )}
        </div>

        <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur">
          <p className="text-sm uppercase tracking-widest text-slate-300">Referenced posts</p>
          {referencedPosts.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">No posts linked yet.</p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              {referencedPosts.map((post) => (
                <li key={post.id} className="rounded-2xl bg-black/20 p-3">
                  <p className="font-semibold text-white">{post.title}</p>
                  <p className="text-slate-300">{post.excerpt}</p>
                  {post.created_at && (
                    <p className="text-xs text-slate-400">{formatTimestamp(post.created_at)}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur">
          <p className="text-sm uppercase tracking-widest text-slate-300">Open ideas</p>
          {openIdeas.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">Track promising directions here.</p>
          ) : (
            <dl className="mt-4 space-y-3 text-sm text-slate-200">
              {openIdeas.map((idea) => (
                <Fragment key={idea.id}>
                  <dt className="font-semibold text-white">{idea.title}</dt>
                  <dd className="text-slate-300">{idea.summary}</dd>
                  {idea.impact && (
                    <dd className="text-xs uppercase tracking-widest text-primary">{idea.impact}</dd>
                  )}
                </Fragment>
              ))}
            </dl>
          )}
        </div>
      </aside>
    </div>
  );
}
