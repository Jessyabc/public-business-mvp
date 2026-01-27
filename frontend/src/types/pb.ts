export type PBPostType = 
  | 'brainstorm'
  | 'brainstorm_continue'
  | 'insight'
  | 'insight_report'
  | 'insight_white_paper'
  | 'video_brainstorm'
  | 'video_insight';

export interface PBPost {
  id: string;
  type: PBPostType;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  metrics: {
    tScore?: number;
    uScore?: number;
    replies: number;
    shares: number;
    views: number;
  };
  thumbnail?: string;
  createdAt: string;
  tags?: string[];
  isPublic: boolean;
}