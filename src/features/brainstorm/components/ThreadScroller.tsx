import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useBrainstormStore } from "@/features/brainstorm/store";
import { likePost, viewPost } from "@/features/brainstorm/adapters/supabaseAdapter";
import { GlowCard } from "@/components/ui/GlowCard";

function HardBar() {
  return (
    <svg className="w-full h-3" viewBox="0 0 600 20" preserveAspectRatio="none">
      <polyline
        points="8,10 592,10"
        fill="none"
        stroke="#489FE3"
        strokeWidth="1.2"
        strokeLinecap="round"
        filter="url(#pb-glow)"
      />
    </svg>
  );
}

function SoftHandoff({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <div className="px-4 md:px-6 py-2">
      <svg className="w-full h-4" viewBox="0 0 600 20" preserveAspectRatio="none">
        <line
          x1="8" y1="10" x2="592" y2="10"
          stroke="url(#pb-grad)"
          strokeWidth="1.35"
          strokeDasharray="6 7"
          strokeLinecap="round"
          filter="url(#pb-grad-glow)"
          opacity="0.9"
        />
      </svg>
      <div className="mt-1 text-sm text-slate-200/90">
        Following the thread? Next best reference ↓{" "}
        <button className="underline decoration-[#489FE3]/60 hover:text-cyan-300" onClick={onClick}>
          {title}
        </button>
      </div>
    </div>
  );
}

function FeedCard({
  post, expanded, onToggleExpand, onContinue, onLink
}:{
  post: any; expanded: boolean; onToggleExpand: () => void; onContinue: () => void; onLink: () => void;
}) {
  useEffect(() => { viewPost(post.id).catch(()=>{}); }, [post.id]);

  return (
    <motion.div
      initial={{ y: 14, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -20% 0px" }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="px-2"
    >
      <GlowCard className="p-4 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg/7 md:text-xl/8 font-semibold text-slate-100">{post.title ?? "Untitled"}</h2>
          <div className="flex items-center gap-3 text-sm text-slate-300/80">
            <button onClick={() => likePost(post.id)} className="hover:text-cyan-300 transition">❤️ {post.likes_count ?? 0}</button>
            <span>👁 {post.views_count ?? 0}</span>
          </div>
        </div>

        {expanded && post.content && (
          <p className="mt-3 text-[15px]/7 text-slate-200/90 whitespace-pre-wrap">{post.content}</p>
        )}

        <div className="mt-4 flex items-center gap-2">
          <button onClick={onToggleExpand} className="rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 text-xs hover:bg-white/10">
            {expanded ? "Collapse" : "Expand"}
          </button>
          <button onClick={onContinue} className="rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 text-xs hover:bg-white/10">
            Continue
          </button>
          <button onClick={onLink} className="rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 text-xs hover:bg-white/10">
            Link
          </button>
        </div>

        {expanded && <SoftLinksList postId={post.id} />}

        <div className="mt-4"><HardBar/></div>
      </GlowCard>
    </motion.div>
  );
}

function SoftLinksList({ postId }: { postId: string }) {
  const { softLinksForPost, selectById } = useBrainstormStore();
  const items = softLinksForPost(postId);
  if (!items.length) return null;
  return (
    <div className="mt-3 text-sm">
      <div className="mb-2 text-slate-300/80">Soft links</div>
      <div className="flex flex-wrap gap-2">
        {items.map(x => (
          <button
            key={x.id}
            onClick={() => selectById(x.id)}
            className="rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 hover:bg-white/10"
            title={x.post_type || "Soft link"}
          >
            {x.title ?? "Untitled"} {typeof x.like_count === "number" ? ` • ❤️ ${x.like_count}` : ""}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ThreadScroller() {
  const {
    selectedNodeId, threadQueue, rebuildThreadFromSelection,
    continueThreadAfterEnd, selectById
  } = useBrainstormStore();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Rebuild the FULL chain whenever selection changes
  useEffect(() => {
    rebuildThreadFromSelection().then(() => setExpandedId(selectedNodeId ?? null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNodeId]);

  // Infinite scroll: after end, append dotted handoff + next chain
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const onScroll = async () => {
      const nearEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 240;
      if (nearEnd && !loadingMore) {
        setLoadingMore(true);
        try { await continueThreadAfterEnd(); } finally { setLoadingMore(false); }
      }
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [loadingMore, continueThreadAfterEnd]);

  return (
    <div className="relative z-10 p-0 overflow-hidden">
      <div ref={scrollerRef} className="h-[70vh] md:h-[76vh] overflow-auto">
        {threadQueue.map((item, idx) => {
          if (item.kind === 'handoff' && item.handoffTo) {
            return (
              <SoftHandoff
                key={`handoff-${idx}`}
                title={item.handoffTo.title ?? "Untitled"}
                onClick={() => selectById(item.handoffTo!.id)}
              />
            );
          }
          if (item.kind === 'post' && item.post) {
            const p = item.post;
            return (
              <FeedCard
                key={p.id}
                post={p}
                expanded={expandedId === p.id}
                onToggleExpand={() => setExpandedId(expandedId === p.id ? null : p.id)}
                onContinue={() => {
                  // Open your continue composer for p.id (event keeps coupling low)
                  window.dispatchEvent(new CustomEvent('pb:brainstorm:continue', { detail: { parentId: p.id }}));
                }}
                onLink={() => {
                  // Open your link/history picker for p.id
                  window.dispatchEvent(new CustomEvent('pb:brainstorm:link', { detail: { sourceId: p.id }}));
                }}
              />
            );
          }
          return null;
        })}
        {loadingMore && <div className="p-4 text-slate-400">Loading more…</div>}
      </div>
    </div>
  );
}
