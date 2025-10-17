// Database Seeding Script
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'aerolux',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Seeding AeroLux database...');
    
    // Check if data already exists
    const existingAirlines = await client.query('SELECT COUNT(*) FROM airlines');
    if (parseInt(existingAirlines.rows[0].count) > 0) {
      console.log('ℹ️  Database already seeded, skipping...');
      return;
    }
    
    // Insert sample airlines
    console.log('✈️  Adding airlines...');
    await client.query(`
      INSERT INTO airlines (name, code, logo_url) VALUES
      ('AeroLux Airlines', 'ALX', 'https://example.com/logos/aerolux.png'),
      ('Air France', 'AF', 'https://example.com/logos/airfrance.png'),
      ('Lufthansa', 'LH', 'https://example.com/logos/lufthansa.png'),
      ('British Airways', 'BA', 'https://example.com/logos/britishairways.png'),
      ('Emirates', 'EK', 'https://example.com/logos/emirates.png'),
      ('Qatar Airways', 'QR', 'https://example.com/logos/qatar.png'),
      ('Singapore Airlines', 'SQ', 'https://example.com/logos/singapore.png'),
      ('Turkish Airlines', 'TK', 'https://example.com/logos/turkish.png')
    `);
    
    // Insert sample airports
    console.log('🏢 Adding airports...');
    await client.query(`
      INSERT INTO airports (name, code, city, country, latitude, longitude) VALUES
      ('O.R. Tambo International Airport', 'JNB', 'Johannesburg', 'South Africa', -26.1337, 28.2423),
      ('Cape Town International Airport', 'CPT', 'Cape Town', 'South Africa', -33.9648, 18.6017),
      ('Charles de Gaulle Airport', 'CDG', 'Paris', 'France', 49.0097, 2.5479),
      ('Heathrow Airport', 'LHR', 'London', 'United Kingdom', 51.4700, -0.4543),
      ('John F. Kennedy International Airport', 'JFK', 'New York', 'United States', 40.6413, -73.7781),
      ('Los Angeles International Airport', 'LAX', 'Los Angeles', 'United States', 33.9416, -118.4085),
      ('Dubai International Airport', 'DXB', 'Dubai', 'United Arab Emirates', 25.2532, 55.3657),
      ('Singapore Changi Airport', 'SIN', 'Singapore', 'Singapore', 1.3644, 103.9915),
      ('Istanbul Airport', 'IST', 'Istanbul', 'Turkey', 41.2753, 28.7519),
      ('Sydney Kingsford Smith Airport', 'SYD', 'Sydney', 'Australia', -33.9399, 151.1753)
    `);
    
    // Insert sample hotels
    console.log('🏨 Adding hotels...');
    await client.query(`
      INSERT INTO hotels (name, description, address, city, country, rating, amenities, images_urls) VALUES
      ('Ocean View Resort', 'Relax and unwind at our luxurious seaside resort with stunning ocean views.', '123 Ocean Drive', 'The Bahamas', 'Bahamas', 5.0, 
       ARRAY['WiFi', 'Pool', 'Spa', 'Restaurant', 'Beach Access', 'Room Service'], 
       ARRAY['https://example.com/hotels/ocean-view-1.jpg', 'https://example.com/hotels/ocean-view-2.jpg']),
      
      ('Grand Hotel Paris', 'Elegant hotel in the heart of Paris with classic French architecture.', '456 Champs-Élysées', 'Paris', 'France', 4.5,
       ARRAY['WiFi', 'Concierge', 'Restaurant', 'Bar', 'Fitness Center', 'Business Center'],
       ARRAY['https://example.com/hotels/grand-paris-1.jpg', 'https://example.com/hotels/grand-paris-2.jpg']),
      
      ('London Business Hotel', 'Modern hotel perfect for business travelers in central London.', '789 Oxford Street', 'London', 'United Kingdom', 4.2,
       ARRAY['WiFi', 'Business Center', 'Fitness Center', 'Restaurant', 'Concierge'],
       ARRAY['https://example.com/hotels/london-business-1.jpg']),
      
      ('New York Skyline Hotel', 'Experience the city that never sleeps from our rooftop bar.', '321 Times Square', 'New York', 'United States', 4.7,
       ARRAY['WiFi', 'Rooftop Bar', 'Fitness Center', 'Spa', 'Room Service', 'Concierge'],
       ARRAY['https://example.com/hotels/ny-skyline-1.jpg', 'https://example.com/hotels/ny-skyline-2.jpg']),
      
      ('Dubai Luxury Resort', 'Ultra-luxurious resort in the heart of Dubai with world-class amenities.', '555 Sheikh Zayed Road', 'Dubai', 'United Arab Emirates', 4.9,
       ARRAY['WiFi', 'Pool', 'Spa', 'Multiple Restaurants', 'Shopping Mall', 'Beach Access', 'Helipad'],
       ARRAY['https://example.com/hotels/dubai-luxury-1.jpg', 'https://example.com/hotels/dubai-luxury-2.jpg'])
    `);
    
    // Insert sample hotel rooms
    console.log('🛏️  Adding hotel rooms...');
    const hotels = await client.query('SELECT id FROM hotels ORDER BY name');
    
    for (let i = 0; i < hotels.rows.length; i++) {
      const hotelId = hotels.rows[i].id;
      const roomTypes = ['Standard', 'Deluxe', 'Suite', 'Presidential'];
      const bedTypes = ['Single', 'Double', 'King', 'Twin'];
      
      for (let j = 0; j < 3; j++) {
        const roomType = roomTypes[j % roomTypes.length];
        const bedType = bedTypes[j % bedTypes.length];
        const basePrice = 100 + (j * 50) + (i * 20);
        
        await client.query(`
          INSERT INTO hotel_rooms (hotel_id, room_type, bed_type, max_occupancy, price_per_night, available_rooms, amenities, images_urls)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          hotelId,
          roomType,
          bedType,
          2 + j,
          basePrice,
          10 - j,
          ARRAY['WiFi', 'Air Conditioning', 'TV', 'Mini Bar'],
          ARRAY[`https://example.com/rooms/hotel-${i}-room-${j}-1.jpg`]
        ]);
      }
    }
    
    // Insert sample flights
    console.log('✈️  Adding flights...');
    const airlines = await client.query('SELECT id FROM airlines');
    const airports = await client.query('SELECT id FROM airports');
    
    const flightRoutes = [
      { from: 0, to: 2, duration: 600 }, // JNB to CDG
      { from: 0, to: 3, duration: 720 }, // JNB to LHR
      { from: 0, to: 4, duration: 900 }, // JNB to JFK
      { from: 2, to: 3, duration: 90 },  // CDG to LHR
      { from: 2, to: 4, duration: 480 }, // CDG to JFK
      { from: 3, to: 4, duration: 420 }, // LHR to JFK
      { from: 4, to: 5, duration: 300 }, // JFK to LAX
      { from: 6, to: 7, duration: 360 }, // DXB to SIN
      { from: 6, to: 8, duration: 180 }, // DXB to IST
      { from: 7, to: 9, duration: 480 }  // SIN to SYD
    ];
    
    for (let i = 0; i < 20; i++) {
      const route = flightRoutes[i % flightRoutes.length];
      const airline = airlines.rows[i % airlines.rows.length];
      const departureTime = new Date();
      departureTime.setDate(departureTime.getDate() + i);
      departureTime.setHours(6 + (i % 12), (i * 30) % 60, 0, 0);
      
      const arrivalTime = new Date(departureTime);
      arrivalTime.setMinutes(arrivalTime.getMinutes() + route.duration);
      
      const basePrice = 200 + (i * 50);
      
      await client.query(`
        INSERT INTO flights (
          flight_number, airline_id, departure_airport_id, arrival_airport_id,
          departure_time, arrival_time, duration_minutes, price_economy,
          price_business, price_first_class, available_seats_economy,
          available_seats_business, available_seats_first_class
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        `FL${String(i + 1000).padStart(4, '0')}`,
        airline.id,
        airports.rows[route.from].id,
        airports.rows[route.to].id,
        departureTime,
        arrivalTime,
        route.duration,
        basePrice,
        basePrice * 2,
        basePrice * 4,
        50,
        20,
        10
      ]);
    }
    
    // Insert sample admin user
    console.log('👤 Adding admin user...');
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await client.query(`
      INSERT INTO users (name, email, phone, date_of_birth, id_or_passport, role, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      'Admin User',
      'admin@aerolux.com',
      '+1 555 0123',
      '1990-01-01',
      'AD123456',
      'admin',
      hashedPassword
    ]);
    
    // Insert sample regular user
    console.log('👤 Adding sample user...');
    const userPassword = await bcrypt.hash('user123', 10);
    
    await client.query(`
      INSERT INTO users (name, email, phone, date_of_birth, id_or_passport, role, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      'John Doe',
      'john@example.com',
      '+1 555 0456',
      '1985-05-15',
      'US987654',
      'user',
      userPassword
    ]);
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('📋 Sample data includes:');
    console.log('   - 8 Airlines');
    console.log('   - 10 Airports');
    console.log('   - 5 Hotels with 15 rooms');
    console.log('   - 20 Flights');
    console.log('   - 2 Users (admin@aerolux.com / user123, john@example.com / user123)');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  } finally {
    await client.release();
    await pool.end();
  }
}

// Run seeding
seedDatabase().catch(console.error);