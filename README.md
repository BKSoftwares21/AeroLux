# AeroLux Travel Booking API

A comprehensive backend API for a travel booking system supporting flights and hotels with user management, payments, and notifications.

## 🚀 Features

- **User Management**: Registration, authentication, profile management
- **Flight Booking**: Search, book, and manage flight reservations
- **Hotel Booking**: Search, book, and manage hotel reservations
- **Payment Processing**: Secure payment handling with refund support
- **Admin Panel**: Complete admin functionality for managing users, bookings, and content
- **Notifications**: Real-time notifications for users
- **Database**: PostgreSQL with comprehensive schema

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aerolux-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   npm run db:setup
   ```

5. **Seed the database with sample data**
   ```bash
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

The database includes the following main tables:

- **users**: User accounts and profiles
- **airlines**: Airline information
- **airports**: Airport data with coordinates
- **flights**: Flight schedules and pricing
- **hotels**: Hotel information and amenities
- **hotel_rooms**: Room types and availability
- **bookings**: Booking records (both flights and hotels)
- **flight_bookings**: Flight-specific booking details
- **hotel_bookings**: Hotel-specific booking details
- **payments**: Payment transactions
- **notifications**: User notifications
- **user_sessions**: Authentication sessions

## 🔌 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Flights
- `GET /api/flights` - Search flights
- `GET /api/flights/:id` - Get flight details
- `GET /api/flights/airports` - Get airports list
- `GET /api/flights/airlines` - Get airlines list

### Hotels
- `GET /api/hotels` - Search hotels
- `GET /api/hotels/:id` - Get hotel details
- `GET /api/hotels/:id/rooms` - Get hotel rooms

### Bookings
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings/flight` - Create flight booking
- `POST /api/bookings/hotel` - Create hotel booking
- `PUT /api/bookings/:id/status` - Update booking status (admin)
- `DELETE /api/bookings/:id` - Cancel booking

### Payments
- `POST /api/payments` - Process payment
- `GET /api/payments/booking/:id` - Get booking payments
- `GET /api/payments/user` - Get user payment history
- `POST /api/payments/refund` - Process refund (admin)

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### Admin Endpoints
- `GET /api/users` - Get all users (admin)
- `POST /api/users` - Create user (admin)
- `PUT /api/users/:id` - Update user (admin)
- `DELETE /api/users/:id` - Delete user (admin)
- `GET /api/bookings/admin/all` - Get all bookings (admin)
- `GET /api/notifications/admin/all` - Get all notifications (admin)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 📊 Sample Data

The seeding script creates:
- 8 Airlines
- 10 Airports worldwide
- 5 Hotels with 15 rooms total
- 20 Sample flights
- 2 Users (admin and regular user)

**Default Admin Credentials:**
- Email: `admin@aerolux.com`
- Password: `admin123`

**Default User Credentials:**
- Email: `john@example.com`
- Password: `user123`

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📝 API Documentation

### Example API Calls

**Search Flights:**
```bash
curl -X GET "http://localhost:3000/api/flights?departure_airport=JNB&arrival_airport=CDG&departure_date=2024-01-15&passengers=1"
```

**Create Flight Booking:**
```bash
curl -X POST "http://localhost:3000/api/bookings/flight" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "flight_id": "flight-uuid",
    "passenger_name": "John Doe",
    "passenger_email": "john@example.com",
    "seat_class": "economy"
  }'
```

**Search Hotels:**
```bash
curl -X GET "http://localhost:3000/api/hotels?city=Paris&check_in_date=2024-01-15&check_out_date=2024-01-18&guests=2"
```

## 🚀 Deployment

1. **Production Environment Variables**
   - Set `NODE_ENV=production`
   - Use strong JWT secret
   - Configure production database
   - Set up proper CORS origins

2. **Database Migration**
   ```bash
   npm run db:migrate
   ```

3. **Start Production Server**
   ```bash
   npm start
   ```

## 🔧 Configuration

Key environment variables:

- `PORT`: Server port (default: 3000)
- `DB_HOST`: Database host
- `DB_NAME`: Database name
- `JWT_SECRET`: JWT signing secret
- `FRONTEND_URL`: Frontend URL for CORS

## 📈 Monitoring

- Health check: `GET /health`
- Request logging with Morgan
- Error handling and logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

**AeroLux API** - Making travel booking simple and efficient! ✈️🏨