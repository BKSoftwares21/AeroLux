import express from 'express';
import {
  getHotels,
  searchHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
  getHotelStats
} from '../controllers/hotelController';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validateHotelSearch, handleValidationErrors } from '../middleware/validation';

const router = express.Router();

// @route   GET /api/hotels
// @desc    Get all hotels
// @access  Public
router.get('/', optionalAuth, getHotels);

// @route   GET /api/hotels/search
// @desc    Search hotels
// @access  Public
router.get('/search', validateHotelSearch, handleValidationErrors, searchHotels);

// @route   GET /api/hotels/stats
// @desc    Get hotel statistics (Admin only)
// @access  Private/Admin
router.get('/stats', authenticate, authorize('admin'), getHotelStats);

// @route   GET /api/hotels/:id
// @desc    Get hotel by ID
// @access  Public
router.get('/:id', optionalAuth, getHotelById);

// @route   POST /api/hotels
// @desc    Create hotel (Admin only)
// @access  Private/Admin
router.post('/', authenticate, authorize('admin'), createHotel);

// @route   PUT /api/hotels/:id
// @desc    Update hotel (Admin only)
// @access  Private/Admin
router.put('/:id', authenticate, authorize('admin'), updateHotel);

// @route   DELETE /api/hotels/:id
// @desc    Delete hotel (Admin only)
// @access  Private/Admin
router.delete('/:id', authenticate, authorize('admin'), deleteHotel);

export default router;