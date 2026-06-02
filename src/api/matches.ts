import { api } from './axios';
import type { MatchDto, MatchPhase } from '../types/api';

export const matchesApi = {
  get: (id: number) => api.get<MatchDto>(`/api/matches/${id}`).then((r) => r.data),
  upcoming: (hours = 24) =>
    api.get<MatchDto[]>('/api/matches/upcoming', { params: { hours } }).then((r) => r.data),
  byPhase: (phase: MatchPhase) =>
    api.get<MatchDto[]>(`/api/matches/phase/${phase}`).then((r) => r.data),
};
