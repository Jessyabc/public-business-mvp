import { memo, useMemo } from 'react';
import { Handle, Position, Node } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Post } from '@/hooks/usePosts';
import { Brain, MessageCircle, Clock, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface BrainstormNodeData extends Record<string, unknown> {
  post: Post;
  onContinue?: () => void;
  onLink?: () => void;
  onExpandSubflow?: () => void;
  subflowDepth?: number;
  hasSubflows?: boolean;
  parentId?: string;
}

export type BrainstormNode = Node<BrainstormNodeData>;

function BrainstormNodeComponent({ data }: { data: BrainstormNodeData }) {
  const { post, subflowDepth = 0, hasSubflows = false, onExpandSubflow } = data;

  const getBrainScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (score >= 70) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    return "bg-purple-500/20 text-purple-400 border-purple-500/30";
  };

  // Generate a brain score based on post engagement
  const brainScore = useMemo(() => {
    const baseScore = Math.min(90, (post.likes_count || 0) * 5 + (post.comments_count || 0) * 10 + (post.views_count || 0) * 2);
    return Math.max(20, baseScore);
  }, [post.likes_count, post.comments_count, post.views_count]);

  // Stable card type based on post ID to prevent constant re-renders
  const cardType = useMemo(() => {
    const hash = post.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const types = ['spark', 'threadline', 'echo'];
    return types[Math.abs(hash) % types.length];
  }, [post.id]);
  
  const nodeScale = 1 - (subflowDepth * 0.15);
  const nodeOpacity = 1 - (subflowDepth * 0.1);
  
  return (
    <div 
      className={`group relative backdrop-blur-xl transition-all duration-500 hover:scale-105 cursor-pointer ${
        subflowDepth > 0 ? 'w-64 max-w-64' : 'w-80 max-w-80'
      } ${
        cardType === 'spark' ? 'glass-card rounded-3xl border border-white/20 hover:border-primary/50' :
        cardType === 'threadline' ? 'glass-card rounded-2xl border border-primary/30 hover:border-primary/70' :
        'glass-card rounded-xl border border-purple-400/30 hover:border-purple-400/70'
      } ${subflowDepth > 0 ? 'border-l-4 border-l-primary/60' : ''}`}
      style={{ 
        transform: `scale(${nodeScale})`,
        opacity: nodeOpacity,
      }}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />
      
      {/* Card Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              cardType === 'spark' ? 'bg-primary/20 text-primary' :
              cardType === 'threadline' ? 'bg-blue-500/20 text-blue-400' :
              'bg-purple-500/20 text-purple-400'
            }`}>
              {cardType === 'spark' ? 'Spark' : cardType === 'threadline' ? 'Threadline' : 'Echo Note'}
            </div>
            <div className="flex items-center gap-1 text-xs text-white/60">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-xs rounded-full ${getBrainScoreColor(brainScore)}`}>
              <Brain className="w-3 h-3 mr-1" />
              {brainScore}
            </Badge>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs rounded-full">
              <MessageCircle className="w-3 h-3 mr-1" />
              {post.comments_count || 0}
            </Badge>
          </div>
        </div>
        
        {/* Content */}
        <p className="text-white text-sm leading-relaxed font-medium mb-4">
          {post.content}
        </p>
        
        {/* Tags and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {subflowDepth > 0 && (
              <span className="px-2 py-1 bg-orange-500/10 text-orange-400 text-xs rounded-full border border-orange-500/20 flex items-center gap-1">
                <Layers className="w-3 h-3" />
                L{subflowDepth}
              </span>
            )}
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">
              Speculative
            </span>
            <span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full border border-purple-500/20">
              Innovation
            </span>
          </div>
          
          {hasSubflows && subflowDepth === 0 && onExpandSubflow && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onExpandSubflow();
              }}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-primary hover:bg-primary/20"
            >
              <ChevronDown className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Depth shadow */}
      <div className="absolute inset-0 rounded-inherit bg-surface/5 pointer-events-none" />
    </div>
  );
}

export default memo(BrainstormNodeComponent);