import mongoose, { Schema } from 'mongoose';
import { IHotel } from '../types';

const hotelSchema = new Schema<IHotel>({
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true,
    maxlength: [100, 'Hotel name cannot be more than 100 characters']
  },
  location: {
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [200, 'Address cannot be more than 200 characters']
    }
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  pricePerNight: {
    type: Number,
    required: [true, 'Price per night is required'],
    min: [0, 'Price cannot be negative']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  amenities: [{
    type: String,
    trim: true
  }],
  bedType: {
    type: String,
    required: [true, 'Bed type is required'],
    enum: ['Single', 'Double', 'Queen', 'King', 'Twin', 'Bunk', 'Sofa Bed', 'Studio'],
    trim: true
  },
  roomType: {
    type: String,
    required: [true, 'Room type is required'],
    trim: true,
    maxlength: [50, 'Room type cannot be more than 50 characters']
  },
  imageUrl: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
hotelSchema.index({ 'location.city': 1 });
hotelSchema.index({ 'location.country': 1 });
hotelSchema.index({ pricePerNight: 1 });
hotelSchema.index({ rating: -1 });
hotelSchema.index({ isActive: 1 });
hotelSchema.index({ name: 'text', description: 'text' });

// Virtual for full location
hotelSchema.virtual('fullLocation').get(function() {
  return `${this.location.city}, ${this.location.country}`;
});

// Virtual for star rating display
hotelSchema.virtual('starRating').get(function() {
  return '⭐'.repeat(this.rating);
});

// Ensure virtual fields are serialized
hotelSchema.set('toJSON', { virtuals: true });

export default mongoose.model<IHotel>('Hotel', hotelSchema);