import express from 'express';
import {
  processPayment,
  getPaymentById,
  getUserPayments,
  refundPayment,
  getPaymentStats
} from '../controllers/paymentController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/payments
// @desc    Process payment
// @access  Private
router.post('/', authenticate, processPayment);

// @route   GET /api/payments
// @desc    Get user payments
// @access  Private
router.get('/', authenticate, getUserPayments);

// @route   GET /api/payments/stats
// @desc    Get payment statistics (Admin only)
// @access  Private/Admin
router.get('/stats', authenticate, authorize('admin'), getPaymentStats);

// @route   GET /api/payments/:id
// @desc    Get payment by ID
// @access  Private
router.get('/:id', authenticate, getPaymentById);

// @route   POST /api/payments/:id/refund
// @desc    Refund payment
// @access  Private
router.post('/:id/refund', authenticate, refundPayment);

export default router;