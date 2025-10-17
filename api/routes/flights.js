// Flight Management API Routes
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

// GET /api/flights - Search flights
router.get('/', async (req, res) => {
  try {
    const { 
      departure_airport, 
      arrival_airport, 
      departure_date, 
      return_date,
      passengers = 1,
      class: seatClass = 'economy',
      page = 1,
      limit = 10
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT f.*, 
             a1.name as departure_airport_name, a1.code as departure_airport_code, a1.city as departure_city,
             a2.name as arrival_airport_name, a2.code as arrival_airport_code, a2.city as arrival_city,
             al.name as airline_name, al.code as airline_code, al.logo_url as airline_logo
      FROM flights f
      JOIN airports a1 ON f.departure_airport_id = a1.id
      JOIN airports a2 ON f.arrival_airport_id = a2.id
      JOIN airlines al ON f.airline_id = al.id
      WHERE f.is_active = true
    `;
    
    let params = [];
    let paramCount = 0;
    
    if (departure_airport) {
      paramCount++;
      query += ` AND a1.code = $${paramCount}`;
      params.push(departure_airport);
    }
    
    if (arrival_airport) {
      paramCount++;
      query += ` AND a2.code = $${paramCount}`;
      params.push(arrival_airport);
    }
    
    if (departure_date) {
      paramCount++;
      query += ` AND DATE(f.departure_time) = $${paramCount}`;
      params.push(departure_date);
    }
    
    // Add seat availability check
    if (seatClass === 'economy') {
      query += ` AND f.available_seats_economy >= $${++paramCount}`;
      params.push(passengers);
    } else if (seatClass === 'business') {
      query += ` AND f.available_seats_business >= $${++paramCount}`;
      params.push(passengers);
    } else if (seatClass === 'first_class') {
      query += ` AND f.available_seats_first_class >= $${++paramCount}`;
      params.push(passengers);
    }
    
    query += ` ORDER BY f.departure_time LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) 
      FROM flights f
      JOIN airports a1 ON f.departure_airport_id = a1.id
      JOIN airports a2 ON f.arrival_airport_id = a2.id
      WHERE f.is_active = true
    `;
    
    let countParams = [];
    let countParamCount = 0;
    
    if (departure_airport) {
      countQuery += ` AND a1.code = $${++countParamCount}`;
      countParams.push(departure_airport);
    }
    
    if (arrival_airport) {
      countQuery += ` AND a2.code = $${++countParamCount}`;
      countParams.push(arrival_airport);
    }
    
    if (departure_date) {
      countQuery += ` AND DATE(f.departure_time) = $${++countParamCount}`;
      countParams.push(departure_date);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    
    res.json({
      flights: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Error searching flights:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/flights/:id - Get flight details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT f.*, 
             a1.name as departure_airport_name, a1.code as departure_airport_code, a1.city as departure_city, a1.country as departure_country,
             a2.name as arrival_airport_name, a2.code as arrival_airport_code, a2.city as arrival_city, a2.country as arrival_country,
             al.name as airline_name, al.code as airline_code, al.logo_url as airline_logo
      FROM flights f
      JOIN airports a1 ON f.departure_airport_id = a1.id
      JOIN airports a2 ON f.arrival_airport_id = a2.id
      JOIN airlines al ON f.airline_id = al.id
      WHERE f.id = $1 AND f.is_active = true
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Flight not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching flight:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/flights - Create flight (admin only)
router.post('/', async (req, res) => {
  try {
    const {
      flight_number,
      airline_id,
      departure_airport_id,
      arrival_airport_id,
      departure_time,
      arrival_time,
      duration_minutes,
      price_economy,
      price_business,
      price_first_class,
      available_seats_economy,
      available_seats_business,
      available_seats_first_class
    } = req.body;
    
    // Validate required fields
    if (!flight_number || !airline_id || !departure_airport_id || !arrival_airport_id || 
        !departure_time || !arrival_time || !duration_minutes || !price_economy) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    
    const result = await pool.query(`
      INSERT INTO flights (
        flight_number, airline_id, departure_airport_id, arrival_airport_id,
        departure_time, arrival_time, duration_minutes, price_economy,
        price_business, price_first_class, available_seats_economy,
        available_seats_business, available_seats_first_class
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      flight_number, airline_id, departure_airport_id, arrival_airport_id,
      departure_time, arrival_time, duration_minutes, price_economy,
      price_business, price_first_class, available_seats_economy,
      available_seats_business, available_seats_first_class
    ]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating flight:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/flights/:id - Update flight (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      flight_number,
      departure_time,
      arrival_time,
      duration_minutes,
      price_economy,
      price_business,
      price_first_class,
      available_seats_economy,
      available_seats_business,
      available_seats_first_class,
      is_active
    } = req.body;
    
    const result = await pool.query(`
      UPDATE flights 
      SET flight_number = COALESCE($1, flight_number),
          departure_time = COALESCE($2, departure_time),
          arrival_time = COALESCE($3, arrival_time),
          duration_minutes = COALESCE($4, duration_minutes),
          price_economy = COALESCE($5, price_economy),
          price_business = COALESCE($6, price_business),
          price_first_class = COALESCE($7, price_first_class),
          available_seats_economy = COALESCE($8, available_seats_economy),
          available_seats_business = COALESCE($9, available_seats_business),
          available_seats_first_class = COALESCE($10, available_seats_first_class),
          is_active = COALESCE($11, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *
    `, [
      flight_number, departure_time, arrival_time, duration_minutes,
      price_economy, price_business, price_first_class,
      available_seats_economy, available_seats_business, available_seats_first_class,
      is_active, id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Flight not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating flight:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/flights/:id - Delete flight (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE flights SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Flight not found' });
    }
    
    res.json({ message: 'Flight deactivated successfully' });
  } catch (error) {
    console.error('Error deleting flight:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/flights/airports - Get all airports
router.get('/airports', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, code, city, country, latitude, longitude
      FROM airports 
      WHERE is_active = true
      ORDER BY city, name
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching airports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/flights/airlines - Get all airlines
router.get('/airlines', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, code, logo_url
      FROM airlines 
      WHERE is_active = true
      ORDER BY name
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching airlines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;