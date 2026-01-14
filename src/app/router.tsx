import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import Index from '@/pages/Index';
import { LazyWrapper, NotFound } from './router-helpers';
import { RequireOrg } from '@/features/orgs/components/RequireOrg';
import { DiscussLensProvider } from '@/contexts/DiscussLensContext';

/**
 * Performance Optimization: Lazy-load ALL pages except Index
 * 
 * This dramatically reduces the initial bundle size by code-splitting
 * each page into its own chunk. Pages are only loaded when navigated to.
 */

// Core pages - lazy loaded
const Landing = lazy(() => import('@/pages/Landing'));
const Discuss = lazy(() => import('@/pages/Discuss'));

// Auth pages - lazy loaded
const Auth = lazy(() => import('@/pages/Auth'));
const Profile = lazy(() => import('@/pages/Profile'));
const Settings = lazy(() => import('@/pages/Settings'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const Notifications = lazy(() => import('@/pages/Notifications'));

// Business pages - lazy loaded
const BusinessDashboard = lazy(() => import('@/pages/BusinessDashboard'));
const BusinessMembership = lazy(() => import('@/pages/BusinessMembership'));
const BusinessProfile = lazy(() => import('@/pages/BusinessProfile'));
const CreateBusiness = lazy(() => import('@/pages/CreateBusiness'));
const AcceptInvite = lazy(() => import('@/pages/AcceptInvite'));
const CreateOrganization = lazy(() => import('@/features/orgs/pages/CreateOrganization'));
const Insights = lazy(() => import('@/pages/Insights'));

// Marketing pages - lazy loaded
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const Features = lazy(() => import('@/pages/Features'));
const HowItWorks = lazy(() => import('@/pages/HowItWorks'));
const Explore = lazy(() => import('@/pages/Explore'));
const Research = lazy(() => import('@/pages/Research'));
const Careers = lazy(() => import('@/pages/Careers'));
const Industries = lazy(() => import('@/pages/Industries'));

// Community pages - lazy loaded
const Community = lazy(() => import('@/pages/Community'));
const BusinessMembers = lazy(() => import('@/pages/BusinessMembers'));
const PublicMembers = lazy(() => import('@/pages/PublicMembers'));

// Support pages - lazy loaded
const HelpCenter = lazy(() => import('@/pages/HelpCenter'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const Blog = lazy(() => import('@/pages/Blog'));
const SupportCommunity = lazy(() => import('@/pages/SupportCommunity'));

// Legal pages - lazy loaded
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/pages/TermsOfService'));
const CookiePolicy = lazy(() => import('@/pages/CookiePolicy'));

// Admin/Dev pages - lazy loaded
const Admin = lazy(() => import('@/pages/Admin'));
const DemoCards = lazy(() => import('@/pages/DemoCards'));
const DevSitemap = lazy(() => import('@/pages/DevSitemap'));
const Sitemap = lazy(() => import('@/pages/Sitemap'));
const Customize = lazy(() => import('@/pages/Customize'));
const FormsShowcase = lazy(() => import('@/pages/FormsShowcase'));
const ComponentsShowcase = lazy(() => import('@/pages/ComponentsShowcase'));

// Helper to wrap lazy-loaded pages with MainLayout and Suspense
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

// Helper for eager-loaded components (only Index)
const withLayout = (element: React.ReactNode) => <MainLayout>{element}</MainLayout>;

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
].map(r => ({ path: r.from, element: <Navigate to={r.to} replace /> }));

// Build routes array - all pages lazy-loaded except Index for fast initial load
const routes: Parameters<typeof createBrowserRouter>[0] = [
  // === Core Routes (Think / Discuss) ===
  { path: '/', element: withLayout(<Index />) },
  { path: '/discuss', element: withDiscussLayoutLazy(Discuss) },
  { path: '/landing', element: withLayoutLazy(Landing) },
  
  // === Auth & Profile ===
  { path: '/auth', element: withLayoutLazy(Auth) },
  { path: '/profile', element: withLayoutLazy(Profile) },
  { path: '/settings', element: withLayoutLazy(Settings) },
  { path: '/notifications', element: withLayoutLazy(Notifications) },
  { path: '/forgot-password', element: withLayoutLazy(ForgotPassword) },
  { path: '/reset-password', element: withLayoutLazy(ResetPassword) },
  
  // === Organization Routes ===
  { path: '/org/new', element: withLayoutLazy(CreateOrganization) },
  { path: '/business-dashboard', element: withLayoutLazy(BusinessDashboard) },
  { path: '/business-settings', element: <Navigate to="/business-dashboard?tab=settings" replace /> },
  { path: '/business-membership', element: withLayoutLazy(BusinessMembership) },
  { path: '/business-profile', element: <Navigate to="/settings?tab=business" replace /> },
  { path: '/create-business', element: withLayoutLazy(CreateBusiness) },
  { path: '/accept-invite/:token', element: withLayoutLazy(AcceptInvite) },
  { path: '/app/insights', element: withLayoutLazyRequireOrg(Insights) },
  
  // === Research ===
  { path: '/research', element: withLayoutLazy(Research) },
  
  // === Admin & Dev ===
  { path: '/admin', element: withLayoutLazy(Admin) },
  { path: '/customize', element: withLayoutLazy(Customize) },
  { path: '/sitemap', element: withLayoutLazy(Sitemap) },
  { path: '/demo/cards', element: withLayoutLazy(DemoCards) },
  { path: '/dev/forms', element: withLayoutLazy(FormsShowcase) },
  { path: '/dev/components', element: withLayoutLazy(ComponentsShowcase) },
  
  // === Marketing & Info ===
  { path: '/about', element: withLayoutLazy(About) },
  { path: '/contact', element: withLayoutLazy(Contact) },
  { path: '/features', element: withLayoutLazy(Features) },
  { path: '/how-it-works', element: withLayoutLazy(HowItWorks) },
  { path: '/explore', element: withLayoutLazy(Explore) },
  { path: '/careers', element: withLayoutLazy(Careers) },
  { path: '/industries', element: withLayoutLazy(Industries) },
  
  // === Community & Members ===
  { path: '/community', element: withLayoutLazy(Community) },
  { path: '/members/business-members', element: withLayoutLazy(BusinessMembers) },
  { path: '/members/public-members', element: withLayoutLazy(PublicMembers) },
  
  // === Support ===
  { path: '/support/help-center', element: withLayoutLazy(HelpCenter) },
  { path: '/support/faq', element: withLayoutLazy(FAQ) },
  { path: '/support/blog', element: withLayoutLazy(Blog) },
  { path: '/support/community', element: withLayoutLazy(SupportCommunity) },
  
  // === Legal ===
  { path: '/legal/privacy-policy', element: withLayoutLazy(PrivacyPolicy) },
  { path: '/legal/terms-of-service', element: withLayoutLazy(TermsOfService) },
  { path: '/legal/cookie-policy', element: withLayoutLazy(CookiePolicy) },
  
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
