import { api } from './axios';
import type { GroupDto } from '../types/api';

export const groupsApi = {
  list: () => api.get<GroupDto[]>('/api/groups').then((r) => r.data),
  get: (name: string) => api.get<GroupDto>(`/api/groups/${name}`).then((r) => r.data),
};
