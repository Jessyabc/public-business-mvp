import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, MapPin, Star, MessageCircle } from 'lucide-react';

export default function PublicMembers() {
  // Mock data for public members
  const publicMembers = [
    {
      id: 1,
      name: "Alex Thompson",
      bio: "Creative designer passionate about sustainable innovation",
      location: "Portland, OR",
      avatar: "/lovable-uploads/e501941c-3e1a-4f5a-a8d1-d3ad167d2e0c.png",
      rating: 4.6,
      brainstorms: 23,
      interests: ["Design", "Sustainability", "Innovation"],
      joinedDate: "2024-01-15"
    },
    {
      id: 2,
      name: "Maya Patel",
      bio: "Software developer exploring AI and machine learning",
      location: "Denver, CO",
      avatar: "/lovable-uploads/1a58e202-c32a-4b09-89d8-ff1eb22b437d.png",
      rating: 4.8,
      brainstorms: 31,
      interests: ["AI", "Machine Learning", "Open Source"],
      joinedDate: "2023-11-20"
    },
    {
      id: 3,
      name: "Jordan Lee",
      bio: "Environmental scientist and community organizer",
      location: "Seattle, WA",
      avatar: "/lovable-uploads/26ffd67e-8031-46ae-8964-c6b547a1238a.png",
      rating: 4.7,
      brainstorms: 18,
      interests: ["Environment", "Community", "Research"],
      joinedDate: "2024-02-03"
    },
    {
      id: 4,
      name: "Sam Rivera",
      bio: "Artist and educator interested in creative collaboration",
      location: "Nashville, TN",
      avatar: "/lovable-uploads/2bfedb4e-d21c-44fe-b838-4297c0b4f4d7.png",
      rating: 4.5,
      brainstorms: 27,
      interests: ["Art", "Education", "Collaboration"],
      joinedDate: "2023-12-10"
    },
    {
      id: 5,
      name: "Riley Chen",
      bio: "Data scientist with a passion for social impact",
      location: "Chicago, IL",
      avatar: "/lovable-uploads/77267ade-34ff-4c2e-8797-fb16de997bd1.png",
      rating: 4.9,
      brainstorms: 42,
      interests: ["Data Science", "Social Impact", "Analytics"],
      joinedDate: "2023-10-05"
    },
    {
      id: 6,
      name: "Casey Morgan",
      bio: "Writer and content creator focusing on technology trends",
      location: "Miami, FL",
      avatar: "/lovable-uploads/e501941c-3e1a-4f5a-a8d1-d3ad167d2e0c.png",
      rating: 4.4,
      brainstorms: 15,
      interests: ["Writing", "Technology", "Content Creation"],
      joinedDate: "2024-03-12"
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
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-light text-foreground tracking-wide">
              Public Members
            </h1>
          </div>
          <p className="text-muted-foreground mt-2 font-light max-w-2xl mx-auto">
            Discover creative minds and collaborate on innovative ideas
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {publicMembers.map((member) => (
          <Card key={member.id} className="glass-card p-6 hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <Avatar className="h-20 w-20 mx-auto mb-4">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              
              <h3 className="font-semibold text-foreground mb-2">{member.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{member.bio}</p>
              
              <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{member.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{member.rating}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center space-x-1">
                  <MessageCircle className="w-3 h-3" />
                  <span>{member.brainstorms} brainstorms</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center">
                {member.interests.map((interest) => (
                  <Badge key={interest} variant="outline" className="text-xs">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}