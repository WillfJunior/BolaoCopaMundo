import { api } from './axios';
import type { RankingEntryDto, UserRankingsByGroupDto, RealTimeRankingEntryDto } from '../types/api';

export const rankingApi = {
  list: () => api.get<RankingEntryDto[]>('/api/ranking').then((r) => r.data),
  me: () => api.get<RankingEntryDto>('/api/ranking/me').then((r) => r.data),
  byGroup: () => api.get<UserRankingsByGroupDto[]>('/api/ranking/by-group').then((r) => r.data),
  realTime: (groupId: string) =>
    api.get<RealTimeRankingEntryDto[]>(`/api/ranking/real-time/${groupId}`).then((r) => r.data),
};
