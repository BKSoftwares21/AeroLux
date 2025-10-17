import { Request, Response, NextFunction } from 'express';
import Flight from '../models/Flight';
import { ApiResponse, FlightSearchParams, PaginationParams } from '../types';

// @desc    Get all flights
// @route   GET /api/flights
// @access  Public
export const getFlights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort as string || 'date';
    const order = req.query.order as 'asc' | 'desc' || 'asc';

    const sortObj: any = {};
    sortObj[sort] = order === 'asc' ? 1 : -1;

    const flights = await Flight.find({ isActive: true })
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const total = await Flight.countDocuments({ isActive: true });

    const response: ApiResponse = {
      success: true,
      message: 'Flights retrieved successfully',
      data: flights,
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

// @desc    Search flights
// @route   GET /api/flights/search
// @access  Public
export const searchFlights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      departure,
      arrival,
      date,
      passengers = 1,
      class: flightClass,
      minPrice,
      maxPrice
    } = req.query as FlightSearchParams;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build search query
    const query: any = { isActive: true };

    if (departure) {
      query['departure.code'] = departure.toUpperCase();
    }

    if (arrival) {
      query['arrival.code'] = arrival.toUpperCase();
    }

    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.date = {
        $gte: searchDate,
        $lt: nextDay
      };
    }

    if (flightClass) {
      query.class = flightClass;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice as string);
      if (maxPrice) query.price.$lte = parseInt(maxPrice as string);
    }

    // Check available seats
    query.availableSeats = { $gte: parseInt(passengers as string) };

    const flights = await Flight.find(query)
      .sort({ date: 1, price: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Flight.countDocuments(query);

    const response: ApiResponse = {
      success: true,
      message: 'Flight search completed',
      data: flights,
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

// @desc    Get flight by ID
// @route   GET /api/flights/:id
// @access  Public
export const getFlightById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const flight = await Flight.findById(req.params.id);

    if (!flight) {
      const response: ApiResponse = {
        success: false,
        message: 'Flight not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Flight retrieved successfully',
      data: flight
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Create flight (Admin only)
// @route   POST /api/flights
// @access  Private/Admin
export const createFlight = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const flight = await Flight.create(req.body);

    const response: ApiResponse = {
      success: true,
      message: 'Flight created successfully',
      data: flight
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Update flight (Admin only)
// @route   PUT /api/flights/:id
// @access  Private/Admin
export const updateFlight = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const flight = await Flight.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!flight) {
      const response: ApiResponse = {
        success: false,
        message: 'Flight not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Flight updated successfully',
      data: flight
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete flight (Admin only)
// @route   DELETE /api/flights/:id
// @access  Private/Admin
export const deleteFlight = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const flight = await Flight.findByIdAndDelete(req.params.id);

    if (!flight) {
      const response: ApiResponse = {
        success: false,
        message: 'Flight not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Flight deleted successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get flight statistics (Admin only)
// @route   GET /api/flights/stats
// @access  Private/Admin
export const getFlightStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalFlights = await Flight.countDocuments();
    const activeFlights = await Flight.countDocuments({ isActive: true });
    const totalSeats = await Flight.aggregate([
      { $group: { _id: null, total: { $sum: '$totalSeats' } } }
    ]);
    const availableSeats = await Flight.aggregate([
      { $group: { _id: null, total: { $sum: '$availableSeats' } } }
    ]);

    const stats = {
      totalFlights,
      activeFlights,
      totalSeats: totalSeats[0]?.total || 0,
      availableSeats: availableSeats[0]?.total || 0,
      bookedSeats: (totalSeats[0]?.total || 0) - (availableSeats[0]?.total || 0)
    };

    const response: ApiResponse = {
      success: true,
      message: 'Flight statistics retrieved successfully',
      data: stats
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};