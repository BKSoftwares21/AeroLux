import express from 'express';
import prisma from '../prisma';

const router = express.Router();

// Map payload supporting snake_case or camelCase
function toFlightData(body: any) {
  const flightNumber = body.flightNumber ?? body.flight_number;
  const imageUrl = body.imageUrl ?? body.image_url;
  const isFirstClass = body.isFirstClass ?? body.is_first_class;
  return {
    flightNumber,
    airline: body.airline,
    departure: body.departure,
    arrival: body.arrival,
    date: body.date ? new Date(body.date) : undefined,
    time: body.time,
    price: body.price !== undefined ? Number(body.price) : undefined,
    imageUrl,
    isFirstClass: Boolean(isFirstClass ?? false),
    capacity: body.capacity !== undefined ? Number(body.capacity) : undefined,
    seatsAvailable: body.seatsAvailable ?? body.seats_available,
  } as any;
}

// List flights
router.get('/', async (_req, res) => {
  try {
    const flights = await prisma.flight.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ flights });
  } catch (err) {
    console.error('List flights error:', err);
    res.status(500).json({ error: 'Failed to fetch flights' });
  }
});

// Search flights
router.get('/search', async (req, res) => {
  try {
    const { q, airline, departure, arrival, date } = req.query as any;
    const where: any = { seatsAvailable: { gt: 0 } };
    const text = (s?: string) => s ? { contains: s, mode: 'insensitive' } : undefined;
    if (q) {
      where.OR = [
        { airline: text(q) },
        { departure: text(q) },
        { arrival: text(q) },
        { flightNumber: text(q) },
      ];
    }
    if (airline) where.airline = text(airline);
    if (departure) where.departure = text(departure);
    if (arrival) where.arrival = text(arrival);
    if (date) {
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        const next = new Date(d);
        next.setDate(next.getDate() + 1);
        where.date = { gte: d, lt: next };
      }
    }
    const flights = await prisma.flight.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json({ flights });
  } catch (err) {
    console.error('Search flights error:', err);
    res.status(500).json({ error: 'Failed to search flights' });
  }
});

// Create flight
router.post('/', async (req, res) => {
  try {
    const dataIn = toFlightData(req.body);
    const cap = Number(dataIn.capacity ?? 0);
    const seats = dataIn.seatsAvailable !== undefined ? Number(dataIn.seatsAvailable) : cap;
    const flight = await prisma.flight.create({
      data: {
        flightNumber: dataIn.flightNumber,
        airline: dataIn.airline,
        departure: dataIn.departure,
        arrival: dataIn.arrival,
        date: dataIn.date ?? new Date(),
        time: dataIn.time,
        price: dataIn.price ?? 0,
        imageUrl: dataIn.imageUrl,
        isFirstClass: dataIn.isFirstClass ?? false,
        capacity: cap,
        seatsAvailable: seats,
      },
    });
    res.status(201).json({ flight });
  } catch (err) {
    console.error('Create flight error:', err);
    res.status(500).json({ error: 'Failed to create flight' });
  }
});

// Update flight
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dataIn = toFlightData(req.body);
    const flight = await prisma.flight.update({
      where: { id: parseInt(id) },
      data: {
        ...(dataIn.flightNumber && { flightNumber: dataIn.flightNumber }),
        ...(dataIn.airline && { airline: dataIn.airline }),
        ...(dataIn.departure && { departure: dataIn.departure }),
        ...(dataIn.arrival && { arrival: dataIn.arrival }),
        ...(dataIn.date && { date: dataIn.date }),
        ...(dataIn.time !== undefined && { time: dataIn.time }),
        ...(dataIn.price !== undefined && { price: dataIn.price }),
        ...(dataIn.imageUrl !== undefined && { imageUrl: dataIn.imageUrl }),
        ...(dataIn.isFirstClass !== undefined && { isFirstClass: dataIn.isFirstClass }),
        ...(dataIn.capacity !== undefined && { capacity: Number(dataIn.capacity) }),
        ...(dataIn.seatsAvailable !== undefined && { seatsAvailable: Number(dataIn.seatsAvailable) }),
      },
    });
    res.json({ flight });
  } catch (err) {
    console.error('Update flight error:', err);
    res.status(500).json({ error: 'Failed to update flight' });
  }
});

// Delete flight
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.flight.delete({ where: { id: parseInt(id) } });
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete flight error:', err);
    res.status(500).json({ error: 'Failed to delete flight' });
  }
});

export default router;