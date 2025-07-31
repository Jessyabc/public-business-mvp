import FlowView from "@/components/FlowView";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";

export function PublicFeed() {
  return (
    <div className="min-h-screen p-6 relative overflow-hidden pb-32 transition-all duration-700 ease-in-out">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#489FE3]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#489FE3]/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full h-screen">
        <header className="mb-8 text-center relative z-10">
          <div className="glass-card rounded-3xl p-8 backdrop-blur-xl mb-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Sparkles className="w-8 h-8 text-[#489FE3]" />
              <h1 className="text-4xl font-light text-white tracking-wide">
                Brainstorm Network
              </h1>
            </div>
            <p className="text-white/80 mt-2 font-light max-w-2xl mx-auto">
              Explore the interconnected web of ideas • Connect thoughts • Spark new brainstorms
            </p>
          </div>
        </header>
        
        <div className="w-full h-[calc(100vh-280px)] relative">
          <FlowView />
          
          {/* Floating New Brainstorm Button */}
          <Button 
            className="fixed bottom-24 right-8 w-16 h-16 rounded-full glass-card bg-[#489FE3]/20 hover:bg-[#489FE3]/30 text-white border border-[#489FE3]/50 backdrop-blur-xl transition-all duration-300 hover:scale-110 z-40"
            size="icon"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}