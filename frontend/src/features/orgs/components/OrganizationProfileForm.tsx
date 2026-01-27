import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { GlassInput } from '@/components/ui/GlassInput';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImageCropper } from '@/components/ui/ImageCropper';
import { useOrganization, useUpdateOrganization } from '../hooks/useOrganization';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, Upload, X } from 'lucide-react';
import { safeUrlOrEmpty } from '@/lib/validators';
import { getOrgLogoSignedUrl } from '../utils/getOrgLogoSignedUrl';

const organizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  industry_id: z.string().optional(),
  company_size: z.string().optional(),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

interface OrganizationProfileFormProps {
  orgId?: string;
  onSuccess?: () => void;
  isReadOnly?: boolean;
}

export function OrganizationProfileForm({ orgId, onSuccess, isReadOnly = false }: OrganizationProfileFormProps) {
  // All hooks must be called unconditionally - handle !orgId in render
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: organization, isLoading, refetch: refetchOrganization } = useOrganization(orgId);
  const { mutate: updateOrganization, isPending } = useUpdateOrganization();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<File | null>(null);
  const [signedLogoUrl, setSignedLogoUrl] = useState<string | null>(null);

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organization?.name || '',
      description: organization?.description || '',
      website: organization?.website || '',
      industry_id: organization?.industry_id || '',
      company_size: organization?.company_size || '',
    },
  });

  // Update form when organization data loads
  useEffect(() => {
    if (organization) {
      form.reset({
        name: organization.name || '',
        description: organization.description || '',
        website: organization.website || '',
        industry_id: organization.industry_id || '',
        company_size: organization.company_size || '',
      });
      // Set logo URL and reset error state when organization loads
      if (organization.logo_url) {
        setLogoUrl(organization.logo_url);
        setLogoError(false);
      } else {
        setLogoUrl(null);
        setLogoError(false);
      }
    }
  }, [organization, form]);
  
  // Fetch signed URL when logo path changes
  useEffect(() => {
    const fetchSignedUrl = async () => {
      const logoPath = logoUrl || organization?.logo_url;
      if (logoPath && organization?.id) {
        // Check if it's already a full URL (legacy data) or a path
        if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
          // Legacy full URL - use it directly
          setSignedLogoUrl(logoPath);
        } else {
          // New path format - get signed URL from Edge Function
          const signedUrl = await getOrgLogoSignedUrl(organization.id, logoPath);
          setSignedLogoUrl(signedUrl);
        }
      } else {
        setSignedLogoUrl(null);
      }
    };

    fetchSignedUrl();
  }, [logoUrl, organization?.logo_url, organization?.id]);
  
  // Reset error when logo URL changes
  useEffect(() => {
    if (logoUrl || organization?.logo_url) {
      setLogoError(false);
    }
  }, [logoUrl, organization?.logo_url]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !organization) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({ title: "Error", description: "Please upload an image file", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "Image must be less than 5MB", variant: "destructive" });
      return;
    }

    // Open cropper dialog
    setImageToCrop(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCropComplete = async (croppedFile: File) => {
    setImageToCrop(null);
    if (!user || !organization) return;

    setUploadingLogo(true);
    try {
      const fileExt = 'png'; // Always use PNG after cropping
      const timestamp = Date.now();
      
      // Use simple user folder path - most likely to work with RLS
      // Format: {user_id}/org-{org_id}-logo-{timestamp}.png
      const uploadPath = `${user.id}/org-${organization.id}-logo-${timestamp}.${fileExt}`;

      // Upload to user's folder (RLS should allow users to upload to their own folder)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(uploadPath, croppedFile, { 
          upsert: true,
          contentType: 'image/png'
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        // Provide helpful error message
        if (uploadError.message?.includes('new row violates') || uploadError.message?.includes('RLS') || uploadError.message?.includes('policy')) {
          throw new Error('Storage permission denied. Please contact support to configure storage permissions for your account.');
        }
        throw new Error(uploadError.message || 'Failed to upload logo. Please check storage permissions.');
      }

      // Store the path (not the full URL) in the database
      // The Edge Function will generate signed URLs when needed
      await updateOrganizationWithLogo(uploadPath);
    } catch (error: any) {
      console.error('Error uploading logo:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload logo. Please check storage permissions.",
        variant: "destructive",
      });
    } finally {
      setUploadingLogo(false);
    }
  };

  const updateOrganizationWithLogo = async (logoPath: string) => {
    if (!organization) return;
    
    updateOrganization(
      {
        orgId: organization.id,
        updates: { logo_url: logoPath }, // Store path, not full URL
      },
      {
        onSuccess: async () => {
          setLogoUrl(logoPath); // Store path for signed URL generation
          setLogoError(false);
          // Fetch new signed URL after update
          const signedUrl = await getOrgLogoSignedUrl(organization.id, logoPath);
          setSignedLogoUrl(signedUrl);
          await refetchOrganization();
          toast({ title: "Success", description: "Logo uploaded successfully!" });
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Failed to update logo",
            variant: "destructive",
          });
        },
      }
    );
  };

  const onSubmit = async (data: OrganizationFormData) => {
    if (!organization) return;

    const updates = {
      name: data.name,
      description: data.description || null,
      website: safeUrlOrEmpty(data.website),
      industry_id: data.industry_id || null,
      company_size: data.company_size || null,
    };

    updateOrganization(
      { orgId: organization.id, updates },
      {
        onSuccess: () => {
          toast({ title: "Success", description: "Organization profile updated successfully!" });
          onSuccess?.();
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Failed to update organization",
            variant: "destructive",
          });
        },
      }
    );
  };

  // Use signed URL if available, otherwise fallback to legacy URL or path
  const displayLogoUrl = signedLogoUrl || (logoUrl?.startsWith('http') ? logoUrl : null) || (organization?.logo_url?.startsWith('http') ? organization.logo_url : null);

  // Handle case where orgId is not provided - render message (no early return after hooks)
  if (!orgId) {
    return (
      <Card 
        className="border-0"
        style={{
          background: '#EAE6E2',
          boxShadow: '8px 8px 20px rgba(166, 150, 130, 0.3), -8px -8px 20px rgba(255, 255, 255, 0.85)',
          borderRadius: '24px'
        }}
      >
        <CardContent className="p-8 text-center">
          <Building2 className="h-12 w-12 text-[#6B635B]/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#3A3530] mb-2">No Organization Selected</h3>
          <p className="text-[#6B635B]">Please select an organization to manage.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8 text-[#6B635B]">Loading organization...</div>
    );
  }

  if (!organization) {
    return (
      <div className="text-center py-8 text-[#6B635B]">No organization found.</div>
    );
  }

  return (
    <>
      {imageToCrop && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onCancel={() => setImageToCrop(null)}
          maxWidth={500}
          maxHeight={500}
          aspectRatio={1}
        />
      )}
      <Card 
        className="border-0"
        style={{
          background: '#EAE6E2',
          boxShadow: '8px 8px 20px rgba(166, 150, 130, 0.3), -8px -8px 20px rgba(255, 255, 255, 0.85)',
          borderRadius: '24px'
        }}
      >
      <CardHeader>
        <CardTitle className="text-[#3A3530] flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Organization Information
        </CardTitle>
        <CardDescription className="text-[#6B635B]">
          {isReadOnly 
            ? 'View your organization information (read-only)' 
            : 'Update your organization details and company information.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Logo Upload */}
        <div className="flex items-center gap-6">
          <div className="relative h-24 w-24 rounded-xl overflow-hidden flex items-center justify-center" style={{
            background: '#F5F1ED',
            boxShadow: 'inset 2px 2px 5px rgba(166, 150, 130, 0.1), inset -2px -2px 5px rgba(255, 255, 255, 0.5)',
          }}>
            {displayLogoUrl && !logoError ? (
              <img 
                src={displayLogoUrl} 
                alt={`${organization?.name || 'Organization'} logo`}
                className="w-full h-full object-cover rounded-xl"
                key={displayLogoUrl} // Force re-render when URL changes
                onError={(e) => {
                  console.error('Failed to load logo image:', displayLogoUrl, e);
                  setLogoError(true);
                }}
                onLoad={() => {
                  console.log('Logo loaded successfully:', displayLogoUrl);
                  setLogoError(false);
                }}
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center text-3xl font-bold rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #D4A574 0%, #B8865A 100%)',
                  color: '#FFFFFF',
                }}
              >
                {organization?.name?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#3A3530] mb-2">
              Organization Logo
            </label>
            {!isReadOnly && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="text-[#3A3530] border-[#D4CEC5] hover:bg-[#F5F1ED]"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                </Button>
                {displayLogoUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      updateOrganization(
                        { orgId: organization.id, updates: { logo_url: null } },
                        {
                          onSuccess: () => {
                            setLogoUrl(null);
                            toast({ title: "Success", description: "Logo removed" });
                          },
                        }
                      );
                    }}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            )}
            <p className="text-xs text-[#6B635B] mt-1">
              Recommended: Square image, at least 200x200px. Max 5MB.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#3A3530]">Organization Name</FormLabel>
              <FormControl>
                <GlassInput
                  placeholder="Enter organization name"
                  {...field}
                  disabled={isReadOnly}
                  className="text-[#3A3530] placeholder:text-[#6B635B]/60 bg-[#F5F1ED] border-[#D4CEC5]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[#3A3530]">Description</FormLabel>
              <FormControl>
                <GlassInput
                  as="textarea"
                  placeholder="Tell us about your organization..."
                  className="min-h-[100px] text-[#3A3530] placeholder:text-[#6B635B]/60 bg-[#F5F1ED] border-[#D4CEC5]"
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
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#3A3530]">Website</FormLabel>
                <FormControl>
                  <GlassInput
                    placeholder="https://example.com"
                    {...field}
                    disabled={isReadOnly}
                    className="text-[#3A3530] placeholder:text-[#6B635B]/60 bg-[#F5F1ED] border-[#D4CEC5]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company_size"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#3A3530]">Company Size</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isReadOnly}>
                  <FormControl>
                    <SelectTrigger 
                      className="text-[#3A3530] bg-[#F5F1ED] border-[#D4CEC5] hover:bg-[#EAE6E2]" 
                      disabled={isReadOnly}
                    >
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white border-[#D4CEC5] text-[#3A3530]">
                    <SelectItem value="1-10" className="text-[#3A3530] focus:bg-[#F5F1ED] focus:text-[#3A3530]">1-10 employees</SelectItem>
                    <SelectItem value="11-50" className="text-[#3A3530] focus:bg-[#F5F1ED] focus:text-[#3A3530]">11-50 employees</SelectItem>
                    <SelectItem value="51-200" className="text-[#3A3530] focus:bg-[#F5F1ED] focus:text-[#3A3530]">51-200 employees</SelectItem>
                    <SelectItem value="201-1000" className="text-[#3A3530] focus:bg-[#F5F1ED] focus:text-[#3A3530]">201-1000 employees</SelectItem>
                    <SelectItem value="1000+" className="text-[#3A3530] focus:bg-[#F5F1ED] focus:text-[#3A3530]">1000+ employees</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {!isReadOnly && (
          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isPending}
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        )}
          </form>
        </Form>
      </CardContent>
    </Card>
    </>
  );
}

