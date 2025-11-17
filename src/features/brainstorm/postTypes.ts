import type { BasePost, PostRelationType } from '@/types/post';

export type BrainstormPost = Pick<
  BasePost,
  'id' | 'title' | 'content' | 'user_id' | 'created_at' | 'likes_count' | 'views_count'
>;

export type BrainstormRelationType = Extract<PostRelationType, 'hard' | 'soft'>;
