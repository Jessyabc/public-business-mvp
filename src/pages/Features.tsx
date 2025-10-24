import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GlassCard } from "@/ui/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Building2, 
  Brain, 
  Shield, 
  MessageSquare, 
  Globe, 
  Lock, 
  Zap,
  Network,
  UserPlus,
  FileText,
  Settings
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Features() {
  const publicFeatures = [
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Public Community Access",
      description: "Join our vibrant community of professionals and enthusiasts",
      benefits: [
        "View public business posts and insights",
        "Access all brainstorm sessions",
        "Participate in community discussions",
        "No subscription required"
      ]
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Brainstorm Sessions",
      description: "Engage in collaborative thinking sessions with fellow members",
      benefits: [
        "Real-time collaborative brainstorming",
        "Visual mind mapping tools",
        "Session history and notes",
        "Cross-pollination of ideas"
      ]
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Community Interaction",
      description: "Connect and engage with posts from business members",
      benefits: [
        "Comment on public business posts",
        "Share insights and perspectives",
        "Learn from industry experts",
        "Build professional network"
      ]
    }
  ];

  const businessFeatures = [
    {
      icon: <Building2 className="h-6 w-6" />,
      title: "Business Account Management",
      description: "Create and manage your company's professional presence",
      benefits: [
        "Create verified business profiles",
        "Manage multiple team members",
        "Brand customization options",
        "Advanced analytics dashboard"
      ]
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Business Insights Publishing",
      description: "Share professional content with privacy controls",
      benefits: [
        "Create business insights and articles",
        "Set public or private visibility",
        "Advanced content editor",
        "Scheduled publishing"
      ]
    },
    {
      icon: <UserPlus className="h-6 w-6" />,
      title: "Team Collaboration",
      description: "Invite and manage team members within your business account",
      benefits: [
        "Send invitations to team members",
        "Role-based access controls",
        "Team activity tracking",
        "Collaborative workspace"
      ]
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Enhanced Security",
      description: "Enterprise-grade security features for business accounts",
      benefits: [
        "Advanced authentication",
        "Data encryption",
        "Audit logs",
        "Compliance reporting"
      ]
    }
  ];

  const systemFeatures = [
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Dual-Mode Experience",
      description: "Seamlessly switch between public and business interactions"
    },
    {
      icon: <Network className="h-6 w-6" />,
      title: "Real-time Updates",
      description: "Live notifications and real-time collaboration features"
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Customizable Interface",
      description: "Personalize your experience with themes and preferences"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Powerful Features for Every User
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Whether you're a public member exploring insights or a business building your professional presence, 
            we have the tools you need to succeed.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/auth">
              <Button size="lg">
                Get Started Free
              </Button>
            </Link>
            <Link to="/business-membership">
              <Button variant="outline" size="lg">
                Business Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Public Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Users className="h-4 w-4 mr-2" />
              Public Members
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Free Community Features
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Join thousands of professionals sharing knowledge and insights in our open community platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {publicFeatures.map((feature, index) => (
              <GlassCard key={index}>
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center text-accent-foreground mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-[var(--card-fg)] mb-2">{feature.title}</h3>
                <p className="text-[var(--card-fg-muted)] mb-4">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="text-sm text-[var(--card-fg-muted)] flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Business Features */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge variant="default" className="mb-4">
              <Building2 className="h-4 w-4 mr-2" />
              Business Members
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Professional Business Tools
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Elevate your business presence with advanced tools designed for professional organizations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {businessFeatures.map((feature, index) => (
              <Card key={index} className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center text-accent-foreground mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="text-sm text-slate-600 flex items-start">
                        <span className="text-blue-500 mr-2">✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* System Features */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Platform Capabilities
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Built on modern technology with features that enhance your experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {systemFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
                  <div className="text-slate-700">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-accent">
        <div className="container mx-auto max-w-4xl text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join our community today and start exploring or building your business presence.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/auth">
              <Button size="lg" variant="secondary">
                Join Public Business
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}