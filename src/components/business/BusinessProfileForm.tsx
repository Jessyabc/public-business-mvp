import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { GlassInput } from '@/components/ui/GlassInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
import { useAppMode } from '@/contexts/AppModeContext';
import { BusinessProfile } from '@/types/database';
import { safeUrlOrEmpty } from '@/lib/validators';

const businessProfileSchema = z.object({
  company_name: z.string().min(2, 'Company name must be at least 2 characters'),
  industry_id: z.string().optional(),
  department_id: z.string().optional(),
  company_size: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

type BusinessProfileFormData = z.infer<typeof businessProfileSchema>;

interface BusinessProfileFormProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export function BusinessProfileForm({ onSuccess, onClose }: BusinessProfileFormProps) {
  const { mode } = useAppMode();
  const { profile, industries, departments, loading, createProfile, updateProfile } = useBusinessProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BusinessProfileFormData>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      company_name: profile?.company_name || '',
      industry_id: profile?.industry_id || '',
      department_id: profile?.department_id || '',
      company_size: profile?.company_size || undefined,
      phone: profile?.phone || '',
      website: profile?.website || '',
      bio: profile?.bio || '',
    },
  });

  const onSubmit = async (data: BusinessProfileFormData) => {
    setIsSubmitting(true);
    try {
      data.website = safeUrlOrEmpty(data.website);
      if (profile) {
        await updateProfile(data);
      } else {
        await createProfile(data);
      }
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting business profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: BusinessProfile['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="glass-business-card bg-yellow-100/50 text-yellow-700 border-yellow-200/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="secondary" className="glass-business-card bg-green-100/50 text-green-700 border-green-200/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="glass-business-card bg-red-100/50 text-red-700 border-red-200/30">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <div className="glass-business w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto border border-accent/20">
            <Building2 className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${
              mode === 'business' ? 'text-blue-900' : 'text-slate-900'
            }`}>
              {profile ? 'Update Business Profile' : 'Create Business Profile'}
            </h1>
            <p className={`mt-2 ${
              mode === 'business' ? 'text-blue-700' : 'text-slate-600'
            }`}>
              {profile ? 'Update your business information' : 'Join our business community and unlock professional features'}
            </p>
          </div>
          {profile && getStatusBadge(profile.status)}
        </div>

        <Card className="glass-business-card animate-scale-in">
          <CardHeader>
            <CardTitle className={mode === 'business' ? 'text-blue-900' : 'text-slate-900'}>
              Business Information
            </CardTitle>
            <CardDescription className={mode === 'business' ? 'text-blue-700' : 'text-slate-600'}>
              Provide your business details for verification and access to business features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={mode === 'business' ? 'text-blue-800' : 'text-slate-700'}>
                        Company Name
                      </FormLabel>
                      <FormControl>
                         <GlassInput 
                           placeholder="Enter your company name" 
                           {...field} 
                         />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="industry_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={mode === 'business' ? 'text-blue-800' : 'text-slate-700'}>
                          Industry
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                           <FormControl>
                             <SelectTrigger className="glass-business-card">
                               <SelectValue placeholder="Select industry" />
                             </SelectTrigger>
                           </FormControl>
                          <SelectContent>
                            {industries.map((industry) => (
                              <SelectItem key={industry.id} value={industry.id}>
                                {industry.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="department_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={mode === 'business' ? 'text-blue-800' : 'text-slate-700'}>
                          Department
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                           <FormControl>
                             <SelectTrigger className="glass-business-card">
                               <SelectValue placeholder="Select department" />
                             </SelectTrigger>
                           </FormControl>
                          <SelectContent>
                            {departments.map((department) => (
                              <SelectItem key={department.id} value={department.id}>
                                {department.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="company_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={mode === 'business' ? 'text-blue-800' : 'text-slate-700'}>
                        Company Size
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                         <FormControl>
                           <SelectTrigger className="glass-business-card">
                             <SelectValue placeholder="Select company size" />
                           </SelectTrigger>
                         </FormControl>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-1000">201-1000 employees</SelectItem>
                          <SelectItem value="1000+">1000+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={mode === 'business' ? 'text-blue-800' : 'text-slate-700'}>
                          Phone
                        </FormLabel>
                        <FormControl>
                           <GlassInput 
                             placeholder="Enter phone number" 
                             {...field} 
                           />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={mode === 'business' ? 'text-blue-800' : 'text-slate-700'}>
                          Website
                        </FormLabel>
                        <FormControl>
                           <GlassInput 
                             placeholder="https://example.com" 
                             {...field} 
                           />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={mode === 'business' ? 'text-blue-800' : 'text-slate-700'}>
                        Company Bio
                      </FormLabel>
                      <FormControl>
                         <GlassInput 
                           as="textarea"
                           placeholder="Tell us about your company..."
                           className="min-h-[100px]"
                           {...field} 
                         />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading || isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : profile ? 'Update Profile' : 'Submit for Review'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}