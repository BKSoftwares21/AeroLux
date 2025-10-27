import express from 'express';
import prisma from '../prisma';

const router = express.Router();

// List all payments (admin)
router.get('/', async (_req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        booking: { select: { id: true, reference: true, type: true, description: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ payments });
  } catch (error) {
    console.error('List payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get user payments
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const payments = await prisma.payment.findMany({
      where: { userId: parseInt(userId) },
      include: {
        booking: {
          select: {
            reference: true,
            type: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ payments });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Create payment
router.post('/', async (req, res) => {
  try {
    const { bookingId, userId, amount, method } = req.body;

    const payment = await prisma.payment.create({
      data: {
        bookingId,
        userId: parseInt(userId),
        amount: parseFloat(amount),
        method,
        status: 'pending',
      },
    });

    res.status(201).json({ payment });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Update payment status
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        status,
        ...(status === 'paid' && { paidAt: new Date() }),
      },
    });

    res.json({ payment });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

export default router;
