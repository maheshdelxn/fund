// app/api/members/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Member from '@/models/Member';

export async function GET() {
  try {
    await connectDB();
    const members = await Member.find({ isActive: true }).sort({ serialNo: 1 });
    
    return NextResponse.json({
      success: true,
      data: members
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Auto-generate serial number
    const lastMember = await Member.findOne().sort({ serialNo: -1 });
    let serialNo = 'MBR001';
    
    if (lastMember && lastMember.serialNo) {
      const lastNum = parseInt(lastMember.serialNo.replace('MBR', ''));
      serialNo = `MBR${String(lastNum + 1).padStart(3, '0')}`;
    }
    
    const member = await Member.create({
      ...body,
      serialNo
    });
    
    return NextResponse.json({
      success: true,
      data: member
    });
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}