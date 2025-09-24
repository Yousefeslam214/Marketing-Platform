import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
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
  const { t, isRTL } = useLanguage();

  // Define navigation sections based on user role
  const navigation: NavigationSection[] = [];

  // Admin section for admin/marketing users
  // if (user?.role === "admin" || user?.role === "marketing") {
  navigation.push({
    section: t("sidebar", "adminSection"),
    items: [
      {
        name: t("sidebar", "dashboard"),
        href: "/admin/AdminDashboard",
        icon: "fas fa-chart-line",
        badge: "3",
      },
      {
        name: t("sidebar", "pending"),
        href: "/admin/pending",
        icon: "fas fa-clock",
        badge: "3",
      },
      {
        name: t("sidebar", "userManagement"),
        href: "/admin/users",
        icon: "fas fa-users",
      },
      {
        name: t("sidebar", "AllAds"),
        href: "/admin/queue",
        icon: "fas fa-share-alt",
      },
    ],
  });

  // } else {
  navigation.push({
    section: t("sidebar", "mainSection"),
    items: [
      {
        name: t("sidebar", "dashboard"),
        href: "/dashboard",
        icon: "fas fa-chart-line",
      },
      { name: t("sidebar", "myAds"), href: "/campaigns", icon: "fas fa-ad" },
      {
        name: t("sidebar", "billing"),
        href: "/billing",
        icon: "fas fa-credit-card",
      },
      {
        name: t("sidebar", "analytics"),
        href: "/analytics",
        icon: "fas fa-chart-bar",
      },
      {
        name: t("sidebar", "faq"),
        href: "/faq",
        icon: "fas fa-question-circle",
      },
    ],
  });
  // }

  return (
    <div
      className={`w-64 bg-card border-2 border-primary flex  !flex-col shadow-lg z-50`}
      style={{ position: "relative" }}
      dir={isRTL ? "rtl" : "ltr"}
      data-testid="sidebar">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-border flex !flex-col bg-primary/10">
        <div
          className={`flex items-center gap-3 ${
            isRTL ? "flex-row-reverse" : ""
          }`}>
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow">
            <i className="fas fa-bolt text-primary-foreground text-lg"></i>
          </div>
          <div className={isRTL ? "text-right" : ""}>
            <h1 className="text-xl font-bold text-primary">
              {t("sidebar", "appName")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("sidebar", "appTagline")}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigation.map((section) => (
            <div key={section.section} className="mb-4">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                {section.section}
              </p>
              {section.items.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors border-l-4 ${
                      location === item.href
                        ? "active bg-primary text-primary-foreground border-primary"
                        : "hover:bg-accent hover:text-accent-foreground border-transparent"
                    } ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
                    style={{
                      fontWeight: location === item.href ? "bold" : "normal",
                      boxShadow:
                        location === item.href
                          ? "0 2px 8px 0 rgba(0,0,0,0.08)"
                          : undefined,
                    }}
                    data-testid={`nav-${item.name
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}>
                    <i
                      className={`${item.icon} w-4 h-4 ${
                        isRTL ? "order-last" : "order-first"
                      }`}></i>
                    <span className="flex-1 flex">{item.name}</span>
                    {item.badge && (
                      <Badge
                        variant="destructive"
                        className={isRTL ? "order-first" : "order-last"}>
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
      <div className="p-4 border-t border-border bg-primary/5">
        <div
          className={`flex items-center gap-3 mb-3 ${
            isRTL ? "flex-row-reverse" : ""
          }`}>
          <Avatar className="w-8 h-8 ring-2 ring-primary">
            <AvatarImage src="" alt="User avatar" />
            <AvatarFallback>
              {user?.username?.slice(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div
            className={`flex-1 min-w-0 ${isRTL ? "text-right" : "text-left"}`}>
            <p
              className="text-sm font-bold text-primary truncate"
              data-testid="user-name">
              {user?.username || "Guest"}
            </p>
            <p className="text-xs text-muted-foreground truncate capitalize">
              {user?.role || "user"}
            </p>
          </div>
        </div>
        <div
          className={`flex items-center gap-2 ${
            isRTL ? "flex-row-reverse" : ""
          }`}>
          <ThemeToggle />
          <LanguageToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            data-testid="logout-button"
            title={t("layout", "logout")}>
            <i className="fas fa-sign-out-alt text-primary"></i>
          </Button>
        </div>
      </div>
    </div>
  );
}
