// app/api/months/[date]/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import MonthlyData from '@/models/MonthlyData';
import Member from '@/models/Member';
import Payment from '@/models/Payment';
import Borrowing from '@/models/Borrowing';

export async function GET(request, { params }) {
  try {
    await connectDB();

    // Await params in Next.js 15
    const { date } = await params;

    console.log('Fetching data for date:', date);

    const dateObj = new Date(date);
    const month = dateObj.getMonth() + 1;
    const year = dateObj.getFullYear();

    console.log('Month:', month, 'Year:', year);

    // Get or create monthly data
    let monthlyData = await MonthlyData.getOrCreate(month, year);
    console.log('Monthly data retrieved:', monthlyData._id);

    // Get all active members
    const allMembers = await Member.find({ isActive: true }).sort({ serialNo: 1 });
    console.log('Members found:', allMembers.length);

    // Get payments for this month
    const payments = await Payment.find({
      monthlyData: monthlyData._id,
      status: 'completed'
    }).populate('member');
    console.log('Payments found:', payments.length);

    // Get borrowings for this month
    const borrowings = await Borrowing.find({
      monthlyData: monthlyData._id,
      status: 'active'
    }).populate('member');
    console.log('Borrowings found:', borrowings.length);

    // Calculate totals with proper null checks - FIXED
    const totalCollected = payments.reduce((sum, p) => {
      const amount = Number(p.totalAmount) || 0;
      return sum + amount;
    }, 0);

    const totalGiven = borrowings.reduce((sum, b) => {
      const amount = Number(b.amount) || 0;
      return sum + amount;
    }, 0);

    const paidMembers = payments.length;

    console.log('Calculations:', { totalCollected, totalGiven, paidMembers });

    // Validate numbers before saving - FIXED
    if (isNaN(totalCollected) || isNaN(totalGiven)) {
      console.error('Invalid calculations:', { totalCollected, totalGiven });
      return NextResponse.json(
        { success: false, error: 'Invalid calculation results' },
        { status: 500 }
      );
    }

    // Sync previousMonthRemaining logic
    let prevMonth = month - 1;
    let prevYear = year;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = year - 1;
    }
    const previousMonthData = await MonthlyData.findOne({ month: prevMonth, year: prevYear });
    const currentPreviousMonthRemaining = previousMonthData ? previousMonthData.remainingAmount : 0;

    // Update monthly data with validated numbers and synced previous remaining
    monthlyData.previousMonthRemaining = currentPreviousMonthRemaining;
    monthlyData.totalCollected = totalCollected;
    monthlyData.totalGiven = totalGiven;
    monthlyData.paidMembers = paidMembers;
    monthlyData.totalMembers = allMembers.length;

    await monthlyData.save();

    console.log('Monthly data updated successfully');

    // Format response
    const monthlyDataResponse = {
      ...monthlyData.toObject(),
      _id: monthlyData._id.toString(),
      payments: payments.map(p => {
        const member = p.member;
        return {
          ...p.toObject(),
          _id: p._id.toString(),
          memberId: member?._id ? member._id.toString() : (member ? member.toString() : null),
          member: member?._id ? {
            ...member.toObject(),
            _id: member._id.toString(),
            id: member._id.toString()
          } : member
        };
      }),
      borrowings: borrowings.map(b => {
        const member = b.member;
        return {
          ...b.toObject(),
          _id: b._id.toString(),
          memberId: member?._id ? member._id.toString() : (member ? member.toString() : null),
          member: member?._id ? {
            ...member.toObject(),
            _id: member._id.toString(),
            id: member._id.toString()
          } : member
        };
      })
    };

    // Get all previous completed months to calculate arrears
    const previousMonths = await MonthlyData.find({
      date: { $lt: monthlyData.date }
    }).sort({ date: 1 });

    const allMembersWithArrears = await Promise.all(allMembers.map(async (m) => {
      const memberId = m._id.toString();
      let pendingShares = 0;
      let pendingMonths = [];
      const sharePrice = 1000;
      const expectedPerMonth = (m.numberOfShares || 1) * sharePrice;

      const joinDateObj = new Date(m.joinDate);
      const joinYear = joinDateObj.getFullYear();
      const joinMonthNum = joinDateObj.getMonth() + 1; // 1-indexed

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      // Start from the month BEFORE the target month
      let checkMonth = month - 1;
      let checkYear = year;
      if (checkMonth === 0) {
        checkMonth = 12;
        checkYear--;
      }

      // Loop backwards until we reach the month before joinDate
      while (checkYear > joinYear || (checkYear === joinYear && checkMonth >= joinMonthNum)) {
        // Find if MonthlyData exists for this logical month
        const mData = await MonthlyData.findOne({ month: checkMonth, year: checkYear });

        let isUnpaid = false;
        let diff = 0;

        if (!mData) {
          isUnpaid = true;
          diff = expectedPerMonth;
        } else {
          // If month record exists, check for payment
          const payment = await Payment.findOne({
            monthlyData: mData._id,
            member: m._id,
            status: 'completed'
          });

          if (!payment) {
            isUnpaid = true;
            diff = expectedPerMonth;
          } else if ((payment.shareAmount || 0) < expectedPerMonth) {
            isUnpaid = true;
            diff = (expectedPerMonth - (payment.shareAmount || 0));
          }
        }

        if (isUnpaid) {
          pendingShares += diff;
          if (pendingMonths.length < 3) {
            pendingMonths.push(monthNames[checkMonth - 1]);
          }
        }

        // Move to previous month
        checkMonth--;
        if (checkMonth === 0) {
          checkMonth = 12;
          checkYear--;
        }
      }

      return {
        ...m.toObject(),
        id: memberId,
        _id: memberId,
        pendingShares,
        pendingMonths: pendingMonths // Already in most-recent-first order
      };
    }));

    return NextResponse.json({
      success: true,
      data: {
        monthlyData: monthlyDataResponse,
        allMembers: allMembersWithArrears,
        payments: payments.map(p => ({
          ...p.toObject(),
          _id: p._id.toString(),
          member: p.member?._id ? {
            ...p.member.toObject(),
            _id: p.member._id.toString(),
            id: p.member._id.toString()
          } : p.member
        })),
        borrowings: borrowings.map(b => ({
          ...b.toObject(),
          _id: b._id.toString(),
          member: b.member?._id ? {
            ...b.member.toObject(),
            _id: b.member._id.toString(),
            id: b.member._id.toString()
          } : b.member
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching month data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}