import { Plus, Link, Search, Eye, EyeOff, Maximize, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useBrainstormStore } from '../store';

export function Toolbar() {
  const {
    searchTerm,
    showHardEdges,
    showSoftEdges,
    isCreatingLink,
    nodes,
    edges,
    setSearchTerm,
    toggleHardEdges,
    toggleSoftEdges,
    setCreatingLink,
    fitToView,
    autoArrange,
  } = useBrainstormStore();

  return (
    <div className="flex items-center justify-between p-4 glass-surface border-b border-border/50">
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          onClick={() => {
            // This would open NodeForm in the actual implementation
            console.log('Add idea clicked');
          }}
          className="glass-button"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Idea
        </Button>

        <Button
          size="sm"
          variant={isCreatingLink ? 'default' : 'secondary'}
          onClick={() => setCreatingLink(!isCreatingLink)}
          className="glass-button"
          disabled={nodes.length < 2}
        >
          <Link className="w-4 h-4 mr-2" />
          Link
        </Button>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={showHardEdges ? 'default' : 'secondary'}
            onClick={toggleHardEdges}
            className="glass-button"
          >
            <Eye className="w-4 h-4 mr-1" />
            Hard
          </Button>
          <Button
            size="sm"
            variant={showSoftEdges ? 'default' : 'secondary'}
            onClick={toggleSoftEdges}
            className="glass-button"
          >
            <EyeOff className="w-4 h-4 mr-1" />
            Soft
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search ideas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-40 pl-9 glass-surface"
          />
        </div>

        <Badge variant="secondary" className="glass-surface">
          {nodes.length} ideas, {edges.length} links
        </Badge>

        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={fitToView}
            className="glass-button"
          >
            <Maximize className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={autoArrange}
            className="glass-button"
          >
            <Shuffle className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}