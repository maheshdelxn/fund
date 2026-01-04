// app/months/[date]/page.js
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useParams } from "next/navigation"
import html2pdf from 'html2pdf.js'

export default function MonthDetailsPage() {
  const [monthData, setMonthData] = useState(null)
  const [members, setMembers] = useState([])
  const [filter, setFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('collection')
  const [muddalInputs, setMuddalInputs] = useState({})
  const [penaltyInputs, setPenaltyInputs] = useState({})
  const [borrowAmounts, setBorrowAmounts] = useState({})
  const [collectionCompleted, setCollectionCompleted] = useState(false)
  const [monthPayments, setMonthPayments] = useState({})
  const [readOnlyMode, setReadOnlyMode] = useState(false)
  const [collectionSearchTerm, setCollectionSearchTerm] = useState('')
  const [guarantors, setGuarantors] = useState({})
  const [activeGuarantorDropdown, setActiveGuarantorDropdown] = useState(null)
  const [borrowingSearchTerm, setBorrowingSearchTerm] = useState('')
  const [searchedBorrowingMembers, setSearchedBorrowingMembers] = useState([])
  const [monthLoans, setMonthLoans] = useState({})
  const [showPaymentMode, setShowPaymentMode] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const monthName = searchParams?.get('name') || ''
  const year = searchParams?.get('year') || ''
  const { date } = useParams()

  // Constants
  const SHARE_AMOUNT = 1000
  const INTEREST_RATE = 3
  const PENALTY_RATE = 2
  const BASE_PENALTY = 200

  // Load month data
  const loadMonthData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/months/${date}`)
      const result = await response.json()

      if (result.success) {
        const { monthlyData, allMembers, payments, borrowings } = result.data

        setMonthData(monthlyData)
        setMembers(allMembers)

        // Set payment state
        const paymentMap = {}
        payments.forEach(p => {
          const memberId = p.memberId || p.member?._id || p.member?.id
          paymentMap[memberId] = {
            paid: true,
            paidAmount: p.totalAmount,
            penaltyAmount: p.penaltyAmount,
            muddalPaid: p.muddalPaid,
            interestAmount: p.interestAmount,
            shareAmount: p.shareAmount,
            paymentMode: p.paymentMode,
            calculatedTotal: p.totalAmount,
            calculatedMuddal: p.muddalPaid,
            calculatedPenalty: p.penaltyAmount,
            principalBefore: p.principalBefore,
            principalAfter: p.principalAfter
          }
        })
        setMonthPayments(paymentMap)

        // Set borrowing state
        const loanMap = {}
        borrowings.forEach(b => {
          const memberId = b.memberId || b.member?._id || b.member?.id
          if (!loanMap[memberId]) {
            loanMap[memberId] = []
          }
          loanMap[memberId].push({
            amount: b.amount,
            guarantors: b.guarantors || [],
            date: b.borrowingDate,
            previousPrincipal: b.previousPrincipal,
            newPrincipal: b.newPrincipal
          })
        })
        setMonthLoans(loanMap)

        if (monthlyData.status === 'completed') {
          setReadOnlyMode(true)
        }
      }
    } catch (error) {
      console.error('Error loading month data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (date) {
      loadMonthData()
    }
  }, [date])

  // Helper Functions
  const hasMemberPaid = (member) => !!monthPayments[member._id || member.id]?.paid

  const getPrincipalBeforeMonthLoans = (member) => {
    const memberId = member._id || member.id
    const currentPrincipal = member.currentPrincipal || 0
    const totalBorrowedThisMonth = getTotalBorrowingThisMonth(memberId)
    return Math.max(0, currentPrincipal - totalBorrowedThisMonth)
  }

  const getTotalBorrowingThisMonth = (memberId) => {
    if (!monthLoans[memberId]) return 0
    return monthLoans[memberId].reduce((sum, loan) => sum + (loan.amount || 0), 0)
  }

  const getCurrentPrincipalWithMonthLoans = (member) => {
    const memberId = member._id || member.id
    const principalBeforeLoans = getPrincipalBeforeMonthLoans(member)
    const totalBorrowedThisMonth = getTotalBorrowingThisMonth(memberId)
    const pendingBorrowAmount = parseInt(borrowAmounts[memberId]) || 0
    return principalBeforeLoans + totalBorrowedThisMonth + pendingBorrowAmount
  }

  const calculatePaymentDetails = (member) => {
    if (!member) return null

    const memberId = member._id || member.id
    const existingPayment = monthPayments[memberId]

    // Calculate share amount based on member's shares (default to 1 if 0)
    const memberShares = member.numberOfShares || 1
    const currentShareAmount = memberShares * SHARE_AMOUNT

    if (existingPayment?.paid) {
      // Even if paid, we should reconcile with current loans to see if interest changed (e.g. new loan added after payment)
      // Use the stored Muddal Paid amount to calculate what the interest SHOULD be now
      const muddalPaid = existingPayment.calculatedMuddal || existingPayment.muddalPaid || 0
      const principalBeforeLoans = getPrincipalBeforeMonthLoans(member)
      const totalBorrowedThisMonth = getTotalBorrowingThisMonth(memberId)

      const remainingOldPrincipal = Math.max(0, principalBeforeLoans - muddalPaid)
      const interestOnPrincipal = Math.ceil(remainingOldPrincipal * (INTEREST_RATE / 100))
      const interestOnNewLoan = Math.ceil(totalBorrowedThisMonth * (INTEREST_RATE / 100))
      const recalculatedInterest = interestOnPrincipal + interestOnNewLoan

      return {
        shareAmount: existingPayment.shareAmount || currentShareAmount,
        muddalPaid: muddalPaid,
        interestAmount: recalculatedInterest, // Use recalculated interest to reflect new loans
        totalCompulsory: (existingPayment.shareAmount || currentShareAmount) + recalculatedInterest,
        principalBeforeLoans: existingPayment.principalBefore || 0,
        currentPrincipalWithLoans: member.currentPrincipal || 0,
        newPrincipal: existingPayment.principalAfter || member.currentPrincipal || 0,
        total: existingPayment.calculatedTotal || existingPayment.paidAmount || 0,
        totalBorrowedThisMonth: getTotalBorrowingThisMonth(memberId),
        principalBeforePayment: existingPayment.principalBefore || 0
      }
    }

    if (!member.isBorrower && getTotalBorrowingThisMonth(memberId) === 0) {
      return {
        shareAmount: currentShareAmount,
        muddalPaid: 0,
        interestAmount: 0,
        totalCompulsory: currentShareAmount,
        principalBeforeLoans: 0,
        currentPrincipalWithLoans: 0,
        newPrincipal: 0,
        total: currentShareAmount,
        totalBorrowedThisMonth: 0,
        principalBeforePayment: 0
      }
    }

    const muddalPaid = Math.max(0, parseInt(muddalInputs[memberId]) || 0)
    const principalBeforeLoans = getPrincipalBeforeMonthLoans(member)
    const totalBorrowedThisMonth = getTotalBorrowingThisMonth(memberId)
    const currentPrincipalWithLoans = principalBeforeLoans + totalBorrowedThisMonth

    const principalAfterMuddal = Math.max(0, currentPrincipalWithLoans - muddalPaid)

    // Standard interest on (Principal - MuddalPaid)
    // Note: Principal here includes everything (Previous + New Loans)
    // But usually, existing principal interest is separate from new loan interest?
    // User request: "interest of 20000 will add to existing interest"
    // The 'currentPrincipalWithLoans' ALREADY includes 'totalBorrowedThisMonth'.
    // If 'principalBeforeLoans' had interest, and 'newLoan' has interest.
    // Logic: 
    // Interest = (PrincipalBeforeLoans + BorrowedThisMonth - MuddalPaid) * Rate?
    // OR
    // Interest = (PrincipalBeforeLoans - MuddalPaid) * Rate + (BorrowedThisMonth * Rate)?

    // User screenshot suggests:
    // Existing Loan Interest (on 70k) + New Loan Interest (on 20k).
    // If 10k muddal paid, usually it reduces principal before interest? 
    // Or is muddal paid applied at end of month?
    // Standard practice: Interest is on Opening Balance usually.
    // If muddal paid during month, interest might be on reduced balance.

    // Let's stick to simple logic that matches the screenshot:
    // Total Interest = (Opening Principal * Rate) + (New Loan * Rate) - (Adjustment for partial payment?)

    // Current Code: 
    // Interest = (currentPrincipalWithLoans - muddalPaid) * Rate
    // = (70k + 20k - 10k) * 2% = 80k * 2% = 1600.
    // But screenshot shows 1800 (1400 + 400).
    // This implies Muddal Payment does NOT reduce interest for the current month!
    // Interest is charged on the FULL amount before repayment?
    // OR Interest is charged on Opening Balance (70k) + New Loan (20k).
    // 70k * 2% = 1400. 20k * 2% = 400. Total = 1800.
    // Repayment of 10k happens, but interest is still due on the full amount for that month.

    // REFINED LOGIC: 
    // Interest on Old Principal = (Old - Paid) * Rate
    // Interest on New Loan = New * Rate
    const remainingOldPrincipal = Math.max(0, principalBeforeLoans - muddalPaid)
    const interestOnPrincipal = Math.ceil(remainingOldPrincipal * (INTEREST_RATE / 100))
    const interestOnNewLoan = Math.ceil(totalBorrowedThisMonth * (INTEREST_RATE / 100))
    const interestAmount = interestOnPrincipal + interestOnNewLoan

    // const interestAmount = Math.round(principalAfterMuddal * (INTEREST_RATE / 100)) // OLD LOGIC

    const totalCompulsory = currentShareAmount + interestAmount
    const total = currentShareAmount + muddalPaid + interestAmount

    return {
      shareAmount: currentShareAmount,
      muddalPaid,
      interestAmount,
      totalCompulsory,
      principalBeforeLoans,
      currentPrincipalWithLoans,
      newPrincipal: principalAfterMuddal,
      total,
      totalBorrowedThisMonth,
      principalBeforePayment: currentPrincipalWithLoans
    }
  }

  const calculatePenalty = (member) => {
    if (!member) return 0

    const memberId = member._id || member.id
    const existingPayment = monthPayments[memberId]

    if (existingPayment?.paid) {
      return existingPayment.calculatedPenalty || existingPayment.penaltyAmount || 0
    }

    if (!member.penaltyApplied) return 0

    const userEnteredPenalty = penaltyInputs[memberId]
    if (userEnteredPenalty !== undefined && userEnteredPenalty !== '') {
      const manualPenalty = parseInt(userEnteredPenalty)
      if (!isNaN(manualPenalty) && manualPenalty >= 0) {
        return manualPenalty
      }
    }

    let penalty = BASE_PENALTY
    const currentPrincipalWithLoans = getCurrentPrincipalWithMonthLoans(member)
    if (member.isBorrower || currentPrincipalWithLoans > 0) {
      const principalPenalty = Math.round(currentPrincipalWithLoans * (PENALTY_RATE / 100))
      penalty += principalPenalty
    }
    return penalty
  }

  // ==================== PDF GENERATION CODE ====================

  const generateCollectionPDFPages = () => {
    const memberChunks = chunkMembers(members, 30)
    const currentDate = getCurrentDate()

    return memberChunks.map((chunk, pageIndex) => `
      <div class="pdf-page ${pageIndex < memberChunks.length - 1 ? 'page-break' : ''}">
        <div class="pdf-header">
          <div class="header-content">
            <div class="header-text">
              <h1>शिवांजली फंड - संकलन अहवाल</h1>
              <p class="subtitle">महिना: ${monthData.monthName} ${monthData.year}</p>
              <p class="subtitle">तारीख: ${currentDate}</p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 12px; font-weight: bold;">पृष्ठ ${pageIndex + 1} / ${memberChunks.length}</div>
            </div>
          </div>
        </div>

        <div className="summary-grid">
          <div className="summary-item">
            <div className="summary-label">मागील शिल्लक</div>
            <div className="summary-value text-gray-600">₹{(monthData.previousMonthRemaining || 0).toLocaleString()}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">एकूण संकलित</div>
            <div className="summary-value" style="color: #059669;">₹${monthStats.totalPaid.toLocaleString()}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">एकूण उपलब्ध</div>
            <div className="summary-value text-blue-600">₹${((monthData.previousMonthRemaining || 0) + monthStats.totalPaid).toLocaleString()}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">वाटप केलेले कर्ज</div>
            <div className="summary-value text-orange-600">₹${monthStats.totalBorrowedThisMonth.toLocaleString()}</div>
          </div>
          <div className="summary-item">
            <div className="summary-label">शिल्लक रक्कम</div>
            <div className="summary-value text-purple-600">₹${(((monthData.previousMonthRemaining || 0) + monthStats.totalPaid) - monthStats.totalBorrowedThisMonth).toLocaleString()}</div>
          </div>
        </div>

        <table class="pdf-table">
          <thead>
            <tr>
              <th width="5%">सभा. क्र</th>
              <th width="15%">भागधारकाचे नाव</th>
              <th width="6%">भाग रक्कम</th>
              <th width="8%">कर्ज</th>
              <th width="8%">मुद्दल</th>
              <th width="8%">व्याज</th>
              <th width="8%">दंड</th>
              <th width="8%">एकूण</th>
              <th width="10%">शिल्लक कर्ज</th>
              <th width="6%">स्थिती</th>
            </tr>
          </thead>
          <tbody>
            ${chunk.map((member) => {
      const memberId = member._id || member.id
      const isPaid = hasMemberPaid(member)
      const paymentDetails = calculatePaymentDetails(member)
      const penaltyAmount = isPaid
        ? (monthPayments[memberId]?.calculatedPenalty || monthPayments[memberId]?.penaltyAmount || 0)
        : calculatePenalty(member)
      const totalAmount = isPaid
        ? (monthPayments[memberId]?.calculatedTotal || monthPayments[memberId]?.paidAmount || 0)
        : paymentDetails.total + penaltyAmount
      const muddalPaid = isPaid
        ? (monthPayments[memberId]?.calculatedMuddal || monthPayments[memberId]?.muddalPaid || 0)
        : 0
      const paymentMode = monthPayments[memberId]?.paymentMode

      return `
                <tr class="${isPaid ? 'paid-row' : ''}">
                  <td>${member.serialNo}</td>
                  <td style="text-align: left; padding-left: 8px;">
                    <div style="font-weight: bold;">${member.name}</div>
                    <div style="font-size: 8px; color: #64748b;">${member.phone}</div>
                  </td>
                  <td>₹${paymentDetails.shareAmount.toLocaleString()}</td>
                  <td>${member.isBorrower || paymentDetails.totalBorrowedThisMonth > 0 ? `₹${paymentDetails.principalBeforeLoans.toLocaleString()}` : '-'}</td>
                  <td>${muddalPaid > 0 ? `₹${muddalPaid.toLocaleString()}` : (isPaid ? '0' : '0')}</td>
                  <td>${member.isBorrower || paymentDetails.totalBorrowedThisMonth > 0 ? `₹${paymentDetails.interestAmount.toLocaleString()}` : '-'}</td>
                  <td>${penaltyAmount > 0 ? `₹${penaltyAmount.toLocaleString()}` : '-'}</td>
                  <td style="font-weight: bold;">₹${totalAmount.toLocaleString()}</td>
                  <td>${member.isBorrower || paymentDetails.totalBorrowedThisMonth > 0 ? `₹${paymentDetails.newPrincipal.toLocaleString()}` : '-'}</td>
                  <td>
                    <span style="
                      display: inline-block;
                      padding: 2px 6px;
                      border-radius: 10px;
                      font-size: 8px;
                      font-weight: bold;
                      ${isPaid ?
          (paymentMode === 'cash' ? 'background: #dcfce7; color: #166534;' :
            paymentMode === 'online' ? 'background: #dbeafe; color: #1e40af;' :
              'background: #dcfce7; color: #166534;')
          : 'background: #fef3c7; color: #92400e;'}
                    ">
                      ${isPaid ? (paymentMode === 'cash' ? 'C' : paymentMode === 'online' ? 'O' : 'C') : 'Pending'}
                    </span>
                  </td>
                </tr>
              `
    }).join('')}
          </tbody>
        </table>

        <div class="page-number">
          पृष्ठ ${pageIndex + 1} / ${memberChunks.length}
        </div>
      </div>
    `).join('')
  }

  const generateBorrowingPDFPages = () => {
    const membersWithLoans = getMembersWithMonthLoans
    const memberChunks = chunkMembers(membersWithLoans, 30)
    const currentDate = getCurrentDate()

    if (membersWithLoans.length === 0) {
      return `
        <div class="pdf-page">
          <div class="pdf-header">
            <div class="header-content">
              <div class="header-text">
                <h1>शिवांजली फंड - कर्ज अहवाल</h1>
                <p class="subtitle">महिना: ${monthData.monthName} ${monthData.year}</p>
                <p class="subtitle">तारीख: ${currentDate}</p>
              </div>
            </div>
          </div>
          <div style="text-align: center; padding: 50px;">
            <h3>${monthData.monthName} ${monthData.year} या महिन्यासाठी कोणतेही कर्ज प्रक्रियेस नाही</h3>
          </div>
        </div>
      `
    }

    return memberChunks.map((chunk, pageIndex) => `
      <div class="pdf-page ${pageIndex < memberChunks.length - 1 ? 'page-break' : ''}">
        <div class="pdf-header">
          <div class="header-content">
            <div class="header-text">
              <h1>शिवांजली फंड - कर्ज अहवाल</h1>
              <p class="subtitle">महिना: ${monthData.monthName} ${monthData.year}</p>
              <p class="subtitle">तारीख: ${currentDate}</p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 12px; font-weight: bold;">पृष्ठ ${pageIndex + 1} / ${memberChunks.length}</div>
            </div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-label">या महिन्यातील एकूण कर्ज</div>
            <div class="summary-value">₹${monthStats.totalBorrowedThisMonth.toLocaleString()}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">एकूण कर्जदार</div>
            <div class="summary-value">${membersWithLoans.length}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">नवीन कर्जदार</div>
            <div class="summary-value">${membersWithLoans.filter(m => !m.isBorrower || m.loanHistory?.length === 1).length}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">नवीन कर्ज शिल्लक</div>
            <div class="summary-value">₹${monthStats.totalPrincipal.toLocaleString()}</div>
          </div>
        </div>

        <table class="pdf-table">
          <thead>
            <tr>
              <th width="5%">सभा. क्र</th>
              <th width="20%">भागधारकाचे नाव</th>
              <th width="15%">मागील कर्ज</th>
              <th width="15%">यावेळी घेतलेले कर्ज</th>
              <th width="25%">जामीन</th>
              <th width="20%">नवीन कर्ज शिल्लक</th>
            </tr>
          </thead>
          <tbody>
            ${chunk.map((member) => {
      const memberId = member._id || member.id
      const totalBorrowingThisMonth = getTotalBorrowingThisMonth(memberId)
      const previousPrincipal = getPreviousPrincipal(member)
      const allGuarantors = getAllGuarantorsThisMonth(memberId)

      return `
                <tr>
                  <td>${member.serialNo}</td>
                  <td style="text-align: left; padding-left: 8px;">
                    <div style="font-weight: bold;">${member.name}</div>
                    <div style="font-size: 8px; color: #64748b;">${member.phone}</div>
                  </td>
                  <td>₹${previousPrincipal.toLocaleString()}</td>
                  <td style="font-weight: bold; color: #059669;">₹${totalBorrowingThisMonth.toLocaleString()}</td>
                  <td style="text-align: left; padding-left: 8px;">
                    ${allGuarantors.length > 0 ?
          allGuarantors.map(guarantor =>
            `<div style="font-size: 8px; color: #1d4ed8;">${guarantor}</div>`
          ).join('')
          : '<div style="font-size: 8px; color: #64748b;">जामीन नाही</div>'
        }
                  </td>
                  <td>₹${member.currentPrincipal?.toLocaleString()}</td>
                </tr>
              `
    }).join('')}
          </tbody>
        </table>

        <div class="page-number">
          पृष्ठ ${pageIndex + 1} / ${memberChunks.length}
        </div>
      </div>
    `).join('')
  }

  const chunkMembers = (members, chunkSize) => {
    const chunks = []
    for (let i = 0; i < members.length; i += chunkSize) {
      chunks.push(members.slice(i, i + chunkSize))
    }
    return chunks
  }

  const getCurrentDate = () => {
    const now = new Date()
    const day = String(now.getDate()).padStart(2, '0')
    const month = now.toLocaleString('default', { month: 'long' })
    const year = now.getFullYear()
    return `${day} ${month} ${year}`
  }

  const exportToPDF = async (tableType = 'collection') => {
    setIsGeneratingPDF(true)

    try {
      const pdfContent = tableType === 'collection'
        ? generateCollectionPDFPages()
        : generateBorrowingPDFPages()

      // Create a temporary container for the PDF content
      const container = document.createElement('div')
      container.innerHTML = `
        <div class="pdf-container">
          <style>
            .pdf-container {
              width: 100%;
              margin: 0;
              padding: 0;
              font-family: 'Arial', sans-serif;
            }
            .pdf-page {
              width: 100%;
              min-height: 297mm; /* A4 height */
              padding: 10mm;
              box-sizing: border-box;
              background: white;
            }
            .page-break {
              page-break-after: always;
            }
            .pdf-header {
              background: #f8fafc;
              padding: 15px;
              border-bottom: 2px solid #e2e8f0;
              margin-bottom: 15px;
            }
            .header-content {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .header-text {
              text-align: center;
              flex-grow: 1;
              margin: 0 20px;
            }
            .header-text h1 {
              margin: 0;
              font-size: 24px;
              color: #1e293b;
              font-weight: bold;
            }
            .header-text .subtitle {
              margin: 5px 0 0 0;
              font-size: 14px;
              color: #64748b;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 10px;
              margin-bottom: 20px;
            }
            .summary-item {
              border: 1px solid #cbd5e1;
              padding: 10px;
              text-align: center;
              border-radius: 6px;
              background: #ffffff;
            }
            .summary-label {
              font-size: 11px;
              font-weight: bold;
              color: #64748b;
              margin-bottom: 4px;
            }
            .summary-value {
              font-size: 14px;
              font-weight: bold;
              color: #0f172a;
            }
            .pdf-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10px;
              margin-bottom: 20px;
              table-layout: fixed;
            }
            .pdf-table th {
              background: #f1f5f9;
              border: 1px solid #cbd5e1;
              padding: 8px 4px;
              text-align: center;
              font-weight: bold;
              color: #475569;
              vertical-align: middle;
            }
            .pdf-table td {
              border: 1px solid #cbd5e1;
              padding: 6px 4px;
              text-align: center;
              vertical-align: middle;
              color: #334155;
            }
            .paid-row {
              background: #f0fdf4 !important;
            }
            .page-number {
              text-align: right;
              font-size: 9px;
              color: #94a3b8;
              margin-top: 10px;
              border-top: 1px solid #e2e8f0;
              padding-top: 4px;
            }
          </style>
          ${pdfContent}
        </div>
      `

      // Configuration for html2pdf
      const opt = {
        margin: 0,
        filename: `Shivanjali_${tableType === 'collection' ? 'Collection' : 'Borrowing'}_${monthData.monthName}_${monthData.year}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      }

      // Generate PDF
      await html2pdf().set(opt).from(container).save()

      setIsGeneratingPDF(false)
    } catch (error) {
      console.error('PDF generation failed:', error)
      setIsGeneratingPDF(false)
      alert('PDF generation failed. Please try again.')
    }
  }

  // ==================== END PDF GENERATION CODE ====================

  // Search functionality
  const searchedCollectionMembers = useMemo(() => {
    if (!collectionSearchTerm.trim()) return members
    return members.filter(member =>
      member?.name?.toLowerCase().includes(collectionSearchTerm.toLowerCase()) ||
      member?.serialNo?.toLowerCase().includes(collectionSearchTerm.toLowerCase())
    )
  }, [members, collectionSearchTerm])

  useEffect(() => {
    if (!borrowingSearchTerm.trim()) {
      setSearchedBorrowingMembers([])
    } else {
      const filtered = members.filter(member =>
        member?.name?.toLowerCase().includes(borrowingSearchTerm.toLowerCase()) ||
        member?.serialNo?.toLowerCase().includes(borrowingSearchTerm.toLowerCase())
      )
      setSearchedBorrowingMembers(filtered)
    }
  }, [borrowingSearchTerm, members])

  // Filtered members
  const filteredMembers = useMemo(() => {
    const membersToFilter = collectionSearchTerm.trim() ? searchedCollectionMembers : members
    return membersToFilter.filter(member => {
      if (filter === 'all') return true
      if (filter === 'borrower') return member?.isBorrower
      if (filter === 'non-borrower') return !member?.isBorrower
      if (filter === 'penalty') return member?.penaltyApplied
      return true
    })
  }, [members, searchedCollectionMembers, collectionSearchTerm, filter])

  const getAllGuarantorsThisMonth = (memberId) => {
    if (!monthLoans[memberId]) return []
    const allGuarantors = []
    monthLoans[memberId].forEach(loan => {
      if (loan.guarantors && loan.guarantors.length > 0) {
        loan.guarantors.forEach(guarantor => {
          if (guarantor.trim() && !allGuarantors.includes(guarantor)) {
            allGuarantors.push(guarantor)
          }
        })
      }
    })
    return allGuarantors
  }

  const getPreviousPrincipal = (member) => {
    return getPrincipalBeforeMonthLoans(member)
  }

  const getMembersWithMonthLoans = useMemo(() => {
    return members.filter(member => {
      const memberId = member._id || member.id
      return monthLoans[memberId] && monthLoans[memberId].length > 0
    })
  }, [members, monthLoans])

  // Get display members for borrowing tab
  const getDisplayBorrowingMembers = useMemo(() => {
    if (readOnlyMode) {
      return getMembersWithMonthLoans
    }

    if (borrowingSearchTerm.trim()) {
      return searchedBorrowingMembers
    }

    const membersWithLoans = getMembersWithMonthLoans
    const membersWithPendingBorrows = members.filter(member => {
      const memberId = member._id || member.id
      return borrowAmounts[memberId] > 0 &&
        !membersWithLoans.some(m => (m._id || m.id) === memberId)
    })

    return [...membersWithLoans, ...membersWithPendingBorrows]
  }, [readOnlyMode, getMembersWithMonthLoans, borrowingSearchTerm, searchedBorrowingMembers, members, borrowAmounts])

  // Guarantor handlers
  const handleGuarantorChange = (memberId, guarantorIndex, value) => {
    setGuarantors(prev => {
      const currentGuarantors = prev[memberId] || ['', '']
      const updatedGuarantors = [...currentGuarantors]
      updatedGuarantors[guarantorIndex] = value
      return { ...prev, [memberId]: updatedGuarantors }
    })
  }

  const handleGuarantorSelect = (memberId, guarantorIndex, guarantorName) => {
    handleGuarantorChange(memberId, guarantorIndex, guarantorName)
    setActiveGuarantorDropdown(null)
  }

  const toggleGuarantorDropdown = (memberId, guarantorIndex) => {
    const dropdownKey = `${memberId}-${guarantorIndex}`
    setActiveGuarantorDropdown(activeGuarantorDropdown === dropdownKey ? null : dropdownKey)
  }

  const canBeGuarantor = (memberId, guarantorName) => {
    if (!guarantorName.trim()) return true
    const guarantorMember = members.find(m =>
      m?.name?.toLowerCase() === guarantorName.toLowerCase() ||
      m?.serialNo?.toLowerCase() === guarantorName.toLowerCase()
    )
    if (!guarantorMember) return true

    let guarantorCount = 0
    Object.values(monthLoans).forEach(loans => {
      loans.forEach(loan => {
        if (loan.guarantors) {
          loan.guarantors.forEach(guarantor => {
            if (guarantor.trim() && (
              guarantor.toLowerCase() === guarantorMember?.name?.toLowerCase() ||
              guarantor.toLowerCase() === guarantorMember?.serialNo?.toLowerCase()
            )) {
              guarantorCount++
            }
          })
        }
      })
    })
    return guarantorCount < 2
  }

  const getGuarantorSuggestions = (memberId, input) => {
    if (!input.trim()) return []
    return members.filter(member =>
      (member?._id || member?.id) !== memberId &&
      (member?.name?.toLowerCase().includes(input.toLowerCase()) ||
        member?.serialNo?.toLowerCase().includes(input.toLowerCase())) &&
      canBeGuarantor(memberId, member.name)
    ).slice(0, 5)
  }

  // Stats calculation
  const calculateMonthStats = () => {
    const totalShareCollection = members.reduce((sum, m) => sum + (calculatePaymentDetails(m)?.shareAmount || 0), 0)
    const totalInterest = members.reduce((sum, m) => sum + (calculatePaymentDetails(m)?.interestAmount || 0), 0)
    const totalPenalties = members.reduce((sum, m) => sum + (calculatePenalty(m) || 0), 0)
    const totalPaid = Object.values(monthPayments).reduce((sum, p) => sum + (p.paidAmount || 0), 0)
    const totalPrincipal = members.reduce((s, m) => s + (m.currentPrincipal || 0), 0)
    const totalBorrowed = members.reduce((s, m) => s + (m.borrowedAmount || 0), 0)
    const totalBorrowedThisMonth = Object.values(monthLoans).reduce((sum, loans) =>
      sum + loans.reduce((loanSum, loan) => loanSum + (loan.amount || 0), 0), 0
    )

    return {
      totalShareCollection,
      totalInterest,
      totalPenalties,
      totalPaid,
      totalPrincipal,
      totalBorrowed,
      totalBorrowedThisMonth
    }
  }

  const monthStats = calculateMonthStats()

  // UI Handlers
  const handleMuddalChange = (memberId, amount) => {
    setMuddalInputs(prev => ({ ...prev, [memberId]: parseInt(amount) || 0 }))
  }

  const handlePenaltyChange = (memberId, amount) => {
    setPenaltyInputs(prev => ({ ...prev, [memberId]: parseInt(amount) || 0 }))
  }

  const handleBorrowAmountChange = (memberId, amount) => {
    setBorrowAmounts(prev => ({ ...prev, [memberId]: parseInt(amount) || 0 }))
  }

  const togglePenalty = async (memberId) => {
    const member = members.find(m => (m._id || m.id) === memberId)
    if (!member) return

    try {
      const response = await fetch('/api/members/penalty', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member._id || member.id,
          penaltyApplied: !member.penaltyApplied
        })
      })

      const result = await response.json()

      if (result.success) {
        setMembers(members.map(m =>
          (m._id || m.id) === memberId ? { ...m, penaltyApplied: !m.penaltyApplied } : m
        ))
      }
    } catch (error) {
      console.error('Error toggling penalty:', error)
    }
  }

  // Payment Functions
  const processPayment = async (member, paymentMode = 'cash') => {
    if (readOnlyMode) return

    const memberId = member._id || member.id
    const paymentDetails = calculatePaymentDetails(member)
    const penaltyAmount = calculatePenalty(member)
    const totalDue = paymentDetails.total + penaltyAmount

    try {
      const response = await fetch(`/api/months/${date}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          shareAmount: paymentDetails.shareAmount,
          muddalPaid: paymentDetails.muddalPaid,
          interestAmount: paymentDetails.interestAmount,
          penaltyAmount,
          totalAmount: totalDue,
          paymentMode,
          principalBefore: paymentDetails.principalBeforeLoans,
          principalAfter: paymentDetails.newPrincipal
        })
      })

      const result = await response.json()

      if (result.success) {
        await loadMonthData()
        alert(`Payment processed successfully via ${paymentMode === 'cash' ? 'Cash' : 'Online'}!\\nTotal collected: ₹${totalDue}`)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      alert('Failed to process payment')
    }
  }

  const handleUndoPayment = async (memberId) => {
    if (readOnlyMode) return

    if (!confirm('Are you sure you want to undo this payment?')) return

    try {
      const response = await fetch(`/api/months/${date}/payments?memberId=${memberId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        await loadMonthData()
        setMuddalInputs(prev => ({ ...prev, [memberId]: 0 }))
        setPenaltyInputs(prev => ({ ...prev, [memberId]: 0 }))
        alert('Payment reverted successfully')
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error reverting payment:', error)
      alert('Failed to revert payment')
    }
  }

  // Borrowing Functions
  const processSingleBorrowing = async (memberId) => {
    if (readOnlyMode) return

    const borrowAmount = borrowAmounts[memberId] || 0
    if (borrowAmount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    const memberGuarantors = guarantors[memberId] || ['', '']
    const validGuarantors = memberGuarantors.filter(g => g.trim() !== '')

    try {
      const member = members.find(m => (m._id || m.id) === memberId)
      const response = await fetch(`/api/months/${date}/borrowings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member._id || member.id,
          amount: borrowAmount,
          guarantors: validGuarantors
        })
      })

      const result = await response.json()

      if (result.success) {
        await loadMonthData()
        setBorrowAmounts(prev => ({ ...prev, [memberId]: 0 }))
        setGuarantors(prev => ({ ...prev, [memberId]: ['', ''] }))
        alert(`Loan of ₹${borrowAmount.toLocaleString()} processed successfully`)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error processing borrowing:', error)
      alert('Failed to process borrowing')
    }
  }

  // Card styling
  const getCardClass = (cardType) => {
    const baseClass = 'rounded-lg shadow-md p-6 text-center cursor-pointer transition-all duration-200'
    if (filter === cardType) {
      switch (cardType) {
        case 'all': return `${baseClass} bg-blue-100 border-2 border-blue-500 transform scale-105`
        case 'borrower': return `${baseClass} bg-purple-100 border-2 border-purple-500 transform scale-105`
        case 'non-borrower': return `${baseClass} bg-green-100 border-2 border-green-500 transform scale-105`
        case 'penalty': return `${baseClass} bg-red-100 border-2 border-red-500 transform scale-105`
        default: return `${baseClass} bg-white border-2 border-gray-300`
      }
    }
    return `${baseClass} bg-white border border-gray-200 hover:shadow-lg hover:border-gray-300`
  }

  const getTextClass = (cardType) => {
    if (filter === cardType) {
      switch (cardType) {
        case 'all': return 'text-blue-700'
        case 'borrower': return 'text-purple-700'
        case 'non-borrower': return 'text-green-700'
        case 'penalty': return 'text-red-700'
        default: return 'text-gray-700'
      }
    }
    return 'text-gray-700'
  }

  const getPaymentStatusClass = (member) =>
    hasMemberPaid(member) ? 'bg-green-50 border-l-4 border-green-400' : 'bg-white'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">लोड होत आहे...</p>
        </div>
      </div>
    )
  }

  if (!monthData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Month data not found</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline mt-4 inline-block">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Tab navigation function
  const getTabClass = (tabName) => {
    const baseClass = 'px-4 py-2 rounded-md font-medium transition-colors'
    return activeTab === tabName ? `${baseClass} bg-blue-600 text-white` : `${baseClass} bg-gray-200 text-gray-700 hover:bg-gray-300`
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {monthData.monthName} {monthData.year}
                {readOnlyMode && (
                  <span className="ml-2 text-sm font-normal text-gray-500">(Read Only)</span>
                )}
              </h1>
              <p className="text-sm text-gray-600 mt-1">Collection Date: 25th {monthData.monthName}</p>
            </div>
            <Link
              href="/dashboard"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 px-4">
          <div
            className={getCardClass('all')}
            onClick={() => setFilter('all')}
          >
            <h3 className={`text-sm font-semibold mb-2 ${getTextClass('all')}`}>सर्व सदस्य (All Members)</h3>
            <p className={`text-2xl font-bold ${getTextClass('all')}`}>{members.length}</p>
          </div>

          <div
            className={getCardClass('borrower')}
            onClick={() => setFilter('borrower')}
          >
            <h3 className={`text-sm font-semibold mb-2 ${getTextClass('borrower')}`}>कर्जदार (Borrowers)</h3>
            <p className={`text-2xl font-bold ${getTextClass('borrower')}`}>
              {members.filter(m => m?.isBorrower).length}
            </p>
          </div>

          <div
            className={getCardClass('non-borrower')}
            onClick={() => setFilter('non-borrower')}
          >
            <h3 className={`text-sm font-semibold mb-2 ${getTextClass('non-borrower')}`}>कर्ज नसलेले (Non-Borrowers)</h3>
            <p className={`text-2xl font-bold ${getTextClass('non-borrower')}`}>
              {members.filter(m => !m?.isBorrower).length}
            </p>
          </div>

          <div
            className={getCardClass('penalty')}
            onClick={() => setFilter('penalty')}
          >
            <h3 className={`text-sm font-semibold mb-2 ${getTextClass('penalty')}`}>दंड प्रकरणे (Penalty Cases)</h3>
            <p className={`text-2xl font-bold ${getTextClass('penalty')}`}>
              {members.filter(m => m?.penaltyApplied).length}
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6 px-4">
          <button className={getTabClass('collection')} onClick={() => setActiveTab('collection')}>संकलन तपशील</button>
          <button className={getTabClass('borrowing')} onClick={() => setActiveTab('borrowing')}>कर्ज व्यवस्थापन</button>
        </div>

        {/* Collection Tab Content */}
        {activeTab === 'collection' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">मासिक संकलन व्यवस्थापन</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {readOnlyMode ? (
                      "फक्त पहाण्यासाठी - व्यवहार पूर्ण झाला"
                    ) : (
                      `पेमेंट व्यवस्थापित करा, भाग रक्कम: ₹${SHARE_AMOUNT} | व्याज: ${INTEREST_RATE}% | दंड: ${PENALTY_RATE}% + ₹${BASE_PENALTY}`
                    )}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
                      <span>पेमेंट झाले</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-white border border-gray-300 rounded-full mr-2"></div>
                      <span>प्रलंबित</span>
                    </div>
                  </div>
                  <button
                    onClick={() => exportToPDF('collection')}
                    disabled={isGeneratingPDF}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${isGeneratingPDF
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    {isGeneratingPDF ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        तयार होत आहे...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        PDF निर्यात करा
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Collection Search */}
            {!readOnlyMode && (
              <div className="px-6 py-4 bg-gray-50 border-b">
                <div className="max-w-md">
                  <input
                    type="text"
                    value={collectionSearchTerm}
                    onChange={(e) => setCollectionSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="नाव किंवा अनुक्रमांक प्रविष्ट करा"
                  />
                </div>
              </div>
            )}

            {/* Collection Table - Same as before */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">सभा. क्र</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">भागधारकाचे नाव</th>
                    <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">भाग<br />संख्या</th>
                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">भाग<br />रक्कम</th>
                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">कर्ज<br />शिल्लक</th>
                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">मुद्दल<br />भरणा</th>
                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-20">व्याज</th>
                    <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">दंड</th>
                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">नवीन<br />शिल्लक</th>
                    <th className="px-2 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">एकूण</th>
                    {!readOnlyMode && (
                      <th className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">क्रिया</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.map((member) => {
                    const memberId = member._id || member.id
                    const paymentDetails = calculatePaymentDetails(member)
                    const penaltyAmount = calculatePenalty(member)
                    const isPaid = hasMemberPaid(member)
                    const totalAmount = isPaid
                      ? (monthPayments[memberId]?.calculatedTotal || monthPayments[memberId]?.paidAmount || 0)
                      : (paymentDetails.total + penaltyAmount)
                    const remainingPrincipal = paymentDetails.newPrincipal
                    const totalBorrowedThisMonth = paymentDetails.totalBorrowedThisMonth

                    return (
                      <tr key={memberId} className={`${getPaymentStatusClass(member)} hover:bg-gray-50 transition-colors`}>
                        <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 border-b">
                          {member.serialNo}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap border-b">
                          <div className="text-xs font-semibold text-gray-900 truncate max-w-[150px]" title={member.name}>{member.name}</div>
                          <div className="text-[10px] text-gray-500">{member.phone}</div>
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 font-bold text-center border-b">
                          {member.numberOfShares || 0}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900 text-right font-medium border-b">
                          ₹{paymentDetails.shareAmount.toLocaleString()}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs text-right border-b">
                          {(member.isBorrower || totalBorrowedThisMonth > 0) ? (
                            <div>
                              <div className="text-red-600 font-semibold">
                                ₹{paymentDetails.principalBeforeLoans.toLocaleString()}
                              </div>
                              {totalBorrowedThisMonth > 0 && (
                                <div className="text-[10px] text-blue-600">
                                  +₹{totalBorrowedThisMonth.toLocaleString()}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-right border-b">
                          {(member.isBorrower || totalBorrowedThisMonth > 0) ? (
                            readOnlyMode ? (
                              isPaid ? (
                                <div className="text-xs text-blue-600 font-medium">
                                  ₹{(monthPayments[memberId]?.calculatedMuddal || monthPayments[memberId]?.muddalPaid || 0).toLocaleString()}
                                </div>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )
                            ) : isPaid ? (
                              <div className="text-xs text-blue-600 font-medium">
                                ₹{(monthPayments[memberId]?.calculatedMuddal || monthPayments[memberId]?.muddalPaid || 0).toLocaleString()}
                              </div>
                            ) : (
                              <input
                                type="number"
                                value={muddalInputs[memberId] || ''}
                                onChange={(e) => handleMuddalChange(memberId, e.target.value)}
                                className="w-20 px-1 py-0.5 border border-gray-300 rounded text-right text-xs"
                                placeholder="0"
                                disabled={isPaid}
                              />
                            )
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs text-right border-b">
                          {(member.isBorrower || totalBorrowedThisMonth > 0) ? (
                            <div>
                              <span className="text-orange-600 font-medium">
                                ₹{paymentDetails.interestAmount.toLocaleString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap border-b">
                          {readOnlyMode ? (
                            isPaid && penaltyAmount > 0 ? (
                              <div className="text-xs text-red-600 font-medium text-center">
                                ₹{penaltyAmount.toLocaleString()}
                              </div>
                            ) : (
                              <div className="text-center text-gray-300">-</div>
                            )
                          ) : isPaid ? (
                            penaltyAmount > 0 ? (
                              <div className="text-xs text-red-600 font-medium text-center">
                                ₹{penaltyAmount.toLocaleString()}
                              </div>
                            ) : (
                              <div className="text-center text-gray-300">-</div>
                            )
                          ) : (
                            <div className="flex flex-col items-center space-y-1">
                              <button
                                onClick={() => togglePenalty(memberId)}
                                className={`px-1.5 py-0.5 text-[10px] rounded border transition-colors ${member.penaltyApplied
                                  ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                                  }`}
                                disabled={isPaid}
                              >
                                {member.penaltyApplied ? 'दंड आहे' : 'दंड नाही'}
                              </button>
                              {member.penaltyApplied && (
                                <input
                                  type="number"
                                  value={penaltyInputs[memberId] || ''}
                                  onChange={(e) => handlePenaltyChange(memberId, e.target.value)}
                                  className="w-16 px-1 py-0.5 border border-red-300 rounded text-center text-xs focus:ring-1 focus:ring-red-500"
                                  placeholder={calculatePenalty(member).toString()}
                                  disabled={isPaid}
                                />
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs text-right border-b">
                          {(member.isBorrower || totalBorrowedThisMonth > 0) ? (
                            <div>
                              <div className="text-purple-600 font-medium">
                                ₹{remainingPrincipal.toLocaleString()}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="px-2 py-2 whitespace-nowrap text-xs font-bold text-green-600 text-right border-b">
                          ₹{totalAmount.toLocaleString()}
                        </td>
                        {!readOnlyMode && (
                          <td className="px-2 py-2 whitespace-nowrap text-center border-b">
                            {isPaid ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className={`inline-flex px-2 py-0.5 text-[10px] font-semibold rounded-full ${monthPayments[memberId]?.paymentMode === 'online'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-green-100 text-green-800'
                                  }`}>
                                  {monthPayments[memberId]?.paymentMode === 'online' ? 'Online' : 'Cash'}
                                </span>
                                <button
                                  onClick={() => handleUndoPayment(memberId)}
                                  className="text-[10px] text-red-500 hover:text-red-700 hover:underline"
                                >
                                  रद्द करा
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-1 justify-center">
                                <button
                                  onClick={() => processPayment(member, 'cash')}
                                  disabled={loading}
                                  className="px-2 py-1 bg-green-500 text-white text-[10px] rounded hover:bg-green-600 transition-colors shadow-sm"
                                  title="Cash Payment"
                                >
                                  रोख
                                </button>
                                <button
                                  onClick={() => processPayment(member, 'online')}
                                  disabled={loading}
                                  className="px-2 py-1 bg-blue-500 text-white text-[10px] rounded hover:bg-blue-600 transition-colors shadow-sm"
                                  title="Online Payment"
                                >
                                  ऑनलाईन
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div >
        )
        }

        {/* Borrowing Tab Content */}
        {
          activeTab === 'borrowing' && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">कर्ज व्यवस्थापन</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {readOnlyMode ? (
                        "फक्त पहाण्यासाठी - व्यवहार पूर्ण झाला"
                      ) : (
                        "कर्ज प्रक्रियेसाठी नाव किंवा अनुक्रमांकाने सदस्य शोधा"
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => exportToPDF('borrowing')}
                    disabled={isGeneratingPDF}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${isGeneratingPDF
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    {isGeneratingPDF ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        तयार होत आहे...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        PDF निर्यात करा
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Borrowing Search */}
              {!readOnlyMode && (
                <div className="px-6 py-4 bg-gray-50 border-b">
                  <div className="max-w-md">
                    <input
                      type="text"
                      value={borrowingSearchTerm}
                      onChange={(e) => setBorrowingSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="नाव किंवा अनुक्रमांक प्रविष्ट करा"
                    />
                  </div>
                </div>
              )}

              {/* Borrowing Table - Same as before */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">सभा. क्र<br />(Serial No.)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">भागधारकाचे नाव<br />(Member Name)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">मागील कर्ज<br />(Previous Loan)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">यावेळी घेतलेले कर्ज<br />(Loan Taken)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">जामीन<br />(Guarantor)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">नवीन कर्ज शिल्लक<br />(New Loan Balance)</th>
                      {!readOnlyMode && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">क्रिया<br />(Action)</th>}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getDisplayBorrowingMembers.map((member) => {
                      const memberId = member._id || member.id
                      const borrowAmount = borrowAmounts[memberId] || ''
                      const totalBorrowingThisMonth = getTotalBorrowingThisMonth(memberId)
                      const previousPrincipal = getPreviousPrincipal(member)
                      const allGuarantors = getAllGuarantorsThisMonth(memberId)
                      const currentPrincipal = member.currentPrincipal || 0
                      const newPrincipalWithPending = currentPrincipal + (parseInt(borrowAmount) || 0)
                      const memberGuarantors = guarantors[memberId] || ['', '']

                      return (
                        <tr key={memberId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.serialNo}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.phone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{previousPrincipal.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {readOnlyMode ? (
                              totalBorrowingThisMonth > 0 ? (
                                <div className="text-sm text-blue-600 font-semibold">₹{totalBorrowingThisMonth.toLocaleString()}</div>
                              ) : <span className="text-gray-400">-</span>
                            ) : (
                              <div className="space-y-1">
                                <input
                                  type="number"
                                  value={borrowAmount}
                                  onChange={(e) => handleBorrowAmountChange(memberId, e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                                  placeholder="रक्कम प्रविष्ट करा"
                                />
                                {totalBorrowingThisMonth > 0 && (
                                  <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">या महिन्यात आधीच: ₹{totalBorrowingThisMonth.toLocaleString()}</div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {readOnlyMode ? (
                              allGuarantors.length > 0 ? (
                                <div className="space-y-1">
                                  {allGuarantors.map((guarantor, idx) => (
                                    <div key={idx} className="text-sm text-gray-900 bg-blue-50 px-2 py-1 rounded">{guarantor}</div>
                                  ))}
                                </div>
                              ) : <span className="text-gray-400">जामीन नाही</span>
                            ) : (
                              <div className="space-y-2">
                                {[0, 1].map((guarantorIndex) => {
                                  const dropdownKey = `${memberId}-${guarantorIndex}`
                                  const suggestions = getGuarantorSuggestions(memberId, memberGuarantors[guarantorIndex])
                                  return (
                                    <div key={guarantorIndex} className="relative">
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          value={memberGuarantors[guarantorIndex]}
                                          onChange={(e) => handleGuarantorChange(memberId, guarantorIndex, e.target.value)}
                                          onFocus={() => setActiveGuarantorDropdown(dropdownKey)}
                                          className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-black text-sm"
                                          placeholder={`जामीन ${guarantorIndex + 1} (Optional)`}
                                        />
                                        <button onClick={() => toggleGuarantorDropdown(memberId, guarantorIndex)} className="px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm">↓</button>
                                      </div>
                                      {activeGuarantorDropdown === dropdownKey && suggestions.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                          {suggestions.map((suggestion) => (
                                            <div key={suggestion._id || suggestion.id} onClick={() => handleGuarantorSelect(memberId, guarantorIndex, suggestion.name)} className="px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                              <div className="text-sm font-medium text-gray-900">{suggestion.name}</div>
                                              <div className="text-xs text-gray-500">{suggestion.serialNo}</div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                                {allGuarantors.length > 0 && <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">विद्यमान: {allGuarantors.join(', ')}</div>}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-bold text-purple-600">₹{currentPrincipal.toLocaleString()}</div>
                              {borrowAmount > 0 && !readOnlyMode && <div className="text-xs text-green-600 mt-1">+₹{parseInt(borrowAmount).toLocaleString()}</div>}
                            </div>
                          </td>
                          {!readOnlyMode && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => processSingleBorrowing(memberId)}
                                disabled={!borrowAmount || parseInt(borrowAmount) <= 0}
                                className={`px-3 py-2 text-sm rounded-md w-full ${borrowAmount && parseInt(borrowAmount) > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                              >
                                सबमिट करा
                              </button>
                            </td>
                          )}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        }

        {/* Summary Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">पेमेंट सारांश (Payment Summary)</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">भाग संकलन (Share):</span><span className="font-medium">₹{monthStats.totalShareCollection.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">व्याज (Interest):</span><span className="font-medium">₹{monthStats.totalInterest.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">दंड (Penalty):</span><span className="font-medium">₹{monthStats.totalPenalties.toLocaleString()}</span></div>
              <div className="flex justify-between pt-2 border-t"><span className="text-gray-900 font-semibold">एकूण संकलित (Total):</span><span className="font-bold text-green-600">₹{monthStats.totalPaid.toLocaleString()}</span></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">कर्जदार सारांश (Loan Summary)</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">कर्जदार (Borrowers):</span><span className="font-medium">{members.filter(m => m?.isBorrower).length}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">या महिन्यातील कर्ज:</span><span className="font-medium">₹{monthStats.totalBorrowedThisMonth.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">कर्ज शिल्लक (Balance):</span><span className="font-medium">₹{monthStats.totalPrincipal.toLocaleString()}</span></div>
              <div className="flex justify-between pt-2 border-t"><span className="text-gray-900 font-semibold">एकूण कर्ज (All Time):</span><span className="font-bold text-blue-600">₹{monthStats.totalBorrowed.toLocaleString()}</span></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">सिस्टम माहिती (System Info)</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">भाग (Share):</span><span className="font-medium">₹{SHARE_AMOUNT}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">व्याज दर (Interest):</span><span className="font-medium">{INTEREST_RATE}%</span></div>
              <div className="flex justify-between"><span className="text-gray-600">दंड दर (Penalty):</span><span className="font-medium">{PENALTY_RATE}% + ₹{BASE_PENALTY}</span></div>
              <div className="flex justify-between pt-2 border-t"><span className="text-gray-900 font-semibold">मोड (Mode):</span><span className={`font-bold ${readOnlyMode ? 'text-yellow-600' : 'text-green-600'}`}>{readOnlyMode ? 'वाचन (Read)' : 'संपादन (Edit)'}</span></div>
            </div>
          </div>
        </div>
      </main >
    </div >
  )
}
