import { api } from './axios';
import type { UserDto } from '../types/api';

export const usersApi = {
  me: () => api.get<UserDto>('/api/users/me').then((r) => r.data),
  update: (data: { name: string; phoneNumber?: string }) =>
    api.put<UserDto>('/api/users/me', data).then((r) => r.data),
  uploadPhoto: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api
      .post<{ photoUrl: string }>('/api/users/me/photo', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data);
  },
};
