import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { Building2, Eye, EyeOff, Users } from 'lucide-react';

interface BusinessInsightComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BusinessInsightComposer({ open, onOpenChange, onSuccess }: BusinessInsightComposerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { industries, departments } = useBusinessProfile();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'insight' as const,
    visibility: 'my_business' as 'my_business' | 'other_businesses' | 'public',
    industry_id: '',
    department_id: ''
  });

  const postTypes = [
    { value: 'insight', label: 'Business Insight' },
    { value: 'report', label: 'Business Report' },
    { value: 'whitepaper', label: 'Whitepaper' },
    { value: 'webinar', label: 'Webinar' },
    { value: 'video', label: 'Video Content' }
  ];

  const visibilityOptions = [
    { 
      value: 'my_business', 
      label: 'My Business Only', 
      description: 'Only visible to your business members',
      icon: Building2 
    },
    { 
      value: 'other_businesses', 
      label: 'All Businesses', 
      description: 'Visible to all business members',
      icon: Users 
    },
    { 
      value: 'public', 
      label: 'Public', 
      description: 'Visible to everyone',
      icon: Eye 
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          title: formData.title,
          content: formData.content,
          type: formData.type,
          mode: 'business',
          visibility: formData.visibility,
          industry_id: formData.industry_id || null,
          department_id: formData.department_id || null,
          status: 'active', // Business members can post directly without approval
          metadata: {
            business_insight: true,
            created_via: 'business_composer'
          }
        });

      if (error) throw error;

      toast({
        title: "Business Insight Posted!",
        description: "Your business insight has been published successfully.",
      });

      // Reset form
      setFormData({
        title: '',
        content: '',
        type: 'insight',
        visibility: 'my_business',
        industry_id: '',
        department_id: ''
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      console.error('Error posting business insight:', error);
      let description = 'Failed to post business insight';
      if (error instanceof Error) {
        description = error.message;
      } else if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
        description = (error as { message: string }).message;
      }
      toast({
        title: "Error",
        description,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Create Business Insight
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Enter insight title..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Content Type</Label>
              <Select value={formData.type} onValueChange={(value) => updateField('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {postTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Privacy Setting *</Label>
              <Select 
                value={formData.visibility} 
                onValueChange={(value: typeof formData.visibility) => updateField('visibility', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {visibilityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.visibility && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm">
                  {(() => {
                    const selectedOption = visibilityOptions.find(opt => opt.value === formData.visibility);
                    return selectedOption ? <selectedOption.icon className="h-4 w-4" /> : null;
                  })()}
                  <span className="font-medium">
                    {visibilityOptions.find(opt => opt.value === formData.visibility)?.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

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
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => updateField('content', e.target.value)}
              placeholder="Share your business insight..."
              rows={8}
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.title || !formData.content}
              className="flex-1"
            >
              {loading ? "Publishing..." : "Publish Insight"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}