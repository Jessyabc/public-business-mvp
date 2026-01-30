/**
 * Content sanitization utilities for user-generated content
 * Prevents XSS attacks and other content-based security issues
 */

// Simple HTML sanitizer (for when DOMPurify is overkill)
export function sanitizeHTML(html: string): string {
  // Remove script tags and their content
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove dangerous attributes
  html = html.replace(/\s*on\w+\s*=\s*"[^"]*"/gi, ''); // onclick, onload, etc.
  html = html.replace(/\s*on\w+\s*=\s*'[^']*'/gi, '');
  html = html.replace(/\s*javascript\s*:/gi, '');
  html = html.replace(/\s*vbscript\s*:/gi, '');
  
  // Remove dangerous tags
  const dangerousTags = ['iframe', 'object', 'embed', 'applet', 'link', 'style', 'meta'];
  dangerousTags.forEach(tag => {
    const regex = new RegExp(`<${tag}\\b[^<]*(?:(?!<\\/${tag}>)<[^<]*)*<\\/${tag}>`, 'gi');
    html = html.replace(regex, '');
  });
  
  return html;
}

// Sanitize text content (remove HTML entirely)
export function sanitizeText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&[#\w]+;/g, '') // Remove HTML entities
    .trim();
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
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-_]/g, '_') // Replace special chars with underscore
    .replace(/\.{2,}/g, '.') // Remove multiple dots
    .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
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