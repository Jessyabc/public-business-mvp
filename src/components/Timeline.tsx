import { GlassCard } from "@/ui/components/GlassCard";
import { ArrowRight, Users, Share, GitBranch, Building, Lightbulb, Sparkles } from "lucide-react";

const timelineSteps = [
  {
    id: 1,
    title: "Discover useful minds",
    description: "Connect with curious thinkers and problem solvers",
    icon: Users,
    color: "text-blue-500"
  },
  {
    id: 2,
    title: "Post an open idea",
    description: "Share your question or challenge with the community",
    icon: Lightbulb,
    color: "text-yellow-500"
  },
  {
    id: 3,
    title: "Watch it branch",
    description: "See how others build on your original thought",
    icon: GitBranch,
    color: "text-green-500"
  },
  {
    id: 4,
    title: "Companies & people connect",
    description: "Watch meaningful collaborations emerge",
    icon: Building,
    color: "text-purple-500"
  },
  {
    id: 5,
    title: "Insights turn into action",
    description: "Ideas transform into real-world solutions",
    icon: Share,
    color: "text-orange-500"
  },
  {
    id: 6,
    title: "Spark even more ideas",
    description: "Each solution becomes the seed for new possibilities",
    icon: Sparkles,
    color: "text-pink-500"
  }
];

export function Timeline() {
  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-foreground mb-4">
          How Ideas Come to Life
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          From spark to solution, watch your curiosity create connections
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <div className="flex space-x-6 pb-6 min-w-max px-6">
          {timelineSteps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <GlassCard 
                className="min-w-[280px] glass-card glass-content hover-glass"
                padding="lg"
              >
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 ${step.color}`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </GlassCard>
              
              {index < timelineSteps.length - 1 && (
                <ArrowRight className="w-6 h-6 text-primary/60 mx-4 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}