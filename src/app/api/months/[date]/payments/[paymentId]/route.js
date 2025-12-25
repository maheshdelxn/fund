import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import MonthlyData from '@/models/MonthlyData';
import Payment from '@/models/Payment';
import { authenticate } from '@/lib/auth';

// GET /api/months/[date]/payments/[paymentId] - Get single payment
export async function GET(request, { params }) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    await connectDB();

    const payment = await Payment.findById(params.paymentId)
      .populate('member', 'name email phone isBorrower')
      .populate('monthlyData', 'month year monthName');

    if (!payment) {
      return NextResponse.json(
        { success: false, message: 'Payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: payment
    });

  } catch (error) {
    console.error('Get payment error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}

// PUT /api/months/[date]/payments/[paymentId] - Update payment
export async function PUT(request, { params }) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    await connectDB();

    let payment = await Payment.findById(params.paymentId);

    if (!payment) {
      return NextResponse.json(
        { success: false, message: 'Payment not found' },
        { status: 404 }
      );
    }

    const { amount, shares, paymentMethod, transactionId, status, notes } = await request.json();

    const oldAmount = payment.amount;
    const newAmount = amount || oldAmount;

    // Update payment
    payment = await Payment.findByIdAndUpdate(
      params.paymentId,
      { amount: newAmount, shares, paymentMethod, transactionId, status, notes },
      { new: true, runValidators: true }
    ).populate('member', 'name email phone isBorrower');

    // Update monthly data totals if amount changed
    if (oldAmount !== newAmount) {
      const monthlyData = await MonthlyData.findById(payment.monthlyData);
      if (monthlyData) {
        monthlyData.totalCollected = monthlyData.totalCollected - oldAmount + newAmount;
        await monthlyData.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment updated successfully',
      data: payment
    });

  } catch (error) {
    console.error('Update payment error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}

// DELETE /api/months/[date]/payments/[paymentId] - Delete payment
export async function DELETE(request, { params }) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    await connectDB();

    const payment = await Payment.findById(params.paymentId);

    if (!payment) {
      return NextResponse.json(
        { success: false, message: 'Payment not found' },
        { status: 404 }
      );
    }

    // Update monthly data
    const monthlyData = await MonthlyData.findById(payment.monthlyData);
    if (monthlyData) {
      monthlyData.payments = monthlyData.payments.filter(
        p => p.toString() !== payment._id.toString()
      );
      monthlyData.totalCollected -= payment.amount;
      monthlyData.paidMembers = monthlyData.payments.length;
      await monthlyData.save();
    }

    await payment.deleteOne();

    return NextResponse.json({
      success: true,
      message: 'Payment deleted successfully'
    });

  } catch (error) {
    console.error('Delete payment error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}