export type AdminOpenIdeaSource = 'intake' | 'user';

export type AdminOpenIdeaStatus = 'pending' | 'approved' | 'rejected';

export interface AdminPendingIdea {
  id: string;
  source: AdminOpenIdeaSource;
  text: string;
  status: AdminOpenIdeaStatus;
  created_at: string | null;
  user_id: string | null;
}

export interface AdminListPendingRequest {
  limit?: number;
}

export interface AdminApprovalResult extends AdminPendingIdea {}

export interface AdminApprovalPayload {
  id: string;
}
