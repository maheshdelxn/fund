import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Member from '@/models/Member';
import Deposit from '@/models/Deposit';
import Payment from '@/models/Payment';
import Borrowing from '@/models/Borrowing';
import { authenticate } from '@/lib/auth';

// GET /api/members/[id] - Get single member
export async function GET(request, { params }) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    await connectDB();

    const member = await Member.findById(params.id);

    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }

    // Get member deposits
    const deposits = await Deposit.find({ member: member._id }).sort({ date: -1 });

    // Get member payments
    const payments = await Payment.find({ member: member._id })
      .populate('monthlyData', 'monthName year')
      .sort({ paymentDate: -1 });

    // Get member borrowings
    const borrowings = await Borrowing.find({ member: member._id })
      .populate('monthlyData', 'monthName year')
      .sort({ borrowingDate: -1 });

    return NextResponse.json({
      success: true,
      data: {
        member,
        deposits,
        payments,
        borrowings
      }
    });

  } catch (error) {
    console.error('Get member error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}

// PUT /api/members/[id] - Update member
export async function PUT(request, { params }) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    await connectDB();

    const { name, email, phone, isBorrower, isActive, notes } = await request.json();

    let member = await Member.findById(params.id);

    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }

    // Check if email or phone is being changed and already exists
    if (email && email !== member.email) {
      const existingEmail = await Member.findOne({ email, _id: { $ne: params.id } });
      if (existingEmail) {
        return NextResponse.json(
          { success: false, message: 'Email already in use by another member' },
          { status: 400 }
        );
      }
    }

    if (phone && phone !== member.phone) {
      const existingPhone = await Member.findOne({ phone, _id: { $ne: params.id } });
      if (existingPhone) {
        return NextResponse.json(
          { success: false, message: 'Phone number already in use by another member' },
          { status: 400 }
        );
      }
    }

    member = await Member.findByIdAndUpdate(
      params.id,
      { name, email, phone, isBorrower, isActive, notes },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Member updated successfully',
      data: member
    });

  } catch (error) {
    console.error('Update member error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}

// DELETE /api/members/[id] - Delete member
export async function DELETE(request, { params }) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    await connectDB();

    const member = await Member.findById(params.id);

    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }

    // Check if member has any transactions
    const hasDeposits = await Deposit.exists({ member: member._id });
    const hasPayments = await Payment.exists({ member: member._id });
    const hasBorrowings = await Borrowing.exists({ member: member._id });

    if (hasDeposits || hasPayments || hasBorrowings) {
      // Soft delete - deactivate the member
      member.isActive = false;
      await member.save();

      return NextResponse.json({
        success: true,
        message: 'Member has existing transactions and has been deactivated',
        data: member
      });
    }

    // Hard delete if no transactions
    await member.deleteOne();

    return NextResponse.json({
      success: true,
      message: 'Member deleted successfully'
    });

  } catch (error) {
    console.error('Delete member error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}