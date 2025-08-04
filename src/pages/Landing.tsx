import { Button } from "@/components/ui/button";
import { Brain, Building2, Lightbulb, FileText, Network } from "lucide-react";
import { useState } from "react";
import { AuthModal } from "@/components/auth/AuthModal";

export function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSignUp = () => {
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden pb-32">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#489FE3]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#489FE3]/10 rounded-full blur-3xl"></div>
      </div>

      {/* Logo and Header */}
      <div className="text-center mb-16 glass-business-header rounded-3xl p-8">
        <div className="flex items-center justify-center mb-6">
          <img 
            src="/lovable-uploads/1a58e202-c32a-4b09-89d8-ff1eb22b437d.png" 
            alt="Public Business Logo" 
            className="h-20 w-auto"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="text-center mb-16 max-w-4xl glass-business-header rounded-3xl p-12">
        <h2 className="text-5xl font-bold text-slate-800 mb-6 leading-tight">
          A place for everyone<br />
          to collaborate
        </h2>
        <p className="text-xl text-slate-600 mb-12">
          Share your ideas, discover projects, and<br />
          work together.
        </p>

        {/* Illustration Elements */}
        <div className="flex justify-center items-center mb-16 space-x-8">
          {/* Left side - Public member */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative glass-business-card rounded-full p-8">
              <div className="w-24 h-24 rounded-full flex items-center justify-center">
                <Brain className="w-12 h-12 text-[#489FE3]" />
              </div>
              <Lightbulb className="absolute -top-2 -left-2 w-8 h-8 text-[#489FE3] glass-business-card rounded-full p-1" />
              <FileText className="absolute -bottom-2 -left-2 w-8 h-8 text-[#489FE3] glass-business-card rounded-full p-1" />
            </div>
          </div>

          {/* Right side - Business member */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative glass-business-card rounded-full p-8">
              <div className="w-24 h-24 rounded-full flex items-center justify-center">
                <Building2 className="w-12 h-12 text-[#489FE3]" />
              </div>
              <Network className="absolute -top-2 -right-2 w-8 h-8 text-[#489FE3] glass-business-card rounded-full p-1" />
              <FileText className="absolute -bottom-2 -right-2 w-8 h-8 text-[#489FE3] glass-business-card rounded-full p-1" />
            </div>
          </div>
        </div>

        {/* Single Join Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleSignUp}
            className="glass-business-card bg-[#489FE3]/20 hover:bg-[#489FE3]/30 text-[#489FE3] border border-[#489FE3]/30 px-12 py-4 text-lg font-medium rounded-2xl h-auto transition-all duration-300 hover:scale-105"
          >
            JOIN AS PUBLIC MEMBER
          </Button>
        </div>
      </div>

      <AuthModal 
        open={showAuthModal} 
        onOpenChange={(open) => setShowAuthModal(open)}
      />
    </div>
  );
}