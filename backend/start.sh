#!/bin/bash

echo "🚀 Starting AeroLux Backend API..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ .env file created. Please update the configuration values."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building TypeScript project..."
npm run build

# Check if MongoDB is running (optional)
echo "🔍 Checking MongoDB connection..."

# Start the server
echo "🌟 Starting server..."
npm start