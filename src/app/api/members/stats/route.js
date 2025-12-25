import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Member from '@/models/Member';
import { authenticate } from '@/lib/auth';

// GET /api/members/stats - Get all members statistics
export async function GET(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    await connectDB();

    // Total members
    const totalMembers = await Member.countDocuments({ isActive: true });
    const inactiveMembers = await Member.countDocuments({ isActive: false });
    const totalBorrowers = await Member.countDocuments({ isBorrower: true, isActive: true });

    // Members joined this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newMembersThisMonth = await Member.countDocuments({
      joinDate: { $gte: startOfMonth },
      isActive: true
    });

    // Members by join month (last 12 months)
    const membersByMonth = await Member.aggregate([
      {
        $match: {
          joinDate: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$joinDate' },
            month: { $month: '$joinDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalMembers,
        inactiveMembers,
        totalBorrowers,
        newMembersThisMonth,
        membersByMonth
      }
    });

  } catch (error) {
    console.error('Get members stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}