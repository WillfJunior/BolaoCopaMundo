// ─── Auth ────────────────────────────────────────────────────────────────────
export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: UserInfo;
}
export interface UserInfo {
  id: string;
  name: string;
  phoneNumber: string;
  photoUrl: string | null;
  isAdmin: boolean;
}

// ─── Usuário ─────────────────────────────────────────────────────────────────
export interface UserDto {
  id: string;
  name: string;
  phoneNumber: string;
  photoUrl: string | null;
  isAdmin: boolean;
  createdAt: string;
}

// ─── Copa do Mundo ────────────────────────────────────────────────────────────
export interface TeamDto {
  id: number;
  name: string;
  fifaCode: string;
  flagUrl: string | null;
}
export interface MatchDto {
  id: number;
  homeTeam: TeamDto | null;
  awayTeam: TeamDto | null;
  groupName: string | null;
  phase: MatchPhase;
  status: MatchStatus;
  matchDate: string;
  homeScore: number | null;
  awayScore: number | null;
  venue: string | null;
  matchLabel: string | null;
  matchday: number;
}
export interface GroupDto {
  name: string;
  teams: TeamDto[];
  matches: MatchDto[];
}

// ─── Palpites ─────────────────────────────────────────────────────────────────
export interface PredictionDto {
  id: string;
  groupId: string;
  matchId: number;
  homeScore: number;
  awayScore: number;
  points: number;
  isProcessed: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Ranking ──────────────────────────────────────────────────────────────────
export interface RankingEntryDto {
  position: number;
  userId: string;
  userName: string;
  userPhotoUrl: string | null;
  totalPoints: number;
  exactScores: number;
  correctOutcomes: number;
  totalPredictions: number;
}

export interface GroupRankingDetailedEntryDto extends RankingEntryDto {
  pointsPerPrediction: number;
  accuracyRate: number;
  isLeader: boolean;
  pointsDifference: number;
}

export interface GroupRankingDetailedDto {
  groupId: string;
  groupName: string;
  groupDescription: string | null;
  totalMembers: number;
  totalMatches: number;
  processedMatches: number;
  creatorName: string;
  generatedAt: string;
  rankings: GroupRankingDetailedEntryDto[];
}

// ─── Grupos do Bolão ──────────────────────────────────────────────────────────
export interface BolaoGroupDto {
  id: string;
  name: string;
  description: string | null;
  creatorId: string;
  creatorName: string;
  inviteCode: string;
  inviteLink: string;
  whatsAppShareUrl: string;
  pixKey: string | null;
  memberCount: number;
  pendingCount: number;
  myRole: MemberRole;
  myStatus: MemberStatus;
  createdAt: string;
}
export interface BolaoGroupMemberDto {
  userId: string;
  userName: string;
  userPhotoUrl: string | null;
  role: MemberRole;
  status: MemberStatus;
  invitedAt: string;
  joinedAt: string | null;
}
export interface GroupInviteInfoDto {
  groupId: string;
  inviteCode: string;
  groupName: string;
  pixKey: string | null;
  description: string | null;
  creatorName: string;
  memberCount: number;
  isAlreadyMember: boolean;
  currentStatus: MemberStatus | null;
}

// ─── Enums (const objects — compatível com erasableSyntaxOnly) ────────────────
export const MatchPhase = {
  GroupStage: 1,
  RoundOf32: 2,
  RoundOf16: 3,
  Quarterfinals: 4,
  Semifinals: 5,
  ThirdPlace: 6,
  Final: 7,
} as const;
export type MatchPhase = (typeof MatchPhase)[keyof typeof MatchPhase];

export const MatchStatus = {
  Scheduled: 1,
  InProgress: 2,
  Finished: 3,
  Cancelled: 4,
} as const;
export type MatchStatus = (typeof MatchStatus)[keyof typeof MatchStatus];

export const MemberRole = { Admin: 1, Member: 2 } as const;
export type MemberRole = (typeof MemberRole)[keyof typeof MemberRole];

export const MemberStatus = { Pending: 1, Active: 2, Rejected: 3 } as const;
export type MemberStatus = (typeof MemberStatus)[keyof typeof MemberStatus];

// ─── Query keys ───────────────────────────────────────────────────────────────
export const queryKeys = {
  groups: ['groups'] as const,
  group: (name: string) => ['groups', name] as const,
  match: (id: number) => ['matches', id] as const,
  upcoming: (hours: number) => ['matches', 'upcoming', hours] as const,
  predictions: (groupId: string) => ['predictions', groupId] as const,
  predictionForMatch: (matchId: number, groupId: string) => ['predictions', 'match', matchId, groupId] as const,
  ranking: ['ranking'] as const,
  myRanking: ['ranking', 'me'] as const,
  profile: ['users', 'me'] as const,
  bolaoGroups: ['bolao-groups'] as const,
  bolaoGroup: (id: string) => ['bolao-groups', id] as const,
  bolaoGroupMembers: (id: string) => ['bolao-groups', id, 'members'] as const,
  bolaoGroupRanking: (id: string) => ['bolao-groups', id, 'ranking'] as const,
  bolaoGroupRankingDetailed: (id: string) => ['bolao-groups', id, 'ranking', 'detailed'] as const,
  bolaoInvite: (code: string) => ['bolao-invite', code] as const,
};
