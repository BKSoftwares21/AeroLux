import Constants from 'expo-constants';
import { Platform, NativeModules } from 'react-native';

function findDevHost(): string | undefined {
  // Try multiple sources Expo/RN expose during dev
  const cfg: any = (Constants as any)?.expoConfig || {};
  const man: any = (Constants as any)?.manifest || {};
  const scriptURL: string | undefined = (NativeModules as any)?.SourceCode?.scriptURL;
  const hostUri: string | undefined = cfg.hostUri || man.hostUri;
  const dbg: string | undefined = man.debuggerHost;
  const pick = (u?: string) => u ? u.split('//').pop()?.split(':')[0] : undefined;
  return pick(hostUri) || pick(dbg) || pick(scriptURL);
}

function resolveApiUrl() {
  const extra = (Constants as any)?.expoConfig?.extra || (Constants as any)?.manifest?.extra || {};
  let url = extra.apiUrl || process.env.EXPO_PUBLIC_API_URL || (globalThis as any).EXPO_PUBLIC_API_URL || '';

  const isNative = Platform.OS !== 'web';
  if (!url || (isNative && /localhost|127\.0\.0\.1/.test(url))) {
    const host = findDevHost();
    if (host) url = `http://${host}:3000/api`;
  }

  if (!url) {
    url = Platform.select({ web: 'http://localhost:3000/api', default: 'http://10.0.2.2:3000/api' })!;
  }
  return url;
}

const API_URL = resolveApiUrl();

export type User = { id: number; email: string; full_name: string; phone?: string | null; role: 'user' | 'admin'; date_of_birth?: string | null; id_or_passport?: string | null; last_login?: string | null; };
export type Hotel = { id: number; name: string; city: string; country: string; description?: string | null; star_rating?: number | null };
export type Flight = { id: number; flight_number: string; airline: string; departure: string; arrival: string; date: string; time?: string; price: number; image_url?: string; is_first_class?: boolean; capacity?: number; seats_available?: number };

const apiCall = async (endpoint: string, options: RequestInit = {}, userId?: number) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  // Add user ID to headers for authentication
  if (userId) {
    headers['user-id'] = userId.toString();
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

export const api = {
  // Auth
  signup: async (payload: { email: string; password: string; full_name: string; phone?: string; date_of_birth?: string; id_or_passport?: string }) => {
    const res = await apiCall('/auth/signup', { method: 'POST', body: JSON.stringify(payload) });
    if (res?.user?.role) res.user.role = String(res.user.role).toLowerCase();
    return res;
  },
  
  login: async (payload: { email: string; password: string }) => {
    const res = await apiCall('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
    if (res?.user?.role) res.user.role = String(res.user.role).toLowerCase();
    return res;
  },
  
  forgotPassword: (email: string) =>
    apiCall('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  
  resetPassword: (payload: { email: string; code: string; new_password: string }) =>
    apiCall('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),

  // Hotels
  listHotels: () => apiCall('/hotels'),
  
  createHotel: (payload: { name: string; city: string; country: string; description?: string; star_rating: number; amenities?: any; image_url?: string }) =>
    apiCall('/hotels', { method: 'POST', body: JSON.stringify(payload) }),
  
  updateHotel: (id: number, payload: Partial<{ name: string; city: string; country: string; description: string; star_rating: number; amenities: any; image_url?: string }>) =>
    apiCall(`/hotels/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  
  deleteHotel: (id: number) => apiCall(`/hotels/${id}`, { method: 'DELETE' }),

  searchHotels: (q: { name?: string; city?: string; country?: string; available?: 0 | 1 }) => {
    const params = new URLSearchParams();
    if (q.name) params.append('name', q.name);
    if (q.city) params.append('city', q.city);
    if (q.country) params.append('country', q.country);
    return apiCall(`/hotels/search?${params.toString()}`);
  },

  // Users (admin)
  listUsers: async () => {
    const res = await apiCall('/users');
    if (Array.isArray(res?.users)) {
      res.users = res.users.map((u: any) => ({
        id: u.id,
        email: u.email,
        full_name: u.fullName ?? u.full_name ?? u.fullname,
        phone: u.phone ?? null,
        role: String(u.role).toLowerCase(),
        date_of_birth: u.dateOfBirth || u.date_of_birth || null,
        id_or_passport: u.idOrPassport || u.id_or_passport || null,
        created_at: u.createdAt ?? u.created_at,
      }));
    }
    return res;
  },
  
  createUser: (payload: { email: string; password: string; full_name: string; phone?: string; role?: 'user' | 'admin'; date_of_birth?: string; id_or_passport?: string }) =>
    apiCall('/users', { method: 'POST', body: JSON.stringify({
      ...payload,
      role: payload.role ? payload.role.toUpperCase() : undefined,
    }) }),
  
  updateUser: (id: number, payload: Partial<{ email: string; password: string; full_name: string; phone?: string; role: 'user'|'admin'; date_of_birth?: string; id_or_passport?: string }>) =>
    apiCall(`/users/${id}`, { method: 'PUT', body: JSON.stringify({
      ...payload,
      role: payload.role ? payload.role.toUpperCase() : undefined,
    }) }),
  
  deleteUser: (id: number) => apiCall(`/users/${id}`, { method: 'DELETE' }),

  // Profile management
  getCurrentProfile: async (userId: number) => {
    const res = await apiCall('/users/me', {}, userId);
    if (res?.user) {
      // Normalize field names for consistency
      const user = res.user;
      res.user = {
        id: user.id,
        email: user.email,
        full_name: user.fullName || user.full_name,
        phone: user.phone,
        role: String(user.role).toLowerCase(),
        date_of_birth: user.dateOfBirth || user.date_of_birth,
        id_or_passport: user.idOrPassport || user.id_or_passport,
        last_login: user.lastLogin || user.last_login,
      };
    }
    return res;
  },

  updateOwnProfile: async (userId: number, payload: Partial<{ full_name: string; phone?: string; date_of_birth?: string; id_or_passport?: string }>) => {
    const res = await apiCall('/users/me', { 
      method: 'PUT', 
      body: JSON.stringify(payload) 
    }, userId);
    if (res?.user) {
      // Normalize field names for consistency
      const user = res.user;
      res.user = {
        id: user.id,
        email: user.email,
        full_name: user.fullName || user.full_name,
        phone: user.phone,
        role: String(user.role).toLowerCase(),
        date_of_birth: user.dateOfBirth || user.date_of_birth,
        id_or_passport: user.idOrPassport || user.id_or_passport,
        last_login: user.lastLogin || user.last_login,
      };
    }
    return res;
  },

  // Bookings
  listBookings: () => apiCall('/bookings'),
  getUserBookings: (userId: number) => apiCall(`/bookings/user/${userId}`),
  
  createBooking: (payload: any) =>
    apiCall('/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  
  updateBookingStatus: (id: string, status: string) =>
    apiCall(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  
  markBookingPaid: (id: string) =>
    apiCall(`/bookings/${id}/pay`, { method: 'PATCH' }),
  
  cancelBooking: (id: string) =>
    apiCall(`/bookings/${id}/cancel`, { method: 'POST' }),
  
  deleteBooking: (id: string) => apiCall(`/bookings/${id}`, { method: 'DELETE' }),

  // Uploads
  uploadImage: async (payload: { data: string; filename?: string }): Promise<{ url: string }> =>
    apiCall('/uploads', { method: 'POST', body: JSON.stringify(payload) }),

  // Payments
  listPayments: () => apiCall('/payments'),
  getUserPayments: (userId: number) => apiCall(`/payments/user/${userId}`),
  
  createPayment: (payload: any) =>
    apiCall('/payments', { method: 'POST', body: JSON.stringify(payload) }),
  
  updatePaymentStatus: (id: string, status: 'paid' | 'failed' | 'pending') =>
    apiCall(`/payments/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Notifications
  getNotifications: (userId: number) => apiCall(`/notifications/user/${userId}`),
  
  createNotification: (payload: { userId: number; title: string; body: string }) =>
    apiCall('/notifications', { method: 'POST', body: JSON.stringify(payload) }),
  
  markNotificationRead: (id: number) =>
    apiCall(`/notifications/${id}/read`, { method: 'PATCH' }),

  // Flights
  listFlights: () => apiCall('/flights'),
  createFlight: (payload: { flight_number: string; airline: string; departure: string; arrival: string; date: string; time?: string; price: number; image_url?: string; is_first_class?: boolean; capacity?: number }) =>
    apiCall('/flights', { method: 'POST', body: JSON.stringify(payload) }),
  updateFlight: (id: number, payload: Partial<{ flight_number: string; airline: string; departure: string; arrival: string; date: string; time?: string; price: number; image_url?: string; is_first_class?: boolean; capacity?: number; seats_available?: number }>) =>
    apiCall(`/flights/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteFlight: (id: number) => apiCall(`/flights/${id}`, { method: 'DELETE' }),
  searchFlights: (q: { q?: string; airline?: string; departure?: string; arrival?: string; date?: string }) => {
    const params = new URLSearchParams();
    if (q.q) params.append('q', q.q);
    if (q.airline) params.append('airline', q.airline);
    if (q.departure) params.append('departure', q.departure);
    if (q.arrival) params.append('arrival', q.arrival);
    if (q.date) params.append('date', q.date);
    return apiCall(`/flights/search?${params.toString()}`);
  },
};
