// src/pages/Settings.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useToast } from '@/hooks/use-toast';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { BusinessProfileForm } from '@/components/business/BusinessProfileForm';
import { supabase } from '@/integrations/supabase/client';
import { User, Bell, Shield, Palette, Building2, BookOpen, Loader2 } from 'lucide-react';
import Resources from './Resources';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Settings() {
  const { user, signOut } = useAuth();
  const [searchParams] = useSearchParams();
  const { userRoles, isBusinessMember } = useUserRoles();
  const { preferences, loading: settingsLoading, saving, updatePreference } = useUserSettings();
  const { toast } = useToast();
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Get initial tab from URL params
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update tab when URL changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleNotificationChange = async (key: keyof typeof preferences, value: boolean) => {
    const success = await updatePreference(key, value);
    if (success) {
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to delete account');
      }

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });

      // Sign out and redirect
      await signOut();
    } catch (error: unknown) {
      console.error('Failed to delete account:', error);
      let description = 'Failed to delete account. Please try again or contact support.';
      if (error instanceof Error) {
        description = error.message;
      }
      toast({
        title: "Error",
        description,
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const isBusiness = userRoles.includes('business_member') || userRoles.includes('admin');

  if (settingsLoading) {
    return (
      <ProtectedRoute requireAuth={true}>
        <div className="container mx-auto p-6 pb-32 max-w-4xl flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="container mx-auto p-6 pb-32 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your profile, business information, and preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center gap-2" disabled={!isBusiness}>
              <Building2 className="h-4 w-4" />
              Business
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Resources
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <ProfileForm />
          </TabsContent>

          {/* Business Settings */}
          <TabsContent value="business">
            {isBusiness ? (
              <BusinessProfileForm compact />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Business Membership Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Business membership is required to access this section. Business membership is invite-only.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                  {saving && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-medium mb-4">Email Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>New Posts</Label>
                        <p className="text-sm text-muted-foreground">Get notified about new posts in your feed</p>
                      </div>
                      <Switch 
                        checked={preferences.email_posts}
                        onCheckedChange={(checked) => handleNotificationChange('email_posts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Comments</Label>
                        <p className="text-sm text-muted-foreground">Get notified when someone comments on your posts</p>
                      </div>
                      <Switch 
                        checked={preferences.email_comments}
                        onCheckedChange={(checked) => handleNotificationChange('email_comments', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Mentions</Label>
                        <p className="text-sm text-muted-foreground">Get notified when someone mentions you</p>
                      </div>
                      <Switch 
                        checked={preferences.email_mentions}
                        onCheckedChange={(checked) => handleNotificationChange('email_mentions', checked)}
                      />
                    </div>
                     {isBusinessMember() && (
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Business Updates</Label>
                          <p className="text-sm text-muted-foreground">Get notified about business-related updates</p>
                        </div>
                        <Switch 
                          checked={preferences.email_business_updates}
                          onCheckedChange={(checked) => handleNotificationChange('email_business_updates', checked)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-4">Push Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>New Posts</Label>
                        <p className="text-sm text-muted-foreground">Push notifications for new posts</p>
                      </div>
                      <Switch 
                        checked={preferences.push_posts}
                        onCheckedChange={(checked) => handleNotificationChange('push_posts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Comments</Label>
                        <p className="text-sm text-muted-foreground">Push notifications for comments</p>
                      </div>
                      <Switch 
                        checked={preferences.push_comments}
                        onCheckedChange={(checked) => handleNotificationChange('push_comments', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Mentions</Label>
                        <p className="text-sm text-muted-foreground">Push notifications for mentions</p>
                      </div>
                      <Switch 
                        checked={preferences.push_mentions}
                        onCheckedChange={(checked) => handleNotificationChange('push_mentions', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Privacy & Security
                  {saving && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Profile Visibility</Label>
                      <p className="text-sm text-muted-foreground">Make your profile visible to other members</p>
                    </div>
                    <Switch 
                      checked={preferences.profile_visible}
                      onCheckedChange={(checked) => handleNotificationChange('profile_visible', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Activity Status</Label>
                      <p className="text-sm text-muted-foreground">Let others see when you're active</p>
                    </div>
                    <Switch 
                      checked={preferences.show_activity_status}
                      onCheckedChange={(checked) => handleNotificationChange('show_activity_status', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Direct Messages</Label>
                      <p className="text-sm text-muted-foreground">Allow other members to send you direct messages</p>
                    </div>
                    <Switch 
                      checked={preferences.allow_direct_messages}
                      onCheckedChange={(checked) => handleNotificationChange('allow_direct_messages', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Data Management</h3>
                  <div className="space-y-3">
                    <Button variant="outline">Download My Data</Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium text-destructive">Danger Zone</h3>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" disabled={deleteLoading}>
                        {deleteLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          'Delete Account'
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account and remove all your data from our servers, including:
                          <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Your profile and settings</li>
                            <li>All your posts and sparks</li>
                            <li>Your workspace thoughts</li>
                            <li>All your interactions and ratings</li>
                          </ul>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Yes, delete my account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <p className="text-sm text-muted-foreground">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Settings */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  App Preferences
                  {saving && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">Toggle dark/light theme</p>
                    </div>
                    <Switch 
                      checked={preferences.dark_mode}
                      onCheckedChange={(checked) => handleNotificationChange('dark_mode', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Compact View</Label>
                      <p className="text-sm text-muted-foreground">Show more content in less space</p>
                    </div>
                    <Switch 
                      checked={preferences.compact_view}
                      onCheckedChange={(checked) => handleNotificationChange('compact_view', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-refresh Feed</Label>
                      <p className="text-sm text-muted-foreground">Automatically refresh the feed for new content</p>
                    </div>
                    <Switch 
                      checked={preferences.auto_refresh_feed}
                      onCheckedChange={(checked) => handleNotificationChange('auto_refresh_feed', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Language & Region</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Language</Label>
                      <select className="w-full p-2 border rounded-md bg-background">
                        <option>English (US)</option>
                        <option>English (UK)</option>
                        <option>Spanish</option>
                        <option>French</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Time Zone</Label>
                      <select className="w-full p-2 border rounded-md bg-background">
                        <option>UTC-08:00 (Pacific Time)</option>
                        <option>UTC-05:00 (Eastern Time)</option>
                        <option>UTC+00:00 (GMT)</option>
                        <option>UTC+01:00 (CET)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources">
            <Resources />
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}
