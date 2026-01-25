import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GlassInput } from '@/components/ui/GlassInput';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function AuthModal({
  open,
  onOpenChange
}: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType] = useState<'public' | 'business'>('public'); // Always public for initial signup
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    signIn,
    signUp
  } = useAuth();
  const handleSignIn = async () => {
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    const {
      error
    } = await signIn(email, password);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Welcome back!');
      onOpenChange(false);
      resetForm();
    }
    setLoading(false);
  };
  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const {
      error
    } = await signUp(email, password, userType);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created! Please check your email to verify.');
      onOpenChange(false);
      resetForm();
    }
    setLoading(false);
  };
  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    // userType is always 'public' - no need to reset
  };
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-border/20 bg-background/95 backdrop-blur-md fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6">
        <DialogHeader className="flex flex-col items-center space-y-2">
          <img alt="Public Business Logo" src="/lovable-uploads/ed5d63eb-6f9b-49cf-93a9-6da7cef3b358.png" className="h-3/4 w-auto max-h-64 " />
          <DialogTitle className="sr-only">Sign in or create account</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="signin" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4 mt-6">
            <form onSubmit={e => {
            e.preventDefault();
            handleSignIn();
          }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <GlassInput id="signin-email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <GlassInput id="signin-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="pr-10" />
                  <button type="button" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </div>
              </div>

              <div className="text-center">
                <a href="/forgot-password" className="text-sm text-muted-foreground hover:text-primary underline" onClick={e => {
                e.preventDefault();
                onOpenChange(false);
                window.location.href = '/forgot-password';
              }}>
                  Forgot your password?
                </a>
              </div>

              <button type="submit" disabled={loading} className="glassButton glassButton--accent w-full">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-6">
              <form onSubmit={e => {
            e.preventDefault();
            handleSignUp();
          }} className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-3 text-center border border-border/20">
                  <p className="text-sm text-muted-foreground">
                    Join as a Public Member. You can request business membership later through your profile.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <GlassInput id="signup-email" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <GlassInput id="signup-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="pr-10" />
                    <button type="button" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <GlassInput id="confirm-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>

                <button type="submit" disabled={loading} className="glassButton glassButton--accent w-full">
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>
            </TabsContent>
          </Tabs>
      </DialogContent>
    </Dialog>;
}