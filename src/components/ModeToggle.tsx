import { useAppMode } from '@/contexts/AppModeContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Brain, Building2 } from 'lucide-react';

export function ModeToggle() {
  const { mode, toggleMode } = useAppMode();

  return (
    <div className="flex items-center space-x-3 glass-card px-4 py-2 rounded-full">
      <div className="flex items-center space-x-2">
        <Brain className={`w-4 h-4 ${mode === 'public' ? 'text-blue-400' : 'text-muted-foreground'}`} />
        <Label htmlFor="mode-toggle" className={`text-sm font-medium ${mode === 'public' ? 'text-blue-400' : 'text-muted-foreground'}`}>
          Public
        </Label>
      </div>
      
      <Switch
        id="mode-toggle"
        checked={mode === 'business'}
        onCheckedChange={toggleMode}
        className="data-[state=checked]:bg-slate-600 data-[state=unchecked]:bg-blue-600"
      />
      
      <div className="flex items-center space-x-2">
        <Label htmlFor="mode-toggle" className={`text-sm font-medium ${mode === 'business' ? 'text-slate-300' : 'text-muted-foreground'}`}>
          Business
        </Label>
        <Building2 className={`w-4 h-4 ${mode === 'business' ? 'text-slate-300' : 'text-muted-foreground'}`} />
      </div>
    </div>
  );
}