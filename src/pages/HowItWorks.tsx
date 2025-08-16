import { Card } from "@/components/ui/card";
import { useAppMode } from "@/contexts/AppModeContext";
import { Brain, Building2, Users, ArrowRight, CheckCircle, Lightbulb, Network, FileText, MessageSquare, Search } from "lucide-react";

export default function HowItWorks() {
  const { mode } = useAppMode();

  const steps = [
    {
      icon: Users,
      title: "Join the Community",
      description: "Sign up as a Public Member to start sharing your ideas and collaborating with others.",
      color: "text-blue-500"
    },
    {
      icon: Lightbulb,
      title: "Share Your Ideas",
      description: "Create brainstorms, share insights, and contribute to ongoing projects and discussions.",
      color: "text-yellow-500"
    },
    {
      icon: Network,
      title: "Connect & Collaborate",
      description: "Find like-minded individuals, join projects, and build meaningful professional relationships.",
      color: "text-green-500"
    },
    {
      icon: Building2,
      title: "Upgrade to Business",
      description: "Apply for Business Membership to access advanced networking and partnership opportunities.",
      color: "text-purple-500"
    }
  ];

  const features = [
    {
      icon: Brain,
      title: "Public Mode",
      description: "Share brainstorms and creative ideas with the community",
      benefits: [
        "Access to public feed and discussions",
        "Profile creation and customization",
        "Brainstorm sharing and collaboration",
        "Community networking"
      ]
    },
    {
      icon: Building2,
      title: "Business Mode",
      description: "Professional networking and business development",
      benefits: [
        "All Public Mode features",
        "Business profile and company information",
        "Advanced networking tools",
        "Partnership and collaboration opportunities",
        "Exclusive business content and insights"
      ]
    }
  ];

  return (
    <div className="min-h-screen p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-foreground">How It Works</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Public Business is a collaborative platform where creativity meets professional networking. 
            Here's how you can get started and make the most of your experience.
          </p>
        </div>
        
        {/* Steps Section */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-center text-foreground">Getting Started</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="relative">
                  <Card className={`p-6 text-center space-y-4 transition-all duration-300 hover:scale-105 ${
                    mode === 'public' 
                      ? 'bg-slate-800/40 border-white/20' 
                      : 'bg-white/60 border-blue-200/30'
                  }`}>
                    <div className="flex justify-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-white/10 border border-white/20`}>
                        <IconComponent className={`w-8 h-8 ${step.color}`} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                    <div className="text-xs font-medium text-primary">
                      Step {index + 1}
                    </div>
                  </Card>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2">
                      <ArrowRight className="w-6 h-6 text-primary/50" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Features Comparison */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-center text-foreground">Membership Types</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className={`p-8 space-y-6 transition-all duration-300 hover:scale-105 ${
                  mode === 'public' 
                    ? 'bg-slate-800/40 border-white/20' 
                    : 'bg-white/60 border-blue-200/30'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-purple-500/20 border border-purple-500/30'
                    }`}>
                      <IconComponent className={`w-6 h-6 ${index === 0 ? 'text-blue-500' : 'text-purple-500'}`} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {feature.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center gap-3">
                        <CheckCircle className={`w-4 h-4 ${index === 0 ? 'text-blue-500' : 'text-purple-500'}`} />
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Key Features */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-center text-foreground">Platform Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className={`p-6 text-center space-y-4 transition-all duration-300 hover:scale-105 ${
              mode === 'public' 
                ? 'bg-slate-800/40 border-white/20' 
                : 'bg-white/60 border-blue-200/30'
            }`}>
              <FileText className="w-12 h-12 text-green-500 mx-auto" />
              <h3 className="text-lg font-semibold text-foreground">Content Sharing</h3>
              <p className="text-sm text-muted-foreground">
                Share posts, brainstorms, and insights with the community through our intuitive content creation tools.
              </p>
            </Card>
            
            <Card className={`p-6 text-center space-y-4 transition-all duration-300 hover:scale-105 ${
              mode === 'public' 
                ? 'bg-slate-800/40 border-white/20' 
                : 'bg-white/60 border-blue-200/30'
            }`}>
              <MessageSquare className="w-12 h-12 text-blue-500 mx-auto" />
              <h3 className="text-lg font-semibold text-foreground">Real-time Communication</h3>
              <p className="text-sm text-muted-foreground">
                Engage with other members through comments, feedback, and direct messaging features.
              </p>
            </Card>
            
            <Card className={`p-6 text-center space-y-4 transition-all duration-300 hover:scale-105 ${
              mode === 'public' 
                ? 'bg-slate-800/40 border-white/20' 
                : 'bg-white/60 border-blue-200/30'
            }`}>
              <Search className="w-12 h-12 text-purple-500 mx-auto" />
              <h3 className="text-lg font-semibold text-foreground">Discovery & Research</h3>
              <p className="text-sm text-muted-foreground">
                Find relevant projects, members, and opportunities through our advanced search and filtering systems.
              </p>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-6 py-16">
          <h2 className="text-3xl font-bold text-foreground">Ready to Get Started?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join our growing community of creators, innovators, and business professionals today.
          </p>
        </div>
      </div>
    </div>
  );
}