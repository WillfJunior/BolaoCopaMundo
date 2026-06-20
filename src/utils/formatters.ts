import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const BRT = 'America/Sao_Paulo';

export function formatMatchDate(dateStr: string): string {
  const brtDate = toZonedTime(new Date(dateStr), BRT);
  return formatInTimeZone(brtDate, BRT, "dd/MM 'às' HH:mm", {
    locale: ptBR,
  });
}

export function formatFullDate(dateStr: string): string {
  const brtDate = toZonedTime(new Date(dateStr), BRT);
  return formatInTimeZone(
    brtDate,
    BRT,
    "EEEE, dd 'de' MMMM 'de' yyyy 'às' HH:mm",
    { locale: ptBR }
  );
}

export function formatRelative(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { locale: ptBR, addSuffix: true });
}

/** Returns a Date object adjusted to BRT wall-clock time (for comparisons). */
export function toBRT(dateStr: string): Date {
  return toZonedTime(new Date(dateStr), BRT);
}

/**
 * Computes points for a prediction given official scores.
 * Mirrors the backend logic so results appear immediately after a match
 * finishes, even if the backend job hasn't processed yet.
 *   3 pts → exact score
 *   1 pt  → correct outcome (win/draw/loss) but wrong score
 *   0 pts → wrong outcome
 */
export function computePoints(
  predHome: number,
  predAway: number,
  officialHome: number,
  officialAway: number
): number {
  if (predHome === officialHome && predAway === officialAway) return 3;
  const predResult = Math.sign(predHome - predAway);
  const officialResult = Math.sign(officialHome - officialAway);
  return predResult === officialResult ? 1 : 0;
}

export function toE164(maskedPhone: string): string {
  return '+' + maskedPhone.replace(/\D/g, '');
}

/**
 * Resolves a flag/image URL returned by the API.
 * The backend sends relative paths (e.g. "/flags/bra.svg").
 * The browser would resolve them against the Vite dev server origin,
 * not the API server — so we prefix relative paths with VITE_API_BASE_URL.
 */
export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (
    path.startsWith('data:') ||
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('//')
  ) {
    return path;
  }
  const base = import.meta.env.VITE_API_BASE_URL as string;
  return `${base.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
}
