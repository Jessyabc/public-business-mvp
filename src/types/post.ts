export type PostKind =
  | 'open_idea'
  | 'brainstorm'
  | 'spark'
  | 'business_insight'
  | 'insight';

export type BasePost = {
  id: string;
  kind: PostKind;
  org_id?: string | null;
  author_id: string;
  title?: string | null;
  summary?: string | null;
  created_at: string;   // ISO
  updated_at: string;   // ISO
  privacy: 'public' | 'private' | 'org';
  metrics?: {
    t_score?: number | null;
    u_score?: number | null;
    involvement?: number | null;
  };
};

export type PostLink = {
  id: string;
  from_id: string;
  to_id: string;
  relation:
    | 'spark_to_brainstorm'
    | 'brainstorm_to_brainstorm'
    | 'brainstorm_to_insight'
    | 'open_to_brainstorm'
    | 'insight_reference';
  created_at: string;
};

export const isBrainstorm = (p: BasePost) =>
  p.kind === 'brainstorm' || p.kind === 'spark';

export const isOpenIdea   = (p: BasePost) => p.kind === 'open_idea';

export const isInsight    = (p: BasePost) =>
  p.kind === 'business_insight' || p.kind === 'insight';

