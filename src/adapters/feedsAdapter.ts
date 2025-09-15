// Read-only stubs; return empty arrays until backend is connected

export interface FeedItem {
  id: string;
  type: 'brainstorm' | 'business' | 'open_idea';
  title: string;
  content?: string;
  author?: string;
  created_at: string;
  stats?: {
    likes: number;
    comments: number;
  };
}

export interface HistoryItem {
  id: string;
  action: string;
  target: string;
  created_at: string;
}

export class FeedsAdapter {
  async getBrainstormFeed(): Promise<FeedItem[]> { return []; }
  async getBusinessFeed(): Promise<FeedItem[]> { return []; }
  async getOpenIdeasFeed(): Promise<FeedItem[]> { return []; }
  async getHistory(): Promise<HistoryItem[]> { return []; }
}
