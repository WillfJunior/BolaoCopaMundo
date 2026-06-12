import { api } from './axios';
import type { RankingEntryDto, GroupRankingDetailedDto } from '../types/api';

export const rankingApi = {
  list: () => api.get<RankingEntryDto[]>('/api/ranking').then((r) => r.data),
  me: () => api.get<RankingEntryDto>('/api/ranking/me').then((r) => r.data),
  group: (groupId: string) =>
    api.get<GroupRankingDetailedDto>('/api/ranking', { params: { groupId } }).then((r) => r.data),
};
