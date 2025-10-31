import express from 'express';

const router = express.Router();

// Notifications have been removed. Keep endpoints for app compatibility.

// Get user notifications -> return empty list
router.get('/user/:userId', async (_req, res) => {
  res.json({ notifications: [] });
});

// Create notification -> no-op
router.post('/', async (_req, res) => {
  res.status(201).json({ message: 'Notifications are disabled; no record created.' });
});

// Mark notification as read -> no-op
router.patch('/:id/read', async (_req, res) => {
  res.json({ message: 'Notifications are disabled; nothing to update.' });
});

export default router;
