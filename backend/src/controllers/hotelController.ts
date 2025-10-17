import { Request, Response, NextFunction } from 'express';
import Hotel from '../models/Hotel';
import { ApiResponse, HotelSearchParams, PaginationParams } from '../types';

// @desc    Get all hotels
// @route   GET /api/hotels
// @access  Public
export const getHotels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort as string || 'rating';
    const order = req.query.order as 'asc' | 'desc' || 'desc';

    const sortObj: any = {};
    sortObj[sort] = order === 'asc' ? 1 : -1;

    const hotels = await Hotel.find({ isActive: true })
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

    const total = await Hotel.countDocuments({ isActive: true });

    const response: ApiResponse = {
      success: true,
      message: 'Hotels retrieved successfully',
      data: hotels,
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

// @desc    Search hotels
// @route   GET /api/hotels/search
// @access  Public
export const searchHotels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      location,
      checkIn,
      checkOut,
      guests = 1,
      rooms = 1,
      minPrice,
      maxPrice,
      rating
    } = req.query as HotelSearchParams;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Build search query
    const query: any = { isActive: true };

    if (location) {
      query.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } },
        { name: { $regex: location, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.pricePerNight = {};
      if (minPrice) query.pricePerNight.$gte = parseInt(minPrice as string);
      if (maxPrice) query.pricePerNight.$lte = parseInt(maxPrice as string);
    }

    if (rating) {
      query.rating = { $gte: parseInt(rating as string) };
    }

    const hotels = await Hotel.find(query)
      .sort({ rating: -1, pricePerNight: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Hotel.countDocuments(query);

    const response: ApiResponse = {
      success: true,
      message: 'Hotel search completed',
      data: hotels,
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

// @desc    Get hotel by ID
// @route   GET /api/hotels/:id
// @access  Public
export const getHotelById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      const response: ApiResponse = {
        success: false,
        message: 'Hotel not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Hotel retrieved successfully',
      data: hotel
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Create hotel (Admin only)
// @route   POST /api/hotels
// @access  Private/Admin
export const createHotel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hotel = await Hotel.create(req.body);

    const response: ApiResponse = {
      success: true,
      message: 'Hotel created successfully',
      data: hotel
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Update hotel (Admin only)
// @route   PUT /api/hotels/:id
// @access  Private/Admin
export const updateHotel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!hotel) {
      const response: ApiResponse = {
        success: false,
        message: 'Hotel not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Hotel updated successfully',
      data: hotel
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete hotel (Admin only)
// @route   DELETE /api/hotels/:id
// @access  Private/Admin
export const deleteHotel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);

    if (!hotel) {
      const response: ApiResponse = {
        success: false,
        message: 'Hotel not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Hotel deleted successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get hotel statistics (Admin only)
// @route   GET /api/hotels/stats
// @access  Private/Admin
export const getHotelStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalHotels = await Hotel.countDocuments();
    const activeHotels = await Hotel.countDocuments({ isActive: true });
    
    // Average rating
    const avgRating = await Hotel.aggregate([
      { $group: { _id: null, average: { $avg: '$rating' } } }
    ]);

    // Price range
    const priceRange = await Hotel.aggregate([
      { $group: { _id: null, min: { $min: '$pricePerNight' }, max: { $max: '$pricePerNight' } } }
    ]);

    const stats = {
      totalHotels,
      activeHotels,
      averageRating: avgRating[0]?.average || 0,
      priceRange: {
        min: priceRange[0]?.min || 0,
        max: priceRange[0]?.max || 0
      }
    };

    const response: ApiResponse = {
      success: true,
      message: 'Hotel statistics retrieved successfully',
      data: stats
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};