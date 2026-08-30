import type { CharacterPublic, HuntingGround, LeaderboardEntry, Vocation } from '@tibia-idle/shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.error || 'Erro inesperado.', res.status);
  }
  return data as T;
}

export interface AuthResponse {
  token: string;
  user: { id: string; email: string; username: string };
}

export const api = {
  register: (email: string, username: string, password: string) =>
    request<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, username, password }) }),

  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  getMe: (token: string) => request<{ character: CharacterPublic }>('/api/characters/me', {}, token),

  createCharacter: (token: string, name: string, vocation: Vocation) =>
    request<{ character: CharacterPublic }>(
      '/api/characters',
      { method: 'POST', body: JSON.stringify({ name, vocation }) },
      token,
    ),

  spendAttribute: (token: string, attribute: string, amount: number) =>
    request<{ character: CharacterPublic }>(
      '/api/characters/attributes/spend',
      { method: 'POST', body: JSON.stringify({ attribute, amount }) },
      token,
    ),

  getGrounds: (token: string) => request<{ grounds: HuntingGround[] }>('/api/hunts/grounds', {}, token),

  startHunt: (token: string, groundId: string) =>
    request<{ character: CharacterPublic }>('/api/hunts/start', { method: 'POST', body: JSON.stringify({ groundId }) }, token),

  stopHunt: (token: string) => request<{ character: CharacterPublic }>('/api/hunts/stop', { method: 'POST' }, token),

  getLeaderboard: (token: string) => request<{ entries: LeaderboardEntry[] }>('/api/leaderboard', {}, token),
};

export { API_URL };
