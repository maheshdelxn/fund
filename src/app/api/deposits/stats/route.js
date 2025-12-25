import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Deposit from '@/models/Deposit';
import { authenticate } from '@/lib/auth';

// GET /api/deposits/stats - Get deposit statistics
export async function GET(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const matchQuery = {};

    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    // Overall statistics
    const stats = await Deposit.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalDeposits: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalShares: { $sum: '$shares' },
          totalShareAmount: { $sum: '$shareAmount' },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);

    // Status breakdown
    const statusBreakdown = await Deposit.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Monthly statistics
    const monthlyStats = await Deposit.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        overall: stats[0] || {
          totalDeposits: 0,
          totalAmount: 0,
          totalShares: 0,
          totalShareAmount: 0,
          avgAmount: 0
        },
        statusBreakdown,
        monthlyStats
      }
    });

  } catch (error) {
    console.error('Get deposit stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}