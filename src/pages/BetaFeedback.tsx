import { useAppMode } from '@/contexts/AppModeContext';
import { Card } from '@/components/ui/card';
import { MessageSquare, Bug, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const BetaFeedback = () => {
  const { mode } = useAppMode();

  return (
    <div className={`min-h-screen p-6 pb-32 transition-all duration-700 ease-in-out ${
      mode === 'public' 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <div className={`glass-card rounded-3xl p-8 backdrop-blur-xl transition-all duration-700 ${
            mode === 'public'
              ? 'border-white/20 bg-black/20'
              : 'border-blue-200/30 bg-white/40'
          }`}>
            <div className="flex items-center justify-center space-x-3 mb-4">
              <MessageSquare className={`w-8 h-8 ${
                mode === 'public' ? 'text-[#489FE3]' : 'text-blue-600'
              }`} />
              <h1 className={`text-4xl font-light tracking-wide ${
                mode === 'public' ? 'text-white' : 'text-slate-800'
              }`}>
                Beta Feedback
              </h1>
            </div>
            <p className={`mt-2 font-light max-w-2xl mx-auto text-center ${
              mode === 'public' ? 'text-white/80' : 'text-slate-600'
            }`}>
              Help us improve Public Business by sharing your thoughts
            </p>
          </div>
        </header>

        {/* Feedback Options */}
        <div className="grid gap-6 mb-8">
          <Card className={`p-6 transition-all duration-700 ${
            mode === 'public'
              ? 'glass-card border-white/20 bg-black/20'
              : 'border-blue-200/30 bg-white/40'
          }`}>
            <div className="flex items-center space-x-4 mb-4">
              <MessageSquare className={`w-6 h-6 ${
                mode === 'public' ? 'text-[#489FE3]' : 'text-blue-600'
              }`} />
              <h3 className={`text-lg font-medium ${
                mode === 'public' ? 'text-white' : 'text-slate-800'
              }`}>
                General Feedback
              </h3>
            </div>
            <Textarea 
              placeholder="Share your thoughts about the platform..."
              className={`transition-all duration-700 ${
                mode === 'public'
                  ? 'glass-card border-white/20 bg-black/20 text-white placeholder:text-white/50'
                  : 'border-blue-200/30 bg-white/40 text-slate-800 placeholder:text-slate-500'
              }`}
            />
            <Button className="mt-4 w-full">Submit Feedback</Button>
          </Card>

          <Card className={`p-6 transition-all duration-700 ${
            mode === 'public'
              ? 'glass-card border-white/20 bg-black/20'
              : 'border-blue-200/30 bg-white/40'
          }`}>
            <div className="flex items-center space-x-4 mb-4">
              <Bug className={`w-6 h-6 ${
                mode === 'public' ? 'text-red-400' : 'text-red-500'
              }`} />
              <h3 className={`text-lg font-medium ${
                mode === 'public' ? 'text-white' : 'text-slate-800'
              }`}>
                Bug Report
              </h3>
            </div>
            <Textarea 
              placeholder="Describe the bug you encountered..."
              className={`transition-all duration-700 ${
                mode === 'public'
                  ? 'glass-card border-white/20 bg-black/20 text-white placeholder:text-white/50'
                  : 'border-blue-200/30 bg-white/40 text-slate-800 placeholder:text-slate-500'
              }`}
            />
            <Button variant="destructive" className="mt-4 w-full">Report Bug</Button>
          </Card>

          <Card className={`p-6 transition-all duration-700 ${
            mode === 'public'
              ? 'glass-card border-white/20 bg-black/20'
              : 'border-blue-200/30 bg-white/40'
          }`}>
            <div className="flex items-center space-x-4 mb-4">
              <Lightbulb className={`w-6 h-6 ${
                mode === 'public' ? 'text-yellow-400' : 'text-yellow-500'
              }`} />
              <h3 className={`text-lg font-medium ${
                mode === 'public' ? 'text-white' : 'text-slate-800'
              }`}>
                Feature Suggestion
              </h3>
            </div>
            <Textarea 
              placeholder="What feature would you like to see added?"
              className={`transition-all duration-700 ${
                mode === 'public'
                  ? 'glass-card border-white/20 bg-black/20 text-white placeholder:text-white/50'
                  : 'border-blue-200/30 bg-white/40 text-slate-800 placeholder:text-slate-500'
              }`}
            />
            <Button variant="secondary" className="mt-4 w-full">Submit Suggestion</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BetaFeedback;