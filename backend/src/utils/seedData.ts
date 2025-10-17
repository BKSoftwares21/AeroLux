import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import Flight from '../models/Flight';
import Hotel from '../models/Hotel';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aerolux';

const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    phone: '+1234567890',
    dateOfBirth: new Date('1990-01-15'),
    idOrPassport: 'A1234567',
    role: 'user',
    isEmailVerified: true
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    phone: '+1234567891',
    dateOfBirth: new Date('1985-05-20'),
    idOrPassport: 'B7654321',
    role: 'user',
    isEmailVerified: true
  },
  {
    name: 'Admin User',
    email: 'admin@aerolux.com',
    password: 'admin123456',
    phone: '+1234567892',
    dateOfBirth: new Date('1980-03-10'),
    idOrPassport: 'C9876543',
    role: 'admin',
    isEmailVerified: true
  }
];

const sampleFlights = [
  {
    flightNumber: 'ALX101',
    airline: 'AeroLux Airlines',
    departure: {
      city: 'New York',
      airport: 'John F. Kennedy International Airport',
      code: 'JFK'
    },
    arrival: {
      city: 'London',
      airport: 'Heathrow Airport',
      code: 'LHR'
    },
    date: new Date('2024-12-25'),
    time: '14:30',
    duration: 480, // 8 hours
    price: 899,
    class: 'economy',
    availableSeats: 150,
    totalSeats: 200,
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500',
    isActive: true
  },
  {
    flightNumber: 'ALX102',
    airline: 'AeroLux Airlines',
    departure: {
      city: 'London',
      airport: 'Heathrow Airport',
      code: 'LHR'
    },
    arrival: {
      city: 'Paris',
      airport: 'Charles de Gaulle Airport',
      code: 'CDG'
    },
    date: new Date('2024-12-26'),
    time: '09:15',
    duration: 90, // 1.5 hours
    price: 299,
    class: 'economy',
    availableSeats: 80,
    totalSeats: 100,
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500',
    isActive: true
  },
  {
    flightNumber: 'ALX103',
    airline: 'AeroLux Airlines',
    departure: {
      city: 'Paris',
      airport: 'Charles de Gaulle Airport',
      code: 'CDG'
    },
    arrival: {
      city: 'Tokyo',
      airport: 'Narita International Airport',
      code: 'NRT'
    },
    date: new Date('2024-12-27'),
    time: '16:45',
    duration: 720, // 12 hours
    price: 1299,
    class: 'business',
    availableSeats: 20,
    totalSeats: 30,
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500',
    isActive: true
  },
  {
    flightNumber: 'ALX104',
    airline: 'AeroLux Airlines',
    departure: {
      city: 'Tokyo',
      airport: 'Narita International Airport',
      code: 'NRT'
    },
    arrival: {
      city: 'Sydney',
      airport: 'Kingsford Smith Airport',
      code: 'SYD'
    },
    date: new Date('2024-12-28'),
    time: '11:20',
    duration: 600, // 10 hours
    price: 1599,
    class: 'first',
    availableSeats: 8,
    totalSeats: 12,
    imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=500',
    isActive: true
  }
];

const sampleHotels = [
  {
    name: 'Grand Plaza Hotel',
    location: {
      city: 'New York',
      country: 'United States',
      address: '123 Broadway, New York, NY 10001'
    },
    description: 'Luxurious hotel in the heart of Manhattan with stunning city views and world-class amenities.',
    pricePerNight: 299,
    rating: 4.5,
    amenities: ['WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Room Service'],
    bedType: 'King',
    roomType: 'Deluxe Suite',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500',
    isActive: true
  },
  {
    name: 'Riverside Manor',
    location: {
      city: 'London',
      country: 'United Kingdom',
      address: '456 Thames Street, London SW1A 1AA'
    },
    description: 'Elegant hotel overlooking the River Thames with traditional British charm and modern comforts.',
    pricePerNight: 199,
    rating: 4.2,
    amenities: ['WiFi', 'Breakfast', 'Bar', 'Concierge', 'Laundry'],
    bedType: 'Queen',
    roomType: 'Standard Room',
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500',
    isActive: true
  },
  {
    name: 'Château de Paris',
    location: {
      city: 'Paris',
      country: 'France',
      address: '789 Champs-Élysées, 75008 Paris'
    },
    description: 'Boutique hotel near the Eiffel Tower offering authentic Parisian experience with luxury amenities.',
    pricePerNight: 399,
    rating: 4.8,
    amenities: ['WiFi', 'Spa', 'Restaurant', 'Bar', 'Concierge', 'Valet Parking'],
    bedType: 'King',
    roomType: 'Executive Suite',
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500',
    isActive: true
  },
  {
    name: 'Tokyo Garden Hotel',
    location: {
      city: 'Tokyo',
      country: 'Japan',
      address: '321 Shibuya Crossing, Shibuya, Tokyo 150-0002'
    },
    description: 'Modern hotel in the vibrant Shibuya district with traditional Japanese hospitality and contemporary design.',
    pricePerNight: 249,
    rating: 4.6,
    amenities: ['WiFi', 'Onsen', 'Restaurant', 'Karaoke', 'Business Center'],
    bedType: 'Twin',
    roomType: 'Superior Room',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500',
    isActive: true
  },
  {
    name: 'Sydney Harbour Resort',
    location: {
      city: 'Sydney',
      country: 'Australia',
      address: '654 Circular Quay, Sydney NSW 2000'
    },
    description: 'Waterfront resort with breathtaking views of the Sydney Opera House and Harbour Bridge.',
    pricePerNight: 349,
    rating: 4.7,
    amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant', 'Bar', 'Water Sports'],
    bedType: 'King',
    roomType: 'Ocean View Suite',
    imageUrl: 'https://images.unsplash.com/photo-1520637836862-4d197d17c0a4?w=500',
    isActive: true
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Flight.deleteMany({});
    await Hotel.deleteMany({});
    console.log('Cleared existing data');

    // Hash passwords for users
    const hashedUsers = await Promise.all(
      sampleUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12)
      }))
    );

    // Create users
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`Created ${createdUsers.length} users`);

    // Create flights
    const createdFlights = await Flight.insertMany(sampleFlights);
    console.log(`Created ${createdFlights.length} flights`);

    // Create hotels
    const createdHotels = await Hotel.insertMany(sampleHotels);
    console.log(`Created ${createdHotels.length} hotels`);

    console.log('Database seeded successfully!');
    console.log('\nSample login credentials:');
    console.log('User: john@example.com / password123');
    console.log('User: jane@example.com / password123');
    console.log('Admin: admin@aerolux.com / admin123456');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase;