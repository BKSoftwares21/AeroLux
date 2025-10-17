# AeroLux API - Separate Repository Setup

This is the backend API for the AeroLux travel booking application. It should be deployed and run separately from the React Native frontend.

## 🏗️ Repository Structure

```
aerolux-api/
├── api/
│   ├── app.js                 # Main application entry point
│   └── routes/
│       ├── users.js           # User management & auth
│       ├── flights.js         # Flight operations
│       ├── hotels.js          # Hotel operations
│       ├── bookings.js        # Booking management
│       ├── payments.js        # Payment processing
│       └── notifications.js   # Notification system
├── database/
│   └── schema.sql             # Database schema
├── scripts/
│   ├── setup-database.js      # Database setup
│   └── seed-database.js       # Sample data seeding
├── package.json
├── .env.example
├── README.md
└── .gitignore
```

## 🚀 Quick Setup

1. **Clone this repository**
   ```bash
   git clone <this-repo-url> aerolux-api
   cd aerolux-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up database**
   ```bash
   npm run db:setup
   npm run db:seed
   ```

5. **Start the API server**
   ```bash
   npm run dev
   ```

## 🌐 API Base URL

Once running, your API will be available at:
- **Development**: `http://localhost:3000`
- **Production**: `https://your-api-domain.com`

## 🔗 Frontend Integration

In your React Native app, update your API calls to point to this backend:

```javascript
// Example API configuration
const API_BASE_URL = 'http://localhost:3000/api'; // Development
// const API_BASE_URL = 'https://your-api-domain.com/api'; // Production

// Example API call
const response = await fetch(`${API_BASE_URL}/flights?departure_airport=JNB&arrival_airport=CDG`);
```

## 📱 React Native App Changes Needed

You'll need to update your React Native app to:

1. **Replace mock data** with actual API calls
2. **Add authentication** using JWT tokens
3. **Update API endpoints** to match the backend
4. **Handle loading states** and error responses

## 🚀 Deployment Options

### Option 1: Cloud Platforms
- **Heroku**: Easy deployment with PostgreSQL addon
- **Railway**: Simple deployment with database
- **DigitalOcean App Platform**: Scalable hosting
- **AWS/GCP/Azure**: Enterprise-grade hosting

### Option 2: VPS/Server
- **Docker**: Containerized deployment
- **PM2**: Process management
- **Nginx**: Reverse proxy

## 🔧 Environment Variables

Create a `.env` file with:

```env
# Server
PORT=3000
NODE_ENV=production

# Database
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=aerolux
DB_USER=your-db-user
DB_PASSWORD=your-db-password

# JWT
JWT_SECRET=your-super-secret-jwt-key

# CORS
FRONTEND_URL=https://your-frontend-domain.com
```

## 📊 Database

The API uses PostgreSQL with a comprehensive schema supporting:
- User management
- Flight bookings
- Hotel bookings
- Payment processing
- Notifications
- Admin functionality

## 🔐 Authentication

The API uses JWT tokens. Include in your React Native app:

```javascript
// Login
const response = await fetch(`${API_BASE_URL}/users/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { token, user } = await response.json();

// Use token in subsequent requests
const apiCall = await fetch(`${API_BASE_URL}/bookings`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## 📝 Next Steps

1. **Deploy this API** to your chosen platform
2. **Update your React Native app** to use the API endpoints
3. **Test the integration** between frontend and backend
4. **Configure production environment** variables
5. **Set up monitoring** and logging

## 🆘 Support

If you need help with:
- API integration in React Native
- Deployment setup
- Database configuration
- Authentication implementation

Feel free to ask for assistance!