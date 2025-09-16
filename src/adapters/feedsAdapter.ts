import { supabase } from '@/integrations/supabase/client';
import { TABLES, BUSINESS_FILTERS } from './constants';

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
  action: string;     // e.g., "liked", "opened", "linked"
  target: string;     // e.g., "Idea #123"
  created_at: string; // ISO timestamp
}

export class FeedsAdapter {
  // Brainstorm feed removed from sidebar - users should go to /brainstorm page
  async getBrainstormFeed(): Promise<FeedItem[]> { 
    return []; 
  }

  async getBusinessFeed(): Promise<FeedItem[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.BUSINESS_FEED_VIEW)
        .select(`
          id,
          title,
          content,
          created_at,
          likes_count,
          comments_count,
          profiles!user_id(display_name)
        `)
        .eq('mode', BUSINESS_FILTERS.MODE)
        .eq('status', BUSINESS_FILTERS.STATUS)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.warn(`Failed to load business feed from ${TABLES.BUSINESS_FEED_VIEW}:`, error.message);
        return [];
      }

      return (data || []).map((post: any) => ({
        id: post.id,
        type: 'business' as const,
        title: post.title || 'Untitled Post',
        content: post.content?.substring(0, 150),
        author: post.profiles?.display_name || 'Anonymous',
        created_at: post.created_at,
        stats: {
          likes: post.likes_count || 0,
          comments: post.comments_count || 0
        }
      }));
    } catch (err) {
      console.warn(`Business feed error:`, err);
      return [];
    }
  }

  async getOpenIdeasFeed(): Promise<FeedItem[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.OPEN_IDEAS)
        .select('id, content, created_at, linked_brainstorms_count')
        .eq('status', 'approved')
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) {
        console.warn(`Failed to load open ideas from ${TABLES.OPEN_IDEAS}:`, error.message);
        return [];
      }

      return (data || []).map((idea: any) => ({
        id: idea.id,
        type: 'open_idea' as const,
        title: idea.content.substring(0, 60) + (idea.content.length > 60 ? '...' : ''),
        content: idea.content.substring(0, 150),
        author: 'Community',
        created_at: idea.created_at,
        stats: {
          likes: 0,
          comments: idea.linked_brainstorms_count || 0
        }
      }));
    } catch (err) {
      console.warn(`Table ${TABLES.OPEN_IDEAS} may not exist or is not accessible:`, err);
      return [];
    }
  }

  async getHistory(): Promise<HistoryItem[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return [];
      }

      const { data, error } = await supabase
        .from(TABLES.HISTORY)
        .select('id, event_name, properties, created_at')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.warn(`Failed to load history from ${TABLES.HISTORY}:`, error.message);
        return [];
      }

      return (data || []).map((event: any) => ({
        id: event.id,
        action: this.formatEventAction(event.event_name),
        target: this.formatEventTarget(event.event_name, event.properties),
        created_at: event.created_at
      }));
    } catch (err) {
      console.warn(`History loading error:`, err);
      return [];
    }
  }

  private formatEventAction(eventName: string): string {
    const actionMap: Record<string, string> = {
      'lp_view_hero': 'viewed',
      'share_click_attempt': 'shared',
      'post_created': 'created',
      'post_liked': 'liked',
      'idea_opened': 'opened',
      'brainstorm_created': 'brainstormed'
    };
    return actionMap[eventName] || eventName.replace(/_/g, ' ');
  }

  private formatEventTarget(eventName: string, properties: any): string {
    if (properties?.postId) return `Post #${properties.postId.substring(0, 8)}`;
    if (properties?.ideaId) return `Idea #${properties.ideaId.substring(0, 8)}`;
    if (eventName.includes('hero')) return 'Landing Page';
    if (eventName.includes('share')) return 'Content';
    return 'Unknown';
  }
}
