/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_BASE_URL } from "../constants/env";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

let authToken: string | null = null;
let currentUserCache: any | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export function setCurrentUser(user: any | null) {
  currentUserCache = user;
}

export function getCurrentUserCached() {
  return currentUserCache;
}

async function request<T>(path: string, method: HttpMethod = "GET", body?: any): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json: any;
  try { json = text ? JSON.parse(text) : {}; } catch { throw new Error(`Invalid JSON from ${path}: ${text}`); }
  if (!res.ok) {
    const msg = (json && (json.error || json.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return json as T;
}

// Auth
export async function login(email: string, password: string) {
  const data = await request<{ token: string; user: any }>(`/auth.php?action=login`, "POST", { email, password });
  setAuthToken(data.token);
  setCurrentUser(data.user);
  return data.user;
}

export async function signup(payload: { name: string; email: string; password: string; phone?: string; dob?: string; idOrPassport?: string; }) {
  const data = await request<{ token: string; user: any }>(`/auth.php?action=signup`, "POST", payload);
  setAuthToken(data.token);
  setCurrentUser(data.user);
  return data.user;
}

export async function getMe() {
  const data = await request<{ user: any }>(`/auth.php?action=me`, "GET");
  setCurrentUser(data.user);
  return data.user;
}

export async function logout() {
  await request(`/auth.php?action=logout`, "POST", {});
  setAuthToken(null);
  setCurrentUser(null);
}

// Users (admin)
export const usersApi = {
  list: async () => (await request<{ users: any[] }>(`/users.php`, "GET")).users,
  create: async (u: any) => (await request<{ user: any }>(`/users.php`, "POST", u)).user,
  update: async (id: string | number, u: any) => (await request<{ user: any }>(`/users.php?id=${id}`, "PUT", u)).user,
  delete: async (id: string | number) => { await request(`/users.php?id=${id}`, "DELETE"); },
};

// Hotels
export const hotelsApi = {
  list: async (q?: string) => (await request<{ hotels: any[] }>(`/hotels.php${q ? `?q=${encodeURIComponent(q)}` : ""}`, "GET")).hotels,
  create: async (h: any) => (await request<{ hotel: any }>(`/hotels.php`, "POST", h)).hotel,
  update: async (id: number, h: any) => (await request<{ hotel: any }>(`/hotels.php?id=${id}`, "PUT", h)).hotel,
  delete: async (id: number) => { await request(`/hotels.php?id=${id}`, "DELETE"); },
};

// Flights
export const flightsApi = {
  list: async (q?: string) => (await request<{ flights: any[] }>(`/flights.php${q ? `?q=${encodeURIComponent(q)}` : ""}`, "GET")).flights,
  create: async (f: any) => (await request<{ flight: any }>(`/flights.php`, "POST", f)).flight,
  update: async (id: number, f: any) => (await request<{ flight: any }>(`/flights.php?id=${id}`, "PUT", f)).flight,
  delete: async (id: number) => { await request(`/flights.php?id=${id}`, "DELETE"); },
};

// Bookings
export const bookingsApi = {
  list: async (userId?: number) => (await request<{ bookings: any[] }>(`/bookings.php${userId ? `?userId=${userId}` : ""}`, "GET")).bookings,
  create: async (b: any) => (await request<{ booking: any }>(`/bookings.php`, "POST", b)).booking,
  update: async (id: number, b: any) => (await request<{ booking: any }>(`/bookings.php?id=${id}`, "PUT", b)).booking,
  delete: async (id: number) => { await request(`/bookings.php?id=${id}`, "DELETE"); },
};

// Payments
export const paymentsApi = {
  list: async (userId?: number) => (await request<{ payments: any[] }>(`/payments.php${userId ? `?userId=${userId}` : ""}`, "GET")).payments,
  update: async (id: number, p: any) => (await request<{ payment: any }>(`/payments.php?id=${id}`, "PUT", p)).payment,
};

// Notifications
export const notificationsApi = {
  list: async (userId?: number) => (await request<{ notifications: any[] }>(`/notifications.php${userId ? `?userId=${userId}` : ""}`, "GET")).notifications,
};
