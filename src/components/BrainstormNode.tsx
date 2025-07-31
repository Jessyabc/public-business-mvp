import { memo } from 'react';
import { Handle, Position, Node } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Brainstorm } from '@/types/brainstorm';
import { Brain, MessageCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BrainstormNodeData extends Record<string, unknown> {
  brainstorm: Brainstorm;
}

export type BrainstormNode = Node<BrainstormNodeData>;

function BrainstormNodeComponent({ data }: { data: BrainstormNodeData }) {
  const { brainstorm } = data;

  const getBrainScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (score >= 70) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    return "bg-purple-500/20 text-purple-400 border-purple-500/30";
  };

  return (
    <div className="glass-card rounded-3xl border border-white/20 w-80 max-w-80 backdrop-blur-xl hover:border-[#489FE3]/50 transition-all duration-300 hover:scale-105">
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(brainstorm.timestamp, { addSuffix: true })}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`text-xs rounded-full ${getBrainScoreColor(brainstorm.brainScore)}`}>
              <Brain className="w-3 h-3 mr-1" />
              {brainstorm.brainScore}
            </Badge>
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs rounded-full">
              <MessageCircle className="w-3 h-3 mr-1" />
              {brainstorm.threadCount}
            </Badge>
          </div>
        </div>
        
        <p className="text-white text-sm leading-relaxed font-medium">
          {brainstorm.content}
        </p>
      </div>
    </div>
  );
}

export default memo(BrainstormNodeComponent);