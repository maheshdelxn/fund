'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { authAPI } from '@/lib/api-client';
import CollectionTab from '@/components/months/CollectionTab';
import BorrowingTab from '@/components/months/BorrowingTab';
import { ArrowLeft, Download, FileText, Filter, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from 'sonner';
import ConfirmationModal from '@/components/ui/ConfirmationModal';
import MemberHistoryModal from '@/components/members/MemberHistoryModal';

export default function MonthDetailsPage() {
  const [monthData, setMonthData] = useState(null)
  const [members, setMembers] = useState([])
  const [filter, setFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('collection')
  const [muddalInputs, setMuddalInputs] = useState({})
  const [penaltyInputs, setPenaltyInputs] = useState({})
  const [borrowAmounts, setBorrowAmounts] = useState({})
  const [monthPayments, setMonthPayments] = useState({})
  const [readOnlyMode, setReadOnlyMode] = useState(false)
  const [collectionSearchTerm, setCollectionSearchTerm] = useState('')
  const [guarantors, setGuarantors] = useState({})
  const [borrowingSearchTerm, setBorrowingSearchTerm] = useState('')
  const [monthLoans, setMonthLoans] = useState({})
  const [loading, setLoading] = useState(true)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [user, setUser] = useState(null)

  // Modal State
  const [historyModalMemberId, setHistoryModalMemberId] = useState(null);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    confirmText: 'होय, खात्री करा',
    onConfirm: () => { }
  });

  const params = useParams();
  const date = params.date;

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
      toast.error('मासिक माहिती लोड करण्यास अयशस्वी');
    } finally {
      // Small delay for smooth skeleton transition if detailed, or instant
      setTimeout(() => setLoading(false), 300)
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        const userData = await authAPI.getMe();
        setUser(userData);
      } catch (e) { console.error(e); }
      if (date) {
        await loadMonthData();
      }
    };
    init();
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
    const pendingBorrowAmount = parseInt(borrowAmounts[memberId]) || 0
    return (member.currentPrincipal || 0) + pendingBorrowAmount
  }

  const calculatePaymentDetails = (member) => {
    if (!member) return null

    const memberId = member._id || member.id
    const existingPayment = monthPayments[memberId]

    const memberShares = member.numberOfShares || 1
    const currentShareAmount = memberShares * SHARE_AMOUNT

    if (existingPayment?.paid) {
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
        interestAmount: recalculatedInterest,
        totalCompulsory: (existingPayment.shareAmount || currentShareAmount) + recalculatedInterest,
        principalBeforeLoans: existingPayment.principalBefore || 0,
        currentPrincipalWithLoans: member.currentPrincipal || 0,
        newPrincipal: existingPayment.principalAfter || member.currentPrincipal || 0,
        total: existingPayment.calculatedTotal || existingPayment.paidAmount || 0,
        totalBorrowedThisMonth: getTotalBorrowingThisMonth(memberId),
        principalBeforePayment: existingPayment.principalBefore || 0,
        status: 'Paid'
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
        principalBeforePayment: 0,
        status: 'Pending'
      }
    }

    const muddalPaid = Math.max(0, parseInt(muddalInputs[memberId]) || 0)
    const totalBorrowedThisMonth = getTotalBorrowingThisMonth(memberId)
    const currentPrincipalIncludingNewParams = (member.currentPrincipal || 0);
    const openingPrincipal = Math.max(0, currentPrincipalIncludingNewParams - totalBorrowedThisMonth);

    const remainingOldPrincipal = Math.max(0, openingPrincipal - muddalPaid);
    const interestOnPrincipal = Math.ceil(remainingOldPrincipal * (INTEREST_RATE / 100));
    const interestOnNewLoan = Math.ceil(totalBorrowedThisMonth * (INTEREST_RATE / 100));

    const interestAmount = interestOnPrincipal + interestOnNewLoan
    const total = currentShareAmount + muddalPaid + interestAmount

    const newPrincipal = remainingOldPrincipal + totalBorrowedThisMonth;

    return {
      shareAmount: currentShareAmount,
      muddalPaid,
      interestAmount,
      totalCompulsory: currentShareAmount + interestAmount,
      principalBeforeLoans: openingPrincipal,
      currentPrincipalWithLoans: currentPrincipalIncludingNewParams,
      newPrincipal: newPrincipal,
      total,
      totalBorrowedThisMonth,
      principalBeforePayment: currentPrincipalIncludingNewParams,
      status: 'Pending'
    }
  }

  const calculatePenalty = (member) => {
    if (!member) return 0

    const memberId = member._id || member.id
    const existingPayment = monthPayments[memberId]

    if (existingPayment?.paid) {
      return existingPayment.calculatedPenalty || existingPayment.penaltyAmount || 0
    }

    const userEnteredPenalty = penaltyInputs[memberId]
    if (userEnteredPenalty !== undefined && userEnteredPenalty !== '') {
      const manualPenalty = parseInt(userEnteredPenalty)
      if (!isNaN(manualPenalty) && manualPenalty >= 0) {
        return manualPenalty
      }
    }

    if (!member.penaltyApplied) return 0

    let penalty = BASE_PENALTY
    const currentPrincipalWithLoans = getCurrentPrincipalWithMonthLoans(member)
    if (member.isBorrower || currentPrincipalWithLoans > 0) {
      const principalPenalty = Math.round(currentPrincipalWithLoans * (PENALTY_RATE / 100))
      penalty += principalPenalty
    }
    return penalty
  }

  // ==================== PDF GENERATION CODE ====================
  const chunkMembers = (members, chunkSize) => {
    const chunks = []
    for (let i = 0; i < members.length; i += chunkSize) {
      chunks.push(members.slice(i, i + chunkSize))
    }
    return chunks
  }

  const getCurrentDate = () => {
    const now = new Date()
    return now.toLocaleString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  const getPreviousPrincipal = (member) => getPrincipalBeforeMonthLoans(member)
  const getAllGuarantorsThisMonth = (memberId) => {
    if (!monthLoans[memberId]) return []
    const all = []
    monthLoans[memberId].forEach(l => {
      if (l.guarantors) l.guarantors.forEach(g => { if (g && !all.includes(g)) all.push(g) })
    })
    return all
  }
  const getMembersWithMonthLoans = useMemo(() => {
    return members.filter(member => {
      const memberId = member._id || member.id
      return monthLoans[memberId] && monthLoans[memberId].length > 0
    })
  }, [members, monthLoans])

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
                    <span style="display: inline-block; padding: 2px 6px; border-radius: 10px; font-size: 8px; font-weight: bold; ${isPaid ? 'background: #dcfce7; color: #166534;' : 'background: #fef3c7; color: #92400e;'}">
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

    if (membersWithLoans.length === 0) {
      return `<div>कर्ज माहिती उपलब्ध नाही</div>`
    }

    return memberChunks.map((chunk, pageIndex) => `
      <div class="pdf-page ${pageIndex < memberChunks.length - 1 ? 'page-break' : ''}">
        <div class="pdf-header">
           <div class="header-text">
              <h1>शिवांजली फंड - कर्ज अहवाल</h1>
              <p class="subtitle">महिना: ${monthData.monthName} ${monthData.year}</p>
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
                  <td>${member.name}</td>
                  <td>₹${previousPrincipal.toLocaleString()}</td>
                  <td style="font-weight: bold; color: #059669;">₹${totalBorrowingThisMonth.toLocaleString()}</td>
                  <td>${allGuarantors.join(', ') || 'जामीन नाही'}</td>
                  <td>₹${member.currentPrincipal?.toLocaleString()}</td>
                </tr>
              `
    }).join('')}
          </tbody>
        </table>
      </div>
    `).join('')
  }

  const exportToPDF = async (tableType = 'collection') => {
    const toastId = toast.loading('PDF तयार करत आहे...');
    setIsGeneratingPDF(true)
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const pdfContent = tableType === 'collection' ? generateCollectionPDFPages() : generateBorrowingPDFPages()
      const container = document.createElement('div')
      container.innerHTML = `
        <div class="pdf-container">
          <style>
            .pdf-container { font-family: 'Arial', sans-serif; width: 100%; }
            .pdf-page { width: 100%; min-height: 297mm; padding: 10mm; box-sizing: border-box; background: white; }
            .page-break { page-break-after: always; }
            .pdf-header { background: #f8fafc; padding: 15px; border-bottom: 2px solid #e2e8f0; margin-bottom: 15px; display: flex; justify-content: space-between; }
            .pdf-table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 20px; table-layout: fixed; }
            .pdf-table th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 8px 4px; text-align: center; }
            .pdf-table td { border: 1px solid #cbd5e1; padding: 6px 4px; text-align: center; }
            .paid-row { background: #f0fdf4 !important; }
          </style>
          ${pdfContent}
        </div>
      `
      const opt = {
        margin: 0,
        filename: `Shivanjali_${tableType}_${monthData.monthName}_${monthData.year}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      }
      await html2pdf().set(opt).from(container).save()
      toast.success('PDF यशस्वीरित्या तयार झाली!', { id: toastId });
    } catch (error) {
      console.error('PDF generation failed:', error)
      toast.error('PDF तयार करण्यास अयशस्वी', { id: toastId });
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // Use Memo filters
  const searchedCollectionMembers = useMemo(() => {
    if (!collectionSearchTerm.trim()) return members
    return members.filter(member =>
      member?.name?.toLowerCase().includes(collectionSearchTerm.toLowerCase()) ||
      member?.serialNo?.toLowerCase().includes(collectionSearchTerm.toLowerCase())
    )
  }, [members, collectionSearchTerm])

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


  // Display Members Borrowing
  const getDisplayBorrowingMembers = useMemo(() => {
    if (readOnlyMode) return getMembersWithMonthLoans
    if (borrowingSearchTerm.trim()) {
      return members.filter(m =>
        m.name.toLowerCase().includes(borrowingSearchTerm.toLowerCase()) ||
        (m.serialNo && m.serialNo.toLowerCase().includes(borrowingSearchTerm.toLowerCase()))
      )
    }
    return members
  }, [readOnlyMode, getMembersWithMonthLoans, borrowingSearchTerm, members])


  // UI Handlers Actions
  const handleMuddalChange = (memberId, val) => setMuddalInputs(p => ({ ...p, [memberId]: val }))
  const handlePenaltyChange = (memberId, val) => setPenaltyInputs(p => ({ ...p, [memberId]: val }))
  const handleBorrowAmountChange = (memberId, val) => setBorrowAmounts(p => ({ ...p, [memberId]: val }))

  const togglePenalty = async (memberId) => {
    // API Call to toggle penalty
    const member = members.find(m => (m._id || m.id) === memberId)
    if (!member) return
    try {
      await fetch('/api/members/penalty', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, penaltyApplied: !member.penaltyApplied })
      });
      setMembers(members.map(m => m._id === memberId ? { ...m, penaltyApplied: !m.penaltyApplied } : m))
      toast.success(member.penaltyApplied ? 'दंड काढला' : 'दंड लावला');
    } catch (e) {
      console.error(e);
      toast.error('दंड बदलण्यात अयशस्वी');
    }
  }

  const processPayment = async (member, paymentMode = 'cash') => {
    if (readOnlyMode) return;
    const paymentDetails = calculatePaymentDetails(member);
    const penaltyAmount = calculatePenalty(member);
    const totalDue = paymentDetails.total + penaltyAmount;

    const body = {
      memberId: member._id || member.id,
      shareAmount: paymentDetails.shareAmount,
      muddalPaid: paymentDetails.muddalPaid,
      interestAmount: paymentDetails.interestAmount,
      penaltyAmount,
      totalAmount: totalDue,
      paymentMode,
      principalBefore: paymentDetails.principalBeforeLoans,
      principalAfter: paymentDetails.newPrincipal
    };

    try {
      const res = await fetch(`/api/months/${date}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      if (json.success) {
        await loadMonthData();
        toast.success(`पैसे प्राप्त झाले: ₹${totalDue.toLocaleString()}`, { description: `सभासद: ${member.name}` });
      } else {
        toast.error(json.error || 'पेमेंट अयशस्वी');
      }
    } catch (e) {
      toast.error('काहीतरी चूक झाली');
    }
  }

  const handleUndoPayment = (memberId) => {
    const member = members.find(m => (m._id || m.id) === memberId);
    setModalConfig({
      isOpen: true,
      title: 'पेमेंट रद्द करायचे?',
      message: `${member?.name} यांचे पेमेंट रद्द करायचे आहे का? ही क्रिया त्वरित पूर्ववत केली जाऊ शकत नाही.`,
      type: 'danger',
      confirmText: 'होय, रद्द करा',
      onConfirm: async () => {
        const loadingToast = toast.loading('पेमेंट रद्द करत आहे...');
        try {
          await fetch(`/api/months/${date}/payments?memberId=${memberId}`, { method: 'DELETE' });
          await loadMonthData();
          toast.success('पेमेंट रद्द केले', { id: loadingToast });
        } catch (e) {
          toast.error('पेमेंट रद्द करण्यास अयशस्वी', { id: loadingToast });
        }
      }
    });
  }

  const processSingleBorrowing = async (memberId) => {
    const amount = borrowAmounts[memberId];
    if (!amount) return;
    // Guarantors
    const gs = guarantors[memberId] || [];

    // Validate if amount > 0
    if (parseInt(amount) <= 0) {
      toast.error('कृपया वैध रक्कम प्रविष्ट करा');
      return;
    }

    try {
      const res = await fetch(`/api/months/${date}/borrowings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId,
          amount: parseInt(amount),
          guarantors: gs.filter(g => g && g.trim())
        })
      });

      const json = await res.json();
      if (json.success) {
        await loadMonthData();
        setBorrowAmounts(p => ({ ...p, [memberId]: 0 }));
        toast.success(`कर्ज जोडले: ₹${parseInt(amount).toLocaleString()}`);
      } else {
        toast.error(json.error || 'कर्ज जोडण्यास अयशस्वी');
      }

    } catch (e) {
      toast.error('सर्व्हरशी संपर्क साधण्यास अयशस्वी');
    }
  }


  if (loading) return (
    <DashboardLayout user={user}>
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header Skeleton */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 flex justify-between items-center">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-10 w-64 rounded-xl" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <div className="flex gap-4 mb-6">
            <Skeleton className="h-10 w-32 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );

  if (!monthData) return <div className="p-12 text-center text-gray-500">माहिती आढळली नाही</div>

  return (
    <DashboardLayout user={user}>
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
      />
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <ArrowLeft size={20} />
                </Link>
                <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wider">
                  {monthData.status === 'completed' ? 'बंद' : 'चालू महिना'}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{monthData.monthName} {monthData.year}</h1>
              <div className="flex items-center gap-2 text-gray-500 mt-1 text-sm">
                <Calendar size={14} />
                <span>जमा तारीख: २5 {monthData.monthName}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => exportToPDF('collection')}
                disabled={isGeneratingPDF}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm shadow-lg shadow-gray-200"
              >
                <FileText size={16} />
                {isGeneratingPDF ? 'तयार होत आहे...' : 'जमा अहवाल'}
              </button>
              <button
                onClick={() => exportToPDF('borrowing')}
                disabled={isGeneratingPDF}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm"
              >
                <Download size={16} />
                {isGeneratingPDF ? '...' : 'कर्ज अहवाल'}
              </button>
            </div>
          </div>

          {/* Stats Summary (Optional Micro-stats) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-50">
            <div className="px-2">
              <span className="block text-xs text-gray-400 uppercase tracking-wider mb-1">सभासद (Members)</span>
              <span className="text-xl font-bold text-gray-800">{members.length}</span>
            </div>
            <div className="px-2">
              <span className="block text-xs text-gray-400 uppercase tracking-wider mb-1">जमा (Collection)</span>
              <span className="text-xl font-bold text-emerald-600">
                ₹{members.reduce((acc, m) => acc + (monthPayments[m._id || m.id]?.paidAmount || 0), 0).toLocaleString()}
              </span>
            </div>
            <div className="px-2">
              <span className="block text-xs text-gray-400 uppercase tracking-wider mb-1">कर्ज वाटप (Loans)</span>
              <span className="text-xl font-bold text-purple-600">
                ₹{Object.values(monthLoans).flat().reduce((acc, l) => acc + (l.amount || 0), 0).toLocaleString()}
              </span>
            </div>
            <div className="px-2">
              <span className="block text-xs text-gray-400 uppercase tracking-wider mb-1">बाकी (Pending)</span>
              <span className="text-xl font-bold text-orange-600">{members.filter(m => !hasMemberPaid(m)).length}</span>
            </div>
          </div>
        </div>

        {/* Filters & Tabs Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
          <div className="flex flex-col sm:flex-row justify-between items-center p-2 gap-4">
            {/* Tabs */}
            <div className="flex bg-gray-100/50 p-1 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('collection')}
                className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'collection' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                जमा (Collection)
              </button>
              <button
                onClick={() => setActiveTab('borrowing')}
                className={`flex-1 sm:flex-none px-6 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'borrowing' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                कर्ज (Borrowings)
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
              <Filter size={16} className="text-gray-400 shrink-0" />
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
              >
                सर्व (All)
              </button>
              <button
                onClick={() => setFilter('borrower')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filter === 'borrower' ? 'bg-purple-100 text-purple-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
              >
                कर्जदार (Borrower)
              </button>
              <button
                onClick={() => setFilter('non-borrower')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filter === 'non-borrower' ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
              >
                विना-कर्जदार
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="min-h-[500px]">
          {activeTab === 'collection' && (
            <CollectionTab
              filteredMembers={filteredMembers}
              searchTerm={collectionSearchTerm}
              onSearchChange={setCollectionSearchTerm}
              muddalInputs={muddalInputs}
              handleMuddalChange={handleMuddalChange}
              penaltyInputs={penaltyInputs}
              handlePenaltyChange={handlePenaltyChange}
              monthPayments={monthPayments}
              readOnlyMode={readOnlyMode}
              calculatePaymentDetails={calculatePaymentDetails}
              calculatePenalty={calculatePenalty}
              hasMemberPaid={hasMemberPaid}
              handleUndoPayment={handleUndoPayment}
              processPayment={processPayment}
              onMemberClick={setHistoryModalMemberId}
            />
          )}

          {activeTab === 'borrowing' && (
            <BorrowingTab
              members={getDisplayBorrowingMembers}
              searchTerm={borrowingSearchTerm}
              onSearchChange={setBorrowingSearchTerm}
              borrowAmounts={borrowAmounts}
              handleBorrowAmountChange={handleBorrowAmountChange}
              guarantors={guarantors}
              setGuarantors={setGuarantors}
              readOnlyMode={readOnlyMode}
              processSingleBorrowing={processSingleBorrowing}
              getTotalBorrowingThisMonth={getTotalBorrowingThisMonth}
              onMemberClick={setHistoryModalMemberId}
            />
          )}
        </div>
      </div>

      <MemberHistoryModal
        isOpen={!!historyModalMemberId}
        memberId={historyModalMemberId}
        onClose={() => setHistoryModalMemberId(null)}
      />
    </DashboardLayout>
  )
}
