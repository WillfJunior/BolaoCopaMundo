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

    connection.on('rankings-updated', (matchId: number) => {
      console.log(`📊 Ranking atualizado! Jogo #${matchId}`);
      // Invalida rankings globais e de grupos
      qc.invalidateQueries({ queryKey: queryKeys.ranking });
      qc.invalidateQueries({ queryKey: queryKeys.myRanking });
      // Invalida todos os rankings de grupos (simples e detalhado)
      qc.invalidateQueries({ queryKey: ['bolaoGroupRanking'] });
      qc.invalidateQueries({ queryKey: ['bolaoGroupRankingDetailed'] });
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
