export type User = { id: number; email: string; full_name: string; phone?: string | null; role: 'user' | 'admin' };
export type Hotel = { id: number; name: string; city: string; country: string; description?: string | null; star_rating?: number | null };

import { Platform } from 'react-native';
const defaultHost = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
const API_BASE = (process.env.EXPO_PUBLIC_API_BASE as string) || `http://${defaultHost}:8000/api`;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
  } catch (err: any) {
    throw new Error(`Failed to fetch ${url}. Make sure the API is running and reachable. ${err?.message || ''}`.trim());
  }
  let data: any = {};
  try { data = await res.json(); } catch {}
  if (!res.ok) throw new Error((data && data.error) || `Request failed (${res.status})`);
  return data as T;
}

export const api = {
  // Auth
  signup: (payload: { email: string; password: string; full_name: string; phone?: string }) =>
    request<{ user: User }>(`/auth/signup`, { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    request<{ user: User }>(`/auth/login`, { method: 'POST', body: JSON.stringify(payload) }),
  forgotPassword: (email: string) =>
    request<{ ok: boolean; test_code?: string }>(`/auth/forgot`, { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (payload: { email: string; code: string; new_password: string }) =>
    request<{ ok: boolean }>(`/auth/reset`, { method: 'POST', body: JSON.stringify(payload) }),

  // Hotels
  listHotels: () => request<{ hotels: Hotel[] }>(`/hotels`),
  createHotel: (payload: { name: string; city: string; country: string; description?: string; star_rating: number; amenities?: any }) =>
    request<{ hotel: Hotel }>(`/hotels`, { method: 'POST', body: JSON.stringify(payload) }),
  updateHotel: (id: number, payload: Partial<{ name: string; city: string; country: string; description: string; star_rating: number; amenities: any }>) =>
    request<{ hotel: Hotel }>(`/hotels/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteHotel: (id: number) => request<{ ok: boolean }>(`/hotels/${id}`, { method: 'DELETE' }),

  searchHotels: (q: { name?: string; city?: string; country?: string; available?: 0 | 1 }) => {
    const params = new URLSearchParams();
    if (q.name) params.set('name', q.name);
    if (q.city) params.set('city', q.city);
    if (q.country) params.set('country', q.country);
    if (typeof q.available === 'number') params.set('available', String(q.available));
    return request<{ hotels: Hotel[] }>(`/hotels?${params.toString()}`);
  },

  // Users (admin)
  listUsers: () => request<{ users: Array<User & { created_at: string; updated_at: string }> }>(`/users`),
  createUser: (payload: { email: string; password: string; full_name: string; phone?: string; role?: 'user' | 'admin' }) =>
    request<{ user: User }>(`/users`, { method: 'POST', body: JSON.stringify(payload) }),
  updateUser: (id: number, payload: Partial<{ email: string; password: string; full_name: string; phone?: string; role: 'user'|'admin' }>) =>
    request<{ user: User }>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteUser: (id: number) => request<{ ok: boolean }>(`/users/${id}`, { method: 'DELETE' }),

  // Notifications
  getNotifications: (params: { email?: string; user_id?: number }) => {
    const qs = new URLSearchParams();
    if (params.email) qs.set('email', params.email);
    if (params.user_id) qs.set('user_id', String(params.user_id));
    return request<{ notifications: { id: number; title: string; body: string; is_read: 0 | 1; created_at: string }[] }>(`/notifications?${qs.toString()}`);
  },
};
