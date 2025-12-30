import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import MonthlyData from '@/models/MonthlyData';
import { authenticate } from '@/lib/auth';

// GET /api/months - Get all monthly data
export async function GET(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const status = searchParams.get('status');
    const details = searchParams.get('details') === 'true';

    const matchStage = {};
    if (year) matchStage.year = parseInt(year);
    if (status) matchStage.status = status;

    let monthlyData;

    if (details) {
      // Legacy path for full details (if ever used)
      monthlyData = await MonthlyData.find(matchStage)
        .populate('payments')
        .populate('borrowings')
        .sort({ year: -1, month: -1 });
    } else {
      // Optimized Aggregation Path for Dashboard
      monthlyData = await MonthlyData.aggregate([
        { $match: matchStage },
        // Lookup Payments to calculate Total Collected and Paid Members
        {
          $lookup: {
            from: 'payments',
            let: { monthId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$monthlyData', '$$monthId'] },
                  status: 'completed'
                }
              },
              {
                $group: {
                  _id: null,
                  totalCollected: { $sum: '$totalAmount' },
                  count: { $sum: 1 }
                }
              }
            ],
            as: 'paymentStats'
          }
        },
        // Lookup Borrowings to calculate Total Given
        {
          $lookup: {
            from: 'borrowings',
            let: { monthId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$monthlyData', '$$monthId'] },
                  status: 'active'
                }
              },
              {
                $group: {
                  _id: null,
                  totalGiven: { $sum: '$amount' }
                }
              }
            ],
            as: 'borrowingStats'
          }
        },
        // Shape the output, merging stored fields with calculated stats
        {
          $addFields: {
            totalCollected: { $ifNull: [{ $arrayElemAt: ['$paymentStats.totalCollected', 0] }, 0] },
            paidMembers: { $ifNull: [{ $arrayElemAt: ['$paymentStats.count', 0] }, 0] },
            totalGiven: { $ifNull: [{ $arrayElemAt: ['$borrowingStats.totalGiven', 0] }, 0] }
          }
        },
        {
          $addFields: {
            remainingAmount: { $subtract: ['$totalCollected', '$totalGiven'] }
          }
        },
        { $sort: { year: -1, month: -1 } },
        { $project: { paymentStats: 0, borrowingStats: 0 } } // Remove temp fields
      ]);
    }

    // Calculate summary statistics
    const summary = {
      totalCollected: 0,
      totalGiven: 0,
      totalRemaining: 0,
      totalMonths: monthlyData.length
    };

    monthlyData.forEach(month => {
      summary.totalCollected += month.totalCollected || 0;
      summary.totalGiven += month.totalGiven || 0;
      summary.totalRemaining += month.remainingAmount || 0;
    });

    return NextResponse.json({
      success: true,
      count: monthlyData.length,
      summary,
      data: monthlyData
    });

  } catch (error) {
    console.error('Get monthly data error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/months - Create or get monthly data
export async function POST(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    await connectDB();

    const { month, year } = await request.json();

    if (!month || !year) {
      return NextResponse.json(
        { success: false, message: 'Please provide month and year' },
        { status: 400 }
      );
    }

    // Get or create monthly data
    let monthlyData = await MonthlyData.getOrCreate(month, year);

    monthlyData = await MonthlyData.findById(monthlyData._id)
      .populate({
        path: 'payments',
        populate: { path: 'member', select: 'name email phone' }
      })
      .populate({
        path: 'borrowings',
        populate: { path: 'member', select: 'name email phone' }
      });

    return NextResponse.json({
      success: true,
      data: monthlyData
    });

  } catch (error) {
    console.error('Create monthly data error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}