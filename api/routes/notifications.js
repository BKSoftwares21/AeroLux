// Notification Management API Routes
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

// GET /api/notifications - Get user's notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, unread_only = false } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT id, title, message, type, is_read, sent_at, created_at
      FROM notifications
      WHERE user_id = $1
    `;
    
    let params = [req.user.id];
    let paramCount = 1;
    
    if (unread_only === 'true') {
      paramCount++;
      query += ` AND is_read = false`;
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM notifications WHERE user_id = $1';
    let countParams = [req.user.id];
    
    if (unread_only === 'true') {
      countQuery += ' AND is_read = false';
    }
    
    const countResult = await pool.query(countQuery, countParams);
    
    // Get unread count
    const unreadResult = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
      [req.user.id]
    );
    
    res.json({
      notifications: result.rows,
      unread_count: parseInt(unreadResult.rows[0].count),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
      [req.user.id]
    );
    
    res.json({ unread_count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      UPDATE notifications 
      SET is_read = true 
      WHERE id = $1 AND user_id = $2
      RETURNING id, title, message, type, is_read, sent_at, created_at
    `, [id, req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/notifications/mark-all-read - Mark all notifications as read
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      UPDATE notifications 
      SET is_read = true 
      WHERE user_id = $1 AND is_read = false
      RETURNING COUNT(*)
    `, [req.user.id]);
    
    res.json({ 
      message: 'All notifications marked as read',
      updated_count: parseInt(result.rows[0].count)
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM notifications WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/notifications - Create notification (admin only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { user_id, title, message, type, send_to_all = false } = req.body;
    
    // Validate required fields
    if (!title || !message || !type) {
      return res.status(400).json({ error: 'Title, message, and type are required' });
    }
    
    if (!send_to_all && !user_id) {
      return res.status(400).json({ error: 'User ID required when not sending to all users' });
    }
    
    if (send_to_all) {
      // Send to all active users
      const usersResult = await pool.query(
        'SELECT id FROM users WHERE is_active = true'
      );
      
      const notifications = usersResult.rows.map(user => ({
        user_id: user.id,
        title,
        message,
        type,
        sent_at: new Date()
      }));
      
      // Batch insert notifications
      const values = notifications.map((_, index) => {
        const offset = index * 4;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, CURRENT_TIMESTAMP)`;
      }).join(', ');
      
      const params = notifications.flatMap(n => [n.user_id, n.title, n.message, n.type]);
      
      await pool.query(`
        INSERT INTO notifications (user_id, title, message, type, sent_at)
        VALUES ${values}
      `, params);
      
      res.status(201).json({
        message: 'Notifications sent to all users',
        count: notifications.length
      });
    } else {
      // Send to specific user
      const result = await pool.query(`
        INSERT INTO notifications (user_id, title, message, type, sent_at)
        VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
        RETURNING *
      `, [user_id, title, message, type]);
      
      res.status(201).json(result.rows[0]);
    }
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/notifications/admin/all - Get all notifications (admin only)
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { page = 1, limit = 20, user_id, type, is_read } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT n.*, u.name as user_name, u.email as user_email
      FROM notifications n
      JOIN users u ON n.user_id = u.id
      WHERE 1=1
    `;
    
    let params = [];
    let paramCount = 0;
    
    if (user_id) {
      paramCount++;
      query += ` AND n.user_id = $${paramCount}`;
      params.push(user_id);
    }
    
    if (type) {
      paramCount++;
      query += ` AND n.type = $${paramCount}`;
      params.push(type);
    }
    
    if (is_read !== undefined) {
      paramCount++;
      query += ` AND n.is_read = $${paramCount}`;
      params.push(is_read === 'true');
    }
    
    query += ` ORDER BY n.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = `
      SELECT COUNT(*) 
      FROM notifications n
      JOIN users u ON n.user_id = u.id
      WHERE 1=1
    `;
    let countParams = [];
    let countParamCount = 0;
    
    if (user_id) {
      countQuery += ` AND n.user_id = $${++countParamCount}`;
      countParams.push(user_id);
    }
    
    if (type) {
      countQuery += ` AND n.type = $${++countParamCount}`;
      countParams.push(type);
    }
    
    if (is_read !== undefined) {
      countQuery += ` AND n.is_read = $${++countParamCount}`;
      countParams.push(is_read === 'true');
    }
    
    const countResult = await pool.query(countQuery, countParams);
    
    res.json({
      notifications: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching all notifications:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;