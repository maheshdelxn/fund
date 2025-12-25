import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // In JWT authentication, logout is handled on client side by removing token
    // This endpoint is here for consistency and can be used for logging/tracking
    
    return NextResponse.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}