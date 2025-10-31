import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import {
  adminDashboardPath,
  adminUsersPath,
  adminAllAdsPath,
  adminPendingAdsPath,
  adminApprovedAdsPath,
  adminRejectedAdsPath,
  userDashboardPath,
  userBillingPath,
  adminBillingPath,
  campaignsPath,
} from "@/lib/paths";
import { TokenManager } from "@/lib/auth";
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

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { logout } = useAuth();
  const { t, isRTL } = useLanguage();
  const isMobile = useIsMobile();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const user = TokenManager.getUsername();
  const role = TokenManager.getRole();

  const alwaysOpenSubItems = [t("sidebar", "adsManagement")];

  const toggleExpanded = (itemName: string) => {
    // Prevent toggling for always-open submenus
    if (alwaysOpenSubItems.includes(itemName)) return;

    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  // Define navigation sections based on user role
  const navigation: NavigationSection[] = [];
  // Admin section for admin/marketing users
  if (role === "admin") {
    // Admin section
    navigation.push({
      section: t("sidebar", "adminSection"),
      items: [
        {
          name: t("sidebar", "dashboard"),
          href: adminDashboardPath(),
          icon: "fas fa-tachometer-alt",
        },
        {
          name: t("sidebar", "adsManagement"),
          href: "#",
          icon: "fas fa-bullhorn",
          subItems: [
            {
              name: t("sidebar", "AllAds"),
              href: adminAllAdsPath(),
              icon: "fas fa-list-alt",
            },
            {
              name: t("sidebar", "pending"),
              href: adminPendingAdsPath(),
              icon: "fas fa-hourglass-half",
            },
            {
              name: t("sidebar", "approved"),
              href: adminApprovedAdsPath(),
              icon: "fas fa-check-circle",
            },
            {
              name: t("sidebar", "rejected"),
              href: adminRejectedAdsPath(),
              icon: "fas fa-times-circle",
            },
          ],
        },
        {
          name: t("sidebar", "userManagement"),
          href: adminUsersPath(),
          icon: "fas fa-user-cog",
        },
        {
          name: t("sidebar", "billing"),
          href: adminBillingPath(),
          icon: "fas fa-file-invoice-dollar",
        },
        {
          name: t("sidebar", "impressionRatios"),
          href: "/admin/impression-ratios",
          icon: "fas fa-percentage",
        },
        {
          name: t("sidebar", "adsFeed"),
          href: "/feed",
          icon: "fas fa-rss",
        },
        {
          name: t("sidebar", "pixels"),
          href: "/pixels",
          icon: "fas fa-crosshairs",
        },
      ],
    });
  }

  if (role === "user") {
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
          href: campaignsPath(),
          icon: "fas fa-ad",
        },
        {
          name: t("sidebar", "billing"),
          href: userBillingPath(),
          icon: "fas fa-credit-card",
        },
        {
          name: t("sidebar", "faq"),
          href: "/user-faq",
          icon: "fas fa-question-circle",
        },
        {
          name: t("sidebar", "contact"),
          href: "/user-contact",
          icon: "fas fa-envelope",
        },
        {
          name: t("sidebar", "adsFeed"),
          href: "/feed",
          icon: "fas fa-rss",
        },
      ],
    });
  }

  const renderNavigationItem = (item: NavigationItem, isSubItem = false) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded =
      alwaysOpenSubItems.includes(item.name) ||
      expandedItems.includes(item.name);
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
            <div className={`mt-1 space-y-1 ${isRTL ? "mx-4" : "ml-4"}`}>
              {item.subItems?.map((subItem) => (
                <Link key={subItem.href} href={subItem.href}>
                  <div
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors border-l-4 cursor-pointer ${
                      location === subItem.href
                        ? "active bg-primary text-primary-foreground border-primary"
                        : "hover:bg-accent hover:text-accent-foreground border-transparent"
                    } ${isRTL ? "flex-row-reverse text-right" : "text-left"} ${
                      isRTL ? "mx-4" : "ml-4"
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
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link key={item.href} href={item.href}>
        <div
          className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors border-l-4 cursor-pointer ${
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
        </div>
      </Link>
    );
  };

  // Handle escape key to close mobile sidebar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobile && onClose) {
        onClose();
      }
    };

    if (isMobile && isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isMobile, isOpen, onClose]);

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isMobile
            ? `fixed top-0 ${
                isRTL ? "right-0" : "left-0"
              } h-full w-64 bg-card flex flex-col shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
                isOpen
                  ? "translate-x-0"
                  : isRTL
                  ? "translate-x-full"
                  : "-translate-x-full"
              }`
            : "w-64 bg-card flex flex-col shadow-lg z-50"
        }`}
        style={{ position: isMobile ? "fixed" : "relative" }}
        dir={isRTL ? "rtl" : "ltr"}
        data-testid="sidebar">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-border flex flex-col bg-primary/10">
          <div className="flex flex-row items-center gap-3 justify-between">
            <div className="flex flex-row items-center gap-3 w-full justify-center">
              <img src="/logo.webp" alt="Logo" className="w-28 h-12" />
              <div className={isRTL ? "text-right" : ""}></div>
            </div>

            {/* Mobile close button */}
            {isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="md:hidden">
                <i className="fas fa-times"></i>
              </Button>
            )}
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
            <Link href="/profile">
              <Avatar className="w-8 h-8 ring-2 ring-primary cursor-pointer">
                <AvatarImage src="" alt="User avatar" />
                <AvatarFallback>
                  {user?.slice(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div
              className={`flex-1 min-w-0 ${
                isRTL ? "text-right" : "text-left"
              }`}>
              <p
                className="text-sm font-bold text-primary truncate"
                data-testid="user-name">
                {user || "userName 404"}
              </p>
              <p className="text-xs text-muted-foreground truncate capitalize">
                {role || "userRole 404"}
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
    </>
  );
}
