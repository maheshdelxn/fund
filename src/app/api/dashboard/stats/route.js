import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Member from '@/models/Member';
import Deposit from '@/models/Deposit';
import Payment from '@/models/Payment';
import Borrowing from '@/models/Borrowing';
import MonthlyData from '@/models/MonthlyData';
import { authenticate } from '@/lib/auth';

// GET /api/dashboard/stats - Get dashboard statistics
export async function GET(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    await connectDB();

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Total members
    const totalMembers = await Member.countDocuments({ isActive: true });
    const totalBorrowers = await Member.countDocuments({ isBorrower: true, isActive: true });

    // Total fund (all deposits)
    const depositStats = await Deposit.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalShares: { $sum: '$shares' }
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
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Current month data
    let currentMonthData = await MonthlyData.findOne({
      month: currentMonth,
      year: currentYear
    });

    if (!currentMonthData) {
      currentMonthData = await MonthlyData.getOrCreate(currentMonth, currentYear);
    }

    // Total payments this year
    const yearlyPayments = await Payment.aggregate([
      {
        $lookup: {
          from: 'monthlydatas',
          localField: 'monthlyData',
          foreignField: '_id',
          as: 'monthInfo'
        }
      },
      { $unwind: '$monthInfo' },
      { $match: { 'monthInfo.year': currentYear, status: 'completed' } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Total borrowings this year
    const yearlyBorrowings = await Borrowing.aggregate([
      {
        $lookup: {
          from: 'monthlydatas',
          localField: 'monthlyData',
          foreignField: '_id',
          as: 'monthInfo'
        }
      },
      { $unwind: '$monthInfo' },
      { $match: { 'monthInfo.year': currentYear } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Borrowing status breakdown
    const borrowingStatus = await Borrowing.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Monthly trend (last 12 months)
    const monthlyTrend = await MonthlyData.find({
      $or: [
        { year: currentYear },
        { year: currentYear - 1, month: { $gt: currentMonth } }
      ]
    })
      .select('month year monthName totalCollected totalGiven remainingAmount paidMembers totalMembers')
      .sort({ year: -1, month: -1 })
      .limit(12);

    // Top contributors (members with highest total payments)
    const topContributors = await Payment.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$member',
          totalPaid: { $sum: '$amount' },
          paymentCount: { $sum: 1 }
        }
      },
      { $sort: { totalPaid: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'members',
          localField: '_id',
          foreignField: '_id',
          as: 'memberInfo'
        }
      },
      { $unwind: '$memberInfo' },
      {
        $project: {
          _id: 1,
          name: '$memberInfo.name',
          email: '$memberInfo.email',
          totalPaid: 1,
          paymentCount: 1
        }
      }
    ]);

    // Top borrowers (members with highest total borrowings)
    const topBorrowers = await Borrowing.aggregate([
      {
        $group: {
          _id: '$member',
          totalBorrowed: { $sum: '$amount' },
          borrowingCount: { $sum: 1 },
          activeBorrowings: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          }
        }
      },
      { $sort: { totalBorrowed: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'members',
          localField: '_id',
          foreignField: '_id',
          as: 'memberInfo'
        }
      },
      { $unwind: '$memberInfo' },
      {
        $project: {
          _id: 1,
          name: '$memberInfo.name',
          email: '$memberInfo.email',
          totalBorrowed: 1,
          borrowingCount: 1,
          activeBorrowings: 1
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        members: {
          total: totalMembers,
          borrowers: totalBorrowers
        },
        deposits: {
          total: depositStats[0]?.totalAmount || 0,
          totalShares: depositStats[0]?.totalShares || 0,
          recent: recentDeposits[0]?.totalAmount || 0
        },
        currentMonth: {
          totalCollected: currentMonthData.totalCollected,
          totalGiven: currentMonthData.totalGiven,
          remainingAmount: currentMonthData.remainingAmount,
          paidMembers: currentMonthData.paidMembers,
          totalMembers: currentMonthData.totalMembers
        },
        yearly: {
          payments: {
            total: yearlyPayments[0]?.totalAmount || 0,
            count: yearlyPayments[0]?.count || 0
          },
          borrowings: {
            total: yearlyBorrowings[0]?.totalAmount || 0,
            count: yearlyBorrowings[0]?.count || 0
          }
        },
        borrowingStatus,
        monthlyTrend,
        topContributors,
        topBorrowers
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}