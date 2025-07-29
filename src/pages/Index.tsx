// Update this page (the content is just a fallback if you fail to update the page)

import SparkBox from "@/components/SparkBox";
import DynamicMenu from "@/components/DynamicMenu";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-screen-xl mx-auto p-5">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground">
            Your Brainstorms
          </h1>
        </header>
        
        <div className="space-y-4">
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
