import FlowView from "@/components/FlowView";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";

export function PublicFeed() {
  return (
    <div className="min-h-screen p-6">
      <div className="w-full h-screen">
        <header className="mb-8 text-center relative z-10">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Sparkles className="w-8 h-8 text-blue-400" />
            <h1 className="text-4xl font-light text-blue-100 tracking-wide">
              Brainstorm Network
            </h1>
          </div>
          <p className="text-blue-300/80 mt-2 font-light max-w-2xl mx-auto">
            Explore the interconnected web of ideas • Connect thoughts • Spark new brainstorms
          </p>
        </header>
        
        <div className="w-full h-[calc(100vh-200px)] relative">
          <FlowView />
          
          {/* Floating New Brainstorm Button */}
          <Button 
            className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/25 border border-blue-400/50 z-50"
            size="icon"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}