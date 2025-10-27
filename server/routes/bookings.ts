import express from 'express';
import prisma from '../prisma';

const router = express.Router();

// List all bookings (admin)
router.get('/', async (_req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        hotel: { select: { id: true, name: true, city: true, country: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ bookings });
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
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ bookings });
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
      metadata,
    } = req.body;

    const booking = await prisma.booking.create({
      data: {
        userId: parseInt(userId),
        type,
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

    res.json({ booking });
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

    res.json({ booking });
  } catch (error) {
    console.error('Mark booking paid error:', error);
    res.status(500).json({ error: 'Failed to mark booking as paid' });
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
