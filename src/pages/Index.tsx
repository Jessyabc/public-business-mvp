// Update this page (the content is just a fallback if you fail to update the page)

import FlowView from "@/components/FlowView";
import DynamicMenu from "@/components/DynamicMenu";

const Index = () => {
  return (
    <div className="min-h-screen pb-32 px-6">
      <div className="w-full h-screen pt-12">
        <header className="mb-8 text-center relative z-10">
          <h1 className="text-4xl font-light text-foreground/90 tracking-wide">
            Your Brainstorms
          </h1>
          <p className="text-foreground/60 mt-2 font-light">
            Connected thoughts in visual flow • Zoom to explore idea networks
          </p>
        </header>
        
        <div className="w-full h-[calc(100vh-200px)] relative">
          <FlowView />
        </div>
      </div>
      
      <DynamicMenu />
    </div>
  );
};

export default Index;
