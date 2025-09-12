import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeText } from '@/lib/sanitize';
import { useAuth } from '@/contexts/AuthContext';

const openIdeaSchema = z.object({
  content: z.string()
    .min(20, 'Idea must be at least 20 characters')
    .max(2000, 'Idea must be less than 2000 characters'),
  notify_on_interaction: z.boolean(),
  subscribe_newsletter: z.boolean(),
  honeypot: z.string().max(0, 'Bot detection triggered'),
});

type OpenIdeaFormData = z.infer<typeof openIdeaSchema>;

export default function OpenIdeaNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [submitTime] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OpenIdeaFormData>({
    resolver: zodResolver(openIdeaSchema),
    defaultValues: {
      content: '',
      notify_on_interaction: false,
      subscribe_newsletter: false,
      honeypot: '',
    },
  });

  const handleSubmit = async (data: OpenIdeaFormData) => {
    // Bot detection - form submitted too quickly
    if (Date.now() - submitTime < 2000) {
      form.setError('root', { message: 'Please take more time to fill out the form' });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('open_ideas').insert({
        content: sanitizeText(data.content),
        notify_on_interaction: data.notify_on_interaction,
        subscribe_newsletter: data.subscribe_newsletter,
        user_id: user?.id || null,
        status: 'pending', // Will be reviewed by admins
      });

      if (error) throw error;

      // Track analytics if user consented
      if (user) {
        await supabase.from('analytics_events').insert({
          event_name: 'open_idea_submitted',
          user_id: user.id,
          properties: {
            has_account: true,
            notify_on_interaction: data.notify_on_interaction,
            subscribe_newsletter: data.subscribe_newsletter,
          },
        });
      }

      setSubmitted(true);
    } catch (error) {
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Failed to submit idea'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 mx-auto mb-6 text-green-500" />
          <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
          <p className="text-muted-foreground mb-6">
            Your idea has been submitted successfully. Our team will review it and, 
            if approved, it will be added to the Open Ideas Bank for the community to explore.
          </p>
          
          {!user && (
            <div className="bg-muted rounded-lg p-6 mb-6">
              <h3 className="font-semibold mb-2">Want to see your idea in action?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create an account to access the full Ideas Bank and see how others 
                build upon community submissions like yours.
              </p>
              <Link to="/auth">
                <Button>Create Free Account</Button>
              </Link>
            </div>
          )}

          <div className="space-y-4">
            <Link to="/open-ideas">
              <Button variant="outline">
                Explore Ideas Bank
              </Button>
            </Link>
            <Link to="/brainstorms">
              <Button variant="outline">
                Browse Brainstorms
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Link to="/open-ideas">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Open Ideas
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Submit an Open Idea</CardTitle>
          <p className="text-muted-foreground">
            Share an idea, problem, or concept with our community. 
            If approved, it will join our Ideas Bank to inspire others.
          </p>
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
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Idea</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your idea, problem to solve, or concept you'd like others to explore..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Be descriptive but concise. Great ideas often come from real problems or interesting "what if" scenarios.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notify_on_interaction"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Notify me when someone builds on this idea
                      </FormLabel>
                      <FormDescription>
                        Get an email when community members create brainstorms inspired by your idea
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subscribe_newsletter"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Subscribe to community updates
                      </FormLabel>
                      <FormDescription>
                        Receive occasional emails about new features and community highlights
                      </FormDescription>
                    </div>
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
                {isSubmitting ? 'Submitting...' : 'Submit Idea'}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                By submitting, you agree that your idea may be shared publicly 
                in our Ideas Bank for others to build upon.
              </p>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}