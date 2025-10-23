import { useSyncExternalStore } from "react";
import { bookingService } from '../services/database';
import { BookingType, BookingStatus, PaymentStatus } from '../generated/prisma';

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
};

export { BookingType, BookingStatus, PaymentStatus };

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

// Load bookings from database for current user
async function loadUserBookings() {
  if (!currentUserId) return;
  try {
    bookings = await bookingService.getUserBookings(currentUserId);
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
    const newBooking = await bookingService.createBooking({
      userId: currentUserId,
      type: booking.type,
      reference: booking.reference,
      date: booking.date,
      amount: booking.amount,
      description: booking.description,
      hotelId: booking.hotelId,
      metadata: booking.metadata,
    });
    
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
    const updatedBooking = await bookingService.updateBookingStatus(normalized, status);
    bookings = bookings.map((b) => (b.id === normalized ? updatedBooking : b));
    emit();
    return updatedBooking;
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
    const updatedBooking = await bookingService.markBookingPaid(normalized);
    bookings = bookings.map((b) => (b.id === normalized ? updatedBooking : b));
    emit();
    return updatedBooking;
  } catch (error) {
    console.error('Failed to mark booking as paid:', error);
    throw error;
  }
}

export async function deleteBooking(id: string | number) {
  const normalized = normalizeId(id);
  try {
    await bookingService.deleteBooking(normalized);
    bookings = bookings.filter((b) => b.id !== normalized);
    emit();
  } catch (error) {
    console.error('Failed to delete booking:', error);
    throw error;
  }
}
