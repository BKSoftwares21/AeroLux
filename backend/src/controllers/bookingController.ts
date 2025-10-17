import { Request, Response, NextFunction } from 'express';
import Booking from '../models/Booking';
import Flight from '../models/Flight';
import Hotel from '../models/Hotel';
import Payment from '../models/Payment';
import { ApiResponse, PaginationParams } from '../types';

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id;
    const { type, flight, hotel, checkInDate, checkOutDate, passengers, rooms } = req.body;

    // Validate booking type and required fields
    if (type === 'flight' && !flight) {
      const response: ApiResponse = {
        success: false,
        message: 'Flight ID is required for flight bookings'
      };
      return res.status(400).json(response);
    }

    if (type === 'hotel' && !hotel) {
      const response: ApiResponse = {
        success: false,
        message: 'Hotel ID is required for hotel bookings'
      };
      return res.status(400).json(response);
    }

    // Check if flight/hotel exists and is available
    if (type === 'flight') {
      const flightData = await Flight.findById(flight);
      if (!flightData || !flightData.isActive) {
        const response: ApiResponse = {
          success: false,
          message: 'Flight not found or not available'
        };
        return res.status(404).json(response);
      }

      if (flightData.availableSeats < passengers) {
        const response: ApiResponse = {
          success: false,
          message: 'Not enough seats available'
        };
        return res.status(400).json(response);
      }
    }

    if (type === 'hotel') {
      const hotelData = await Hotel.findById(hotel);
      if (!hotelData || !hotelData.isActive) {
        const response: ApiResponse = {
          success: false,
          message: 'Hotel not found or not available'
        };
        return res.status(404).json(response);
      }
    }

    // Create booking
    const booking = await Booking.create({
      user: userId,
      type,
      flight: type === 'flight' ? flight : undefined,
      hotel: type === 'hotel' ? hotel : undefined,
      checkInDate: type === 'hotel' ? new Date(checkInDate) : undefined,
      checkOutDate: type === 'hotel' ? new Date(checkOutDate) : undefined,
      passengers: type === 'flight' ? passengers : undefined,
      rooms: type === 'hotel' ? rooms : undefined,
      totalAmount: 0 // Will be calculated by pre-save middleware
    });

    const response: ApiResponse = {
      success: true,
      message: 'Booking created successfully',
      data: booking
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
export const getUserBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const query: any = { user: userId };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('flight', 'flightNumber airline departure arrival date time price')
      .populate('hotel', 'name location pricePerNight rating imageUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(query);

    const response: ApiResponse = {
      success: true,
      message: 'Bookings retrieved successfully',
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
export const getBookingById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id;
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: userId
    })
      .populate('flight')
      .populate('hotel')
      .populate('user', 'name email');

    if (!booking) {
      const response: ApiResponse = {
        success: false,
        message: 'Booking not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Booking retrieved successfully',
      data: booking
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const userId = (req as any).user._id;

    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      const response: ApiResponse = {
        success: false,
        message: 'Booking not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id;

    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, user: userId },
      { 
        status: 'cancelled',
        paymentStatus: 'refunded'
      },
      { new: true, runValidators: true }
    );

    if (!booking) {
      const response: ApiResponse = {
        success: false,
        message: 'Booking not found'
      };
      return res.status(404).json(response);
    }

    // Update available seats for flight bookings
    if (booking.type === 'flight' && booking.flight) {
      await Flight.findByIdAndUpdate(
        booking.flight,
        { $inc: { availableSeats: booking.passengers || 0 } }
      );
    }

    const response: ApiResponse = {
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/admin/bookings
// @access  Private/Admin
export const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;
    const type = req.query.type as string;

    const query: any = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .populate('flight', 'flightNumber airline departure arrival date time')
      .populate('hotel', 'name location pricePerNight')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(query);

    const response: ApiResponse = {
      success: true,
      message: 'All bookings retrieved successfully',
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking statistics (Admin only)
// @route   GET /api/bookings/stats
// @access  Private/Admin
export const getBookingStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const cancelledBookings = await Booking.countDocuments({ status: 'cancelled' });
    
    const flightBookings = await Booking.countDocuments({ type: 'flight' });
    const hotelBookings = await Booking.countDocuments({ type: 'hotel' });

    // Total revenue
    const revenue = await Booking.aggregate([
      { $match: { status: 'confirmed', paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const stats = {
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      flightBookings,
      hotelBookings,
      totalRevenue: revenue[0]?.total || 0
    };

    const response: ApiResponse = {
      success: true,
      message: 'Booking statistics retrieved successfully',
      data: stats
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};