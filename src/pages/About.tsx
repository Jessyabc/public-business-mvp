import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Building2, 
  Brain, 
  Shield, 
  MessageSquare, 
  Globe, 
  Lightbulb,
  Target,
  Eye,
  Heart,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Zap
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { BrainstormPreview } from "@/components/feeds/BrainstormPreview";
import { MainLayout } from "@/components/layout/MainLayout";

export default function About() {
  const navigate = useNavigate();
  const features = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "For Public Members",
      description: "Explore dynamic brainstorms, engage with industry leaders, and contribute your ideas to ongoing discussions.",
      benefits: [
        "Participate in shaping business futures",
        "Access valuable business insights",
        "Earn Utility and Involvement Scores",
        "Exclusive access to specialized content"
      ]
    },
    {
      icon: <Building2 className="h-6 w-6" />,
      title: "For Business Members",
      description: "Share detailed reports, insights from R&D and HR departments, and engage directly with curious minds.",
      benefits: [
        "Share financial reports and whitepapers",
        "Gather valuable feedback through scoring",
        "Foster collaboration and innovation",
        "Grow your audience organically"
      ]
    }
  ];

  const values = [
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Transparency",
      description: "We believe in open dialogue, clear communication, and sharing insights for mutual growth."
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Collaboration",
      description: "We foster partnerships between businesses and individuals, creating a space where ideas flow freely."
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: "Innovation",
      description: "We embrace the newest technologies, forward-thinking business models, and progressive ideas."
    }
  ];

  const whyChooseUs = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "No Ads, Just Value",
      description: "Unlike traditional platforms, we focus solely on providing meaningful content without distractions."
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Focus on Ideas, Not Sales",
      description: "A space where innovation and collaboration happen—no sales pitches, no distractions."
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Exclusive Business Insights",
      description: "Gain exclusive access to reports and deep business insights where knowledge meets opportunity."
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Recognition System",
      description: "Track your engagement and influence with Utility and Involvement Scores."
    }
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 bg-accent">
        <div className="container mx-auto max-w-4xl text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Welcome to Public Business
          </h1>
          <h2 className="text-2xl md:text-3xl font-light mb-6 text-blue-100">
            Where Ideas and Innovation Meet
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
            A platform that connects industries with curious minds. Share insights, spark conversations, and unlock opportunities.
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="text-blue-600 hover:text-blue-700">
              Get Involved
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Target className="h-4 w-4 mr-2" />
              Our Mission
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-8">Our Mission</h2>
          </div>
          
          <Card className="glass-card border-0 shadow-xl">
            <CardContent className="p-8">
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                At Public Business, we are building a community where businesses and individuals come together to foster knowledge-sharing, collaboration, and innovation. Our platform empowers companies to showcase their expertise, while offering the public the opportunity to engage with the ideas that shape industries.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                Through dynamic brainstorming, insightful reports, and meaningful interactions, we aim to bridge the gap between business knowledge and public curiosity.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Our Vision */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge variant="default" className="mb-4">
              <Eye className="h-4 w-4 mr-2" />
              Our Vision
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-8">Our Vision</h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <Card className="glass-card border-0 shadow-xl">
              <CardContent className="p-8">
                <p className="text-lg text-slate-700 leading-relaxed mb-6">
                  To create a platform that becomes the heart of knowledge exchange across industries. We envision a future where every business, no matter its size, can share their insights, reach a wider audience, and gather feedback that drives meaningful change.
                </p>
                <p className="text-lg text-slate-700 leading-relaxed">
                  For every curious individual, we want to offer the opportunity to influence the future by engaging in deep discussions and shaping ideas that matter.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">Our Core Values</h3>
              {values.map((value, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center text-accent-foreground">
                    {value.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">{value.title}</h4>
                    <p className="text-slate-600">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Zap className="h-4 w-4 mr-2" />
              Platform Features
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-8">How Public Business Works</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="glass-card border-0 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <div className="w-14 h-14 bg-accent rounded-lg flex items-center justify-center text-accent-foreground mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {feature.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start text-slate-700">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
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

      {/* Meet the Team */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-12">
            <Badge variant="default" className="mb-4">
              <Users className="h-4 w-4 mr-2" />
              Our Team
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-8">Meet the Team Behind Public Business</h2>
          </div>
          
          <Card className="glass-card border-0 shadow-xl max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center text-accent-foreground text-2xl font-bold mx-auto mb-6">
                JB
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Jessy Alexander Beaudoin</h3>
              <p className="text-blue-600 font-medium mb-4">CEO & Founder</p>
              <p className="text-slate-700 leading-relaxed">
                A visionary entrepreneur with a passion for bridging the gap between businesses and curious minds. 
                Jessy believes in the power of knowledge-sharing to drive innovation and build sustainable business practices.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Brainstorm Network Preview */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">
              <Brain className="h-4 w-4 mr-2" />
              Innovation Network
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-8">See Ideas Come to Life</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Experience our dynamic brainstorm network where ideas connect, evolve, and inspire new innovations.
            </p>
          </div>
          
          <BrainstormPreview onExplore={() => navigate("/public-members")} />
        </div>
      </section>

      {/* Our Community */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-12">
            <Badge variant="secondary" className="mb-4">
              <Heart className="h-4 w-4 mr-2" />
              Community
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-8">Building a Community of Innovators</h2>
          </div>
          
          <Card className="glass-card border-0 shadow-xl">
            <CardContent className="p-8">
              <p className="text-lg text-slate-700 leading-relaxed mb-6">
                We are proud to have a growing community of businesses, thought leaders, and curious minds who are already contributing to the platform. Together, we're creating an ecosystem where ideas thrive, and innovation takes root.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed mb-8">
                Join the conversation and be part of a community that's shaping the future of industries. Whether you're a business or an individual, Public Business is the place where ideas come to life.
              </p>
              <Link to="/community">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Explore Our Community
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why Public Business */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge variant="default" className="mb-4">
              <TrendingUp className="h-4 w-4 mr-2" />
              Why Choose Us
            </Badge>
            <h2 className="text-4xl font-bold text-slate-900 mb-8">Why Choose Public Business?</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item, index) => (
              <Card key={index} className="glass-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center text-accent-foreground mx-auto mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-accent">
        <div className="container mx-auto max-w-4xl text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Join the Future of Business Innovation?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Whether you're a business seeking new opportunities or an individual eager to contribute to the next big idea, Public Business is the place for you.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="text-blue-600 hover:text-blue-700">
                Join Public Business
              </Button>
            </Link>
          </div>
        </div>
      </section>
      </div>
    </MainLayout>
  );
}