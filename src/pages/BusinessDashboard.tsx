import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, FileText } from 'lucide-react';

interface OrgInfo {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  created_at: string;
}

export default function BusinessDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    loadOrgInfo();
  }, [user, navigate]);

  const loadOrgInfo = async () => {
    if (!user) return;

    try {
      // Get user's org membership
      const { data: membership, error: memberError } = await supabase
        .from('org_members')
        .select('org_id')
        .eq('user_id', user.id)
        .eq('role', 'owner')
        .single();

      if (memberError || !membership) {
        // Check if user has business_profile_id in profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('business_profile_id')
          .eq('id', user.id)
          .single();

        if (profile?.business_profile_id) {
          const { data: orgData, error: orgError } = await supabase
            .from('orgs')
            .select('*')
            .eq('id', profile.business_profile_id)
            .single();

          if (!orgError && orgData) {
            setOrg(orgData);
            setLoading(false);
            return;
          }
        }

        // No org found - redirect to become business member
        navigate('/become-business-member');
        return;
      }

      // Get org details
      const { data: orgData, error: orgError } = await supabase
        .from('orgs')
        .select('*')
        .eq('id', membership.org_id)
        .single();

      if (orgError) throw orgError;

      setOrg(orgData);
    } catch (error: any) {
      console.error('Error loading org info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p>No organization found. Please request business membership.</p>
            <Button onClick={() => navigate('/become-business-member')} className="mt-4">
              Become Business Member
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Business Dashboard</h1>
          <p className="text-muted-foreground">Manage your organization and insights</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              <CardTitle>{org.name}</CardTitle>
            </div>
            {org.description && (
              <CardDescription>{org.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Organization ID</p>
                <p className="font-mono text-sm">{org.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm">{new Date(org.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                <CardTitle>Insights</CardTitle>
              </div>
              <CardDescription>View and manage business insights</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/app/insights')} className="w-full">
                Go to Insights
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>Team</CardTitle>
              </div>
              <CardDescription>Manage organization members</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
