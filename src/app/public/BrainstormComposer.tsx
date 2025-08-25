import { useState, useRef } from 'react';
import { GlassCard } from '@/ui/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Lightbulb } from 'lucide-react';

interface BrainstormComposerProps {
  onSubmit: (text: string) => Promise<void>;
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedText = text.trim();
    if (!trimmedText || isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(trimmedText);
      setText('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to submit brainstorm:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const isDisabled = !text.trim() || isSubmitting;
  const charCount = text.length;
  const maxChars = 500;

  return (
    <GlassCard>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">
            {parentId ? 'Continue this brainstorm' : 'New Brainstorm'}
          </h3>
        </div>
        
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          placeholder={placeholder}
          className="min-h-[80px] max-h-[120px] resize-none border-0 bg-transparent text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 transition-all"
          disabled={isSubmitting}
          maxLength={maxChars}
          aria-label={parentId ? 'Continue brainstorm' : 'New brainstorm'}
        />
        
        <div className="flex justify-between items-center">
          <div className={`text-xs transition-colors ${
            charCount > maxChars * 0.9 
              ? 'text-destructive' 
              : charCount > maxChars * 0.7 
                ? 'text-warning' 
                : 'text-muted-foreground'
          }`}>
            {charCount}/{maxChars} characters
          </div>
          
          <Button
            type="submit"
            disabled={isDisabled}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Posting...' : 'Post'}</span>
          </Button>
        </div>
      </form>
    </GlassCard>
  );
}