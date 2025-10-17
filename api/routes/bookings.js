// Booking Management API Routes
const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'aerolux',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Middleware for JWT authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware for admin authorization
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Generate unique reference number
const generateReferenceNumber = (type) => {
  const prefix = type === 'flight' ? 'FL' : 'HT';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
};

// GET /api/bookings - Get user's bookings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, booking_type } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT b.*, 
             CASE 
               WHEN b.booking_type = 'flight' THEN 
                 CONCAT(f.flight_number, ' - ', a1.city, ' to ', a2.city)
               WHEN b.booking_type = 'hotel' THEN 
                 CONCAT(h.name, ' - ', h.city)
             END as booking_description
      FROM bookings b
      LEFT JOIN flight_bookings fb ON b.id = fb.booking_id
      LEFT JOIN hotel_bookings hb ON b.id = hb.booking_id
      LEFT JOIN flights f ON fb.flight_id = f.id
      LEFT JOIN hotels h ON hb.hotel_id = h.id
      LEFT JOIN airports a1 ON f.departure_airport_id = a1.id
      LEFT JOIN airports a2 ON f.arrival_airport_id = a2.id
      WHERE b.user_id = $1
    `;
    
    let params = [req.user.id];
    let paramCount = 1;
    
    if (status) {
      paramCount++;
      query += ` AND b.status = $${paramCount}`;
      params.push(status);
    }
    
    if (booking_type) {
      paramCount++;
      query += ` AND b.booking_type = $${paramCount}`;
      params.push(booking_type);
    }
    
    query += ` ORDER BY b.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM bookings WHERE user_id = $1';
    let countParams = [req.user.id];
    let countParamCount = 1;
    
    if (status) {
      countQuery += ` AND status = $${++countParamCount}`;
      countParams.push(status);
    }
    
    if (booking_type) {
      countQuery += ` AND booking_type = $${++countParamCount}`;
      countParams.push(booking_type);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    
    res.json({
      bookings: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/bookings/:id - Get booking details
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT b.*, 
             CASE 
               WHEN b.booking_type = 'flight' THEN 
                 json_build_object(
                   'flight_number', f.flight_number,
                   'airline', al.name,
                   'departure_airport', a1.name,
                   'departure_city', a1.city,
                   'arrival_airport', a2.name,
                   'arrival_city', a2.city,
                   'departure_time', f.departure_time,
                   'arrival_time', f.arrival_time,
                   'passenger_name', fb.passenger_name,
                   'passenger_email', fb.passenger_email,
                   'seat_class', fb.seat_class,
                   'seat_number', fb.seat_number
                 )
               WHEN b.booking_type = 'hotel' THEN 
                 json_build_object(
                   'hotel_name', h.name,
                   'hotel_address', h.address,
                   'hotel_city', h.city,
                   'room_type', hr.room_type,
                   'bed_type', hr.bed_type,
                   'guest_name', hb.guest_name,
                   'guest_email', hb.guest_email,
                   'check_in_date', hb.check_in_date,
                   'check_out_date', hb.check_out_date,
                   'number_of_guests', hb.number_of_guests
                 )
             END as booking_details
      FROM bookings b
      LEFT JOIN flight_bookings fb ON b.id = fb.booking_id
      LEFT JOIN hotel_bookings hb ON b.id = hb.booking_id
      LEFT JOIN flights f ON fb.flight_id = f.id
      LEFT JOIN hotels h ON hb.hotel_id = h.id
      LEFT JOIN hotel_rooms hr ON hb.room_id = hr.id
      LEFT JOIN airlines al ON f.airline_id = al.id
      LEFT JOIN airports a1 ON f.departure_airport_id = a1.id
      LEFT JOIN airports a2 ON f.arrival_airport_id = a2.id
      WHERE b.id = $1 AND b.user_id = $2
    `, [id, req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/bookings/flight - Create flight booking
router.post('/flight', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      flight_id,
      passenger_name,
      passenger_email,
      seat_class,
      seat_number,
      special_requests
    } = req.body;
    
    // Validate required fields
    if (!flight_id || !passenger_name || !passenger_email || !seat_class) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    
    // Get flight details and check availability
    const flightResult = await client.query(`
      SELECT f.*, 
             CASE 
               WHEN $1 = 'economy' THEN f.available_seats_economy
               WHEN $1 = 'business' THEN f.available_seats_business
               WHEN $1 = 'first_class' THEN f.available_seats_first_class
             END as available_seats,
             CASE 
               WHEN $1 = 'economy' THEN f.price_economy
               WHEN $1 = 'business' THEN f.price_business
               WHEN $1 = 'first_class' THEN f.price_first_class
             END as price
      FROM flights f
      WHERE f.id = $2 AND f.is_active = true
    `, [seat_class, flight_id]);
    
    if (flightResult.rows.length === 0) {
      return res.status(404).json({ error: 'Flight not found' });
    }
    
    const flight = flightResult.rows[0];
    
    if (flight.available_seats < 1) {
      return res.status(400).json({ error: 'No seats available' });
    }
    
    // Create booking
    const referenceNumber = generateReferenceNumber('flight');
    const bookingResult = await client.query(`
      INSERT INTO bookings (user_id, booking_type, reference_number, status, total_amount, travel_date)
      VALUES ($1, 'flight', $2, 'pending', $3, $4)
      RETURNING *
    `, [req.user.id, referenceNumber, flight.price, flight.departure_time]);
    
    const booking = bookingResult.rows[0];
    
    // Create flight booking details
    await client.query(`
      INSERT INTO flight_bookings (booking_id, flight_id, passenger_name, passenger_email, seat_class, seat_number, special_requests)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [booking.id, flight_id, passenger_name, passenger_email, seat_class, seat_number, special_requests]);
    
    // Update available seats
    const seatUpdateField = `available_seats_${seat_class}`;
    await client.query(`
      UPDATE flights 
      SET ${seatUpdateField} = ${seatUpdateField} - 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [flight_id]);
    
    await client.query('COMMIT');
    
    res.status(201).json({
      booking: booking,
      flight_details: flight
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating flight booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// POST /api/bookings/hotel - Create hotel booking
router.post('/hotel', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      hotel_id,
      room_id,
      guest_name,
      guest_email,
      check_in_date,
      check_out_date,
      number_of_guests,
      special_requests
    } = req.body;
    
    // Validate required fields
    if (!hotel_id || !room_id || !guest_name || !guest_email || !check_in_date || !check_out_date) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    
    // Get room details and check availability
    const roomResult = await client.query(`
      SELECT hr.*, h.name as hotel_name
      FROM hotel_rooms hr
      JOIN hotels h ON hr.hotel_id = h.id
      WHERE hr.id = $1 AND hr.hotel_id = $2 AND hr.is_active = true AND h.is_active = true
    `, [room_id, hotel_id]);
    
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    const room = roomResult.rows[0];
    
    if (room.available_rooms < 1) {
      return res.status(400).json({ error: 'No rooms available' });
    }
    
    // Calculate total amount
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalAmount = room.price_per_night * nights;
    
    // Create booking
    const referenceNumber = generateReferenceNumber('hotel');
    const bookingResult = await client.query(`
      INSERT INTO bookings (user_id, booking_type, reference_number, status, total_amount, travel_date)
      VALUES ($1, 'hotel', $2, 'pending', $3, $4)
      RETURNING *
    `, [req.user.id, referenceNumber, totalAmount, check_in_date]);
    
    const booking = bookingResult.rows[0];
    
    // Create hotel booking details
    await client.query(`
      INSERT INTO hotel_bookings (booking_id, hotel_id, room_id, guest_name, guest_email, check_in_date, check_out_date, number_of_guests, special_requests)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [booking.id, hotel_id, room_id, guest_name, guest_email, check_in_date, check_out_date, number_of_guests, special_requests]);
    
    // Update available rooms
    await client.query(`
      UPDATE hotel_rooms 
      SET available_rooms = available_rooms - 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [room_id]);
    
    await client.query('COMMIT');
    
    res.status(201).json({
      booking: booking,
      hotel_details: room,
      nights: nights
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating hotel booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// PUT /api/bookings/:id/status - Update booking status (admin only)
router.put('/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const result = await pool.query(`
      UPDATE bookings 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/bookings/:id - Cancel booking
router.delete('/:id', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    
    // Get booking details
    const bookingResult = await client.query(`
      SELECT b.*, b.booking_type
      FROM bookings b
      WHERE b.id = $1 AND b.user_id = $2
    `, [id, req.user.id]);
    
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const booking = bookingResult.rows[0];
    
    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking already cancelled' });
    }
    
    // Update booking status
    await client.query(`
      UPDATE bookings 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [id]);
    
    // Restore availability
    if (booking.booking_type === 'flight') {
      const flightBookingResult = await client.query(`
        SELECT fb.seat_class, f.id as flight_id
        FROM flight_bookings fb
        JOIN flights f ON fb.flight_id = f.id
        WHERE fb.booking_id = $1
      `, [id]);
      
      if (flightBookingResult.rows.length > 0) {
        const fb = flightBookingResult.rows[0];
        const seatUpdateField = `available_seats_${fb.seat_class}`;
        await client.query(`
          UPDATE flights 
          SET ${seatUpdateField} = ${seatUpdateField} + 1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [fb.flight_id]);
      }
    } else if (booking.booking_type === 'hotel') {
      const hotelBookingResult = await client.query(`
        SELECT hb.room_id
        FROM hotel_bookings hb
        WHERE hb.booking_id = $1
      `, [id]);
      
      if (hotelBookingResult.rows.length > 0) {
        const hb = hotelBookingResult.rows[0];
        await client.query(`
          UPDATE hotel_rooms 
          SET available_rooms = available_rooms + 1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
        `, [hb.room_id]);
      }
    }
    
    await client.query('COMMIT');
    
    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// GET /api/bookings/admin/all - Get all bookings (admin only)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, booking_type } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT b.*, u.name as user_name, u.email as user_email,
             CASE 
               WHEN b.booking_type = 'flight' THEN 
                 CONCAT(f.flight_number, ' - ', a1.city, ' to ', a2.city)
               WHEN b.booking_type = 'hotel' THEN 
                 CONCAT(h.name, ' - ', h.city)
             END as booking_description
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN flight_bookings fb ON b.id = fb.booking_id
      LEFT JOIN hotel_bookings hb ON b.id = hb.booking_id
      LEFT JOIN flights f ON fb.flight_id = f.id
      LEFT JOIN hotels h ON hb.hotel_id = h.id
      LEFT JOIN airports a1 ON f.departure_airport_id = a1.id
      LEFT JOIN airports a2 ON f.arrival_airport_id = a2.id
      WHERE 1=1
    `;
    
    let params = [];
    let paramCount = 0;
    
    if (status) {
      paramCount++;
      query += ` AND b.status = $${paramCount}`;
      params.push(status);
    }
    
    if (booking_type) {
      paramCount++;
      query += ` AND b.booking_type = $${paramCount}`;
      params.push(booking_type);
    }
    
    query += ` ORDER BY b.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM bookings b JOIN users u ON b.user_id = u.id WHERE 1=1';
    let countParams = [];
    let countParamCount = 0;
    
    if (status) {
      countQuery += ` AND b.status = $${++countParamCount}`;
      countParams.push(status);
    }
    
    if (booking_type) {
      countQuery += ` AND b.booking_type = $${++countParamCount}`;
      countParams.push(booking_type);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    
    res.json({
      bookings: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching all bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;