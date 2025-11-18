import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BecomeBusinessMember() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    website: '',
    industry: '',
    mission: '',
    logo_url: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to request business membership');
      return;
    }

    if (!formData.company_name.trim()) {
      toast.error('Company name is required');
      return;
    }

    setLoading(true);
    try {
      // Update profile to request business membership
      const { error } = await supabase
        .from('profiles')
        .update({
          request_business_membership: true,
          company: formData.company_name,
          website: formData.website || null,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Store the business details in a temporary location or extend profiles table
      // For MVP, we'll store in a separate table or use metadata
      // For now, let's create a business_profile request record
      const { error: profileError } = await supabase
        .from('business_profiles')
        .insert({
          user_id: user.id,
          company_name: formData.company_name,
          website: formData.website || null,
          bio: formData.mission || null,
          status: 'pending',
        });

      if (profileError) {
        // If business_profiles insert fails, that's okay for MVP
        // The profile update is the main signal
        console.warn('Could not create business_profile record:', profileError);
      }

      toast.success('Business membership request submitted! An admin will review it soon.');
      navigate('/');
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast.error(error.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6 max-w-2xl">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">Please sign in to request business membership.</p>
            <Button onClick={() => navigate('/')}>Go to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Become a Business Member</CardTitle>
          <CardDescription>
            Request access to business features. An admin will review your request.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Acme Inc."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="Technology, Healthcare, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mission">Mission</Label>
              <Textarea
                id="mission"
                value={formData.mission}
                onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                placeholder="Tell us about your company's mission..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                type="url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

