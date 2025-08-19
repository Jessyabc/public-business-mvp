import { Home, History as HistoryIcon, User, Compass, Users, Building2, Search, Bell, MessageSquare, FileText, Shield, Plus, Brain } from "lucide-react";
import Index from "./pages/Index";
import MyPosts from "./pages/MyPosts";
import History from "./pages/History";
import Notifications from "./pages/Notifications";
import Research from "./pages/Research";
import BetaFeedback from "./pages/BetaFeedback";
import NotFound from "./pages/NotFound";
import Explore from "./pages/Explore";
import Features from "./pages/Features";
import About from "./pages/About";
import Community from "./pages/Community";
import BusinessProfile from "./pages/BusinessProfile";
import { BusinessMembership } from "./pages/BusinessMembership";
import SecurityDashboard from "./pages/SecurityDashboard";
import BusinessMembers from "./pages/BusinessMembers";
import PublicMembers from "./pages/PublicMembers";
import Contact from "./pages/Contact";
import BusinessDashboard from "./pages/BusinessDashboard";
import Settings from "./pages/Settings";
import AllMembers from "./pages/AllMembers";
import HowItWorks from "./pages/HowItWorks";
import Auth from "./pages/Auth";
import AcceptInvite from "./pages/AcceptInvite";
import Profile from "./pages/Profile";
import CreateBusiness from "./pages/CreateBusiness";
import Brainstorm from "./pages/Brainstorm";

export const navItems = [
  {
    title: "Feed",
    to: "/",
    icon: <Home className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Brainstorm Map",
    to: "/brainstorm",
    icon: <Brain className="h-4 w-4" />,
    page: <Brainstorm />,
  },
  {
    title: "My Posts",
    to: "/my-posts",
    icon: <FileText className="h-4 w-4" />,
    page: <MyPosts />,
  },
  {
    title: "Profile & History", 
    to: "/profile",
    icon: <User className="h-4 w-4" />,
    page: <Profile />,
  },
  {
    title: "Notifications",
    to: "/notifications",
    icon: <Bell className="h-4 w-4" />,
    page: <Notifications />,
  },
  {
    title: "Research",
    to: "/research",
    icon: <Search className="h-4 w-4" />,
    page: <Research />,
  },
  {
    title: "Beta Feedback",
    to: "/beta-feedback",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <BetaFeedback />,
  },
  {
    title: "Explore",
    to: "/explore",
    icon: <Compass className="h-4 w-4" />,
    page: <Explore />,
  },
  {
    title: "Features",
    to: "/features",
    icon: <Search className="h-4 w-4" />,
    page: <Features />,
  },
  {
    title: "About",
    to: "/about",
    icon: <Users className="h-4 w-4" />,
    page: <About />,
  },
  {
    title: "Community",
    to: "/community",
    icon: <Users className="h-4 w-4" />,
    page: <Community />,
  },
  {
    title: "Business Membership",
    to: "/business-membership", 
    icon: <Building2 className="h-4 w-4" />,
    page: <BusinessMembership />,
  },
  {
    title: "Business Dashboard",
    to: "/business-dashboard",
    icon: <Building2 className="h-4 w-4" />,
    page: <BusinessDashboard />,
  },
  {
    title: "Security",
    to: "/security",
    icon: <Shield className="h-4 w-4" />,
    page: <SecurityDashboard />,
  },
  {
    title: "Settings",
    to: "/settings",
    icon: <Shield className="h-4 w-4" />,
    page: <Settings />,
  },
  {
    title: "Business Members",
    to: "/business-members",
    icon: <Building2 className="h-4 w-4" />,
    page: <BusinessMembers />,
  },
  {
    title: "Public Members", 
    to: "/public-members",
    icon: <Users className="h-4 w-4" />,
    page: <PublicMembers />,
  },
  {
    title: "All Members",
    to: "/all-members",
    icon: <Users className="h-4 w-4" />,
    page: <AllMembers />,
  },
  {
    title: "How It Works",
    to: "/how-it-works",
    icon: <Search className="h-4 w-4" />,
    page: <HowItWorks />,
  },
  {
    title: "Contact",
    to: "/contact",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <Contact />,
  },
  {
    title: "Business Profile",
    to: "/business-profile",
    icon: <Building2 className="h-4 w-4" />,
    page: <BusinessProfile />,
  },
  {
    title: "Create Business",
    to: "/create-business",
    icon: <Building2 className="h-4 w-4" />,
    page: <CreateBusiness />,
  },
  {
    title: "Sign Up / Sign In",
    to: "/auth",
    page: <Auth />,
  },
  {
    title: "Accept Invite",
    to: "/accept-invite",
    page: <AcceptInvite />,
  },
  {
    title: "Not Found",
    to: "*",
    page: <NotFound />,
  },
];