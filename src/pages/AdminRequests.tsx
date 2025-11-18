import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { isAdmin } from '@/lib/admin';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BusinessRequest {
  id: string;
  user_id: string;
  company_name: string;
  website: string | null;
  bio: string | null;
  status: string;
  display_name?: string;
  email?: string;
}

export default function AdminRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BusinessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isAdmin(user.id)) {
      return;
    }
    loadRequests();
  }, [user]);

  const loadRequests = async () => {
    if (!user || !isAdmin(user.id)) return;

    try {
      // Get profiles with business membership requests
      // Note: We need to handle the case where request_business_membership might be null
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, display_name, company')
        .eq('request_business_membership', true)
        .or('is_business_member.is.null,is_business_member.eq.false');

      if (profileError) throw profileError;

      // Get business_profiles for these users
      const userIds = profiles?.map(p => p.id) || [];
      if (userIds.length === 0) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const { data: businessProfiles, error: bpError } = await supabase
        .from('business_profiles')
        .select('*')
        .in('user_id', userIds)
        .eq('status', 'pending');

      if (bpError) throw bpError;

      // Combine data
      const combined = (businessProfiles || []).map(bp => {
        const profile = profiles?.find(p => p.id === bp.user_id);
        return {
          id: bp.id,
          user_id: bp.user_id,
          company_name: bp.company_name,
          website: bp.website,
          bio: bp.bio,
          status: bp.status,
          display_name: profile?.display_name || 'Unknown',
        };
      });

      setRequests(combined);
    } catch (error: any) {
      console.error('Error loading requests:', error);
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: BusinessRequest) => {
    if (!user || !isAdmin(user.id)) return;

    setApproving(request.id);
    try {
      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('orgs')
        .insert({
          name: request.company_name,
          description: request.bio || null,
          logo_url: null, // Could be added from business_profiles if we store it
          created_by: request.user_id,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Insert org membership
      const { error: memberError } = await supabase
        .from('org_members')
        .insert({
          user_id: request.user_id,
          org_id: org.id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      // Update business_profile status
      const { error: bpError } = await supabase
        .from('business_profiles')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user.id,
        })
        .eq('id', request.id);

      if (bpError) throw bpError;

      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_business_member: true,
          business_profile_id: org.id,
          request_business_membership: false,
        })
        .eq('id', request.user_id);

      if (profileError) throw profileError;

      // Grant business_user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: request.user_id,
          role: 'business_user',
        })
        .select()
        .single();

      // Ignore error if role already exists
      if (roleError && !roleError.message.includes('duplicate')) {
        console.warn('Could not grant business_user role:', roleError);
      }

      toast.success(`Approved business membership for ${request.company_name}`);
      await loadRequests();
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast.error(error.message || 'Failed to approve request');
    } finally {
      setApproving(null);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p>Please sign in to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin(user.id)) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive">Access denied. Admin only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p>Loading requests...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Business Membership Requests</CardTitle>
          <CardDescription>Review and approve business membership requests</CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No pending requests</p>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{request.company_name}</h3>
                          <Badge variant="outline">{request.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Requested by: {request.display_name}
                        </p>
                        {request.website && (
                          <p className="text-sm">
                            <a
                              href={request.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {request.website}
                            </a>
                          </p>
                        )}
                        {request.bio && (
                          <p className="text-sm text-muted-foreground">{request.bio}</p>
                        )}
                      </div>
                      <Button
                        onClick={() => handleApprove(request)}
                        disabled={approving === request.id}
                        size="sm"
                      >
                        {approving === request.id ? 'Approving...' : 'Approve'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

