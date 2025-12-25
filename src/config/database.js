// config/database.js - Database Configuration

const config = {
  // MongoDB Configuration
  mongodb: {
    uri: process.env.DATABASE_URL || 'mongodb://localhost:27017/chitfund',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      minPoolSize: 2,
    }
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your_super_secret_jwt_key',
    expiresIn: process.env.JWT_EXPIRE || '7d',
  },

  // App Configuration
  app: {
    name: 'Chit Fund Manager',
    version: '1.0.0',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    port: process.env.PORT || 3000,
  },

  // Pagination
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },

  // Collection Settings
  collection: {
    dayOfMonth: 25, // Collection day - 25th of each month
    defaultShareAmount: 1000, // Default amount per share in rupees
  },

  // Currency Settings
  currency: {
    code: 'INR',
    symbol: '₹',
    locale: 'en-IN',
  },

  // Date Settings
  date: {
    locale: 'en-IN',
    format: {
      short: 'DD/MM/YYYY',
      long: 'DD MMM YYYY',
      full: 'DD MMMM YYYY',
    }
  },

  // Payment Methods
  paymentMethods: [
    { value: 'cash', label: 'Cash' },
    { value: 'upi', label: 'UPI' },
    { value: 'neft', label: 'NEFT' },
    { value: 'rtgs', label: 'RTGS' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'other', label: 'Other' },
  ],

  // Borrowing Status
  borrowingStatus: [
    { value: 'active', label: 'Active', color: 'blue' },
    { value: 'repaid', label: 'Repaid', color: 'green' },
    { value: 'partial', label: 'Partial', color: 'yellow' },
    { value: 'overdue', label: 'Overdue', color: 'red' },
  ],

  // Payment Status
  paymentStatus: [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'failed', label: 'Failed', color: 'red' },
    { value: 'cancelled', label: 'Cancelled', color: 'gray' },
  ],

  // Default Interest Rate
  defaultInterestRate: 2, // 2% per month

  // Admin Settings
  admin: {
    email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@chitfund.com',
    password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123',
  },
}

export default config