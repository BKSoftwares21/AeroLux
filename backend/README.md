# AeroLux Backend API

A comprehensive travel booking API built with Node.js, Express, TypeScript, and Prisma with PostgreSQL.

## 🚀 Quick Start

### Prerequisites

- Node.js (>= 18.0.0)
- npm or yarn
- PostgreSQL database (or use the provided Prisma Accelerate URL)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   The `.env` file is already configured with the DATABASE_URL for Prisma Accelerate.

3. **Set up the database:**
   ```bash
   # Run the setup script
   ./scripts/setup-db.sh
   
   # Or manually:
   npx prisma generate
   npx prisma db push
   npm run seed:dev
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:5000`

## 📚 API Documentation

### Health Check
- **GET** `/health` - Check API status

### Authentication
- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - Login user
- **POST** `/api/auth/logout` - Logout user
- **POST** `/api/auth/forgot-password` - Request password reset
- **POST** `/api/auth/reset-password` - Reset password

### Users
- **GET** `/api/users/profile` - Get user profile
- **PUT** `/api/users/profile` - Update user profile
- **DELETE** `/api/users/profile` - Delete user account

### Flights
- **GET** `/api/flights` - Get all flights (with search/filter)
- **GET** `/api/flights/:id` - Get flight by ID
- **POST** `/api/flights` - Create new flight (admin only)
- **PUT** `/api/flights/:id` - Update flight (admin only)
- **DELETE** `/api/flights/:id` - Delete flight (admin only)

### Hotels
- **GET** `/api/hotels` - Get all hotels (with search/filter)
- **GET** `/api/hotels/:id` - Get hotel by ID
- **POST** `/api/hotels` - Create new hotel (admin only)
- **PUT** `/api/hotels/:id` - Update hotel (admin only)
- **DELETE** `/api/hotels/:id` - Delete hotel (admin only)

### Bookings
- **GET** `/api/bookings` - Get user bookings
- **GET** `/api/bookings/:id` - Get booking by ID
- **POST** `/api/bookings` - Create new booking
- **PUT** `/api/bookings/:id` - Update booking
- **DELETE** `/api/bookings/:id` - Cancel booking

### Payments
- **GET** `/api/payments` - Get user payments
- **GET** `/api/payments/:id` - Get payment by ID
- **POST** `/api/payments` - Process payment
- **POST** `/api/payments/:id/refund` - Process refund

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm test` - Run tests
- `npm run seed` - Seed database with sample data
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## 🗄️ Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- **User** - User accounts and authentication
- **Flight** - Flight information and availability
- **Hotel** - Hotel information and availability
- **Booking** - User bookings for flights and hotels
- **Payment** - Payment transactions

## 🔧 Environment Variables

```env
# Database
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=..."

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=5000
NODE_ENV="development"

# Email (optional)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# Cloudinary (optional)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Database Management

### Prisma Studio
View and edit your data with Prisma Studio:
```bash
npm run db:studio
```

### Database Migrations
```bash
# Create a new migration
npm run db:migrate

# Apply migrations
npx prisma migrate deploy
```

## 🚀 Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set production environment variables

3. Start the production server:
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.