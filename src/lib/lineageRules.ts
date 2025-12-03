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

export type RelationKind = "origin" | "reply" | "continu" | "cross_link";

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
 * Allowed relations (all semantic types supported):
 * - Spark ↔ Spark (all relation types)
 * - Spark ↔ Business Insight (all relation types)
 * - Business Insight ↔ Business Insight (all relation types)
 *
 * Relation types and their meanings:
 * - 'origin': Parent is the source/origin of child (e.g., idea → insight)
 * - 'reply': Child responds to parent (e.g., comment, continuation)
 * - 'quote': Child quotes/references parent
 * - 'cross_link': Bidirectional association (replaced 'soft')
 *
 * Disallowed:
 * - Any relation where either side is not a Spark or Business Insight
 * - Open ideas use legacy idea_links table (being deprecated)
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

  // Allowed combinations:
  // 1. Spark ↔ Spark
  if (parentIsSpark && childIsSpark) {
    return true;
  }

  // 2. Spark ↔ Business Insight (or vice versa)
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
