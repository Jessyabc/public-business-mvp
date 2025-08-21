import { Home, User, Building2, Search, Bell, FileText, Plus, UserPlus, Info, Phone, Zap, HelpCircle, Rocket, Compass, Users, AlertCircle, Crown, Settings2 } from "lucide-react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Features from "./pages/Features";
import HowItWorks from "./pages/HowItWorks";
import Explore from "./pages/Explore";
import Community from "./pages/Community";
import Settings from "./pages/Settings";
import BusinessDashboard from "./pages/BusinessDashboard";
import BusinessMembership from "./pages/BusinessMembership";
import CreateBusiness from "./pages/CreateBusiness";
import MyPosts from "./pages/MyPosts";
import Notifications from "./pages/Notifications";
import AcceptInvite from "./pages/AcceptInvite";
import Research from "./pages/Research";
import BusinessProfile from "./pages/BusinessProfile";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: Home,
    page: <Index />,
  },
  {
    title: "Auth",
    to: "/auth",
    icon: User,
    page: <Auth />,
  },
  {
    title: "Profile",
    to: "/profile",
    icon: User,
    page: <Profile />,
  },
  {
    title: "Settings",
    to: "/settings",
    icon: Settings2,
    page: <Settings />,
  },
  {
    title: "Business Profile",
    to: "/business-profile", 
    icon: Building2,
    page: <BusinessProfile />,
  },
  {
    title: "Business Dashboard",
    to: "/business-dashboard",
    icon: Building2,
    page: <BusinessDashboard />,
  },
  {
    title: "Business Membership",
    to: "/business-membership",
    icon: Crown,
    page: <BusinessMembership />,
  },
  {
    title: "Create Business",
    to: "/create-business",
    icon: Plus,
    page: <CreateBusiness />,
  },
  {
    title: "My Posts",
    to: "/my-posts",
    icon: FileText,
    page: <MyPosts />,
  },
  {
    title: "Notifications",
    to: "/notifications",
    icon: Bell,
    page: <Notifications />,
  },
  {
    title: "Research",
    to: "/research",
    icon: Search,
    page: <Research />,
  },
  {
    title: "Accept Invite",
    to: "/accept-invite/:token",
    icon: UserPlus,
    page: <AcceptInvite />,
  },
  {
    title: "About",
    to: "/about",
    icon: Info,
    page: <About />,
  },
  {
    title: "Contact",
    to: "/contact",
    icon: Phone,
    page: <Contact />,
  },
  {
    title: "Features",
    to: "/features",
    icon: Zap,
    page: <Features />,
  },
  {
    title: "How It Works",
    to: "/how-it-works",
    icon: HelpCircle,
    page: <HowItWorks />,
  },
  {
    title: "Explore",
    to: "/explore",
    icon: Compass,
    page: <Explore />,
  },
  {
    title: "Community",
    to: "/community",
    icon: Users,
    page: <Community />,
  },
  {
    title: "404",
    to: "*",
    icon: AlertCircle,
    page: <NotFound />,
  },
];