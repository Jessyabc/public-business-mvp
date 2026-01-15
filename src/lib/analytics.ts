import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

// ============================================================================
// UNIFIED ANALYTICS SYSTEM
// Consolidates tracking from track.ts and useAnalytics.ts
// All events are persisted to analytics_events table
// ============================================================================
// All events are persisted to analytics_events table
// ============================================================================

type TrackingEvent = 
  // Brainstorm events
  | 'brainstorm_created'
  | 'brainstorm_reply' 
  | 'brainstorm_failed'
  | 't_score_recomputed'
  | 'brainstorm_viewed'
  | 'brainstorm_list_viewed'
  // Landing page events
  | 'lp_view_hero'
  | 'lp_view_timeline_node'
  | 'lp_reach_composer'
  // Composer events
  | 'composer_started_typing'
  // Email events
  | 'email_shown'
  | 'email_valid'
  // CTA events
  | 'cta_create_account_shown'
  | 'cta_create_account_click'
  // Share events
  | 'share_click_attempt'
  // Teaser events
  | 'teaser_impression'
  | 'teaser_click'
  // Feed/Workspace events (newly added)
  | 'workspace_thought_anchored'
  | 'post_continue_started'
  | 'feed_scroll_depth'
  | 'post_constellation_opened'
  | 'lens_switched'
  | 'post_view';

interface TrackingPayload {
  [key: string]: unknown;
}

class AnalyticsService {
  private sessionId: string;
  private isDev: boolean;

  constructor() {
    this.sessionId = sessionStorage.getItem('analytics_session_id') || this.generateSessionId();
    sessionStorage.setItem('analytics_session_id', this.sessionId);
    this.isDev = import.meta.env.DEV;
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Main tracking method - persists to DB and logs in dev
   */
  async track(event_name: TrackingEvent | string, properties: TrackingPayload = {}): Promise<void> {
    const timestamp = new Date().toISOString();
    const trackingData = {
      event: event_name,
      timestamp,
      session_id: this.sessionId,
      ...properties,
    };

    // Development logging with styled output
    if (this.isDev) {
      console.log(
        `%c📊 TRACK %c${event_name}`,
        'color: #10b981; font-weight: bold;',
        'color: #374151; font-weight: normal;',
        trackingData
      );
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('analytics_events').insert([{
        event_name,
        user_id: user?.id || null,
        session_id: this.sessionId,
        properties: properties as Json,
      }]);

      // Also send to gtag if available
      if (typeof window !== 'undefined' && (window as unknown as { gtag?: Function }).gtag) {
        (window as unknown as { gtag: Function }).gtag('event', event_name, properties);
      }
    } catch (error) {
      // Silently fail in production, log in dev
      if (this.isDev) {
        console.error('Analytics tracking error:', error);
      }
    }
  }

  // =========================================================================
  // BRAINSTORM EVENTS
  // =========================================================================

  trackBrainstormCreated(brainstormId: string, textLength: number, parentId?: string): void {
    this.track('brainstorm_created', {
      brainstormId,
      textLength,
      isReply: !!parentId,
      parentId,
    });
  }

  trackBrainstormReply(brainstormId: string, parentId: string, replyCount: number): void {
    this.track('brainstorm_reply', {
      brainstormId,
      parentId,
      replyCount,
    });
  }

  trackBrainstormFailed(error: string, textLength: number, parentId?: string): void {
    this.track('brainstorm_failed', {
      error,
      textLength,
      isReply: !!parentId,
      parentId,
    });
  }

  trackTScoreRecomputed(brainstormId: string, oldScore: number, newScore: number): void {
    this.track('t_score_recomputed', {
      brainstormId,
      oldScore,
      newScore,
      scoreDelta: newScore - oldScore,
    });
  }

  trackBrainstormViewed(brainstormId: string, hasReplies: boolean): void {
    this.track('brainstorm_viewed', {
      brainstormId,
      hasReplies,
    });
  }

  trackBrainstormListViewed(sortBy?: 'recent' | 'score', count?: number): void {
    this.track('brainstorm_list_viewed', {
      sortBy,
      count,
    });
  }

  // =========================================================================
  // LANDING PAGE EVENTS
  // =========================================================================

  trackLandingView(): void {
    this.track('lp_view_hero');
  }

  trackTimelineNode(nodeId: number): void {
    this.track('lp_view_timeline_node', { nodeId });
  }

  trackComposerReached(): void {
    this.track('lp_reach_composer');
  }

  trackComposerStartedTyping(): void {
    this.track('composer_started_typing');
  }

  // =========================================================================
  // EMAIL & CTA EVENTS
  // =========================================================================

  trackEmailShown(): void {
    this.track('email_shown');
  }

  trackEmailValid(): void {
    this.track('email_valid');
  }

  trackCreateAccountShown(): void {
    this.track('cta_create_account_shown');
  }

  trackCreateAccountClick(): void {
    this.track('cta_create_account_click');
  }

  // =========================================================================
  // SHARE & TEASER EVENTS
  // =========================================================================

  trackShareAttempt(): void {
    this.track('share_click_attempt');
  }

  trackTeaserImpression(ideaId: string): void {
    this.track('teaser_impression', { idea_id: ideaId });
  }

  trackTeaserClick(ideaId: string): void {
    this.track('teaser_click', { idea_id: ideaId });
  }

  // =========================================================================
  // FEED & WORKSPACE EVENTS (NEW)
  // =========================================================================

  trackWorkspaceThoughtAnchored(thoughtId: string): void {
    this.track('workspace_thought_anchored', { thought_id: thoughtId });
  }

  trackPostContinueStarted(parentId: string): void {
    this.track('post_continue_started', { parent_id: parentId });
  }

  trackFeedScrollDepth(depth: 25 | 50 | 75 | 100, feedMode: 'public' | 'business'): void {
    this.track('feed_scroll_depth', { depth, feed_mode: feedMode });
  }

  trackPostConstellationOpened(rootPostId: string): void {
    this.track('post_constellation_opened', { root_post_id: rootPostId });
  }

  trackLensSwitched(fromLens: string, toLens: string): void {
    this.track('lens_switched', { from: fromLens, to: toLens });
  }

  trackPostView(postId: string, postKind?: string): void {
    this.track('post_view', { target_id: postId, kind: postKind });
  }
}

// Singleton instance
export const analytics = new AnalyticsService();

// React hook for components
export function useAnalytics() {
  return analytics;
}

// ============================================================================
// LEGACY EXPORTS - for backward compatibility with existing track.ts imports
// ============================================================================

export function track(event: TrackingEvent, payload?: TrackingPayload): void {
  analytics.track(event, payload);
}

export function trackBrainstormCreated(brainstormId: string, textLength: number, parentId?: string): void {
  analytics.trackBrainstormCreated(brainstormId, textLength, parentId);
}

export function trackBrainstormReply(brainstormId: string, parentId: string, replyCount: number): void {
  analytics.trackBrainstormReply(brainstormId, parentId, replyCount);
}

export function trackBrainstormFailed(error: string, textLength: number, parentId?: string): void {
  analytics.trackBrainstormFailed(error, textLength, parentId);
}

export function trackTScoreRecomputed(brainstormId: string, oldScore: number, newScore: number): void {
  analytics.trackTScoreRecomputed(brainstormId, oldScore, newScore);
}

export function trackBrainstormViewed(brainstormId: string, hasReplies: boolean): void {
  analytics.trackBrainstormViewed(brainstormId, hasReplies);
}

export function trackBrainstormListViewed(sortBy?: 'recent' | 'score', count?: number): void {
  analytics.trackBrainstormListViewed(sortBy, count);
}
