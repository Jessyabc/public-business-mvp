// Stub feeds adapter - returns empty data until backend is connected

export interface FeedItem {
  id: string;
  type: 'brainstorm' | 'business' | 'open_idea';
  title: string;
  content: string;
  author: string;
  created_at: string;
  stats: {
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
  async getBrainstormFeed(): Promise<FeedItem[]> {
    console.log('Feeds adapter: getBrainstormFeed called - returning empty array (backend not connected)');
    return [];
  }

  async getBusinessFeed(): Promise<FeedItem[]> {
    console.log('Feeds adapter: getBusinessFeed called - returning empty array (backend not connected)');
    return [];
  }

  async getOpenIdeasFeed(): Promise<FeedItem[]> {
    console.log('Feeds adapter: getOpenIdeasFeed called - returning empty array (backend not connected)');
    return [];
  }

  async getHistory(): Promise<HistoryItem[]> {
    console.log('Feeds adapter: getHistory called - returning empty array (backend not connected)');
    return [];
  }
}