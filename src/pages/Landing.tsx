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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col items-center justify-center p-6">
      {/* Logo and Header */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center mb-6">
          <img 
            src="/lovable-uploads/1a58e202-c32a-4b09-89d8-ff1eb22b437d.png" 
            alt="Public Business Logo" 
            className="h-20 w-auto"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="text-center mb-16 max-w-4xl">
        <h2 className="text-5xl font-bold text-[#000000] mb-6 leading-tight">
          A place for everyone<br />
          to collaborate
        </h2>
        <p className="text-xl text-gray-600 mb-12">
          Share your ideas, discover projects, and<br />
          work together.
        </p>

        {/* Illustration Elements */}
        <div className="flex justify-center items-center mb-16 space-x-8">
          {/* Left side - Woman with lightbulb and document */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-32 h-32 bg-[#489FE3]/10 rounded-full flex items-center justify-center">
                <Brain className="w-16 h-16 text-[#489FE3]" />
              </div>
              <Lightbulb className="absolute -top-2 -left-2 w-8 h-8 text-[#489FE3]" />
              <FileText className="absolute -bottom-2 -left-2 w-8 h-8 text-[#489FE3]" />
            </div>
          </div>

          {/* Right side - Man with network diagram */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-32 h-32 bg-[#489FE3]/10 rounded-full flex items-center justify-center">
                <Building2 className="w-16 h-16 text-[#489FE3]" />
              </div>
              <Network className="absolute -top-2 -right-2 w-8 h-8 text-[#489FE3]" />
              <FileText className="absolute -bottom-2 -right-2 w-8 h-8 text-[#489FE3]" />
            </div>
          </div>
        </div>

        {/* Single Join Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleSignUp}
            className="bg-[#489FE3] hover:bg-[#489FE3]/90 text-white px-12 py-4 text-lg font-medium rounded-lg h-auto"
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