/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// NetworkFirst for API routes with offline fallback
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({ cacheName: 'api-cache', networkTimeoutSeconds: 5 })
);

// Push notification handler
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload: { title: string; body: string; data?: { type?: string; matchId?: number } };
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Bolão Copa 2026', body: event.data.text() };
  }

  const { title, body, data } = payload;

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data,
    })
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data as { type?: string; matchId?: number } | undefined;

  let url = '/';
  if (data?.type === 'match_reminder' && data.matchId) {
    url = `/matches/${data.matchId}`;
  } else if (data?.type === 'match_result') {
    url = '/ranking';
  }

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((c) => c.url.includes(self.location.origin));
        if (existing) {
          existing.focus();
          existing.navigate(url);
        } else {
          self.clients.openWindow(url);
        }
      })
  );
});
