import { BusinessInvitations } from '@/components/business/BusinessInvitations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield } from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRoles';

export function BusinessMembership() {
  const { userRole, canCreateBusinessPosts } = useUserRoles();

  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center space-y-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center mx-auto border border-blue-200/30">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Business Membership</h1>
            <p className="mt-2 text-slate-600">
              Manage business invitations and membership status
            </p>
          </div>
        </div>

        {/* Current Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Current Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Your Role: {userRole || 'Loading...'}</p>
                <p className="text-sm text-muted-foreground">
                  {canCreateBusinessPosts 
                    ? 'You can create and share business content' 
                    : 'You can create brainstorms only. Business membership required for business posts.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Invitations */}
        <BusinessInvitations />

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>About Business Membership</CardTitle>
            <CardDescription>
              Learn about the benefits and requirements of business membership
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">What is Business Membership?</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Business membership allows you to create and share professional content including 
                insights, reports, whitepapers, webinars, and videos with the business community.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">How to become a Business Member?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Receive an invitation from an existing business member</li>
                <li>• Get invited by a verified business/company</li>
                <li>• Apply for business account approval (companies only)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Benefits</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Create professional business content</li>
                <li>• Access to business-only features</li>
                <li>• Invite other professionals to join</li>
                <li>• Enhanced networking opportunities</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}