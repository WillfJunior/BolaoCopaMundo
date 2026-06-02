import { api } from './axios';
import type { PredictionDto } from '../types/api';

export const predictionsApi = {
  list: () => api.get<PredictionDto[]>('/api/predictions').then((r) => r.data),
  forMatch: (matchId: number) =>
    api.get<PredictionDto | null>(`/api/predictions/match/${matchId}`).then((r) => r.data),
  save: (data: { matchId: number; homeScore: number; awayScore: number }) =>
    api.post<PredictionDto>('/api/predictions', data).then((r) => r.data),
};
