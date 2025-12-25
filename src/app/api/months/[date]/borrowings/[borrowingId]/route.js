import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import MonthlyData from '@/models/MonthlyData';
import Borrowing from '@/models/Borrowing';
import Member from '@/models/Member';
import { authenticate } from '@/lib/auth';

// GET /api/months/[date]/borrowings/[borrowingId] - Get single borrowing
export async function GET(request, { params }) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    await connectDB();

    const borrowing = await Borrowing.findById(params.borrowingId)
      .populate('member', 'name email phone isBorrower')
      .populate('monthlyData', 'month year monthName');

    if (!borrowing) {
      return NextResponse.json(
        { success: false, message: 'Borrowing not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: borrowing
    });

  } catch (error) {
    console.error('Get borrowing error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}

// PUT /api/months/[date]/borrowings/[borrowingId] - Update borrowing
export async function PUT(request, { params }) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    await connectDB();

    let borrowing = await Borrowing.findById(params.borrowingId);

    if (!borrowing) {
      return NextResponse.json(
        { success: false, message: 'Borrowing not found' },
        { status: 404 }
      );
    }

    const { 
      amount, 
      interestRate, 
      dueDate, 
      repaymentAmount, 
      repaymentDate,
      status, 
      paymentMethod, 
      transactionId, 
      notes 
    } = await request.json();

    const oldAmount = borrowing.amount;
    const newAmount = amount || oldAmount;

    // Calculate interest if rate changed
    let interestAmount = borrowing.interestAmount;
    if (interestRate !== undefined) {
      interestAmount = (newAmount * interestRate) / 100;
    }

    // Update borrowing
    borrowing = await Borrowing.findByIdAndUpdate(
      params.borrowingId,
      { 
        amount: newAmount, 
        interestRate, 
        interestAmount,
        dueDate, 
        repaymentAmount,
        repaymentDate,
        status, 
        paymentMethod, 
        transactionId, 
        notes 
      },
      { new: true, runValidators: true }
    ).populate('member', 'name email phone isBorrower');

    // Update monthly data totals if amount changed
    if (oldAmount !== newAmount) {
      const monthlyData = await MonthlyData.findById(borrowing.monthlyData);
      if (monthlyData) {
        monthlyData.totalGiven = monthlyData.totalGiven - oldAmount + newAmount;
        await monthlyData.save();
      }

      // Update member's total borrowed
      const member = await Member.findById(borrowing.member);
      if (member) {
        member.totalBorrowed = (member.totalBorrowed || 0) - oldAmount + newAmount;
        await member.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Borrowing updated successfully',
      data: borrowing
    });

  } catch (error) {
    console.error('Update borrowing error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}

// DELETE /api/months/[date]/borrowings/[borrowingId] - Delete borrowing
export async function DELETE(request, { params }) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    await connectDB();

    const borrowing = await Borrowing.findById(params.borrowingId);

    if (!borrowing) {
      return NextResponse.json(
        { success: false, message: 'Borrowing not found' },
        { status: 404 }
      );
    }

    // Update monthly data
    const monthlyData = await MonthlyData.findById(borrowing.monthlyData);
    if (monthlyData) {
      monthlyData.borrowings = monthlyData.borrowings.filter(
        b => b.toString() !== borrowing._id.toString()
      );
      monthlyData.totalGiven -= borrowing.amount;
      await monthlyData.save();
    }

    // Update member's total borrowed
    const member = await Member.findById(borrowing.member);
    if (member) {
      member.totalBorrowed = Math.max(0, (member.totalBorrowed || 0) - borrowing.amount);
      await member.save();
    }

    await borrowing.deleteOne();

    return NextResponse.json({
      success: true,
      message: 'Borrowing deleted successfully'
    });

  } catch (error) {
    console.error('Delete borrowing error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}