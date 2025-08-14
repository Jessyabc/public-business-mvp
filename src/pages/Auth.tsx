import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Brain, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusinessProfile } from "@/hooks/useBusinessProfile";
import { toast } from "sonner";

export default function Auth() {
  const { signIn, signUp, user } = useAuth();
  const { industries, departments, createProfile } = useBusinessProfile();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // User profile fields
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  
  // Company checkbox and business fields
  const [isCompany, setIsCompany] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [industryId, setIndustryId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [phone, setPhone] = useState("");
  const [companyBio, setCompanyBio] = useState("");

  useEffect(() => {
    document.title = "Sign in or create account | Public Business";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Sign in or sign up to Public Business to share brainstorms and insights.');
  }, []);

  const handleSignIn = async () => {
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) toast.error(error.message);
    else toast.success('Welcome back!');
    setLoading(false);
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword || !displayName) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (isCompany && !companyName) {
      toast.error('Company name is required');
      return;
    }
    
    setLoading(true);
    
    try {
      // Sign up user with appropriate type
      const userType = isCompany ? 'business' : 'public';
      const { error: signUpError } = await signUp(email, password, userType);
      
      if (signUpError) {
        toast.error(signUpError.message);
        setLoading(false);
        return;
      }
      
      // If business signup, create business profile
      if (isCompany) {
        try {
          await createProfile({
            company_name: companyName,
            industry_id: industryId || undefined,
            department_id: departmentId || undefined,
            company_size: companySize || undefined,
            phone: phone || undefined,
            website: website || undefined,
            linkedin_url: linkedinUrl || undefined,
            bio: companyBio || undefined,
          });
        } catch (businessError) {
          console.error('Error creating business profile:', businessError);
          // Don't fail the signup if business profile creation fails
        }
      }
      
      toast.success('Account created! Check your email to verify.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto max-w-xl px-4 py-12">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-semibold flex items-center justify-center gap-2">
          <Brain className="w-6 h-6 text-primary" /> Sign in or Create account
        </h1>
        <p className="text-muted-foreground mt-2">Access brainstorms and business insights.</p>
      </header>

      <section className="glass-card border rounded-xl p-6">
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input id="signin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <div className="relative">
                <Input id="signin-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pr-10" />
                <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button className="w-full" onClick={handleSignIn} disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
          </TabsContent>

          <TabsContent value="signup" className="space-y-6 mt-6">
            {/* Basic Account Info */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email *</Label>
                <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="display-name">Full Name *</Label>
                <Input id="display-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your full name" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password *</Label>
                <div className="relative">
                  <Input id="signup-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pr-10" />
                  <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-confirm">Confirm Password *</Label>
                <Input id="signup-confirm" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </div>
            
            {/* Company Checkbox */}
            <div className="flex items-center space-x-2 p-4 border rounded-lg bg-muted/30">
              <Checkbox 
                id="is-company" 
                checked={isCompany} 
                onCheckedChange={(checked) => setIsCompany(checked as boolean)}
              />
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="is-company" className="font-medium">Are you a company?</Label>
              </div>
            </div>
            
            {/* Personal Profile Fields */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Profile Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={3} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Your location" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourwebsite.com" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn Profile</Label>
                <Input id="linkedin" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/yourprofile" />
              </div>
            </div>
            
            {/* Business Fields - Conditional */}
            {isCompany && (
              <div className="space-y-4 p-4 border rounded-lg bg-blue-50/50">
                <h3 className="font-medium text-sm text-blue-700 uppercase tracking-wide flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Business Information
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name *</Label>
                  <Input id="company-name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your company name" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={industryId} onValueChange={setIndustryId}>
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
                    <Select value={departmentId} onValueChange={setDepartmentId}>
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
                  <Label htmlFor="company-size">Company Size</Label>
                  <Select value={companySize} onValueChange={setCompanySize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-1000">201-1000 employees</SelectItem>
                      <SelectItem value="1000+">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Your phone number" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-bio">Company Bio</Label>
                  <Textarea id="company-bio" value={companyBio} onChange={(e) => setCompanyBio(e.target.value)} placeholder="Tell us about your company..." rows={3} />
                </div>
              </div>
            )}
            
            <Button className="w-full" onClick={handleSignUp} disabled={loading}>
              {loading ? 'Creating account...' : isCompany ? 'Create Business Account' : 'Create Account'}
            </Button>
          </TabsContent>
        </Tabs>
      </section>
    </main>
  );
}
