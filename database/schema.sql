-- AeroLux Travel Booking App Database Schema
-- This schema supports flight bookings, hotel bookings, user management, and admin functionality

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    id_or_passport VARCHAR(50),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    profile_image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Airlines table
CREATE TABLE airlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Airports table
CREATE TABLE airports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Flights table
CREATE TABLE flights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flight_number VARCHAR(20) NOT NULL,
    airline_id UUID REFERENCES airlines(id),
    departure_airport_id UUID REFERENCES airports(id),
    arrival_airport_id UUID REFERENCES airports(id),
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL,
    price_economy DECIMAL(10, 2) NOT NULL,
    price_business DECIMAL(10, 2),
    price_first_class DECIMAL(10, 2),
    available_seats_economy INTEGER DEFAULT 0,
    available_seats_business INTEGER DEFAULT 0,
    available_seats_first_class INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hotels table
CREATE TABLE hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    rating DECIMAL(2, 1) CHECK (rating >= 0 AND rating <= 5),
    amenities TEXT[], -- Array of amenities
    images_urls TEXT[], -- Array of image URLs
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hotel rooms table
CREATE TABLE hotel_rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hotel_id UUID REFERENCES hotels(id),
    room_type VARCHAR(100) NOT NULL, -- e.g., "Standard", "Deluxe", "Suite"
    bed_type VARCHAR(50) NOT NULL, -- e.g., "Single", "Double", "King"
    max_occupancy INTEGER NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    available_rooms INTEGER DEFAULT 0,
    amenities TEXT[], -- Room-specific amenities
    images_urls TEXT[], -- Room-specific images
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table (for both flights and hotels)
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    booking_type VARCHAR(20) NOT NULL CHECK (booking_type IN ('flight', 'hotel')),
    reference_number VARCHAR(20) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    total_amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    booking_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    travel_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Flight bookings details
CREATE TABLE flight_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id),
    flight_id UUID REFERENCES flights(id),
    passenger_name VARCHAR(255) NOT NULL,
    passenger_email VARCHAR(255) NOT NULL,
    seat_class VARCHAR(20) NOT NULL CHECK (seat_class IN ('economy', 'business', 'first_class')),
    seat_number VARCHAR(10),
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hotel bookings details
CREATE TABLE hotel_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id),
    hotel_id UUID REFERENCES hotels(id),
    room_id UUID REFERENCES hotel_rooms(id),
    guest_name VARCHAR(255) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    number_of_guests INTEGER NOT NULL,
    special_requests TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(50) NOT NULL, -- e.g., 'credit_card', 'debit_card', 'paypal'
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_id VARCHAR(255),
    payment_date TIMESTAMP WITH TIME ZONE,
    refund_amount DECIMAL(10, 2) DEFAULT 0,
    refund_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- e.g., 'booking_confirmation', 'payment_success', 'flight_reminder'
    is_read BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User sessions table (for authentication)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    device_info TEXT,
    ip_address INET,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_flights_departure_time ON flights(departure_time);
CREATE INDEX idx_flights_airline_id ON flights(airline_id);
CREATE INDEX idx_flights_departure_airport ON flights(departure_airport_id);
CREATE INDEX idx_flights_arrival_airport ON flights(arrival_airport_id);
CREATE INDEX idx_hotels_city ON hotels(city);
CREATE INDEX idx_hotels_country ON hotels(country);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_booking_type ON bookings(booking_type);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_flights_updated_at BEFORE UPDATE ON flights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON hotels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hotel_rooms_updated_at BEFORE UPDATE ON hotel_rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO airlines (name, code, logo_url) VALUES
('AeroLux Airlines', 'ALX', 'https://example.com/logos/aerolux.png'),
('Air France', 'AF', 'https://example.com/logos/airfrance.png'),
('Lufthansa', 'LH', 'https://example.com/logos/lufthansa.png'),
('British Airways', 'BA', 'https://example.com/logos/britishairways.png');

INSERT INTO airports (name, code, city, country, latitude, longitude) VALUES
('O.R. Tambo International Airport', 'JNB', 'Johannesburg', 'South Africa', -26.1337, 28.2423),
('Charles de Gaulle Airport', 'CDG', 'Paris', 'France', 49.0097, 2.5479),
('Heathrow Airport', 'LHR', 'London', 'United Kingdom', 51.4700, -0.4543),
('John F. Kennedy International Airport', 'JFK', 'New York', 'United States', 40.6413, -73.7781);

INSERT INTO hotels (name, description, address, city, country, rating, amenities, images_urls) VALUES
('Ocean View Resort', 'Relax and unwind at our luxurious seaside resort with stunning ocean views.', '123 Ocean Drive', 'The Bahamas', 'Bahamas', 5.0, 
 ARRAY['WiFi', 'Pool', 'Spa', 'Restaurant', 'Beach Access'], 
 ARRAY['https://example.com/hotels/ocean-view-1.jpg', 'https://example.com/hotels/ocean-view-2.jpg']),
('Grand Hotel Paris', 'Elegant hotel in the heart of Paris with classic French architecture.', '456 Champs-Élysées', 'Paris', 'France', 4.5,
 ARRAY['WiFi', 'Concierge', 'Restaurant', 'Bar', 'Fitness Center'],
 ARRAY['https://example.com/hotels/grand-paris-1.jpg', 'https://example.com/hotels/grand-paris-2.jpg']);

INSERT INTO hotel_rooms (hotel_id, room_type, bed_type, max_occupancy, price_per_night, available_rooms, amenities) VALUES
((SELECT id FROM hotels WHERE name = 'Ocean View Resort'), 'Deluxe Suite', 'King', 2, 300.00, 10, ARRAY['Ocean View', 'Mini Bar', 'Room Service']),
((SELECT id FROM hotels WHERE name = 'Grand Hotel Paris'), 'Standard Room', 'Double', 2, 150.00, 20, ARRAY['City View', 'WiFi', 'Air Conditioning']);