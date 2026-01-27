import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Building2, Code, Palette, Users, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Careers() {
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState('');
  
  const roles = [
    {
      id: 'fullstack-engineer',
      title: 'Founding Full-Stack Engineer',
      type: 'Full-time',
      location: 'Remote (Canada preferred)',
      description: 'Build the platform where curiosity meets execution. Work with React, TypeScript, React Native Expo, and Supabase.',
      requirements: ['4+ years JavaScript/TypeScript', 'React & React Native experience', 'Database design (PostgreSQL/Supabase)', 'API development'],
      icon: Code
    },
    {
      id: 'designer', 
      title: 'Product Designer',
      type: 'Full-time',
      location: 'Remote',
      description: 'Create VisionOS-inspired interfaces with interactive prototyping. Shape the future of professional networking.',
      requirements: ['Design systems experience', 'Figma/Sketch expertise', 'Interactive prototyping', 'VisionOS/glassmorphism aesthetic'],
      icon: Palette
    },
    {
      id: 'partnerships',
      title: 'Partnerships Lead',
      type: 'Full-time', 
      location: 'Remote',
      description: 'Build relationships with businesses for white papers, reports, and premium content partnerships.',
      requirements: ['B2B partnership experience', 'Business development', 'Content strategy', 'Relationship management'],
      icon: Users
    }
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // TODO: Implement API endpoint
    console.log('Career application submitted:', {
      name: formData.get('name'),
      email: formData.get('email'),
      role: formData.get('role'),
      portfolio: formData.get('portfolio'),
      message: formData.get('message')
    });

    toast({
      title: "Application Submitted",
      description: "Thank you for your interest! We'll be in touch soon.",
    });

    e.currentTarget.reset();
    setSelectedRole('');
  };

  const values = [
    {
      title: 'Substance over Noise',
      description: 'We prioritize meaningful content and authentic connections over viral metrics.'
    },
    {
      title: 'Respectful Debate',
      description: 'Foster environments where diverse perspectives can be shared constructively.'
    },
    {
      title: 'Speed + Quality',
      description: 'Move fast while maintaining high standards for user experience and code quality.'
    }
  ];

  return (
    <div className="min-h-screen p-6 pb-32">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <header className="mb-16 text-center">
        <div className="glass-card rounded-3xl p-12 backdrop-blur-xl mb-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Building2 className="w-10 h-10 text-primary" />
            <h1 className="text-5xl font-light text-foreground tracking-wide">
              Build the Future
            </h1>
          </div>
          <p className="text-xl text-muted-foreground font-light max-w-3xl mx-auto">
            Build the platform where curiosity meets execution. Join us in creating the next generation of professional networking.
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto space-y-16">
        {/* Open Roles */}
        <section>
          <h2 className="text-3xl font-semibold text-foreground mb-8 text-center">Open Positions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {roles.map((role) => {
              const IconComponent = role.icon;
              return (
                <Card key={role.id} className="glass-card p-6 hover:bg-background/60 transition-all duration-300">
                  <div className="flex items-start space-x-3 mb-4">
                    <IconComponent className="w-6 h-6 text-primary mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-2">{role.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary">{role.type}</Badge>
                        <Badge variant="outline">{role.location}</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-4 text-sm">
                    {role.description}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    <h4 className="font-medium text-foreground text-sm">Requirements:</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {role.requirements.map((req, idx) => (
                        <li key={idx}>• {req}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedRole(role.id)}
                    className="w-full"
                  >
                    Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Application Form */}
        <section>
          <Card className="glass-card p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">Apply to Join Our Team</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" name="name" required placeholder="Your full name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" name="email" type="email" required placeholder="your@email.com" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Position *</Label>
                <select 
                  id="role" 
                  name="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full p-2 rounded-md border border-input bg-background text-foreground"
                  required
                >
                  <option value="">Select a position</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>{role.title}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="portfolio">Portfolio URL</Label>
                <Input 
                  id="portfolio" 
                  name="portfolio" 
                  type="url" 
                  placeholder="https://yourportfolio.com" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Why Public Business? *</Label>
                <Textarea 
                  id="message" 
                  name="message"
                  required
                  placeholder="Tell us why you're excited about this opportunity..."
                  rows={4}
                />
              </div>
              
              <Button type="submit" className="w-full">
                Submit Application
              </Button>
            </form>
          </Card>
        </section>

        {/* Company Values */}
        <section>
          <h2 className="text-3xl font-semibold text-foreground mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value, idx) => (
              <Card key={idx} className="glass-card p-6 text-center">
                <h3 className="font-semibold text-foreground mb-3">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}