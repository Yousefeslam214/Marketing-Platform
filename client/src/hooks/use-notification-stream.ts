import { useEffect, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { TokenManager } from "@/lib/auth";
import { VITE_API_BASE_URL } from "@/lib/utils";
import { useLanguage } from "@/hooks/use-language";

type LocalizedText = Record<string, string | undefined> & {
  en?: string;
  ar?: string;
};

export interface NotificationPayload {
  timestamp: string;
  metadata?: Record<string, unknown>;
  userId: string;
  module: string;
  type: string;
  title: LocalizedText;
  message: LocalizedText;
  read?: boolean;
  fromDatabase?: boolean;
  id?: string;
}

const MAX_NOTIFICATIONS = 50;

export function useNotificationStream(enabled: boolean) {
  const { language } = useLanguage();
  const languageRef = useRef(language);
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);

  // Keep the latest language without re-subscribing to the stream
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    if (!enabled || !VITE_API_BASE_URL) return;

    const token = TokenManager.getAccessToken();
    const streamUrl = new URL(`${VITE_API_BASE_URL}/api/notifications/stream`);

    if (token) {
      streamUrl.searchParams.set("token", token);
    }

    const eventSource = new EventSource(streamUrl.toString(), {
      withCredentials: true,
    });

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as NotificationPayload;
        const lang = languageRef.current;
        const title =
          payload.title?.[lang] || payload.title?.en || "Notification";
        const description =
          payload.message?.[lang] || payload.message?.en || "";

        const notificationId =
          payload.metadata?.adId?.toString() ||
          (typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${payload.type}-${payload.timestamp}`);

        const notification: NotificationPayload = {
          ...payload,
          id: notificationId,
          read: payload.read ?? false,
        };

        setNotifications((prev) => {
          const next = [notification, ...prev].slice(0, MAX_NOTIFICATIONS);
          return next;
        });

        toast({
          title,
          description,
        });
      } catch (error) {
        console.error("Failed to parse notification event", error);
      }
    };

    eventSource.onerror = (error) => {
      console.error("Notification stream error", error);
    };

    return () => {
      eventSource.close();
    };
  }, [enabled]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, markAllAsRead };
}
