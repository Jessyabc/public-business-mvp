import type { Database } from '@/integrations/supabase/types';

type PostInsert = Database['public']['Tables']['posts']['Insert'];

export type { PostInsert };

/**
 * CANONICAL POST BUILDERS
 * 
 * These builders enforce the strict conceptual model:
 * - Sparks: type='brainstorm', kind='Spark', mode='public', visibility='public', org_id=null
 * - Business Insights: type='insight', kind='BusinessInsight', mode='business', visibility='my_business', org_id!=null
 * 
 * After creation, type, kind, mode, and org_id CANNOT be changed.
 * Only content and title may be edited.
 */

export interface SparkParams {
  userId: string;
  content: string;
  title?: string | null;
  metadata?: Record<string, any>;
}

export interface BusinessInsightParams {
  userId: string;
  orgId: string;
  content: string;
  title: string;
  metadata?: Record<string, any>;
}

/**
 * Builds a payload for creating a public Spark (brainstorm post).
 * 
 * Canonical constraints:
 * - type='brainstorm' (IMMUTABLE)
 * - kind='Spark' (IMMUTABLE)
 * - mode='public' (IMMUTABLE)
 * - visibility='public' (IMMUTABLE)
 * - status='active'
 * - org_id=null (IMMUTABLE)
 * - user_id=auth.uid() (IMMUTABLE)
 * 
 * Mutable fields: content, title
 */
export function buildSparkPayload(params: SparkParams): PostInsert {
  const trimmed = params.content.trim();
  
  if (!trimmed) {
    throw new Error('Content cannot be empty');
  }
  
  return {
    user_id: params.userId,
    title: params.title?.trim() || null,
    content: trimmed,
    body: trimmed,
    type: 'brainstorm',
    kind: 'Spark',
    mode: 'public',
    visibility: 'public',
    status: 'active',
    org_id: null,
    metadata: params.metadata as any,
  };
}

/**
 * Builds a payload for creating a Business Insight.
 * 
 * Canonical constraints:
 * - type='insight' (IMMUTABLE)
 * - kind='BusinessInsight' (IMMUTABLE)
 * - mode='business' (IMMUTABLE)
 * - visibility='my_business' (IMMUTABLE)
 * - status='active'
 * - org_id != null (IMMUTABLE)
 * - user_id=auth.uid() (IMMUTABLE)
 * 
 * Mutable fields: content, title
 */
export function buildBusinessInsightPayload(params: BusinessInsightParams): PostInsert {
  const trimmed = params.content.trim();
  
  if (!trimmed) {
    throw new Error('Content cannot be empty');
  }
  
  if (!params.title?.trim()) {
    throw new Error('Business insights require a title');
  }
  
  if (!params.orgId) {
    throw new Error('Business insights require an organization ID');
  }
  
  return {
    user_id: params.userId,
    title: params.title.trim(),
    content: trimmed,
    body: trimmed,
    type: 'insight',
    kind: 'BusinessInsight',
    mode: 'business',
    visibility: 'my_business',
    status: 'active',
    org_id: params.orgId,
    metadata: params.metadata as any,
  };
}

/**
 * Builds an update payload that ONLY allows content and title changes.
 * All other fields are immutable after creation.
 */
export function buildPostUpdatePayload(params: {
  content?: string;
  title?: string;
}): { content?: string; title?: string | null } {
  const update: { content?: string; title?: string | null } = {};
  
  if (params.content !== undefined) {
    const trimmed = params.content.trim();
    if (!trimmed) {
      throw new Error('Content cannot be empty');
    }
    update.content = trimmed;
  }
  
  if (params.title !== undefined) {
    update.title = params.title?.trim() || null;
  }
  
  return update;
}

/**
 * Validates that a post payload follows canonical rules
 */
export function validatePostPayload(payload: PostInsert): void {
  // Validate Spark
  if (payload.type === 'brainstorm') {
    if (payload.kind !== 'Spark') {
      throw new Error('Brainstorms must have kind=Spark');
    }
    if (payload.mode !== 'public') {
      throw new Error('Brainstorms must have mode=public');
    }
    if (payload.visibility !== 'public') {
      throw new Error('Brainstorms must have visibility=public');
    }
    if (payload.org_id !== null) {
      throw new Error('Brainstorms must have org_id=null');
    }
  }
  
  // Validate Business Insight
  if (payload.type === 'insight' && payload.mode === 'business') {
    if (payload.kind !== 'BusinessInsight') {
      throw new Error('Business insights must have kind=BusinessInsight');
    }
    if (payload.visibility !== 'my_business') {
      throw new Error('Business insights must have visibility=my_business');
    }
    if (!payload.org_id) {
      throw new Error('Business insights must have org_id');
    }
  }
}
