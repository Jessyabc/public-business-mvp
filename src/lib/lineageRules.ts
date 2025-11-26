/**
 * Lineage rules for post relations.
 * 
 * Defines which post types/kinds can be linked together via post_relations.
 */

export interface LineageNode {
  id: string;
  type: string; // Must match posts.type
  kind?: string; // posts.kind
  mode?: string; // posts.mode
  visibility?: string; // posts.visibility
}

export type RelationKind = 'hard' | 'soft';

/**
 * Checks if a node is a Spark.
 * Spark = kind='Spark' AND type='brainstorm'
 */
export function isSpark(node: LineageNode): boolean {
  return node.type === 'brainstorm' && node.kind === 'Spark';
}

/**
 * Checks if a node is a Business Insight.
 * Business Insight = kind='BusinessInsight' AND type='insight'
 */
export function isBusinessInsight(node: LineageNode): boolean {
  return node.type === 'insight' && node.kind === 'BusinessInsight';
}

/**
 * Determines if two nodes can be linked with the given relation type.
 * 
 * Allowed relations (direction-agnostic, enforced symmetrically):
 * - Spark ↔ Spark (both 'hard' and 'soft')
 * - Spark ↔ Business Insight (both 'hard' and 'soft')
 * - Business Insight ↔ Business Insight (both 'hard' and 'soft')
 * 
 * Disallowed:
 * - Any relation where either side is not a Spark or Business Insight
 * - Open ideas are not handled (they don't use post_relations)
 * 
 * @param parent - The parent node
 * @param child - The child node
 * @param relationType - The type of relation ('hard' or 'soft')
 * @returns true if the relation is allowed, false otherwise
 */
export function canLink(
  parent: LineageNode,
  child: LineageNode,
  relationType: RelationKind
): boolean {
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

