import { api } from './axios';
import type { PredictionDto } from '../types/api';

export const predictionsApi = {
  list: (groupId: string) =>
    api.get<PredictionDto[]>('/api/predictions', { params: { groupId } }).then((r) => r.data),
  forMatch: (matchId: number, groupId: string) =>
    api
      .get<PredictionDto | null>(`/api/predictions/match/${matchId}`, { params: { groupId } })
      .then((r) => r.data),
  save: (data: { groupId: string; matchId: number; homeScore: number; awayScore: number }) =>
    api.post<PredictionDto>('/api/predictions', data).then((r) => r.data),
};
