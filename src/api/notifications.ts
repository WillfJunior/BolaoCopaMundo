import { api } from './axios';

export const notificationsApi = {
  vapidKey: () =>
    api.get<{ publicKey: string }>('/api/notifications/vapid-public-key').then((r) => r.data),
  subscribe: (data: {
    endpoint: string;
    p256dh: string;
    auth: string;
    deviceInfo?: string;
  }) => api.post('/api/notifications/subscribe', data),
  unsubscribe: (endpoint: string) =>
    api.delete('/api/notifications/unsubscribe', { params: { endpoint } }),
};
