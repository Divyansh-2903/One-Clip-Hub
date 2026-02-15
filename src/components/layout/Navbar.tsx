import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { ThemeToggle } from "@/components/ThemeToggle";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();

  // Get subscription tier with proper display name
  const getTierDisplay = () => {
    if (!profile?.subscription_tier) return { name: 'Free', color: 'from-gray-400 to-gray-500' };
    const tier = profile.subscription_tier.toLowerCase();
    if (tier === 'premium') return { name: 'Premium', color: 'from-orange-400 to-pink-500' };
    if (tier === 'pro') return { name: 'Pro', color: 'from-purple-500 to-indigo-600' };
    return { name: 'Free', color: 'from-gray-400 to-gray-500' };
  };
  const tierDisplay = getTierDisplay();

  const publicLinks = [
    { to: "/", label: "Home" },
    { to: "/pricing", label: "Pricing" },
    { to: "/faq", label: "FAQ" },
  ];

  const authLinks = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/history", label: "History" },
    { to: "/favorites", label: "Favorites" },
  ];

  const links = user ? authLinks : publicLinks;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm font-medium transition-colors relative py-1 ${isActive(link.to)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {link.label}
              {isActive(link.to) && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute -bottom-0.5 left-0 right-0 h-0.5 gradient-primary rounded-full"
                />
              )}
            </Link>
          ))}
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2">
              {/* User Profile Display - Minimalistic with soft outline */}
              <Link
                to="/profile"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-border/50 bg-card/50 hover:bg-accent/50 transition-all"
              >
                {/* Small Avatar */}
                <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-primary-foreground" />
                </div>

                {/* Name and Tier */}
                <span className="text-sm font-medium text-foreground">
                  {profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                </span>

                {/* Subscription Badge - Compact */}
                <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-gradient-to-r ${tierDisplay.color} text-white`}>
                  {tierDisplay.name}
                </span>
              </Link>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  signOut();
                  navigate("/");
                }}
                className="text-muted-foreground hover:text-destructive h-8 w-8"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <Link to="/signin">
                <Button variant="outline" size="sm" className="rounded-xl">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="rounded-xl gradient-primary border-0 text-primary-foreground hover:opacity-90">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-b overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-3">
              <div className="flex justify-end mb-2">
                <ThemeToggle />
              </div>
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`text-sm font-medium py-2 ${isActive(link.to) ? "text-primary" : "text-muted-foreground"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              {!user ? (
                <div className="flex gap-3 pt-2">
                  <Link to="/signin" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full rounded-xl">Sign In</Button>
                  </Link>
                  <Link to="/signup" className="flex-1" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full rounded-xl gradient-primary border-0 text-primary-foreground">Sign Up</Button>
                  </Link>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => { signOut(); setMobileOpen(false); navigate("/"); }}
                  className="justify-start text-muted-foreground"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
