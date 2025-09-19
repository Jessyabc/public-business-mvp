import * as DOMPurify from 'dompurify';

export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target', 'rel'],
  });
};

export const sanitizeText = (text: string): string => {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
};

export const formatContent = (content: string): string => {
  // Convert line breaks to <br> tags and sanitize
  const formatted = content.replace(/\n/g, '<br>');
  return sanitizeHtml(formatted);
};