import { useAppMode } from '@/contexts/AppModeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Brain, Building2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MyPosts = () => {
  const { mode } = useAppMode();
  const { user } = useAuth();

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
              {mode === 'public' ? (
                <Brain className="w-8 h-8 text-[#489FE3]" />
              ) : (
                <Building2 className="w-8 h-8 text-blue-600" />
              )}
              <h1 className={`text-4xl font-light tracking-wide ${
                mode === 'public' ? 'text-white' : 'text-slate-800'
              }`}>
                {mode === 'public' ? 'My Brainstorms' : 'My Business Posts'}
              </h1>
            </div>
            <p className={`mt-2 font-light max-w-2xl mx-auto text-center ${
              mode === 'public' ? 'text-white/80' : 'text-slate-600'
            }`}>
              {mode === 'public' 
                ? 'Your personal brainstorms & responses, sortable by T-Score, date, and engagement'
                : 'All content published by your company with utility metrics and interactions'
              }
            </p>
          </div>
        </header>

        {/* Content Area */}
        <div className="space-y-6">
          <Card className={`p-8 text-center transition-all duration-700 ${
            mode === 'public'
              ? 'glass-card border-white/20 bg-black/20'
              : 'border-blue-200/30 bg-white/40'
          }`}>
            <div className="space-y-4">
              <p className={`text-lg ${
                mode === 'public' ? 'text-white/70' : 'text-slate-600'
              }`}>
                {mode === 'public' 
                  ? "You haven't created any brainstorms yet."
                  : "You haven't published any business content yet."
                }
              </p>
              <Button 
                className={`transition-all duration-300 ${
                  mode === 'public'
                    ? 'bg-[#489FE3]/20 hover:bg-[#489FE3]/30 text-white border-[#489FE3]/50'
                    : 'bg-blue-100/40 hover:bg-blue-100/60 text-blue-600 border-blue-300/40'
                } glass-card backdrop-blur-xl`}
              >
                <Plus className="w-4 h-4 mr-2" />
                {mode === 'public' ? 'Create New Brainstorm' : 'Create New Insight'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MyPosts;