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
  } = useBusinessInvitations();
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) return;
    
    setIsInviting(true);
    try {
      await createInvitation({
        invited_email: inviteEmail,
        invited_by_type: 'business_member',
      });
      setInviteEmail('');
    } catch (error) {
      // Error handled by hook
    } finally {
      setIsInviting(false);
    }
  };

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      const success = await acceptInvitation(invitationId);
      if (success) {
        toast({
          title: "Welcome to the Business!",
          description: "You are now a Business Member with special privileges and access to business features.",
        });
      }
    } catch (error) {
      console.error('Failed to accept invitation:', error);
    }
  };

  const handleRejectInvitation = async (invitationId: string) => {
    await rejectInvitation(invitationId);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'accepted':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <CheckCircle className="w-3 h-3 mr-1" />
            Accepted
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
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
              You have pending invitations to become a Business member
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {receivedInvitations.map((invitation) => (
              <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Business Membership Invitation</p>
                  <p className="text-sm text-muted-foreground">
                    Invited by: {invitation.invited_by_type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expires: {new Date(invitation.expires_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleAcceptInvitation(invitation.id)}
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

      {/* Send Invitations (only for business members) */}
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
                  {invitations.slice(0, 5).map((invitation) => (
                    <div key={invitation.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{invitation.invited_email}</span>
                      {getStatusBadge(invitation.status)}
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}