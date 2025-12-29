'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { authAPI } from '@/lib/api-client'

export default function MemberDetails() {
    const [member, setMember] = useState(null)
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('collections')
    const [selectedYear, setSelectedYear] = useState('all')
    const [error, setError] = useState('')
    const router = useRouter()
    const { id } = useParams()

    useEffect(() => {
        const loadMemberData = async () => {
            try {
                setLoading(true)
                await authAPI.getMe() // Check auth

                const response = await fetch(`/api/members/${id}/stats`)
                const result = await response.json()

                if (result.success) {
                    setMember(result.data.member)
                    setStats(result.data)
                } else {
                    setError(result.message || 'Failed to load member data')
                }
            } catch (error) {
                console.error('Error loading member data:', error)
                setError('Failed to load member data')
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            loadMemberData()
        }
    }, [id, router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (error || !member) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center text-red-600">
                    <p>{error || 'Member not found'}</p>
                    <Link href="/members" className="text-blue-600 hover:underline mt-4 inline-block">
                        Back to Members
                    </Link>
                </div>
            </div>
        )
    }

    // Filter payments by year
    const filteredPayments = stats.paymentList.filter(payment => {
        if (selectedYear === 'all') return true
        const paymentYear = new Date(payment.paymentDate).getFullYear().toString()
        return paymentYear === selectedYear
    })

    // Get unique years from payments for filter
    const availableYears = [...new Set(stats.paymentList.map(p => new Date(p.paymentDate).getFullYear()))].sort((a, b) => b - a)

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
                            <p className="text-sm text-gray-500">{member.phone} | {member.email}</p>
                        </div>
                        <Link
                            href="/members"
                            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                        >
                            ← Back to Members
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-gray-500 text-sm font-medium uppercase">Total Deposits</h3>
                        <p className="text-2xl font-bold text-green-600">₹{stats.deposits.total.toLocaleString()}</p>
                        <p className="text-sm text-gray-400">{stats.deposits.count} records</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-gray-500 text-sm font-medium uppercase">Total Collected</h3>
                        <p className="text-2xl font-bold text-blue-600">₹{stats.payments.total.toLocaleString()}</p>
                        <p className="text-sm text-gray-400">{stats.payments.count} payments</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-gray-500 text-sm font-medium uppercase">Current Principal</h3>
                        <p className="text-2xl font-bold text-purple-600">₹{member.currentPrincipal?.toLocaleString() || 0}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-gray-500 text-sm font-medium uppercase">Shares</h3>
                        <p className="text-2xl font-bold text-indigo-600">{member.numberOfShares || 0}</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="border-b border-gray-200 px-6">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('collections')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'collections'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Collection Details
                            </button>
                            <button
                                onClick={() => setActiveTab('borrowings')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'borrowings'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Borrowing History
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'collections' && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Payment History</h3>
                                    <div className="flex items-center space-x-2">
                                        <label className="text-sm text-gray-600">Filter Year:</label>
                                        <select
                                            value={selectedYear}
                                            onChange={(e) => setSelectedYear(e.target.value)}
                                            className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                                        >
                                            <option value="all">All Years</option>
                                            {availableYears.map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Share Amt</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal Paid</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penalty</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredPayments.length > 0 ? (
                                                filteredPayments.map((payment) => (
                                                    <tr key={payment._id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {new Date(payment.paymentDate).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {payment.monthlyData ? `${new Date(payment.monthlyData.year, payment.monthlyData.month - 1).toLocaleString('default', { month: 'long' })} ${payment.monthlyData.year}` : '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{payment.shareAmount}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{payment.interestAmount}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{payment.muddalPaid}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">₹{payment.penaltyAmount}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">₹{payment.totalAmount}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                                        No payment records found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'borrowings' && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Loan History</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guarantors</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {stats.borrowingList.length > 0 ? (
                                                stats.borrowingList.map((loan) => (
                                                    <tr key={loan._id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {new Date(loan.borrowingDate).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                                            ₹{loan.amount.toLocaleString()}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                            {loan.type || 'Standard'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {loan.guarantors && loan.guarantors.length > 0 ? loan.guarantors.join(', ') : '-'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${loan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {loan.status === 'active' ? 'Active' : 'Closed'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                                                        No borrowing records found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
