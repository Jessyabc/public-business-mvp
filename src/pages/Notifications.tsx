import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Brain, Building2, ArrowLeft } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const Notifications = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'public' | 'business'>('public');

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen p-6 pb-32 bg-background">
        <div className="max-w-4xl mx-auto">
          {/* Go Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go back
          </Button>

          <header className="mb-8">
            <div className="glass-card rounded-3xl p-8 backdrop-blur-xl transition-all duration-700 border-white/20 bg-black/20">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Bell className="w-8 h-8 text-primary" />
                <h1 className="text-4xl font-light tracking-wide text-foreground">
                  Notifications
                </h1>
              </div>
              <p className="mt-2 font-light max-w-2xl mx-auto text-center text-muted-foreground">
                Feed-based responses, link mentions, badges earned
              </p>
            </div>
          </header>

          {/* Toggle Tabs */}
          <div className="flex justify-center mb-6">
            <div className="glass-card rounded-full p-1 transition-all duration-700 border-white/20 bg-black/20">
              <div className="flex space-x-1">
                <button 
                  onClick={() => setActiveTab('public')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    activeTab === 'public'
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Brain className="w-4 h-4" />
                  <span className="text-sm font-medium">Public</span>
                </button>
                <button 
                  onClick={() => setActiveTab('business')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    activeTab === 'business'
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Business</span>
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-4">
            <Card className="p-6 transition-all duration-700 glass-card border-white/20 bg-black/20">
              <div className="text-center py-8">
                <p className="text-lg text-muted-foreground">
                  No {activeTab} notifications yet.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Notifications;
