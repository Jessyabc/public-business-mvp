import Index from "./pages/Index";
import History from "./pages/History";
import NotFound from "./pages/NotFound";

export const navItems = [
  {
    title: "Home",
    to: "/",
    page: <Index />,
  },
  {
    title: "History", 
    to: "/history",
    page: <History />,
  },
  {
    title: "Not Found",
    to: "*",
    page: <NotFound />,
  },
];