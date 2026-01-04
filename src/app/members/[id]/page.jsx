'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { authAPI } from '@/lib/api-client'
import html2pdf from 'html2pdf.js'

export default function MemberDetails() {
    const [member, setMember] = useState(null)
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
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

    const exportToPDF = async () => {
        setIsGeneratingPDF(true)
        try {
            // Create a temporary container
            const container = document.createElement('div')
            container.innerHTML = `
        <div class="pdf-container">
          <style>
            .pdf-container { font-family: 'Arial', sans-serif; color: #333; }
            .pdf-header { background: #f8fafc; padding: 20px; border-bottom: 2px solid #e2e8f0; margin-bottom: 20px; }
            .header-title { font-size: 24px; font-weight: bold; color: #1e293b; margin-bottom: 5px; }
            .header-subtitle { font-size: 14px; color: #64748b; }
            .section-title { font-size: 16px; font-weight: bold; color: #1e293b; margin: 20px 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
            
            .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
            .stat-box { background: #fff; border: 1px solid #e2e8f0; padding: 10px; border-radius: 6px; text-align: center; }
            .stat-label { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; }
            .stat-value { font-size: 16px; font-weight: bold; margin-top: 5px; }
            .text-green { color: #16a34a; }
            .text-blue { color: #2563eb; }
            .text-purple { color: #9333ea; }
            .text-indigo { color: #4f46e5; }
            
            table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 20px; }
            th { background: #f1f5f9; text-align: left; padding: 8px; font-weight: bold; color: #475569; border-bottom: 1px solid #cbd5e1; }
            td { padding: 8px; border-bottom: 1px solid #e2e8f0; color: #334155; }
            tr:nth-child(even) { background-color: #f8fafc; }
            
            .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          </style>
          
          <div class="pdf-header">
            <div class="header-title">${member.name}</div>
            <div class="header-subtitle">Phone: ${member.phone} | Serial No: ${member.serialNo}</div>
            <div class="header-subtitle" style="margin-top: 5px;">Report Generated: ${new Date().toLocaleDateString()}</div>
          </div>

          <div class="stats-grid">
            <div class="stat-box">
              <div class="stat-label">Total Deposits</div>
              <div class="stat-value text-green">₹${stats.deposits.total.toLocaleString()}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Total Collected</div>
              <div class="stat-value text-blue">₹${stats.payments.total.toLocaleString()}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Current Principal</div>
              <div class="stat-value text-purple">₹${member.currentPrincipal?.toLocaleString() || 0}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Shares</div>
              <div class="stat-value text-indigo">${member.numberOfShares || 0}</div>
            </div>
          </div>

          <div class="section-title">Payment History ${selectedYear !== 'all' ? `(${selectedYear})` : ''}</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Month</th>
                <th>Share</th>
                <th>Interest</th>
                <th>Principal</th>
                <th>Penalty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${filteredPayments.length > 0 ? filteredPayments.map(p => `
                <tr>
                  <td>${new Date(p.paymentDate).toLocaleDateString()}</td>
                  <td>${p.monthlyData ? `${new Date(p.monthlyData.year, p.monthlyData.month - 1).toLocaleString('default', { month: 'short' })} ${p.monthlyData.year}` : '-'}</td>
                  <td>₹${p.shareAmount}</td>
                  <td>₹${p.interestAmount}</td>
                  <td>₹${p.muddalPaid}</td>
                  <td style="color: ${p.penaltyAmount > 0 ? '#dc2626' : 'inherit'}">₹${p.penaltyAmount}</td>
                  <td style="font-weight: bold;">₹${p.totalAmount}</td>
                </tr>
              `).join('') : '<tr><td colspan="7" style="text-align: center;">No payment records found</td></tr>'}
            </tbody>
          </table>

          <div class="section-title">Loan History</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Guarantors</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${stats.borrowingList.length > 0 ? stats.borrowingList.map(l => `
                <tr>
                  <td>${new Date(l.borrowingDate).toLocaleDateString()}</td>
                  <td style="font-weight: bold; color: #2563eb;">₹${l.amount.toLocaleString()}</td>
                  <td>${l.type || 'Standard'}</td>
                  <td>${l.guarantors && l.guarantors.length > 0 ? l.guarantors.join(', ') : '-'}</td>
                  <td>${l.status === 'active' ? 'Active' : 'Closed'}</td>
                </tr>
              `).join('') : '<tr><td colspan="5" style="text-align: center;">No borrowing records found</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            Shivanjali Fund Management System
          </div>
        </div>
      `

            const opt = {
                margin: 10,
                filename: `${member.name.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            }

            await html2pdf().set(opt).from(container).save()
            setIsGeneratingPDF(false)
        } catch (error) {
            console.error('PDF Generation Error:', error)
            alert('Failed to generate PDF')
            setIsGeneratingPDF(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
                            <p className="text-sm text-gray-500">{member.phone} | {member.address}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={exportToPDF}
                                disabled={isGeneratingPDF}
                                className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${isGeneratingPDF
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                {isGeneratingPDF ? 'Generating...' : 'Download Report'}
                            </button>
                            <Link
                                href="/members"
                                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                            >
                                ← Back
                            </Link>
                        </div>
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
