import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Member from '@/models/Member'
import Deposit from '@/models/Deposit'

export async function GET(request) {
    try {
        await connectDB()
        const members = await Member.find({})
        const memberData = []

        for (const member of members) {
            const deposits = await Deposit.find({ member: member._id })
            memberData.push({
                name: member.name,
                numberOfShares: member.numberOfShares,
                totalDeposits: member.totalDeposits,
                deposits: deposits.map(d => ({ amount: d.amount, shares: d.shares }))
            })
        }

        return NextResponse.json({
            success: true,
            data: memberData
        })

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
