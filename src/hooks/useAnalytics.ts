import { supabase } from '@/integrations/supabase/client';

interface AnalyticsEvent {
  event_name: string;
  properties?: Record<string, any>;
  session_id?: string;
}

class AnalyticsService {
  private sessionId: string;

  constructor() {
    // Generate or retrieve session ID
    this.sessionId = sessionStorage.getItem('analytics_session_id') || this.generateSessionId();
    sessionStorage.setItem('analytics_session_id', this.sessionId);
  }

  getSessionId(): string {
    return this.sessionId;
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async track(event_name: string, properties: Record<string, any> = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('analytics_events').insert({
        event_name,
        user_id: user?.id || null,
        session_id: this.sessionId,
        properties,
      });

      // Also send to gtag if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', event_name, properties);
      }
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  // Predefined event methods for common landing page events
  async trackLandingView() {
    return this.track('lp_view_hero');
  }

  async trackTimelineNode(nodeId: number) {
    return this.track(`lp_view_timeline_node_${nodeId}`);
  }

  async trackComposerReached() {
    return this.track('lp_reach_composer');
  }

  async trackComposerStartedTyping() {
    return this.track('composer_started_typing');
  }

  async trackEmailShown() {
    return this.track('email_shown');
  }

  async trackEmailValid() {
    return this.track('email_valid');
  }

  async trackCreateAccountShown() {
    return this.track('cta_create_account_shown');
  }

  async trackCreateAccountClick() {
    return this.track('cta_create_account_click');
  }

  async trackShareAttempt() {
    return this.track('share_click_attempt');
  }

  async trackTeaserImpression(ideaId: string) {
    return this.track('teaser_impression', { idea_id: ideaId });
  }

  async trackTeaserClick(ideaId: string) {
    return this.track('teaser_click', { idea_id: ideaId });
  }
}

export const analytics = new AnalyticsService();

export function useAnalytics() {
  return analytics;
}