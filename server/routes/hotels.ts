import express from 'express';
import prisma from '../prisma';

const router = express.Router();

function toHotelData(body: any) {
  return {
    name: body.name,
    city: body.city,
    country: body.country,
    description: body.description,
    starRating: body.star_rating ?? body.starRating,
    amenities: body.amenities,
    imageUrl: body.image_url ?? body.imageUrl,
  } as any;
}

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
        imageUrl: true,
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
        imageUrl: true,
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
    const dataIn = toHotelData(req.body);

    const hotel = await prisma.hotel.create({
      data: {
        name: dataIn.name,
        city: dataIn.city,
        country: dataIn.country,
        description: dataIn.description,
        starRating: dataIn.starRating,
        amenities: dataIn.amenities || {},
        imageUrl: dataIn.imageUrl,
      },
      select: {
        id: true,
        name: true,
        city: true,
        country: true,
        description: true,
        starRating: true,
        amenities: true,
        imageUrl: true,
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
    const dataIn = toHotelData(req.body);

    const hotel = await prisma.hotel.update({
      where: { id: parseInt(id) },
      data: {
        ...(dataIn.name && { name: dataIn.name }),
        ...(dataIn.city && { city: dataIn.city }),
        ...(dataIn.country && { country: dataIn.country }),
        ...(dataIn.description !== undefined && { description: dataIn.description }),
        ...(dataIn.starRating !== undefined && { starRating: dataIn.starRating }),
        ...(dataIn.amenities && { amenities: dataIn.amenities }),
        ...(dataIn.imageUrl !== undefined && { imageUrl: dataIn.imageUrl }),
      },
      select: {
        id: true,
        name: true,
        city: true,
        country: true,
        description: true,
        starRating: true,
        amenities: true,
        imageUrl: true,
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
