import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import MonthlyData from '@/models/MonthlyData';

export async function GET() {
    await connectDB();
    const count = await MonthlyData.countDocuments();
    const all = await MonthlyData.find({}).select('monthName year status');
    return NextResponse.json({ count, sample: all });
}
