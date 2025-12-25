// src/utils/validations.js - Validation Functions

import { VALIDATION } from './constants'

/**
 * Validate email address
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false
  return VALIDATION.EMAIL_REGEX.test(email.trim())
}

/**
 * Validate Indian phone number
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false
  const cleanPhone = phone.replace(/[^0-9]/g, '')
  return VALIDATION.PHONE_REGEX.test(cleanPhone)
}

/**
 * Validate password
 */
export const isValidPassword = (password) => {
  if (!password || typeof password !== 'string') return false
  return password.length >= VALIDATION.MIN_PASSWORD_LENGTH
}

/**
 * Validate name
 */
export const isValidName = (name) => {
  if (!name || typeof name !== 'string') return false
  const trimmedName = name.trim()
  return trimmedName.length >= VALIDATION.MIN_NAME_LENGTH && 
         trimmedName.length <= VALIDATION.MAX_NAME_LENGTH
}

/**
 * Validate amount (must be positive number)
 */
export const isValidAmount = (amount) => {
  const num = parseFloat(amount)
  return !isNaN(num) && num > 0
}

/**
 * Validate shares (must be positive integer)
 */
export const isValidShares = (shares) => {
  const num = parseInt(shares)
  return !isNaN(num) && num > 0 && Number.isInteger(num)
}

/**
 * Validate date (must be valid date string)
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date)
}

/**
 * Validate required field
 */
export const isRequired = (value) => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (typeof value === 'number') return !isNaN(value)
  return true
}

/**
 * Validate form data for member
 */
export const validateMemberForm = (data) => {
  const errors = {}

  if (!isRequired(data.name)) {
    errors.name = 'Name is required'
  } else if (!isValidName(data.name)) {
    errors.name = 'Name must be 2-100 characters'
  }

  if (!isRequired(data.email)) {
    errors.email = 'Email is required'
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Invalid email address'
  }

  if (!isRequired(data.phone)) {
    errors.phone = 'Phone number is required'
  } else if (!isValidPhone(data.phone)) {
    errors.phone = 'Invalid phone number (should be 10 digits starting with 6-9)'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate form data for deposit
 */
export const validateDepositForm = (data) => {
  const errors = {}

  if (!isRequired(data.name)) {
    errors.name = 'Name is required'
  }

  if (!isRequired(data.phone)) {
    errors.phone = 'Phone number is required'
  } else if (!isValidPhone(data.phone)) {
    errors.phone = 'Invalid phone number'
  }

  if (!isRequired(data.amount)) {
    errors.amount = 'Amount is required'
  } else if (!isValidAmount(data.amount)) {
    errors.amount = 'Amount must be a positive number'
  }

  if (!isRequired(data.shares)) {
    errors.shares = 'Number of shares is required'
  } else if (!isValidShares(data.shares)) {
    errors.shares = 'Shares must be a positive integer'
  }

  if (!isRequired(data.date)) {
    errors.date = 'Date is required'
  } else if (!isValidDate(data.date)) {
    errors.date = 'Invalid date'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate form data for payment
 */
export const validatePaymentForm = (data) => {
  const errors = {}

  if (!isRequired(data.memberId)) {
    errors.memberId = 'Please select a member'
  }

  if (!isRequired(data.amount)) {
    errors.amount = 'Amount is required'
  } else if (!isValidAmount(data.amount)) {
    errors.amount = 'Amount must be a positive number'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate form data for borrowing
 */
export const validateBorrowingForm = (data) => {
  const errors = {}

  if (!isRequired(data.memberId)) {
    errors.memberId = 'Please select a member'
  }

  if (!isRequired(data.amount)) {
    errors.amount = 'Amount is required'
  } else if (!isValidAmount(data.amount)) {
    errors.amount = 'Amount must be a positive number'
  }

  if (data.interestRate !== undefined && data.interestRate !== '') {
    const rate = parseFloat(data.interestRate)
    if (isNaN(rate) || rate < 0) {
      errors.interestRate = 'Interest rate must be a non-negative number'
    }
  }

  if (data.dueDate && !isValidDate(data.dueDate)) {
    errors.dueDate = 'Invalid due date'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate login form
 */
export const validateLoginForm = (data) => {
  const errors = {}

  if (!isRequired(data.email)) {
    errors.email = 'Email is required'
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Invalid email address'
  }

  if (!isRequired(data.password)) {
    errors.password = 'Password is required'
  } else if (!isValidPassword(data.password)) {
    errors.password = 'Password must be at least 6 characters'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Sanitize string input (remove extra spaces, trim)
 */
export const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return ''
  return str.trim().replace(/\s+/g, ' ')
}

/**
 * Sanitize phone number (remove non-numeric characters)
 */
export const sanitizePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return ''
  return phone.replace(/[^0-9]/g, '')
}

/**
 * Sanitize email (trim and lowercase)
 */
export const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') return ''
  return email.trim().toLowerCase()
}

/**
 * Format validation errors for display
 */
export const formatValidationErrors = (errors) => {
  if (!errors || typeof errors !== 'object') return ''
  const errorMessages = Object.values(errors)
  return errorMessages.join(', ')
}