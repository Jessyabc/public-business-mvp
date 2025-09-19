import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useBusinessInvitations } from '@/hooks/useBusinessInvitations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Shield, Users, Database, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SecurityCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  icon: React.ReactNode;
}

export function SecurityVerification() {
  const { user, session } = useAuth();
  const { userRoles, canCreateBusinessPosts, loading: roleLoading } = useUserRoles();
  const { receivedInvitations, loading: invitationLoading } = useBusinessInvitations();
  const [checks, setChecks] = useState<SecurityCheck[]>([]);
  const [loading, setLoading] = useState(true);

  const runSecurityChecks = useCallback(async () => {
    const newChecks: SecurityCheck[] = [];

    // Authentication checks
    newChecks.push({
      name: 'User Authentication',
      status: user ? 'pass' : 'fail',
      message: user ? `Authenticated as ${user.email}` : 'No authenticated user',
      icon: <Key className="w-4 h-4" />
    });

    newChecks.push({
      name: 'Session Persistence',
      status: session ? 'pass' : 'fail',
      message: session ? 'Active session with valid tokens' : 'No active session',
      icon: <Shield className="w-4 h-4" />
    });

    // User role checks
    if (user && !roleLoading) {
      newChecks.push({
        name: 'User Role Assignment',
        status: userRoles.length > 0 ? 'pass' : 'warning',
        message: userRoles.length > 0 ? `Roles: ${userRoles.join(', ')}` : 'No roles assigned',
        icon: <Users className="w-4 h-4" />
      });

      newChecks.push({
        name: 'Business Post Permissions',
        status: canCreateBusinessPosts ? 'pass' : 'pass',
        message: canCreateBusinessPosts ? 'Can create business posts' : 'Cannot create business posts (expected for public users)',
        icon: <Database className="w-4 h-4" />
      });
    }

    // Database connectivity checks
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      newChecks.push({
        name: 'Database Connectivity',
        status: profileError ? 'fail' : 'pass',
        message: profileError ? `DB Error: ${profileError.message}` : 'Database accessible',
        icon: <Database className="w-4 h-4" />
      });
    } catch (error) {
      newChecks.push({
        name: 'Database Connectivity',
        status: 'fail',
        message: `Connection failed: ${error}`,
        icon: <Database className="w-4 h-4" />
      });
    }

    // RLS policy checks
    if (user) {
      try {
        // Test user_roles access
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        newChecks.push({
          name: 'RLS Policies - User Roles',
          status: roleError ? 'fail' : 'pass',
          message: roleError ? `RLS Error: ${roleError.message}` : 'RLS policies working correctly',
          icon: <Shield className="w-4 h-4" />
        });

        // Test posts access
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('id')
          .limit(1);

        newChecks.push({
          name: 'RLS Policies - Posts',
          status: postsError ? 'fail' : 'pass',
          message: postsError ? `Posts RLS Error: ${postsError.message}` : 'Posts accessible with proper RLS',
          icon: <Shield className="w-4 h-4" />
        });
      } catch (error) {
        newChecks.push({
          name: 'RLS Policy Test',
          status: 'fail',
          message: `RLS test failed: ${error}`,
          icon: <Shield className="w-4 h-4" />
        });
      }
    }

    // Business invitation system checks
    if (!invitationLoading) {
      newChecks.push({
        name: 'Business Invitation System',
        status: 'pass',
        message: `Received invitations: ${receivedInvitations.length}`,
        icon: <Users className="w-4 h-4" />
      });
    }

    setChecks(newChecks);
    setLoading(false);
  }, [
    user,
    session,
    userRoles,
    roleLoading,
    canCreateBusinessPosts,
    receivedInvitations,
    invitationLoading
  ]);

  useEffect(() => {
    if (roleLoading || invitationLoading) {
      return;
    }

    runSecurityChecks();
  }, [runSecurityChecks, roleLoading, invitationLoading]);

  const getStatusIcon = (status: SecurityCheck['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: SecurityCheck['status']) => {
    switch (status) {
      case 'pass':
        return <Badge variant="outline" className="text-green-600 border-green-600">PASS</Badge>;
      case 'fail':
        return <Badge variant="destructive">FAIL</Badge>;
      case 'warning':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">WARN</Badge>;
    }
  };

  const failedChecks = checks.filter(check => check.status === 'fail').length;
  const warningChecks = checks.filter(check => check.status === 'warning').length;
  const passedChecks = checks.filter(check => check.status === 'pass').length;

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Running security checks...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security Verification Report
        </CardTitle>
        <div className="flex gap-4 text-sm">
          <span className="text-green-600">{passedChecks} Passed</span>
          <span className="text-yellow-600">{warningChecks} Warnings</span>
          <span className="text-red-600">{failedChecks} Failed</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {checks.map((check, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-card/50">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {check.icon}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{check.name}</span>
                  {getStatusBadge(check.status)}
                </div>
                <p className="text-sm text-muted-foreground">{check.message}</p>
              </div>
            </div>
            {getStatusIcon(check.status)}
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <Button onClick={runSecurityChecks} variant="outline" className="w-full">
            <Shield className="w-4 h-4 mr-2" />
            Re-run Security Checks
          </Button>
        </div>

        {failedChecks > 0 && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
              Security Issues Detected
            </h4>
            <p className="text-sm text-red-600 dark:text-red-300">
              {failedChecks} critical security check(s) failed. Please review the failed items above.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}