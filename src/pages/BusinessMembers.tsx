import { useUserRoles } from '@/hooks/useUserRoles';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { BusinessMemberBadge } from '@/components/business/BusinessMemberBadge';
import { Building2, MapPin, Users, Star } from 'lucide-react';

export default function BusinessMembers() {
  // Mock data for business members
  const businessMembers = [
    {
      id: 1,
      name: "Sarah Chen",
      company: "TechFlow Solutions",
      role: "CEO",
      location: "San Francisco, CA",
      avatar: "/lovable-uploads/1a58e202-c32a-4b09-89d8-ff1eb22b437d.png",
      rating: 4.9,
      connections: 247,
      industry: "Technology",
      isVerified: true
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      company: "Green Energy Corp",
      role: "CTO",
      location: "Austin, TX", 
      avatar: "/lovable-uploads/26ffd67e-8031-46ae-8964-c6b547a1238a.png",
      rating: 4.8,
      connections: 189,
      industry: "Renewable Energy",
      isVerified: true
    },
    {
      id: 3,
      name: "Emily Watson",
      company: "FinanceFirst",
      role: "VP of Operations",
      location: "New York, NY",
      avatar: "/lovable-uploads/2bfedb4e-d21c-44fe-b838-4297c0b4f4d7.png",
      rating: 4.7,
      connections: 312,
      industry: "Finance",
      isVerified: true
    },
    {
      id: 4,
      name: "David Kim",
      company: "HealthTech Innovations",
      role: "Founder",
      location: "Seattle, WA",
      avatar: "/lovable-uploads/77267ade-34ff-4c2e-8797-fb16de997bd1.png",
      rating: 4.9,
      connections: 156,
      industry: "Healthcare",
      isVerified: true
    }
  ];

  return (
    <div className="min-h-screen p-6 pb-32">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      <header className="mb-8 text-center">
        <div className="glass-card rounded-3xl p-8 backdrop-blur-xl mb-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Building2 className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-light text-foreground tracking-wide">
              Business Members
            </h1>
          </div>
          <p className="text-muted-foreground mt-2 font-light max-w-2xl mx-auto">
            Connect with verified business leaders and entrepreneurs in our network
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {businessMembers.map((member) => (
          <Card key={member.id} className="glass-card p-6 hover:scale-105 transition-all duration-300">
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-foreground truncate">{member.name}</h3>
                  {member.isVerified && <BusinessMemberBadge className="shrink-0" />}
                </div>
                
                <p className="text-sm text-muted-foreground mb-1">{member.role}</p>
                <p className="text-sm font-medium text-foreground mb-2">{member.company}</p>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{member.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span>{member.rating}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {member.industry}
                  </Badge>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>{member.connections}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}