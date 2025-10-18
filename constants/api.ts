export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost/aerolux/api';

export async function http<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
    }
  return res.json() as Promise<T>;
}
