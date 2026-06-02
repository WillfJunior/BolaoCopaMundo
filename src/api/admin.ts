import { api } from './axios';
import type { MatchDto, MatchStatus } from '../types/api';

export const adminApi = {
  matches: (status?: MatchStatus) =>
    api
      .get<MatchDto[]>('/api/admin/matches', { params: status ? { status } : undefined })
      .then((r) => r.data),
  setResult: (id: number, data: { homeScore: number; awayScore: number }) =>
    api.patch<MatchDto>(`/api/admin/matches/${id}/result`, data).then((r) => r.data),
  startMatch: (id: number) =>
    api.post<MatchDto>(`/api/admin/matches/${id}/start`).then((r) => r.data),
  generateNextPhase: () => api.post('/api/admin/generate-next-phase'),
  sendNotification: (data: { title: string; body: string }) =>
    api.post('/api/admin/send-notification', data),
  toggleAdmin: (userId: string) =>
    api.post(`/api/admin/users/${userId}/toggle-admin`),
};
