import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import { generateTokens } from '../utils/jwt';
import { sendWelcomeEmail, sendPasswordResetEmail } from '../utils/email';
import { ApiResponse } from '../types';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, phone, dateOfBirth, idOrPassport } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      const response: ApiResponse = {
        success: false,
        message: 'User already exists with this email'
      };
      return res.status(400).json(response);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      idOrPassport
    });

    // Generate tokens
    const tokens = generateTokens(user);

    // Send welcome email
    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail registration if email fails
    }

    const response: ApiResponse = {
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        ...tokens
      }
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Check if user exists and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid credentials'
      };
      return res.status(401).json(response);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid credentials'
      };
      return res.status(401).json(response);
    }

    // Generate tokens
    const tokens = generateTokens(user);

    const response: ApiResponse = {
      success: true,
      message: 'Login successful',
      data: {
        user,
        ...tokens
      }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;

    const response: ApiResponse = {
      success: true,
      message: 'User retrieved successfully',
      data: { user }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found with this email'
      };
      return res.status(404).json(response);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Send reset email
    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (emailError) {
      console.error('Error sending reset email:', emailError);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      
      const response: ApiResponse = {
        success: false,
        message: 'Error sending reset email'
      };
      return res.status(500).json(response);
    }

    const response: ApiResponse = {
      success: true,
      message: 'Password reset email sent'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
      const response: ApiResponse = {
        success: false,
        message: 'Invalid or expired reset token'
      };
      return res.status(400).json(response);
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const response: ApiResponse = {
      success: true,
      message: 'Password reset successful'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
export const updatePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = (req as any).user;

    // Get user with password
    const userWithPassword = await User.findById(user._id).select('+password');
    if (!userWithPassword) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found'
      };
      return res.status(404).json(response);
    }

    // Check current password
    const isCurrentPasswordValid = await userWithPassword.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      const response: ApiResponse = {
        success: false,
        message: 'Current password is incorrect'
      };
      return res.status(400).json(response);
    }

    // Update password
    userWithPassword.password = newPassword;
    await userWithPassword.save();

    const response: ApiResponse = {
      success: true,
      message: 'Password updated successfully'
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
};