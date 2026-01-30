/**
 * Content sanitization utilities for user-generated content
 * Prevents XSS attacks and other content-based security issues
 * 
 * Uses DOMPurify for secure HTML sanitization instead of vulnerable regex patterns
 */

import DOMPurify from 'dompurify';

// Secure HTML sanitizer using DOMPurify (prevents ReDoS and XSS attacks)
export function sanitizeHTML(html: string): string {
  // Use DOMPurify which is battle-tested and secure
  // It properly handles script tags, event handlers, and dangerous attributes
  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      ALLOWED_ATTR: ['href', 'title'],
      ALLOW_DATA_ATTR: false,
    });
  }
  
  // Fallback for server-side: strip all HTML tags
  return sanitizeText(html);
}

// Sanitize text content (remove HTML entirely)
// Uses a safer approach that avoids ReDoS vulnerabilities
export function sanitizeText(text: string): string {
  if (typeof window !== 'undefined') {
    // Use DOMPurify to strip all HTML, which is more secure than regex
    return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
  }
  
  // Fallback: simple tag removal with length limit to prevent ReDoS
  // Limit input length to prevent catastrophic backtracking
  if (text.length > 100000) {
    text = text.substring(0, 100000);
  }
  
  // Use a simpler, safer regex that doesn't cause ReDoS
  let result = text;
  // Remove HTML tags (non-greedy match with length limit)
  result = result.replace(/<[^>]{0,1000}>/g, '');
  // Remove HTML entities (with length limit)
  result = result.replace(/&[#\w]{0,20};/g, '');
  
  return result.trim();
}

// Sanitize and validate URLs
export function sanitizeURL(url: string): string | null {
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    
    // Block potentially dangerous domains
    const dangerousDomains = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1',
    ];
    
    if (dangerousDomains.some(domain => parsed.hostname.includes(domain))) {
      return null;
    }
    
    return parsed.toString();
  } catch {
    return null;
  }
}

// Sanitize email addresses
export function sanitizeEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cleaned = email.trim().toLowerCase();
  
  if (!emailRegex.test(cleaned)) {
    return null;
  }
  
  // Basic length limits
  if (cleaned.length > 254) {
    return null;
  }
  
  return cleaned;
}

// Sanitize file names (for uploads)
// Uses a more restrictive character set to prevent security issues
export function sanitizeFileName(fileName: string): string {
  // More restrictive: only allow alphanumeric, dots, hyphens, and underscores
  // This prevents path traversal and other file system attacks
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Only allow safe characters
    .replace(/\.{2,}/g, '.') // Remove multiple consecutive dots (prevents ..)
    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .slice(0, 255); // Limit length
}

// Content filtering for user posts/comments
export function filterUserContent(content: string, options: {
  allowHTML?: boolean;
  maxLength?: number;
  blockProfanity?: boolean;
} = {}): {
  content: string;
  blocked: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  let processed = content;

  // Length check
  if (options.maxLength && processed.length > options.maxLength) {
    processed = processed.slice(0, options.maxLength);
    reasons.push(`Content truncated to ${options.maxLength} characters`);
  }

  // HTML handling
  if (!options.allowHTML) {
    processed = sanitizeText(processed);
  } else {
    processed = sanitizeHTML(processed);
  }

  // Basic profanity filter (very simple implementation)
  if (options.blockProfanity) {
    const profanityPatterns = [
      /\b(fuck|shit|damn)\b/gi,
      // Add more patterns as needed
    ];
    
    const hasProfanity = profanityPatterns.some(pattern => pattern.test(processed));
    if (hasProfanity) {
      reasons.push('Content contains inappropriate language');
      // You might want to actually filter it or just flag it
    }
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /javascript:/i,
    /vbscript:/i,
    /data:text\/html/i,
    /<script/i,
    /onclick=/i,
    /onerror=/i,
  ];

  const hasSuspiciousContent = suspiciousPatterns.some(pattern => pattern.test(content));
  if (hasSuspiciousContent) {
    reasons.push('Content contains potentially malicious code');
  }

  return {
    content: processed,
    blocked: hasSuspiciousContent,
    reasons,
  };
}

// Escape special characters for safe display
export function escapeHTML(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Rate limiting for content submission
export class ContentRateLimiter {
  private submissions: Map<string, number[]> = new Map();
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit: number = 10, windowMs: number = 60000) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  canSubmit(userId: string): boolean {
    const now = Date.now();
    const userSubmissions = this.submissions.get(userId) || [];
    
    // Remove old submissions outside the window
    const recentSubmissions = userSubmissions.filter(time => now - time < this.windowMs);
    
    // Update the map
    this.submissions.set(userId, recentSubmissions);
    
    return recentSubmissions.length < this.limit;
  }

  recordSubmission(userId: string): void {
    const now = Date.now();
    const userSubmissions = this.submissions.get(userId) || [];
    userSubmissions.push(now);
    this.submissions.set(userId, userSubmissions);
  }

  getRemainingTime(userId: string): number {
    const userSubmissions = this.submissions.get(userId) || [];
    if (userSubmissions.length === 0) return 0;
    
    const oldestSubmission = Math.min(...userSubmissions);
    const timeUntilReset = this.windowMs - (Date.now() - oldestSubmission);
    
    return Math.max(0, timeUntilReset);
  }
}

// Global content rate limiter instance
export const globalContentLimiter = new ContentRateLimiter();