import express from 'express';
import {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  getAllBookings,
  getBookingStats
} from '../controllers/bookingController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// @route   POST /api/bookings
// @desc    Create booking
// @access  Private
router.post('/', authenticate, createBooking);

// @route   GET /api/bookings
// @desc    Get user bookings
// @access  Private
router.get('/', authenticate, getUserBookings);

// @route   GET /api/bookings/stats
// @desc    Get booking statistics (Admin only)
// @access  Private/Admin
router.get('/stats', authenticate, authorize('admin'), getBookingStats);

// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get('/:id', authenticate, getBookingById);

// @route   PUT /api/bookings/:id/status
// @desc    Update booking status
// @access  Private
router.put('/:id/status', authenticate, updateBookingStatus);

// @route   PUT /api/bookings/:id/cancel
// @desc    Cancel booking
// @access  Private
router.put('/:id/cancel', authenticate, cancelBooking);

// Admin routes
// @route   GET /api/bookings/admin/all
// @desc    Get all bookings (Admin only)
// @access  Private/Admin
router.get('/admin/all', authenticate, authorize('admin'), getAllBookings);

export default router;