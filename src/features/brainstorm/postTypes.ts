import type { BasePost, PostKind, PostRelationType, PostVisibility } from '@/types/post';

export interface BrainstormPost extends BasePost {
  type: 'brainstorm';
  mode: 'public';
  visibility: Extract<PostVisibility, 'public'>;
  kind: Extract<PostKind, 'Spark' | 'Insight'>;
}

export type BrainstormRelationType = Extract<PostRelationType, 'hard' | 'soft'>;
