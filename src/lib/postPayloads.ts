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
}): PostInsert {
  const trimmed = params.content.trim();
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

