import { useLanguage } from "@/hooks/use-language";
import { ReactNode, useMemo, useState } from "react";
import MetaPixel from "@/components/analytics/MetaPixel";
import { useNotificationStream } from "@/hooks/use-notification-stream";
import { TokenManager } from "@/lib/auth";

interface HeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function Header({ title, description, actions }: HeaderProps) {
  const { isRTL, t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { notifications, unreadCount, markAllAsRead } = useNotificationStream(
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

  return (
    <>
      <MetaPixel />
      <header
        className="bg-card border-b border-border px-6 mx-3 py-2 h-[85px] md:py-4 md:h-[97px] fixed w-fill-available w-[-webkit-fill-available] z-50"
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
            className={`flex items-center gap-4 ${
              isRTL ? "flex-row-reverse" : "flex-row"
            }`}
            data-testid="page-actions">
            <div className="relative">
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
                  className={`absolute mt-3 w-80 max-h-96 overflow-y-auto rounded-lg border border-border bg-card shadow-lg ${
                    isRTL ? "left-0" : "right-0"
                  }`}>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/80">
                    <span className="text-sm font-semibold text-foreground">
                      {t("layout", "notifications")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {unreadCount > 0 ? `${unreadCount} new` : "Up to date"}
                    </span>
                  </div>
                  {formattedNotifications.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-muted-foreground text-center">
                      No notifications yet
                    </div>
                  ) : (
                    formattedNotifications.map((notification) => (
                      <div
                        key={notification.id ?? notification.timestamp}
                        className={`px-4 py-3 border-b border-border/60 last:border-b-0 ${
                          notification.read ? "bg-card" : "bg-muted/30"
                        } ${isRTL ? "text-right" : "text-left"}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-foreground">
                              {notification.title?.[isRTL ? "ar" : "en"] ||
                                notification.title?.en ||
                                t("layout", "notifications")}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {notification.message?.[isRTL ? "ar" : "en"] ||
                                notification.message?.en ||
                                ""}
                            </div>
                          </div>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                            {notification.formattedTime}
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
