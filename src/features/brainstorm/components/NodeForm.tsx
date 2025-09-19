import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Plus, X } from 'lucide-react';
import { useBrainstormStore } from '../store';
import { toast } from '@/hooks/use-toast';
import { BRAINSTORM_WRITES_ENABLED } from '@/config/flags';


const nodeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  content: z.string().min(1, 'Content is required').max(500, 'Content must be less than 500 characters'),
  emoji: z.string().min(1, 'Emoji is required'),
  tags: z.array(z.string()).max(5, 'Maximum 5 tags allowed'),
});

type NodeFormData = z.infer<typeof nodeSchema>;

export function NodeForm({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const { addNode } = useBrainstormStore();

  const form = useForm<NodeFormData>({
    resolver: zodResolver(nodeSchema),
    defaultValues: {
      title: '',
      content: '',
      emoji: '💡',
      tags: [],
    },
  });

  const onSubmit = (data: NodeFormData) => {
    

    if (!BRAINSTORM_WRITES_ENABLED) {
      toast({
        title: 'Draft not saved',
        description: 'Backend not connected - cannot persist ideas',
        variant: 'destructive',
      });
      setOpen(false);
      return;
    }

    try {
      // Add to local state
      addNode({
        title: data.title,
        content: data.content,
        emoji: data.emoji,
        tags: data.tags,
        position: {
          x: Math.random() * 400 - 200,
          y: Math.random() * 300 - 150,
        },
        author: 'Current User', // Would come from auth context
      });

      toast({
        title: 'Idea added!',
        description: 'Your idea has been added to the canvas',
      });

      form.reset();
      setOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add idea',
        variant: 'destructive',
      });
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.getValues('tags').includes(tag) && form.getValues('tags').length < 5) {
      form.setValue('tags', [...form.getValues('tags'), tag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    form.setValue('tags', form.getValues('tags').filter(tag => tag !== tagToRemove));
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent className="glass-surface">
        <SheetHeader>
          <SheetTitle className="text-foreground">Add New Idea</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
            <FormField
              control={form.control}
              name="emoji"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emoji</FormLabel>
                  <FormControl>
                    <Input {...field} className="text-2xl h-12 text-center glass-surface" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Brief title for your idea..." className="glass-surface" />
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
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe your idea in detail..."
                      className="min-h-[100px] glass-surface"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={() => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        className="glass-surface"
                      />
                      <Button type="button" onClick={addTag} size="sm" className="glass-button">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.watch('tags').map((tag) => (
                        <Badge key={tag} variant="secondary" className="glass-surface">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 glass-button">
                Add Idea
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="glass-button"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
