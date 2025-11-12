// ============================================================================
// Universal Post Model (Milestone 2)
// ============================================================================

/**
 * Defines whether a post belongs to the public or business mode.
 * - 'public': visible in the open/public side (Sparks, Brainstorms, Branches)
 * - 'business': visible on the business side (Insights, Reports, Department Updates)
 */
export type PostMode = 'public' | 'business';

/**
 * PostType defines the semantic role of a post.
 * Used across both Public and Business sides, unified under one model.
 */
export type PostType =
  | 'spark'              // atomic idea (entry point for brainstorm)
  | 'brainstorm'         // root/meta idea collection
  | 'branch'             // continuation or derived idea
  | 'insight'            // business-level interpretation
  | 'department_update'  // internal/business organizational post
  | 'business_report';   // formalized company report

/**
 * BaseMetrics defines engagement signals used to calculate scores.
 * Note: `utility` is optional and evaluated only in Business Mode.
 */
export interface BaseMetrics {
  views: number;
  saves: number;
  shares: number;
  t_score: number;        // views + saves + continuation weight
  involvement: number;    // reads(0.5) + saves(1) + hardlinks(2) + softlinks(1) + bizlink(3)
  utility?: number;       // business-side metric only (optional)
}

/**
 * BasePost represents the universal post entity used throughout PB.
 * It merges Public and Business post structures into one flexible schema.
 */
export interface BasePost {
  id: string;
  author_id: string;
  org_id?: string | null;       // optional org association (Business posts)
  type: PostType;               // spark, brainstorm, insight, etc.
  title?: string | null;
  content?: string | null;
  created_at: string;
  updated_at: string;
  linked_post_ids: string[];    // IDs of related posts (also represented in PostLink table)
  privacy: 'public' | 'private';
  mode: PostMode;               // 'public' or 'business'
  metrics: BaseMetrics;         // engagement/score tracking
}

/**
 * LinkType defines the connection semantics between posts.
 * - hard: direct continuation (branch or follow-up)
 * - soft: conceptual or thematic link
 * - biz_out: link from a business post to a public idea
 * - biz_in: link from a public brainstorm into a business insight/report
 */
export type LinkType = 'hard' | 'soft' | 'biz_out' | 'biz_in';

/**
 * PostLink defines the explicit relation between two posts.
 * Used to visualize cross-mode continuity (spark ↔ brainstorm ↔ insight).
 */
export interface PostLink {
  id: string;
  source_post_id: string;
  target_post_id: string;
  link_type: LinkType;
  weight: number;           // visual strength (used for graph opacity/thickness)
  created_at: string;
}

// ============================================================================
// Legacy Brainstorm Types (for graph visualization)
// ============================================================================

export interface BrainstormNode {
  id: string;
  title: string;
  content: string;
  emoji?: string;
  tags: string[];
  position: { x: number; y: number };
  created_at: string;
  author: string;
  likes_count?: number;
  views_count?: number;
}

export interface BrainstormEdge {
  id: string;
  source: string;
  target: string;
  type: 'hard' | 'soft';
  note?: string;
  created_at: string;
}

export interface BrainstormState {
  nodes: BrainstormNode[];
  edges: BrainstormEdge[];
  selectedNode: string | null;
  selectedEdge: string | null;
  isCreatingLink: boolean;
  searchTerm: string;
  showHardEdges: boolean;
  showSoftEdges: boolean;
}

export interface NodeFormData {
  title: string;
  content: string;
  emoji: string;
  tags: string[];
}

export interface LinkFormData {
  type: 'hard' | 'soft';
  note: string;
}