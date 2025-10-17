import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { ApiResponse, PaginationParams } from '../types';

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const sort = req.query.sort as string || 'createdAt';
    const order = req.query.order as 'asc' | 'desc' || 'desc';

    const sortObj: any = {};
    sortObj[sort] = order === 'asc' ? 1 : -1;

    const users = await User.find()
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .select('-password');

    const total = await User.countDocuments();

    const response: ApiResponse = {
      success: true,
      message: 'Users retrieved successfully',
      data: users,
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

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'User retrieved successfully',
      data: user
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user._id;
    const { name, phone, dateOfBirth, idOrPassport } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        name,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        idOrPassport
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Profile updated successfully',
      data: user
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user by ID (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, dateOfBirth, idOrPassport, role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        idOrPassport,
        role
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'User updated successfully',
      data: user
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'User deleted successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics (Admin only)
// @route   GET /api/users/stats
// @access  Private/Admin
export const getUserStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalRegularUsers = await User.countDocuments({ role: 'user' });
    
    // Users created in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    const stats = {
      totalUsers,
      totalAdmins,
      totalRegularUsers,
      newUsers
    };

    const response: ApiResponse = {
      success: true,
      message: 'User statistics retrieved successfully',
      data: stats
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};