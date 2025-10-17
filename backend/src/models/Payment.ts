import mongoose, { Schema } from 'mongoose';
import { IPayment } from '../types';

const paymentSchema = new Schema<IPayment>({
  booking: {
    type: Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking is required']
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    default: 'USD',
    uppercase: true,
    length: [3, 'Currency must be exactly 3 characters']
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'wallet'],
    required: [true, 'Payment method is required']
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  paymentDetails: {
    cardNumber: {
      type: String,
      trim: true,
      validate: {
        validator: function(value: string) {
          if (this.paymentMethod === 'card' && value) {
            return /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/.test(value.replace(/\s/g, ''));
          }
          return true;
        },
        message: 'Please enter a valid card number'
      }
    },
    expiryDate: {
      type: String,
      trim: true,
      validate: {
        validator: function(value: string) {
          if (this.paymentMethod === 'card' && value) {
            return /^(0[1-9]|1[0-2])\/\d{2}$/.test(value);
          }
          return true;
        },
        message: 'Please enter a valid expiry date in MM/YY format'
      }
    },
    cvv: {
      type: String,
      trim: true,
      validate: {
        validator: function(value: string) {
          if (this.paymentMethod === 'card' && value) {
            return /^\d{3,4}$/.test(value);
          }
          return true;
        },
        message: 'Please enter a valid CVV'
      }
    },
    cardHolderName: {
      type: String,
      trim: true,
      maxlength: [50, 'Card holder name cannot be more than 50 characters']
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ createdAt: -1 });

// Virtual for masked card number
paymentSchema.virtual('maskedCardNumber').get(function() {
  if (this.paymentMethod === 'card' && this.paymentDetails?.cardNumber) {
    const cardNumber = this.paymentDetails.cardNumber.replace(/\s/g, '');
    return cardNumber.slice(0, 4) + ' **** **** ' + cardNumber.slice(-4);
  }
  return null;
});

// Virtual for payment reference
paymentSchema.virtual('paymentReference').get(function() {
  return `PAY${this._id.toString().slice(-8).toUpperCase()}`;
});

// Ensure virtual fields are serialized
paymentSchema.set('toJSON', { virtuals: true });

// Pre-save middleware to mask sensitive data
paymentSchema.pre('save', function(next) {
  if (this.paymentMethod === 'card' && this.paymentDetails?.cardNumber) {
    // Store only last 4 digits for security
    const cardNumber = this.paymentDetails.cardNumber.replace(/\s/g, '');
    this.paymentDetails.cardNumber = '**** **** **** ' + cardNumber.slice(-4);
  }
  
  if (this.paymentMethod === 'card' && this.paymentDetails?.cvv) {
    // Don't store CVV
    this.paymentDetails.cvv = undefined;
  }
  
  next();
});

export default mongoose.model<IPayment>('Payment', paymentSchema);