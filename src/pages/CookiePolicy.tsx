import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cookie, Calendar, Mail, Settings, Shield, BarChart3 } from 'lucide-react';

export default function CookiePolicy() {
  const lastUpdated = "January 15, 2024";

  const cookieTypes = [
    {
      type: "Essential Cookies",
      icon: Shield,
      description: "Necessary for basic platform functionality and security",
      purpose: "Authentication, security, session management",
      examples: ["Login sessions", "Security tokens", "CSRF protection"],
      canDisable: false,
      color: "bg-red-500"
    },
    {
      type: "Functional Cookies", 
      icon: Settings,
      description: "Remember your preferences and enhance user experience",
      purpose: "User preferences, customization, convenience features",
      examples: ["Language settings", "Theme preferences", "Recently viewed content"],
      canDisable: true,
      color: "bg-blue-500"
    },
    {
      type: "Analytics Cookies",
      icon: BarChart3,
      description: "Help us understand how users interact with our platform",
      purpose: "Usage analytics, performance monitoring, feature optimization",
      examples: ["Page views", "Feature usage", "Error tracking"],
      canDisable: true,
      color: "bg-green-500"
    }
  ];

  const thirdPartyServices = [
    {
      service: "Google Analytics",
      purpose: "Website analytics and user behavior insights",
      dataCollected: "Page views, session duration, user interactions",
      optOut: "Use Google Analytics opt-out browser extension"
    },
    {
      service: "Supabase",
      purpose: "Backend services, authentication, and data storage",
      dataCollected: "User sessions, database interactions",
      optOut: "Controlled through account settings"
    }
  ];

  const sections = [
    {
      id: "what-are-cookies",
      title: "What Are Cookies?",
      content: [
        "Definition: Cookies are small text files stored on your device when you visit websites. They help websites remember information about your visit.",
        "Purpose: Cookies enable functionality like keeping you logged in, remembering preferences, and providing analytics to improve our services.",
        "Types: We use both session cookies (temporary) and persistent cookies (stored longer-term) for different purposes.",
        "Storage: Cookies are stored locally on your device and sent back to our servers when you visit our platform."
      ]
    },
    {
      id: "how-we-use-cookies",
      title: "How We Use Cookies",
      content: [
        "Authentication: To keep you logged in and maintain secure sessions across page visits.",
        "Preferences: To remember your settings, theme choices, and other customization preferences.", 
        "Analytics: To understand how our platform is used and identify areas for improvement.",
        "Security: To protect against fraudulent activity and maintain platform security.",
        "Performance: To monitor platform performance and ensure optimal user experience."
      ]
    },
    {
      id: "managing-cookies",
      title: "Managing Your Cookie Preferences",
      content: [
        "Browser Settings: You can control cookies through your browser settings, including blocking or deleting cookies.",
        "Platform Settings: Use our cookie preference center to manage non-essential cookies (coming soon).",
        "Essential Cookies: Note that disabling essential cookies may affect platform functionality.",
        "Regular Review: You can update your cookie preferences at any time through your browser or account settings."
      ]
    },
    {
      id: "cookie-retention",
      title: "Cookie Retention Periods",
      content: [
        "Session Cookies: Deleted when you close your browser or log out of your account.",
        "Short-term Cookies: Typically expire within 24-48 hours and are used for temporary functionality.",
        "Long-term Cookies: May be stored for up to 2 years for preferences and analytics purposes.",
        "User Control: You can delete cookies at any time through your browser settings."
      ]
    }
  ];

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
            <Cookie className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-light text-foreground tracking-wide">
              Cookie Policy
            </h1>
          </div>
          <div className="flex items-center justify-center space-x-2 text-muted-foreground mb-4">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Last updated: {lastUpdated}</span>
          </div>
          <p className="text-muted-foreground mt-2 font-light max-w-2xl mx-auto">
            How we use cookies and similar technologies to improve your experience on Public Business.
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Cookie Types */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">Types of Cookies We Use</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cookieTypes.map((cookie, idx) => {
              const IconComponent = cookie.icon;
              return (
                <Card key={idx} className="glass-card p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 rounded-lg ${cookie.color}/20`}>
                      <IconComponent className="w-5 h-5" style={{ color: cookie.color.replace('bg-', '').replace('-500', '') }} />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm">{cookie.type}</h3>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">{cookie.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="text-xs font-medium text-foreground">Purpose:</div>
                    <div className="text-xs text-muted-foreground">{cookie.purpose}</div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="text-xs font-medium text-foreground">Examples:</div>
                    {cookie.examples.map((example, eIdx) => (
                      <div key={eIdx} className="text-xs text-muted-foreground">• {example}</div>
                    ))}
                  </div>
                  
                  <Badge 
                    variant={cookie.canDisable ? "outline" : "secondary"}
                    className="text-xs"
                  >
                    {cookie.canDisable ? "Optional" : "Required"}
                  </Badge>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Third Party Services */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">Third-Party Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {thirdPartyServices.map((service, idx) => (
              <Card key={idx} className="glass-card p-6">
                <h3 className="font-semibold text-foreground mb-3">{service.service}</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-foreground">Purpose:</span>
                    <p className="text-muted-foreground mt-1">{service.purpose}</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Data Collected:</span>
                    <p className="text-muted-foreground mt-1">{service.dataCollected}</p>
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Opt-Out:</span>
                    <p className="text-muted-foreground mt-1">{service.optOut}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Detailed Sections */}
        {sections.map((section, idx) => (
          <Card key={section.id} id={section.id} className="glass-card p-8 scroll-mt-24">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {section.title}
            </h2>
            <div className="space-y-4">
              {section.content.map((paragraph, pIdx) => (
                <p key={pIdx} className="text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">{paragraph.split(':')[0]}:</strong>
                  {paragraph.includes(':') ? paragraph.split(':').slice(1).join(':') : paragraph}
                </p>
              ))}
            </div>
          </Card>
        ))}

        {/* Cookie Management */}
        <Card className="glass-card p-8">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Manage Your Cookies</h2>
          <p className="text-muted-foreground mb-6">
            You have control over the cookies we use. Here are your options:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-foreground mb-3">Browser Controls</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Chrome: Settings → Privacy and Security → Cookies</li>
                <li>• Firefox: Settings → Privacy & Security → Cookies</li>
                <li>• Safari: Preferences → Privacy → Cookies</li>
                <li>• Edge: Settings → Cookies and Site Permissions</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-foreground mb-3">Platform Controls</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Manage optional cookies through your account settings (coming soon).
              </p>
              <Button variant="outline" disabled>
                Cookie Preferences (Coming Soon)
              </Button>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="glass-card p-8 text-center">
          <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-4">Questions About Cookies?</h2>
          <p className="text-muted-foreground mb-6">
            If you have questions about our use of cookies or need help managing your preferences, contact us.
          </p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Email:</strong>{' '}
              <a href="mailto:privacy@publicbusiness.com" className="text-primary hover:underline">
                privacy@publicbusiness.com
              </a>
            </p>
            <p>
              <strong className="text-foreground">General Contact:</strong>{' '}
              <a href="mailto:contact@publicbusiness.com" className="text-primary hover:underline">
                contact@publicbusiness.com
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}