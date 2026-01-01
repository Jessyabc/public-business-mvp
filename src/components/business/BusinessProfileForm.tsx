import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { GlassInput } from '@/components/ui/GlassInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useBusinessProfile } from '@/hooks/useBusinessProfile';
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
  compact?: boolean; // New prop for embedded settings view
  isReadOnly?: boolean; // New prop for read-only mode (business members)
}

export function BusinessProfileForm({ onSuccess, onClose, compact = false, isReadOnly = false }: BusinessProfileFormProps) {
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

  // Compact mode for settings page - just the form card
  if (compact) {
    return (
      <Card className="glass-business-card animate-scale-in">
        <CardHeader>
          <CardTitle className="text-foreground">
            Business Information
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isReadOnly ? 'View your business information (read-only)' : 'Update your business details and company information.'}
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
                    <FormLabel className="text-foreground">
                      Company Name
                    </FormLabel>
                    <FormControl>
                       <GlassInput 
                         placeholder="Enter your company name" 
                         {...field}
                         disabled={isReadOnly}
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
                      <FormLabel className="text-foreground">
                        Industry
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
                         <FormControl>
                           <SelectTrigger className="glass-business-card" disabled={isReadOnly}>
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
                      <FormLabel className="text-foreground">
                        Department
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
                         <FormControl>
                           <SelectTrigger className="glass-business-card" disabled={isReadOnly}>
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
                    <FormLabel className="text-foreground">
                      Company Size
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
                       <FormControl>
                         <SelectTrigger className="glass-business-card" disabled={isReadOnly}>
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
                      <FormLabel className="text-foreground">
                        Phone
                      </FormLabel>
                      <FormControl>
                         <GlassInput 
                           placeholder="Enter phone number" 
                           {...field}
                           disabled={isReadOnly}
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
                      <FormLabel className="text-foreground">
                        Website
                      </FormLabel>
                      <FormControl>
                         <GlassInput 
                           placeholder="https://example.com" 
                           {...field}
                           disabled={isReadOnly}
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
                    <FormLabel className="text-foreground">
                      Company Bio
                    </FormLabel>
                    <FormControl>
                       <GlassInput 
                         as="textarea"
                         placeholder="Tell us about your company..."
                         className="min-h-[100px]"
                         {...field}
                         disabled={isReadOnly}
                       />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!isReadOnly && (
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading || isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  // Full page mode (legacy - redirect to settings instead)
  return (
    <div className="min-h-screen bg-background p-6 pb-32 animate-fade-in">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="glass-business-card animate-scale-in">
          <CardHeader>
            <CardTitle className="text-foreground">
              Business Information
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isReadOnly ? 'View your business information (read-only)' : 'Provide your business details for verification and access to business features.'}
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
                      <FormLabel className="text-foreground">
                        Company Name
                      </FormLabel>
                      <FormControl>
                         <GlassInput 
                           placeholder="Enter your company name" 
                           {...field}
                           disabled={isReadOnly}
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
                        <FormLabel className="text-foreground">
                          Industry
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
                           <FormControl>
                             <SelectTrigger className="glass-business-card" disabled={isReadOnly}>
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
                        <FormLabel className="text-foreground">
                          Department
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
                           <FormControl>
                             <SelectTrigger className="glass-business-card" disabled={isReadOnly}>
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
                      <FormLabel className="text-foreground">
                        Company Size
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
                         <FormControl>
                           <SelectTrigger className="glass-business-card" disabled={isReadOnly}>
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
                        <FormLabel className="text-foreground">
                          Phone
                        </FormLabel>
                        <FormControl>
                           <GlassInput 
                             placeholder="Enter phone number" 
                             {...field}
                             disabled={isReadOnly}
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
                        <FormLabel className="text-foreground">
                          Website
                        </FormLabel>
                        <FormControl>
                           <GlassInput 
                             placeholder="https://example.com" 
                             {...field}
                             disabled={isReadOnly}
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
                      <FormLabel className="text-foreground">
                        Company Bio
                      </FormLabel>
                      <FormControl>
                         <GlassInput 
                           as="textarea"
                           placeholder="Tell us about your company..."
                           className="min-h-[100px]"
                           {...field}
                           disabled={isReadOnly}
                         />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isReadOnly && (
                  <div className="flex gap-4">
                    {onClose && (
                      <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                        Cancel
                      </Button>
                    )}
                    <Button 
                      type="submit" 
                      className="flex-1"
                      disabled={loading || isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : profile ? 'Update Profile' : 'Create Profile'}
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
