import { useSyncExternalStore } from "react";
import { api } from "../services/api";

export type BookingType = 'FLIGHT' | 'HOTEL';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type PaymentStatus = 'UNPAID' | 'PAID';

export type Booking = {
  id: string;
  userId: string;
  type: BookingType;
  reference: string;
  date: string; // ISO string YYYY-MM-DD
  amount: number;
  description: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  metadata?: Record<string, any>;
  hotelId?: number;
};

function normalizeId(id: string | number): string {
  return String(id);
}

let bookings: Booking[] = [];
let currentUserId: number | null = null;

const listeners = new Set<() => void>();
function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return bookings;
}

// Set the current user ID to fetch bookings for
export function setCurrentUser(userId: number) {
  currentUserId = userId;
  loadUserBookings();
}

// Load bookings from API for current user
async function loadUserBookings() {
  if (!currentUserId) return;
  try {
    const res = await api.getUserBookings(currentUserId);
    bookings = (res.bookings || []).map((b: any) => ({
      id: String(b.id),
      userId: String(b.userId ?? b.user_id ?? currentUserId),
      type: b.type,
      reference: b.reference,
      date: new Date(b.date).toISOString().slice(0, 10),
      amount: Number(b.amount),
      description: b.description,
      status: b.status,
      paymentStatus: b.paymentStatus ?? b.payment_status,
      metadata: b.metadata || {},
      hotelId: b.hotelId ?? b.hotel_id ?? undefined,
    }));
    emit();
  } catch (error) {
    console.error('Failed to load bookings:', error);
  }
}

export function useBookings(): Booking[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getBookingById(id: string | number): Booking | undefined {
  const normalized = normalizeId(id);
  return bookings.find((b) => b.id === normalized);
}

export async function createBooking(booking: Omit<Booking, 'id'> & { hotelId?: number }) {
  if (!currentUserId) throw new Error('No user logged in');
  try {
    const res = await api.createBooking({
      userId: currentUserId,
      type: booking.type,
      reference: booking.reference,
      date: booking.date,
      amount: booking.amount,
      description: booking.description,
      hotelId: booking.hotelId,
      metadata: booking.metadata,
    });
    const newBooking = {
      id: String(res.booking?.id || res.id),
      userId: String(currentUserId),
      type: (res.booking?.type || booking.type) as BookingType,
      reference: res.booking?.reference || booking.reference,
      date: new Date(res.booking?.date || booking.date).toISOString().slice(0, 10),
      amount: Number(res.booking?.amount ?? booking.amount),
      description: res.booking?.description || booking.description,
      status: (res.booking?.status || 'PENDING') as BookingStatus,
      paymentStatus: (res.booking?.paymentStatus || 'UNPAID') as PaymentStatus,
      metadata: res.booking?.metadata || booking.metadata,
      hotelId: res.booking?.hotelId ?? booking.hotelId,
    };
    bookings = [newBooking, ...bookings];
    emit();
    return newBooking;
  } catch (error) {
    console.error('Failed to create booking:', error);
    throw error;
  }
}

export async function updateBookingStatus(id: string | number, status: BookingStatus) {
  const normalized = normalizeId(id);
  try {
    const res = await api.updateBookingStatus(normalized, status);
    const updated = {
      id: String(res.booking?.id || normalized),
      userId: String(currentUserId),
      type: res.booking?.type,
      reference: res.booking?.reference,
      date: new Date(res.booking?.date || Date.now()).toISOString().slice(0, 10),
      amount: Number(res.booking?.amount ?? 0),
      description: res.booking?.description ?? '',
      status: (res.booking?.status || status) as BookingStatus,
      paymentStatus: (res.booking?.paymentStatus || 'UNPAID') as PaymentStatus,
      metadata: res.booking?.metadata || {},
      hotelId: res.booking?.hotelId,
    } as Booking;
    bookings = bookings.map((b) => (b.id === normalized ? updated : b));
    emit();
    return updated;
  } catch (error) {
    console.error('Failed to update booking status:', error);
    throw error;
  }
}

export async function cancelBooking(id: string | number) {
  return updateBookingStatus(id, "CANCELLED");
}

export async function markBookingPaid(id: string | number) {
  const normalized = normalizeId(id);
  try {
    const res = await api.markBookingPaid(normalized);
    const updated = {
      id: String(res.booking?.id || normalized),
      userId: String(currentUserId),
      type: res.booking?.type,
      reference: res.booking?.reference,
      date: new Date(res.booking?.date || Date.now()).toISOString().slice(0, 10),
      amount: Number(res.booking?.amount ?? 0),
      description: res.booking?.description ?? '',
      status: (res.booking?.status || 'COMPLETED') as BookingStatus,
      paymentStatus: (res.booking?.paymentStatus || 'PAID') as PaymentStatus,
      metadata: res.booking?.metadata || {},
      hotelId: res.booking?.hotelId,
    } as Booking;
    bookings = bookings.map((b) => (b.id === normalized ? updated : b));
    emit();
    return updated;
  } catch (error) {
    console.error('Failed to mark booking as paid:', error);
    throw error;
  }
}

export async function deleteBooking(id: string | number) {
  const normalized = normalizeId(id);
  try {
    await api.deleteBooking(normalized);
    bookings = bookings.filter((b) => b.id !== normalized);
    emit();
  } catch (error) {
    console.error('Failed to delete booking:', error);
    throw error;
  }
}
