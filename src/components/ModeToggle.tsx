import { useDiscussLens } from '@/contexts/DiscussLensContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Brain, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// PB Blue for accents
const PB_BLUE = '#4A7C9B';

export function ModeToggle() {
  const { lens, toggleLens } = useDiscussLens();
  const isBusiness = lens === 'business';

  return (
    <div 
      className={cn(
        "flex items-center space-x-3 px-4 py-2 rounded-full transition-all duration-300",
        isBusiness 
          ? "border border-slate-200" 
          : "glass-card"
      )}
      style={isBusiness ? {
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 4px 16px rgba(166, 150, 130, 0.15)'
      } : undefined}
    >
      <div className="flex items-center space-x-2">
        <Brain 
          className="w-4 h-4"
          style={{ color: lens === 'public' ? (isBusiness ? PB_BLUE : '#60a5fa') : (isBusiness ? '#9B9590' : 'var(--muted-foreground)') }}
        />
        <Label 
          htmlFor="mode-toggle" 
          className="text-sm font-medium cursor-pointer"
          style={{ color: lens === 'public' ? (isBusiness ? PB_BLUE : '#60a5fa') : (isBusiness ? '#6B635B' : 'var(--muted-foreground)') }}
        >
          Public
        </Label>
      </div>
      
      <Switch
        id="mode-toggle"
        checked={isBusiness}
        onCheckedChange={toggleLens}
        className={cn(
          isBusiness 
            ? "data-[state=checked]:bg-[#4A7C9B] data-[state=unchecked]:bg-blue-400" 
            : "data-[state=checked]:bg-slate-600 data-[state=unchecked]:bg-blue-600"
        )}
      />
      
      <div className="flex items-center space-x-2">
        <Label 
          htmlFor="mode-toggle" 
          className="text-sm font-medium cursor-pointer"
          style={{ color: isBusiness ? PB_BLUE : (lens === 'business' ? '#cbd5e1' : 'var(--muted-foreground)') }}
        >
          Business
        </Label>
        <Building2 
          className="w-4 h-4"
          style={{ color: isBusiness ? PB_BLUE : (lens === 'business' ? '#cbd5e1' : 'var(--muted-foreground)') }}
        />
      </div>
    </div>
  );
}
