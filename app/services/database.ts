import { prisma } from '../lib/prisma';
import { BookingType, BookingStatus, PaymentStatus, Role } from '../generated/prisma';
import bcrypt from 'bcryptjs';

export type User = {
  id: number;
  email: string;
  full_name: string;
  phone?: string | null;
  role: 'user' | 'admin';
};

export type Hotel = {
  id: number;
  name: string;
  city: string;
  country: string;
  description?: string | null;
  star_rating?: number | null;
};

export type Booking = {
  id: string;
  userId: string;
  type: BookingType;
  reference: string;
  date: string;
  amount: number;
  description: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  metadata?: Record<string, any>;
};

// Auth Services
export const authService = {
  async signup(data: { email: string; password: string; full_name: string; phone?: string }) {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        fullName: data.full_name,
        phone: data.phone,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
      },
    });
    
    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        phone: user.phone,
        role: user.role.toLowerCase() as 'user' | 'admin',
      },
    };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        phone: user.phone,
        role: user.role.toLowerCase() as 'user' | 'admin',
      },
    };
  },

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // In a real app, you'd send an email with a reset code
    // For demo purposes, return a test code
    return { ok: true, test_code: '123456' };
  },

  async resetPassword(email: string, code: string, new_password: string) {
    // In a real app, you'd verify the reset code
    if (code !== '123456') {
      throw new Error('Invalid reset code');
    }

    const hashedPassword = await bcrypt.hash(new_password, 12);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return { ok: true };
  },
};

// Hotel Services
export const hotelService = {
  async listHotels() {
    const hotels = await prisma.hotel.findMany();
    return {
      hotels: hotels.map(h => ({
        id: h.id,
        name: h.name,
        city: h.city,
        country: h.country,
        description: h.description,
        star_rating: h.starRating,
      })),
    };
  },

  async createHotel(data: { name: string; city: string; country: string; description?: string; star_rating: number; amenities?: any }) {
    const hotel = await prisma.hotel.create({
      data: {
        name: data.name,
        city: data.city,
        country: data.country,
        description: data.description,
        starRating: data.star_rating,
        amenities: data.amenities,
      },
    });

    return {
      hotel: {
        id: hotel.id,
        name: hotel.name,
        city: hotel.city,
        country: hotel.country,
        description: hotel.description,
        star_rating: hotel.starRating,
      },
    };
  },

  async updateHotel(id: number, data: Partial<{ name: string; city: string; country: string; description: string; star_rating: number; amenities: any }>) {
    const hotel = await prisma.hotel.update({
      where: { id },
      data: {
        name: data.name,
        city: data.city,
        country: data.country,
        description: data.description,
        starRating: data.star_rating,
        amenities: data.amenities,
      },
    });

    return {
      hotel: {
        id: hotel.id,
        name: hotel.name,
        city: hotel.city,
        country: hotel.country,
        description: hotel.description,
        star_rating: hotel.starRating,
      },
    };
  },

  async deleteHotel(id: number) {
    await prisma.hotel.delete({
      where: { id },
    });
    return { ok: true };
  },

  async searchHotels(query: { name?: string; city?: string; country?: string }) {
    const hotels = await prisma.hotel.findMany({
      where: {
        ...(query.name && { name: { contains: query.name, mode: 'insensitive' } }),
        ...(query.city && { city: { contains: query.city, mode: 'insensitive' } }),
        ...(query.country && { country: { contains: query.country, mode: 'insensitive' } }),
      },
    });

    return {
      hotels: hotels.map(h => ({
        id: h.id,
        name: h.name,
        city: h.city,
        country: h.country,
        description: h.description,
        star_rating: h.starRating,
      })),
    };
  },
};

// User Services
export const userService = {
  async listUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        full_name: u.fullName,
        phone: u.phone,
        role: u.role.toLowerCase() as 'user' | 'admin',
        created_at: u.createdAt.toISOString(),
        updated_at: u.updatedAt.toISOString(),
      })),
    };
  },

  async createUser(data: { email: string; password: string; full_name: string; phone?: string; role?: 'user' | 'admin' }) {
    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        fullName: data.full_name,
        phone: data.phone,
        role: data.role?.toUpperCase() as Role || 'USER',
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        phone: user.phone,
        role: user.role.toLowerCase() as 'user' | 'admin',
      },
    };
  },

  async updateUser(id: number, data: Partial<{ email: string; password: string; full_name: string; phone?: string; role: 'user'|'admin' }>) {
    const updateData: any = {
      ...(data.email && { email: data.email }),
      ...(data.full_name && { fullName: data.full_name }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.role && { role: data.role.toUpperCase() as Role }),
    };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        phone: user.phone,
        role: user.role.toLowerCase() as 'user' | 'admin',
      },
    };
  },

  async deleteUser(id: number) {
    await prisma.user.delete({
      where: { id },
    });
    return { ok: true };
  },
};

// Booking Services
export const bookingService = {
  async getUserBookings(userId: number) {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        hotel: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings.map(b => ({
      id: b.id,
      userId: b.userId.toString(),
      type: b.type,
      reference: b.reference,
      date: b.date.toISOString().split('T')[0],
      amount: b.amount,
      description: b.description,
      status: b.status,
      paymentStatus: b.paymentStatus,
      metadata: b.metadata as Record<string, any> || {},
    }));
  },

  async createBooking(data: {
    userId: number;
    type: BookingType;
    reference: string;
    date: string;
    amount: number;
    description: string;
    hotelId?: number;
    metadata?: Record<string, any>;
  }) {
    const booking = await prisma.booking.create({
      data: {
        userId: data.userId,
        type: data.type,
        reference: data.reference,
        date: new Date(data.date),
        amount: data.amount,
        description: data.description,
        hotelId: data.hotelId,
        metadata: data.metadata,
      },
    });

    return {
      id: booking.id,
      userId: booking.userId.toString(),
      type: booking.type,
      reference: booking.reference,
      date: booking.date.toISOString().split('T')[0],
      amount: booking.amount,
      description: booking.description,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      metadata: booking.metadata as Record<string, any> || {},
    };
  },

  async updateBookingStatus(id: string, status: BookingStatus) {
    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    return {
      id: booking.id,
      userId: booking.userId.toString(),
      type: booking.type,
      reference: booking.reference,
      date: booking.date.toISOString().split('T')[0],
      amount: booking.amount,
      description: booking.description,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      metadata: booking.metadata as Record<string, any> || {},
    };
  },

  async markBookingPaid(id: string) {
    const booking = await prisma.booking.update({
      where: { id },
      data: { 
        paymentStatus: 'PAID',
        status: 'COMPLETED',
      },
    });

    return {
      id: booking.id,
      userId: booking.userId.toString(),
      type: booking.type,
      reference: booking.reference,
      date: booking.date.toISOString().split('T')[0],
      amount: booking.amount,
      description: booking.description,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      metadata: booking.metadata as Record<string, any> || {},
    };
  },

  async deleteBooking(id: string) {
    await prisma.booking.delete({
      where: { id },
    });
    return { ok: true };
  },
};

// Notification Services
export const notificationService = {
  async getNotifications(params: { email?: string; user_id?: number }) {
    let whereClause: any = {};

    if (params.user_id) {
      whereClause.userId = params.user_id;
    } else if (params.email) {
      const user = await prisma.user.findUnique({
        where: { email: params.email },
        select: { id: true },
      });
      if (user) {
        whereClause.userId = user.id;
      }
    }

    const notifications = await prisma.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return {
      notifications: notifications.map(n => ({
        id: n.id,
        title: n.title,
        body: n.body,
        is_read: n.isRead ? 1 : 0,
        created_at: n.createdAt.toISOString(),
      })),
    };
  },

  async createNotification(userId: number, title: string, body: string) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        body,
      },
    });

    return {
      id: notification.id,
      title: notification.title,
      body: notification.body,
      is_read: notification.isRead ? 1 : 0,
      created_at: notification.createdAt.toISOString(),
    };
  },

  async markNotificationRead(id: number) {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return { ok: true };
  },
};