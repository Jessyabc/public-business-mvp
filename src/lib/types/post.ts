export const POST_TYPES = ['brainstorm', 'insight', 'report', 'whitepaper', 'webinar', 'video'] as const;
export type PostType = typeof POST_TYPES[number];

export const POST_VISIBILITIES = ['public', 'my_business', 'other_businesses', 'draft'] as const;
export type PostVisibility = typeof POST_VISIBILITIES[number];

export const POST_MODES = ['public', 'business'] as const;
export type PostMode = typeof POST_MODES[number];

export const POST_STATUSES = ['active', 'archived', 'deleted'] as const;
export type PostStatus = typeof POST_STATUSES[number];

export interface Post {
  id: string;
  user_id: string;
  title?: string | null;
  content: string;
  type: PostType;
  visibility: PostVisibility;
  mode: PostMode;
  org_id?: string | null;
  industry_id?: string | null;
  department_id?: string | null;
  metadata?: Record<string, any>;
  likes_count: number;
  comments_count: number;
  views_count: number;
  t_score?: number | null;
  u_score?: number | null;
  status: PostStatus;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

export function isValidPostType(value: unknown): value is PostType {
  return typeof value === 'string' && POST_TYPES.includes(value as PostType);
}

export function isValidPostVisibility(value: unknown): value is PostVisibility {
  return typeof value === 'string' && POST_VISIBILITIES.includes(value as PostVisibility);
}

export function isValidPostMode(value: unknown): value is PostMode {
  return typeof value === 'string' && POST_MODES.includes(value as PostMode);
}
