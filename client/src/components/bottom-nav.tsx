import { Link, useLocation } from "wouter";
import { Home, Building2, Bell, User } from "lucide-react";

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: "Home", testId: "nav-home" },
    { href: "/organizations", icon: Building2, label: "Organizations", testId: "nav-organizations" },
    { href: "/notifications", icon: Bell, label: "Notifications", testId: "nav-notifications" },
    { href: "/profile", icon: User, label: "Profile", testId: "nav-profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-card-border z-50 safe-area-pb">
      <div className="flex items-center justify-around h-14 px-2">
        {navItems.map(({ href, icon: Icon, label, testId }) => {
          const isActive = location === href || (href !== "/" && location.startsWith(href));
          return (
            <Link key={href} href={href}>
              <a
                data-testid={testId}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1 px-2 rounded-md transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover-elevate"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "fill-primary/20" : ""}`} />
                <span className="text-[11px] font-medium">{label}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
