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

    const query = {};

    if (year) {
      query.year = parseInt(year);
    }

    if (status) {
      query.status = status;
    }

    const monthlyData = await MonthlyData.find(query)
      .populate('payments')
      .populate('borrowings')
      .sort({ year: -1, month: -1 });

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
      { success: false, message: 'Server error. Please try again.' },
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