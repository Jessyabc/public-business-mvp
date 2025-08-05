import { useAppMode } from '@/contexts/AppModeContext';
import { Card } from '@/components/ui/card';
import { Bell, Brain, Building2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const Notifications = () => {
  const { mode } = useAppMode();

  return (
    <div className={`min-h-screen p-6 pb-32 transition-all duration-700 ease-in-out ${
      mode === 'public' 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className={`glass-card rounded-3xl p-8 backdrop-blur-xl transition-all duration-700 ${
            mode === 'public'
              ? 'border-white/20 bg-black/20'
              : 'border-blue-200/30 bg-white/40'
          }`}>
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Bell className={`w-8 h-8 ${
                mode === 'public' ? 'text-[#489FE3]' : 'text-blue-600'
              }`} />
              <h1 className={`text-4xl font-light tracking-wide ${
                mode === 'public' ? 'text-white' : 'text-slate-800'
              }`}>
                Notifications
              </h1>
            </div>
            <p className={`mt-2 font-light max-w-2xl mx-auto text-center ${
              mode === 'public' ? 'text-white/80' : 'text-slate-600'
            }`}>
              Feed-based responses, link mentions, badges earned
            </p>
          </div>
        </header>

        {/* Toggle Tabs */}
        <div className="flex justify-center mb-6">
          <div className={`glass-card rounded-full p-1 transition-all duration-700 ${
            mode === 'public'
              ? 'border-white/20 bg-black/20'
              : 'border-blue-200/30 bg-white/40'
          }`}>
            <div className="flex space-x-1">
              <button className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                mode === 'public'
                  ? 'bg-[#489FE3]/20 text-[#489FE3]'
                  : 'bg-blue-100/40 text-blue-600'
              }`}>
                <Brain className="w-4 h-4" />
                <span className="text-sm font-medium">Public</span>
              </button>
              <button className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                mode === 'public' ? 'text-white/70 hover:text-white' : 'text-slate-600 hover:text-slate-700'
              }`}>
                <Building2 className="w-4 h-4" />
                <span className="text-sm font-medium">Business</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          <Card className={`p-6 transition-all duration-700 ${
            mode === 'public'
              ? 'glass-card border-white/20 bg-black/20'
              : 'border-blue-200/30 bg-white/40'
          }`}>
            <div className="text-center py-8">
              <p className={`text-lg ${
                mode === 'public' ? 'text-white/70' : 'text-slate-600'
              }`}>
                No notifications yet.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Notifications;