# Metrics and Analytics System

This document describes the metrics infrastructure for the platform, focusing on U-score (Utility Score) and T-score (Thought Score) for Business Insights.

## Overview

The platform uses two primary scoring systems:

1. **U-Score (Utility Score)**: Community-driven rating (1-5) reflecting practical value
2. **T-Score (Thought Score)**: Algorithmic quality signal based on content depth and engagement

## Database Views

### 1. `view_post_u_score`

Aggregates utility ratings per post.

**Purpose**: Provide a real-time summary of utility ratings for each post.

**Columns**:
- `post_id` (uuid): Post identifier
- `u_score_avg` (numeric): Average rating (1-5), rounded to 2 decimals
- `u_score_count` (bigint): Total number of ratings
- `positive_ratings` (bigint): Count of ratings ≥ 4
- `negative_ratings` (bigint): Count of ratings ≤ 2

**Source**: Aggregates from `post_utility_ratings` table

**Access**: Available for all posts with at least one rating

---

### 2. `view_post_t_score`

Provides T-Score metrics for posts.

**Purpose**: Calculate thought quality scores based on content characteristics.

**Columns**:
- `post_id` (uuid): Post identifier  
- `t_score` (integer): Pre-calculated thought score (0-100)
- `content_length` (integer): Character count of post content
- `reply_count` (integer): Number of comment replies
- `age_minutes` (numeric): Age of post in minutes

**Source**: Queries from `posts` table

**Calculation**: Uses the `calculateTScore()` function from `src/lib/score/tScore.ts`

**Access**: Only active posts (`status = 'active'`)

---

### 3. `view_business_insight_analytics`

One row per Business Insight with comprehensive utility metrics.

**Purpose**: Business Admin Panel analytics for individual insights.

**Columns**:
- `post_id` (uuid): Unique post identifier
- `org_id` (uuid): Organization that owns the insight
- `title` (text): Insight title
- `published_at` (timestamptz): Publication timestamp
- `created_at` (timestamptz): Creation timestamp
- `u_score_avg` (numeric): Average utility rating
- `u_score_count` (bigint): Number of utility ratings
- `t_score` (integer): Thought quality score
- `continuations_count` (bigint): Number of reply threads spawned
- `crosslinks_count` (bigint): Number of cross-link references
- `views_count` (integer): View count
- `likes_count` (integer): Like count
- `comments_count` (integer): Comment count
- `shares_count` (integer): Share count

**Filters**:
- Only `mode='business'`
- Only `type='insight'`
- Only `kind='BusinessInsight'`
- Only `status='active'`

**RLS**: Business members can only see insights from their organization

---

### 4. `view_business_org_analytics`

One row per organization with aggregated metrics.

**Purpose**: Organization-level summary for business dashboards.

**Columns**:
- `org_id` (uuid): Organization identifier
- `org_name` (text): Organization name
- `total_insights` (bigint): Count of Business Insights
- `avg_u_score` (numeric): Average U-score across all insights
- `total_u_ratings` (bigint): Total utility ratings received
- `avg_t_score` (numeric): Average T-score across all insights
- `total_continuations` (bigint): Total reply threads spawned
- `total_crosslinks` (bigint): Total cross-link references
- `total_views` (bigint): Aggregate view count
- `total_likes` (bigint): Aggregate like count
- `total_shares` (bigint): Aggregate share count
- `last_insight_published_at` (timestamptz): Most recent insight publication

**Aggregation**: Groups by organization from all Business Insights

**RLS**: Business members can only see analytics for their organization

---

## TypeScript Hooks

### `useOrgAnalytics(orgId)`

Fetch analytics summary for a specific organization.

**Usage**:
```typescript
import { useOrgAnalytics } from '@/hooks/useBusinessAnalytics';

function OrgDashboard({ orgId }: { orgId: string }) {
  const { data, isLoading, error } = useOrgAnalytics(orgId);
  
  if (isLoading) return <div>Loading analytics...</div>;
  if (error) return <div>Error loading analytics</div>;
  
  return (
    <div>
      <h2>{data?.org_name}</h2>
      <p>Total Insights: {data?.total_insights}</p>
      <p>Avg U-Score: {data?.avg_u_score}</p>
      <p>Avg T-Score: {data?.avg_t_score}</p>
    </div>
  );
}
```

---

### `useOrgTopInsights(options)`

Fetch top-performing insights for an organization.

**Options**:
- `orgId` (string): Organization identifier
- `limit` (number, default: 10): Number of insights to return
- `sortBy` ('u_score' | 't_score' | 'continuations' | 'crosslinks' | 'recent', default: 'u_score')

**Usage**:
```typescript
import { useOrgTopInsights } from '@/hooks/useBusinessAnalytics';

function TopInsightsWidget({ orgId }: { orgId: string }) {
  const { data: topInsights, isLoading } = useOrgTopInsights({
    orgId,
    limit: 5,
    sortBy: 'u_score'
  });
  
  return (
    <div>
      <h3>Top 5 Insights by U-Score</h3>
      {topInsights?.map(insight => (
        <div key={insight.post_id}>
          <h4>{insight.title}</h4>
          <p>U-Score: {insight.u_score_avg} ({insight.u_score_count} ratings)</p>
          <p>T-Score: {insight.t_score}</p>
        </div>
      ))}
    </div>
  );
}
```

---

### `useInsightAnalytics(postId)`

Fetch analytics for a single insight post.

**Usage**:
```typescript
import { useInsightAnalytics } from '@/hooks/useBusinessAnalytics';

function InsightDetailPage({ postId }: { postId: string }) {
  const { data: analytics } = useInsightAnalytics(postId);
  
  return (
    <div>
      <h2>{analytics?.title}</h2>
      <div className="metrics">
        <span>U-Score: {analytics?.u_score_avg}</span>
        <span>T-Score: {analytics?.t_score}</span>
        <span>Continuations: {analytics?.continuations_count}</span>
        <span>Cross-links: {analytics?.crosslinks_count}</span>
      </div>
    </div>
  );
}
```

---

### `useAllOrgsAnalytics()`

Fetch analytics for all organizations (admin use).

**Usage**:
```typescript
import { useAllOrgsAnalytics } from '@/hooks/useBusinessAnalytics';

function AdminAnalyticsDashboard() {
  const { data: orgsAnalytics, isLoading } = useAllOrgsAnalytics();
  
  return (
    <div>
      <h2>All Organizations Analytics</h2>
      <table>
        <thead>
          <tr>
            <th>Organization</th>
            <th>Insights</th>
            <th>Avg U-Score</th>
            <th>Avg T-Score</th>
          </tr>
        </thead>
        <tbody>
          {orgsAnalytics?.map(org => (
            <tr key={org.org_id}>
              <td>{org.org_name}</td>
              <td>{org.total_insights}</td>
              <td>{org.avg_u_score}</td>
              <td>{org.avg_t_score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Security

- **RLS Enforcement**: All views respect Row Level Security (RLS)
- **Organization Isolation**: Business members can only access data from their own organization
- **Admin Override**: Admins have full access across all organizations
- **View Security**: Views use `security_invoker = on` to enforce RLS from underlying tables

---

## Performance Considerations

- **Indexes**: `post_utility_ratings` has indexes on `post_id` and `user_id`
- **Aggregation**: Views pre-aggregate data for efficient querying
- **Caching**: React Query automatically caches results with intelligent invalidation

---

## Future Enhancements

1. **Historical Trending**: Track U-score and T-score changes over time
2. **Comparative Analytics**: Compare organization performance
3. **Predictive Scoring**: ML-based prediction of future U-scores
4. **Real-time Updates**: WebSocket-based live score updates
