export type PostType = 'insight' | 'report' | 'webinar' | 'whitepaper' | 'video';
export type PostVisibility = 'public' | 'my_business' | 'other_businesses' | 'draft';

export interface BusinessPost {
  id: string;
  title: string;
  type: PostType;
  summary: string;
  company: {
    id: string;
    name: string;
    logo: string;
    industry: string;
  };
  uScore: {
    total: number;
    breakdown: {
      comments: number;
      links: number;
      views: number;
      shares: number;
    };
  };
  visibility: PostVisibility;
  publishedAt: Date;
  isLive?: boolean; // for webinars
  isUpcoming?: boolean; // for webinars
  linkedBrainstorms: number;
  citationCount: number;
  isHighlighted?: boolean; // if linked by high-T brainstorms
}

export interface BusinessFeedFilters {
  search: string;
  sortBy: 'most_useful' | 'most_recent' | 'most_shared' | 'webinars_only' | 'by_industry';
  industries: string[];
}