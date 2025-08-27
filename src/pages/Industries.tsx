import { Page } from '@/ui/layouts/Page';
import { GlassCard } from '@/ui/components/GlassCard';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Stethoscope, 
  Laptop, 
  Banknote, 
  Factory, 
  Truck, 
  GraduationCap, 
  Zap, 
  Leaf, 
  ShoppingCart, 
  Plane, 
  Home,
  Car,
  Smartphone,
  Shield,
  Camera
} from 'lucide-react';

interface Industry {
  id: string;
  name: string;
  icon: any;
  description: string;
  importance: string;
  keyInsights: string[];
  gradient: string;
}

const industries: Industry[] = [
  {
    id: 'healthcare',
    name: 'Healthcare & Medical',
    icon: Stethoscope,
    description: 'Healthcare encompasses medical services, pharmaceuticals, biotechnology, and medical devices focused on improving patient outcomes and advancing medical research.',
    importance: 'Essential for human wellbeing and quality of life, driving innovation in treatments, diagnostics, and preventive care.',
    keyInsights: ['Patient-centered care trends', 'Digital health innovations', 'Regulatory compliance updates', 'Medical breakthrough analysis'],
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'technology',
    name: 'Technology & Software',
    icon: Laptop,
    description: 'The technology sector drives digital transformation through software development, artificial intelligence, cloud computing, and emerging technologies.',
    importance: 'Powers modern business operations and enables innovation across all other industries through digital solutions.',
    keyInsights: ['AI and machine learning trends', 'Cybersecurity developments', 'Cloud migration strategies', 'Tech talent market analysis'],
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    id: 'finance',
    name: 'Financial Services',
    icon: Banknote,
    description: 'Financial services include banking, investment, insurance, and fintech solutions that facilitate economic transactions and wealth management.',
    importance: 'Fundamental to economic stability and growth, enabling capital flow and risk management across global markets.',
    keyInsights: ['Fintech disruption analysis', 'Regulatory changes impact', 'Investment market trends', 'Digital banking evolution'],
    gradient: 'from-yellow-500 to-orange-600'
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing & Industrial',
    icon: Factory,
    description: 'Manufacturing transforms raw materials into finished products through industrial processes, automation, and supply chain management.',
    importance: 'Backbone of economic production, creating jobs and driving technological advancement in production methods.',
    keyInsights: ['Industry 4.0 adoption', 'Supply chain optimization', 'Sustainability initiatives', 'Automation ROI analysis'],
    gradient: 'from-gray-500 to-slate-600'
  },
  {
    id: 'logistics',
    name: 'Logistics & Transportation',
    icon: Truck,
    description: 'Logistics manages the flow of goods and services from origin to consumption, including warehousing, transportation, and distribution.',
    importance: 'Critical for global trade and e-commerce, ensuring efficient movement of goods and services worldwide.',
    keyInsights: ['Last-mile delivery innovations', 'Autonomous vehicle impact', 'Sustainability in shipping', 'Supply chain resilience'],
    gradient: 'from-purple-500 to-violet-600'
  },
  {
    id: 'education',
    name: 'Education & Training',
    icon: GraduationCap,
    description: 'Education sector encompasses academic institutions, e-learning platforms, and professional development programs.',
    importance: 'Develops human capital and drives societal progress through knowledge transfer and skill development.',
    keyInsights: ['EdTech innovation trends', 'Remote learning strategies', 'Skill gap analysis', 'Future of work preparation'],
    gradient: 'from-rose-500 to-pink-600'
  },
  {
    id: 'energy',
    name: 'Energy & Utilities',
    icon: Zap,
    description: 'Energy sector includes renewable energy, traditional utilities, and emerging technologies for power generation and distribution.',
    importance: 'Powers all economic activity and is central to addressing climate change through clean energy transitions.',
    keyInsights: ['Renewable energy adoption', 'Grid modernization trends', 'Energy storage solutions', 'Carbon reduction strategies'],
    gradient: 'from-amber-500 to-yellow-600'
  },
  {
    id: 'agriculture',
    name: 'Agriculture & Food',
    icon: Leaf,
    description: 'Agriculture produces food, fiber, and other goods through farming, livestock, and food processing industries.',
    importance: 'Fundamental for food security and nutrition, increasingly important as global population grows.',
    keyInsights: ['Precision agriculture tech', 'Sustainable farming practices', 'Food safety innovations', 'Supply chain traceability'],
    gradient: 'from-green-500 to-emerald-600'
  },
  {
    id: 'retail',
    name: 'Retail & E-commerce',
    icon: ShoppingCart,
    description: 'Retail involves selling goods and services to consumers through physical stores, online platforms, and omnichannel experiences.',
    importance: 'Drives consumer economy and reflects changing shopping behaviors and preferences.',
    keyInsights: ['Omnichannel strategies', 'Consumer behavior analysis', 'Digital transformation', 'Personalization trends'],
    gradient: 'from-cyan-500 to-blue-600'
  },
  {
    id: 'hospitality',
    name: 'Hospitality & Travel',
    icon: Plane,
    description: 'Hospitality includes hotels, restaurants, tourism, and travel services focused on customer experience and service.',
    importance: 'Significant contributor to global economy and cultural exchange, highly sensitive to economic and social trends.',
    keyInsights: ['Travel recovery patterns', 'Sustainability in tourism', 'Digital guest experiences', 'Workforce challenges'],
    gradient: 'from-teal-500 to-cyan-600'
  },
  {
    id: 'realestate',
    name: 'Real Estate & Construction',
    icon: Home,
    description: 'Real estate encompasses property development, construction, property management, and real estate investment.',
    importance: 'Provides essential infrastructure and housing, major component of personal and institutional wealth.',
    keyInsights: ['PropTech innovations', 'Sustainable building trends', 'Market cycle analysis', 'Urban development patterns'],
    gradient: 'from-stone-500 to-gray-600'
  },
  {
    id: 'automotive',
    name: 'Automotive & Transportation',
    icon: Car,
    description: 'Automotive industry designs, manufactures, and sells vehicles, including the transition to electric and autonomous vehicles.',
    importance: 'Major economic driver and indicator of technological advancement, especially in electrification and automation.',
    keyInsights: ['EV adoption trends', 'Autonomous vehicle development', 'Mobility-as-a-Service', 'Supply chain challenges'],
    gradient: 'from-red-500 to-rose-600'
  },
  {
    id: 'telecommunications',
    name: 'Telecommunications',
    icon: Smartphone,
    description: 'Telecommunications provides communication services through networks, internet infrastructure, and mobile technologies.',
    importance: 'Enables global connectivity and digital economy, critical infrastructure for modern society.',
    keyInsights: ['5G network deployment', 'Edge computing trends', 'Network security concerns', 'Digital divide solutions'],
    gradient: 'from-indigo-500 to-purple-600'
  },
  {
    id: 'defense',
    name: 'Defense & Security',
    icon: Shield,
    description: 'Defense sector includes military equipment, cybersecurity, and national security technologies and services.',
    importance: 'Critical for national security and technological leadership, driving innovation in advanced technologies.',
    keyInsights: ['Cybersecurity threats', 'Defense tech innovations', 'Geopolitical impact analysis', 'Public-private partnerships'],
    gradient: 'from-slate-500 to-gray-700'
  },
  {
    id: 'media',
    name: 'Media & Entertainment',
    icon: Camera,
    description: 'Media and entertainment creates, distributes, and monetizes content across digital and traditional platforms.',
    importance: 'Shapes culture and public opinion while driving innovation in content creation and distribution technologies.',
    keyInsights: ['Streaming market evolution', 'Content monetization strategies', 'Social media trends', 'Creator economy growth'],
    gradient: 'from-pink-500 to-rose-600'
  }
];

export default function Industries() {
  return (
    <Page maxWidth="xl" padding="lg">
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Industry Insights
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We provide comprehensive insights across all major industries, helping you stay ahead of trends, 
            understand market dynamics, and make informed decisions in your sector.
          </p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {industries.length} Industries Covered
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              Real-time Market Analysis
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              Expert Insights
            </Badge>
          </div>
        </div>

        {/* Industries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry) => {
            const IconComponent = industry.icon;
            return (
              <GlassCard 
                key={industry.id} 
                className="h-full group glass-liquid hover:scale-105 transition-all duration-500"
                padding="lg"
              >
                <div className="space-y-4 h-full flex flex-col">
                  {/* Industry Header */}
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${industry.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                        {industry.name}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">
                    {industry.description}
                  </p>

                  {/* Importance */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground">Why It Matters:</h4>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {industry.importance}
                    </p>
                  </div>

                  {/* Key Insights */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground">Key Insights We Provide:</h4>
                    <div className="flex flex-wrap gap-1">
                      {industry.keyInsights.map((insight, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs px-2 py-0.5 opacity-80 hover:opacity-100 transition-opacity"
                        >
                          {insight}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* CTA Section */}
        <GlassCard className="text-center glass-distort" padding="lg">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground">
              Ready to Get Industry-Specific Insights?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join our platform to access real-time analysis, expert commentary, and actionable insights 
              tailored to your industry. Stay ahead of the curve with data-driven intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <a 
                href="/auth" 
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Get Started Today
              </a>
              <a 
                href="/contact" 
                className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-accent transition-colors"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </GlassCard>
      </div>
    </Page>
  );
}