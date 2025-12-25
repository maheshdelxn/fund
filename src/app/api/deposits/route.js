import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Deposit from '@/models/Deposit';
import Member from '@/models/Member';
import { authenticate } from '@/lib/auth';

// GET /api/deposits - Get all deposits
export async function GET(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const memberId = searchParams.get('memberId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');

    const query = {};

    if (memberId) {
      query.member = memberId;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const deposits = await Deposit.find(query)
      .populate('member', 'name email phone')
      .sort({ date: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const count = await Deposit.countDocuments(query);

    // Calculate totals
    const totals = await Deposit.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalShares: { $sum: '$shares' },
          totalShareAmount: { $sum: '$shareAmount' }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      count: deposits.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totals: totals[0] || { totalAmount: 0, totalShares: 0, totalShareAmount: 0 },
      data: deposits
    });

  } catch (error) {
    console.error('Get deposits error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}

// POST /api/deposits - Create new deposit
export async function POST(request) {
  try {
    const { user, error } = await authenticate(request);
    if (error) return error;

    await connectDB();

    const { name, phone, alternatePhone, amount, shares, date, memberId, notes } = await request.json();

    // Validation
    if (!name || !phone || !amount || !shares || !date) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    let member;

    // If memberId is provided, use existing member
    if (memberId) {
      member = await Member.findById(memberId);
      if (!member) {
        return NextResponse.json(
          { success: false, message: 'Member not found' },
          { status: 404 }
        );
      }
    } else {
      // Find or create member based on phone number
      member = await Member.findOne({ phone });

      if (!member) {
        // Create new member
        const email = `${phone}@chitfund.temp`;
        member = await Member.create({
          name,
          phone,
          email,
          notes: 'Auto-created from deposit'
        });
      }
    }

    // Calculate share amount
    const shareAmount = shares * 1000;

    // Create deposit
    const deposit = await Deposit.create({
      member: member._id,
      name,
      phone,
      alternatePhone,
      amount,
      shares,
      shareAmount,
      date,
      notes
    });

    // Update member's total deposits
    member.totalDeposits = (member.totalDeposits || 0) + amount;
    await member.save();

    const populatedDeposit = await Deposit.findById(deposit._id)
      .populate('member', 'name email phone');

    return NextResponse.json({
      success: true,
      message: 'Deposit created successfully',
      data: populatedDeposit
    }, { status: 201 });

  } catch (error) {
    console.error('Create deposit error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}