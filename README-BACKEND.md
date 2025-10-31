# AeroLux Backend API Setup

## 🎉 Congratulations! Your frontend is now connected to a real backend database!

## Architecture

- **Frontend**: React Native (Expo) - Mobile app
- **Backend**: Express.js + TypeScript - REST API
- **Database**: PostgreSQL (via Prisma Accelerate)
- **ORM**: Prisma

## Setup Instructions

### 1. Database Setup (Already Done!)

Your PostgreSQL database is already configured via Prisma Accelerate in `.env`:
```
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/..."
```

### 2. Start the Backend API Server

Open a **separate terminal** and run:

```bash
npm run server
```

The API server will start on `http://localhost:3000`

You should see:
```
🚀 AeroLux API Server running on http://localhost:3000
```

### 3. Start the Frontend (Expo)

In your **original terminal**, run:

```bash
npm start
```

or

```bash
npx expo start
```

## How It Works

When you fill out forms in the React Native app, the data now flows like this:

1. **User fills form** → (e.g., signup, create hotel, make booking)
2. **Frontend calls API** → `app/services/api.ts` sends HTTP request
3. **Backend receives request** → Express routes in `server/routes/`
4. **Database operation** → Prisma saves to PostgreSQL
5. **Response back to app** → Data is displayed in the UI

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account (sends confirmation email)
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/forgot-password` - Request password reset (emails a 6-digit code, 15 min expiry)
- `POST /api/auth/reset-password` - Reset password with code (sends confirmation email)

### Hotels
- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/search?name=&city=` - Search hotels
- `POST /api/hotels` - Create hotel (admin)
- `PUT /api/hotels/:id` - Update hotel (admin)
- `DELETE /api/hotels/:id` - Delete hotel (admin)

### Bookings
- `GET /api/bookings/user/:userId` - Get user's bookings
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/:id/status` - Update booking status
- `PATCH /api/bookings/:id/pay` - Mark booking as paid
- `DELETE /api/bookings/:id` - Delete booking

### Users (Admin)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Payments
- `GET /api/payments/user/:userId` - Get user's payments
- `POST /api/payments` - Create payment
- `PATCH /api/payments/:id` - Update payment status

### Notifications
Notifications storage has been removed. Endpoints remain but return no-op responses for app compatibility.
- `GET /api/notifications/user/:userId` → returns an empty list
- `POST /api/notifications` → returns a no-op message
- `PATCH /api/notifications/:id/read` → returns a no-op message

## Testing the Connection

### Method 1: Use the App
1. Start both the backend server (`npm run server`) and frontend (`npm start`)
2. Open the app in Expo Go or simulator
3. Try creating an account on the signup screen
4. The data will be saved to your PostgreSQL database!

### Method 2: Test API Directly

Use curl or Postman to test:

```bash
# Health check
curl http://localhost:3000/health

# Create a user
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User",
    "phone": "+1234567890"
  }'
```

### Method 3: Check Database

Run Prisma Studio to view your database:

```bash
npx prisma studio
```

This opens a GUI at `http://localhost:5555` where you can see all your data!


## Email configuration

Set these environment variables to enable real email sending (otherwise emails log to console in dev):
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `FROM_EMAIL` (e.g. no-reply@aerolux.com), `FROM_NAME` (e.g. AeroLux)

## Troubleshooting

### Server won't start
- Make sure port 3000 is not in use
- Check `.env` file has correct DATABASE_URL

### Frontend can't connect
- Make sure backend server is running
- Check `app.json` has correct `apiUrl` in `extra` section
- For physical device, change `localhost` to your computer's IP address

### Database errors
- Run `npx prisma generate` to regenerate Prisma Client
- Check DATABASE_URL in `.env` is correct

## Development Workflow

**Always run BOTH servers when developing:**

1. **Terminal 1** (Backend):
   ```bash
   npm run server
   ```

2. **Terminal 2** (Frontend):
   ```bash
   npm start
   ```

Now when you create hotels, make bookings, or sign up users in your app, everything is **saved to your real PostgreSQL database**! 🎉

## What Changed from Mock Data?

Before: `app/services/database.ts` stored data in memory (lost on restart)

Now: `app/services/api.ts` calls real backend → saves to PostgreSQL (persistent!)

The old mock service is still there for reference, but your app now uses the real API.

## Next Steps

- Add authentication middleware to protect admin routes
- Implement JWT token storage in the app
- Add user session management
- Deploy backend to production (Railway, Render, etc.)
- Update API_URL in `.env` for production
