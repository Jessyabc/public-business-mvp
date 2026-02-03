import { GlassCard } from "@/ui/components/GlassCard";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useEffect, useRef } from "react";
import { ArrowRight, Users, Share, GitBranch, Building, Lightbulb, Sparkles } from "lucide-react";

interface TimelineProps {
  onComplete?: () => void;
}

const timelineSteps = [
  {
    id: 1,
    title: "Discover useful minds",
    description: "Connect with curious thinkers and problem solvers",
    icon: Users,
    color: "#3B82F6"
  },
  {
    id: 2,
    title: "Post an open idea",
    description: "Share your question or challenge with the community",
    icon: Lightbulb,
    color: "#EAB308"
  },
  {
    id: 3,
    title: "Watch it branch",
    description: "See how others build on your original thought",
    icon: GitBranch,
    color: "#10B981"
  },
  {
    id: 4,
    title: "Companies & people connect",
    description: "Watch meaningful collaborations emerge",
    icon: Building,
    color: "#8B5CF6"
  },
  {
    id: 5,
    title: "Insights turn into action",
    description: "Ideas transform into real-world solutions",
    icon: Share,
    color: "#F97316"
  },
  {
    id: 6,
    title: "Spark even more ideas",
    description: "Each solution becomes the seed for new possibilities",
    icon: Sparkles,
    color: "#EC4899"
  }
];

export function Timeline({ onComplete }: TimelineProps) {
  const analytics = useAnalytics();
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track when timeline nodes come into view
  useEffect(() => {
    const observers = stepRefs.current.map((ref, index) => {
      if (!ref) return null;
      
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            analytics.trackTimelineNode(index + 1);
          }
        },
        { threshold: 0.5 }
      );
      
      observer.observe(ref);
      return observer;
    });

    // Track when composer is reached
    const lastStepRef = stepRefs.current[stepRefs.current.length - 1];
    if (lastStepRef) {
      const composerObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            analytics.trackComposerReached();
            if (onComplete) onComplete();
          }
        },
        { threshold: 0.8 }
      );
      
      composerObserver.observe(lastStepRef);
      
      return () => {
        observers.forEach(obs => obs?.disconnect());
        composerObserver.disconnect();
      };
    }

    return () => {
      observers.forEach(obs => obs?.disconnect());
    };
  }, [analytics, onComplete]);

  return (
    <div className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-4">
          How Ideas Come to Life
        </h2>
        <p className="text-lg text-white/70 max-w-2xl mx-auto">
          From spark to solution, watch your curiosity create connections
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <div className="flex space-x-6 pb-6 min-w-max px-6">
          {timelineSteps.map((step, index) => (
            <div 
              key={step.id} 
              className="flex items-center"
              ref={(el) => { stepRefs.current[index] = el; }}
            >
              <GlassCard className="w-80 p-6 text-center transition-all duration-300 hover:scale-105">
                <div 
                  className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center transition-all duration-300`}
                  style={{ backgroundColor: step.color }}
                >
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  {step.title}
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {step.description}
                </p>
              </GlassCard>
              
              {index < timelineSteps.length - 1 && (
                <div className="flex items-center justify-center py-4">
                  <ArrowRight className="w-6 h-6 text-white/50" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}