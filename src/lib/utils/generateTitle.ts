/**
 * Generate a suggested title from Insight 1 text
 * Deterministic, no AI, no external APIs
 */

const FILLER_PHRASES = [
  /^i learned that\s+/i,
  /^we learned that\s+/i,
  /^this showed that\s+/i,
  /^we realized that\s+/i,
  /^it turns out that\s+/i,
  /^i found that\s+/i,
  /^we found that\s+/i,
  /^it appears that\s+/i,
  /^it seems that\s+/i,
];

/**
 * Extract first sentence from text
 */
function getFirstSentence(text: string): string {
  if (!text || !text.trim()) return '';

  // Find first sentence ending punctuation
  const sentenceEnders = /[.!?]\s+/;
  const match = text.match(sentenceEnders);
  
  if (match && match.index !== undefined) {
    return text.substring(0, match.index + 1).trim();
  }
  
  // No punctuation found, treat whole text as one sentence
  return text.trim();
}

/**
 * Remove common filler phrases from the beginning
 */
function removeFillerPhrases(text: string): string {
  let cleaned = text;
  
  for (const pattern of FILLER_PHRASES) {
    cleaned = cleaned.replace(pattern, '');
  }
  
  return cleaned.trim();
}

/**
 * Convert to sentence case (first letter capitalized, rest lowercase)
 * But preserve proper capitalization for acronyms and proper nouns where possible
 */
function toSentenceCase(text: string): string {
  if (!text) return '';
  
  // Trim and get first character
  const trimmed = text.trim();
  if (!trimmed) return '';
  
  // Capitalize first letter, lowercase the rest
  const firstChar = trimmed[0].toUpperCase();
  const rest = trimmed.slice(1).toLowerCase();
  
  return firstChar + rest;
}

/**
 * Trim to max length while preserving meaning
 * Prefers breaking at word boundaries
 */
function trimToMaxLength(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  
  // Try to break at last word boundary before maxLength
  const trimmed = text.substring(0, maxLength);
  const lastSpace = trimmed.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.7) {
    // If we have a space in the last 30% of the text, break there
    return trimmed.substring(0, lastSpace);
  }
  
  // Otherwise, just cut at maxLength
  return trimmed;
}

/**
 * Remove trailing punctuation (except if it's part of the sentence structure)
 */
function cleanPunctuation(text: string): string {
  // Remove trailing period, but keep other punctuation that might be meaningful
  return text.replace(/\.$/, '').trim();
}

/**
 * Generate a suggested title from insight text
 */
export function generateSuggestedTitle(insightText: string): string {
  // Edge case: empty input
  if (!insightText || !insightText.trim()) {
    return '';
  }

  // Edge case: avoid vague titles
  const trimmedInput = insightText.trim().toLowerCase();
  if (trimmedInput === 'insight' || trimmedInput === 'observation' || trimmedInput.length < 10) {
    return '';
  }

  // Step 1: Get first complete sentence
  let title = getFirstSentence(insightText);
  
  if (!title) return '';

  // Step 2: Remove filler phrases
  title = removeFillerPhrases(title);
  
  if (!title) return '';

  // Step 3: Convert to sentence case
  title = toSentenceCase(title);

  // Step 4: Remove trailing period (we want no punctuation at end)
  title = cleanPunctuation(title);

  // Step 5: Trim to max 80 characters
  title = trimToMaxLength(title, 80);

  // Final validation: avoid very short or vague titles
  if (title.length < 10) {
    return '';
  }

  return title;
}

