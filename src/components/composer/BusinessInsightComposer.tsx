import { useState, useMemo, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { FileText, X, Link2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useOrgMembership } from '@/hooks/useOrgMembership';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { buildBusinessInsightPayload } from '@/lib/posts';
import { generateSuggestedTitle } from '@/lib/utils/generateTitle';
import { z } from 'zod';
import { cn } from '@/lib/utils';

// Minimal schema for the refactored form
const minimalBusinessInsightSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  whatHappened: z.string()
    .max(5000, 'Description must be less than 5000 characters')
    .optional(),
  insight1: z.string()
    .max(2000, 'Insight must be less than 2000 characters')
    .optional(),
  relatedSparks: z.array(z.string()).optional(),
});

type MinimalBusinessInsightFormData = z.infer<typeof minimalBusinessInsightSchema>;

interface BusinessInsightComposerProps {
  onClose: () => void;
}

export function BusinessInsightComposer({ onClose }: BusinessInsightComposerProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: memberships, isLoading: isLoadingMemberships } = useOrgMembership();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSparkSelector, setShowSparkSelector] = useState(false);
  const [availableSparks, setAvailableSparks] = useState<any[]>([]);
  const [sparkSearchQuery, setSparkSearchQuery] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [hasManuallyEditedTitle, setHasManuallyEditedTitle] = useState(false);

  // Determine org_id: use selected, or first membership if single, or null
  const orgId = useMemo(() => {
    if (selectedOrgId) return selectedOrgId;
    if (memberships && memberships.length === 1) {
      return memberships[0].org_id;
    }
    return null;
  }, [selectedOrgId, memberships]);

  // Auto-select first org if only one membership
  useEffect(() => {
    if (memberships && memberships.length === 1 && !selectedOrgId) {
      setSelectedOrgId(memberships[0].org_id);
    }
  }, [memberships, selectedOrgId]);

  const form = useForm<MinimalBusinessInsightFormData>({
    resolver: zodResolver(minimalBusinessInsightSchema),
    defaultValues: {
      title: '',
      whatHappened: '',
      insight1: '',
      relatedSparks: [],
    },
  });

  const whatHappened = form.watch('whatHappened') || '';
  const insight1 = form.watch('insight1') || '';
  const relatedSparks = form.watch('relatedSparks') || [];
  const title = form.watch('title');
  
  // Generate suggested title from Insight 1
  const suggestedTitle = generateSuggestedTitle(insight1);
  
  // Auto-fill title if user hasn't manually edited it yet
  useEffect(() => {
    if (!hasManuallyEditedTitle && suggestedTitle && suggestedTitle !== title) {
      form.setValue('title', suggestedTitle, { shouldValidate: false });
    }
  }, [suggestedTitle, hasManuallyEditedTitle, title, form]);

  // Load available Sparks for linking with search
  useEffect(() => {
    if (showSparkSelector) {
      loadSparks();
    }
  }, [showSparkSelector, sparkSearchQuery]);

  const loadSparks = async () => {
    try {
      let query = supabase
        .from('posts')
        .select('id, title, content, created_at')
        .eq('type', 'brainstorm')
        .eq('kind', 'Spark')
        .eq('mode', 'public')
        .eq('visibility', 'public')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);

      if (sparkSearchQuery.trim()) {
        query = query.or(`title.ilike.%${sparkSearchQuery}%,content.ilike.%${sparkSearchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAvailableSparks(data || []);
    } catch (err) {
      console.error('Failed to load sparks:', err);
      toast.error('Failed to load sparks');
    }
  };

  const toggleSpark = (sparkId: string) => {
    const current = relatedSparks;
    if (current.includes(sparkId)) {
      form.setValue('relatedSparks', current.filter(id => id !== sparkId));
    } else {
      form.setValue('relatedSparks', [...current, sparkId]);
    }
  };

  // Validation helpers
  const hasDraftContent = useMemo(() => {
    const hasWhatHappened = whatHappened.trim().length > 0;
    const hasInsight1 = insight1.trim().length > 0;
    return hasWhatHappened || hasInsight1;
  }, [whatHappened, insight1]);

  const canPublish = useMemo(() => {
    const hasWhatHappened = whatHappened.trim().length >= 1;
    const hasInsight1 = insight1.trim().length >= 1;
    return hasWhatHappened && hasInsight1;
  }, [whatHappened, insight1]);

  const handleSaveDraft = async () => {
    if (!user) {
      toast.error('Authentication required');
      return;
    }

    if (!hasDraftContent) {
      toast.error('Please add content to save as draft');
      return;
    }

    if (!orgId) {
      if (!memberships || memberships.length === 0) {
        toast.error('You must be a member of an organization to create business insights');
      } else {
        toast.error('Please select an organization');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      // Build metadata with minimal data
      const metadata = {
        insights: insight1.trim() ? [insight1.trim()] : [],
      };

      // Build the main content from whatHappened or use insight1 as fallback
      const content = whatHappened.trim() || insight1.trim() || 'Draft';

      const payload = buildBusinessInsightPayload({
        userId: user.id,
        orgId,
        content,
        title: title.trim() || 'Untitled',
        metadata,
      });

      // Draft: status='active' but no published_at
      payload.status = 'active';
      payload.published_at = null;

      const { data: newPost, error } = await supabase
        .from('posts')
        .insert(payload)
        .select('id')
        .single();

      if (error) throw error;

      // Create cross_link relations for Sparks
      if (relatedSparks && relatedSparks.length > 0 && newPost?.id) {
        const relationPromises = relatedSparks.map((sparkId) =>
          supabase.rpc('create_post_relation', {
            p_parent_post_id: sparkId,
            p_child_post_id: newPost.id,
            p_relation_type: 'cross_link',
          })
        );

        await Promise.allSettled(relationPromises);
      }

      toast.success('Draft saved successfully');
      onClose();
    } catch (error: any) {
      console.error('Error saving draft:', error);
      toast.error(error?.message || 'Failed to save draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!user) {
      toast.error('Authentication required');
      return;
    }

    if (!canPublish) {
      toast.error('Please add both "What happened" and "Insight 1" to publish');
      return;
    }

    if (!orgId) {
      if (!memberships || memberships.length === 0) {
        toast.error('You must be a member of an organization to create business insights');
      } else {
        toast.error('Please select an organization');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      // Build metadata with minimal data
      const metadata = {
        insights: [insight1.trim()],
      };

      const payload = buildBusinessInsightPayload({
        userId: user.id,
        orgId,
        content: whatHappened.trim(),
        title: title.trim(),
        metadata,
      });

      // Published: set published_at
      payload.published_at = new Date().toISOString();

      const { data: newPost, error } = await supabase
        .from('posts')
        .insert(payload)
        .select('id')
        .single();

      if (error) throw error;

      // Create cross_link relations for Sparks
      if (relatedSparks && relatedSparks.length > 0 && newPost?.id) {
        const relationPromises = relatedSparks.map((sparkId) =>
          supabase.rpc('create_post_relation', {
            p_parent_post_id: sparkId,
            p_child_post_id: newPost.id,
            p_relation_type: 'cross_link',
          })
        );

        const relationResults = await Promise.allSettled(relationPromises);
        const failedRelations = relationResults.filter((r) => r.status === 'rejected');
        
        if (failedRelations.length > 0) {
          console.error('Some relations failed to create:', failedRelations);
          toast.warning(`Insight published but ${failedRelations.length} link(s) failed`);
        }
      }

      toast.success('Business Insight published successfully');
      onClose();
      navigate(`/brainstorm/feed?post=${newPost.id}`);
    } catch (error: any) {
      console.error('Error publishing insight:', error);
      toast.error(error?.message || 'Failed to publish insight');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form 
        className="flex flex-col h-full max-h-[85vh] bg-[var(--neuro-bg)] rounded-2xl"
        style={{
          boxShadow: '8px 8px 20px rgba(166, 150, 130, 0.3), -8px -8px 20px rgba(255, 255, 255, 0.85)'
        }}
        data-theme="business"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#D4CEC5]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-[#3A3530]" />
              <h3 className="text-lg font-semibold text-[#3A3530]">New Business Insight</h3>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="space-y-6 p-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#3A3530] font-medium text-sm">
                    {hasManuallyEditedTitle ? 'Title *' : 'Suggested title (editable) *'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Clear, factual title (not clickbait)..."
                      {...field}
                      maxLength={200}
                      onChange={(e) => {
                        field.onChange(e);
                        if (!hasManuallyEditedTitle && e.target.value !== suggestedTitle) {
                          setHasManuallyEditedTitle(true);
                        }
                      }}
                      className="text-[#3A3530] placeholder:text-[#6B635B]"
                    />
                  </FormControl>
                  <div className="text-xs text-[#6B635B] text-right mt-1">
                    {field.value?.length || 0} / 200
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* What Actually Happened - Largest input */}
            <FormField
              control={form.control}
              name="whatHappened"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#3A3530] font-medium text-sm">What actually happened? *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the experiment, decision, or change in detail..."
                      className="min-h-[200px]"
                      maxLength={5000}
                      style={{
                        boxShadow: 'inset 6px 6px 12px rgba(163, 177, 198, 0.5), inset -6px -6px 12px rgba(255, 255, 255, 0.6)'
                      }}
                      {...field}
                    />
                  </FormControl>
                  <div className="text-xs text-[#6B635B] text-right mt-1">
                    {field.value?.length || 0} / 5000
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Insight 1 - Second largest input */}
            <FormField
              control={form.control}
              name="insight1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#3A3530] font-medium text-sm">Insight 1 *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What did you learn?"
                      className="min-h-[150px]"
                      maxLength={2000}
                      style={{
                        boxShadow: 'inset 6px 6px 12px rgba(163, 177, 198, 0.5), inset -6px -6px 12px rgba(255, 255, 255, 0.6)'
                      }}
                      {...field}
                    />
                  </FormControl>
                  <div className="text-xs text-[#6B635B] text-right mt-1">
                    {field.value?.length || 0} / 2000
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Linked Sparks - Visible and lightweight */}
            <div 
              className="p-4 space-y-3 rounded-lg bg-[var(--neuro-bg)]"
              style={{
                boxShadow: 'inset 6px 6px 12px rgba(163, 177, 198, 0.5), inset -6px -6px 12px rgba(255, 255, 255, 0.6)'
              }}
            >
              <div className="flex items-center justify-between">
                <Label className="text-[#3A3530] font-medium text-sm flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-[#3A3530]" />
                  Linked Sparks (Optional)
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowSparkSelector(!showSparkSelector);
                    if (!showSparkSelector) loadSparks();
                  }}
                  className="text-xs"
                >
                  {showSparkSelector ? 'Hide' : 'Show'} ({relatedSparks.length})
                </Button>
              </div>

              {/* Selected Sparks as chips */}
              {relatedSparks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {relatedSparks.map((id) => {
                    const spark = availableSparks.find((s) => s.id === id);
                    return (
                      <Badge 
                        key={id} 
                        variant="secondary" 
                        className="text-xs gap-1.5 bg-[var(--neuro-bg)] border-0 text-[#3A3530] px-3 py-1.5 rounded-lg"
                        style={{
                          boxShadow: '8px 8px 16px rgba(163, 177, 198, 0.6), -8px -8px 16px rgba(255, 255, 255, 0.8)'
                        }}
                      >
                        <span className="truncate max-w-[200px]">{spark?.title || 'Untitled'}</span>
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors flex-shrink-0"
                          onClick={() => toggleSpark(id)}
                        />
                      </Badge>
                    );
                  })}
                </div>
              )}

              {/* Spark Selector */}
              {showSparkSelector && (
                <div className="space-y-3">
                  {/* Search input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                    <Input
                      type="text"
                      placeholder="Search Sparks..."
                      value={sparkSearchQuery}
                      onChange={(e) => setSparkSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Spark list */}
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-1.5 pr-2">
                      {availableSparks.map((spark) => (
                        <button
                          key={spark.id}
                          type="button"
                          onClick={() => toggleSpark(spark.id)}
                          className={cn(
                            "w-full text-left p-3 rounded-lg text-sm transition-all duration-200 text-foreground bg-[var(--neuro-bg)]"
                          )}
                          style={{
                            boxShadow: relatedSparks.includes(spark.id)
                              ? 'inset 6px 6px 12px rgba(163, 177, 198, 0.5), inset -6px -6px 12px rgba(255, 255, 255, 0.6)'
                              : '8px 8px 16px rgba(163, 177, 198, 0.6), -8px -8px 16px rgba(255, 255, 255, 0.8)'
                          }}
                          onMouseEnter={(e) => {
                            if (!relatedSparks.includes(spark.id)) {
                              e.currentTarget.style.boxShadow = 'inset 6px 6px 12px rgba(163, 177, 198, 0.5), inset -6px -6px 12px rgba(255, 255, 255, 0.6)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!relatedSparks.includes(spark.id)) {
                              e.currentTarget.style.boxShadow = '8px 8px 16px rgba(163, 177, 198, 0.6), -8px -8px 16px rgba(255, 255, 255, 0.8)';
                            }
                          }}
                        >
                          <div className="font-medium line-clamp-1 mb-0.5">
                            {spark.title || 'Untitled'}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {spark.content}
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Actions - Fixed at bottom */}
        <div className="border-t border-black/10 p-4 mt-auto">
          <div className="flex flex-col gap-3">
            {/* Helper text for publish */}
            {!canPublish && (
              <p className="text-xs text-[#6B635B] text-center">
                Add "What happened" and "Insight 1" to publish.
              </p>
            )}
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting || !hasDraftContent}
              >
                Save Draft
              </Button>
              <Button
                type="button"
                onClick={handlePublish}
                disabled={isSubmitting || !canPublish}
              >
                {isSubmitting ? 'Publishing...' : 'Publish'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}