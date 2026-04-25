/**
 * NotificationsPanel — Sonho Mágico Joinville CRM
 * Painel de notificações em tempo real
 */
import { useState } from "react";
import { Bell, X, Trash2, Check } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { requestNotificationPermission, sendLocalNotification } from "@/lib/notifications";

export default function NotificationsPanel() {
  const { notifications, markAsRead, deleteNotification, clearAll, unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(Notification.permission === "granted");

  const enablePush = async () => {
     const granted = await requestNotificationPermission();
     setPushEnabled(granted);
     if (granted) {
       sendLocalNotification("Notificações Ativadas!", { body: "Você agora receberá alertas neste aparelho." });
     }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-[oklch(0.65_0.25_145)] text-white";
      case "error":
        return "bg-[oklch(0.65_0.25_27)] text-white";
      case "warning":
        return "bg-[oklch(0.88_0.18_85)] text-[oklch(0.18_0.02_260)]";
      case "info":
        return "bg-[oklch(0.55_0.28_340)] text-white";
      default:
        return "bg-gray-300 text-gray-700";
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "warning":
        return "⚠";
      case "info":
        return "ℹ";
      default:
        return "•";
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-[oklch(0.97_0.01_85)] rounded-lg transition-colors"
      >
        <Bell size={20} className="text-[oklch(0.18_0.02_260)]" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-[oklch(0.65_0.25_145)] text-white text-xs font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-[oklch(0.92_0.02_85)] z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white rounded-t-2xl p-4 border-b border-[oklch(0.92_0.02_85)] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[oklch(0.18_0.02_260)]">Notificações</h3>
              <div className="flex gap-2">
                {notifications.length > 0 && (
                  <button onClick={() => clearAll()} className="text-xs text-[oklch(0.55_0.28_340)] hover:text-[oklch(0.38_0.22_262)] font-bold">
                    Limpar tudo
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-[oklch(0.97_0.01_85)] rounded-lg transition-colors">
                  <X size={16} className="text-[oklch(0.18_0.02_260)]" />
                </button>
              </div>
            </div>
            {!pushEnabled && (
              <button onClick={enablePush} className="w-full py-2 rounded-xl bg-[oklch(0.55_0.28_340/0.1)] border border-[oklch(0.55_0.28_340/0.2)] text-[oklch(0.55_0.28_340)] text-xs font-bold hover:bg-[oklch(0.55_0.28_340)] hover:text-white transition-colors">
                🔔 Ativar Alertas no Celular
              </button>
            )}
          </div>

          {/* Notifications List */}
          {notifications.length > 0 ? (
            <div className="divide-y divide-[oklch(0.92_0.02_85)]">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-[oklch(0.97_0.01_85)] transition-colors ${
                    !notification.read ? "bg-[oklch(0.97_0.01_85)]" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${getNotificationColor(
                        notification.type
                      )}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[oklch(0.18_0.02_260)] text-sm">
                        {notification.title}
                      </p>
                      <p className="text-xs text-[oklch(0.18_0.02_260)]/70 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-[oklch(0.18_0.02_260)]/50 mt-2">
                        {new Date(notification.timestamp).toLocaleTimeString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1 hover:bg-[oklch(0.92_0.02_85)] rounded-lg transition-colors"
                          title="Marcar como lido"
                        >
                          <Check size={14} className="text-[oklch(0.55_0.28_340)]" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 hover:bg-[oklch(0.92_0.02_85)] rounded-lg transition-colors"
                        title="Deletar"
                      >
                        <Trash2 size={14} className="text-[oklch(0.65_0.25_145)]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-[oklch(0.18_0.02_260)]/60 text-sm">Nenhuma notificação</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
