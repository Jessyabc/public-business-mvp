import { useState } from 'react';
import { Page } from '@/ui/layouts/Page';
import { GlassCard } from '@/ui/components/GlassCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Cpu, 
  DollarSign, 
  Heart, 
  Factory, 
  ShoppingBag, 
  GraduationCap, 
  Truck, 
  Megaphone, 
  Shield, 
  Users 
} from 'lucide-react';

interface Industry {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  importance: string;
  keyInsights: string[];
  gradient: string;
}

const industries: Industry[] = [
  {
    id: "technology",
    name: "Technology",
    icon: <Cpu className="h-8 w-8" />,
    description: "Innovation drives progress in digital transformation, AI, and software development.",
    importance: "Technology shapes how we work, communicate, and solve complex problems across all industries.",
    keyInsights: [
      "Rapid adoption of AI and machine learning",
      "Remote work transformation",
      "Cloud-first architecture becoming standard",
      "Cybersecurity as business priority"
    ],
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    id: "finance",
    name: "Finance",
    icon: <DollarSign className="h-8 w-8" />,
    description: "Digital banking, fintech innovation, and sustainable finance reshape monetary systems.",
    importance: "Financial services enable economic growth and provide access to capital for businesses and individuals.",
    keyInsights: [
      "Digital payment systems expansion",
      "Cryptocurrency and blockchain adoption",
      "ESG investment criteria",
      "Regulatory technology (RegTech) growth"
    ],
    gradient: "from-green-500 to-emerald-500"
  },
  {
    id: "healthcare",
    name: "Healthcare",
    icon: <Heart className="h-8 w-8" />,
    description: "Telemedicine, personalized treatments, and health tech improve patient outcomes.",
    importance: "Healthcare innovation directly impacts quality of life and population health outcomes.",
    keyInsights: [
      "Telemedicine mainstream adoption",
      "Personalized medicine advancement",
      "AI-driven diagnostics",
      "Digital health records integration"
    ],
    gradient: "from-red-500 to-pink-500"
  },
  {
    id: "manufacturing",
    name: "Manufacturing",
    icon: <Factory className="h-8 w-8" />,
    description: "Industry 4.0, automation, and sustainable production transform manufacturing.",
    importance: "Manufacturing drives economic growth and job creation while adapting to sustainability demands.",
    keyInsights: [
      "Smart factory implementation",
      "Supply chain resilience focus",
      "Sustainable manufacturing practices",
      "Robotics and automation integration"
    ],
    gradient: "from-orange-500 to-amber-500"
  },
  {
    id: "retail",
    name: "Retail",
    icon: <ShoppingBag className="h-8 w-8" />,
    description: "Omnichannel experiences and sustainable commerce redefine retail landscapes.",
    importance: "Retail evolution affects consumer behavior and drives innovation in customer experience.",
    keyInsights: [
      "Omnichannel customer experience",
      "Social commerce growth",
      "Sustainable product demand",
      "AR/VR shopping experiences"
    ],
    gradient: "from-purple-500 to-violet-500"
  },
  {
    id: "education",
    name: "Education",
    icon: <GraduationCap className="h-8 w-8" />,
    description: "Digital learning platforms and personalized education transform knowledge delivery.",
    importance: "Education shapes future workforce capabilities and drives societal advancement.",
    keyInsights: [
      "Hybrid learning models",
      "Personalized learning paths",
      "Skills-based education focus",
      "Educational technology integration"
    ],
    gradient: "from-indigo-500 to-blue-500"
  },
  {
    id: "logistics",
    name: "Logistics",
    icon: <Truck className="h-8 w-8" />,
    description: "Smart logistics, last-mile delivery innovation, and supply chain optimization.",
    importance: "Efficient logistics enable global trade and just-in-time business models.",
    keyInsights: [
      "Last-mile delivery innovation",
      "Autonomous vehicle integration",
      "Real-time tracking systems",
      "Sustainable logistics practices"
    ],
    gradient: "from-teal-500 to-cyan-500"
  },
  {
    id: "marketing",
    name: "Marketing",
    icon: <Megaphone className="h-8 w-8" />,
    description: "Data-driven marketing, privacy-first approaches, and authentic brand connections.",
    importance: "Marketing drives business growth and shapes consumer relationships in digital-first world.",
    keyInsights: [
      "Privacy-first marketing strategies",
      "Influencer marketing evolution",
      "AI-powered personalization",
      "Authentic brand storytelling"
    ],
    gradient: "from-pink-500 to-rose-500"
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    icon: <Shield className="h-8 w-8" />,
    description: "Zero-trust security, threat intelligence, and cyber resilience protect digital assets.",
    importance: "Cybersecurity ensures business continuity and protects sensitive data in digital economy.",
    keyInsights: [
      "Zero-trust security models",
      "AI-powered threat detection",
      "Cyber resilience strategies",
      "Compliance automation"
    ],
    gradient: "from-slate-500 to-gray-500"
  },
  {
    id: "hr",
    name: "Human Resources",
    icon: <Users className="h-8 w-8" />,
    description: "People analytics, remote workforce management, and employee experience innovation.",
    importance: "HR transformation drives organizational success and employee engagement in modern workplace.",
    keyInsights: [
      "People analytics adoption",
      "Remote workforce optimization",
      "Employee experience platforms",
      "Skills-based hiring practices"
    ],
    gradient: "from-emerald-500 to-teal-500"
  }
];

export default function Industries() {
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);

  return (
    <Page maxWidth="xl" padding="lg">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold text-ink-base mb-6">
          Industries We Serve
        </h1>
        <p className="text-xl text-ink-base/70 max-w-3xl mx-auto">
          Discover how innovation and collaboration transform every sector of the economy.
        </p>
      </section>

      {/* Industries Grid */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {industries.map((industry) => (
            <GlassCard
              key={industry.id}
              className="p-6 hover:scale-105 transition-all duration-300 cursor-pointer group"
              onClick={() => setSelectedIndustry(industry)}
            >
              <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${industry.gradient} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {industry.icon}
              </div>
              <h3 className="text-xl font-bold text-ink-base mb-3">
                {industry.name}
              </h3>
              <p className="text-ink-base/70 leading-relaxed">
                {industry.description}
              </p>
              <div className="mt-4">
                <Button variant="ghost" className="text-pb-blue hover:text-pb-blue/80 p-0 h-auto font-medium">
                  Learn More →
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center">
        <GlassCard className="p-12 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-ink-base mb-4">
            Ready to Transform Your Industry?
          </h2>
          <p className="text-lg text-ink-base/70 mb-8">
            Join thousands of professionals collaborating to shape the future of their industries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-pb-blue hover:bg-pb-blue/90 text-white">
              Join Public Business
            </Button>
            <Button size="lg" variant="outline">
              Explore Features
            </Button>
          </div>
        </GlassCard>
      </section>

      {/* Industry Detail Modal */}
      <Dialog open={!!selectedIndustry} onOpenChange={() => setSelectedIndustry(null)}>
        <DialogContent className="max-w-2xl">
          {selectedIndustry && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${selectedIndustry.gradient} flex items-center justify-center text-white`}>
                    {selectedIndustry.icon}
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-bold">
                      {selectedIndustry.name}
                    </DialogTitle>
                    <DialogDescription className="text-lg">
                      {selectedIndustry.description}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-ink-base">Why This Industry Matters</h4>
                  <p className="text-ink-base/70 leading-relaxed">
                    {selectedIndustry.importance}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-3 text-ink-base">Key Insights & Trends</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedIndustry.keyInsights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-pb-blue rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-sm text-ink-base/80">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button 
                    onClick={() => setSelectedIndustry(null)}
                    className="w-full bg-pb-blue hover:bg-pb-blue/90 text-white"
                  >
                    Explore {selectedIndustry.name} Collaborations
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Page>
  );
}