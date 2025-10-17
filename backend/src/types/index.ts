import { Request } from 'express';
import { Document } from 'mongoose';

// User Types
export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: Date;
  idOrPassport?: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Flight Types
export interface IFlight extends Document {
  _id: string;
  flightNumber: string;
  airline: string;
  departure: {
    city: string;
    airport: string;
    code: string;
  };
  arrival: {
    city: string;
    airport: string;
    code: string;
  };
  date: Date;
  time: string;
  duration: number; // in minutes
  price: number;
  class: 'economy' | 'business' | 'first';
  availableSeats: number;
  totalSeats: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Hotel Types
export interface IHotel extends Document {
  _id: string;
  name: string;
  location: {
    city: string;
    country: string;
    address: string;
  };
  description: string;
  pricePerNight: number;
  rating: number;
  amenities: string[];
  bedType: string;
  roomType: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Booking Types
export interface IBooking extends Document {
  _id: string;
  user: string; // User ID
  type: 'flight' | 'hotel';
  flight?: string; // Flight ID
  hotel?: string; // Hotel ID
  checkInDate?: Date;
  checkOutDate?: Date;
  passengers?: number;
  rooms?: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Payment Types
export interface IPayment extends Document {
  _id: string;
  booking: string; // Booking ID
  user: string; // User ID
  amount: number;
  currency: string;
  paymentMethod: 'card' | 'bank_transfer' | 'wallet';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  paymentDetails?: {
    cardNumber?: string;
    expiryDate?: string;
    cvv?: string;
    cardHolderName?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Request Types
export interface AuthRequest extends Request {
  user?: IUser;
}

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