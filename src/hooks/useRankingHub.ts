import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as signalR from '@microsoft/signalr';
import { useAuthStore } from '../store/authStore';
import { queryKeys } from '../types/api';

export function useRankingHub() {
  const qc = useQueryClient();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) return;

    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5196';
    const hubUrl = `${apiUrl.replace(/^http/, 'ws')}/hubs/ranking`;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect([0, 1000, 3000, 5000, 10000])
      .withServerTimeout(30_000)
      .build();

    // Evento: Ranking de um grupo específico foi atualizado
    connection.on('group-ranking-updated', (groupId: string, matchId: number) => {
      console.log(`📊 Ranking do grupo atualizado! Jogo #${matchId} - Grupo ${groupId}`);
      qc.invalidateQueries({
        queryKey: queryKeys.realTimeRankingGroup(groupId),
      });
      qc.invalidateQueries({
        queryKey: queryKeys.bolaoGroupRanking(groupId),
      });
    });

    // Evento: Ranking global foi atualizado
    connection.on('global-ranking-updated', (matchId: number) => {
      console.log(`🌍 Ranking global atualizado! Jogo #${matchId}`);
      qc.invalidateQueries({
        queryKey: queryKeys.ranking,
      });
    });

    // Evento legado: Rankings foram atualizados
    connection.on('rankings-updated', (matchId: number) => {
      console.log(`📊 Rankings atualizados! Jogo #${matchId}`);
      qc.invalidateQueries({
        queryKey: ['ranking', 'group'],
        exact: false,
      });
      qc.invalidateQueries({
        queryKey: queryKeys.ranking,
      });
    });

    connection.onreconnected(() => {
      console.log('✅ Reconectado ao hub de ranking');
    });

    connection.onreconnecting(() => {
      console.warn('⚠️ Tentando reconectar ao hub de ranking...');
    });

    connection.onclose(() => {
      console.log('❌ Desconectado do hub de ranking');
    });

    connection
      .start()
      .then(() => console.log('🔌 Conectado ao hub de ranking'))
      .catch((err) => console.error('Erro ao conectar hub:', err));

    return () => {
      connection
        .stop()
        .catch((err) => console.error('Erro ao desconectar hub:', err));
    };
  }, [token, qc]);
}

export function useRankingGroupHub(groupId?: string) {
  const qc = useQueryClient();
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token || !groupId) return;

    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5196';
    const hubUrl = `${apiUrl.replace(/^http/, 'ws')}/hubs/ranking`;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect([0, 1000, 3000, 5000, 10000])
      .withServerTimeout(30_000)
      .build();

    connection.on('group-ranking-updated', (updatedGroupId: string, matchId: number) => {
      if (updatedGroupId === groupId) {
        console.log(`📊 Ranking do grupo ${groupId} atualizado! Jogo #${matchId}`);
        qc.invalidateQueries({
          queryKey: queryKeys.realTimeRankingGroup(groupId),
        });
        qc.invalidateQueries({
          queryKey: queryKeys.bolaoGroupRanking(groupId),
        });
      }
    });

    connection.onreconnected(() => {
      console.log(`✅ Reconectado ao hub de ranking - Grupo ${groupId}`);
    });

    connection.onreconnecting(() => {
      console.warn(`⚠️ Tentando reconectar ao hub de ranking - Grupo ${groupId}...`);
    });

    connection.onclose(() => {
      console.log(`❌ Desconectado do hub de ranking - Grupo ${groupId}`);
    });

    connection
      .start()
      .then(() => {
        console.log(`🔌 Conectado ao hub de ranking - Grupo ${groupId}`);
      })
      .catch((err) => console.error(`Erro ao conectar hub (${groupId}):`, err));

    return () => {
      connection
        .stop()
        .catch((err) => console.error(`Erro ao desconectar hub (${groupId}):`, err));
    };
  }, [token, groupId, qc]);
}
