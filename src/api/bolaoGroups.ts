import { api } from './axios';
import type {
  BolaoGroupDto,
  BolaoGroupMemberDto,
  GroupInviteInfoDto,
  RankingEntryDto,
  GroupRankingDetailedDto,
  MemberPredictionDto,
} from '../types/api';

export const bolaoGroupsApi = {
  list: () => api.get<BolaoGroupDto[]>('/api/bolao-groups').then((r) => r.data),

  get: (id: string) => api.get<BolaoGroupDto>(`/api/bolao-groups/${id}`).then((r) => r.data),

  create: (data: { name: string; description?: string; pixKey?: string }) =>
    api.post<BolaoGroupDto>('/api/bolao-groups', data).then((r) => r.data),

  delete: (id: string) => api.delete(`/api/bolao-groups/${id}`),

  leave: (id: string) => api.post(`/api/bolao-groups/${id}/leave`),

  members: (id: string) =>
    api.get<BolaoGroupMemberDto[]>(`/api/bolao-groups/${id}/members`).then((r) => r.data),

  removeMember: (id: string, userId: string) =>
    api.delete(`/api/bolao-groups/${id}/members/${userId}`),

  pendingMembers: (id: string) =>
    api.get<BolaoGroupMemberDto[]>(`/api/bolao-groups/${id}/members/pending`).then((r) => r.data),

  approveMember: (id: string, userId: string) =>
    api.post<BolaoGroupMemberDto>(`/api/bolao-groups/${id}/members/${userId}/approve`).then((r) => r.data),

  inviteInfo: (code: string) =>
    api.get<GroupInviteInfoDto>(`/api/bolao-groups/invite/${code}`).then((r) => r.data),

  join: (code: string) =>
    api.post<BolaoGroupDto>(`/api/bolao-groups/invite/${code}/accept`).then((r) => r.data),

  regenerateInvite: (id: string) =>
    api
      .post<{ inviteCode: string; inviteLink: string; whatsAppShareUrl: string }>(
        `/api/bolao-groups/${id}/regenerate-invite`
      )
      .then((r) => r.data),

  ranking: (id: string) =>
    api.get<RankingEntryDto[]>(`/api/bolao-groups/${id}/ranking`).then((r) => r.data),

  rankingDetailed: (id: string) =>
    api.get<GroupRankingDetailedDto>(`/api/bolao-groups/${id}/ranking/detailed`).then((r) => r.data),

  memberPredictions: (groupId: string, memberId: string) =>
    api
      .get<MemberPredictionDto>(
        `/api/bolao-groups/${groupId}/members/${memberId}/predictions`
      )
      .then((r) => r.data),
};
