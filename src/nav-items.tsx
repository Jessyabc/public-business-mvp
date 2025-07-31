import { Home, History as HistoryIcon, User, Compass, Users, Building2 } from "lucide-react";
import Index from "./pages/Index";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import Explore from "./pages/Explore";
import Community from "./pages/Community";
import BusinessProfile from "./pages/BusinessProfile";
import { UserProfile } from "./components/auth/UserProfile";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <Home className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "History", 
    to: "/history",
    icon: <HistoryIcon className="h-4 w-4" />,
    page: <History />,
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