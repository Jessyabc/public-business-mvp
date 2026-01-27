-- Add shares_count column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS shares_count integer DEFAULT 0;

-- ============================================
-- U-Score Infrastructure (Prerequisite for Business Analytics)
-- ============================================

-- Table: post_utility_ratings
-- Stores utility ratings (1-5) from users on Business Insights
CREATE TABLE IF NOT EXISTS post_utility_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating smallint NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS
ALTER TABLE post_utility_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_utility_ratings
CREATE POLICY "Users can insert their own ratings"
ON post_utility_ratings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings"  
ON post_utility_ratings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can view all ratings"
ON post_utility_ratings
FOR SELECT
USING (true);

-- Index for performance
CREATE INDEX idx_post_utility_ratings_post_id ON post_utility_ratings(post_id);
CREATE INDEX idx_post_utility_ratings_user_id ON post_utility_ratings(user_id);

-- View: Post U-Score (Utility Score)
-- Aggregates utility ratings per post
CREATE OR REPLACE VIEW view_post_u_score AS
SELECT 
  post_id,
  ROUND(AVG(rating)::numeric, 2) as u_score_avg,
  COUNT(*) as u_score_count,
  COUNT(*) FILTER (WHERE rating >= 4) as positive_ratings,
  COUNT(*) FILTER (WHERE rating <= 2) as negative_ratings
FROM post_utility_ratings
GROUP BY post_id;

-- View: Post T-Score (Thought Score)
-- Uses existing t_score column from posts table
CREATE OR REPLACE VIEW view_post_t_score AS
SELECT 
  id as post_id,
  COALESCE(t_score, 0) as t_score,
  LENGTH(content) as content_length,
  comments_count as reply_count,
  EXTRACT(EPOCH FROM (now() - created_at)) / 60 as age_minutes
FROM posts
WHERE status = 'active';

-- ============================================
-- Business Analytics Views (U-score centric)
-- ============================================

-- View 1: Business Insight Analytics
-- One row per Business Insight with utility metrics
CREATE OR REPLACE VIEW view_business_insight_analytics AS
SELECT 
  p.id as post_id,
  p.org_id,
  p.title,
  p.published_at,
  p.created_at,
  COALESCE(vpu.u_score_avg, 0) as u_score_avg,
  COALESCE(vpu.u_score_count, 0) as u_score_count,
  COALESCE(vpt.t_score, 0) as t_score,
  -- Count continuations (hard reply relations where this post is parent)
  (
    SELECT COUNT(*)
    FROM post_relations pr
    WHERE pr.parent_post_id = p.id
    AND pr.relation_type = 'reply'
  ) as continuations_count,
  -- Count crosslinks (cross_link relations where this post is referenced)
  (
    SELECT COUNT(*)
    FROM post_relations pr
    WHERE pr.parent_post_id = p.id
    AND pr.relation_type = 'cross_link'
  ) as crosslinks_count,
  COALESCE(p.views_count, 0) as views_count,
  COALESCE(p.likes_count, 0) as likes_count,
  COALESCE(p.comments_count, 0) as comments_count,
  COALESCE(p.shares_count, 0) as shares_count
FROM posts p
LEFT JOIN view_post_u_score vpu ON vpu.post_id = p.id
LEFT JOIN view_post_t_score vpt ON vpt.post_id = p.id
WHERE p.mode = 'business'
  AND p.type = 'insight'
  AND p.kind = 'BusinessInsight'
  AND p.status = 'active';

-- View 2: Organization Analytics Summary
-- One row per organization with aggregated metrics
CREATE OR REPLACE VIEW view_business_org_analytics AS
SELECT 
  o.id as org_id,
  o.name as org_name,
  -- Total insights count
  COUNT(DISTINCT p.id) as total_insights,
  -- Average U-score across all insights
  ROUND(AVG(vpu.u_score_avg)::numeric, 2) as avg_u_score,
  -- Total U-score ratings received
  COALESCE(SUM(vpu.u_score_count), 0) as total_u_ratings,
  -- Average T-score (thought quality signal)
  ROUND(AVG(vpt.t_score)::numeric, 2) as avg_t_score,
  -- Total continuations (replies spawned)
  COALESCE(SUM(
    (SELECT COUNT(*)
     FROM post_relations pr
     WHERE pr.parent_post_id = p.id
     AND pr.relation_type = 'reply')
  ), 0) as total_continuations,
  -- Total crosslinks (references to insights)
  COALESCE(SUM(
    (SELECT COUNT(*)
     FROM post_relations pr
     WHERE pr.parent_post_id = p.id
     AND pr.relation_type = 'cross_link')
  ), 0) as total_crosslinks,
  -- Aggregate engagement
  COALESCE(SUM(p.views_count), 0) as total_views,
  COALESCE(SUM(p.likes_count), 0) as total_likes,
  COALESCE(SUM(p.shares_count), 0) as total_shares,
  -- Most recent insight date
  MAX(p.published_at) as last_insight_published_at
FROM orgs o
LEFT JOIN posts p ON p.org_id = o.id 
  AND p.mode = 'business'
  AND p.type = 'insight'
  AND p.kind = 'BusinessInsight'
  AND p.status = 'active'
LEFT JOIN view_post_u_score vpu ON vpu.post_id = p.id
LEFT JOIN view_post_t_score vpt ON vpt.post_id = p.id
GROUP BY o.id, o.name;