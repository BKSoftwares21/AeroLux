import express from 'express';
import bcrypt from 'bcrypt';
import prisma from '../prisma';

const router = express.Router();

// Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        dateOfBirth: true,
        idOrPassport: true,
        department: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create user (admin only)
router.post('/', async (req, res) => {
  try {
    const { email, password, full_name, phone, role, date_of_birth, id_or_passport, department } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedRole = String(role || 'USER').toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER';

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName: full_name,
        phone,
        role: normalizedRole as any,
        dateOfBirth: date_of_birth || undefined,
        idOrPassport: id_or_passport || undefined,
        department: department || undefined,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        dateOfBirth: true,
        idOrPassport: true,
        department: true,
      },
    });

    res.status(201).json({ user });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, full_name, phone, role, date_of_birth, id_or_passport, department } = req.body;

    const data: any = {};
    if (email) data.email = email;
    if (full_name) data.fullName = full_name;
    if (phone !== undefined) data.phone = phone;
    if (role !== undefined) data.role = (String(role).toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER') as any;
    if (date_of_birth !== undefined) data.dateOfBirth = date_of_birth;
    if (id_or_passport !== undefined) data.idOrPassport = id_or_passport;
    if (department !== undefined) data.department = department;
    if (password) data.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        dateOfBirth: true,
        idOrPassport: true,
        department: true,
      },
    });

    res.json({ user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Get current user profile
router.get('/me', async (req, res) => {
  try {
    // In a real app, you'd get user ID from JWT token
    const userId = req.headers['user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        dateOfBirth: true,
        idOrPassport: true,
        department: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update own profile
router.put('/me', async (req, res) => {
  try {
    const userId = req.headers['user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const { full_name, phone, date_of_birth, id_or_passport, department } = req.body;

    const data: any = {};
    if (full_name !== undefined) data.fullName = full_name;
    if (phone !== undefined) data.phone = phone;
    if (date_of_birth !== undefined) data.dateOfBirth = date_of_birth;
    if (id_or_passport !== undefined) data.idOrPassport = id_or_passport;
    if (department !== undefined) data.department = department;
    data.updatedAt = new Date();

    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        dateOfBirth: true,
        idOrPassport: true,
        department: true,
        lastLogin: true,
      },
    });

    res.json({ user, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Delete user (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.json({ ok: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
