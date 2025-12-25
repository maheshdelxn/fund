// app/api/months/[date]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import MonthlyData from '@/models/MonthlyData';
import Member from '@/models/Member';
import Payment from '@/models/Payment';
import Borrowing from '@/models/Borrowing';

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    // Await params in Next.js 15
    const { date } = await params;
    
    console.log('Fetching data for date:', date);
    
    const dateObj = new Date(date);
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    
    console.log('Month:', month, 'Year:', year);
    
    // Get or create monthly data
    let monthlyData = await MonthlyData.getOrCreate(month, year);
    console.log('Monthly data retrieved:', monthlyData._id);
    
    // Get all active members
    const allMembers = await Member.find({ isActive: true }).sort({ serialNo: 1 });
    console.log('Members found:', allMembers.length);
    
    // Get payments for this month
    const payments = await Payment.find({ 
      monthlyData: monthlyData._id,
      status: 'completed'
    }).populate('member');
    console.log('Payments found:', payments.length);
    
    // Get borrowings for this month
    const borrowings = await Borrowing.find({ 
      monthlyData: monthlyData._id,
      status: 'active'
    }).populate('member');
    console.log('Borrowings found:', borrowings.length);
    
    // Calculate totals with proper null checks - FIXED
    const totalCollected = payments.reduce((sum, p) => {
      const amount = Number(p.totalAmount) || 0;
      return sum + amount;
    }, 0);
    
    const totalGiven = borrowings.reduce((sum, b) => {
      const amount = Number(b.amount) || 0;
      return sum + amount;
    }, 0);
    
    const paidMembers = payments.length;
    
    console.log('Calculations:', { totalCollected, totalGiven, paidMembers });
    
    // Validate numbers before saving - FIXED
    if (isNaN(totalCollected) || isNaN(totalGiven)) {
      console.error('Invalid calculations:', { totalCollected, totalGiven });
      return NextResponse.json(
        { success: false, error: 'Invalid calculation results' },
        { status: 500 }
      );
    }
    
    // Update monthly data with validated numbers
    monthlyData.totalCollected = totalCollected;
    monthlyData.totalGiven = totalGiven;
    monthlyData.paidMembers = paidMembers;
    monthlyData.totalMembers = allMembers.length;
    
    await monthlyData.save();
    
    console.log('Monthly data updated successfully');
    
    // Format response
    const monthlyDataResponse = {
      ...monthlyData.toObject(),
      _id: monthlyData._id.toString(),
      payments: payments.map(p => {
        const member = p.member;
        return {
          ...p.toObject(),
          _id: p._id.toString(),
          memberId: member?._id ? member._id.toString() : (member ? member.toString() : null),
          member: member?._id ? {
            ...member.toObject(),
            _id: member._id.toString(),
            id: member._id.toString()
          } : member
        };
      }),
      borrowings: borrowings.map(b => {
        const member = b.member;
        return {
          ...b.toObject(),
          _id: b._id.toString(),
          memberId: member?._id ? member._id.toString() : (member ? member.toString() : null),
          member: member?._id ? {
            ...member.toObject(),
            _id: member._id.toString(),
            id: member._id.toString()
          } : member
        };
      })
    };
    
    return NextResponse.json({
      success: true,
      data: {
        monthlyData: monthlyDataResponse,
        allMembers: allMembers.map(m => ({
          ...m.toObject(),
          id: m._id.toString(),
          _id: m._id.toString()
        })),
        payments: payments.map(p => ({
          ...p.toObject(),
          _id: p._id.toString(),
          member: p.member?._id ? {
            ...p.member.toObject(),
            _id: p.member._id.toString(),
            id: p.member._id.toString()
          } : p.member
        })),
        borrowings: borrowings.map(b => ({
          ...b.toObject(),
          _id: b._id.toString(),
          member: b.member?._id ? {
            ...b.member.toObject(),
            _id: b.member._id.toString(),
            id: b.member._id.toString()
          } : b.member
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching month data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}