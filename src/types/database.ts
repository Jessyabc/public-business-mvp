export interface Industry {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface BusinessProfile {
  id: string;
  user_id: string;
  company_name: string;
  industry_id?: string | null;
  department_id?: string | null;
  company_size?: string | null;
  phone?: string | null;
  website?: string | null;
  linkedin_url?: string | null;
  bio?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  industry?: Industry;
  department?: Department;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'business_user' | 'public_user';
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  type: 'brainstorm' | 'insight' | 'report' | 'whitepaper' | 'webinar' | 'video';
  visibility: 'public' | 'my_business' | 'other_businesses' | 'draft';
  mode: 'public' | 'business';
  industry_id?: string;
  department_id?: string;
  metadata: any;
  likes_count: number;
  comments_count: number;
  views_count: number;
  t_score?: number;
  u_score?: number;
  status: 'active' | 'archived' | 'deleted';
  created_at: string;
  updated_at: string;
}