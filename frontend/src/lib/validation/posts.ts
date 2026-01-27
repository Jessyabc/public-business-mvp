import { z } from 'zod';

const MAX_CONTENT_LENGTH = 5000;
const MIN_CONTENT_LENGTH = 1;

export const brainstormSchema = z.object({
  content: z
    .string()
    .trim()
    .min(MIN_CONTENT_LENGTH, 'Content is required')
    .max(MAX_CONTENT_LENGTH, `Content must be less than ${MAX_CONTENT_LENGTH} characters`),
});

export const insightSchema = z.object({
  content: z
    .string()
    .trim()
    .min(MIN_CONTENT_LENGTH, 'Content is required')
    .max(MAX_CONTENT_LENGTH, `Content must be less than ${MAX_CONTENT_LENGTH} characters`),
  org_id: z.string().uuid('Valid organization ID is required'),
});

export type BrainstormInput = z.infer<typeof brainstormSchema>;
export type InsightInput = z.infer<typeof insightSchema>;

export function validateBrainstorm(data: unknown) {
  return brainstormSchema.safeParse(data);
}

export function validateInsight(data: unknown) {
  return insightSchema.safeParse(data);
}
