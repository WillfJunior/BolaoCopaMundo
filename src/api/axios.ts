import axios from 'axios';

// Lazy import to avoid circular dependency
let getToken: () => string | null = () => null;
let doLogout: () => void = () => {};

export function initAxiosAuth(
  tokenFn: () => string | null,
  logoutFn: () => void
) {
  getToken = tokenFn;
  doLogout = logoutFn;
}

function resolveBaseURL(): string {
  const raw: string = import.meta.env.VITE_API_BASE_URL ?? '';
  if (!raw) throw new Error('[axios] VITE_API_BASE_URL não está definida');
  return raw.startsWith('http') ? raw : `https://${raw}`;
}

export const api = axios.create({
  baseURL: resolveBaseURL(),
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) doLogout();
    return Promise.reject(error);
  }
);
