self.addEventListener('push', function (event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'AURA — Nueva reseña';
    const options = {
      body: data.body || 'Tienes una nueva reseña de Google pendiente.',
      icon: '/icon.svg',
      badge: '/icon.svg',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/dashboard' },
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch {
    const title = 'AURA — Nueva reseña';
    const options = {
      body: event.data.text(),
      icon: '/icon.svg',
      badge: '/icon.svg',
    };
    event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard';
  event.waitUntil(clients.openWindow(url));
});
