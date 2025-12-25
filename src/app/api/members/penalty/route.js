// app/api/members/penalty/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Member from '@/models/Member';

export async function PATCH(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { memberId, penaltyApplied } = body;
    
    const member = await Member.findByIdAndUpdate(
      memberId,
      { penaltyApplied },
      { new: true }
    );
    
    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: member
    });
  } catch (error) {
    console.error('Error updating penalty:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}