import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  badge?: string;
}

interface NavigationSection {
  section: string;
  items: NavigationItem[];
}

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  if (!user) return null;

  const navigation = [
    {
      section: "Main",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: "fas fa-chart-line" },
        { name: "My Ads", href: "/campaigns", icon: "fas fa-ad" },
        {
          name: "Billing & Credits",
          href: "/billing",
          icon: "fas fa-credit-card",
        },
        { name: "Analytics", href: "/analytics", icon: "fas fa-chart-bar" },
      ],
    },
  ];

  if (user.role === "admin" || user.role === "marketing") {
    navigation.push({
      section: "Admin",
      items: [
        {
          name: "Pending Ads",
          href: "/admin/pending",
          icon: "fas fa-clock",
          badge: "3",
        },
        { name: "User Management", href: "/admin/users", icon: "fas fa-users" },
        {
          name: "Fraud Detection",
          href: "/admin/fraud",
          icon: "fas fa-shield-alt",
        },
      ],
    });
  }

  if (user.role === "marketing") {
    navigation.push({
      section: "Marketing",
      items: [
        {
          name: "Publishing Queue",
          href: "/marketing/queue",
          icon: "fas fa-share-alt",
        },
        {
          name: "Social Adapters",
          href: "/marketing/adapters",
          icon: "fas fa-network-wired",
        },
      ],
    });
  }

  return (
    <div
      className="w-64 bg-card border-r border-border flex flex-col"
      data-testid="sidebar">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-bolt text-primary-foreground text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Bolt</h1>
            <p className="text-sm text-muted-foreground">Marketing Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigation.map((section) => (
            <div key={section.section} className="mb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {section.section}
              </p>
              {section.items.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      location === item.href
                        ? "active bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    }`}
                    data-testid={`nav-${item.name
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}>
                    <i className={`${item.icon} w-4 h-4`}></i>
                    {item.name}
                    {item.badge && (
                      <Badge variant="destructive" className="ml-auto">
                        {item.badge}
                      </Badge>
                    )}
                  </a>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src="" alt="User avatar" />
            <AvatarFallback>
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium text-foreground truncate"
              data-testid="user-name">
              {user.username}
            </p>
            <p className="text-xs text-muted-foreground truncate capitalize">
              {user.role}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            data-testid="logout-button">
            <i className="fas fa-sign-out-alt"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}
