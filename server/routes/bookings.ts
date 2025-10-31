import express from 'express';
import prisma from '../prisma';

const router = express.Router();

function addCancellationInfo(b: any) {
  const now = new Date();
  const hasRequested = !!b.cancelRequestedAt;
  const effectiveAt = b.cancellationEffectiveAt ? new Date(b.cancellationEffectiveAt) : null;
  const cancellationPending = hasRequested && effectiveAt && effectiveAt > now && b.status !== 'CANCELLED';
  return { ...b, cancellation_pending: cancellationPending };
}
// List all bookings (admin)
router.get('/', async (_req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        hotel: { select: { id: true, name: true, city: true, country: true } },
        payment: { select: { id: true, status: true, amount: true, paidAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ bookings: bookings.map(addCancellationInfo) });
  } catch (error) {
    console.error('List bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get user bookings
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const bookings = await prisma.booking.findMany({
      where: { userId: parseInt(userId) },
      include: {
        hotel: {
          select: {
            name: true,
            city: true,
            country: true,
          },
        },
        payment: { select: { id: true, status: true, amount: true, paidAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ bookings: bookings.map(addCancellationInfo) });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Create booking
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      type,
      reference,
      date,
      amount,
      description,
      hotelId,
      flightId,
      passengers,
      metadata,
    } = req.body;

    const typeUp = String(type).toUpperCase();

    if (typeUp === 'FLIGHT') {
      const fid = parseInt(flightId);
      const pax = Math.max(1, parseInt(passengers) || 1);
      const flight = await prisma.flight.findUnique({ where: { id: fid } });
      if (!flight) return res.status(404).json({ error: 'Flight not found' });
      if (new Date(flight.date) <= new Date()) return res.status(400).json({ error: 'Flight already departed' });
      if (flight.seatsAvailable < pax) return res.status(400).json({ error: 'Not enough seats available' });

      const booking = await prisma.$transaction(async (tx: import('@prisma/client').Prisma.TransactionClient) => {
        await tx.flight.update({ where: { id: fid }, data: { seatsAvailable: { decrement: pax } } });
        return tx.booking.create({
          data: {
            userId: parseInt(userId),
            type: 'FLIGHT',
            reference,
            date: new Date(date),
            amount: parseFloat(amount),
            description,
            flightId: fid,
            passengers: pax,
            metadata: metadata || {},
          },
        });
      });
      return res.status(201).json({ booking });
    }

    // HOTEL or other types
    const booking = await prisma.booking.create({
      data: {
        userId: parseInt(userId),
        type: typeUp as any,
        reference,
        date: new Date(date),
        amount: parseFloat(amount),
        description,
        hotelId: hotelId ? parseInt(hotelId) : null,
        metadata: metadata || {},
      },
    });

    res.status(201).json({ booking });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Update booking status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
    });

    res.json({ booking: addCancellationInfo(booking) });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Mark booking as paid
router.patch('/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        paymentStatus: 'PAID',
        status: 'COMPLETED',
      },
    });

    res.json({ booking: addCancellationInfo(booking) });
  } catch (error) {
    console.error('Mark booking paid error:', error);
    res.status(500).json({ error: 'Failed to mark booking as paid' });
  }
});

// Request cancellation (takes effect in 24 hours, auto-refund if paid)
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({ where: { id }, include: { payment: true } });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // Must be before trip date
    if (new Date(booking.date) <= new Date()) {
      return res.status(400).json({ error: 'Cannot cancel after trip date/time' });
    }

    if (booking.status === 'CANCELLED') {
      return res.json({ booking: addCancellationInfo(booking) });
    }

    const now = new Date();
    const effective = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        cancelRequestedAt: now,
        cancellationEffectiveAt: effective,
        refundStatus: booking.paymentStatus === 'PAID' ? 'PENDING' : null,
        refundAmount: booking.paymentStatus === 'PAID' ? booking.amount : null,
      },
      include: { payment: true },
    });

    res.json({ booking: addCancellationInfo(updated), message: 'Cancellation requested; will complete in 24 hours' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to request cancellation' });
  }
});

// Delete booking
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.booking.delete({
      where: { id },
    });

    res.json({ ok: true, message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

export default router;
