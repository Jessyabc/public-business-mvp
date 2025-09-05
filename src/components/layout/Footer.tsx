import { NavLink } from 'react-router-dom';
import { Linkedin, Twitter, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppMode } from '@/contexts/AppModeContext';

export function Footer() {
  const { user } = useAuth();
  const { mode } = useAppMode();

  if (user) return null; // Don't show footer when user is logged in

  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: 'About', to: '/about' },
      { label: 'Features', to: '/features' },
      { label: 'Careers', to: '/careers' },
      { label: 'Contact', to: '/contact' },
    ],
    members: [
      { label: 'Business Members', to: '/members/business-members' },
      { label: 'Public Members', to: '/members/public-members' },
      { label: 'How it Works', to: '/how-it-works' },
    ],
    support: [
      { label: 'Help Center', to: '/support/help-center' },
      { label: 'FAQ', to: '/support/faq' },
      { label: 'Blog', to: '/support/blog' },
      { label: 'Community', to: '/support/community' },
    ],
    legal: [
      { label: 'Privacy Policy', to: '/legal/privacy-policy' },
      { label: 'Terms of Service', to: '/legal/terms-of-service' },
      { label: 'Cookie Policy', to: '/legal/cookie-policy' },
      { label: 'Disclaimer', to: '/legal/disclaimer' },
    ],
  };

  return (
    <footer className="glass-card py-16 mt-32 border-t border-pb-blue/20">
      <div className="scrim" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PB</span>
              </div>
              <span className="text-xl font-bold text-ink-base">Public Business</span>
            </div>
            <p className="text-ink-base/70 text-sm mb-6 leading-relaxed">
              Linking industries the right way. Engage, share, thrive with business leaders and thought partners.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-ink-base/70 hover:text-pb-blue transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-ink-base/70 hover:text-pb-blue transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="mailto:contact@public-business.ca" className="text-ink-base/70 hover:text-pb-blue transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-ink-base mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.to}>
                  <NavLink 
                    to={link.to} 
                    className="text-ink-base/70 hover:text-pb-blue transition-colors text-sm"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Members Links */}
          <div>
            <h3 className="font-semibold text-ink-base mb-4">Members</h3>
            <ul className="space-y-3">
              {footerLinks.members.map((link) => (
                <li key={link.to}>
                  <NavLink 
                    to={link.to} 
                    className="text-ink-base/70 hover:text-pb-blue transition-colors text-sm"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-ink-base mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.to}>
                  <NavLink 
                    to={link.to} 
                    className="text-ink-base/70 hover:text-pb-blue transition-colors text-sm"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-ink-base mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.to}>
                  <NavLink 
                    to={link.to} 
                    className="text-ink-base/70 hover:text-pb-blue transition-colors text-sm"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-pb-blue" />
              <div>
                <div className="font-medium text-ink-base">Email</div>
                <div className="text-sm text-ink-base/70">contact@public-business.ca</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-pb-blue" />
              <div>
                <div className="font-medium text-ink-base">Phone</div>
                <div className="text-sm text-ink-base/70">+1 (555) 123-4567</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-pb-blue" />
              <div>
                <div className="font-medium text-ink-base">Location</div>
                <div className="text-sm text-ink-base/70">Mascouche, QC, Canada (Remote-first)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-ink-base/70">
            © {currentYear} Public Business. All rights reserved.
          </p>
          <p className="text-sm text-ink-base/70 mt-2 md:mt-0">
            Built with ❤️ for connecting industries
          </p>
        </div>
      </div>
    </footer>
  );
}