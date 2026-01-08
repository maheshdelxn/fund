// API client for making requests from frontend

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Get token from localStorage
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Set token to localStorage
export const setToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

// Remove token from localStorage
export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

// Base fetch wrapper
const apiFetch = async (endpoint, options = {}) => {
  const token = getToken();

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  login: async ({ email, password }) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.success && data.data.token) {
      setToken(data.data.token);
    }

    return data;
  },

  register: async ({ name, email, password }) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    if (data.success && data.data.token) {
      setToken(data.data.token);
    }

    return data;
  },

  logout: async () => {
    removeToken();
    return { success: true };
  },

  getMe: async () => {
    return await apiFetch('/auth/me');
  },
};

// Members API
export const membersAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiFetch(`/members${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id) => {
    return await apiFetch(`/members/${id}`);
  },

  create: async (memberData) => {
    return await apiFetch('/members', {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  },

  update: async (id, memberData) => {
    return await apiFetch(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(memberData),
    });
  },

  delete: async (id) => {
    return await apiFetch(`/members/${id}`, {
      method: 'DELETE',
    });
  },

  getStats: async (id) => {
    return await apiFetch(`/members/${id}/stats`);
  },
};

// Deposits API
export const depositsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiFetch(`/deposits${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id) => {
    return await apiFetch(`/deposits/${id}`);
  },

  create: async (depositData) => {
    return await apiFetch('/deposits', {
      method: 'POST',
      body: JSON.stringify(depositData),
    });
  },

  update: async (id, depositData) => {
    return await apiFetch(`/deposits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(depositData),
    });
  },

  delete: async (id) => {
    return await apiFetch(`/deposits/${id}`, {
      method: 'DELETE',
    });
  },

  getStats: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiFetch(`/deposits/stats${queryString ? `?${queryString}` : ''}`);
  },
};

// Monthly Data API
export const monthsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return await apiFetch(`/months${queryString ? `?${queryString}` : ''}`);
  },

  getByDate: async (date) => {
    return await apiFetch(`/months/${date}`);
  },

  addPayment: async (date, paymentData) => {
    return await apiFetch(`/months/${date}/payments`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  updatePayment: async (date, paymentId, paymentData) => {
    return await apiFetch(`/months/${date}/payments/${paymentId}`, {
      method: 'PUT',
      body: JSON.stringify(paymentData),
    });
  },

  deletePayment: async (date, paymentId) => {
    return await apiFetch(`/months/${date}/payments/${paymentId}`, {
      method: 'DELETE',
    });
  },

  addBorrowing: async (date, borrowingData) => {
    return await apiFetch(`/months/${date}/borrowings`, {
      method: 'POST',
      body: JSON.stringify(borrowingData),
    });
  },

  updateBorrowing: async (date, borrowingId, borrowingData) => {
    return await apiFetch(`/months/${date}/borrowings/${borrowingId}`, {
      method: 'PUT',
      body: JSON.stringify(borrowingData),
    });
  },

  deleteBorrowing: async (date, borrowingId) => {
    return await apiFetch(`/months/${date}/borrowings/${borrowingId}`, {
      method: 'DELETE',
    });
  },

  create: async (monthData) => {
    return await apiFetch('/months', {
      method: 'POST',
      body: JSON.stringify(monthData),
    });
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    return await apiFetch('/dashboard/stats');
  },

  getOverview: async () => {
    return await apiFetch('/dashboard');
  },
};