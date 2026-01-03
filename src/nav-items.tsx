/**
 * Navigation Items Configuration
 * 
 * This file contains navigation config for menus and sidebars.
 * Actual routing is defined in src/app/router.tsx
 */

import { 
  Home, User, Building2, Search, Bell, FileText, Settings2, 
  Info, Phone, Zap, HelpCircle, Compass, Users, Crown, 
  BookOpen, MessageCircle, Briefcase, Scale, Shield, Layers, PenTool 
} from "lucide-react";

export interface NavItem {
  title: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Primary navigation items (bottom nav, main menus)
export const primaryNavItems: NavItem[] = [
  { title: "Workspace", to: "/", icon: PenTool },
  { title: "Profile", to: "/profile", icon: User },
];

// Secondary navigation (sidebars, dropdowns)
export const secondaryNavItems: NavItem[] = [
  { title: "Settings", to: "/settings", icon: Settings2 },
  { title: "Notifications", to: "/notifications", icon: Bell },
  { title: "Research", to: "/research", icon: Search },
  { title: "Discuss", to: "/discuss", icon: MessageCircle },
];

// Business section navigation
export const businessNavItems: NavItem[] = [
  { title: "Business Dashboard", to: "/business-dashboard", icon: Building2 },
  { title: "Business Settings", to: "/business-settings", icon: Settings2 },
  { title: "Business Membership", to: "/business-membership", icon: Crown },
  { title: "Create Organization", to: "/org/new", icon: Building2 },
  { title: "Business Members", to: "/members/business-members", icon: Crown },
];

// Marketing/Info pages
export const marketingNavItems: NavItem[] = [
  { title: "About", to: "/about", icon: Info },
  { title: "Contact", to: "/contact", icon: Phone },
  { title: "Features", to: "/features", icon: Zap },
  { title: "How It Works", to: "/how-it-works", icon: HelpCircle },
  { title: "Explore", to: "/explore", icon: Compass },
  { title: "Careers", to: "/careers", icon: Briefcase },
  { title: "Industries", to: "/industries", icon: Building2 },
];

// Community pages
export const communityNavItems: NavItem[] = [
  { title: "Community", to: "/community", icon: Users },
  { title: "Public Members", to: "/members/public-members", icon: Users },
];

// Support pages
export const supportNavItems: NavItem[] = [
  { title: "Help Center", to: "/support/help-center", icon: HelpCircle },
  { title: "FAQ", to: "/support/faq", icon: MessageCircle },
  { title: "Blog", to: "/support/blog", icon: BookOpen },
  { title: "Support Community", to: "/support/community", icon: Users },
];

// Legal pages
export const legalNavItems: NavItem[] = [
  { title: "Privacy Policy", to: "/legal/privacy-policy", icon: Shield },
  { title: "Terms of Service", to: "/legal/terms-of-service", icon: Scale },
  { title: "Cookie Policy", to: "/legal/cookie-policy", icon: Shield },
];

// Dev pages (only shown in development)
export const devNavItems: NavItem[] = [
  { title: "Forms Showcase", to: "/dev/forms", icon: FileText },
  { title: "Components Showcase", to: "/dev/components", icon: Layers },
  { title: "Demo Cards", to: "/demo/cards", icon: Layers },
  { title: "Sitemap", to: "/sitemap", icon: Compass },
];

// Legacy export for backward compatibility (deprecated - use specific nav item arrays instead)
export const navItems = [
  ...primaryNavItems,
  ...secondaryNavItems,
  ...businessNavItems,
  ...marketingNavItems,
  ...communityNavItems,
  ...supportNavItems,
  ...legalNavItems,
];
