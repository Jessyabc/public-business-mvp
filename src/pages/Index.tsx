// Update this page (the content is just a fallback if you fail to update the page)

import SparkBox from "@/components/SparkBox";
import DynamicMenu from "@/components/DynamicMenu";

const Index = () => {
  return (
    <div className="min-h-screen pb-32 px-6">
      <div className="max-w-4xl mx-auto pt-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-light text-foreground/90 tracking-wide">
            Your Brainstorms
          </h1>
          <p className="text-foreground/60 mt-2 font-light">
            Floating ideas in digital space
          </p>
        </header>
        
        <div className="space-y-6">
          <SparkBox />
          <SparkBox content="Another brilliant idea waiting to be explored!" />
          <SparkBox content="The future of business starts with a simple spark ✨" />
        </div>
      </div>
      
      <DynamicMenu />
    </div>
  );
};

export default Index;
