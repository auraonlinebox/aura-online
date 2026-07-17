self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'Nueva reseña en Google';
  const options = {
    body: data.body || 'Tienes una nueva reseña pendiente de responder.',
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.openWindow(url));
});
