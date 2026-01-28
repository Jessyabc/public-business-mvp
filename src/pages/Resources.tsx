import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { 
  BookOpen, 
  Download, 
  FileText, 
  Video, 
  Link, 
  Search, 
  Star,
  Clock,
  Users,
  Zap,
  TrendingUp,
  Shield,
  Lightbulb,
  Target
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'guide' | 'template' | 'video' | 'webinar' | 'report' | 'tool';
  category: 'getting-started' | 'advanced' | 'business' | 'analytics' | 'security';
  url?: string;
  downloadUrl?: string;
  duration?: string;
  rating: number;
  popular: boolean;
  businessOnly?: boolean;
}

const resources: Resource[] = [
  {
    id: '1',
    title: 'Getting Started Guide',
    description: 'Complete walkthrough of platform features and best practices for new users.',
    type: 'guide',
    category: 'getting-started',
    url: '/docs/getting-started',
    duration: '15 min read',
    rating: 4.9,
    popular: true
  },
  {
    id: '2',
    title: 'Business Profile Setup Template',
    description: 'Pre-formatted template to optimize your business profile for maximum visibility.',
    type: 'template',
    category: 'business',
    downloadUrl: '/templates/business-profile.pdf',
    rating: 4.7,
    popular: false,
    businessOnly: true
  },
  {
    id: '3',
    title: 'Advanced Analytics Dashboard',
    description: 'Learn to leverage our analytics tools for data-driven decision making.',
    type: 'video',
    category: 'analytics',
    url: '/videos/analytics-tutorial',
    duration: '12 min',
    rating: 4.8,
    popular: true,
    businessOnly: true
  },
  {
    id: '4',
    title: 'Security Best Practices',
    description: 'Comprehensive guide to securing your account and protecting sensitive data.',
    type: 'guide',
    category: 'security',
    url: '/docs/security-guide',
    duration: '8 min read',
    rating: 4.9,
    popular: false
  },
  {
    id: '5',
    title: 'Monthly Industry Report Template',
    description: 'Structured template for creating comprehensive monthly industry analysis reports.',
    type: 'template',
    category: 'business',
    downloadUrl: '/templates/monthly-report.docx',
    rating: 4.6,
    popular: true,
    businessOnly: true
  },
  {
    id: '6',
    title: 'Platform API Documentation',
    description: 'Complete API reference for developers integrating with our platform.',
    type: 'guide',
    category: 'advanced',
    url: '/docs/api-reference',
    duration: '45 min read',
    rating: 4.5,
    popular: false
  },
  {
    id: '7',
    title: 'Webinar: Future of Business Intelligence',
    description: 'Expert panel discussion on emerging trends in business intelligence and analytics.',
    type: 'webinar',
    category: 'business',
    url: '/webinars/future-of-bi',
    duration: '60 min',
    rating: 4.8,
    popular: true,
    businessOnly: true
  },
  {
    id: '8',
    title: 'ROI Calculator Tool',
    description: 'Interactive tool to calculate return on investment for platform features and upgrades.',
    type: 'tool',
    category: 'business',
    url: '/tools/roi-calculator',
    rating: 4.7,
    popular: true,
    businessOnly: true
  }
];

const categories = [
  { id: 'all', name: 'All Resources', icon: BookOpen },
  { id: 'getting-started', name: 'Getting Started', icon: Lightbulb },
  { id: 'business', name: 'Business', icon: TrendingUp },
  { id: 'analytics', name: 'Analytics', icon: Target },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'advanced', name: 'Advanced', icon: Zap }
];

const typeIcons = {
  guide: BookOpen,
  template: FileText,
  video: Video,
  webinar: Users,
  report: FileText,
  tool: Zap
};

export default function Resources() {
  const { user } = useAuth();
  const { isBusinessMember } = useUserRoles();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredResources = resources.filter(resource => {
    // Filter by business access
    if (resource.businessOnly && !isBusinessMember()) {
      return false;
    }
    
    // Filter by category
    if (selectedCategory !== 'all' && resource.category !== selectedCategory) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return resource.title.toLowerCase().includes(searchLower) ||
             resource.description.toLowerCase().includes(searchLower);
    }
    
    return true;
  });

  const handleDownload = (resource: Resource) => {
    if (resource.downloadUrl) {
      // In a real app, this would trigger the actual download
      console.log(`Downloading: ${resource.downloadUrl}`);
    }
  };

  const handleAccessResource = (resource: Resource) => {
    if (resource.url) {
      // In a real app, this would navigate to the resource
      console.log(`Accessing: ${resource.url}`);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Resources</h1>
        <p className="text-muted-foreground">
          Access guides, templates, tools, and educational content to maximize your platform experience
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="flex items-center gap-2 text-xs"
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => {
          const TypeIcon = typeIcons[resource.type];
          const canAccess = !resource.businessOnly || isBusinessMember();
          
          return (
            <Card key={resource.id} className={`h-full transition-all hover:shadow-lg ${
              !canAccess ? 'opacity-60' : ''
            }`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <TypeIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold line-clamp-2">
                        {resource.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {resource.type}
                        </Badge>
                        {resource.popular && (
                          <Badge variant="outline" className="text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Popular
                          </Badge>
                        )}
                        {resource.businessOnly && (
                          <Badge variant="default" className="text-xs">
                            Business
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm line-clamp-3">
                  {resource.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  {resource.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {resource.duration}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {resource.rating}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {resource.url && canAccess && (
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleAccessResource(resource)}
                    >
                      <Link className="w-4 h-4 mr-2" />
                      Access
                    </Button>
                  )}
                  {resource.downloadUrl && canAccess && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleDownload(resource)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                  {!canAccess && (
                    <Button size="sm" variant="outline" className="flex-1" disabled>
                      Business Membership Required
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No resources found
          </h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or category filter.
          </p>
        </div>
      )}

      {/* Need Help Section */}
      <Card className="mt-12">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold mb-2">Need Additional Help?</h3>
          <p className="text-muted-foreground mb-4">
            Can't find what you're looking for? Our support team is here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="default">
              Contact Support
            </Button>
            <Button variant="outline">
              Request New Resource
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}