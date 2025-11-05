import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useBrainstormStore } from '../store';
import { toast } from '@/hooks/use-toast';
import { BRAINSTORM_WRITES_ENABLED } from '@/config/flags';
import { supabase } from '@/integrations/supabase/client';
import { GlassCard } from '@/ui/components/GlassCard';

const nodeSchema = z.object({
  title: z.string().max(100, 'Title must be less than 100 characters').optional(),
  content: z.string().min(10, 'Content must be at least 10 characters').max(1000, 'Content must be less than 1000 characters'),
});

type NodeFormData = z.infer<typeof nodeSchema>;

type NodeFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'root' | 'continue';
  parentId?: string | null;
};

export function NodeForm({ open, onOpenChange, mode, parentId }: NodeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addNodeOptimistic, addEdgeOptimistic, setLastCreatedId } = useBrainstormStore();

  const form = useForm<NodeFormData>({
    resolver: zodResolver(nodeSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });

  const onSubmit = async (data: NodeFormData) => {
    if (!BRAINSTORM_WRITES_ENABLED) {
      toast({
        title: 'Writes disabled',
        description: 'Brainstorm creation is currently disabled',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Determine kind based on mode
      const kind = mode === 'root' ? 'Spark' : 'Spark';
      const parent_post_id = mode === 'continue' ? parentId : null;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Not authenticated',
          description: 'You must be logged in to create brainstorms',
          variant: 'destructive',
        });
        return;
      }

      // Insert into posts table
      const { data: newPost, error } = await supabase
        .from('posts')
        .insert([{
          kind,
          title: data.title || null,
          content: data.content,
          body: data.content,
          type: 'brainstorm',
          mode: 'public',
          visibility: 'public',
          status: 'active', // Auto-approve in dev
          user_id: user.id,
        }])
        .select('*')
        .single();

      if (error) {
        console.error('Insert error:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to create brainstorm',
          variant: 'destructive',
        });
        return;
      }

      // If continue mode, create the relation
      if (mode === 'continue' && parentId && newPost) {
        const { error: relationError } = await supabase
          .from('post_relations')
          .insert([{
            parent_post_id: parentId,
            child_post_id: newPost.id,
            relation_type: 'hard',
          }]);

        if (relationError) {
          console.error('Relation error:', relationError);
          // Don't fail the whole operation, just log
        }
      }

      // Optimistic update to store
      if (newPost) {
        addNodeOptimistic({
          id: newPost.id,
          title: newPost.title || '',
          content: newPost.content,
          created_at: newPost.created_at,
          user_id: newPost.user_id,
        });

        if (mode === 'continue' && parentId) {
          addEdgeOptimistic({
            parent_post_id: parentId,
            child_post_id: newPost.id,
            relation_type: 'hard',
          });
        }

        setLastCreatedId(newPost.id);
      }

      toast({
        title: 'Success!',
        description: mode === 'root' ? 'New brainstorm created' : 'Brainstorm continued',
      });

      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[var(--card-bg)] backdrop-blur-xl border-white/20 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            {mode === 'root' ? 'New Brainstorm' : 'Continue Brainstorm'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/90">Title (optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Brief title..."
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white/90">Content *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your idea..."
                      className="min-h-[120px] bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-white/60 mt-1">
                    {field.value?.length || 0} / 1000 characters
                  </p>
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#3aa0ff]/30 hover:bg-[#3aa0ff]/40 text-white border border-[#3aa0ff]/40 backdrop-blur-sm"
              >
                {isSubmitting ? 'Creating...' : mode === 'root' ? 'Create' : 'Continue'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
