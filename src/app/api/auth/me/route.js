import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';

export async function GET(request) {
  try {
    const { user, error } = await authenticate(request);
    
    if (error) {
      return error;
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}