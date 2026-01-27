import { z } from 'zod';

// Focus areas for business insights
export const FOCUS_AREAS = [
  'Operations',
  'Sales',
  'Finance',
  'Marketing',
  'UX',
  'Culture',
  'Tech',
  'Product',
  'Customer Success',
  'HR',
  'Strategy',
  'Other',
] as const;

export const VISIBILITY_OPTIONS = [
  { value: 'my_business', label: 'My Organization Only' },
  { value: 'other_businesses', label: 'Other Businesses' },
  { value: 'public', label: 'Public (Everyone)' },
] as const;

// Evidence block schema
const evidenceSchema = z.object({
  metricName: z.string().min(1, 'Metric name is required'),
  beforeValue: z.string().min(1, 'Before value is required'),
  afterValue: z.string().min(1, 'After value is required'),
  timeframe: z.string().min(1, 'Timeframe is required'),
  sampleSize: z.string().optional(),
});

// Reference schema
const referenceSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  label: z.string().min(1, 'Label is required'),
});

// Main Business Insight schema
export const businessInsightSchema = z.object({
  focusArea: z.enum(FOCUS_AREAS, {
    errorMap: () => ({ message: 'Please select a focus area' }),
  }),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  whatHappened: z.string()
    .min(10, 'Please describe what happened (minimum 10 characters)')
    .max(5000, 'Description must be less than 5000 characters'),
  insights: z.array(z.string().min(1, 'Insight cannot be empty'))
    .min(1, 'At least one insight is required')
    .max(3, 'Maximum 3 insights allowed'),
  evidence: evidenceSchema.optional(),
  relatedSparks: z.array(z.string()).optional(),
  internalGoal: z.string().optional(),
  references: z.array(referenceSchema).optional(),
  closingQuestion: z.string().max(500, 'Question must be less than 500 characters').optional(),
  visibility: z.enum(['my_business', 'other_businesses', 'public'], {
    errorMap: () => ({ message: 'Please select visibility' }),
  }),
});

export type BusinessInsightFormData = z.infer<typeof businessInsightSchema>;
export type Evidence = z.infer<typeof evidenceSchema>;
export type Reference = z.infer<typeof referenceSchema>;
