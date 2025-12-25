import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Deposit from '@/models/Deposit';
import Member from '@/models/Member';
import { authenticate } from '@/lib/auth';

// GET /api/deposits/[id] - Get single deposit
export async function GET(request, { params }) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    await connectDB();

    const deposit = await Deposit.findById(params.id)
      .populate('member', 'name email phone');

    if (!deposit) {
      return NextResponse.json(
        { success: false, message: 'Deposit not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: deposit
    });

  } catch (error) {
    console.error('Get deposit error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}

// PUT /api/deposits/[id] - Update deposit
export async function PUT(request, { params }) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    await connectDB();

    let deposit = await Deposit.findById(params.id);

    if (!deposit) {
      return NextResponse.json(
        { success: false, message: 'Deposit not found' },
        { status: 404 }
      );
    }

    const { name, phone, alternatePhone, amount, shares, date, status, notes } = await request.json();

    // Calculate old and new amounts for member total update
    const oldAmount = deposit.amount;
    const newAmount = amount || oldAmount;

    // Update deposit
    deposit = await Deposit.findByIdAndUpdate(
      params.id,
      {
        name,
        phone,
        alternatePhone,
        amount: newAmount,
        shares,
        shareAmount: shares ? shares * 1000 : deposit.shareAmount,
        date,
        status,
        notes
      },
      { new: true, runValidators: true }
    ).populate('member', 'name email phone');

    // Update member's total deposits if amount changed
    if (oldAmount !== newAmount) {
      const member = await Member.findById(deposit.member);
      if (member) {
        member.totalDeposits = (member.totalDeposits || 0) - oldAmount + newAmount;
        await member.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Deposit updated successfully',
      data: deposit
    });

  } catch (error) {
    console.error('Update deposit error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}

// DELETE /api/deposits/[id] - Delete deposit
export async function DELETE(request, { params }) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    await connectDB();

    const deposit = await Deposit.findById(params.id);

    if (!deposit) {
      return NextResponse.json(
        { success: false, message: 'Deposit not found' },
        { status: 404 }
      );
    }

    // Update member's total deposits
    const member = await Member.findById(deposit.member);
    if (member) {
      member.totalDeposits = Math.max(0, (member.totalDeposits || 0) - deposit.amount);
      await member.save();
    }

    await deposit.deleteOne();

    return NextResponse.json({
      success: true,
      message: 'Deposit deleted successfully'
    });

  } catch (error) {
    console.error('Delete deposit error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}