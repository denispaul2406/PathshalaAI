import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Home, BookOpen, Brain, BarChart3, User, GraduationCap, Video } from "lucide-react";

// Desktop navigation items (more space available)
const desktopNavItems = [
  { path: "/dashboard", icon: Home, label: "Home" },
  { path: "/learn", icon: BookOpen, label: "Learn" },
  { path: "/reels", icon: BookOpen, label: "Reels" },
  { path: "/flashcards", icon: Brain, label: "Cards" },
  { path: "/progress", icon: BarChart3, label: "Progress" },
  { path: "/ai-mirror", icon: Video, label: "AI Mirror" },
  { path: "/profile", icon: User, label: "Profile" },
];

// Mobile navigation items (limited space - AI Mirror accessible from Profile)
const mobileNavItems = [
  { path: "/dashboard", icon: Home, label: "Home" },
  { path: "/learn", icon: BookOpen, label: "Learn" },
  { path: "/reels", icon: BookOpen, label: "Reels" },
  { path: "/flashcards", icon: Brain, label: "Cards" },
  { path: "/progress", icon: BarChart3, label: "Progress" },
  { path: "/profile", icon: User, label: "Profile" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container flex h-14 sm:h-16 items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-primary flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base sm:text-lg text-foreground truncate">Pathshala</h1>
            <p className="text-[10px] sm:text-xs text-muted-foreground -mt-1 truncate">Coach</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {desktopNavItems.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
        </nav>

        {/* Mobile - shown in bottom nav instead */}
        <div className="md:hidden" />
      </div>
    </header>
  );
}

function NavItem({ path, icon: Icon, label }: typeof desktopNavItems[0]) {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Link
      to={path}
      className={`relative flex items-center gap-2 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </Link>
  );
}

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-border bg-card/95 backdrop-blur-lg">
      <div className="flex items-center justify-around h-16 px-4">
        {mobileNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeBottomNav"
                  className="absolute inset-0 bg-primary/10 rounded-xl -z-10"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
