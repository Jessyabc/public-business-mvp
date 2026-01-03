import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import Index from '@/pages/Index';
import { LazyWrapper, NotFound } from './router-helpers';
import { RequireOrg } from '@/features/orgs/components/RequireOrg';
import { DiscussLensProvider } from '@/contexts/DiscussLensContext';

// Lazy-loaded pages
const Discuss = lazy(() => import('@/pages/Discuss'));
const Admin = lazy(() => import('@/pages/Admin'));
const DemoCards = lazy(() => import('@/pages/DemoCards'));
const DevSitemap = lazy(() => import('@/pages/DevSitemap'));
const Sitemap = lazy(() => import('@/pages/Sitemap'));
const Customize = lazy(() => import('@/pages/Customize'));
const Insights = lazy(() => import('@/pages/Insights'));
const CreateOrganization = lazy(() => import('@/features/orgs/pages/CreateOrganization'));

// Eager-loaded pages
import { Landing } from '@/pages/Landing';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import ResetPassword from '@/pages/ResetPassword';
import ForgotPassword from '@/pages/ForgotPassword';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Features from '@/pages/Features';
import HowItWorks from '@/pages/HowItWorks';
import Explore from '@/pages/Explore';
import Community from '@/pages/Community';
import BusinessDashboard from '@/pages/BusinessDashboard';
import BusinessMembership from '@/pages/BusinessMembership';
import BusinessSettings from '@/pages/BusinessSettings';
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
const withLayoutLazyRequireOrg = (Component: React.LazyExoticComponent<any>) => (
  <MainLayout><RequireOrg><LazyWrapper><Component /></LazyWrapper></RequireOrg></MainLayout>
);
const withDiscussLayoutLazy = (Component: React.LazyExoticComponent<any>) => (
  <DiscussLensProvider>
    <MainLayout><LazyWrapper><Component /></LazyWrapper></MainLayout>
  </DiscussLensProvider>
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
].map(r => ({ path: r.from, element: <Navigate to={r.to} replace /> }));

// Build routes array
const routes: Parameters<typeof createBrowserRouter>[0] = [
  // === Core Routes (Think / Discuss) ===
  { path: '/', element: withLayout(<Index />) },
  { path: '/discuss', element: withDiscussLayoutLazy(Discuss) },
  { path: '/landing', element: withLayout(<Landing />) },
  
  // === Auth & Profile ===
  { path: '/auth', element: withLayout(<Auth />) },
  { path: '/profile', element: withLayout(<Profile />) },
  { path: '/settings', element: withLayout(<Settings />) },
  { path: '/notifications', element: withLayout(<Notifications />) },
  { path: '/forgot-password', element: withLayout(<ForgotPassword />) },
  { path: '/reset-password', element: withLayout(<ResetPassword />) },
  
  // === Organization Routes ===
  { path: '/org/new', element: withLayoutLazy(CreateOrganization) },
  { path: '/business-dashboard', element: withLayout(<BusinessDashboard />) },
  { path: '/business-settings', element: withLayout(<BusinessSettings />) },
  { path: '/business-membership', element: withLayout(<BusinessMembership />) },
  { path: '/create-business', element: withLayout(<CreateBusiness />) },
  { path: '/accept-invite/:token', element: withLayout(<AcceptInvite />) },
  { path: '/app/insights', element: withLayoutLazyRequireOrg(Insights) },
  
  // === Research ===
  { path: '/research', element: withLayout(<Research />) },
  
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
  routes.splice(routes.length - 1, 0, {
    path: '/dev/sitemap',
    element: withLayoutLazy(DevSitemap),
  });
}

export const router = createBrowserRouter(routes);
