import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrganization } from '../api/orgs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useUserRoles } from '@/hooks/useUserRoles';
import { supabase } from '@/integrations/supabase/client';

const COMPANY_SIZES = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-1000', label: '201-1000 employees' },
  { value: '1000+', label: '1000+ employees' },
];

export default function CreateOrganization() {
  const nav = useNavigate();
  const { refetch } = useUserRoles();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [industryId, setIndustryId] = useState<string>('');
  const [companySize, setCompanySize] = useState<string>('');
  const [industries, setIndustries] = useState<Array<{ id: string; name: string }>>([]);
  const [busy, setBusy] = useState(false);
  const [loadingIndustries, setLoadingIndustries] = useState(true);

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        const { data, error } = await supabase
          .from('industries')
          .select('id, name')
          .order('name');
        
        if (error) throw error;
        setIndustries(data || []);
      } catch (err) {
        console.error('Error fetching industries:', err);
        toast.error('Failed to load industries');
      } finally {
        setLoadingIndustries(false);
      }
    };

    fetchIndustries();
  }, []);

  const validateWebsite = (url: string) => {
    if (!url.trim()) return true; // Optional field
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    if (website && !validateWebsite(website)) {
      toast.error('Please enter a valid website URL');
      return;
    }

    setBusy(true);
    try {
      const result = await createOrganization({
        name: name.trim(),
        description: description.trim() || null,
        website: website.trim() || null,
        industry_id: industryId || null,
        company_size: companySize || null,
      });

      if (result.status === 'pending') {
        toast.success('Organization created! Your request is pending approval. You\'ll be notified once approved.');
      } else {
        toast.success('Organization created successfully! You are now a business user.');
      }
      
      // Refetch user roles to update UI with new business_user role
      await refetch();
      nav('/app/insights');
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to create organization');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div 
      className="min-h-screen"
      style={{
        background: '#EAE6E2',
        padding: '1.5rem'
      }}
    >
      <div className="mx-auto max-w-xl py-10">
        <Card 
          className="border-0"
          style={{
            background: '#EAE6E2',
            boxShadow: '8px 8px 20px rgba(166, 150, 130, 0.3), -8px -8px 20px rgba(255, 255, 255, 0.85)',
            borderRadius: '24px'
          }}
        >
          <CardContent className="p-6">
            <h1 className="text-2xl font-semibold text-[#3A3530]">
              Create Your Organization
            </h1>
            <p className="text-sm text-[#6B635B] mt-2">
              Set up your business so teammates can post Insights and collaborate. Your organization will be reviewed before activation.
            </p>
            
            <form onSubmit={onSubmit} className="space-y-6 mt-6">
              <div>
                <Label htmlFor="name" className="block text-sm font-medium text-[#3A3530] mb-2">
                  Organization name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Acme Inc."
                  className="text-[#3A3530] placeholder:text-[#6B635B]"
                  style={{
                    background: '#F5F1ED',
                    boxShadow: 'inset 2px 2px 5px rgba(166, 150, 130, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.5)',
                    border: 'none'
                  }}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="block text-sm font-medium text-[#3A3530] mb-2">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about your organization..."
                  className="min-h-[100px] text-[#3A3530] placeholder:text-[#6B635B]"
                  style={{
                    background: '#F5F1ED',
                    boxShadow: 'inset 6px 6px 12px rgba(166, 150, 130, 0.2), inset -6px -6px 12px rgba(255, 255, 255, 0.5)',
                    border: 'none'
                  }}
                  required
                />
              </div>

              <div>
                <Label htmlFor="website" className="block text-sm font-medium text-[#3A3530] mb-2">
                  Website
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="text-[#3A3530] placeholder:text-[#6B635B]"
                  style={{
                    background: '#F5F1ED',
                    boxShadow: 'inset 2px 2px 5px rgba(166, 150, 130, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.5)',
                    border: 'none'
                  }}
                />
              </div>

              <div>
                <Label htmlFor="industry" className="block text-sm font-medium text-[#3A3530] mb-2">
                  Industry
                </Label>
                <Select value={industryId || undefined} onValueChange={(val) => setIndustryId(val === '__none__' ? '' : val)} disabled={loadingIndustries}>
                  <SelectTrigger 
                    className="text-[#3A3530]"
                    style={{
                      background: '#F5F1ED',
                      boxShadow: 'inset 2px 2px 5px rgba(166, 150, 130, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.5)',
                      border: 'none'
                    }}
                  >
                    <SelectValue placeholder="Select an industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#D4CEC5] text-[#3A3530]">
                    <SelectItem value="__none__" className="text-[#3A3530] focus:bg-[#F5F1ED] focus:text-[#3A3530]">None</SelectItem>
                    {industries.map((industry) => (
                      <SelectItem key={industry.id} value={industry.id} className="text-[#3A3530] focus:bg-[#F5F1ED] focus:text-[#3A3530]">
                        {industry.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="company-size" className="block text-sm font-medium text-[#3A3530] mb-2">
                  Company size
                </Label>
                <Select value={companySize || undefined} onValueChange={(val) => setCompanySize(val === '__none__' ? '' : val)}>
                  <SelectTrigger 
                    className="text-[#3A3530]"
                    style={{
                      background: '#F5F1ED',
                      boxShadow: 'inset 2px 2px 5px rgba(166, 150, 130, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.5)',
                      border: 'none'
                    }}
                  >
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#D4CEC5] text-[#3A3530]">
                    <SelectItem value="__none__" className="text-[#3A3530] focus:bg-[#F5F1ED] focus:text-[#3A3530]">None</SelectItem>
                    {COMPANY_SIZES.map((size) => (
                      <SelectItem key={size.value} value={size.value} className="text-[#3A3530] focus:bg-[#F5F1ED] focus:text-[#3A3530]">
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                disabled={busy || !name.trim() || !description.trim()}
                className="w-full text-white bg-[#3A3530] hover:bg-[#2A2520]"
                style={{
                  boxShadow: '4px 4px 8px rgba(166, 150, 130, 0.2), -4px -4px 8px rgba(255, 255, 255, 0.6)',
                }}
              >
                {busy ? 'Creating…' : 'Create organization'}
              </Button>

              <p className="text-xs text-[#6B635B] text-center">
                Your organization will be reviewed before activation. You'll receive a notification once approved.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
