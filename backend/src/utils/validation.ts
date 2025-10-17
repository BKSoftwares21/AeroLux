import { body } from 'express-validator';

export const validateUserRegistration = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
    .custom((value) => {
      const age = new Date().getFullYear() - new Date(value).getFullYear();
      if (age < 18) {
        throw new Error('User must be at least 18 years old');
      }
      return true;
    }),
  
  body('idOrPassport')
    .optional()
    .isLength({ min: 5, max: 20 })
    .withMessage('ID/Passport must be between 5 and 20 characters')
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

export const validatePasswordReset = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
];

export const validatePasswordUpdate = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

export const validateFlightSearch = [
  body('departure')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Departure airport code must be 3 characters'),
  
  body('arrival')
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage('Arrival airport code must be 3 characters'),
  
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  body('passengers')
    .optional()
    .isInt({ min: 1, max: 9 })
    .withMessage('Passengers must be between 1 and 9'),
  
  body('class')
    .optional()
    .isIn(['economy', 'business', 'first'])
    .withMessage('Class must be economy, business, or first')
];

export const validateHotelSearch = [
  body('location')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  
  body('checkIn')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid check-in date'),
  
  body('checkOut')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid check-out date'),
  
  body('guests')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Guests must be between 1 and 10'),
  
  body('rooms')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rooms must be between 1 and 5')
];