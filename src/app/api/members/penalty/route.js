// app/api/members/penalty/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Member from '@/models/Member';

export async function PATCH(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { memberId, penaltyApplied, monthId, amount, monthName } = body;

    let updateQuery;

    // Legacy support for simple toggle
    if (penaltyApplied !== undefined && !monthId) {
      updateQuery = { penaltyApplied };
    } else if (monthId) {
      // Add or update specific month penalty
      // Check if exists first to decide $set or $push? 
      // Mongoose allows intricate updates but standard findById is easier to manipulate in JS if logic is complex
      // Let's use array filters or just pull and push (or simple JS manipulation)

      // Simplest: Fetch, modify, save
      const member = await Member.findById(memberId);
      if (!member) {
        return NextResponse.json({ success: false, error: 'Member not found' }, { status: 404 });
      }

      const existingIndex = member.unpaidMonthPenalties.findIndex(p => p.monthId.toString() === monthId);
      if (existingIndex >= 0) {
        member.unpaidMonthPenalties[existingIndex].amount = amount;
      } else {
        member.unpaidMonthPenalties.push({
          monthId,
          monthName,
          amount,
          isPaid: false
        });
      }

      await member.save();
      return NextResponse.json({ success: true, data: member });
    }

    if (updateQuery) {
      const member = await Member.findByIdAndUpdate(
        memberId,
        updateQuery,
        { new: true }
      );

      if (!member) {
        return NextResponse.json(
          { success: false, error: 'Member not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: member
      });
    }

    if (!member) {
      return NextResponse.json(
        { success: false, error: 'Member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: member
    });
  } catch (error) {
    console.error('Error updating penalty:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}