/**
 * CANONICAL POST SYSTEM
 * 
 * This module provides the single source of truth for post creation and management.
 * 
 * Architecture:
 * - All content lives in the posts table
 * - All relationships live in post_relations
 * - Posts never change species after creation
 * - Type, kind, mode, org_id are immutable
 * - Only content and title are mutable
 * 
 * Post Types:
 * - Spark: type='brainstorm', kind='Spark', mode='public', visibility='public', org_id=null
 * - Business Insight: type='insight', kind='BusinessInsight', mode='business', visibility='my_business', org_id!=null
 * 
 * Relation Types:
 * - 'reply': Child continues parent (formerly 'hard')
 * - 'cross_link': Child references parent (formerly 'soft')
 * - 'origin': Parent is the source of child
 * - 'quote': Child quotes parent
 */

// Builders
export {
  buildSparkPayload,
  buildBusinessInsightPayload,
  buildPostUpdatePayload,
  validatePostPayload,
  type SparkParams,
  type BusinessInsightParams,
  type PostInsert,
} from './builders';

// Relations
export {
  createPostRelation,
  createSoftLinks,
  createHardLink,
  deletePostRelation,
  fetchPostRelations,
  fetchChildPosts,
  type CreateRelationParams,
} from './relations';
