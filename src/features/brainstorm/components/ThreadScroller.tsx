import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useBrainstormStore } from "@/features/brainstorm/store";
import { likePost, viewPost } from "@/features/brainstorm/adapters/supabaseAdapter";
import { GlowCard } from "@/components/ui/GlowCard";
import { LinkPulse } from "./LinkPulse";

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

  const triggerPulse = (type: 'hard' | 'soft') => {
    window.dispatchEvent(new CustomEvent('linkPulse', { detail: { id: post.id, type } }));
  };

  return (
    <motion.div
      initial={{ y: 14, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "0px 0px -20% 0px" }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="px-2"
    >
      <motion.div
        layout
        animate={{
          boxShadow: expanded
            ? '0 0 25px rgba(72,159,227,0.5), 0 0 60px rgba(103,255,216,0.4)'
            : '0 0 10px rgba(72,159,227,0.2)',
        }}
        transition={{ duration: 0.6 }}
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
            <button 
              onClick={() => {
                triggerPulse('hard');
                onContinue();
              }} 
              className="rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 text-xs hover:bg-white/10"
            >
              Continue
            </button>
            <button 
              onClick={() => {
                triggerPulse('soft');
                onLink();
              }} 
              className="rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 text-xs hover:bg-white/10"
            >
              Link
            </button>
          </div>

          <div className="mt-4"><HardBar/></div>
        </GlowCard>
      </motion.div>
    </motion.div>
  );
}

export default function ThreadScroller() {
  const {
    threadQueue, softLinksForPost, buildFullHardChainFrom, selectById, edges
  } = useBrainstormStore();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pulse, setPulse] = useState<{ id: string; type: 'hard' | 'soft' } | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Listen for link pulse events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ id: string; type: 'hard' | 'soft' }>).detail;
      setPulse(detail);
      setTimeout(() => setPulse(null), 1600);
    };
    window.addEventListener('linkPulse', handler);
    return () => window.removeEventListener('linkPulse', handler);
  }, []);

  return (
    <div className="relative z-10 p-0 overflow-hidden">
      <div ref={scrollerRef} className="h-[70vh] md:h-[76vh] overflow-auto">
        {threadQueue.map((item, idx) => {
          if (item.kind === 'post' && item.post) {
            const p = item.post;
            const isExpanded = expandedId === p.id;
            const chain = isExpanded ? buildFullHardChainFrom(p.id) : [];
            const softLinks = isExpanded ? softLinksForPost(p.id) : [];

            return (
              <div key={p.id}>
                <FeedCard
                  post={p}
                  expanded={isExpanded}
                  onToggleExpand={() => handleToggleExpand(p.id)}
                  onContinue={() => {
                    window.dispatchEvent(new CustomEvent('pb:brainstorm:continue', { detail: { parentId: p.id }}));
                  }}
                  onLink={() => {
                    window.dispatchEvent(new CustomEvent('pb:brainstorm:link', { detail: { sourceId: p.id }}));
                  }}
                />

                {/* Glowing connector line to next card */}
                {threadQueue[idx + 1] && (() => {
                  const nextPost = threadQueue[idx + 1].post;
                  const isHardLink = edges.find(
                    (e) =>
                      e.source === p.id &&
                      e.target === nextPost?.id &&
                      e.type === 'hard'
                  );
                  const isSoftLink = edges.find(
                    (e) =>
                      e.source === p.id &&
                      e.target === nextPost?.id &&
                      e.type === 'soft'
                  );

                  if (isHardLink || isSoftLink) {
                    return (
                      <motion.div
                        key={`link-${p.id}-${nextPost?.id}`}
                        className="relative mx-auto my-4"
                        style={{ width: '2px', height: '60px' }}
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <div
                          className="absolute inset-0"
                          style={{
                            background: isHardLink
                              ? 'linear-gradient(to bottom, #489FE3, #67FFD8)'
                              : 'repeating-linear-gradient(to bottom, #67FFD8 0px, #FFC85B 4px, transparent 8px, transparent 12px)',
                            boxShadow:
                              '0 0 12px rgba(72,159,227,0.4), 0 0 24px rgba(103,255,216,0.3)',
                          }}
                        />
                        {pulse && pulse.id === p.id && (
                          <LinkPulse type={pulse.type} />
                        )}
                      </motion.div>
                    );
                  }
                  return <div className="h-4" />;
                })()}
                
                {isExpanded && chain.length > 1 && (
                  <div className="mt-2 px-4 text-sm text-slate-300/70">
                    <div className="mb-1">Hard-linked thread ({chain.length} posts):</div>
                    <div className="flex flex-wrap gap-2">
                      {chain.map((n, i) => (
                        <button 
                          key={n.id}
                          onClick={() => selectById(n.id)}
                          className={`rounded-full px-3 py-1 text-xs transition ${
                            n.id === p.id 
                              ? 'bg-primary/20 ring-1 ring-primary text-primary' 
                              : 'bg-white/5 ring-1 ring-white/10 hover:bg-white/10'
                          }`}
                        >
                          {i + 1}. {n.title ?? 'Untitled'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isExpanded && softLinks.length > 0 && (
                  <div className="mt-3 px-4 text-sm">
                    <div className="mb-2 text-slate-300/80">Soft links ({softLinks.length})</div>
                    <div className="flex flex-wrap gap-2">
                      {softLinks.map(x => (
                        <button
                          key={x.id}
                          onClick={() => selectById(x.id)}
                          className="rounded-full bg-white/5 ring-1 ring-white/10 px-3 py-1 text-xs hover:bg-white/10"
                          title={x.post_type || 'Soft link'}
                        >
                          {x.title ?? 'Untitled'} {typeof x.like_count === 'number' ? ` • ❤️ ${x.like_count}` : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
