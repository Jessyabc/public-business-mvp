// CANONICAL helper functions for post operations.
// These functions write to the posts table correctly and can be used.
// However, prefer using src/lib/postPayloads.ts builders + direct supabase calls for consistency.

import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';
import type { Post } from '@/types/post';

type SupabaseClientType = SupabaseClient<Database>;

export interface InsertBrainstormInput {
  content: string;
  title?: string;
}

export interface InsertInsightInput {
  org_id: string;
  content: string;
  title?: string;
}

export interface FetchPostsOptions {
  limit?: number;
  cursor?: {
    published_at: string;
    id: string;
  };
}

/**
 * Insert a public brainstorm post
 */
export async function insertBrainstormPublic(
  supabase: SupabaseClientType,
  input: InsertBrainstormInput
): Promise<{ data: Post | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: input.content,
        body: input.content,
        kind: 'Spark',
        title: input.title || null,
        type: 'brainstorm',
        visibility: 'public',
        mode: 'public',
        org_id: null,
        published_at: new Date().toISOString(),
        status: 'active',
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error inserting brainstorm:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Post, error: null };
  } catch (err) {
    console.error('Unexpected error inserting brainstorm:', err);
    return { data: null, error: err as Error };
  }
}

/**
 * Insert an insight post for an organization
 */
export async function insertInsightForOrg(
  supabase: SupabaseClientType,
  input: InsertInsightInput
): Promise<{ data: Post | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('User not authenticated') };
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: input.content,
        body: input.content,
        kind: 'BusinessInsight',
        title: input.title || null,
        type: 'insight',
        visibility: 'my_business',
        mode: 'business',
        org_id: input.org_id,
        published_at: new Date().toISOString(),
        status: 'active',
      } as any)
      .select()
      .single();

    if (error) {
      console.error('Error inserting insight:', error);
      return { data: null, error: new Error(error.message) };
    }

    return { data: data as Post, error: null };
  } catch (err) {
    console.error('Unexpected error inserting insight:', err);
    return { data: null, error: err as Error };
  }
}

/**
 * Fetch public brainstorms with cursor-based pagination
 */
export async function fetchPublicBrainstorms(
  supabase: SupabaseClientType,
  options: FetchPostsOptions = {}
): Promise<{ data: Post[]; error: Error | null; hasMore: boolean }> {
  try {
    const { limit = 20, cursor } = options;

    let query = supabase
      .from('posts')
      .select('*')
      .eq('type', 'brainstorm')
      .eq('visibility', 'public')
      .eq('mode', 'public')
      .eq('status', 'active')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      query = query.or(
        `published_at.lt.${cursor.published_at},and(published_at.eq.${cursor.published_at},id.lt.${cursor.id})`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching brainstorms:', error);
      return { data: [], error: new Error(error.message), hasMore: false };
    }

    const hasMore = data.length > limit;
    const posts = hasMore ? data.slice(0, limit) : data;

    return { data: posts as Post[], error: null, hasMore };
  } catch (err) {
    console.error('Unexpected error fetching brainstorms:', err);
    return { data: [], error: err as Error, hasMore: false };
  }
}

/**
 * Fetch organization insights with cursor-based pagination
 */
export async function fetchOrgInsights(
  supabase: SupabaseClientType,
  options: FetchPostsOptions & { org_id: string }
): Promise<{ data: Post[]; error: Error | null; hasMore: boolean }> {
  try {
    const { org_id, limit = 20, cursor } = options;

    let query = supabase
      .from('posts')
      .select('*')
      .eq('type', 'insight')
      .eq('visibility', 'my_business')
      .eq('mode', 'business')
      .eq('org_id', org_id)
      .eq('status', 'active')
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit + 1);

    if (cursor) {
      query = query.or(
        `published_at.lt.${cursor.published_at},and(published_at.eq.${cursor.published_at},id.lt.${cursor.id})`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching org insights:', error);
      return { data: [], error: new Error(error.message), hasMore: false };
    }

    const hasMore = data.length > limit;
    const posts = hasMore ? data.slice(0, limit) : data;

    return { data: posts as Post[], error: null, hasMore };
  } catch (err) {
    console.error('Unexpected error fetching org insights:', err);
    return { data: [], error: err as Error, hasMore: false };
  }
}
