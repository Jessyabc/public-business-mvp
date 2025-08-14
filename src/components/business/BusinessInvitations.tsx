import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserPlus, Mail, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useBusinessInvitations } from '@/hooks/useBusinessInvitations';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useToast } from '@/hooks/use-toast';

export function BusinessInvitations() {
  const { toast } = useToast();
  const { isBusinessMember, isAdmin } = useUserRoles();
  const {
    invitations,
    receivedInvitations,
    loading,
    createInvitation,
    acceptInvitation,
    rejectInvitation,
    getInvitationStatus,
  } = useBusinessInvitations();

  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const handleSendInvite = async () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email) return;
    setIsInviting(true);
    try {
      const row = await createInvitation({ invitee_email: email });
      if (row) {
        const url = `${window.location.origin}/accept-invite?token=${row.token}`;
        await navigator.clipboard.writeText(url).catch(() => {});
        toast({
          title: 'Invite link copied',
          description: url,
        });
        setInviteEmail('');
      }
    } catch {
      // handled in hook
    } finally {
      setIsInviting(false);
    }
  };

  const handleAcceptInvitation = async (token: string) => {
    try {
      const success = await acceptInvitation(token);
      if (success) {
        toast({
          title: 'Welcome to the Business!',
          description: 'You are now a Business Member with access to business features.',
        });
      }
    } catch (error) {
      console.error('Failed to accept invitation:', error);
    }
  };

  const handleRejectInvitation = async (invitationId: string) => {
    await rejectInvitation(invitationId);
  };

  const renderStatusBadge = (status: 'pending' | 'used' | 'expired') => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'used':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Used
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Received Invitations */}
      {receivedInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="w-5 h-5" />
              <span>Business Invitations</span>
            </CardTitle>
            <CardDescription>
              You have pending invitations to become a Business Member
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {receivedInvitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Business Membership Invitation</p>
                  <p className="text-sm text-muted-foreground">
                    Invite sent to: {invitation.invitee_email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleAcceptInvitation(invitation.token)}
                    disabled={loading}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRejectInvitation(invitation.id)}
                    disabled={loading}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Send Invitations (only for business members/admins) */}
      {(isBusinessMember() || isAdmin()) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserPlus className="w-5 h-5" />
              <span>Invite New Business Members</span>
            </CardTitle>
            <CardDescription>
              Send invitations to new users to join the business community
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                type="email"
              />
              <Button 
                onClick={handleSendInvite}
                disabled={!inviteEmail.trim() || isInviting}
              >
                {isInviting ? 'Sending...' : 'Send Invite'}
              </Button>
            </div>

            {invitations.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Sent Invitations</h4>
                  {invitations.slice(0, 5).map((invitation) => {
                    const status = getInvitationStatus(invitation);
                    return (
                      <div key={invitation.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{invitation.invitee_email}</span>
                        {renderStatusBadge(status)}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
