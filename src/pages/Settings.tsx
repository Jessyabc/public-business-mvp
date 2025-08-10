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
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Bell, Shield, CreditCard, Palette, Building2 } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const { profile } = useProfile();
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
    // Here you would save to the database
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
      // Implementation would depend on your business logic
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

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and settings</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{userRoles.length > 0 ? userRoles.join(', ').replace(/_/g, ' ') : 'Public User'}</Badge>
                    {isBusinessMember() && (
                      <Badge variant="default">
                        <Building2 className="h-3 w-3 mr-1" />
                        Business Member
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name</Label>
                  <Input 
                    id="display_name"
                    defaultValue={profile?.display_name || ''}
                    placeholder="Enter your display name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location"
                    defaultValue={profile?.location || ''}
                    placeholder="Your location"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <textarea 
                  id="bio"
                  className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  defaultValue={profile?.bio || ''}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input 
                    id="website"
                    defaultValue={profile?.website || ''}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input 
                    id="linkedin"
                    defaultValue={profile?.linkedin_url || ''}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>

              <Button>Save Changes</Button>
            </CardContent>
          </Card>
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

        {/* Subscription Settings */}
        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription & Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div>
                  <h3 className="font-medium">Current Plan</h3>
                   <p className="text-sm text-muted-foreground">
                     {isBusinessMember() ? 'Business Member' : 'Free Plan'}
                   </p>
                </div>
                 <Badge variant={isBusinessMember() ? 'default' : 'secondary'}>
                   {isBusinessMember() ? 'Active' : 'Free'}
                 </Badge>
              </div>

              {!isBusinessMember() && (
                <div className="space-y-4">
                  <h3 className="font-medium">Upgrade Options</h3>
                  <div className="grid gap-4">
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Business Membership</h4>
                        <span className="text-xl font-bold">$29/mo</span>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                        <li>• Create business posts and insights</li>
                        <li>• Access to investor reports</li>
                        <li>• Advanced analytics</li>
                        <li>• Priority support</li>
                      </ul>
                      <Button>Upgrade to Business</Button>
                    </div>
                  </div>
                </div>
              )}

              {isBusinessMember() && (
                <div className="space-y-4">
                  <h3 className="font-medium">Payment Method</h3>
                  <div className="p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center">
                          <CreditCard className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">•••• •••• •••• 4242</p>
                          <p className="text-sm text-muted-foreground">Expires 12/25</p>
                        </div>
                      </div>
                      <Button variant="outline">Update</Button>
                    </div>
                  </div>
                </div>
              )}
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
                    <Label>Reduced Motion</Label>
                    <p className="text-sm text-muted-foreground">Reduce animations and transitions</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-play Videos</Label>
                    <p className="text-sm text-muted-foreground">Automatically play videos in feed</p>
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
                    <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option>English (US)</option>
                      <option>English (UK)</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Time Zone</Label>
                    <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option>Pacific Time (PT)</option>
                      <option>Eastern Time (ET)</option>
                      <option>Central Time (CT)</option>
                      <option>Mountain Time (MT)</option>
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