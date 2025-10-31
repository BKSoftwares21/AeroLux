import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import hotelRoutes from './routes/hotels';
import bookingRoutes from './routes/bookings';
import paymentRoutes from './routes/payments';
import notificationRoutes from './routes/notifications';
import flightRoutes from './routes/flights';
import uploadRoutes from './routes/uploads';
import prisma from './prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Static uploads dir
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/uploads', uploadRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AeroLux API Server is running' });
});

// Background job: process due cancellations and refunds every minute
async function processDueCancellations() {
  const now = new Date();
  const due = await prisma.booking.findMany({
    where: {
      cancellationEffectiveAt: { lte: now },
      status: { not: 'CANCELLED' },
    },
    include: { payment: true },
  });

  for (const b of due) {
    try {
      await prisma.$transaction(async (tx: import('@prisma/client').Prisma.TransactionClient) => {
        // Update booking status to CANCELLED
        const updateData: any = { status: 'CANCELLED' };
        // If paid, mark refund
        if (b.paymentStatus === 'PAID') {
          updateData.refundStatus = 'REFUNDED';
          updateData.refundedAt = new Date();
        }
        await tx.booking.update({ where: { id: b.id }, data: updateData });

        // If this was a flight booking, release seats
        if (b.type === 'FLIGHT' && (b as any).flightId && (b as any).passengers) {
          await tx.flight.update({ where: { id: (b as any).flightId }, data: { seatsAvailable: { increment: (b as any).passengers } } });
        }

        if (b.paymentStatus === 'PAID' && b.payment) {
          await tx.payment.update({ where: { id: b.payment.id }, data: { status: 'refunded' } });
        }
      });
    } catch (e) {
      console.error('Failed processing cancellation for booking', b.id, e);
    }
  }
}

setInterval(() => {
  processDueCancellations().catch((e) => console.error('processDueCancellations error', e));
}, 60 * 1000);

app.listen(PORT, () => {
  console.log(`🚀 AeroLux API Server running on http://localhost:${PORT}`);
});

export default app;
