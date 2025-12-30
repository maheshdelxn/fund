// app/api/months/[date]/payments/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import MonthlyData from '@/models/MonthlyData';
import Member from '@/models/Member';
import Payment from '@/models/Payment';

export async function POST(request, { params }) {
  try {
    await connectDB();
    const { date } = await params; // FIXED: await params
    const body = await request.json();

    const {
      memberId,
      shareAmount,
      muddalPaid,
      interestAmount,
      penaltyAmount,
      totalAmount,
      paymentMode,
      principalBefore,
      principalAfter
    } = body;

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

    const existingPayment = await Payment.findOne({
      monthlyData: monthlyData._id,
      member: memberId,
      status: 'completed'
    });

    if (existingPayment) {
      return NextResponse.json(
        { success: false, error: 'Payment already exists for this member' },
        { status: 400 }
      );
    }

    const payment = await Payment.create({
      monthlyData: monthlyData._id,
      member: memberId,
      shareAmount,
      muddalPaid: muddalPaid || 0,
      interestAmount: interestAmount || 0,
      penaltyAmount: penaltyAmount || 0,
      totalAmount,
      paymentMode,
      principalBefore: principalBefore || member.currentPrincipal,
      principalAfter: principalAfter || member.currentPrincipal
    });

    // Verify correct calculation before saving
    if (member.isBorrower && muddalPaid > 0) {
      member.currentPrincipal = Math.max(0, member.currentPrincipal - muddalPaid);
      await member.save();
    }

    if (member.penaltyApplied) {
      member.penaltyApplied = false;
      await member.save();
    }

    // Update MonthlyData stats
    const allPayments = await Payment.find({ monthlyData: monthlyData._id, status: 'completed' });
    const totalCollected = allPayments.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);

    monthlyData.totalCollected = totalCollected;
    monthlyData.paidMembers = allPayments.length;
    // totalGiven is not changed here, but good to preserve
    monthlyData.remainingAmount = monthlyData.totalCollected - (monthlyData.totalGiven || 0);
    await monthlyData.save();

    return NextResponse.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { date } = await params; // FIXED: await params
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');

    const dateObj = new Date(date);
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();

    const monthlyData = await MonthlyData.findOne({ month, year });
    if (!monthlyData) {
      return NextResponse.json(
        { success: false, error: 'Monthly data not found' },
        { status: 404 }
      );
    }

    const payment = await Payment.findOne({
      monthlyData: monthlyData._id,
      member: memberId,
      status: 'completed'
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    const member = await Member.findById(memberId);

    if (member.isBorrower && payment.muddalPaid > 0) {
      member.currentPrincipal += payment.muddalPaid;
      await member.save();
    }

    payment.status = 'reverted';
    await payment.save();

    // Update MonthlyData stats
    const allPayments = await Payment.find({ monthlyData: monthlyData._id, status: 'completed' });
    const totalCollected = allPayments.reduce((sum, p) => sum + (Number(p.totalAmount) || 0), 0);

    monthlyData.totalCollected = totalCollected;
    monthlyData.paidMembers = allPayments.length;
    monthlyData.remainingAmount = monthlyData.totalCollected - (monthlyData.totalGiven || 0);
    await monthlyData.save();

    return NextResponse.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error reverting payment:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}