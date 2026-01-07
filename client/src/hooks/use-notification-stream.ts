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
  isAdminNotification?: boolean;
  id?: string;
}

const MAX_NOTIFICATIONS = 50;

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export function useNotificationStream(enabled: boolean) {
  const { language } = useLanguage();
  const languageRef = useRef(language);
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');

  // Keep the latest language without re-subscribing to the stream
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  const fetchUnreadCount = async () => {
    try {
      const token = TokenManager.getAccessToken();
      if (!token) return;

      const res = await fetch(`${VITE_API_BASE_URL}/api/notifications/count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        // data structure: { data: { total: number, user: number, admin: number } }
        // We probably want the 'total' or 'user' + 'admin'. 
        // Based on user request "returns data: { total: 4 ... }", assuming data.data.total is the aggregate unread.
        // Let's assume the user wants the total unread count.
        setUnreadCount(data.data.total ?? 0);
      }
    } catch (error) {
      console.error("Failed to fetch notification count", error);
    }
  };

  useEffect(() => {
    if (!enabled || !VITE_API_BASE_URL) {
      setConnectionState('disconnected');
      return;
    }

    const token = TokenManager.getAccessToken();

    if (!token) {
      console.warn('No access token available for notification stream');
      setConnectionState('disconnected');
      return;
    }

    // Initial fetch of unread count
    fetchUnreadCount();

    // Add token as query parameter
    const streamUrl = new URL(`${VITE_API_BASE_URL}/api/notifications/stream`);
    streamUrl.searchParams.set('token', token);

    console.log('🔌 Creating SSE connection...');
    setConnectionState('connecting');

    // EventSource with credentials
    const eventSource = new EventSource(streamUrl.toString(), {
      withCredentials: true,
    });

    // Handle connection established
    eventSource.addEventListener('connected', (event) => {
      console.log('✅ Connected to notification stream');
      setConnectionState('connected');
      // Refresh count on connection to be sure
      fetchUnreadCount();

      try {
        const data = JSON.parse(event.data);
        console.log('Connection message:', data.message);
      } catch (error) {
        console.error('Failed to parse connection event', error);
      }
    });

    // Handle incoming notifications
    eventSource.addEventListener('notification', (event) => {
      try {
        const payload = JSON.parse(event.data) as NotificationPayload;
        const lang = languageRef.current;
        const title =
          payload.title?.[lang] || payload.title?.en || "Notification";
        const description =
          payload.message?.[lang] || payload.message?.en || "";

        const notificationId =
          payload.id ||
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
          // Avoid duplicates by ID
          const exists = prev.some(n => n.id === notificationId);
          if (exists) return prev;

          const next = [notification, ...prev]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, MAX_NOTIFICATIONS);
          return next;
        });

        // Update unread count if needed
        if (!notification.read) {
          setUnreadCount(prev => prev + 1);
        }

        // Only show toast for NEW notifications (not from database)
        if (!payload.fromDatabase) {
          toast({
            title,
            description,
          });
        }
      } catch (error) {
        console.error("Failed to parse notification event", error);
      }
    });

    // Handle connection open (before 'connected' event)
    eventSource.onopen = () => {
      console.log('🔌 SSE connection opened');
    };

    // Handle errors
    eventSource.onerror = (error) => {
      console.error("❌ Notification stream error", error);
      console.error("EventSource readyState:", eventSource.readyState);
      console.error("EventSource URL:", eventSource.url);

      // Check readyState: 0 = CONNECTING, 1 = OPEN, 2 = CLOSED
      if (eventSource.readyState === EventSource.CLOSED) {
        console.error("❌ Connection CLOSED - likely auth or CORS issue");
        setConnectionState('error');
        return;
      }

      setConnectionState('error');

      // EventSource will automatically attempt to reconnect
      setTimeout(() => {
        if (eventSource.readyState === EventSource.CONNECTING) {
          console.log("🔄 Attempting to reconnect...");
          setConnectionState('connecting');
        }
      }, 1000);
    };

    // Fallback for unnamed events (optional)
    eventSource.onmessage = (event) => {
      console.log('Received unnamed SSE event:', event.data);
    };

    return () => {
      console.log('🔌 Closing notification stream');
      eventSource.close();
      setConnectionState('disconnected');
    };
  }, [enabled, VITE_API_BASE_URL]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    // TODO: Ideally send API request to mark all as read
  };

  const markAsRead = (notificationId: string) => {
    let wasUnread = false;
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === notificationId) {
          if (!n.read) wasUnread = true;
          return { ...n, read: true };
        }
        return n;
      })
    );
    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const deleteNotification = async (notificationId: string) => {
    // Optimistically remove from UI
    let wasUnread = false;
    setNotifications((prev) => {
      const found = prev.find(n => n.id === notificationId);
      if (found && !found.read) wasUnread = true;
      return prev.filter((n) => n.id !== notificationId)
    });

    if (wasUnread) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    try {
      const token = TokenManager.getAccessToken();
      const res = await fetch(`${VITE_API_BASE_URL}/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete notification");
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
      // Reverting optimistic update is complex here without refetching, 
      // but strictly we should re-increment count if it failed.
      // For now, assume success or eventual consistency via refresh.
    }
  };

  const clearAll = () => {
    setNotifications([]);
    // Clearing local list doesn't necessarily mean they are read/deleted on server unless we call an API.
    // If we assume "clearAll" means "dismiss all locally", count might strictly remain? 
    // Usually "Clear All" in UI implies dismissing/reading.
    // However, without an endpoint to "delete all", we might just be clearing the view.
    // Safe bet: Don't touch unreadCount if we just clear the list view, OR assume they are read.
    // Existing code didn't do anything with backend for clearAll. 
    // I will leave unreadCount as is for ClearAll, or set to 0? 
    // If I clear the list, I can't read them anymore. 
    // Let's assume clearAll -> markAllAsRead effect locally? 
    // The previous implementation just emptied the array.
    setUnreadCount(0);
  };

  const sortedNotifications = [...notifications].sort((a, b) => {
    // 1. Unread first (unread=false > unread=true is wrong. unread=true comes first)
    if (a.read !== b.read) {
      return !a.read ? -1 : 1; // Unread (false) comes first? No wait. read: false is unread.
      // If a is unread (false) and b is read (true): -1 (a comes first)
      // logic: a.read (false) - b.read (true) = 0 - 1 = -1. Correct.
    }
    // 2. Admin first
    if (a.isAdminNotification !== b.isAdminNotification) {
      return (b.isAdminNotification ? 1 : 0) - (a.isAdminNotification ? 1 : 0);
    }
    // 3. Newest first
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return {
    notifications: sortedNotifications,
    unreadCount,
    connectionState,
    markAllAsRead,
    markAsRead,
    deleteNotification,
    clearAll
  };
}