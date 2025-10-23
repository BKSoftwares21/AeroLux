import { PrismaClient } from '../app/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.hotel.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@aerolux.com',
      password: hashedPassword,
      fullName: 'Admin User',
      phone: '+1234567890',
      role: 'ADMIN',
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: hashedPassword,
      fullName: 'John Doe',
      phone: '+1987654321',
      role: 'USER',
    },
  });

  // Create hotels
  const hotels = await Promise.all([
    prisma.hotel.create({
      data: {
        name: 'Grand Luxury Hotel Paris',
        city: 'Paris',
        country: 'France',
        description: 'A beautiful luxury hotel in the heart of Paris',
        starRating: 5,
        amenities: {
          wifi: true,
          pool: true,
          spa: true,
          gym: true,
          restaurant: true,
        },
      },
    }),
    prisma.hotel.create({
      data: {
        name: 'New York Plaza',
        city: 'New York',
        country: 'USA',
        description: 'Iconic hotel in Manhattan',
        starRating: 4,
        amenities: {
          wifi: true,
          pool: false,
          spa: true,
          gym: true,
          restaurant: true,
        },
      },
    }),
    prisma.hotel.create({
      data: {
        name: 'Tokyo Gardens Resort',
        city: 'Tokyo',
        country: 'Japan',
        description: 'Modern resort with traditional Japanese elements',
        starRating: 5,
        amenities: {
          wifi: true,
          pool: true,
          spa: true,
          gym: true,
          restaurant: true,
        },
      },
    }),
  ]);

  // Create bookings
  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        userId: regularUser.id,
        type: 'FLIGHT',
        reference: 'FL123456',
        date: new Date('2025-12-01'),
        amount: 299.99,
        description: 'Flight to Paris',
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        metadata: {
          departure: 'JFK',
          arrival: 'CDG',
          class: 'economy',
        },
      },
    }),
    prisma.booking.create({
      data: {
        userId: regularUser.id,
        type: 'HOTEL',
        reference: 'HT789012',
        date: new Date('2025-12-02'),
        amount: 450.00,
        description: 'Hotel booking in Paris',
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        hotelId: hotels[0].id,
        metadata: {
          nights: 3,
          rooms: 1,
          guests: 2,
        },
      },
    }),
    prisma.booking.create({
      data: {
        userId: regularUser.id,
        type: 'FLIGHT',
        reference: 'FL345678',
        date: new Date('2025-11-15'),
        amount: 599.99,
        description: 'Flight to Tokyo',
        status: 'PENDING',
        paymentStatus: 'UNPAID',
        metadata: {
          departure: 'LAX',
          arrival: 'NRT',
          class: 'business',
        },
      },
    }),
  ]);

  // Create notifications
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: regularUser.id,
        title: 'Booking Confirmed',
        body: 'Your hotel booking in Paris has been confirmed!',
        isRead: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: regularUser.id,
        title: 'Payment Reminder',
        body: 'Don\'t forget to complete payment for your Tokyo flight.',
        isRead: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: adminUser.id,
        title: 'System Update',
        body: 'The booking system has been updated successfully.',
        isRead: true,
      },
    }),
  ]);

  console.log('✅ Database seeded successfully!');
  console.log(`👤 Admin user: admin@aerolux.com / password123`);
  console.log(`👤 Regular user: user@example.com / password123`);
  console.log(`🏨 Created ${hotels.length} hotels`);
  console.log(`📋 Created ${bookings.length} bookings`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });