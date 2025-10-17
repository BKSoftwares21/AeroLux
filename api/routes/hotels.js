// Hotel Management API Routes
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

// GET /api/hotels - Search hotels
router.get('/', async (req, res) => {
  try {
    const { 
      city, 
      country, 
      check_in_date, 
      check_out_date,
      guests = 1,
      min_rating,
      max_price,
      amenities,
      page = 1,
      limit = 10
    } = req.query;
    
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT h.*, 
             COALESCE(MIN(hr.price_per_night), 0) as min_price,
             COALESCE(MAX(hr.price_per_night), 0) as max_price,
             COALESCE(SUM(hr.available_rooms), 0) as total_available_rooms
      FROM hotels h
      LEFT JOIN hotel_rooms hr ON h.id = hr.hotel_id AND hr.is_active = true
      WHERE h.is_active = true
    `;
    
    let params = [];
    let paramCount = 0;
    
    if (city) {
      paramCount++;
      query += ` AND h.city ILIKE $${paramCount}`;
      params.push(`%${city}%`);
    }
    
    if (country) {
      paramCount++;
      query += ` AND h.country ILIKE $${paramCount}`;
      params.push(`%${country}%`);
    }
    
    if (min_rating) {
      paramCount++;
      query += ` AND h.rating >= $${paramCount}`;
      params.push(min_rating);
    }
    
    if (max_price) {
      paramCount++;
      query += ` AND EXISTS (
        SELECT 1 FROM hotel_rooms hr2 
        WHERE hr2.hotel_id = h.id 
        AND hr2.is_active = true 
        AND hr2.price_per_night <= $${paramCount}
      )`;
      params.push(max_price);
    }
    
    if (amenities) {
      const amenityList = amenities.split(',').map(a => a.trim());
      paramCount++;
      query += ` AND h.amenities && $${paramCount}`;
      params.push(amenityList);
    }
    
    query += ` GROUP BY h.id, h.name, h.description, h.address, h.city, h.country, 
               h.latitude, h.longitude, h.rating, h.amenities, h.images_urls, 
               h.is_active, h.created_at, h.updated_at`;
    
    query += ` ORDER BY h.rating DESC, min_price ASC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(DISTINCT h.id) FROM hotels h WHERE h.is_active = true';
    let countParams = [];
    let countParamCount = 0;
    
    if (city) {
      countQuery += ` AND h.city ILIKE $${++countParamCount}`;
      countParams.push(`%${city}%`);
    }
    
    if (country) {
      countQuery += ` AND h.country ILIKE $${++countParamCount}`;
      countParams.push(`%${country}%`);
    }
    
    if (min_rating) {
      countQuery += ` AND h.rating >= $${++countParamCount}`;
      countParams.push(min_rating);
    }
    
    if (max_price) {
      countQuery += ` AND EXISTS (
        SELECT 1 FROM hotel_rooms hr 
        WHERE hr.hotel_id = h.id 
        AND hr.is_active = true 
        AND hr.price_per_night <= $${++countParamCount}
      )`;
      countParams.push(max_price);
    }
    
    if (amenities) {
      const amenityList = amenities.split(',').map(a => a.trim());
      countQuery += ` AND h.amenities && $${++countParamCount}`;
      countParams.push(amenityList);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    
    res.json({
      hotels: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Error searching hotels:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/hotels/:id - Get hotel details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT h.*, 
             COALESCE(MIN(hr.price_per_night), 0) as min_price,
             COALESCE(MAX(hr.price_per_night), 0) as max_price
      FROM hotels h
      LEFT JOIN hotel_rooms hr ON h.id = hr.hotel_id AND hr.is_active = true
      WHERE h.id = $1 AND h.is_active = true
      GROUP BY h.id, h.name, h.description, h.address, h.city, h.country, 
               h.latitude, h.longitude, h.rating, h.amenities, h.images_urls, 
               h.is_active, h.created_at, h.updated_at
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    
    // Get hotel rooms
    const roomsResult = await pool.query(`
      SELECT * FROM hotel_rooms 
      WHERE hotel_id = $1 AND is_active = true
      ORDER BY price_per_night
    `, [id]);
    
    res.json({
      ...result.rows[0],
      rooms: roomsResult.rows
    });
  } catch (error) {
    console.error('Error fetching hotel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/hotels/:id/rooms - Get hotel rooms
router.get('/:id/rooms', async (req, res) => {
  try {
    const { id } = req.params;
    const { check_in_date, check_out_date, guests = 1 } = req.query;
    
    let query = `
      SELECT hr.*, h.name as hotel_name
      FROM hotel_rooms hr
      JOIN hotels h ON hr.hotel_id = h.id
      WHERE hr.hotel_id = $1 AND hr.is_active = true AND h.is_active = true
    `;
    
    let params = [id];
    
    if (guests) {
      query += ` AND hr.max_occupancy >= $2`;
      params.push(guests);
    }
    
    query += ` ORDER BY hr.price_per_night`;
    
    const result = await pool.query(query, params);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching hotel rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/hotels - Create hotel (admin only)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      city,
      country,
      latitude,
      longitude,
      rating,
      amenities,
      images_urls
    } = req.body;
    
    // Validate required fields
    if (!name || !address || !city || !country) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    
    const result = await pool.query(`
      INSERT INTO hotels (name, description, address, city, country, latitude, longitude, rating, amenities, images_urls)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [name, description, address, city, country, latitude, longitude, rating, amenities, images_urls]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating hotel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/hotels/:id - Update hotel (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      address,
      city,
      country,
      latitude,
      longitude,
      rating,
      amenities,
      images_urls,
      is_active
    } = req.body;
    
    const result = await pool.query(`
      UPDATE hotels 
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          address = COALESCE($3, address),
          city = COALESCE($4, city),
          country = COALESCE($5, country),
          latitude = COALESCE($6, latitude),
          longitude = COALESCE($7, longitude),
          rating = COALESCE($8, rating),
          amenities = COALESCE($9, amenities),
          images_urls = COALESCE($10, images_urls),
          is_active = COALESCE($11, is_active),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $12
      RETURNING *
    `, [name, description, address, city, country, latitude, longitude, rating, amenities, images_urls, is_active, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating hotel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/hotels/:id - Delete hotel (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE hotels SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }
    
    res.json({ message: 'Hotel deactivated successfully' });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/hotels/:id/rooms - Create hotel room (admin only)
router.post('/:id/rooms', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      room_type,
      bed_type,
      max_occupancy,
      price_per_night,
      available_rooms,
      amenities,
      images_urls
    } = req.body;
    
    // Validate required fields
    if (!room_type || !bed_type || !max_occupancy || !price_per_night) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    
    const result = await pool.query(`
      INSERT INTO hotel_rooms (hotel_id, room_type, bed_type, max_occupancy, price_per_night, available_rooms, amenities, images_urls)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [id, room_type, bed_type, max_occupancy, price_per_night, available_rooms, amenities, images_urls]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating hotel room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;