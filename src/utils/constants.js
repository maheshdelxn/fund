// src/utils/constants.js - Application Constants

// API Endpoints Base
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
}

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  UPI: 'upi',
  NEFT: 'neft',
  RTGS: 'rtgs',
  CHEQUE: 'cheque',
  OTHER: 'other',
}

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH]: 'Cash',
  [PAYMENT_METHODS.UPI]: 'UPI',
  [PAYMENT_METHODS.NEFT]: 'NEFT',
  [PAYMENT_METHODS.RTGS]: 'RTGS',
  [PAYMENT_METHODS.CHEQUE]: 'Cheque',
  [PAYMENT_METHODS.OTHER]: 'Other',
}

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
}

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.PENDING]: 'Pending',
  [PAYMENT_STATUS.COMPLETED]: 'Completed',
  [PAYMENT_STATUS.FAILED]: 'Failed',
  [PAYMENT_STATUS.CANCELLED]: 'Cancelled',
}

export const PAYMENT_STATUS_COLORS = {
  [PAYMENT_STATUS.PENDING]: 'yellow',
  [PAYMENT_STATUS.COMPLETED]: 'green',
  [PAYMENT_STATUS.FAILED]: 'red',
  [PAYMENT_STATUS.CANCELLED]: 'gray',
}

// Borrowing Status
export const BORROWING_STATUS = {
  ACTIVE: 'active',
  REPAID: 'repaid',
  PARTIAL: 'partial',
  OVERDUE: 'overdue',
}

export const BORROWING_STATUS_LABELS = {
  [BORROWING_STATUS.ACTIVE]: 'Active',
  [BORROWING_STATUS.REPAID]: 'Repaid',
  [BORROWING_STATUS.PARTIAL]: 'Partially Repaid',
  [BORROWING_STATUS.OVERDUE]: 'Overdue',
}

export const BORROWING_STATUS_COLORS = {
  [BORROWING_STATUS.ACTIVE]: 'blue',
  [BORROWING_STATUS.REPAID]: 'green',
  [BORROWING_STATUS.PARTIAL]: 'yellow',
  [BORROWING_STATUS.OVERDUE]: 'red',
}

// Deposit Status
export const DEPOSIT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
}

export const DEPOSIT_STATUS_LABELS = {
  [DEPOSIT_STATUS.PENDING]: 'Pending',
  [DEPOSIT_STATUS.CONFIRMED]: 'Confirmed',
  [DEPOSIT_STATUS.CANCELLED]: 'Cancelled',
}

// Monthly Status
export const MONTHLY_STATUS = {
  UPCOMING: 'upcoming',
  CURRENT: 'current',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
}

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
}

// Month Names
export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

// Collection Day
export const COLLECTION_DAY = 25 // 25th of each month

// Share Amount
export const DEFAULT_SHARE_AMOUNT = 1000 // ₹1000 per share

// Default Interest Rate
export const DEFAULT_INTEREST_RATE = 2 // 2% per month

// Currency
export const CURRENCY = {
  CODE: 'INR',
  SYMBOL: '₹',
  LOCALE: 'en-IN',
}

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'DD/MM/YYYY',
  LONG: 'DD MMM YYYY',
  FULL: 'DD MMMM YYYY',
  ISO: 'YYYY-MM-DD',
}

// Pagination
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1,
}

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Unauthorized. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  DUPLICATE_ENTRY: 'This entry already exists.',
  UNKNOWN_ERROR: 'An unknown error occurred.',
}

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGOUT_SUCCESS: 'Logout successful!',
  MEMBER_ADDED: 'Member added successfully!',
  MEMBER_UPDATED: 'Member updated successfully!',
  MEMBER_DELETED: 'Member deleted successfully!',
  DEPOSIT_ADDED: 'Deposit added successfully!',
  DEPOSIT_UPDATED: 'Deposit updated successfully!',
  DEPOSIT_DELETED: 'Deposit deleted successfully!',
  PAYMENT_ADDED: 'Payment added successfully!',
  PAYMENT_UPDATED: 'Payment updated successfully!',
  PAYMENT_DELETED: 'Payment deleted successfully!',
  BORROWING_ADDED: 'Borrowing added successfully!',
  BORROWING_UPDATED: 'Borrowing updated successfully!',
  BORROWING_DELETED: 'Borrowing deleted successfully!',
}

// Validation Rules
export const VALIDATION = {
  EMAIL_REGEX: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  PHONE_REGEX: /^[6-9]\d{9}$/,
  MIN_PASSWORD_LENGTH: 6,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
}

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  MEMBERS: '/members',
  DEPOSITS: '/deposits',
  MONTH: '/month',
}