import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Send, CheckCircle, Clock, AlertCircle, X } from "lucide-react";
import { useOrgRequests } from "@/hooks/useOrgRequests";
import { GlassInput } from "@/components/ui/GlassInput";
import { Label } from "@/components/ui/label";

export function BusinessAccountRequest() {
  const { myRequest, loading, submitRequest, updateRequest } = useOrgRequests();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    org_name: '',
    org_description: '',
    reason: '',
  });

  const getStatusIcon = () => {
    if (!myRequest) return <Send className="w-4 h-4" />;
    
    switch (myRequest.status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Send className="w-4 h-4" />;
    }
  };

  const getStatusBadge = () => {
    if (!myRequest) return null;
    
    const variants = {
      approved: 'default',
      pending: 'secondary',
      rejected: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[myRequest.status as keyof typeof variants] || 'outline'}>
        {myRequest.status.charAt(0).toUpperCase() + myRequest.status.slice(1)}
      </Badge>
    );
  };

  const handleRequestClick = () => {
    if (myRequest) {
      setFormData({
        org_name: myRequest.org_name || '',
        org_description: myRequest.org_description || '',
        reason: myRequest.reason || '',
      });
    }
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.org_name.trim()) return;

    setIsSubmitting(true);
    try {
      if (myRequest) {
        await updateRequest(formData);
      } else {
        await submitRequest(formData);
      }
      setShowForm(false);
    } catch {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)]">
        <CardContent className="p-6">
          <div className="text-center text-[var(--text-primary)]">
            Loading...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showForm) {
    return (
      <Card className="border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-[var(--text-primary)]">
              <Building className="w-5 h-5 text-[var(--text-secondary)]" />
              {myRequest ? 'Update Organization Request' : 'Request Business Account'}
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowForm(false)}
              className="text-[var(--text-secondary)]"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="org_name" className="text-[var(--text-primary)]">
                Organization Name *
              </Label>
              <GlassInput
                id="org_name"
                value={formData.org_name}
                onChange={(e) => setFormData(prev => ({ ...prev, org_name: e.target.value }))}
                placeholder="Your company or organization name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="org_description" className="text-[var(--text-primary)]">
                Description
              </Label>
              <GlassInput
                id="org_description"
                as="textarea"
                value={formData.org_description}
                onChange={(e) => setFormData(prev => ({ ...prev, org_description: e.target.value }))}
                placeholder="Brief description of your organization..."
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason" className="text-[var(--text-primary)]">
                Why do you want a business account?
              </Label>
              <GlassInput
                id="reason"
                as="textarea"
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Tell us how you plan to use the business features..."
                className="min-h-[80px]"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                className="flex-1 border-[var(--glass-border)] text-[var(--text-primary)]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.org_name.trim()}
                className="flex-1 bg-[var(--accent)] text-[var(--accent-on)] hover:bg-[var(--accent)]/80"
              >
                {isSubmitting ? 'Submitting...' : myRequest ? 'Resubmit' : 'Submit Request'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-[var(--text-primary)]">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-[var(--text-secondary)]" />
            Business Account
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!myRequest ? (
          <>
            <p className="text-sm text-[var(--text-secondary)]">
              Request a business account to create your organization, post business insights, and collaborate with your team.
            </p>
            <Button 
              onClick={handleRequestClick}
              className="w-full bg-[var(--accent)] text-[var(--accent-on)] hover:bg-[var(--accent)]/80"
            >
              {getStatusIcon()}
              <span className="ml-2">Request Business Account</span>
            </Button>
          </>
        ) : (
          <>
            <div className="text-sm text-[var(--text-secondary)] space-y-2">
              <p><strong>Organization:</strong> {myRequest.org_name}</p>
              {myRequest.org_description && (
                <p className="text-xs opacity-75">{myRequest.org_description}</p>
              )}
              
              {myRequest.status === 'approved' && (
                <p className="text-green-600 mt-3">
                  ✓ Your organization has been created! You can now access business features.
                </p>
              )}
              {myRequest.status === 'pending' && (
                <p className="text-yellow-600 mt-3">
                  ⏱ Your request is pending admin approval.
                </p>
              )}
              {myRequest.status === 'rejected' && (
                <div className="mt-3">
                  <p className="text-red-600">
                    ✗ Your request was rejected.
                  </p>
                  {myRequest.reason && (
                    <p className="text-xs text-red-500 mt-1">
                      Reason: {myRequest.reason}
                    </p>
                  )}
                </div>
              )}
            </div>
            
            {(myRequest.status === 'rejected' || myRequest.status === 'pending') && (
              <Button 
                onClick={handleRequestClick}
                variant="outline"
                className="w-full border-[var(--glass-border)] text-[var(--text-primary)] hover:bg-[var(--card-bg-hover)]"
              >
                {myRequest.status === 'rejected' ? 'Update & Resubmit' : 'Edit Request'}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
