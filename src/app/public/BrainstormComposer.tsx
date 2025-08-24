import { useState } from 'react';
import { GlassCard } from '@/ui/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Lightbulb } from 'lucide-react';

interface BrainstormComposerProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
  parentId?: string;
}

export function BrainstormComposer({ 
  onSubmit, 
  placeholder = "Share your next big idea...",
  parentId 
}: BrainstormComposerProps) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedText = text.trim();
    if (!trimmedText) return;
    
    setIsSubmitting(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      onSubmit(trimmedText);
      setText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled = !text.trim() || isSubmitting;

  return (
    <GlassCard>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-2 mb-3">
          <Lightbulb className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">
            {parentId ? 'Continue this brainstorm' : 'New Brainstorm'}
          </h3>
        </div>
        
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="min-h-[100px] resize-none border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20"
          disabled={isSubmitting}
        />
        
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            {text.length}/500 characters
          </div>
          
          <Button
            type="submit"
            disabled={isDisabled}
            className="flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}