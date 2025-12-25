import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import connectDB from './db';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET;

// Generate JWT token
export const generateToken = (userId, email, role) => {
  return jwt.sign(
    { id: userId, email, role },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Verify JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Get user from request
export const getUserFromRequest = async (request) => {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return null;
    }

    await connectDB();
    const user = await User.findById(decoded.id).select('-password');

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
};

// Authentication middleware for API routes
export const authenticate = async (request) => {
  const user = await getUserFromRequest(request);

  if (!user) {
    return {
      error: NextResponse.json(
        { success: false, message: 'Unauthorized. Please login.' },
        { status: 401 }
      )
    };
  }

  return { user };
};

// Authorization middleware - check roles
export const authorize = (user, allowedRoles = []) => {
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return {
      error: NextResponse.json(
        { 
          success: false, 
          message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
        },
        { status: 403 }
      )
    };
  }

  return { authorized: true };
};

// Extract token from cookies or headers
export const getTokenFromRequest = (request) => {
  // Try to get from Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  // Try to get from cookies
  const cookies = request.cookies;
  const token = cookies.get('token');
  
  return token?.value || null;
};