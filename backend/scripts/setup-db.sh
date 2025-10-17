#!/bin/bash

# Setup database script for AeroLux Backend
echo "🚀 Setting up AeroLux Backend Database..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create one with DATABASE_URL"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push schema to database
echo "📊 Pushing schema to database..."
npx prisma db push

# Optional: Seed database with sample data
echo "🌱 Seeding database with sample data..."
npm run seed:dev

echo "✅ Database setup completed successfully!"
echo "🎉 You can now start the development server with: npm run dev"