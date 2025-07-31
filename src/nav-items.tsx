import { Home, History as HistoryIcon, User } from "lucide-react";
import Index from "./pages/Index";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
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
    title: "Profile",
    to: "/profile",
    icon: <User className="h-4 w-4" />,
    page: <UserProfile />,
  },
  {
    title: "Not Found",
    to: "*",
    page: <NotFound />,
  },
];