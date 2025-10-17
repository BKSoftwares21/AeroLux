import { Request } from 'express';
import { User, Flight, Hotel, Booking, Payment, Role, FlightClass, BookingType, BookingStatus, PaymentStatus, PaymentMethod } from '@prisma/client';

// User Types
export interface IUser extends Omit<User, 'password'> {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  dateOfBirth?: Date | null;
  idOrPassport?: string | null;
  role: Role;
  isEmailVerified: boolean;
  emailVerificationToken?: string | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserWithPassword extends User {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Flight Types
export interface IFlight extends Flight {
  id: string;
  flightNumber: string;
  airline: string;
  departureCity: string;
  departureAirport: string;
  departureCode: string;
  arrivalCity: string;
  arrivalAirport: string;
  arrivalCode: string;
  date: Date;
  time: string;
  duration: number; // in minutes
  price: number;
  class: FlightClass;
  availableSeats: number;
  totalSeats: number;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Hotel Types
export interface IHotel extends Hotel {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string;
  description: string;
  pricePerNight: number;
  rating: number;
  amenities: string[];
  bedType: string;
  roomType: string;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Booking Types
export interface IBooking extends Booking {
  id: string;
  userId: string;
  type: BookingType;
  flightId?: string | null;
  hotelId?: string | null;
  checkInDate?: Date | null;
  checkOutDate?: Date | null;
  passengers?: number | null;
  rooms?: number | null;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Types
export interface IPayment extends Payment {
  id: string;
  bookingId: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string | null;
  cardNumber?: string | null;
  expiryDate?: string | null;
  cardHolderName?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Request Types
export interface AuthRequest extends Request {
  user?: IUser;
}

// Re-export Prisma types for convenience
export type { Role, FlightClass, BookingType, BookingStatus, PaymentStatus, PaymentMethod };

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Search and Filter Types
export interface FlightSearchParams {
  departure?: string;
  arrival?: string;
  date?: string;
  passengers?: number;
  class?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface HotelSearchParams {
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  rooms?: number;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}