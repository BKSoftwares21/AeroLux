import mongoose, { Schema } from 'mongoose';
import { IFlight } from '../types';

const flightSchema = new Schema<IFlight>({
  flightNumber: {
    type: String,
    required: [true, 'Flight number is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z]{2,3}\d{3,4}$/, 'Please enter a valid flight number']
  },
  airline: {
    type: String,
    required: [true, 'Airline is required'],
    trim: true,
    maxlength: [100, 'Airline name cannot be more than 100 characters']
  },
  departure: {
    city: {
      type: String,
      required: [true, 'Departure city is required'],
      trim: true
    },
    airport: {
      type: String,
      required: [true, 'Departure airport is required'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Departure airport code is required'],
      trim: true,
      uppercase: true,
      length: [3, 'Airport code must be exactly 3 characters']
    }
  },
  arrival: {
    city: {
      type: String,
      required: [true, 'Arrival city is required'],
      trim: true
    },
    airport: {
      type: String,
      required: [true, 'Arrival airport is required'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Arrival airport code is required'],
      trim: true,
      uppercase: true,
      length: [3, 'Airport code must be exactly 3 characters']
    }
  },
  date: {
    type: Date,
    required: [true, 'Flight date is required'],
    validate: {
      validator: function(value: Date) {
        return value > new Date();
      },
      message: 'Flight date must be in the future'
    }
  },
  time: {
    type: String,
    required: [true, 'Flight time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter a valid time in HH:MM format']
  },
  duration: {
    type: Number,
    required: [true, 'Flight duration is required'],
    min: [30, 'Flight duration must be at least 30 minutes'],
    max: [1440, 'Flight duration cannot exceed 24 hours']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  class: {
    type: String,
    enum: ['economy', 'business', 'first'],
    default: 'economy'
  },
  availableSeats: {
    type: Number,
    required: [true, 'Available seats is required'],
    min: [0, 'Available seats cannot be negative'],
    validate: {
      validator: function(value: number) {
        return value <= this.totalSeats;
      },
      message: 'Available seats cannot exceed total seats'
    }
  },
  totalSeats: {
    type: Number,
    required: [true, 'Total seats is required'],
    min: [1, 'Total seats must be at least 1']
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
flightSchema.index({ 'departure.code': 1, 'arrival.code': 1 });
flightSchema.index({ date: 1 });
flightSchema.index({ price: 1 });
flightSchema.index({ isActive: 1 });
flightSchema.index({ flightNumber: 1 });

// Virtual for formatted date
flightSchema.virtual('formattedDate').get(function() {
  return this.date.toISOString().split('T')[0];
});

// Virtual for formatted time
flightSchema.virtual('formattedTime').get(function() {
  return this.time;
});

// Virtual for flight duration in hours and minutes
flightSchema.virtual('durationFormatted').get(function() {
  const hours = Math.floor(this.duration / 60);
  const minutes = this.duration % 60;
  return `${hours}h ${minutes}m`;
});

// Ensure virtual fields are serialized
flightSchema.set('toJSON', { virtuals: true });

export default mongoose.model<IFlight>('Flight', flightSchema);