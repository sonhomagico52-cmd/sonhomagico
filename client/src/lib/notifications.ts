export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.warn("Este navegador não suporta notificações de sistema.");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export function sendLocalNotification(title: string, options?: NotificationOptions) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    console.log("Notificação bloqueada ou não suportada:", title);
    return;
  }

  try {
    // Tenta usar o ServiceWorker se disponível (melhor para PWA)
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        icon: "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
        vibrate: [200, 100, 200],
        ...options
      } as any);
    }).catch(() => {
      // Fallback para Notification API padrão
      new Notification(title, {
        icon: "/pwa-192x192.png",
        ...options
      });
    });
  } catch (e) {
    // Fallback absoluto
    new Notification(title, {
      icon: "/pwa-192x192.png",
      ...options
    });
  }
}
