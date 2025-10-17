// Payment Management API Routes
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

// POST /api/payments - Process payment
router.post('/', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      booking_id,
      amount,
      currency = 'USD',
      payment_method,
      card_number,
      expiry_date,
      cvv,
      cardholder_name
    } = req.body;
    
    // Validate required fields
    if (!booking_id || !amount || !payment_method) {
      return res.status(400).json({ error: 'Required fields missing' });
    }
    
    // Get booking details
    const bookingResult = await client.query(`
      SELECT b.*, u.name as user_name, u.email as user_email
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      WHERE b.id = $1 AND b.user_id = $2
    `, [booking_id, req.user.id]);
    
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const booking = bookingResult.rows[0];
    
    if (booking.status !== 'pending') {
      return res.status(400).json({ error: 'Booking is not in pending status' });
    }
    
    // Validate amount
    if (parseFloat(amount) !== parseFloat(booking.total_amount)) {
      return res.status(400).json({ error: 'Payment amount does not match booking total' });
    }
    
    // Simulate payment processing (replace with actual payment gateway integration)
    const paymentSuccess = await processPayment({
      amount,
      currency,
      payment_method,
      card_number,
      expiry_date,
      cvv,
      cardholder_name
    });
    
    if (!paymentSuccess.success) {
      return res.status(400).json({ error: paymentSuccess.message || 'Payment failed' });
    }
    
    // Create payment record
    const paymentResult = await client.query(`
      INSERT INTO payments (booking_id, amount, currency, payment_method, payment_status, transaction_id, payment_date)
      VALUES ($1, $2, $3, $4, 'completed', $5, CURRENT_TIMESTAMP)
      RETURNING *
    `, [booking_id, amount, currency, payment_method, paymentSuccess.transaction_id]);
    
    // Update booking status
    await client.query(`
      UPDATE bookings 
      SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [booking_id]);
    
    // Create notification
    await client.query(`
      INSERT INTO notifications (user_id, title, message, type, sent_at)
      VALUES ($1, 'Payment Successful', 'Your payment has been processed successfully. Booking confirmed!', 'payment_success', CURRENT_TIMESTAMP)
    `, [req.user.id]);
    
    await client.query('COMMIT');
    
    res.status(201).json({
      payment: paymentResult.rows[0],
      booking_status: 'confirmed',
      message: 'Payment processed successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// GET /api/payments/booking/:booking_id - Get payments for a booking
router.get('/booking/:booking_id', authenticateToken, async (req, res) => {
  try {
    const { booking_id } = req.params;
    
    // Verify booking belongs to user
    const bookingResult = await pool.query(`
      SELECT id FROM bookings WHERE id = $1 AND user_id = $2
    `, [booking_id, req.user.id]);
    
    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const result = await pool.query(`
      SELECT * FROM payments 
      WHERE booking_id = $1 
      ORDER BY created_at DESC
    `, [booking_id]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/payments/user - Get user's payment history
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT p.*, b.reference_number, b.booking_type, b.total_amount as booking_amount
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE b.user_id = $1
    `;
    
    let params = [req.user.id];
    let paramCount = 1;
    
    if (status) {
      paramCount++;
      query += ` AND p.payment_status = $${paramCount}`;
      params.push(status);
    }
    
    query += ` ORDER BY p.created_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Get total count
    let countQuery = `
      SELECT COUNT(*) 
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE b.user_id = $1
    `;
    let countParams = [req.user.id];
    let countParamCount = 1;
    
    if (status) {
      countQuery += ` AND p.payment_status = $${++countParamCount}`;
      countParams.push(status);
    }
    
    const countResult = await pool.query(countQuery, countParams);
    
    res.json({
      payments: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/payments/refund - Process refund (admin only)
router.post('/refund', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { payment_id, refund_amount, reason } = req.body;
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Get payment details
    const paymentResult = await client.query(`
      SELECT p.*, b.user_id, b.reference_number
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE p.id = $1
    `, [payment_id]);
    
    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    const payment = paymentResult.rows[0];
    
    if (payment.payment_status !== 'completed') {
      return res.status(400).json({ error: 'Payment is not completed' });
    }
    
    // Validate refund amount
    const maxRefundAmount = payment.amount - payment.refund_amount;
    if (refund_amount > maxRefundAmount) {
      return res.status(400).json({ error: 'Refund amount exceeds available amount' });
    }
    
    // Simulate refund processing
    const refundSuccess = await processRefund({
      payment_id: payment.transaction_id,
      amount: refund_amount,
      reason
    });
    
    if (!refundSuccess.success) {
      return res.status(400).json({ error: refundSuccess.message || 'Refund failed' });
    }
    
    // Update payment record
    const newRefundAmount = payment.refund_amount + refund_amount;
    const refundStatus = newRefundAmount >= payment.amount ? 'refunded' : 'partially_refunded';
    
    await client.query(`
      UPDATE payments 
      SET refund_amount = $1, refund_date = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [newRefundAmount, payment_id]);
    
    // Update booking status if fully refunded
    if (refundStatus === 'refunded') {
      await client.query(`
        UPDATE bookings 
        SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [payment.booking_id]);
    }
    
    // Create notification
    await client.query(`
      INSERT INTO notifications (user_id, title, message, type, sent_at)
      VALUES ($1, 'Refund Processed', 
              CONCAT('A refund of $', $2, ' has been processed for booking ', $3, '. Reason: ', $4), 
              'refund_processed', CURRENT_TIMESTAMP)
    `, [payment.user_id, refund_amount, payment.reference_number, reason || 'No reason provided']);
    
    await client.query('COMMIT');
    
    res.json({
      message: 'Refund processed successfully',
      refund_amount: refund_amount,
      total_refunded: newRefundAmount,
      refund_status: refundStatus
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error processing refund:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Simulate payment processing (replace with actual payment gateway)
async function processPayment(paymentData) {
  // This is a mock implementation
  // Replace with actual payment gateway integration (Stripe, PayPal, etc.)
  
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation
    if (!paymentData.card_number || paymentData.card_number.length < 13) {
      return { success: false, message: 'Invalid card number' };
    }
    
    if (!paymentData.expiry_date || !/^\d{2}\/\d{2}$/.test(paymentData.expiry_date)) {
      return { success: false, message: 'Invalid expiry date format' };
    }
    
    if (!paymentData.cvv || paymentData.cvv.length < 3) {
      return { success: false, message: 'Invalid CVV' };
    }
    
    // Simulate random failure (5% chance)
    if (Math.random() < 0.05) {
      return { success: false, message: 'Payment declined by bank' };
    }
    
    // Generate mock transaction ID
    const transactionId = 'txn_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    return {
      success: true,
      transaction_id: transactionId,
      message: 'Payment processed successfully'
    };
  } catch (error) {
    return { success: false, message: 'Payment processing error' };
  }
}

// Simulate refund processing
async function processRefund(refundData) {
  // This is a mock implementation
  // Replace with actual payment gateway integration
  
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate random failure (2% chance)
    if (Math.random() < 0.02) {
      return { success: false, message: 'Refund failed - please contact support' };
    }
    
    return {
      success: true,
      refund_id: 'ref_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      message: 'Refund processed successfully'
    };
  } catch (error) {
    return { success: false, message: 'Refund processing error' };
  }
}

module.exports = router;