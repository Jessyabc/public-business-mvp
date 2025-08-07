import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { Building2, Users, Award } from 'lucide-react';

export function CreateBusiness() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { industries, departments } = useBusinessProfile();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    industry_id: '',
    department_id: '',
    company_size: '',
    phone: '',
    website: '',
    linkedin_url: '',
    bio: ''
  });

  const companySizes = [
    '1-10 employees',
    '11-50 employees', 
    '51-200 employees',
    '201-500 employees',
    '501-1000 employees',
    '1000+ employees'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Create business profile
      const { error: profileError } = await supabase
        .from('business_profiles')
        .insert({
          user_id: user.id,
          ...formData,
          status: 'approved' // Auto-approve for creator
        });

      if (profileError) throw profileError;

      // Update user role to business_member with admin privileges
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'business_member'
        });

      if (roleError) throw roleError;

      toast({
        title: "Business Created Successfully!",
        description: "You are now a Business Member with admin privileges.",
      });

      navigate('/business-profile');
    } catch (error: any) {
      console.error('Error creating business:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create business",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Building2 className="h-12 w-12 text-primary" />
              <Award className="h-6 w-6 text-yellow-500 absolute -top-2 -right-2" />
            </div>
          </div>
          <CardTitle className="text-2xl">Create Your Business</CardTitle>
          <p className="text-muted-foreground">
            Set up your business profile and become a Business Member with admin privileges
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                value={formData.company_name}
                onChange={(e) => updateField('company_name', e.target.value)}
                placeholder="e.g., XYZ Inc."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select value={formData.industry_id} onValueChange={(value) => updateField('industry_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry.id} value={industry.id}>
                        {industry.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department_id} onValueChange={(value) => updateField('department_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_size">Company Size</Label>
              <Select value={formData.company_size} onValueChange={(value) => updateField('company_size', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  {companySizes.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => updateField('website', e.target.value)}
                  placeholder="https://yourcompany.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn Company Page</Label>
              <Input
                id="linkedin_url"
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => updateField('linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Company Description</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => updateField('bio', e.target.value)}
                placeholder="Tell us about your company..."
                rows={4}
              />
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Business Member Benefits</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Create and manage business profiles</li>
                <li>• Invite team members to your business</li>
                <li>• Post Business Insights with privacy controls</li>
                <li>• Admin privileges to approve posts (as creator)</li>
                <li>• Access to business-only content and features</li>
              </ul>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !formData.company_name}>
              {loading ? "Creating Business..." : "Create Business & Become Member"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateBusiness;