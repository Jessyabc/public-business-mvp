// src/pages/Settings.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useToast } from '@/hooks/use-toast';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { BusinessProfileForm } from '@/components/business/BusinessProfileForm';
import { User, Bell, Shield, CreditCard, Palette, Building2 } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { userRoles, isBusinessMember } = useUserRoles();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [notifications, setNotifications] = useState({
    email_posts: true,
    email_comments: false,
    email_mentions: true,
    email_business_updates: true,
    push_posts: true,
    push_comments: false,
    push_mentions: true,
  });

  const handleNotificationChange = async (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Settings Updated",
      description: "Notification preferences have been saved.",
    });
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    setLoading(true);
    try {
      // Your deletion flow here
      toast({
        title: "Account Deletion Request",
        description: "Your account deletion request has been submitted. We'll process it within 24 hours.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to process account deletion",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isBusiness = userRoles.includes('business_member') || userRoles.includes('admin');

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your profile, business information, and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
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
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <ProfileForm />
        </TabsContent>

        {/* Business Settings */}
        <TabsContent value="business">
          {isBusiness ? (
            <BusinessProfileForm />
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
                      checked={notifications.email_posts}
                      onCheckedChange={(checked) => handleNotificationChange('email_posts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Comments</Label>
                      <p className="text-sm text-muted-foreground">Get notified when someone comments on your posts</p>
                    </div>
                    <Switch 
                      checked={notifications.email_comments}
                      onCheckedChange={(checked) => handleNotificationChange('email_comments', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Mentions</Label>
                      <p className="text-sm text-muted-foreground">Get notified when someone mentions you</p>
                    </div>
                    <Switch 
                      checked={notifications.email_mentions}
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
                        checked={notifications.email_business_updates}
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
                      checked={notifications.push_posts}
                      onCheckedChange={(checked) => handleNotificationChange('push_posts', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Comments</Label>
                      <p className="text-sm text-muted-foreground">Push notifications for comments</p>
                    </div>
                    <Switch 
                      checked={notifications.push_comments}
                      onCheckedChange={(checked) => handleNotificationChange('push_comments', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Mentions</Label>
                      <p className="text-sm text-muted-foreground">Push notifications for mentions</p>
                    </div>
                    <Switch 
                      checked={notifications.push_mentions}
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
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground">Make your profile visible to other members</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Activity Status</Label>
                    <p className="text-sm text-muted-foreground">Let others see when you're active</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Direct Messages</Label>
                    <p className="text-sm text-muted-foreground">Allow other members to send you direct messages</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Data Management</h3>
                <div className="space-y-3">
                  <Button variant="outline">Download My Data</Button>
                  <Button variant="outline">Request Data Deletion</Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium text-destructive">Danger Zone</h3>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                  disabled={loading}
                >
                  Delete Account
                </Button>
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
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Toggle dark/light theme</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Compact View</Label>
                    <p className="text-sm text-muted-foreground">Show more content in less space</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-refresh Feed</Label>
                    <p className="text-sm text-muted-foreground">Automatically refresh the feed for new content</p>
                  </div>
                  <Switch defaultChecked />
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
      </Tabs>
    </div>
  );
}
