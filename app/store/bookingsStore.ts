import { useSyncExternalStore } from "react";

export type BookingType = "FLIGHT" | "HOTEL";
export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
export type PaymentStatus = "UNPAID" | "PAID";

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
  metadata?: Record<string, string | number | boolean | null>;
};

function normalizeId(id: string | number): string {
  return String(id);
}

let bookings: Booking[] = [
  {
    id: "1",
    userId: "u1",
    type: "FLIGHT",
    reference: "FL123",
    date: "2025-10-01",
    amount: 299.99,
    description: "Flight to Paris",
    status: "COMPLETED",
    paymentStatus: "PAID",
  },
  {
    id: "2",
    userId: "u1",
    type: "HOTEL",
    reference: "HT456",
    date: "2025-09-15",
    amount: 120.0,
    description: "Hotel Booking",
    status: "CONFIRMED",
    paymentStatus: "UNPAID",
  },
  {
    id: "3",
    userId: "u1",
    type: "FLIGHT",
    reference: "FL789",
    date: "2025-08-20",
    amount: 450.5,
    description: "Flight to New York",
    status: "CANCELLED",
    paymentStatus: "UNPAID",
  },
];

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

export function useBookings(): Booking[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getBookingById(id: string | number): Booking | undefined {
  const normalized = normalizeId(id);
  return bookings.find((b) => b.id === normalized);
}

export function upsertBooking(booking: Booking) {
  const normalized = normalizeId(booking.id);
  const exists = bookings.some((b) => b.id === normalized);
  if (exists) {
    bookings = bookings.map((b) => (b.id === normalized ? { ...b, ...booking } : b));
  } else {
    bookings = [{ ...booking, id: normalized }, ...bookings];
  }
  emit();
}

export function updateBookingStatus(id: string | number, status: BookingStatus) {
  const normalized = normalizeId(id);
  bookings = bookings.map((b) => (b.id === normalized ? { ...b, status } : b));
  emit();
}

export function cancelBooking(id: string | number) {
  updateBookingStatus(id, "CANCELLED");
}

export function markBookingPaid(id: string | number) {
  const normalized = normalizeId(id);
  bookings = bookings.map((b) => {
    if (b.id !== normalized) return b;
    const newStatus: BookingStatus = b.status === "CONFIRMED" || b.status === "PENDING" ? "COMPLETED" : b.status;
    return { ...b, paymentStatus: "PAID", status: newStatus };
  });
  emit();
}

export function deleteBooking(id: string | number) {
  const normalized = normalizeId(id);
  bookings = bookings.filter((b) => b.id !== normalized);
  emit();
}
