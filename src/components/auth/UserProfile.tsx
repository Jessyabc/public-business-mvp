import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, Building2, Mail, Calendar, MapPin, Edit3, Plus, Send, Users } from 'lucide-react';
import { toast } from 'sonner';

export function UserProfile() {
  const { user, signOut, userType } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showBusinessRequest, setShowBusinessRequest] = useState(false);
  const [businessRequestData, setBusinessRequestData] = useState({
    companyName: '',
    position: '',
    message: '',
    companyEmail: ''
  });
  
  // Mock profile data - in real app this would come from a database
  const [profileData, setProfileData] = useState({
    displayName: user?.email?.split('@')[0] || 'User',
    bio: 'Passionate about collaboration and innovation.',
    location: 'San Francisco, CA',
    joinedDate: 'November 2024',
    avatar: ''
  });

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const handleBusinessRequest = () => {
    // In real app, this would send the request to the business
    console.log('Business request:', businessRequestData);
    setShowBusinessRequest(false);
    setBusinessRequestData({ companyName: '', position: '', message: '', companyEmail: '' });
    toast.success('Business membership request sent!');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#489FE3]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="glass-card border-white/20 backdrop-blur-xl mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24 glass-card border-2 border-[#489FE3]/30">
                  <AvatarImage src={profileData.avatar} />
                  <AvatarFallback className="text-2xl bg-[#489FE3]/20 text-white">
                    {getInitials(profileData.displayName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold text-white">{profileData.displayName}</h1>
                  <p className="text-white/80 mt-1">{user?.email}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge className={userType === 'business' ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-[#489FE3]/20 text-[#489FE3] border-[#489FE3]/30'}>
                      {userType === 'business' ? 'Business Member' : 'Public Member'}
                    </Badge>
                    <div className="flex items-center space-x-1 text-white/60">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">Joined {profileData.joinedDate}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  className="glass-card border-[#489FE3]/30 text-[#489FE3] hover:bg-[#489FE3]/10"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="glass-card border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="glass-card bg-white/5 border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#489FE3]/20 data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="business" className="data-[state=active]:bg-[#489FE3]/20 data-[state=active]:text-white">
              Business Access
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-[#489FE3]/20 data-[state=active]:text-white">
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card className="glass-card border-white/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  About
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-white/80">{profileData.bio}</p>
                <div className="flex items-center space-x-2 text-white/60">
                  <MapPin className="w-4 h-4" />
                  <span>{profileData.location}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="business" className="space-y-6">
            <Card className="glass-card border-white/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Building2 className="w-5 h-5 mr-2" />
                  Business Membership
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userType === 'public' ? (
                  <div>
                    <p className="text-white/80 mb-4">
                      You're currently a Public Member. You can request to join a business or wait for an invitation.
                    </p>
                    <Dialog open={showBusinessRequest} onOpenChange={setShowBusinessRequest}>
                      <DialogTrigger asChild>
                        <Button className="glass-card bg-[#489FE3]/20 hover:bg-[#489FE3]/30 text-white border border-[#489FE3]/50">
                          <Plus className="w-4 h-4 mr-2" />
                          Request Business Access
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="glass-card border-white/20 backdrop-blur-xl">
                        <DialogHeader>
                          <DialogTitle className="text-white">Request Business Membership</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            <Label htmlFor="companyName" className="text-white">Company Name</Label>
                            <Input
                              id="companyName"
                              value={businessRequestData.companyName}
                              onChange={(e) => setBusinessRequestData(prev => ({ ...prev, companyName: e.target.value }))}
                              className="glass border-white/20 text-white"
                              placeholder="Enter company name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="companyEmail" className="text-white">Company Email (optional)</Label>
                            <Input
                              id="companyEmail"
                              type="email"
                              value={businessRequestData.companyEmail}
                              onChange={(e) => setBusinessRequestData(prev => ({ ...prev, companyEmail: e.target.value }))}
                              className="glass border-white/20 text-white"
                              placeholder="company@example.com"
                            />
                          </div>
                          <div>
                            <Label htmlFor="position" className="text-white">Your Position</Label>
                            <Input
                              id="position"
                              value={businessRequestData.position}
                              onChange={(e) => setBusinessRequestData(prev => ({ ...prev, position: e.target.value }))}
                              className="glass border-white/20 text-white"
                              placeholder="Your role at the company"
                            />
                          </div>
                          <div>
                            <Label htmlFor="message" className="text-white">Message</Label>
                            <Textarea
                              id="message"
                              value={businessRequestData.message}
                              onChange={(e) => setBusinessRequestData(prev => ({ ...prev, message: e.target.value }))}
                              className="glass border-white/20 text-white"
                              placeholder="Tell us why you'd like business access..."
                            />
                          </div>
                          <Button
                            onClick={handleBusinessRequest}
                            className="w-full glass-card bg-[#489FE3]/20 hover:bg-[#489FE3]/30 text-white border border-[#489FE3]/50"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Send Request
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="glass-card rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-white font-medium">TechCorp Inc.</h4>
                          <p className="text-white/60 text-sm">Product Manager</p>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                          Active
                        </Badge>
                      </div>
                    </div>
                    <p className="text-white/80 text-sm">
                      You have access to business features and can collaborate with your team.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="glass-card border-white/20 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 glass-card rounded-xl">
                    <div className="w-2 h-2 bg-[#489FE3] rounded-full"></div>
                    <div>
                      <p className="text-white text-sm">Joined a new brainstorm session</p>
                      <p className="text-white/60 text-xs">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 glass-card rounded-xl">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-white text-sm">Updated profile information</p>
                      <p className="text-white/60 text-xs">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 glass-card rounded-xl">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div>
                      <p className="text-white text-sm">Created new project idea</p>
                      <p className="text-white/60 text-xs">3 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Profile Modal */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="glass-card border-white/20 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="displayName" className="text-white">Display Name</Label>
                <Input
                  id="displayName"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                  className="glass border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="bio" className="text-white">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  className="glass border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-white">Location</Label>
                <Input
                  id="location"
                  value={profileData.location}
                  onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                  className="glass border-white/20 text-white"
                />
              </div>
              <Button
                onClick={handleSaveProfile}
                className="w-full glass-card bg-[#489FE3]/20 hover:bg-[#489FE3]/30 text-white border border-[#489FE3]/50"
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}