import { authService, hotelService, userService, notificationService } from './database';

export type User = { id: number; email: string; full_name: string; phone?: string | null; role: 'user' | 'admin' };
export type Hotel = { id: number; name: string; city: string; country: string; description?: string | null; star_rating?: number | null };

export const api = {
  // Auth
  signup: (payload: { email: string; password: string; full_name: string; phone?: string }) =>
    authService.signup(payload),
  login: (payload: { email: string; password: string }) =>
    authService.login(payload.email, payload.password),
  forgotPassword: (email: string) =>
    authService.forgotPassword(email),
  resetPassword: (payload: { email: string; code: string; new_password: string }) =>
    authService.resetPassword(payload.email, payload.code, payload.new_password),

  // Hotels
  listHotels: () => hotelService.listHotels(),
  createHotel: (payload: { name: string; city: string; country: string; description?: string; star_rating: number; amenities?: any }) =>
    hotelService.createHotel(payload),
  updateHotel: (id: number, payload: Partial<{ name: string; city: string; country: string; description: string; star_rating: number; amenities: any }>) =>
    hotelService.updateHotel(id, payload),
  deleteHotel: (id: number) => hotelService.deleteHotel(id),

  searchHotels: (q: { name?: string; city?: string; country?: string; available?: 0 | 1 }) =>
    hotelService.searchHotels(q),

  // Users (admin)
  listUsers: () => userService.listUsers(),
  createUser: (payload: { email: string; password: string; full_name: string; phone?: string; role?: 'user' | 'admin' }) =>
    userService.createUser(payload),
  updateUser: (id: number, payload: Partial<{ email: string; password: string; full_name: string; phone?: string; role: 'user'|'admin' }>) =>
    userService.updateUser(id, payload),
  deleteUser: (id: number) => userService.deleteUser(id),

  // Notifications
  getNotifications: (params: { email?: string; user_id?: number }) =>
    notificationService.getNotifications(params),
};
