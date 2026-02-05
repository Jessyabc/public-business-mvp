import { Card } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const Notifications = () => {
  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen p-6 pb-32 flex items-center justify-center">
        <Card className="glass-card p-12 max-w-md text-center">
          <Bell className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-3xl font-light text-foreground mb-4">Notifications</h1>
          <p className="text-muted-foreground">
            Coming soon. You'll be notified about responses, mentions, and badges earned.
          </p>
        </Card>
      </div>
    </ProtectedRoute>
  );
};

export default Notifications;
