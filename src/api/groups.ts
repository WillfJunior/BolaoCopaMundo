import { api } from './axios';
import type { GroupDto, GroupStandingDto } from '../types/api';

export const groupsApi = {
  list: () => api.get<GroupDto[]>('/api/groups').then((r) => r.data),
  get: (name: string) => api.get<GroupDto>(`/api/groups/${name}`).then((r) => r.data),
  standings: (name: string) =>
    api.get<GroupStandingDto>(`/api/groups/${name}/standings`).then((r) => r.data),
  standingsAll: () =>
    api.get<GroupStandingDto[]>('/api/groups/standings/all').then((r) => r.data),
};
