import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { sanitizeText } from '@/lib/sanitize';

const brainstormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be less than 200 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters').max(5000, 'Content must be less than 5000 characters'),
  is_public: z.boolean(),
  honeypot: z.string().max(0, 'Bot detection triggered'),
});

type BrainstormFormData = z.infer<typeof brainstormSchema>;

interface BrainstormFormProps {
  initialData?: {
    title: string;
    content: string;
    is_public: boolean;
  };
  openIdeaId?: string;
  onSubmit: (data: Omit<BrainstormFormData, 'honeypot'> & { idea_id?: string }) => Promise<void>;
  isEditing?: boolean;
  isSubmitting?: boolean;
}

export function BrainstormForm({ initialData, openIdeaId, onSubmit, isEditing = false, isSubmitting = false }: BrainstormFormProps) {
  const [submitTime] = useState(Date.now());
  const { user } = useAuth();

  const form = useForm<BrainstormFormData>({
    resolver: zodResolver(brainstormSchema),
    defaultValues: {
      title: initialData?.title || '',
      content: initialData?.content || '',
      is_public: initialData?.is_public ?? true,
      honeypot: '',
    },
  });

  const handleSubmit = async (data: BrainstormFormData) => {
    // Bot detection - form submitted too quickly
    if (Date.now() - submitTime < 3000) {
      form.setError('root', { message: 'Please take more time to fill out the form' });
      return;
    }

    if (!user) {
      form.setError('root', { message: 'You must be logged in to create brainstorms' });
      return;
    }

    try {
      await onSubmit({
        title: sanitizeText(data.title),
        content: sanitizeText(data.content),
        is_public: data.is_public,
        idea_id: openIdeaId,
      });
    } catch (error) {
      form.setError('root', { 
        message: error instanceof Error ? error.message : 'Failed to save brainstorm' 
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit Brainstorm' : 'Create New Brainstorm'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Honeypot field - hidden from users */}
            <FormField
              control={form.control}
              name="honeypot"
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  className="absolute left-[-9999px] opacity-0"
                  tabIndex={-1}
                  autoComplete="off"
                />
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a compelling title..." {...field} />
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
                      placeholder="Share your brainstorm ideas, thoughts, and insights..."
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_public"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Make Public</FormLabel>
                    <FormDescription>
                      Public brainstorms can be viewed and commented on by anyone
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.formState.errors.root && (
              <div className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update Brainstorm' : 'Create Brainstorm')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}