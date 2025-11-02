import { Sparkles } from 'lucide-react';

/**
 * BrainstormMap - Hierarchical visualization placeholder
 * 
 * Displays a central main idea with connected continuation nodes
 * Ready for real data integration via useBrainstorms hook
 */
export function BrainstormMap() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full text-center space-y-6 p-8">
      {/* Main Brainstorm Idea */}
      <div className="flex flex-col items-center space-y-3">
        <Sparkles className="w-10 h-10 text-primary/60" />
        <div className="text-3xl font-semibold text-white/90">
          Main Brainstorm Idea
        </div>
        <p className="text-sm text-white/60 max-w-md">
          This space will display the hierarchical brainstorm structure
        </p>
      </div>

      {/* Connection indicator */}
      <div className="w-px h-12 bg-gradient-to-b from-primary/40 to-transparent" />

      {/* Continuing Ideas */}
      <div className="flex flex-col space-y-3 text-sm text-white/70 w-full max-w-md">
        <div className="rounded-xl bg-white/10 px-4 py-3 hover:bg-white/15 transition-colors">
          Continuing the idea
        </div>
        <div className="rounded-xl bg-white/10 px-4 py-3 hover:bg-white/15 transition-colors">
          Idea continuation
        </div>
        <div className="rounded-xl bg-white/10 px-4 py-3 hover:bg-white/15 transition-colors">
          Another branch
        </div>
      </div>
    </div>
  );
}
