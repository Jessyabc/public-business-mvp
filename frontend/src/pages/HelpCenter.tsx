import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Book, Users, FileText, Shield, CreditCard, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'New to Public Business? Start here.',
      icon: Book,
      color: 'bg-blue-500',
      articles: [
        'How to create your first profile',
        'Understanding T-scores and brainstorms',
        'Navigating the Public Business interface'
      ]
    },
    {
      id: 'business-members',
      title: 'Business Members',
      description: 'Resources for companies and organizations.',
      icon: Users,
      color: 'bg-purple-500',
      articles: [
        'Applying for Business Member status',
        'Publishing white papers and reports',
        'Managing your company dashboard'
      ]
    },
    {
      id: 'public-members',
      title: 'Public Members',
      description: 'Features and tools for individual users.',
      icon: HelpCircle,
      color: 'bg-green-500',
      articles: [
        'Building your T-score through brainstorms',
        'Following companies and reports',
        'Premium membership benefits'
      ]
    },
    {
      id: 'content',
      title: 'White Papers & Reports',
      description: 'Publishing and accessing professional content.',
      icon: FileText,
      color: 'bg-orange-500',
      articles: [
        'How to publish a white paper',
        'Understanding report annotations',
        'Version control for publications'
      ]
    },
    {
      id: 'billing',
      title: 'Accounts & Billing',
      description: 'Account management and subscription help.',
      icon: CreditCard,
      color: 'bg-red-500',
      articles: [
        'Managing your subscription',
        'Updating payment information',
        'Canceling your account'
      ]
    },
    {
      id: 'security',
      title: 'Privacy & Security',
      description: 'Keeping your data safe and private.',
      icon: Shield,
      color: 'bg-indigo-500',
      articles: [
        'Your privacy on Public Business',
        'Two-factor authentication setup',
        'Reporting inappropriate content'
      ]
    }
  ];

  const popularArticles = [
    'What is Public Business and how does it work?',
    'How do I increase my T-score?',
    'Can I switch between Public and Business modes?',
    'How do I publish my first white paper?',
    'What\'s the difference between free and premium?'
  ];

  const filteredCategories = categories.filter(category =>
    category.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.articles.some(article => 
      article.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const filteredArticles = searchQuery 
    ? popularArticles.filter(article => 
        article.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : popularArticles;

  return (
    <div className="min-h-screen p-6 pb-32">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="mb-12 text-center">
        <div className="glass-card rounded-3xl p-8 backdrop-blur-xl mb-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-light text-foreground tracking-wide">
              Help Center
            </h1>
          </div>
          <p className="text-muted-foreground mt-2 font-light max-w-2xl mx-auto mb-6">
            Find answers to your questions and learn how to make the most of Public Business.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Popular Articles */}
        {!searchQuery && (
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-6">Popular Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularArticles.map((article, idx) => (
                <Card key={idx} className="glass-card p-4 hover:bg-background/60 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{article}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Search Results */}
        {searchQuery && (
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-6">
              Search Results for "{searchQuery}"
            </h2>
            {filteredArticles.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-foreground mb-4">Articles</h3>
                <div className="space-y-2">
                  {filteredArticles.map((article, idx) => (
                    <Card key={idx} className="glass-card p-4 hover:bg-background/60 transition-all duration-300 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground">{article}</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Categories */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-6">
            {searchQuery ? 'Matching Categories' : 'Browse by Category'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card key={category.id} className="glass-card p-6 hover:bg-background/60 transition-all duration-300 cursor-pointer">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className={`p-3 rounded-xl ${category.color}/20`}>
                      <IconComponent className="w-6 h-6" style={{ color: category.color.replace('bg-', '').replace('-500', '') }} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">{category.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {category.articles.slice(0, 3).map((article, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{article}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                  
                  <Badge variant="outline" className="mt-4">
                    {category.articles.length} articles
                  </Badge>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Contact Support */}
        <section>
          <Card className="glass-card p-8 max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-4">Still Need Help?</h2>
            <p className="text-muted-foreground mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <Link to="/contact">
              <Button size="lg">
                Contact Support
              </Button>
            </Link>
          </Card>
        </section>
      </div>
    </div>
  );
}