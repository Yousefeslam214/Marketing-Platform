import { useLanguage } from "@/hooks/use-language";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import MetaPixel from "@/components/analytics/MetaPixel";
import { useNotificationStream } from "@/hooks/use-notification-stream";
import { TokenManager } from "@/lib/auth";
import { useIsMobile } from "@/hooks/use-mobile";

interface HeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function Header({ title, description, actions }: HeaderProps) {
  const { isRTL, t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isMobile = useIsMobile();
  const notificationsRef = useRef<HTMLDivElement | null>(null);

  const { notifications, unreadCount, markAllAsRead, deleteNotification } = useNotificationStream(
    !!TokenManager.getAccessToken()
  );

  const formattedNotifications = useMemo(
    () =>
      notifications.map((notification) => ({
        ...notification,
        formattedTime: new Date(notification.timestamp).toLocaleString(),
      })),
    [notifications]
  );

  const handleToggleDropdown = () => {
    setIsDropdownOpen((prev) => {
      const next = !prev;
      if (next) markAllAsRead();
      return next;
    });
  };

  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (!target || !notificationsRef.current) return;
      if (!notificationsRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isDropdownOpen]);

  return (
    <>
      <MetaPixel />
      <header
        className={`bg-card border-b border-border px-0  py-2 h-[85px] md:py-4 md:h-[97px] fixed w-fill-available w-[-webkit-fill-available] z-50
          ${isMobile ? "" : "mx-3"}
          `}
        data-testid="page-header">
        <div
          className={` items-center justify-between 
        flex flex-row
        `}>
          <div className={isRTL ? "text-right" : "text-left"}>
            <h2
              className="text-2xl font-bold text-foreground"
              data-testid="page-title">
              {title}
            </h2>
            {description && (
              <p
                className="text-sm text-muted-foreground"
                data-testid="page-description">
                {description}
              </p>
            )}
          </div>
          <div
            className="flex items-center gap-4"
            data-testid="page-actions">
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={handleToggleDropdown}
                className="relative h-10 w-10 rounded-full border border-border bg-card/80 hover:bg-accent transition-colors text-foreground"
                aria-label={t("layout", "notifications")}>
                <i className="fas fa-bell text-lg"></i>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-5 px-1 rounded-full bg-destructive text-white text-[10px] font-semibold flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {isDropdownOpen && (
                <div
                  className={`absolute mt-3 w-80 max-h-96 overflow-y-auto rounded-lg border border-border bg-card shadow-lg ${isRTL ? "left-0" : "right-0"
                    }`}>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/80">
                    <span className="text-sm font-semibold text-foreground">
                      {t("layout", "notifications")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {unreadCount > 0
                        ? `${unreadCount} new`
                        : t("layout", "Up to date")}
                    </span>
                  </div>
                  {formattedNotifications.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-muted-foreground text-center">
                      {t("layout", "noNotificationsYet")}
                    </div>
                  ) : (
                    formattedNotifications.map((notification) => (
                      <div
                        key={notification.id ?? notification.timestamp}
                        className={`px-4 py-3 border-b border-border/60 last:border-b-0 hover:bg-muted/20 transition-colors group relative
                        ${notification.read ? "bg-card" : "bg-primary/5 dark:bg-primary/10"} 
                        ${notification.isAdminNotification ? "border-l-4 border-l-primary" : ""}
                        ${isRTL ? "text-right" : "text-left"}`}>

                        {/* Unread Indicator Dot */}
                        {!notification.read && (
                          <span className={`absolute top-3.5 ${isRTL ? "right-2" : "left-2"} w-2 h-2 rounded-full bg-primary`}></span>
                        )}

                        {/* Delete Button (visible on group hover) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (notification.id) deleteNotification(notification.id);
                          }}
                          className={`absolute top-2 ${isRTL ? "left-2" : "right-2"} mt-4
                            opacity-0 group-hover:opacity-100 transition-opacity p-1.5 
                            hover:bg-destructive/10 hover:text-destructive rounded-full text-muted-foreground`}
                          title={t("common", "delete")}>
                          <i className="fas fa-trash-alt text-xs"></i>
                        </button>

                        <div className="flex items-start justify-between gap-3">
                          <div className={isRTL ? "pl-6" : "pr-6"}>
                            <div className={`text-sm text-foreground flex items-center gap-2 ${!notification.read ? "font-bold" : "font-semibold"}`}>
                              {notification.isAdminNotification && (
                                <i className="fas fa-shield-alt text-primary text-xs" title="Admin Notification"></i>
                              )}
                              {notification.title?.[isRTL ? "ar" : "en"] ||
                                notification.title?.en ||
                                notification.title?.ar ||
                                t("layout", "notifications")}
                            </div>
                            <div className={`text-xs text-muted-foreground mt-1 ${!notification.read ? "font-medium text-foreground/80" : ""}`}>
                              {notification.message?.[isRTL ? "ar" : "en"] ||
                                notification.message?.en ||
                                notification.message?.ar ||
                                ""}
                            </div>
                          </div>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap pt-1">
                            {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {new Date(notification.timestamp).toLocaleDateString([], { month: 'numeric', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {actions}
          </div>
        </div>
      </header>
    </>
  );
}
