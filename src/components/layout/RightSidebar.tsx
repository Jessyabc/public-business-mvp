import { Clock, Lightbulb } from 'lucide-react';

interface RightSidebarProps {
  variant?: 'default' | 'feed';
}

/**
 * RightSidebar - Activity feed for brainstorm page
 * 
 * Displays:
 * - History: Recent brainstorm activity
 * - Open Ideas: Public idea submissions
 * 
 * Designed to fit within the glass-styled layout
 */
export function RightSidebar({ variant = 'default' }: RightSidebarProps) {
  return (
    <div className="h-full w-full flex flex-col">
      {/* History Section */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary/60" />
          <h2 className="text-lg font-semibold text-white/90">History</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarGutter: 'stable' }}>
          <style>{`
            .no-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .no-scrollbar::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.05);
              border-radius: 3px;
            }
            .no-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.2);
              border-radius: 3px;
            }
            .no-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.3);
            }
          `}</style>
          <div className="rounded-xl bg-white/10 p-3 text-sm text-white/70 hover:bg-white/15 transition-colors cursor-pointer">
            No recent brainstorms yet.
          </div>
        </div>
      </div>

      {/* Open Ideas Section */}
      <div className="flex-1 flex flex-col border-t border-white/10">
        <div className="p-4 border-b border-white/10 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary/60" />
          <h2 className="text-lg font-semibold text-white/90">Open Ideas</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
          <div className="rounded-xl bg-white/10 p-3 text-sm text-white/70 hover:bg-white/15 transition-colors cursor-pointer">
            No open ideas yet.
          </div>
        </div>
      </div>
    </div>
  );
}

export default RightSidebar;
