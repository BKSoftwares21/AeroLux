import { Request, Response, NextFunction } from 'express';
import Payment from '../models/Payment';
import Booking from '../models/Booking';
import Flight from '../models/Flight';
import { ApiResponse } from '../types';

// @desc    Process payment
// @route   POST /api/payments
// @access  Private
export const processPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id;
    const { bookingId, paymentMethod, paymentDetails } = req.body;

    // Find booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      const response: ApiResponse = {
        success: false,
        message: 'Booking not found'
      };
      return res.status(404).json(response);
    }

    // Check if booking belongs to user
    if (booking.user.toString() !== userId) {
      const response: ApiResponse = {
        success: false,
        message: 'Unauthorized access to booking'
      };
      return res.status(403).json(response);
    }

    // Check if booking is already paid
    if (booking.paymentStatus === 'paid') {
      const response: ApiResponse = {
        success: false,
        message: 'Booking is already paid'
      };
      return res.status(400).json(response);
    }

    // Generate transaction ID
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

    // Create payment record
    const payment = await Payment.create({
      booking: bookingId,
      user: userId,
      amount: booking.totalAmount,
      paymentMethod,
      paymentDetails,
      transactionId,
      status: 'pending'
    });

    // Simulate payment processing (in real app, integrate with payment gateway)
    // For demo purposes, we'll mark as completed
    setTimeout(async () => {
      try {
        // Update payment status
        await Payment.findByIdAndUpdate(payment._id, { status: 'completed' });
        
        // Update booking status
        await Booking.findByIdAndUpdate(bookingId, { 
          status: 'confirmed',
          paymentStatus: 'paid',
          paymentId: payment._id
        });

        // Update available seats for flight bookings
        if (booking.type === 'flight' && booking.flight) {
          await Flight.findByIdAndUpdate(
            booking.flight,
            { $inc: { availableSeats: -(booking.passengers || 0) } }
          );
        }
      } catch (error) {
        console.error('Error updating payment status:', error);
      }
    }, 2000); // 2 second delay to simulate processing

    const response: ApiResponse = {
      success: true,
      message: 'Payment processed successfully',
      data: {
        payment,
        transactionId,
        status: 'processing'
      }
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment by ID
// @route   GET /api/payments/:id
// @access  Private
export const getPaymentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id;
    const payment = await Payment.findOne({
      _id: req.params.id,
      user: userId
    }).populate('booking');

    if (!payment) {
      const response: ApiResponse = {
        success: false,
        message: 'Payment not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Payment retrieved successfully',
      data: payment
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user payments
// @route   GET /api/payments
// @access  Private
export const getUserPayments = async (req: Request, res: Response, next: NextFunction) => {
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

    const payments = await Payment.find(query)
      .populate('booking', 'type status totalAmount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Payment.countDocuments(query);

    const response: ApiResponse = {
      success: true,
      message: 'Payments retrieved successfully',
      data: payments,
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

// @desc    Refund payment
// @route   POST /api/payments/:id/refund
// @access  Private
export const refundPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id;
    const payment = await Payment.findOne({
      _id: req.params.id,
      user: userId
    });

    if (!payment) {
      const response: ApiResponse = {
        success: false,
        message: 'Payment not found'
      };
      return res.status(404).json(response);
    }

    if (payment.status !== 'completed') {
      const response: ApiResponse = {
        success: false,
        message: 'Only completed payments can be refunded'
      };
      return res.status(400).json(response);
    }

    // Update payment status
    await Payment.findByIdAndUpdate(payment._id, { status: 'refunded' });

    // Update booking status
    await Booking.findByIdAndUpdate(payment.booking, {
      status: 'cancelled',
      paymentStatus: 'refunded'
    });

    const response: ApiResponse = {
      success: true,
      message: 'Payment refunded successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment statistics (Admin only)
// @route   GET /api/payments/stats
// @access  Private/Admin
export const getPaymentStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalPayments = await Payment.countDocuments();
    const completedPayments = await Payment.countDocuments({ status: 'completed' });
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    const failedPayments = await Payment.countDocuments({ status: 'failed' });
    const refundedPayments = await Payment.countDocuments({ status: 'refunded' });

    // Total revenue
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Revenue by payment method
    const revenueByMethod = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: '$paymentMethod', total: { $sum: '$amount' } } }
    ]);

    const stats = {
      totalPayments,
      completedPayments,
      pendingPayments,
      failedPayments,
      refundedPayments,
      totalRevenue: totalRevenue[0]?.total || 0,
      revenueByMethod
    };

    const response: ApiResponse = {
      success: true,
      message: 'Payment statistics retrieved successfully',
      data: stats
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};