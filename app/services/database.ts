// Mock database services for React Native compatibility
// Rewritten to avoid server-side `prisma` / `bcrypt` usage and use in-memory mocks.

export type BookingType = 'FLIGHT' | 'HOTEL';
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
export type PaymentStatus = 'UNPAID' | 'PAID';
export type Role = 'USER' | 'ADMIN';

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
  amenities?: Record<string, any>;
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
  hotelId?: number;
};

// --- In-memory mock data ---
type MockUser = {
  id: number;
  email: string;
  password: string;
  full_name: string;
  phone: string | null;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
};

let mockUsers: MockUser[] = [
  {
    id: 1,
    email: 'admin@aerolux.com',
    password: 'password123', // Only for mock auth flows
    full_name: 'Admin User',
    phone: '+1234567890',
    role: 'admin',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    email: 'user@example.com',
    password: 'password123',
    full_name: 'John Doe',
    phone: '+1987654321',
    role: 'user',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

let mockHotels: (Hotel & { id: number })[] = [
  {
    id: 1,
    name: 'Grand Luxury Hotel Paris',
    city: 'Paris',
    country: 'France',
    description: 'A beautiful luxury hotel in the heart of Paris',
    star_rating: 5,
    amenities: { wifi: true, pool: true, spa: true, gym: true, restaurant: true },
  },
  {
    id: 2,
    name: 'New York Plaza',
    city: 'New York',
    country: 'USA',
    description: 'Iconic hotel in Manhattan',
    star_rating: 4,
    amenities: { wifi: true, pool: false, spa: true, gym: true, restaurant: true },
  },
  {
    id: 3,
    name: 'Tokyo Gardens Resort',
    city: 'Tokyo',
    country: 'Japan',
    description: 'Modern resort with traditional Japanese elements',
    star_rating: 5,
    amenities: { wifi: true, pool: true, spa: true, gym: true, restaurant: true },
  },
];

let mockBookings: any[] = [
  {
    id: '1',
    userId: 2,
    type: 'FLIGHT' as BookingType,
    reference: 'FL123456',
    date: '2025-12-01',
    amount: 299.99,
    description: 'Flight to Paris',
    status: 'COMPLETED' as BookingStatus,
    paymentStatus: 'PAID' as PaymentStatus,
    metadata: { departure: 'JFK', arrival: 'CDG', class: 'economy' },
  },
  {
    id: '2',
    userId: 2,
    type: 'HOTEL' as BookingType,
    reference: 'HT789012',
    date: '2025-12-02',
    amount: 450.0,
    description: 'Hotel booking in Paris',
    status: 'CONFIRMED' as BookingStatus,
    paymentStatus: 'PAID' as PaymentStatus,
    hotelId: 1,
    metadata: { nights: 3, rooms: 1, guests: 2 },
  },
  {
    id: '3',
    userId: 2,
    type: 'FLIGHT' as BookingType,
    reference: 'FL345678',
    date: '2025-11-15',
    amount: 599.99,
    description: 'Flight to Tokyo',
    status: 'PENDING' as BookingStatus,
    paymentStatus: 'UNPAID' as PaymentStatus,
    metadata: { departure: 'LAX', arrival: 'NRT', class: 'business' },
  },
];

let mockNotifications = [
  {
    id: 1,
    userId: 2,
    title: 'Booking Confirmed',
    body: 'Your hotel booking in Paris has been confirmed!',
    is_read: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    userId: 2,
    title: 'Payment Reminder',
    body: "Don't forget to complete payment for your Tokyo flight.",
    is_read: 0,
    created_at: new Date().toISOString(),
  },
];

// Helper to simulate delay
const delay = (ms = 300) => new Promise(res => setTimeout(res, ms));
const nextId = (arr: any[]) => (arr.length ? Math.max(...arr.map((x:any)=> x.id)) + 1 : 1);

// --- Auth Services (mocked) ---
export const authService = {
  async signup(data: { email: string; password: string; full_name: string; phone?: string }) {
    await delay();
    const existingUser = mockUsers.find(u => u.email === data.email);
    if (existingUser) throw new Error('User already exists');
    const newUser: MockUser = {
      id: mockUsers.length + 1,
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      phone: data.phone ?? null,
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockUsers.push(newUser);
    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        phone: newUser.phone,
        role: newUser.role,
      },
    };
  },

  async login(email: string, password: string) {
    await delay();
    const user = mockUsers.find(u => u.email === email);
    if (!user || user.password !== password) throw new Error('Invalid credentials');
    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        role: user.role,
      },
    };
  },

  async forgotPassword(email: string) {
    await delay();
    const user = mockUsers.find(u => u.email === email);
    if (!user) throw new Error('User not found');
    return { ok: true, test_code: '123456' };
  },

  async resetPassword(email: string, code: string, new_password: string) {
    await delay();
    if (code !== '123456') throw new Error('Invalid reset code');
    const user = mockUsers.find(u => u.email === email);
    if (user) user.password = new_password;
    return { ok: true };
  },
};

// --- Hotel Services (in-memory) ---
export const hotelService = {
  async listHotels() {
    await delay();
    return {
      hotels: mockHotels.map(h => ({
        id: h.id,
        name: h.name,
        city: h.city,
        country: h.country,
        description: h.description,
        star_rating: h.star_rating,
      })),
    };
  },

  async createHotel(data: { name: string; city: string; country: string; description?: string; star_rating?: number; amenities?: any }) {
    await delay();
    const id = nextId(mockHotels);
    const hotel = {
      id,
      name: data.name,
      city: data.city,
      country: data.country,
      description: data.description ?? null,
      star_rating: data.star_rating ?? null,
      amenities: data.amenities ?? {},
    };
    mockHotels.push(hotel);
    return { hotel: { id: hotel.id, name: hotel.name, city: hotel.city, country: hotel.country, description: hotel.description, star_rating: hotel.star_rating } };
  },

  async updateHotel(id: number, data: Partial<{ name: string; city: string; country: string; description: string; star_rating: number; amenities: any }>) {
    await delay();
    const idx = mockHotels.findIndex(h => h.id === id);
    if (idx === -1) throw new Error('Hotel not found');
    mockHotels[idx] = { ...mockHotels[idx], ...data };
    const h = mockHotels[idx];
    return { hotel: { id: h.id, name: h.name, city: h.city, country: h.country, description: h.description, star_rating: h.star_rating } };
  },

  async deleteHotel(id: number) {
    await delay();
    mockHotels = mockHotels.filter(h => h.id !== id);
    return { ok: true };
  },

  async searchHotels(query: { name?: string; city?: string; country?: string }) {
    await delay();
    const q = (str?: string) => (str ?? '').toLowerCase();
    const results = mockHotels.filter(h =>
      (!query.name || q(h.name).includes(q(query.name))) &&
      (!query.city || q(h.city).includes(q(query.city))) &&
      (!query.country || q(h.country).includes(q(query.country)))
    );
    return { hotels: results.map(h => ({ id: h.id, name: h.name, city: h.city, country: h.country, description: h.description, star_rating: h.star_rating })) };
  },
};

// --- User Services (in-memory) ---
export const userService = {
  async listUsers() {
    await delay();
    return {
      users: mockUsers.map(u => ({
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        phone: u.phone ?? null,
        role: u.role,
        created_at: u.created_at,
        updated_at: u.updated_at,
      })),
    };
  },

  async createUser(data: { email: string; password: string; full_name: string; phone?: string; role?: 'user' | 'admin' }) {
    await delay();
    const exists = mockUsers.find(u => u.email === data.email);
    if (exists) throw new Error('User already exists');
    const id = nextId(mockUsers);
    const user: MockUser = {
      id,
      email: data.email,
      password: data.password,
      full_name: data.full_name,
      phone: data.phone ?? null,
      role: data.role ?? 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockUsers.push(user);
    return { user: { id: user.id, email: user.email, full_name: user.full_name, phone: user.phone, role: user.role } };
  },

  async updateUser(id: number, data: Partial<{ email: string; password: string; full_name: string; phone?: string; role: 'user'|'admin' }>) {
    await delay();
    const idx = mockUsers.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');
    const updated = { ...mockUsers[idx], ...data, updated_at: new Date().toISOString() } as any;
    if (data.password) updated.password = data.password;
    mockUsers[idx] = updated;
    return { user: { id: updated.id, email: updated.email, full_name: updated.full_name, phone: updated.phone, role: updated.role } };
  },

  async deleteUser(id: number) {
    await delay();
    mockUsers = mockUsers.filter(u => u.id !== id);
    return { ok: true };
  },
};

// --- Booking Services (in-memory) ---
export const bookingService = {
  async getUserBookings(userId: number) {
    await delay();
    const bookings = mockBookings.filter(b => Number(b.userId) === Number(userId));
    return bookings.map((b:any) => ({
      id: b.id,
      userId: String(b.userId),
      type: b.type,
      reference: b.reference,
      date: String(b.date),
      amount: b.amount,
      description: b.description,
      status: b.status,
      paymentStatus: b.paymentStatus,
      metadata: b.metadata || {},
      hotelId: b.hotelId,
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
    await delay();
    const id = (Date.now() + Math.floor(Math.random()*1000)).toString();
    const booking = {
      id,
      userId: data.userId,
      type: data.type,
      reference: data.reference,
      date: data.date,
      amount: data.amount,
      description: data.description,
      status: 'PENDING' as BookingStatus,
      paymentStatus: 'UNPAID' as PaymentStatus,
      metadata: data.metadata || {},
      hotelId: data.hotelId,
    };
    mockBookings.unshift(booking);
    return {
      id: booking.id,
      userId: String(booking.userId),
      type: booking.type,
      reference: booking.reference,
      date: booking.date,
      amount: booking.amount,
      description: booking.description,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      metadata: booking.metadata,
      hotelId: booking.hotelId,
    };
  },

  async updateBookingStatus(id: string, status: BookingStatus) {
    await delay();
    const idx = mockBookings.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Booking not found');
    mockBookings[idx].status = status;
    return {
      id: mockBookings[idx].id,
      userId: String(mockBookings[idx].userId),
      type: mockBookings[idx].type,
      reference: mockBookings[idx].reference,
      date: mockBookings[idx].date,
      amount: mockBookings[idx].amount,
      description: mockBookings[idx].description,
      status: mockBookings[idx].status,
      paymentStatus: mockBookings[idx].paymentStatus,
      metadata: mockBookings[idx].metadata || {},
    };
  },

  async markBookingPaid(id: string) {
    await delay();
    const idx = mockBookings.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Booking not found');
    mockBookings[idx].paymentStatus = 'PAID';
    mockBookings[idx].status = 'COMPLETED';
    return {
      id: mockBookings[idx].id,
      userId: String(mockBookings[idx].userId),
      type: mockBookings[idx].type,
      reference: mockBookings[idx].reference,
      date: mockBookings[idx].date,
      amount: mockBookings[idx].amount,
      description: mockBookings[idx].description,
      status: mockBookings[idx].status,
      paymentStatus: mockBookings[idx].paymentStatus,
      metadata: mockBookings[idx].metadata || {},
    };
  },

  async deleteBooking(id: string) {
    await delay();
    mockBookings = mockBookings.filter(b => b.id !== id);
    return { ok: true };
  },
};

// --- Notification Services (in-memory) ---
export const notificationService = {
  async getNotifications(params: { email?: string; user_id?: number }) {
    await delay();
    let userId: number | undefined = undefined;
    if (params.user_id) userId = params.user_id;
    else if (params.email) {
      const u = mockUsers.find(x => x.email === params.email);
      if (u) userId = u.id;
    }
    const results = mockNotifications
      .filter(n => (userId ? n.userId === userId : true))
      .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return {
      notifications: results.map(n => ({
        id: n.id,
        title: n.title,
        body: n.body,
        is_read: n.is_read ? 1 : 0,
        created_at: n.created_at,
      })),
    };
  },

  async createNotification(userId: number, title: string, body: string) {
    await delay();
    const id = nextId(mockNotifications);
    const notification = { id, userId, title, body, is_read: 0, created_at: new Date().toISOString() };
    mockNotifications.unshift(notification);
    return {
      id: notification.id,
      title: notification.title,
      body: notification.body,
      is_read: 0,
      created_at: notification.created_at,
    };
  },

  async markNotificationRead(id: number) {
    await delay();
    const idx = mockNotifications.findIndex(n => n.id === id);
    if (idx !== -1) mockNotifications[idx].is_read = 1;
    return { ok: true };
  },
};