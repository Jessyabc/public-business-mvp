interface TScoreInputs {
  textLength: number;
  replyCount: number;
  recencyMinutes: number;
}

/**
 * Calculate T-score (Thought Score) based on content quality indicators
 * 
 * Formula combines:
 * - Content length (longer = more thoughtful, diminishing returns)
 * - Reply engagement (each reply adds significant value)
 * - Recency bonus (fresh ideas get a boost, decays over time)
 * 
 * @param inputs - The scoring factors
 * @returns T-score from 0-100
 */
export function calculateTScore({ 
  textLength, 
  replyCount, 
  recencyMinutes 
}: TScoreInputs): number {
  // Base score from content length (0-40 points)
  // Optimal length around 200 chars, diminishing returns after
  const lengthScore = Math.min(40, Math.log(textLength + 1) * 8);
  
  // Reply multiplier (0-50 points)
  // Each reply is worth decreasing value to prevent spam gaming
  const replyScore = Math.min(50, replyCount * 8 - Math.pow(replyCount, 1.5));
  
  // Recency bonus (0-20 points, decays over 48 hours)
  const maxRecencyHours = 48 * 60; // 48 hours in minutes
  const recencyScore = Math.max(0, 20 * (1 - recencyMinutes / maxRecencyHours));
  
  // Combine scores and ensure 0-100 range
  const total = lengthScore + replyScore + recencyScore;
  return Math.max(0, Math.min(100, Math.round(total)));
}

/**
 * Get a human-readable description of T-score ranges
 */
export function getTScoreLabel(score: number): string {
  if (score >= 90) return 'Exceptional';
  if (score >= 75) return 'Strong';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Developing';
  if (score >= 20) return 'Emerging';
  return 'New';
}

/**
 * Get color variant for T-score display
 */
export function getTScoreBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' {
  if (score >= 75) return 'default'; // Primary color for high scores
  if (score >= 40) return 'secondary'; // Muted for medium scores  
  return 'destructive'; // Warning color for low scores
}