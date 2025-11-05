import { useEffect, useState } from 'react';
import { GlowCard } from '@/components/ui/GlowCard';
import { likePost, viewPost } from '@/features/brainstorm/adapters/supabaseAdapter';
import { Heart, Eye } from 'lucide-react';
import type { PostNode } from '@/types/brainstorm';

type Props = {
  node: PostNode;
  index: number;
  isExpanded?: boolean;
  onClick?: () => void;
};

function HardPathBar() {
  return (
    <svg className="w-full h-3" viewBox="0 0 600 20" preserveAspectRatio="none">
      <polyline
        points="8,10 592,10"
        fill="none"
        stroke="#489FE3"
        strokeWidth="1.25"
        strokeLinecap="round"
        filter="url(#pb-glow)"
      />
    </svg>
  );
}

export function FeedCard({ node, index, isExpanded = false, onClick }: Props) {
  const [likes, setLikes] = useState(node.likes_count ?? 0);
  const [views, setViews] = useState(node.views_count ?? 0);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    viewPost(node.id).catch(() => {});
    setViews((v) => v + 1);
  }, [node.id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (hasLiked) return;
    try {
      await likePost(node.id);
      setLikes((l) => l + 1);
      setHasLiked(true);
    } catch (err) {
      console.error('Failed to like:', err);
    }
  };

  return (
    <GlowCard 
      className={`mx-3 my-4 relative z-10 cursor-pointer transition-all ${
        isExpanded ? 'ring-2 ring-primary/50 shadow-[0_0_30px_rgba(72,159,227,0.3)]' : ''
      }`}
      onClick={onClick}
    >
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg/7 md:text-xl/8 font-semibold text-slate-100">
            {node.title ?? "Untitled"}
          </h2>
          <div className="flex items-center gap-3 text-sm text-slate-300/80">
            <button
              onClick={handleLike}
              disabled={hasLiked}
              className={`flex items-center gap-1.5 transition ${
                hasLiked ? 'text-red-400' : 'hover:text-red-300'
              }`}
            >
              <Heart className="w-4 h-4" fill={hasLiked ? 'currentColor' : 'none'} />
              <span>{likes}</span>
            </button>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {views}
            </span>
          </div>
        </div>
        {node.content && (
          <p className="mt-3 text-[15px]/7 text-slate-200/90 whitespace-pre-wrap">
            {node.content}
          </p>
        )}
        <div className="mt-4">
          <HardPathBar />
        </div>
      </div>
    </GlowCard>
  );
}
