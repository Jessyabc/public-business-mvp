type TrackingEvent = 
  | 'brainstorm_created'
  | 'brainstorm_reply' 
  | 'brainstorm_failed'
  | 't_score_recomputed'
  | 'brainstorm_viewed'
  | 'brainstorm_list_viewed';

interface TrackingPayload {
  [key: string]: any;
}

/**
 * Telemetry tracking for brainstorm interactions
 * Currently logs to console - in production would send to analytics service
 */
export function track(event: TrackingEvent, payload?: TrackingPayload): void {
  const timestamp = new Date().toISOString();
  const trackingData = {
    event,
    timestamp,
    ...payload,
  };

  // For development: log to console with styled output
  console.log(
    `%c📊 TRACK %c${event}`,
    'color: #10b981; font-weight: bold;',
    'color: #374151; font-weight: normal;',
    trackingData
  );

  // In production, this would send to your analytics service:
  // analyticsService.track(trackingData);
  // mixpanel.track(event, payload);
  // posthog.capture(event, payload);
}

/**
 * Track brainstorm creation with content metadata
 */
export function trackBrainstormCreated(brainstormId: string, textLength: number, parentId?: string): void {
  track('brainstorm_created', {
    brainstormId,
    textLength,
    isReply: !!parentId,
    parentId,
  });
}

/**
 * Track brainstorm reply with engagement data
 */
export function trackBrainstormReply(brainstormId: string, parentId: string, replyCount: number): void {
  track('brainstorm_reply', {
    brainstormId,
    parentId,
    replyCount,
  });
}

/**
 * Track failed brainstorm creation for error monitoring
 */
export function trackBrainstormFailed(error: string, textLength: number, parentId?: string): void {
  track('brainstorm_failed', {
    error,
    textLength,
    isReply: !!parentId,
    parentId,
  });
}

/**
 * Track T-score recalculation for scoring system optimization
 */
export function trackTScoreRecomputed(brainstormId: string, oldScore: number, newScore: number): void {
  track('t_score_recomputed', {
    brainstormId,
    oldScore,
    newScore,
    scoreDelta: newScore - oldScore,
  });
}

/**
 * Track brainstorm detail view for engagement metrics
 */
export function trackBrainstormViewed(brainstormId: string, hasReplies: boolean): void {
  track('brainstorm_viewed', {
    brainstormId,
    hasReplies,
  });
}

/**
 * Track brainstorm list view with sorting/filtering context
 */
export function trackBrainstormListViewed(sortBy?: 'recent' | 'score', count?: number): void {
  track('brainstorm_list_viewed', {
    sortBy,
    count,
  });
}