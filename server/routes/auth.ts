import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
import { sendEmail } from '../utils/email';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { email, password, full_name, phone, date_of_birth, id_or_passport } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName: full_name,
        phone,
        role: 'USER',
        dateOfBirth: date_of_birth ? new Date(date_of_birth) : undefined,
        idOrPassport: id_or_passport || undefined,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
      },
    });


    // Send welcome/confirmation email (non-blocking)
    try {
      await sendEmail({
        to: user.email,
        subject: 'Welcome to AeroLux',
        text: `Hi ${user.fullName}, your AeroLux account was created successfully.`,
        html: `<p>Hi <strong>${user.fullName}</strong>,</p><p>Your AeroLux account was created successfully.</p>`,
      });
    } catch (e) {
      console.warn('Signup email failed:', (e as any)?.message || e);
    }

    // Generate token
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user', detail: (error as any)?.message || String(error) });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        phone: user.phone,
        role: user.role,
        date_of_birth: (user as any).dateOfBirth || null,
        id_or_passport: (user as any).idOrPassport || null,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});


function generateCode(): string {
  const n = Math.floor(Math.random() * 1000000);
  return n.toString().padStart(6, '0');
}

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const code = generateCode();
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.passwordReset.create({
      data: {
        userId: user.id,
        codeHash,
        expiresAt,
      },
    });

    try {
      await sendEmail({
        to: user.email,
        subject: 'AeroLux Password Reset Code',
        text: `Your password reset code is ${code}. It expires in 15 minutes.`,
        html: `<p>Your password reset code is <strong>${code}</strong>. It expires in 15 minutes.</p>`,
      });
    } catch (e) {
      console.warn('Forgot-password email failed:', (e as any)?.message || e);
    }

    const payload: any = { ok: true, message: 'Reset code sent to email' };
    if (process.env.NODE_ENV !== 'production') payload.test_code = code;
    res.json(payload);
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, new_password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find latest valid reset request
    const reset = await prisma.passwordReset.findFirst({
      where: { userId: user.id, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!reset) {
      return res.status(400).json({ error: 'No valid reset request found' });
    }

    const ok = await bcrypt.compare(code, (reset as any).codeHash);
    if (!ok) {
      return res.status(400).json({ error: 'Invalid reset code' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { password: hashedPassword } }),
      prisma.passwordReset.update({ where: { id: reset.id }, data: { used: true, usedAt: new Date() } }),
    ]);

    try {
      await sendEmail({
        to: user.email,
        subject: 'Your AeroLux password was changed',
        text: 'Your password has been changed successfully. If you did not initiate this change, contact support immediately.',
        html: '<p>Your password has been changed successfully.</p><p>If you did not initiate this change, contact support immediately.</p>',
      });
    } catch (e) {
      console.warn('Password-changed email failed:', (e as any)?.message || e);
    }

    res.json({ ok: true, message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});
export default router;
