export const POST_TYPES = ['brainstorm', 'insight', 'report', 'whitepaper', 'webinar', 'video'] as const;
export type PostType = (typeof POST_TYPES)[number];

export const POST_KINDS = ['Spark', 'BusinessInsight', 'Insight'] as const;
export type PostKind = (typeof POST_KINDS)[number];

export const POST_VISIBILITIES = ['public', 'my_business', 'other_businesses', 'draft'] as const;
export type PostVisibility = (typeof POST_VISIBILITIES)[number];

export const POST_MODES = ['public', 'business'] as const;
export type PostMode = (typeof POST_MODES)[number];

export const POST_STATUSES = ['active', 'archived', 'deleted'] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export const POST_RELATION_TYPES = ['hard', 'soft', 'biz_in', 'biz_out'] as const;
export type PostRelationType = (typeof POST_RELATION_TYPES)[number];

export type PostMetadata = Record<string, unknown> | null;

export interface BasePost {
  id: string;
  user_id: string;
  title?: string | null;
  content: string;
  body?: string | null;
  type: PostType;
  kind: PostKind;
  visibility: PostVisibility;
  mode: PostMode;
  status: PostStatus;
  org_id?: string | null;
  industry_id?: string | null;
  department_id?: string | null;
  metadata: PostMetadata;
  likes_count: number;
  comments_count: number;
  views_count: number;
  t_score?: number | null;
  u_score?: number | null;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type Post = BasePost;

type MutablePostFields =
  | 'title'
  | 'content'
  | 'body'
  | 'type'
  | 'kind'
  | 'visibility'
  | 'mode'
  | 'status'
  | 'org_id'
  | 'industry_id'
  | 'department_id'
  | 'metadata'
  | 't_score'
  | 'u_score'
  | 'published_at';

export type PostInsertPayload = {
  user_id: BasePost['user_id'];
  content: BasePost['content'];
  type: PostType;
  mode: PostMode;
} & Partial<Pick<BasePost, MutablePostFields>>;

export type PostUpdatePayload = Partial<Omit<PostInsertPayload, 'user_id'>>;

export interface PostRelation {
  id: string;
  parent_post_id: string;
  child_post_id: string;
  relation_type: PostRelationType;
  created_at: string;
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

export function isValidPostKind(value: unknown): value is PostKind {
  return typeof value === 'string' && POST_KINDS.includes(value as PostKind);
}

export function isValidPostStatus(value: unknown): value is PostStatus {
  return typeof value === 'string' && POST_STATUSES.includes(value as PostStatus);
}

export function isValidPostRelationType(value: unknown): value is PostRelationType {
  return typeof value === 'string' && POST_RELATION_TYPES.includes(value as PostRelationType);
}
