// Database Setup Script
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'postgres', // Connect to default postgres db first
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Setting up AeroLux database...');
    
    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'aerolux';
    console.log(`📦 Creating database: ${dbName}`);
    
    await client.query(`CREATE DATABASE ${dbName}`);
    console.log(`✅ Database '${dbName}' created successfully`);
    
    // Close connection to default database
    await client.release();
    
    // Connect to the new database
    const appPool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: dbName,
      password: process.env.DB_PASSWORD || 'password',
      port: process.env.DB_PORT || 5432,
    });
    
    const appClient = await appPool.connect();
    
    // Read and execute schema
    const fs = require('fs');
    const path = require('path');
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    
    if (fs.existsSync(schemaPath)) {
      console.log('📋 Executing database schema...');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await appClient.query(schema);
      console.log('✅ Database schema executed successfully');
    } else {
      console.log('❌ Schema file not found at:', schemaPath);
      process.exit(1);
    }
    
    await appClient.release();
    await appPool.end();
    
    console.log('🎉 Database setup completed successfully!');
    console.log('📊 You can now start the API server with: npm start');
    
  } catch (error) {
    if (error.code === '42P04') {
      console.log(`ℹ️  Database '${process.env.DB_NAME || 'aerolux'}' already exists`);
      console.log('✅ Database setup completed!');
    } else {
      console.error('❌ Error setting up database:', error.message);
      process.exit(1);
    }
  } finally {
    await pool.end();
  }
}

// Run setup
setupDatabase().catch(console.error);