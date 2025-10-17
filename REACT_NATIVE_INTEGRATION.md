# React Native Integration Guide

This guide shows how to integrate your existing React Native AeroLux app with the new backend API.

## 🔄 Required Changes in Your React Native App

### 1. Install Required Dependencies

```bash
npm install axios
# or
yarn add axios
```

### 2. Create API Service

Create `services/api.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://your-production-api.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### 3. Update Authentication

Replace your existing auth logic in `Login.tsx`:

```javascript
// services/auth.js
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const login = async (email, password) => {
  try {
    const response = await api.post('/users/login', { email, password });
    const { token, user } = response.data;
    
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    
    return { success: true, user, token };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Login failed' 
    };
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/users/register', userData);
    const { token, user } = response.data;
    
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    
    return { success: true, user, token };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Registration failed' 
    };
  }
};
```

### 4. Update Flight Search

Replace mock data in `SearchScreen.tsx`:

```javascript
// services/flights.js
import api from './api';

export const searchFlights = async (searchParams) => {
  try {
    const response = await api.get('/flights', { params: searchParams });
    return { success: true, flights: response.data.flights };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Search failed' 
    };
  }
};

export const getFlightDetails = async (flightId) => {
  try {
    const response = await api.get(`/flights/${flightId}`);
    return { success: true, flight: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to fetch flight details' 
    };
  }
};
```

### 5. Update Hotel Search

Replace mock data in hotel search:

```javascript
// services/hotels.js
import api from './api';

export const searchHotels = async (searchParams) => {
  try {
    const response = await api.get('/hotels', { params: searchParams });
    return { success: true, hotels: response.data.hotels };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Search failed' 
    };
  }
};

export const getHotelDetails = async (hotelId) => {
  try {
    const response = await api.get(`/hotels/${hotelId}`);
    return { success: true, hotel: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to fetch hotel details' 
    };
  }
};
```

### 6. Update Booking System

Replace booking logic in `FlightBooking.tsx` and `HotelBooking.tsx`:

```javascript
// services/bookings.js
import api from './api';

export const createFlightBooking = async (bookingData) => {
  try {
    const response = await api.post('/bookings/flight', bookingData);
    return { success: true, booking: response.data.booking };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Booking failed' 
    };
  }
};

export const createHotelBooking = async (bookingData) => {
  try {
    const response = await api.post('/bookings/hotel', bookingData);
    return { success: true, booking: response.data.booking };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Booking failed' 
    };
  }
};

export const getUserBookings = async () => {
  try {
    const response = await api.get('/bookings');
    return { success: true, bookings: response.data.bookings };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to fetch bookings' 
    };
  }
};
```

### 7. Update Payment System

Replace payment logic in `Payments.tsx`:

```javascript
// services/payments.js
import api from './api';

export const processPayment = async (paymentData) => {
  try {
    const response = await api.post('/payments', paymentData);
    return { success: true, payment: response.data.payment };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Payment failed' 
    };
  }
};

export const getPaymentHistory = async () => {
  try {
    const response = await api.get('/payments/user');
    return { success: true, payments: response.data.payments };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to fetch payments' 
    };
  }
};
```

### 8. Update User Profile

Replace profile logic in `Profile.tsx`:

```javascript
// services/profile.js
import api from './api';

export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/users/profile', profileData);
    return { success: true, user: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Profile update failed' 
    };
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    return { success: true, user: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.error || 'Failed to fetch profile' 
    };
  }
};
```

## 🔄 Example Updated Component

Here's how to update your `FlightBooking.tsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { searchFlights, createFlightBooking } from '../services/flights';
import { processPayment } from '../services/payments';

export default function FlightBooking({ route }) {
  const { flight } = route?.params || {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBook = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Create booking
      const bookingResult = await createFlightBooking({
        flight_id: flight.id,
        passenger_name: flight.passenger_name,
        passenger_email: flight.passenger_email,
        seat_class: flight.seat_class,
        seat_number: flight.seat_number
      });
      
      if (!bookingResult.success) {
        throw new Error(bookingResult.error);
      }
      
      // Process payment
      const paymentResult = await processPayment({
        booking_id: bookingResult.booking.id,
        amount: flight.price,
        payment_method: 'credit_card',
        card_number: flight.card_number,
        expiry_date: flight.expiry_date,
        cvv: flight.cvv,
        cardholder_name: flight.cardholder_name
      });
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.error);
      }
      
      // Navigate to confirmation
      router.push({
        pathname: '../screens/User/BookingConfirmationScreen',
        params: { booking: bookingResult.booking }
      });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Your existing JSX with loading states and error handling
  );
}
```

## 🚀 Deployment Steps

1. **Deploy the API** to your chosen platform
2. **Update API_BASE_URL** in your React Native app
3. **Test the integration** thoroughly
4. **Update your app store listings** with new features

## 🔧 Configuration

Create a config file for different environments:

```javascript
// config/api.js
const config = {
  development: {
    API_BASE_URL: 'http://localhost:3000/api',
  },
  production: {
    API_BASE_URL: 'https://your-api-domain.com/api',
  },
};

export default config[__DEV__ ? 'development' : 'production'];
```

This integration will transform your mock data app into a fully functional travel booking system with real backend persistence!