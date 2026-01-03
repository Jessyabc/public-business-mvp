import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Eye, EyeOff, Brain } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function Auth() {
  const { signIn, signUp, user } = useAuth();
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
  
  // Note: All users start as public_user, business membership is invite-only

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
    
    setLoading(true);
    
    try {
      // Everyone starts as public user
      const { error: signUpError } = await signUp(email, password, 'public');
      
      if (signUpError) {
        toast.error(signUpError.message);
        setLoading(false);
        return;
      }
      
      toast.success('Account created! Check your email to verify.');
    } catch (error: unknown) {
      // Error already handled by toast above, just log for debugging
      const message =
        error instanceof Error
          ? error.message
          : error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string'
            ? (error as { message: string }).message
            : 'Failed to create account';
      // Log for debugging but user already sees toast
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto max-w-xl px-4 py-12 mt-24">
      <header className="text-center mb-8 flex flex-col items-center gap-4">
        <img 
          src="/lovable-uploads/e501941c-3e1a-4f5a-a8d1-d3ad167d2e0c.png" 
          alt="Public Business Logo" 
          className="h-20 w-auto"
        />
        <h1 className="text-3xl font-semibold text-foreground">
          Sign in or Create account
        </h1>
        <p className="text-muted-foreground mt-2">Access brainstorms and business insights.</p>
      </header>

      <section className="glass-card border rounded-xl p-6 bg-background/95 backdrop-blur-md">
        <div className="scrim" />
        <div className="relative z-10">
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4 mt-6">
            <form onSubmit={(e) => { e.preventDefault(); handleSignIn(); }} className="space-y-4">
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
              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-6 mt-6">
            <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }} className="space-y-6">
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
              
              {/* Personal Profile Fields */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Profile Information (Optional)</h3>
                
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
                
                <div className="bg-blue-50/50 p-4 rounded-lg border">
                  <p className="text-sm text-blue-700 mb-2">
                    <strong>Note:</strong> All users start as Public Members. Business membership is invite-only.
                  </p>
                  <p className="text-xs text-blue-600">
                    Complete your profile after signup, then use an invite token to upgrade to Business Member.
                  </p>
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Public Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        </div>
      </section>
    </main>
  );
}
