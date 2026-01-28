/**
 * Lineage rules for post relations.
 *
 * Defines which post types/kinds can be linked together via post_relations.
 *
 * UPDATED: Now uses standardized relation types:
 * - 'origin' - Parent is the origin/source of child
 * - 'reply' - Child is a reply/response to parent
 * - 'quote' - Child quotes/references parent
 * - 'cross_link' - Bidirectional association
 */

export interface LineageNode {
  id: string;
  type: string; // Must match posts.type
  kind?: string; // posts.kind
  mode?: string; // posts.mode
  visibility?: string; // posts.visibility
}

export type RelationKind = "origin" | "reply" | "quote" | "continu" | "cross_link";

// Legacy support: map old types to new
export function normalizeRelationType(oldType: string): RelationKind {
  switch (oldType) {
    case "hard":
      return "origin";
    case "soft":
      return "cross_link";
    case "biz_in":
    case "biz_out":
      return "cross_link";
    default:
      return oldType as RelationKind;
  }
}

/**
 * Checks if a node is a Spark.
 * Spark = kind='Spark' AND type='brainstorm'
 */
export function isSpark(node: LineageNode): boolean {
  return node.type === "brainstorm" && node.kind === "Spark";
}

/**
 * Checks if a node is a Business Insight.
 * Business Insight = kind='BusinessInsight' AND type='insight'
 */
export function isBusinessInsight(node: LineageNode): boolean {
  return node.type === "insight" && node.kind === "BusinessInsight";
}

/**
 * Determines if two nodes can be linked with the given relation type.
 *
 * Relation types and their rules:
 * - 'origin': Continuation (direct thread) - ONLY allowed between same types:
 *   - Spark → Spark (continuation)
 *   - Business Insight → Business Insight (continuation)
 *   - NOT allowed: Spark ↔ Business Insight
 * 
 * - 'cross_link': Cross-reference (linking) - Allowed between any types:
 *   - Spark ↔ Spark
 *   - Spark ↔ Business Insight
 *   - Business Insight ↔ Business Insight
 *
 * - 'reply': Child responds to parent (e.g., comment)
 * - 'quote': Child quotes/references parent
 *
 * Disallowed:
 * - Any relation where either side is not a Spark or Business Insight
 * - Continuations ('origin') between different types
 *
 * @param parent - The parent node
 * @param child - The child node
 * @param relationType - The type of relation
 * @returns true if the relation is allowed, false otherwise
 */
export function canLink(parent: LineageNode, child: LineageNode, relationType: RelationKind): boolean {
  const parentIsSpark = isSpark(parent);
  const parentIsBusinessInsight = isBusinessInsight(parent);
  const childIsSpark = isSpark(child);
  const childIsBusinessInsight = isBusinessInsight(child);

  // Both nodes must be either Spark or Business Insight
  if (!parentIsSpark && !parentIsBusinessInsight) {
    return false;
  }
  if (!childIsSpark && !childIsBusinessInsight) {
    return false;
  }

  // Special rule for continuations ('origin'): Only allowed between same types
  if (relationType === 'origin') {
    // Spark → Spark continuation: allowed
    if (parentIsSpark && childIsSpark) {
      return true;
    }
    // Business Insight → Business Insight continuation: allowed
    if (parentIsBusinessInsight && childIsBusinessInsight) {
      return true;
    }
    // Cross-type continuations: NOT allowed
    return false;
  }

  // For all other relation types (cross_link, reply, quote): allow any combination
  // 1. Spark ↔ Spark
  if (parentIsSpark && childIsSpark) {
    return true;
  }

  // 2. Spark ↔ Business Insight (or vice versa) - allowed for cross-links/references
  if ((parentIsSpark && childIsBusinessInsight) || (parentIsBusinessInsight && childIsSpark)) {
    return true;
  }

  // 3. Business Insight ↔ Business Insight
  if (parentIsBusinessInsight && childIsBusinessInsight) {
    return true;
  }

  // All other combinations are disallowed
  return false;
}
