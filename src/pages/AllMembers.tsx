import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAppMode } from "@/contexts/AppModeContext";
import { Users, Building2, Brain, Network } from "lucide-react";

export default function AllMembers() {
  const navigate = useNavigate();
  const { mode } = useAppMode();

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">All Members</h1>
          <p className="text-xl text-muted-foreground">
            Explore our community of public and business members
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Public Members Card */}
          <Card className={`p-8 text-center space-y-6 transition-all duration-300 hover:scale-105 cursor-pointer ${
            mode === 'public' 
              ? 'bg-slate-800/40 border-white/20' 
              : 'bg-white/60 border-blue-200/30'
          }`}>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-primary/20 border border-primary/30">
                  <Brain className="w-12 h-12 text-primary" />
                </div>
                <Users className="absolute -top-2 -right-2 w-8 h-8 text-primary bg-background rounded-full p-1 border border-primary/30" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Public Members</h2>
              <p className="text-muted-foreground">
                Creative individuals sharing ideas, brainstorms, and collaborating on innovative projects
              </p>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <Brain className="w-4 h-4" />
                  <span>Share brainstorms and ideas</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Network className="w-4 h-4" />
                  <span>Collaborate on projects</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Build community connections</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => navigate('/public-members')}
              className="w-full"
              variant="default"
            >
              View Public Members
            </Button>
          </Card>
          
          {/* Business Members Card */}
          <Card className={`p-8 text-center space-y-6 transition-all duration-300 hover:scale-105 cursor-pointer ${
            mode === 'public' 
              ? 'bg-slate-800/40 border-white/20' 
              : 'bg-white/60 border-blue-200/30'
          }`}>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-blue-500/20 border border-blue-500/30">
                  <Building2 className="w-12 h-12 text-blue-600" />
                </div>
                <Network className="absolute -top-2 -right-2 w-8 h-8 text-blue-600 bg-background rounded-full p-1 border border-blue-500/30" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-foreground">Business Members</h2>
              <p className="text-muted-foreground">
                Professional organizations and entrepreneurs building strategic partnerships and business opportunities
              </p>
              
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>Professional networking</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Network className="w-4 h-4" />
                  <span>Strategic partnerships</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Business opportunities</span>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={() => navigate('/business-members')}
              className="w-full"
              variant="secondary"
            >
              View Business Members
            </Button>
          </Card>
        </div>
        
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Want to upgrade your account? Join our business community for enhanced networking opportunities.
          </p>
          <Button 
            onClick={() => navigate('/profile')}
            variant="outline"
            className="px-8"
          >
            Manage Your Profile
          </Button>
        </div>
      </div>
    </div>
  );
}