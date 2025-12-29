import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Member from '@/models/Member';
import Deposit from '@/models/Deposit';
import Payment from '@/models/Payment';
import Borrowing from '@/models/Borrowing';
import { authenticate } from '@/lib/auth';

// GET /api/members/[id]/stats - Get member statistics
export async function GET(request, { params }) {
  try {
    // const { user, error } = await authenticate(request);
    // if (error) return error;

    await connectDB();

    const member = await Member.findById(params.id);

    if (!member) {
      return NextResponse.json(
        { success: false, message: 'Member not found' },
        { status: 404 }
      );
    }

    // Calculate total deposits
    const totalDeposits = await Deposit.aggregate([
      { $match: { member: member._id, status: 'confirmed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // Calculate total payments
    const totalPayments = await Payment.aggregate([
      { $match: { member: member._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // Calculate total borrowings
    const totalBorrowings = await Borrowing.aggregate([
      { $match: { member: member._id } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);

    // Active borrowings
    const activeBorrowings = await Borrowing.countDocuments({
      member: member._id,
      status: 'active'
    });

    // Overdue borrowings
    const overdueBorrowings = await Borrowing.countDocuments({
      member: member._id,
      status: 'overdue'
    });

    // Payment history (last 12 months)
    const paymentHistory = await Payment.aggregate([
      { $match: { member: member._id, status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Detailed lists
    const paymentList = await Payment.find({ member: member._id })
      .sort({ paymentDate: -1 })
      .populate('monthlyData');

    const borrowingList = await Borrowing.find({ member: member._id })
      .sort({ borrowingDate: -1 })
      .populate('monthlyData');

    return NextResponse.json({
      success: true,
      data: {
        member,
        deposits: {
          total: totalDeposits[0]?.total || 0,
          count: totalDeposits[0]?.count || 0
        },
        payments: {
          total: totalPayments[0]?.total || 0,
          count: totalPayments[0]?.count || 0
        },
        borrowings: {
          total: totalBorrowings[0]?.total || 0,
          count: totalBorrowings[0]?.count || 0,
          active: activeBorrowings,
          overdue: overdueBorrowings
        },
        paymentHistory,
        paymentList,
        borrowingList
      }
    });

  } catch (error) {
    console.error('Get member stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}