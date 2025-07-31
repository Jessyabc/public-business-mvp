import { Home, History as HistoryIcon, User, Compass, Users, Building2, Search, Bell, MessageSquare, FileText } from "lucide-react";
import Index from "./pages/Index";
import MyPosts from "./pages/MyPosts";
import History from "./pages/History";
import Notifications from "./pages/Notifications";
import Research from "./pages/Research";
import BetaFeedback from "./pages/BetaFeedback";
import NotFound from "./pages/NotFound";
import Explore from "./pages/Explore";
import Community from "./pages/Community";
import BusinessProfile from "./pages/BusinessProfile";
import { UserProfile } from "./components/auth/UserProfile";

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
    title: "Community",
    to: "/community",
    icon: <Users className="h-4 w-4" />,
    page: <Community />,
  },
  {
    title: "Profile",
    to: "/profile",
    icon: <User className="h-4 w-4" />,
    page: <UserProfile />,
  },
  {
    title: "Business Profile",
    to: "/business-profile",
    icon: <Building2 className="h-4 w-4" />,
    page: <BusinessProfile />,
  },
  {
    title: "Not Found",
    to: "*",
    page: <NotFound />,
  },
];