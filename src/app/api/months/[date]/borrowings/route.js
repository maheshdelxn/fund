// app/api/months/[date]/borrowings/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import MonthlyData from '@/models/MonthlyData';
import Member from '@/models/Member';
import Borrowing from '@/models/Borrowing';

export async function POST(request, { params }) {
  try {
    await connectDB();
    const { date } = await params; // FIXED: await params
    const body = await request.json();
    
    const { memberId, amount, guarantors } = body;
    
    const dateObj = new Date(date);
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();
    
    const monthlyData = await MonthlyData.getOrCreate(month, year);
    
    const member = await Member.findById(memberId);
    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }
    
    const previousPrincipal = member.currentPrincipal || 0;
    const newPrincipal = previousPrincipal + amount;
    const loanType = member.isBorrower ? 'additional' : 'initial';
    
    const borrowing = await Borrowing.create({
      monthlyData: monthlyData._id,
      member: memberId,
      amount,
      guarantors: guarantors || [],
      previousPrincipal,
      newPrincipal,
      loanType
    });
    
    member.isBorrower = true;
    member.borrowedAmount = (member.borrowedAmount || 0) + amount;
    member.currentPrincipal = newPrincipal;
    
    member.loanHistory.push({
      date: new Date(),
      amount,
      type: loanType,
      guarantors: guarantors || [],
      monthlyData: monthlyData._id
    });
    
    await member.save();
    
    return NextResponse.json({
      success: true,
      data: borrowing
    });
  } catch (error) {
    console.error('Error processing borrowing:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}