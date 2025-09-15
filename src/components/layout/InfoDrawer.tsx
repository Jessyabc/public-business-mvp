import { useState } from 'react';
import { Info, ExternalLink } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const infoPages = [
  {
    title: 'Platform Overview',
    description: 'Learn how our brainstorming platform works',
    path: '/info/overview',
    category: 'Getting Started'
  },
  {
    title: 'Safety Guidelines',
    description: 'Community standards and safety practices',
    path: '/info/safety',
    category: 'Community'
  },
  {
    title: 'Frequently Asked Questions',
    description: 'Common questions and answers',
    path: '/info/faq',
    category: 'Support'
  },
  {
    title: 'Terms of Service',
    description: 'Legal terms and conditions',
    path: '/terms',
    category: 'Legal'
  },
  {
    title: 'Privacy Policy',
    description: 'How we handle your data',
    path: '/privacy',
    category: 'Legal'
  },
  {
    title: 'Contact Us',
    description: 'Get in touch with our team',
    path: '/contact',
    category: 'Support'
  },
];

export function InfoDrawer() {
  const [open, setOpen] = useState(false);

  const categorizedPages = infoPages.reduce((acc, page) => {
    if (!acc[page.category]) {
      acc[page.category] = [];
    }
    acc[page.category].push(page);
    return acc;
  }, {} as Record<string, typeof infoPages>);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="sm" className="glass-button">
          <Info className="w-4 h-4 mr-2" />
          Info
        </Button>
      </DrawerTrigger>
      <DrawerContent className="glass-surface">
        <DrawerHeader>
          <DrawerTitle className="text-foreground">Platform Information</DrawerTitle>
        </DrawerHeader>
        <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
          {Object.entries(categorizedPages).map(([category, pages]) => (
            <div key={category}>
              <Badge variant="secondary" className="mb-3 glass-surface">
                {category}
              </Badge>
              <div className="space-y-3">
                {pages.map((page) => (
                  <Card key={page.path} className="glass-card hover:glass-hover transition-all duration-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-foreground">
                        <Link
                          to={page.path}
                          className="flex items-center justify-between group"
                          onClick={() => setOpen(false)}
                        >
                          {page.title}
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground">{page.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}