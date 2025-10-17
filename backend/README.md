# AeroLux Backend API

A comprehensive backend API for the AeroLux travel booking application built with Node.js, Express.js, TypeScript, and MongoDB.

## Features

- **User Authentication & Authorization**
  - User registration and login
  - JWT-based authentication
  - Password reset functionality
  - Role-based access control (User/Admin)

- **Flight Management**
  - Search and filter flights
  - CRUD operations for flights (Admin)
  - Real-time seat availability
  - Flight statistics and analytics

- **Hotel Management**
  - Search and filter hotels
  - CRUD operations for hotels (Admin)
  - Hotel ratings and amenities
  - Location-based search

- **Booking System**
  - Create and manage bookings
  - Booking status tracking
  - Cancellation and refunds
  - Booking history

- **Payment Processing**
  - Secure payment processing
  - Multiple payment methods
  - Transaction tracking
  - Refund management

- **Admin Dashboard**
  - User management
  - Content management
  - Analytics and reporting
  - System statistics

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi and Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Email**: Nodemailer
- **File Upload**: Multer (with Cloudinary support)

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/aerolux
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | User login | Public |
| GET | `/auth/me` | Get current user | Private |
| POST | `/auth/forgot-password` | Request password reset | Public |
| POST | `/auth/reset-password` | Reset password | Public |
| PUT | `/auth/update-password` | Update password | Private |

### User Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/users` | Get all users | Admin |
| GET | `/users/:id` | Get user by ID | Private |
| PUT | `/users/profile` | Update profile | Private |
| PUT | `/users/:id` | Update user | Admin |
| DELETE | `/users/:id` | Delete user | Admin |
| GET | `/users/stats` | Get user statistics | Admin |

### Flight Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/flights` | Get all flights | Public |
| GET | `/flights/search` | Search flights | Public |
| GET | `/flights/:id` | Get flight by ID | Public |
| POST | `/flights` | Create flight | Admin |
| PUT | `/flights/:id` | Update flight | Admin |
| DELETE | `/flights/:id` | Delete flight | Admin |
| GET | `/flights/stats` | Get flight statistics | Admin |

### Hotel Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/hotels` | Get all hotels | Public |
| GET | `/hotels/search` | Search hotels | Public |
| GET | `/hotels/:id` | Get hotel by ID | Public |
| POST | `/hotels` | Create hotel | Admin |
| PUT | `/hotels/:id` | Update hotel | Admin |
| DELETE | `/hotels/:id` | Delete hotel | Admin |
| GET | `/hotels/stats` | Get hotel statistics | Admin |

### Booking Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/bookings` | Create booking | Private |
| GET | `/bookings` | Get user bookings | Private |
| GET | `/bookings/:id` | Get booking by ID | Private |
| PUT | `/bookings/:id/status` | Update booking status | Private |
| PUT | `/bookings/:id/cancel` | Cancel booking | Private |
| GET | `/bookings/admin/all` | Get all bookings | Admin |
| GET | `/bookings/stats` | Get booking statistics | Admin |

### Payment Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/payments` | Process payment | Private |
| GET | `/payments` | Get user payments | Private |
| GET | `/payments/:id` | Get payment by ID | Private |
| POST | `/payments/:id/refund` | Refund payment | Private |
| GET | `/payments/stats` | Get payment statistics | Admin |

## Request/Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per 15 minutes per IP address
- Custom limits can be configured in the environment variables

## Error Handling

The API includes comprehensive error handling:
- Validation errors
- Authentication errors
- Database errors
- Custom business logic errors

## Database Models

### User
- Personal information (name, email, phone, DOB)
- Authentication data (password, tokens)
- Role-based access control

### Flight
- Flight details (number, airline, routes)
- Pricing and availability
- Class and seat information

### Hotel
- Hotel information (name, location, amenities)
- Pricing and ratings
- Room types and availability

### Booking
- User and service references
- Booking status and payment information
- Dates and passenger details

### Payment
- Transaction details
- Payment method and status
- Security and validation

## Development

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm test` - Run tests

### Project Structure
```
backend/
├── src/
│   ├── config/          # Database and configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── server.ts        # Main server file
├── uploads/             # File uploads directory
├── .env.example         # Environment variables template
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md           # This file
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation and sanitization
- SQL injection prevention (MongoDB)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.