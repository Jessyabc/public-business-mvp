// Database table name constants - centralized for easy configuration
export const TABLES = {
  // Brainstorm data stored in posts table with type='brainstorm'
  BRAINSTORM_NODES: 'posts',
  BRAINSTORM_EDGES: 'post_relations',  // Using existing relations table
  
  // Open ideas and related data  
  OPEN_IDEAS: 'open_ideas',
  IDEA_BRAINSTORMS: 'idea_brainstorms',
  
  // User activity tracking
  HISTORY: 'analytics_events',
  
  // Business feed (if exists)
  BUSINESS_FEED_VIEW: 'posts' // Filter by mode='business'
} as const;

// Additional filter constants
export const BRAINSTORM_FILTERS = {
  TYPE: 'brainstorm',
  MODE: 'public',
  STATUS: 'active'
} as const;

export const BUSINESS_FILTERS = {
  MODE: 'business',
  STATUS: 'active'
} as const;