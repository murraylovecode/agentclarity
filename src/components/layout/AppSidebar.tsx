import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Lightbulb,
  Zap,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Landmark,
  Menu, // NEW
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Assets", href: "/assets", icon: Wallet },
  { name: "Public Markets", href: "/markets", icon: TrendingUp },
  { name: "Insights", href: "/insights", icon: Lightbulb },
  { name: "Deal Analyzer", href: "/deals", icon: Zap },
  { name: "Compare", href: "/compare", icon: Users },
  { name: "Plaid", href: "/plaid", icon: Landmark },
];

const bottomNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Desktop collapse (existing behavior)
  const [collapsed, setCollapsed] = useState(false);

  // NEW: mobile open/close
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      navigate("/");
    }
  };

  return (
    <>
      {/* ✅ Mobile top bar (hamburger) */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 border-b bg-background">
        <button onClick={() => setMobileOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
        <span className="ml-4 font-semibold">AgentClarity</span>
      </div>

      {/* ✅ Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          // Base styles
          "fixed md:sticky top-0 z-50 flex flex-col bg-sidebar border-r border-sidebar-border h-screen transition-transform duration-300",
          // iOS safe-area
          "pt-[env(safe-area-inset-top)]",

          // Desktop width logic
          collapsed ? "md:w-16" : "md:w-64",

          // Mobile slide-in logic
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
          <Link
            to="/dashboard"
            className="flex items-center gap-3"
            onClick={() => setMobileOpen(false)}
          >
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-sm">
                A
              </span>
            </div>
            {!collapsed && (
              <span className="text-sidebar-foreground font-semibold text-lg tracking-tight">
                AgentClarity
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileOpen(false)} // ✅ auto-close on mobile
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                  active
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="p-3 space-y-1 border-t border-sidebar-border">
          {bottomNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}

          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && (
              <span className="text-sm font-medium">Sign out</span>
            )}
          </button>
        </div>

        {/* Desktop collapse toggle (unchanged) */}
        <div className="p-3 border-t border-sidebar-border hidden md:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full justify-center"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span className="text-xs">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}
