import { useUIModeStore } from '@/stores/uiModeStore';
import { GlassCard } from '@/ui/components/GlassCard';
import { Brain, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ModeSwitcher() {
  const { uiMode, setUiMode } = useUIModeStore();

  return (
    <GlassCard className="flex items-center p-2 space-x-1">
      <button
        onClick={() => setUiMode('public')}
        className={cn(
          'flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200',
          uiMode === 'public'
            ? 'bg-primary text-primary-foreground shadow-lg'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <Brain className="w-4 h-4" />
        <span className="text-sm font-medium">Public</span>
      </button>
      
      <button
        onClick={() => setUiMode('business')}
        className={cn(
          'flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200',
          uiMode === 'business'
            ? 'bg-primary text-primary-foreground shadow-lg'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        <span className="text-sm font-medium">Business</span>
        <Building2 className="w-4 h-4" />
      </button>
    </GlassCard>
  );
}