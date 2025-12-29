import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import Member from '@/models/Member'
import Deposit from '@/models/Deposit'

export async function GET(request) {
    try {
        await connectDB()
        const members = await Member.find({})
        let updatedCount = 0

        for (const member of members) {
            const deposits = await Deposit.find({ member: member._id })
            const totalShares = deposits.reduce((sum, d) => sum + (d.shares || 0), 0)
            const totalDeposits = deposits.reduce((sum, d) => sum + (d.amount || 0), 0)

            if (member.numberOfShares !== totalShares || member.totalDeposits !== totalDeposits) {
                member.numberOfShares = totalShares
                member.totalDeposits = totalDeposits
                await member.save()
                updatedCount++
            }
        }

        return NextResponse.json({
            success: true,
            message: `Synced ${updatedCount} members`,
            totalMembers: members.length
        })

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
