import { useState } from 'react';
import { GlobalBackground } from '@/components/layout/GlobalBackground';
import { BrainstormMap } from '@/components/brainstorm/BrainstormMap';
import { Search, Filter, MoreVertical } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * BrainstormFeed - Full-screen brainstorm visualization
 * 
 * Matches the reference design with:
 * - Header with search, filter, involvement score
 * - Horizontal flowchart layout
 * - Connection lines between ideas
 * - Related brainstorms sidebar
 */
export default function BrainstormFeed() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <main className="relative h-screen w-full overflow-hidden flex flex-col text-white">
      <GlobalBackground />
      
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between gap-6 px-8 py-6 border-b border-white/10">
        <h1 className="text-xl font-bold tracking-wide">BRAINSTORM FEED</h1>
        
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:bg-white/10"
          />
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            Filter
          </Button>
          
          <Badge 
            variant="outline" 
            className="border-white/20 text-white/80 px-3 py-1 flex items-center gap-2"
          >
            <div className="w-2 h-2 rounded-full bg-primary" />
            Involvement Score
          </Badge>

          <Button 
            variant="ghost" 
            size="icon"
            className="text-white/80 hover:text-white hover:bg-white/10"
          >
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <section className="relative flex-1 overflow-hidden">
        <BrainstormMap searchQuery={searchQuery} />
      </section>

      {/* Footer Labels */}
      <footer className="relative z-10 flex items-center justify-between px-8 py-4 border-t border-white/10">
        <span className="text-xs text-white/40 tracking-wider uppercase">Public Business</span>
        <span className="text-xs text-white/60">Public Business</span>
      </footer>
    </main>
  );
}
