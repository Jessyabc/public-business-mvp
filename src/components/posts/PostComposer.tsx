// LEGACY – do not extend. Kept temporarily for reference during migration.
// The canonical composer is: src/components/composer/ComposerModal.tsx
// This component is redundant and should not be extended.

import React, { useState } from 'react';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { GlassInput } from '@/components/ui/GlassInput';
import { supabase } from '@/integrations/supabase/client';
import { insertBrainstormPublic, insertInsightForOrg } from '@/data/posts';
import type { Post } from '@/types/post';
import { toast } from 'sonner';

const MAX_CONTENT_LENGTH = 5000;

interface PostComposerProps {
  context: 'public' | 'business';
  orgId?: string;
  onPostCreated?: (post: Post) => void;
}

export const PostComposer: React.FC<PostComposerProps> = ({
  context,
  orgId,
  onPostCreated,
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isPublishDisabled = 
    !content.trim() || 
    content.length > MAX_CONTENT_LENGTH ||
    (context === 'business' && !orgId) ||
    isSubmitting;

  const handlePublish = async () => {
    if (isPublishDisabled) return;

    setIsSubmitting(true);

    try {
      let result;

      if (context === 'public') {
        result = await insertBrainstormPublic(supabase, { content: content.trim() });
      } else if (context === 'business' && orgId) {
        result = await insertInsightForOrg(supabase, {
          org_id: orgId,
          content: content.trim(),
        });
      } else {
        toast.error('Invalid configuration');
        return;
      }

      if (result.error) {
        toast.error(`Failed to publish: ${result.error.message}`);
        return;
      }

      if (result.data) {
        toast.success(context === 'public' ? 'Brainstorm published!' : 'Insight published!');
        setContent('');
        onPostCreated?.(result.data);
      }
    } catch (err) {
      console.error('Error publishing post:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && !isPublishDisabled) {
      e.preventDefault();
      handlePublish();
    }
  };

  const remainingChars = MAX_CONTENT_LENGTH - content.length;
  const isOverLimit = remainingChars < 0;

  return (
    <GlassSurface className="space-y-4 liquid-glass-composer">
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          {context === 'public' ? 'Share a Brainstorm' : 'Share an Insight'}
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          {context === 'public'
            ? 'Share your ideas with the community'
            : 'Share insights with your organization'}
        </p>
      </div>

      <div className="relative">
        <GlassInput
          as="textarea"
          rows={6}
          placeholder={
            context === 'public'
              ? 'What are you thinking about?'
              : 'Share your insights...'
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className={isOverLimit ? 'border-red-500' : ''}
        />
        <div
          className={`absolute bottom-3 right-3 text-xs ${
            isOverLimit
              ? 'text-red-400'
              : remainingChars < 100
              ? 'text-yellow-400'
              : 'text-[var(--text-secondary)]'
          }`}
        >
          {remainingChars.toLocaleString()}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleClear}
          disabled={!content || isSubmitting}
          className="glassButton glassButton--muted disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handlePublish}
          disabled={isPublishDisabled}
          className="glassButton glassButton--accent disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Publishing...' : 'Publish'}
        </button>
      </div>
    </GlassSurface>
  );
};
