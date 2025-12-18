import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import Index from '@/pages/Index';
import { LazyWrapper, NotFound } from './router-helpers';
import { RootLayout } from '@/components/layout/RootLayout';

// Lazy-loaded pages
const Discuss = lazy(() => import('@/pages/Discuss'));
const OpenIdeas = lazy(() => import('@/pages/OpenIdeas'));
const OpenIdeaNew = lazy(() => import('@/pages/OpenIdeaNew'));
const Admin = lazy(() => import('@/pages/Admin'));
const DemoCards = lazy(() => import('@/pages/DemoCards'));
const DevSitemap = lazy(() => import('@/pages/DevSitemap'));
const Sitemap = lazy(() => import('@/pages/Sitemap'));
const Customize = lazy(() => import('@/pages/Customize'));
const CreateOrganization = lazy(() => import('@/features/orgs/pages/CreateOrganization'));

// Eager-loaded pages
import { Landing } from '@/pages/Landing';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Features from '@/pages/Features';
import HowItWorks from '@/pages/HowItWorks';
import Explore from '@/pages/Explore';
import Community from '@/pages/Community';
import BusinessDashboard from '@/pages/BusinessDashboard';
import BusinessMembership from '@/pages/BusinessMembership';
import CreateBusiness from '@/pages/CreateBusiness';
import Notifications from '@/pages/Notifications';
import AcceptInvite from '@/pages/AcceptInvite';
import Research from '@/pages/Research';
import Careers from '@/pages/Careers';
import BusinessMembers from '@/pages/BusinessMembers';
import PublicMembers from '@/pages/PublicMembers';
import HelpCenter from '@/pages/HelpCenter';
import FAQ from '@/pages/FAQ';
import Blog from '@/pages/Blog';
import SupportCommunity from '@/pages/SupportCommunity';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import CookiePolicy from '@/pages/CookiePolicy';
import Industries from '@/pages/Industries';
import FormsShowcase from '@/pages/FormsShowcase';
import ComponentsShowcase from '@/pages/ComponentsShowcase';

// Helper to wrap pages with MainLayout
const withLayout = (element: React.ReactNode) => <MainLayout>{element}</MainLayout>;
const withLayoutLazy = (Component: React.LazyExoticComponent<any>) => (
  <MainLayout><LazyWrapper><Component /></LazyWrapper></MainLayout>
);

// Legacy redirects consolidated - all social routes now go to /discuss
const legacyRedirects = [
  { from: '/brainstorm', to: '/discuss' },
  { from: '/brainstorm/feed', to: '/discuss' },
  { from: '/brainstorm-v2', to: '/discuss' },
  { from: '/brainstorms', to: '/discuss' },
  { from: '/brainstorms/:id', to: '/discuss' },
  { from: '/brainstorms/:id/edit', to: '/discuss' },
  { from: '/brainstorms/new', to: '/discuss' },
  { from: '/brainstorms/canvas', to: '/discuss' },
  { from: '/feed', to: '/discuss' },
  { from: '/public/feed', to: '/discuss' },
  { from: '/my-posts', to: '/profile' },
  { from: '/business-profile', to: '/settings?tab=business' },
  { from: '/open-ideas', to: '/research?tab=open-ideas' },
  { from: '/app/insights', to: '/discuss?lens=business' },
].map(r => ({ path: r.from, element: <Navigate to={r.to} replace /> }));

// Build routes array
const childRoutes = [
  // === Core Routes (Think / Discuss) ===
  { path: '/', element: withLayout(<Index />) },
  { path: '/discuss', element: withLayoutLazy(Discuss) },
  { path: '/landing', element: withLayout(<Landing />) },
  
  // === Auth & Profile ===
  { path: '/auth', element: withLayout(<Auth />) },
  { path: '/profile', element: withLayout(<Profile />) },
  { path: '/settings', element: withLayout(<Settings />) },
  { path: '/notifications', element: withLayout(<Notifications />) },
  
  // === Organization Routes ===
  { path: '/org/new', element: withLayoutLazy(CreateOrganization) },
  { path: '/business-dashboard', element: withLayout(<BusinessDashboard />) },
  { path: '/business-membership', element: withLayout(<BusinessMembership />) },
  { path: '/create-business', element: withLayout(<CreateBusiness />) },
  { path: '/accept-invite/:token', element: withLayout(<AcceptInvite />) },
  
  // === Research & Ideas ===
  { path: '/research', element: withLayout(<Research />) },
  { path: '/trail/openideas', element: withLayoutLazy(OpenIdeas) },
  { path: '/open-ideas/new', element: withLayoutLazy(OpenIdeaNew) },
  
  // === Admin & Dev ===
  { path: '/admin', element: withLayoutLazy(Admin) },
  { path: '/customize', element: withLayoutLazy(Customize) },
  { path: '/sitemap', element: withLayoutLazy(Sitemap) },
  { path: '/demo/cards', element: withLayoutLazy(DemoCards) },
  { path: '/dev/forms', element: withLayout(<FormsShowcase />) },
  { path: '/dev/components', element: withLayout(<ComponentsShowcase />) },
  
  // === Marketing & Info ===
  { path: '/about', element: withLayout(<About />) },
  { path: '/contact', element: withLayout(<Contact />) },
  { path: '/features', element: withLayout(<Features />) },
  { path: '/how-it-works', element: withLayout(<HowItWorks />) },
  { path: '/explore', element: withLayout(<Explore />) },
  { path: '/careers', element: withLayout(<Careers />) },
  { path: '/industries', element: withLayout(<Industries />) },
  
  // === Community & Members ===
  { path: '/community', element: withLayout(<Community />) },
  { path: '/members/business-members', element: withLayout(<BusinessMembers />) },
  { path: '/members/public-members', element: withLayout(<PublicMembers />) },
  
  // === Support ===
  { path: '/support/help-center', element: withLayout(<HelpCenter />) },
  { path: '/support/faq', element: withLayout(<FAQ />) },
  { path: '/support/blog', element: withLayout(<Blog />) },
  { path: '/support/community', element: withLayout(<SupportCommunity />) },
  
  // === Legal ===
  { path: '/legal/privacy-policy', element: withLayout(<PrivacyPolicy />) },
  { path: '/legal/terms-of-service', element: withLayout(<TermsOfService />) },
  { path: '/legal/cookie-policy', element: withLayout(<CookiePolicy />) },
  
  // === Legacy Redirects ===
  ...legacyRedirects,
  
  // === 404 ===
  { path: '*', element: <NotFound /> },
];

// Dev sitemap (development only)
if (import.meta.env.DEV) {
  // Find index of 404 route
  const notFoundIndex = childRoutes.findIndex(r => r.path === '*');
  if (notFoundIndex !== -1) {
    childRoutes.splice(notFoundIndex, 0, {
      path: '/dev/sitemap',
      element: withLayoutLazy(DevSitemap),
    });
  }
}

const routes: Parameters<typeof createBrowserRouter>[0] = [
  {
    element: <RootLayout />,
    children: childRoutes
  }
];

export const router = createBrowserRouter(routes);
