import { GitBranch, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BrainstormMapProps {
  searchQuery?: string;
}

/**
 * BrainstormMap - Horizontal flowchart visualization
 * 
 * Displays brainstorms in a connected flowchart layout:
 * - Main idea (large card on left)
 * - Connected child ideas (middle flow)
 * - Related brainstorms (right sidebar)
 */
export function BrainstormMap({ searchQuery }: BrainstormMapProps) {
  return (
    <div className="h-full w-full overflow-auto p-8" style={{ scrollbarGutter: 'stable' }}>
      <style>{`
        .brainstorm-scroll::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .brainstorm-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .brainstorm-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .brainstorm-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        /* Connection line */
        .connection-line {
          position: relative;
        }
        .connection-line::before {
          content: '';
          position: absolute;
          top: 50%;
          left: -40px;
          width: 40px;
          height: 2px;
          background: linear-gradient(to right, transparent, rgba(139, 92, 246, 0.3));
        }
      `}</style>

      <div className="min-w-max flex items-start gap-12 pb-8">
        {/* Main Brainstorm Idea */}
        <div className="flex flex-col gap-6">
          <div className="w-[400px] h-[280px] rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(139,92,246,0.15)] p-8 flex flex-col justify-between hover:border-primary/30 transition-all duration-300">
            <div>
              <h2 className="text-4xl font-bold text-white/90 mb-4 leading-tight">
                Main<br />
                Brainstorm<br />
                Idea
              </h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <GitBranch className="w-4 h-4" />
              <span>2 replies</span>
            </div>
          </div>

          {/* Secondary card below main */}
          <div className="w-[400px] h-[220px] rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-6 hover:bg-white/10 transition-colors">
            <div className="space-y-3">
              <div className="h-3 w-3/4 bg-white/20 rounded-full" />
              <div className="h-3 w-full bg-white/20 rounded-full" />
              <div className="h-3 w-2/3 bg-white/20 rounded-full" />
            </div>
          </div>
        </div>

        {/* Middle Flow - Connected Ideas */}
        <div className="flex flex-col gap-6 pt-12">
          {/* Medium-impact card */}
          <div className="connection-line w-[280px] h-[180px] rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-6 flex flex-col justify-between hover:bg-white/10 transition-all duration-200">
            <h3 className="text-xl font-semibold text-white/90">
              Medium-impact<br />
              Brainstorm
            </h3>
            <div className="h-2 w-1/2 bg-white/20 rounded-full" />
          </div>

          {/* Connection vertical line */}
          <div className="flex justify-center">
            <div className="w-px h-16 bg-gradient-to-b from-primary/30 to-primary/10" />
          </div>

          {/* Continuing the idea card */}
          <div className="connection-line w-[280px] h-[180px] rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-6 flex flex-col justify-between hover:bg-white/10 transition-all duration-200">
            <h3 className="text-xl font-semibold text-white/90">
              Continuing<br />
              the idea
            </h3>
            <div className="h-2 w-1/2 bg-white/20 rounded-full" />
          </div>

          {/* Small continuation badges to the right */}
          <div className="absolute left-[320px] top-[200px] flex flex-col gap-3">
            <Badge 
              variant="outline" 
              className="border-white/20 bg-white/5 text-white/70 text-xs px-3 py-1 rounded-lg"
            >
              Idea continuation
            </Badge>
            <Badge 
              variant="outline" 
              className="border-white/20 bg-white/5 text-white/70 text-xs px-3 py-1 rounded-lg"
            >
              Idea continuation
            </Badge>
            <Badge 
              variant="outline" 
              className="border-white/20 bg-white/5 text-white/70 text-xs px-3 py-1 rounded-lg"
            >
              Idea continuation
            </Badge>
            <Badge 
              variant="outline" 
              className="border-white/20 bg-white/5 text-white/70 text-xs px-3 py-1 rounded-lg"
            >
              Idea continuation
            </Badge>
          </div>

          {/* Connection vertical line */}
          <div className="flex justify-center">
            <div className="w-px h-16 bg-gradient-to-b from-primary/10 to-transparent" />
          </div>

          {/* Small continuation card */}
          <div className="connection-line w-[240px] h-[140px] rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-5 flex flex-col justify-center hover:bg-white/10 transition-all duration-200">
            <p className="text-sm text-white/70">
              idea<br />
              continuation
            </p>
          </div>
        </div>

        {/* Right Sidebar - Related Brainstorms */}
        <div className="flex flex-col gap-4 pt-12">
          <div className="w-[260px] h-[180px] rounded-3xl bg-gradient-to-br from-violet-500/15 to-primary/10 backdrop-blur-md border border-white/10 p-6 flex flex-col justify-between hover:border-primary/30 transition-all duration-200">
            <h3 className="text-xl font-semibold text-white/90">
              Collective<br />
              Curiosity Field
            </h3>
          </div>

          <div className="w-[220px] h-[140px] rounded-2xl bg-gradient-to-br from-blue-500/15 to-blue-600/10 backdrop-blur-md border border-white/10 p-5 flex flex-col justify-between hover:border-blue-400/30 transition-all duration-200">
            <h4 className="text-lg font-semibold text-white/90">AI</h4>
            <p className="text-xs text-white/60">related brainstorms</p>
          </div>

          <div className="w-[220px] h-[140px] rounded-2xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 backdrop-blur-md border border-white/10 p-5 flex flex-col justify-between hover:border-emerald-400/30 transition-all duration-200">
            <h4 className="text-lg font-semibold text-white/90">Sustainability</h4>
            <p className="text-xs text-white/60">related brainstorms</p>
          </div>

          <div className="w-[220px] h-[140px] rounded-2xl bg-gradient-to-br from-purple-500/15 to-purple-600/10 backdrop-blur-md border border-white/10 p-5 flex flex-col justify-between hover:border-purple-400/30 transition-all duration-200">
            <h4 className="text-lg font-semibold text-white/90">Psychology</h4>
            <p className="text-xs text-white/60">related brainstorms</p>
          </div>
        </div>
      </div>
    </div>
  );
}
