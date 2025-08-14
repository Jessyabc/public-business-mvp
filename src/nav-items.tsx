import { Home, History as HistoryIcon, User, Compass, Users, Building2, Search, Bell, MessageSquare, FileText, Shield, Plus } from "lucide-react";
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
import { UserProfile } from "./components/auth/UserProfile";
import CreateBusiness from "./pages/CreateBusiness";
import BusinessDashboard from "./pages/BusinessDashboard";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";

export const navItems = [
  {
    title: "Feed",
    to: "/",
    icon: <Home className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "My Posts",
    to: "/my-posts",
    icon: <FileText className="h-4 w-4" />,
    page: <MyPosts />,
  },
  {
    title: "History", 
    to: "/history",
    icon: <HistoryIcon className="h-4 w-4" />,
    page: <History />,
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
    title: "Profile",
    to: "/profile",
    icon: <User className="h-4 w-4" />,
    page: <Profile />,
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
    title: "Sign Up / Sign In",
    to: "/auth",
    page: <Auth />,
  },
  {
    title: "Not Found",
    to: "*",
    page: <NotFound />,
  },
];