import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Member from '@/models/Member';
import Deposit from '@/models/Deposit';
import Payment from '@/models/Payment';
import Borrowing from '@/models/Borrowing';
import MonthlyData from '@/models/MonthlyData';
import { authenticate } from '@/lib/auth';

// GET /api/dashboard - Get dashboard overview data
export async function GET(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    await connectDB();

    // Get current date info
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Total active members
    const totalMembers = await Member.countDocuments({ isActive: true });

    // Total fund (sum of all confirmed deposits)
    const depositStats = await Deposit.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalCount: { $sum: 1 }
        }
      }
    ]);

    // Recent deposits (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentDeposits = await Deposit.aggregate([
      {
        $match: {
          status: 'confirmed',
          date: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Current month data
    let currentMonthData = await MonthlyData.findOne({
      month: currentMonth,
      year: currentYear
    })
      .populate({
        path: 'payments',
        populate: { path: 'member', select: 'name' }
      })
      .populate({
        path: 'borrowings',
        populate: { path: 'member', select: 'name' }
      });

    // Create current month data if doesn't exist
    if (!currentMonthData) {
      currentMonthData = await MonthlyData.getOrCreate(currentMonth, currentYear);
      currentMonthData = await MonthlyData.findById(currentMonthData._id)
        .populate({
          path: 'payments',
          populate: { path: 'member', select: 'name' }
        })
        .populate({
          path: 'borrowings',
          populate: { path: 'member', select: 'name' }
        });
    }

    // Get last 12 months data
    const last12Months = await MonthlyData.find({
      $or: [
        { year: currentYear },
        { year: currentYear - 1, month: { $gt: currentMonth } }
      ]
    })
      .sort({ year: -1, month: -1 })
      .limit(12);

    // Active borrowings
    const activeBorrowings = await Borrowing.countDocuments({ status: 'active' });

    // Overdue borrowings
    const overdueBorrowings = await Borrowing.countDocuments({ status: 'overdue' });

    // Total collections this year
    const yearlyCollections = await MonthlyData.aggregate([
      { $match: { year: currentYear } },
      {
        $group: {
          _id: null,
          totalCollected: { $sum: '$totalCollected' },
          totalGiven: { $sum: '$totalGiven' }
        }
      }
    ]);

    // Recent activities (last 10 payments and borrowings)
    const recentPayments = await Payment.find()
      .populate('member', 'name')
      .populate('monthlyData', 'monthName year')
      .sort({ paymentDate: -1 })
      .limit(5);

    const recentBorrowings = await Borrowing.find()
      .populate('member', 'name')
      .populate('monthlyData', 'monthName year')
      .sort({ borrowingDate: -1 })
      .limit(5);

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalMembers,
          totalFund: depositStats[0]?.totalAmount || 0,
          totalDeposits: depositStats[0]?.totalCount || 0,
          recentDeposits: recentDeposits[0]?.totalAmount || 0,
          recentDepositsCount: recentDeposits[0]?.count || 0,
          activeBorrowings,
          overdueBorrowings,
          yearlyCollected: yearlyCollections[0]?.totalCollected || 0,
          yearlyGiven: yearlyCollections[0]?.totalGiven || 0
        },
        currentMonth: currentMonthData,
        last12Months,
        recentActivities: {
          payments: recentPayments,
          borrowings: recentBorrowings
        }
      }
    });

  } catch (error) {
    console.error('Get dashboard data error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}