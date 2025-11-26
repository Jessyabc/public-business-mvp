import type { Database } from '@/integrations/supabase/types';

type PostInsert = Database['public']['Tables']['posts']['Insert'];

export type { PostInsert };

/**
 * Builds a payload for creating a public Spark (brainstorm post).
 * 
 * Canonical shape:
 * - type='brainstorm'
 * - kind='Spark'
 * - mode='public'
 * - visibility='public'
 * - status='active'
 * - org_id=null
 * - user_id=auth.uid()
 */
export function buildPublicSparkPayload(params: {
  userId: string;
  content: string;
  title?: string | null;
  originOpenIdeaId?: string;
}): PostInsert {
  const trimmed = params.content.trim();
  
  // Build metadata if originOpenIdeaId is provided
  const metadata = params.originOpenIdeaId
    ? { origin_open_idea_id: params.originOpenIdeaId }
    : undefined;
  
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
    metadata: metadata as any, // Type assertion needed for JSONB
  };
}

/**
 * Builds a payload for creating a Business Insight.
 * 
 * Canonical shape:
 * - type='insight'
 * - kind='BusinessInsight'
 * - mode='business'
 * - visibility='my_business' (for now)
 * - status='active'
 * - org_id != null
 * - user_id=auth.uid()
 */
export function buildBusinessInsightPayload(params: {
  userId: string;
  orgId: string;
  content: string;
  title: string;
}): PostInsert {
  const trimmed = params.content.trim();
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
  };
}

