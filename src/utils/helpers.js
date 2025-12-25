// src/utils/helpers.js - Helper Functions

import { CURRENCY, MONTH_NAMES, COLLECTION_DAY } from './constants'

/**
 * Format number to Indian currency
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return `${CURRENCY.SYMBOL}0`
  return new Intl.NumberFormat(CURRENCY.LOCALE, {
    style: 'currency',
    currency: CURRENCY.CODE,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Format date to Indian locale
 */
export const formatDate = (date, options = {}) => {
  if (!date) return ''
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  }
  return new Date(date).toLocaleDateString(CURRENCY.LOCALE, defaultOptions)
}

/**
 * Format date with time
 */
export const formatDateTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString(CURRENCY.LOCALE, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export const formatDateISO = (date) => {
  if (!date) return ''
  return new Date(date).toISOString().split('T')[0]
}

/**
 * Get month name from number (1-12)
 */
export const getMonthName = (monthNumber) => {
  if (monthNumber < 1 || monthNumber > 12) return ''
  return MONTH_NAMES[monthNumber - 1]
}

/**
 * Get current financial year
 */
export const getFinancialYear = (date = new Date()) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  
  if (month >= 4) { // April onwards
    return `FY ${year}-${(year + 1).toString().slice(-2)}`
  } else {
    return `FY ${year - 1}-${year.toString().slice(-2)}`
  }
}

/**
 * Calculate share amount
 */
export const calculateShareAmount = (shares, amountPerShare = 1000) => {
  return (shares || 0) * amountPerShare
}

/**
 * Calculate interest amount
 */
export const calculateInterest = (amount, rate) => {
  if (!amount || !rate) return 0
  return (amount * rate) / 100
}

/**
 * Get collection date for a month
 */
export const getCollectionDate = (month, year) => {
  return new Date(year, month - 1, COLLECTION_DAY)
}

/**
 * Check if collection date has passed
 */
export const hasCollectionDatePassed = (month, year) => {
  const collectionDate = getCollectionDate(month, year)
  return new Date() > collectionDate
}

/**
 * Generate month key (YYYY-MM format)
 */
export const generateMonthKey = (month, year) => {
  return `${year}-${String(month).padStart(2, '0')}`
}

/**
 * Parse month key
 */
export const parseMonthKey = (monthKey) => {
  const [year, month] = monthKey.split('-')
  return { year: parseInt(year), month: parseInt(month) }
}

/**
 * Get relative time (e.g., "2 days ago")
 */
export const getRelativeTime = (date) => {
  if (!date) return ''
  
  const now = new Date()
  const past = new Date(date)
  const diffMs = now - past
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)
  
  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`
  if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
  
  return formatDate(date)
}

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Generate initials from name
 */
export const getInitials = (name) => {
  if (!name) return ''
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase()
}

/**
 * Get status badge color
 */
export const getStatusColor = (status) => {
  const colorMap = {
    // Payment status
    pending: 'yellow',
    completed: 'green',
    failed: 'red',
    cancelled: 'gray',
    
    // Borrowing status
    active: 'blue',
    repaid: 'green',
    partial: 'yellow',
    overdue: 'red',
    
    // Monthly status
    upcoming: 'gray',
    current: 'blue',
    archived: 'gray',
  }
  
  return colorMap[status] || 'gray'
}

/**
 * Get Tailwind classes for status badge
 */
export const getStatusBadgeClasses = (status) => {
  const color = getStatusColor(status)
  const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full'
  
  const colorClasses = {
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800',
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
  }
  
  return `${baseClasses} ${colorClasses[color] || colorClasses.gray}`
}

/**
 * Calculate percentage
 */
export const calculatePercentage = (part, total) => {
  if (!total || total === 0) return 0
  return Math.round((part / total) * 100)
}

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 0) => {
  return `${value.toFixed(decimals)}%`
}

/**
 * Sort array of objects by key
 */
export const sortByKey = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    if (order === 'asc') {
      return a[key] > b[key] ? 1 : -1
    } else {
      return a[key] < b[key] ? 1 : -1
    }
  })
}

/**
 * Group array by key
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key]
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {})
}

/**
 * Debounce function
 */
export const debounce = (func, wait = 300) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * Check if object is empty
 */
export const isEmpty = (obj) => {
  if (!obj) return true
  if (Array.isArray(obj)) return obj.length === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return false
}

/**
 * Generate random ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Download JSON as file
 */
export const downloadJSON = (data, filename = 'data.json') => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Download CSV
 */
export const downloadCSV = (data, filename = 'data.csv') => {
  if (!data || data.length === 0) return
  
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header]
      return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    }).join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Copy to clipboard
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone) => {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
  }
  return phone
}

/**
 * Get amount color class
 */
export const getAmountColorClass = (amount) => {
  if (amount > 0) return 'text-green-600'
  if (amount < 0) return 'text-red-600'
  return 'text-gray-600'
}

/**
 * Format number with Indian locale
 */
export const formatNumber = (number) => {
  if (number === undefined || number === null) return '0'
  return Number(number).toLocaleString('en-IN')
}

/**
 * Sleep/delay function
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}