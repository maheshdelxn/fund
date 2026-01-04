
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Member from '@/models/Member';
import MonthlyData from '@/models/MonthlyData';
import Payment from '@/models/Payment';

export async function GET() {
    try {
        await connectDB();

        // 1. Get a test member
        let member = await Member.findOne({ name: 'Test Defaulter' });
        if (!member) {
            const serialNo = 'TEST001';
            member = await Member.create({
                name: 'Test Defaulter',
                phone: '9999999999',
                address: 'Test Address',
                serialNo,
                joinDate: new Date('2025-01-01') // Started recently
            });
        }

        // 2. Create last 3 months as "completed" (or check if current logic allows)
        // We will simulate: Oct 2025, Nov 2025, Dec 2025 (Assuming current is Jan 2026 or later, 
        // but to be safe relative to "now", let's just pick 3 months strictly in the past)

        const today = new Date();
        const monthsToSeed = [3, 2, 1]; // 3 months ago, 2 months ago, 1 month ago

        for (const monthsAgo of monthsToSeed) {
            const d = new Date(today.getFullYear(), today.getMonth() - monthsAgo, 25);
            const month = d.getMonth() + 1;
            const year = d.getFullYear();

            let monthlyData = await MonthlyData.findOne({ month, year });
            if (!monthlyData) {
                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
                const monthName = monthNames[month - 1];

                monthlyData = await MonthlyData.create({
                    month,
                    year,
                    monthName,
                    date: d,
                    collectionDate: d,
                    status: 'completed', // Force completed
                    totalCollected: 0,
                    totalGiven: 0,
                    previousMonthRemaining: 0 // Initialize to 0 for test data
                });
            } else {
                // Ensure it is completed for the test to work
                monthlyData.status = 'completed';
                if (!monthlyData.monthName) {
                    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];
                    monthlyData.monthName = monthNames[month - 1];
                }
                await monthlyData.save();
            }

            // 3. Ensure NO payment exists for this member
            await Payment.deleteMany({
                member: member._id,
                monthlyData: monthlyData._id
            });
        }

        return NextResponse.json({
            success: true,
            message: `Setup complete. Member '${member.name}' should now appear as a defaulter (missed payments for past 3 months).`,
            memberId: member._id
        });

    } catch (error) {
        console.error('Seed error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
