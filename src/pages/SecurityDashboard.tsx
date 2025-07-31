import { SecurityVerification } from '@/components/SecurityVerification';
import { useAuth } from '@/contexts/AuthContext';

export function SecurityDashboard() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground">Please sign in to access the security dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Security Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive security verification for authentication, authorization, and data access.
        </p>
      </div>
      
      <SecurityVerification />
    </div>
  );
}

export default SecurityDashboard;