import { BasePost } from '@/types/post';
import { IdeaBrainstorm } from '@/hooks/useOpenIdeas';

/**
 * Converts an IdeaBrainstorm (legacy format) to BasePost (canonical format)
 * IdeaBrainstorm is already mapped from posts, so this is mostly a type conversion
 */
export function ideaBrainstormToBasePost(brainstorm: IdeaBrainstorm): BasePost {
  return {
    id: brainstorm.id,
    user_id: brainstorm.user_id || brainstorm.author_user_id || '',
    title: brainstorm.title || null,
    content: brainstorm.content,
    body: brainstorm.content, // Use content as body
    type: 'brainstorm',
    kind: 'Spark',
    visibility: (brainstorm.visibility as BasePost['visibility']) || 'public',
    mode: 'public',
    status: 'active',
    org_id: null,
    industry_id: null,
    department_id: null,
    metadata: null,
    likes_count: 0,
    comments_count: 0,
    views_count: 0,
    t_score: null,
    u_score: null,
    published_at: null,
    created_at: brainstorm.created_at,
    updated_at: brainstorm.created_at,
  };
}

