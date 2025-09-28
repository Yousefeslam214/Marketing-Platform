import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

import {
  adminDashboardPath,
  adminUsersPath,
  adminAllAdsPath,
  adminPendingAdsPath,
  adminApprovedAdsPath,
  adminRejectedAdsPath,
  adminAnalyticsPath,
  adminSettingsPath,
  userDashboardPath,
  userCampaignsPath,
  userBillingPath,
  userAnalyticsPath,
  userProfilePath,
  userSettingsPath,
  faqPath,
  helpPath,
  contactPath,
} from "@/lib/paths";
interface NavigationItem {
  name: string;
  href: string;
  icon: string;
  badge?: string;
  subItems?: NavigationItem[];
}

interface NavigationSection {
  section: string;
  items: NavigationItem[];
}

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { t, isRTL } = useLanguage();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  // Define navigation sections based on user role
  const navigation: NavigationSection[] = [];

  // Admin section for admin/marketing users
  // if (user?.role === "admin" || user?.role === "marketing") {
  // Admin section
  navigation.push({
    section: t("sidebar", "adminSection"),
    items: [
      {
        name: t("sidebar", "dashboard"),
        href: adminDashboardPath(),
        icon: "fas fa-chart-line",
        // badge: "3",
      },
      {
        name: t("sidebar", "adsManagement"),
        href: "#",
        icon: "fas fa-ad",
        subItems: [
          {
            name: t("sidebar", "AllAds"),
            href: adminAllAdsPath(),
            icon: "fas fa-list",
            // badge: "12",
          },
          {
            name: t("sidebar", "pending"),
            href: adminPendingAdsPath(),
            icon: "fas fa-clock",
            // badge: "3",
          },
          {
            name: t("sidebar", "approved"),
            href: adminApprovedAdsPath(),
            icon: "fas fa-check-circle",
            // badge: "7",
          },
          {
            name: t("sidebar", "rejected"),
            href: adminRejectedAdsPath(),
            icon: "fas fa-times-circle",
            // badge: "2",
          },
        ],
      },
      {
        name: t("sidebar", "userManagement"),
        href: adminUsersPath(),
        icon: "fas fa-users",
      },
    ],
  });

  // User section
  navigation.push({
    section: t("sidebar", "mainSection"),
    items: [
      {
        name: t("sidebar", "dashboard"),
        href: userDashboardPath(),
        icon: "fas fa-chart-line",
      },
      {
        name: t("sidebar", "myAds"),
        href: userCampaignsPath(),
        icon: "fas fa-ad",
      },
      {
        name: t("sidebar", "billing"),
        href: userBillingPath(),
        icon: "fas fa-credit-card",
      },
      {
        name: t("sidebar", "analytics"),
        href: userAnalyticsPath(),
        icon: "fas fa-chart-bar",
      },
      {
        name: t("sidebar", "faq"),
        href: faqPath(),
        icon: "fas fa-question-circle",
      },
    ],
  });

  // }

  const renderNavigationItem = (item: NavigationItem, isSubItem = false) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const isActive =
      location === item.href ||
      (hasSubItems && item.subItems?.some((sub) => location === sub.href));

    if (hasSubItems) {
      return (
        <div key={item.name}>
          <button
            onClick={() => toggleExpanded(item.name)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors border-l-4 ${
              isActive
                ? "active bg-primary text-primary-foreground border-primary"
                : "hover:bg-accent hover:text-accent-foreground border-transparent"
            } ${isRTL ? "flex-row-reverse text-right" : "text-left"} ${
              isSubItem ? "ml-4" : ""
            }`}
            style={{
              fontWeight: isActive ? "bold" : "normal",
              boxShadow: isActive ? "0 2px 8px 0 rgba(0,0,0,0.08)" : undefined,
            }}
            data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, "-")}`}>
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
            <i
              className={`fas fa-chevron-${
                isExpanded ? "up" : "down"
              } w-2 h-3 transition-transform ${
                isRTL ? "order-first" : "order-last"
              }`}></i>
          </button>

          {isExpanded && (
            <div className={`mt-1 space-y-1 ${isRTL ? "mr-4" : "ml-4"}`}>
              {item.subItems?.map((subItem) => (
                <Link key={subItem.href} href={subItem.href}>
                  <a
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors border-l-4 ${
                      location === subItem.href
                        ? "active bg-primary text-primary-foreground border-primary"
                        : "hover:bg-accent hover:text-accent-foreground border-transparent"
                    } ${isRTL ? "flex-row-reverse text-right" : "text-left"} ${
                      isRTL ? "mr-4" : "ml-4"
                    }`}
                    style={{
                      fontWeight: location === subItem.href ? "bold" : "normal",
                      boxShadow:
                        location === subItem.href
                          ? "0 2px 8px 0 rgba(0,0,0,0.08)"
                          : undefined,
                    }}
                    data-testid={`nav-${subItem.name
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}>
                    <i
                      className={`${subItem.icon} w-4 h-4 ${
                        isRTL ? "order-last" : "order-first"
                      }`}></i>
                    <span className="flex-1 flex">{subItem.name}</span>
                    {subItem.badge && (
                      <Badge
                        variant="destructive"
                        className={isRTL ? "order-first" : "order-last"}>
                        {subItem.badge}
                      </Badge>
                    )}
                  </a>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link key={item.href} href={item.href}>
        <a
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors border-l-4 ${
            location === item.href
              ? "active bg-primary text-primary-foreground border-primary"
              : "hover:bg-accent hover:text-accent-foreground border-transparent"
          } ${isRTL ? "flex-row-reverse text-right" : "text-left"} ${
            isSubItem ? "ml-4" : ""
          }`}
          style={{
            fontWeight: location === item.href ? "bold" : "normal",
            boxShadow:
              location === item.href
                ? "0 2px 8px 0 rgba(0,0,0,0.08)"
                : undefined,
          }}
          data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, "-")}`}>
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
    );
  };

  return (
    <div
      className={`w-64 bg-card flex  !flex-col shadow-lg z-50`}
      style={{ position: "relative" }}
      dir={isRTL ? "rtl" : "ltr"}
      data-testid="sidebar">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-border flex !flex-col bg-primary/10">
        <div
          className={`flex items-center gap-3 justify-between ${
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
              {section.items.map((item) => renderNavigationItem(item))}
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
              {user?.username || "yousef"}
            </p>
            <p className="text-xs text-muted-foreground truncate capitalize">
              {user?.role || "admin"}
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
