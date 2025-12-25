// Format currency to Indian Rupee
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

// Format date
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Format date with time
export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Calculate share amount
export const calculateShareAmount = (shares, amountPerShare = 1000) => {
  return (shares || 0) * amountPerShare;
};

// Get month name from number
export const getMonthName = (monthNumber) => {
  const date = new Date(2024, monthNumber - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long' });
};

// Get financial year
export const getFinancialYear = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  if (month >= 3) { // April onwards
    return `FY ${year}-${(year + 1).toString().slice(-2)}`;
  } else {
    return `FY ${year - 1}-${year.toString().slice(-2)}`;
  }
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

// Validate phone number (Indian)
export const isValidPhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/[^0-9]/g, ''));
};

// Generate month key (YYYY-MM format)
export const generateMonthKey = (month, year) => {
  return `${year}-${String(month).padStart(2, '0')}`;
};

// Parse month key
export const parseMonthKey = (monthKey) => {
  const [year, month] = monthKey.split('-');
  return { year: parseInt(year), month: parseInt(month) };
};

// Get collection date (25th of the month)
export const getCollectionDate = (month, year) => {
  return new Date(year, month - 1, 25);
};

// Check if date is past collection date
export const isPastCollectionDate = (month, year) => {
  const collectionDate = getCollectionDate(month, year);
  return new Date() > collectionDate;
};

// Calculate remaining amount
export const calculateRemainingAmount = (totalCollected, totalGiven) => {
  return (totalCollected || 0) - (totalGiven || 0);
};

// Handle API errors
export const handleAPIError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    return {
      success: false,
      message: error.response.data?.message || 'An error occurred',
      errors: error.response.data?.errors || []
    };
  }
  
  return {
    success: false,
    message: error.message || 'Network error. Please try again.'
  };
};

// Pagination helper
export const getPaginationInfo = (page, limit, total) => {
  const currentPage = parseInt(page) || 1;
  const itemsPerPage = parseInt(limit) || 20;
  const totalPages = Math.ceil(total / itemsPerPage);
  
  return {
    currentPage,
    itemsPerPage,
    totalPages,
    total,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};

// Sort array of objects by key
export const sortByKey = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    if (order === 'asc') {
      return a[key] > b[key] ? 1 : -1;
    } else {
      return a[key] < b[key] ? 1 : -1;
    }
  });
};

// Group array by key
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};