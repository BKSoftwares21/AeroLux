import express from 'express';
import {
  getFlights,
  searchFlights,
  getFlightById,
  createFlight,
  updateFlight,
  deleteFlight,
  getFlightStats
} from '../controllers/flightController';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { validateFlightSearch, handleValidationErrors } from '../middleware/validation';

const router = express.Router();

// @route   GET /api/flights
// @desc    Get all flights
// @access  Public
router.get('/', optionalAuth, getFlights);

// @route   GET /api/flights/search
// @desc    Search flights
// @access  Public
router.get('/search', validateFlightSearch, handleValidationErrors, searchFlights);

// @route   GET /api/flights/stats
// @desc    Get flight statistics (Admin only)
// @access  Private/Admin
router.get('/stats', authenticate, authorize('admin'), getFlightStats);

// @route   GET /api/flights/:id
// @desc    Get flight by ID
// @access  Public
router.get('/:id', optionalAuth, getFlightById);

// @route   POST /api/flights
// @desc    Create flight (Admin only)
// @access  Private/Admin
router.post('/', authenticate, authorize('admin'), createFlight);

// @route   PUT /api/flights/:id
// @desc    Update flight (Admin only)
// @access  Private/Admin
router.put('/:id', authenticate, authorize('admin'), updateFlight);

// @route   DELETE /api/flights/:id
// @desc    Delete flight (Admin only)
// @access  Private/Admin
router.delete('/:id', authenticate, authorize('admin'), deleteFlight);

export default router;