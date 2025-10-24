import express from 'express';
import prisma from '../prisma';

const router = express.Router();

// Get all hotels
router.get('/', async (req, res) => {
  try {
    const hotels = await prisma.hotel.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        country: true,
        description: true,
        starRating: true,
        amenities: true,
      },
    });

    res.json({ hotels });
  } catch (error) {
    console.error('Get hotels error:', error);
    res.status(500).json({ error: 'Failed to fetch hotels' });
  }
});

// Search hotels
router.get('/search', async (req, res) => {
  try {
    const { name, city, country } = req.query;

    const where: any = {};
    if (name) where.name = { contains: name as string, mode: 'insensitive' };
    if (city) where.city = { contains: city as string, mode: 'insensitive' };
    if (country) where.country = { contains: country as string, mode: 'insensitive' };

    const hotels = await prisma.hotel.findMany({
      where,
      select: {
        id: true,
        name: true,
        city: true,
        country: true,
        description: true,
        starRating: true,
        amenities: true,
      },
    });

    res.json({ hotels });
  } catch (error) {
    console.error('Search hotels error:', error);
    res.status(500).json({ error: 'Failed to search hotels' });
  }
});

// Create hotel (admin only)
router.post('/', async (req, res) => {
  try {
    const { name, city, country, description, star_rating, amenities } = req.body;

    const hotel = await prisma.hotel.create({
      data: {
        name,
        city,
        country,
        description,
        starRating: star_rating,
        amenities: amenities || {},
      },
      select: {
        id: true,
        name: true,
        city: true,
        country: true,
        description: true,
        starRating: true,
      },
    });

    res.status(201).json({ hotel });
  } catch (error) {
    console.error('Create hotel error:', error);
    res.status(500).json({ error: 'Failed to create hotel' });
  }
});

// Update hotel (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, city, country, description, star_rating, amenities } = req.body;

    const hotel = await prisma.hotel.update({
      where: { id: parseInt(id) },
      data: {
        ...(name && { name }),
        ...(city && { city }),
        ...(country && { country }),
        ...(description !== undefined && { description }),
        ...(star_rating !== undefined && { starRating: star_rating }),
        ...(amenities && { amenities }),
      },
      select: {
        id: true,
        name: true,
        city: true,
        country: true,
        description: true,
        starRating: true,
      },
    });

    res.json({ hotel });
  } catch (error) {
    console.error('Update hotel error:', error);
    res.status(500).json({ error: 'Failed to update hotel' });
  }
});

// Delete hotel (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.hotel.delete({
      where: { id: parseInt(id) },
    });

    res.json({ ok: true, message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error('Delete hotel error:', error);
    res.status(500).json({ error: 'Failed to delete hotel' });
  }
});

export default router;
