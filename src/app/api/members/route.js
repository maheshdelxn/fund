// app/api/members/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Member from '@/models/Member';

export async function GET() {
  try {
    await connectDB();

    // Fetch last 3 completed/current months to check for defaulters behavior
    // We get last 6 months to be safe, but check logic for "3 months"
    const MonthlyData = (await import('@/models/MonthlyData')).default;
    const Payment = (await import('@/models/Payment')).default;

    const recentMonths = await MonthlyData.find({ status: { $in: ['completed', 'current'] } })
      .sort({ year: -1, month: -1 })
      .limit(6); // Check last 6 months

    // Fetch payments for these months
    const monthIds = recentMonths.map(m => m._id);
    const payments = await Payment.find({ monthlyData: { $in: monthIds } });

    const members = await Member.find({ isActive: true }).sort({ serialNo: 1 });

    // Process members to add defaulter info
    const membersWithStatus = members.map(member => {
      const memberObj = member.toObject();
      const unpaidMonths = [];

      // Check against recent months
      recentMonths.forEach(month => {
        const hasPaid = payments.some(p =>
          p.monthlyData.toString() === month._id.toString() &&
          p.member.toString() === member._id.toString() &&
          p.status === 'completed'
        );

        if (!hasPaid) {
          const storedPenalty = member.unpaidMonthPenalties?.find(p =>
            p.monthId.toString() === month._id.toString()
          );

          unpaidMonths.push({
            _id: month._id,
            name: `${month.monthName} ${month.year}`,
            date: month.date,
            penaltyAmount: storedPenalty ? storedPenalty.amount : 0
          });
        }
      });

      // Defaulter if unpaid count >= 3
      memberObj.isDefaulter = unpaidMonths.length >= 3;
      memberObj.unpaidMonths = unpaidMonths;

      return memberObj;
    });

    return NextResponse.json({
      success: true,
      data: membersWithStatus
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Auto-generate serial number
    const lastMember = await Member.findOne().sort({ serialNo: -1 });
    let serialNo = 'MBR001';

    if (lastMember && lastMember.serialNo) {
      const lastNum = parseInt(lastMember.serialNo.replace('MBR', ''));
      serialNo = `MBR${String(lastNum + 1).padStart(3, '0')}`;
    }

    const member = await Member.create({
      ...body,
      serialNo
    });

    return NextResponse.json({
      success: true,
      data: member
    });
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}