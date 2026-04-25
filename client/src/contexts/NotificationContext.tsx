/**
 * NotificationContext — Sonho Mágico Joinville CRM
 * Sistema de notificações em tempo real
 */
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { sendLocalNotification } from "@/lib/notifications";

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  recipientUserId?: string | null;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (
    type: Notification["type"],
    title: string,
    message: string,
    options?: { recipientUserId?: string | null },
  ) => void;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [storedNotifications, setStoredNotifications] = useState<Notification[]>([]);

  // Carregar notificações do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("notifications");
    if (saved) setStoredNotifications(JSON.parse(saved));
  }, []);

  // Salvar notificações no localStorage
  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(storedNotifications));
  }, [storedNotifications]);

  const addNotification = (
    type: Notification["type"],
    title: string,
    message: string,
    options?: { recipientUserId?: string | null },
  ) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      recipientUserId: options?.recipientUserId ?? null,
    };

    // Dispara a notificação push/PWA localmente
    sendLocalNotification(title, { body: message });

    setStoredNotifications((current) => [newNotification, ...current]);
  };

  const markAsRead = (id: string) => {
    setStoredNotifications(
      storedNotifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const deleteNotification = (id: string) => {
    setStoredNotifications(storedNotifications.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setStoredNotifications((current) =>
      current.filter((notification) => {
        if (!notification.recipientUserId) {
          return false;
        }
        return notification.recipientUserId !== user?.id;
      }),
    );
  };

  const notifications = storedNotifications.filter(
    (notification) => !notification.recipientUserId || notification.recipientUserId === user?.id,
  );
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        deleteNotification,
        clearAll,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}
