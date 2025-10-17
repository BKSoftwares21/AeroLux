import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

// Initialize Prisma client and create default admin user
export const initializePrisma = async () => {
  try {
    // Check if admin user exists
    const adminExists = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminExists) {
      // Create default admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      
      await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@aerolux.com',
          password: hashedPassword,
          role: 'ADMIN',
          isEmailVerified: true,
        }
      });

      console.log('Default admin user created: admin@aerolux.com / admin123');
    }

    console.log('Prisma initialization completed');
  } catch (error) {
    console.error('Error initializing Prisma:', error);
    throw error;
  }
};

export default initializePrisma;