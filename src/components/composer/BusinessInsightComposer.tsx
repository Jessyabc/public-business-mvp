import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Plus, X, Link2, Target, HelpCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserOrgId } from '@/features/orgs/hooks/useUserOrgId';
import { GlassInput } from '@/components/ui/GlassInput';
import { GlassSurface } from '@/components/ui/GlassSurface';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { 
  businessInsightSchema, 
  type BusinessInsightFormData,
  FOCUS_AREAS,
  VISIBILITY_OPTIONS 
} from '@/lib/validation/businessInsight';
import { buildBusinessInsightPayload } from '@/lib/posts';

interface BusinessInsightComposerProps {
  onClose: () => void;
}

export function BusinessInsightComposer({ onClose }: BusinessInsightComposerProps) {
  const { user } = useAuth();
  const { data: orgId } = useUserOrgId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [showReferences, setShowReferences] = useState(false);
  const [showSparkSelector, setShowSparkSelector] = useState(false);
  const [availableSparks, setAvailableSparks] = useState<any[]>([]);

  const form = useForm<BusinessInsightFormData>({
    resolver: zodResolver(businessInsightSchema),
    defaultValues: {
      focusArea: undefined,
      title: '',
      whatHappened: '',
      insights: [''],
      evidence: undefined,
      relatedSparks: [],
      internalGoal: '',
      references: [],
      closingQuestion: '',
      visibility: 'my_business',
    },
  });

  const insights = form.watch('insights') || [''];
  const references = form.watch('references') || [];
  const relatedSparks = form.watch('relatedSparks') || [];

  // Load available Sparks for linking
  const loadSparks = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, title, content, created_at')
        .eq('type', 'brainstorm')
        .eq('kind', 'Spark')
        .eq('mode', 'public')
        .eq('visibility', 'public')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setAvailableSparks(data || []);
    } catch (err) {
      console.error('Failed to load sparks:', err);
      toast.error('Failed to load sparks');
    }
  };

  const addInsight = () => {
    if (insights.length < 3) {
      form.setValue('insights', [...insights, '']);
    }
  };

  const removeInsight = (index: number) => {
    const newInsights = insights.filter((_, i) => i !== index);
    form.setValue('insights', newInsights.length > 0 ? newInsights : ['']);
  };

  const updateInsight = (index: number, value: string) => {
    const newInsights = [...insights];
    newInsights[index] = value;
    form.setValue('insights', newInsights);
  };

  const addReference = () => {
    form.setValue('references', [...references, { url: '', label: '' }]);
  };

  const removeReference = (index: number) => {
    form.setValue('references', references.filter((_, i) => i !== index));
  };

  const toggleSpark = (sparkId: string) => {
    const current = relatedSparks;
    if (current.includes(sparkId)) {
      form.setValue('relatedSparks', current.filter(id => id !== sparkId));
    } else {
      form.setValue('relatedSparks', [...current, sparkId]);
    }
  };

  const onSubmit = async (data: BusinessInsightFormData) => {
    if (!user || !orgId) {
      toast.error('Authentication required');
      return;
    }

    setIsSubmitting(true);
    try {
      // Build metadata with all structured data
      const metadata = {
        focusArea: data.focusArea,
        insights: data.insights.filter(i => i.trim()),
        evidence: data.evidence,
        internalGoal: data.internalGoal,
        references: data.references,
        closingQuestion: data.closingQuestion,
      };

      // Build the main content from whatHappened
      const payload = buildBusinessInsightPayload({
        userId: user.id,
        orgId,
        content: data.whatHappened,
        title: data.title,
        metadata,
      });

      // Override visibility from form
      payload.visibility = data.visibility;
      payload.published_at = new Date().toISOString();

      const { data: newPost, error } = await supabase
        .from('posts')
        .insert(payload)
        .select('id')
        .single();

      if (error) throw error;

      // Create soft links to related Sparks
      if (data.relatedSparks && data.relatedSparks.length > 0 && newPost?.id) {
        await supabase.rpc('api_create_soft_links', {
          p_parent: newPost.id,
          p_children: data.relatedSparks,
        });
      }

      toast.success('Business Insight created successfully');
      onClose();
    } catch (error: any) {
      console.error('Error creating business insight:', error);
      toast.error(error?.message || 'Failed to create insight');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">New Business Insight</h3>
        </div>

        {/* Focus Area */}
        <FormField
          control={form.control}
          name="focusArea"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[var(--text-primary)]">Focus Area *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select focus area..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {FOCUS_AREAS.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[var(--text-primary)]">Title *</FormLabel>
              <FormControl>
                <GlassInput 
                  placeholder="Clear, factual title (not clickbait)..." 
                  {...field}
                  maxLength={200}
                />
              </FormControl>
              <div className="text-xs text-[var(--text-secondary)] text-right">
                {field.value?.length || 0} / 200
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* What Happened */}
        <FormField
          control={form.control}
          name="whatHappened"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[var(--text-primary)]">What happened / what did you change? *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the experiment, decision, or change in detail..."
                  className="min-h-[120px]"
                  maxLength={5000}
                  {...field}
                />
              </FormControl>
              <div className="text-xs text-[var(--text-secondary)] text-right">
                {field.value?.length || 0} / 5000
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Insights (bullets) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-[var(--text-primary)]">Key Insights * (1-3)</Label>
            {insights.length < 3 && (
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={addInsight}
                className="text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Insight
              </Button>
            )}
          </div>
          
          {insights.map((insight, index) => (
            <div key={index} className="flex gap-2 items-start">
              <GlassInput
                placeholder={`Insight ${index + 1}: What did you learn?`}
                value={insight}
                onChange={(e) => updateInsight(index, e.target.value)}
                className="flex-1"
              />
              {insights.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeInsight(index)}
                  className="mt-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          {form.formState.errors.insights && (
            <p className="text-xs text-red-400">{form.formState.errors.insights.message}</p>
          )}
        </div>

        {/* Evidence Block (Optional) */}
        <GlassSurface inset className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
              <Label className="text-[var(--text-primary)]">Evidence Block (Optional)</Label>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowEvidence(!showEvidence)}
            >
              {showEvidence ? 'Hide' : 'Show'}
            </Button>
          </div>

          {showEvidence && (
            <div className="space-y-3 pt-2">
              <FormField
                control={form.control}
                name="evidence.metricName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Metric Name</FormLabel>
                    <FormControl>
                      <GlassInput placeholder="e.g., Conversion Rate" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="evidence.beforeValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Before</FormLabel>
                      <FormControl>
                        <GlassInput placeholder="e.g., 2.1%" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="evidence.afterValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">After</FormLabel>
                      <FormControl>
                        <GlassInput placeholder="e.g., 3.8%" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="evidence.timeframe"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Timeframe</FormLabel>
                      <FormControl>
                        <GlassInput placeholder="e.g., 3 months" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="evidence.sampleSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Sample Size</FormLabel>
                      <FormControl>
                        <GlassInput placeholder="e.g., 10,000 users" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        </GlassSurface>

        {/* Related Sparks */}
        <GlassSurface inset className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4 text-[var(--accent)]" />
              <Label className="text-[var(--text-primary)]">Related Sparks (Optional)</Label>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowSparkSelector(!showSparkSelector);
                if (!showSparkSelector) loadSparks();
              }}
            >
              {showSparkSelector ? 'Hide' : 'Show'} ({relatedSparks.length})
            </Button>
          </div>

          {showSparkSelector && (
            <>
              {relatedSparks.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {relatedSparks.map((id) => {
                    const spark = availableSparks.find((s) => s.id === id);
                    return (
                      <Badge key={id} variant="secondary" className="text-xs gap-1">
                        {spark?.title || 'Untitled'}
                        <X
                          className="h-3 w-3 cursor-pointer hover:text-destructive"
                          onClick={() => toggleSpark(id)}
                        />
                      </Badge>
                    );
                  })}
                </div>
              )}

              <ScrollArea className="h-[150px] rounded border border-white/10 bg-white/5">
                <div className="p-2 space-y-1">
                  {availableSparks.map((spark) => (
                    <button
                      key={spark.id}
                      type="button"
                      onClick={() => toggleSpark(spark.id)}
                      className={`w-full text-left p-2 rounded text-sm transition-colors ${
                        relatedSparks.includes(spark.id)
                          ? 'bg-[var(--accent)]/20 border border-[var(--accent)]/40'
                          : 'hover:bg-white/10 border border-transparent'
                      }`}
                    >
                      <div className="font-medium text-white line-clamp-1">
                        {spark.title || 'Untitled'}
                      </div>
                      <div className="text-xs text-white/60 line-clamp-1 mt-0.5">
                        {spark.content}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </GlassSurface>

        {/* Internal Goal */}
        <FormField
          control={form.control}
          name="internalGoal"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[var(--text-primary)] flex items-center gap-2">
                <Target className="w-4 h-4" />
                Internal Goal / Objective (Optional)
              </FormLabel>
              <FormControl>
                <GlassInput 
                  placeholder="e.g., Increase user retention, Reduce churn..." 
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* References */}
        <GlassSurface inset className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-[var(--text-primary)]">References (Optional)</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowReferences(!showReferences)}
            >
              {showReferences ? 'Hide' : 'Show'} ({references.length})
            </Button>
          </div>

          {showReferences && (
            <>
              {references.map((_, index) => (
                <div key={index} className="space-y-2 p-3 bg-white/5 rounded">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[var(--text-secondary)]">Reference {index + 1}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeReference(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <FormField
                    control={form.control}
                    name={`references.${index}.label`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <GlassInput placeholder="Label (e.g., Research Paper)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`references.${index}.url`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <GlassInput placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addReference}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Reference
              </Button>
            </>
          )}
        </GlassSurface>

        {/* Closing Question */}
        <FormField
          control={form.control}
          name="closingQuestion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[var(--text-primary)] flex items-center gap-2">
                <HelpCircle className="w-4 h-4" />
                Closing Question (Optional)
              </FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What are you curious about now? What questions emerged?" 
                  className="min-h-[80px]"
                  maxLength={500}
                  {...field}
                />
              </FormControl>
              <div className="text-xs text-[var(--text-secondary)] text-right">
                {field.value?.length || 0} / 500
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Visibility */}
        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[var(--text-primary)]">Visibility *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select visibility..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {VISIBILITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <button 
            type="button"
            className="glassButton glassButton--muted" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="glassButton glassButton--accent" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Insight'}
          </button>
        </div>
      </form>
    </Form>
  );
}
