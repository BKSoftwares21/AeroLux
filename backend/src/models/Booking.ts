import mongoose, { Schema } from 'mongoose';
import { IBooking } from '../types';

const bookingSchema = new Schema<IBooking>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  type: {
    type: String,
    enum: ['flight', 'hotel'],
    required: [true, 'Booking type is required']
  },
  flight: {
    type: Schema.Types.ObjectId,
    ref: 'Flight',
    required: function() {
      return this.type === 'flight';
    }
  },
  hotel: {
    type: Schema.Types.ObjectId,
    ref: 'Hotel',
    required: function() {
      return this.type === 'hotel';
    }
  },
  checkInDate: {
    type: Date,
    required: function() {
      return this.type === 'hotel';
    },
    validate: {
      validator: function(value: Date) {
        if (this.type === 'hotel') {
          return value > new Date();
        }
        return true;
      },
      message: 'Check-in date must be in the future'
    }
  },
  checkOutDate: {
    type: Date,
    required: function() {
      return this.type === 'hotel';
    },
    validate: {
      validator: function(value: Date) {
        if (this.type === 'hotel' && this.checkInDate) {
          return value > this.checkInDate;
        }
        return true;
      },
      message: 'Check-out date must be after check-in date'
    }
  },
  passengers: {
    type: Number,
    required: function() {
      return this.type === 'flight';
    },
    min: [1, 'At least 1 passenger is required'],
    max: [9, 'Maximum 9 passengers allowed']
  },
  rooms: {
    type: Number,
    required: function() {
      return this.type === 'hotel';
    },
    min: [1, 'At least 1 room is required'],
    max: [5, 'Maximum 5 rooms allowed']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
bookingSchema.index({ user: 1 });
bookingSchema.index({ type: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ paymentStatus: 1 });
bookingSchema.index({ createdAt: -1 });

// Virtual for booking reference
bookingSchema.virtual('bookingReference').get(function() {
  return `AER${this._id.toString().slice(-8).toUpperCase()}`;
});

// Virtual for duration (for hotel bookings)
bookingSchema.virtual('duration').get(function() {
  if (this.type === 'hotel' && this.checkInDate && this.checkOutDate) {
    const diffTime = this.checkOutDate.getTime() - this.checkInDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Ensure virtual fields are serialized
bookingSchema.set('toJSON', { virtuals: true });

// Pre-save middleware to calculate total amount
bookingSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('passengers') || this.isModified('rooms')) {
    try {
      if (this.type === 'flight' && this.flight) {
        const Flight = mongoose.model('Flight');
        const flight = await Flight.findById(this.flight);
        if (flight) {
          this.totalAmount = flight.price * (this.passengers || 1);
        }
      } else if (this.type === 'hotel' && this.hotel) {
        const Hotel = mongoose.model('Hotel');
        const hotel = await Hotel.findById(this.hotel);
        if (hotel && this.checkInDate && this.checkOutDate) {
          const nights = Math.ceil((this.checkOutDate.getTime() - this.checkInDate.getTime()) / (1000 * 60 * 60 * 24));
          this.totalAmount = hotel.pricePerNight * nights * (this.rooms || 1);
        }
      }
    } catch (error) {
      next(error as Error);
    }
  }
  next();
});

export default mongoose.model<IBooking>('Booking', bookingSchema);