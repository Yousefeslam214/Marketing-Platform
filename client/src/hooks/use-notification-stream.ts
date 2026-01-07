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
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');

  // Keep the latest language without re-subscribing to the stream
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

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
          
          const next = [notification, ...prev].slice(0, MAX_NOTIFICATIONS);
          return next;
        });

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
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { 
    notifications, 
    unreadCount, 
    connectionState,
    markAllAsRead,
    markAsRead,
    clearAll
  };
}