import { api } from './axios';
import type { AuthResponse } from '../types/api';

export const authApi = {
  register: (data: { name: string; phoneNumber: string; password: string }) =>
    api.post<AuthResponse>('/api/auth/register', data).then((r) => r.data),

  login: (data: { phoneNumber: string; password: string }) =>
    api.post<AuthResponse>('/api/auth/login', data).then((r) => r.data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/api/auth/change-password', data),
};
