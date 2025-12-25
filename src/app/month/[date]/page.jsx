// // app/months/[date]/page.js
// 'use client'

// import { useEffect, useMemo, useState } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'
// import Link from 'next/link'
// import { useParams } from "next/navigation"

// export default function MonthDetailsPage() {
//   const [monthData, setMonthData] = useState(null)
//   const [members, setMembers] = useState([])
//   const [filter, setFilter] = useState('all')
//   const [activeTab, setActiveTab] = useState('collection')
//   const [muddalInputs, setMuddalInputs] = useState({})
//   const [penaltyInputs, setPenaltyInputs] = useState({})
//   const [borrowAmounts, setBorrowAmounts] = useState({})
//   const [collectionCompleted, setCollectionCompleted] = useState(false)
//   const [monthPayments, setMonthPayments] = useState({})
//   const [readOnlyMode, setReadOnlyMode] = useState(false)
//   const [collectionSearchTerm, setCollectionSearchTerm] = useState('')
//   const [guarantors, setGuarantors] = useState({})
//   const [activeGuarantorDropdown, setActiveGuarantorDropdown] = useState(null)
//   const [borrowingSearchTerm, setBorrowingSearchTerm] = useState('')
//   const [searchedBorrowingMembers, setSearchedBorrowingMembers] = useState([])
//   const [monthLoans, setMonthLoans] = useState({})
//   const [showPaymentMode, setShowPaymentMode] = useState(null)
//   const [loading, setLoading] = useState(true)

//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const monthName = searchParams?.get('name') || ''
//   const year = searchParams?.get('year') || ''
//   const { date } = useParams()

//   // Constants
//   const SHARE_AMOUNT = 1000
//   const INTEREST_RATE = 3
//   const PENALTY_RATE = 2
//   const BASE_PENALTY = 200

//   // Load month data
//   const loadMonthData = async () => {
//     try {
//       setLoading(true)
//       const response = await fetch(`/api/months/${date}`)
//       const result = await response.json()
      
//       if (result.success) {
//         const { monthlyData, allMembers, payments, borrowings } = result.data
        
//         setMonthData(monthlyData)
//         setMembers(allMembers)
        
//         // Set payment state
//         const paymentMap = {}
//         payments.forEach(p => {
//           paymentMap[p.memberId || p.member._id] = {
//             paid: true,
//             paidAmount: p.totalAmount,
//             penaltyAmount: p.penaltyAmount,
//             muddalPaid: p.muddalPaid,
//             interestAmount: p.interestAmount,
//             shareAmount: p.shareAmount,
//             paymentMode: p.paymentMode,
//             calculatedTotal: p.totalAmount,
//             calculatedMuddal: p.muddalPaid,
//             calculatedPenalty: p.penaltyAmount
//           }
//         })
//         setMonthPayments(paymentMap)
        
//         // Set borrowing state
//         const loanMap = {}
//         borrowings.forEach(b => {
//           const memberId = b.memberId || b.member._id
//           if (!loanMap[memberId]) {
//             loanMap[memberId] = []
//           }
//           loanMap[memberId].push({
//             amount: b.amount,
//             guarantors: b.guarantors || [],
//             date: b.borrowingDate
//           })
//         })
//         setMonthLoans(loanMap)
        
//         if (monthlyData.status === 'completed') {
//           setReadOnlyMode(true)
//         }
//       }
//     } catch (error) {
//       console.error('Error loading month data:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     if (date) {
//       loadMonthData()
//     }
//   }, [date])

//   // Helper Functions
//   const hasMemberPaid = (member) => !!monthPayments[member._id || member.id]?.paid

//   const calculatePaymentDetails = (member) => {
//     if (!member) return null

//     const memberId = member._id || member.id
//     const existingPayment = monthPayments[memberId]
    
//     if (existingPayment?.paid) {
//       return {
//         shareAmount: SHARE_AMOUNT,
//         muddalPaid: existingPayment.calculatedMuddal || existingPayment.muddalPaid || 0,
//         interestAmount: existingPayment.interestAmount || 0,
//         totalCompulsory: SHARE_AMOUNT + (existingPayment.interestAmount || 0),
//         newPrincipal: member.currentPrincipal || 0,
//         total: existingPayment.calculatedTotal || existingPayment.paidAmount || 0,
//       }
//     }

//     if (!member.isBorrower) {
//       return {
//         shareAmount: SHARE_AMOUNT,
//         muddalPaid: 0,
//         interestAmount: 0,
//         totalCompulsory: SHARE_AMOUNT,
//         newPrincipal: member.currentPrincipal || 0,
//         total: SHARE_AMOUNT,
//       }
//     }

//     const muddalPaid = Math.max(0, parseInt(muddalInputs[memberId]) || 0)
//     const currentPrincipal = Math.max(0, member.currentPrincipal || 0)
//     const reducedPrincipal = Math.max(0, currentPrincipal - muddalPaid)
//     const interestAmount = Math.round(reducedPrincipal * (INTEREST_RATE / 100))
//     const totalCompulsory = SHARE_AMOUNT + interestAmount
//     const total = SHARE_AMOUNT + muddalPaid + interestAmount

//     return {
//       shareAmount: SHARE_AMOUNT,
//       muddalPaid,
//       interestAmount,
//       totalCompulsory,
//       total,
//       newPrincipal: reducedPrincipal,
//     }
//   }

//   const calculatePenalty = (member) => {
//     if (!member) return 0

//     const memberId = member._id || member.id
//     const existingPayment = monthPayments[memberId]
    
//     if (existingPayment?.paid) {
//       return existingPayment.calculatedPenalty || existingPayment.penaltyAmount || 0
//     }

//     if (!member.penaltyApplied) return 0

//     const userEnteredPenalty = penaltyInputs[memberId]
//     if (userEnteredPenalty !== undefined && userEnteredPenalty !== '') {
//       const manualPenalty = parseInt(userEnteredPenalty)
//       if (!isNaN(manualPenalty) && manualPenalty >= 0) {
//         return manualPenalty
//       }
//     }

//     let penalty = BASE_PENALTY
//     if (member.isBorrower) {
//       const principalPenalty = Math.round((member.currentPrincipal || 0) * (PENALTY_RATE / 100))
//       penalty += principalPenalty
//     }
//     return penalty
//   }

//   // Payment Functions
//   const processPayment = async (memberId, paymentMode = 'cash') => {
//     if (readOnlyMode) return

//     const member = members.find(m => (m._id || m.id) === memberId)
//     if (!member) return

//     const paymentDetails = calculatePaymentDetails(member)
//     const penaltyAmount = calculatePenalty(member)
//     const totalDue = paymentDetails.total + penaltyAmount

//     try {
//       const response = await fetch(`/api/months/${date}/payments`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           memberId: member._id || member.id,
//           shareAmount: SHARE_AMOUNT,
//           muddalPaid: paymentDetails.muddalPaid,
//           interestAmount: paymentDetails.interestAmount,
//           penaltyAmount,
//           totalAmount: totalDue,
//           paymentMode,
//           principalBefore: member.currentPrincipal,
//           principalAfter: paymentDetails.newPrincipal
//         })
//       })

//       const result = await response.json()
      
//       if (result.success) {
//         await loadMonthData()
//         setShowPaymentMode(null)
//         alert(`Payment processed successfully via ${paymentMode === 'cash' ? 'Cash' : 'Online'}!\nTotal collected: ₹${totalDue}`)
//       } else {
//         alert(`Error: ${result.error}`)
//       }
//     } catch (error) {
//       console.error('Error processing payment:', error)
//       alert('Failed to process payment')
//     }
//   }

//   const revertPayment = async (memberId) => {
//     if (readOnlyMode) return

//     try {
//       const response = await fetch(`/api/months/${date}/payments?memberId=${memberId}`, {
//         method: 'DELETE'
//       })

//       const result = await response.json()
      
//       if (result.success) {
//         await loadMonthData()
//         setMuddalInputs(prev => ({ ...prev, [memberId]: 0 }))
//         setPenaltyInputs(prev => ({ ...prev, [memberId]: 0 }))
//         setShowPaymentMode(null)
//         alert('Payment reverted successfully')
//       } else {
//         alert(`Error: ${result.error}`)
//       }
//     } catch (error) {
//       console.error('Error reverting payment:', error)
//       alert('Failed to revert payment')
//     }
//   }

//   const togglePenalty = async (memberId) => {
//     const member = members.find(m => (m._id || m.id) === memberId)
//     if (!member) return

//     try {
//       const response = await fetch('/api/members/penalty', {
//         method: 'PATCH',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           memberId: member._id || member.id,
//           penaltyApplied: !member.penaltyApplied
//         })
//       })

//       const result = await response.json()
      
//       if (result.success) {
//         setMembers(members.map(m => 
//           (m._id || m.id) === memberId ? { ...m, penaltyApplied: !m.penaltyApplied } : m
//         ))
//       }
//     } catch (error) {
//       console.error('Error toggling penalty:', error)
//     }
//   }

//   // Borrowing Functions
//   const processSingleBorrowing = async (memberId) => {
//     if (readOnlyMode) return

//     const borrowAmount = borrowAmounts[memberId] || 0
//     if (borrowAmount <= 0) {
//       alert('Please enter a valid amount')
//       return
//     }

//     const memberGuarantors = guarantors[memberId] || ['', '']
//     const validGuarantors = memberGuarantors.filter(g => g.trim() !== '')

//     try {
//       const member = members.find(m => (m._id || m.id) === memberId)
//       const response = await fetch(`/api/months/${date}/borrowings`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           memberId: member._id || member.id,
//           amount: borrowAmount,
//           guarantors: validGuarantors
//         })
//       })

//       const result = await response.json()
      
//       if (result.success) {
//         await loadMonthData()
//         setBorrowAmounts(prev => ({ ...prev, [memberId]: 0 }))
//         setGuarantors(prev => ({ ...prev, [memberId]: ['', ''] }))
//         alert(`Loan of ₹${borrowAmount.toLocaleString()} processed successfully`)
//       } else {
//         alert(`Error: ${result.error}`)
//       }
//     } catch (error) {
//       console.error('Error processing borrowing:', error)
//       alert('Failed to process borrowing')
//     }
//   }

//   // UI Handlers
//   const handleMuddalChange = (memberId, amount) => {
//     setMuddalInputs(prev => ({ ...prev, [memberId]: parseInt(amount) || 0 }))
//   }

//   const handlePenaltyChange = (memberId, amount) => {
//     setPenaltyInputs(prev => ({ ...prev, [memberId]: parseInt(amount) || 0 }))
//   }

//   const handleBorrowAmountChange = (memberId, amount) => {
//     setBorrowAmounts(prev => ({ ...prev, [memberId]: parseInt(amount) || 0 }))
//   }

//   // Search functionality
//   const searchedCollectionMembers = useMemo(() => {
//     if (!collectionSearchTerm.trim()) return members
//     return members.filter(member =>
//       member.name.toLowerCase().includes(collectionSearchTerm.toLowerCase()) ||
//       member.serialNo.toLowerCase().includes(collectionSearchTerm.toLowerCase())
//     )
//   }, [members, collectionSearchTerm])

//   useEffect(() => {
//     if (!borrowingSearchTerm.trim()) {
//       setSearchedBorrowingMembers([])
//     } else {
//       const filtered = members.filter(member =>
//         member?.name?.toLowerCase().includes(borrowingSearchTerm.toLowerCase()) ||
//         member?.serialNo?.toLowerCase().includes(borrowingSearchTerm.toLowerCase())
//       )
//       setSearchedBorrowingMembers(filtered)
//     }
//   }, [borrowingSearchTerm, members])

//   // Filtered members
//   const filteredMembers = useMemo(() => {
//     const membersToFilter = collectionSearchTerm.trim() ? searchedCollectionMembers : members
//     return membersToFilter.filter(member => {
//       if (filter === 'all') return true
//       if (filter === 'borrower') return member?.isBorrower
//       if (filter === 'non-borrower') return !member?.isBorrower
//       if (filter === 'penalty') return member?.penaltyApplied
//       return true
//     })
//   }, [members, searchedCollectionMembers, collectionSearchTerm, filter])

//   // Month loans helpers
//   const getTotalBorrowingThisMonth = (memberId) => {
//     if (!monthLoans[memberId]) return 0
//     return monthLoans[memberId].reduce((sum, loan) => sum + loan.amount, 0)
//   }

//   const getAllGuarantorsThisMonth = (memberId) => {
//     if (!monthLoans[memberId]) return []
//     const allGuarantors = []
//     monthLoans[memberId].forEach(loan => {
//       if (loan.guarantors && loan.guarantors.length > 0) {
//         loan.guarantors.forEach(guarantor => {
//           if (guarantor.trim() && !allGuarantors.includes(guarantor)) {
//             allGuarantors.push(guarantor)
//           }
//         })
//       }
//     })
//     return allGuarantors
//   }

//   const getPreviousPrincipal = (member) => {
//     const totalBorrowingThisMonth = getTotalBorrowingThisMonth(member._id || member.id)
//     return Math.max(0, (member.currentPrincipal || 0) - totalBorrowingThisMonth)
//   }

//   const getMembersWithMonthLoans = useMemo(() => {
//     return members.filter(member => {
//       const memberId = member._id || member.id
//       return monthLoans[memberId] && monthLoans[memberId].length > 0
//     })
//   }, [members, monthLoans])

//   // Guarantor handlers
//   const handleGuarantorChange = (memberId, guarantorIndex, value) => {
//     setGuarantors(prev => {
//       const currentGuarantors = prev[memberId] || ['', '']
//       const updatedGuarantors = [...currentGuarantors]
//       updatedGuarantors[guarantorIndex] = value
//       return { ...prev, [memberId]: updatedGuarantors }
//     })
//   }

//   const handleGuarantorSelect = (memberId, guarantorIndex, guarantorName) => {
//     handleGuarantorChange(memberId, guarantorIndex, guarantorName)
//     setActiveGuarantorDropdown(null)
//   }

//   const toggleGuarantorDropdown = (memberId, guarantorIndex) => {
//     const dropdownKey = `${memberId}-${guarantorIndex}`
//     setActiveGuarantorDropdown(activeGuarantorDropdown === dropdownKey ? null : dropdownKey)
//   }

//   const canBeGuarantor = (memberId, guarantorName) => {
//     if (!guarantorName.trim()) return true
//     const guarantorMember = members.find(m =>
//       m?.name?.toLowerCase() === guarantorName.toLowerCase() ||
//       m?.serialNo?.toLowerCase() === guarantorName.toLowerCase()
//     )
//     if (!guarantorMember) return true

//     let guarantorCount = 0
//     Object.values(monthLoans).forEach(loans => {
//       loans.forEach(loan => {
//         if (loan.guarantors) {
//           loan.guarantors.forEach(guarantor => {
//             if (guarantor.trim() && (
//               guarantor.toLowerCase() === guarantorMember?.name?.toLowerCase() ||
//               guarantor.toLowerCase() === guarantorMember?.serialNo?.toLowerCase()
//             )) {
//               guarantorCount++
//             }
//           })
//         }
//       })
//     })
//     return guarantorCount < 2
//   }

//   const getGuarantorSuggestions = (memberId, input) => {
//     if (!input.trim()) return []
//     return members.filter(member =>
//       (member?._id || member?.id) !== memberId &&
//       (member?.name?.toLowerCase().includes(input.toLowerCase()) ||
//        member?.serialNo?.toLowerCase().includes(input.toLowerCase())) &&
//       canBeGuarantor(memberId, member.name)
//     ).slice(0, 5)
//   }

//   // Stats calculation
//   const calculateMonthStats = () => {
//     const totalShareCollection = members.length * SHARE_AMOUNT
//     const totalInterest = members.reduce((sum, m) => sum + (calculatePaymentDetails(m)?.interestAmount || 0), 0)
//     const totalPenalties = members.reduce((sum, m) => sum + calculatePenalty(m), 0)
//     const totalPaid = Object.values(monthPayments).reduce((sum, p) => sum + (p.paidAmount || 0), 0)
//     const totalPrincipal = members.reduce((s, m) => s + (m.currentPrincipal || 0), 0)
//     const totalBorrowed = members.reduce((s, m) => s + (m.borrowedAmount || 0), 0)
//     const totalBorrowedThisMonth = Object.values(monthLoans).reduce((sum, loans) =>
//       sum + loans.reduce((loanSum, loan) => loanSum + loan.amount, 0), 0
//     )

//     return {
//       totalShareCollection,
//       totalInterest,
//       totalPenalties,
//       totalPaid,
//       totalPrincipal,
//       totalBorrowed,
//       totalBorrowedThisMonth
//     }
//   }

//   const monthStats = calculateMonthStats()

//   // Card styling
//   const getCardClass = (cardType) => {
//     const baseClass = 'rounded-lg shadow-md p-6 text-center cursor-pointer transition-all duration-200'
//     if (filter === cardType) {
//       switch (cardType) {
//         case 'all': return `${baseClass} bg-blue-100 border-2 border-blue-500 transform scale-105`
//         case 'borrower': return `${baseClass} bg-purple-100 border-2 border-purple-500 transform scale-105`
//         case 'non-borrower': return `${baseClass} bg-green-100 border-2 border-green-500 transform scale-105`
//         case 'penalty': return `${baseClass} bg-red-100 border-2 border-red-500 transform scale-105`
//         default: return `${baseClass} bg-white border-2 border-gray-300`
//       }
//     }
//     return `${baseClass} bg-white border border-gray-200 hover:shadow-lg hover:border-gray-300`
//   }

//   const getTextClass = (cardType) => {
//     if (filter === cardType) {
//       switch (cardType) {
//         case 'all': return 'text-blue-700'
//         case 'borrower': return 'text-purple-700'
//         case 'non-borrower': return 'text-green-700'
//         case 'penalty': return 'text-red-700'
//         default: return 'text-gray-700'
//       }
//     }
//     return 'text-gray-700'
//   }

//   const getPaymentStatusClass = (member) =>
//     hasMemberPaid(member) ? 'bg-green-50 border-l-4 border-green-400' : 'bg-white'

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">लोड होत आहे...</p>
//         </div>
//       </div>
//     )
//   }

//   if (!monthData) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <p className="text-gray-600">Month data not found</p>
//           <Link href="/dashboard" className="text-blue-600 hover:underline mt-4 inline-block">
//             Return to Dashboard
//           </Link>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">
//                 {monthData.monthName} {monthData.year}
//                 {readOnlyMode && (
//                   <span className="ml-2 text-sm font-normal text-gray-500">(Read Only)</span>
//                 )}
//               </h1>
//               <p className="text-sm text-gray-600 mt-1">Collection Date: 25th {monthData.monthName}</p>
//             </div>
//             <Link 
//               href="/dashboard" 
//               className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
//             >
//               ← Back to Dashboard
//             </Link>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Summary Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <div 
//             className={getCardClass('all')}
//             onClick={() => setFilter('all')}
//           >
//             <h3 className={`text-sm font-semibold mb-2 ${getTextClass('all')}`}>सर्व सदस्य</h3>
//             <p className={`text-2xl font-bold ${getTextClass('all')}`}>{members.length}</p>
//           </div>
          
//           <div 
//             className={getCardClass('borrower')}
//             onClick={() => setFilter('borrower')}
//           >
//             <h3 className={`text-sm font-semibold mb-2 ${getTextClass('borrower')}`}>कर्जदार</h3>
//             <p className={`text-2xl font-bold ${getTextClass('borrower')}`}>
//               {members.filter(m => m.isBorrower).length}
//             </p>
//           </div>
          
//           <div 
//             className={getCardClass('non-borrower')}
//             onClick={() => setFilter('non-borrower')}
//           >
//             <h3 className={`text-sm font-semibold mb-2 ${getTextClass('non-borrower')}`}>कर्ज नसलेले</h3>
//             <p className={`text-2xl font-bold ${getTextClass('non-borrower')}`}>
//               {members.filter(m => !m.isBorrower).length}
//             </p>
//           </div>
          
//           <div 
//             className={getCardClass('penalty')}
//             onClick={() => setFilter('penalty')}
//           >
//             <h3 className={`text-sm font-semibold mb-2 ${getTextClass('penalty')}`}>दंड प्रकरणे</h3>
//             <p className={`text-2xl font-bold ${getTextClass('penalty')}`}>
//               {members.filter(m => m.penaltyApplied).length}
//             </p>
//           </div>
//         </div>

//         {/* Tabs */}
//         <div className="bg-white rounded-lg shadow-md overflow-hidden">
//           <div className="border-b border-gray-200">
//             <nav className="flex gap-4 px-6">
//               <button
//                 onClick={() => setActiveTab('collection')}
//                 className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
//                   activeTab === 'collection'
//                     ? 'border-blue-500 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 संकलन तपशील
//               </button>
              
//               <button
//                 onClick={() => setActiveTab('borrowing')}
//                 className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
//                   activeTab === 'borrowing'
//                     ? 'border-blue-500 text-blue-600'
//                     : 'border-transparent text-gray-500 hover:text-gray-700'
//                 }`}
//               >
//                 कर्ज व्यवस्थापन
//               </button>
//             </nav>
//           </div>

//           <div className="p-6">
//             {/* Collection Tab */}
//             {activeTab === 'collection' && (
//               <div>
//                 <div className="mb-6">
//                   <h2 className="text-xl font-semibold text-gray-900 mb-2">मासिक संकलन व्यवस्थापन</h2>
//                   <p className="text-sm text-gray-600">
//                     {readOnlyMode 
//                       ? "फक्त पहाण्यासाठी - व्यवहार पूर्ण झाला" 
//                       : `पेमेंट व्यवस्थापित करा, भाग रक्कम: ₹${SHARE_AMOUNT} | व्याज: ${INTEREST_RATE}% | दंड: ${PENALTY_RATE}% + ₹${BASE_PENALTY}`
//                     }
//                   </p>
//                 </div>

//                 {/* Search */}
//                 {!readOnlyMode && (
//                   <div className="mb-6">
//                     <input
//                       type="text"
//                       value={collectionSearchTerm}
//                       onChange={(e) => setCollectionSearchTerm(e.target.value)}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
//                       placeholder="नाव किंवा अनुक्रमांक प्रविष्ट करा (उदा., MBR001)"
//                     />
//                   </div>
//                 )}

//                 {/* Collection Table */}
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">सभा. क्र</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">भागधारकाचे नाव</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">भाग रक्कम</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">कर्ज मुद्दल</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">व्याज</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">दंड</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">एकूण</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">शिल्लक कर्ज</th>
//                         {!readOnlyMode && (
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">क्रिया</th>
//                         )}
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {filteredMembers.map((member) => {
//                         const memberId = member._id || member.id
//                         const paymentDetails = calculatePaymentDetails(member)
//                         const penaltyAmount = calculatePenalty(member)
//                         const isPaid = hasMemberPaid(member)
//                         const totalAmount = isPaid
//                           ? (monthPayments[memberId]?.calculatedTotal || monthPayments[memberId]?.paidAmount || 0)
//                           : (paymentDetails.total + penaltyAmount)
//                         const remainingPrincipal = paymentDetails.newPrincipal
//                         const paymentMode = monthPayments[memberId]?.paymentMode

//                         return (
//                           <tr key={memberId} className={getPaymentStatusClass(member)}>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {member.serialNo}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <div className="text-sm font-medium text-gray-900">{member.name}</div>
//                               <div className="text-sm text-gray-500">{member.phone}</div>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               ₹{SHARE_AMOUNT}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {member.isBorrower ? (
//                                 <div className="text-blue-600">
//                                   ₹{member.currentPrincipal?.toLocaleString()}
//                                 </div>
//                               ) : '-'}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               {readOnlyMode ? (
//                                 isPaid ? (
//                                   <div className="text-sm text-gray-900">
//                                     ₹{(monthPayments[memberId]?.calculatedMuddal || monthPayments[memberId]?.muddalPaid || 0).toLocaleString()}
//                                   </div>
//                                 ) : '-'
//                               ) : isPaid ? (
//                                 <div className="text-sm text-gray-900">
//                                   ₹{(monthPayments[memberId]?.calculatedMuddal || monthPayments[memberId]?.muddalPaid || 0).toLocaleString()}
//                                 </div>
//                               ) : (
//                                 <input
//                                   type="number"
//                                   value={muddalInputs[memberId] || ''}
//                                   onChange={(e) => handleMuddalChange(memberId, e.target.value)}
//                                   className="w-full px-2 py-1 border border-gray-300 rounded-md text-black"
//                                   placeholder="0"
//                                   disabled={isPaid}
//                                 />
//                               )}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {member.isBorrower ? `₹${paymentDetails.interestAmount}` : '-'}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               {readOnlyMode ? (
//                                 isPaid && penaltyAmount > 0 ? (
//                                   <div className="text-sm text-gray-900">
//                                     ₹{penaltyAmount.toLocaleString()}
//                                   </div>
//                                 ) : '-'
//                               ) : isPaid ? (
//                                 penaltyAmount > 0 ? (
//                                   <div className="text-sm text-gray-900">
//                                     ₹{penaltyAmount.toLocaleString()}
//                                   </div>
//                                 ) : '-'
//                               ) : (
//                                 <div className="space-y-1">
//                                   <button
//                                     onClick={() => togglePenalty(memberId)}
//                                     className={`px-2 py-1 text-xs rounded w-full ${
//                                       member.penaltyApplied ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
//                                     }`}
//                                     disabled={isPaid}
//                                   >
//                                     {member.penaltyApplied ? 'दंड ✓' : 'दंड नाही'}
//                                   </button>
//                                   {member.penaltyApplied && (
//                                     <input
//                                       type="number"
//                                       value={penaltyInputs[memberId] || ''}
//                                       onChange={(e) => handlePenaltyChange(memberId, e.target.value)}
//                                       className="w-full px-1 py-1 border border-gray-300 rounded-md text-black text-xs"
//                                       placeholder={calculatePenalty(member).toString()}
//                                       disabled={isPaid}
//                                     />
//                                   )}
//                                 </div>
//                               )}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                               ₹{totalAmount.toLocaleString()}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {member.isBorrower ? (
//                                 <div>
//                                   <div className="text-blue-600">
//                                     ₹{remainingPrincipal.toLocaleString()}
//                                   </div>
//                                   {member.currentPrincipal > remainingPrincipal && (
//                                     <div className="text-xs text-green-600">
//                                       ₹{(member.currentPrincipal - remainingPrincipal).toLocaleString()} ने कमी
//                                     </div>
//                                   )}
//                                 </div>
//                               ) : '-'}
//                             </td>
//                             {!readOnlyMode && (
//                               <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                                 <div className="space-y-2">
//                                   {!isPaid ? (
//                                     showPaymentMode === memberId ? (
//                                       <div className="flex gap-2">
//                                         <button
//                                           onClick={() => processPayment(memberId, 'cash')}
//                                           className="flex-1 px-2 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700"
//                                           title="रोख पेमेंट"
//                                         >
//                                           रोख
//                                         </button>
//                                         <button
//                                           onClick={() => processPayment(memberId, 'online')}
//                                           className="flex-1 px-2 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
//                                           title="ऑनलाइन पेमेंट"
//                                         >
//                                           ऑनलाइन
//                                         </button>
//                                         <button
//                                           onClick={() => setShowPaymentMode(null)}
//                                           className="px-2 py-2 text-sm rounded-md bg-gray-600 text-white hover:bg-gray-700"
//                                         >
//                                           ×
//                                         </button>
//                                       </div>
//                                     ) : (
//                                       <button
//                                         onClick={() => setShowPaymentMode(memberId)}
//                                         className="w-full px-3 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700"
//                                       >
//                                         पेमेंट करा
//                                       </button>
//                                     )
//                                   ) : (
//                                     <button
//                                       onClick={() => revertPayment(memberId)}
//                                       className="w-full px-3 py-2 text-sm rounded-md bg-yellow-600 text-white hover:bg-yellow-700"
//                                     >
//                                       परत करा
//                                     </button>
//                                   )}
//                                 </div>
//                               </td>
//                             )}
//                           </tr>
//                         )
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}

//             {/* Borrowing Tab */}
//             {activeTab === 'borrowing' && (
//               <div>
//                 <div className="mb-6">
//                   <h2 className="text-xl font-semibold text-gray-900 mb-2">कर्ज व्यवस्थापन</h2>
//                   <p className="text-sm text-gray-600">
//                     {readOnlyMode
//                       ? "फक्त पहाण्यासाठी - व्यवहार पूर्ण झाला"
//                       : "कर्ज प्रक्रियेसाठी नाव किंवा अनुक्रमांकाने सदस्य शोधा"
//                     }
//                   </p>
//                 </div>

//                 {/* Search */}
//                 {!readOnlyMode && (
//                   <div className="mb-6">
//                     <input
//                       type="text"
//                       value={borrowingSearchTerm}
//                       onChange={(e) => setBorrowingSearchTerm(e.target.value)}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
//                       placeholder="नाव किंवा अनुक्रमांक प्रविष्ट करा (उदा., MBR001)"
//                     />
//                   </div>
//                 )}

//                 {/* Borrowing Table */}
//                 <div className="overflow-x-auto">
//                   <table className="min-w-full divide-y divide-gray-200">
//                     <thead className="bg-gray-50">
//                       <tr>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">सभा. क्र</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">भागधारकाचे नाव</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">मागील कर्ज</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">यावेळी घेतलेले कर्ज</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">जामीन</th>
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">नवीन कर्ज शिल्लक</th>
//                         {!readOnlyMode && (
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">क्रिया</th>
//                         )}
//                       </tr>
//                     </thead>
//                     <tbody className="bg-white divide-y divide-gray-200">
//                       {(readOnlyMode ? getMembersWithMonthLoans : 
//                         (borrowingSearchTerm.trim() ? searchedBorrowingMembers : getMembersWithMonthLoans)
//                       ).map((member) => {
//                         const memberId = member._id || member.id
//                         const borrowAmount = borrowAmounts[memberId] || ''
//                         const totalBorrowingThisMonth = getTotalBorrowingThisMonth(memberId)
//                         const previousPrincipal = getPreviousPrincipal(member)
//                         const allGuarantors = getAllGuarantorsThisMonth(memberId)
//                         const newPrincipal = (member.currentPrincipal || 0) + (parseInt(borrowAmount) || 0)
//                         const memberGuarantors = guarantors[memberId] || ['', '']

//                         return (
//                           <tr key={memberId}>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               {member.serialNo}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <div className="text-sm font-medium text-gray-900">{member.name}</div>
//                               <div className="text-sm text-gray-500">{member.phone}</div>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               ₹{previousPrincipal.toLocaleString()}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               {readOnlyMode ? (
//                                 totalBorrowingThisMonth > 0 ? (
//                                   <div className="text-sm text-blue-600">
//                                     ₹{totalBorrowingThisMonth.toLocaleString()}
//                                   </div>
//                                 ) : '-'
//                               ) : (
//                                 <div className="space-y-1">
//                                   <input
//                                     type="number"
//                                     value={borrowAmount}
//                                     onChange={(e) => handleBorrowAmountChange(memberId, e.target.value)}
//                                     className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
//                                     placeholder="रक्कम प्रविष्ट करा"
//                                   />
//                                   {totalBorrowingThisMonth > 0 && (
//                                     <div className="text-xs text-gray-500">
//                                       या महिन्यात आधीच कर्ज: ₹{totalBorrowingThisMonth.toLocaleString()}
//                                     </div>
//                                   )}
//                                 </div>
//                               )}
//                             </td>
//                             <td className="px-6 py-4">
//                               {readOnlyMode ? (
//                                 allGuarantors.length > 0 ? (
//                                   <div className="space-y-1">
//                                     {allGuarantors.map((guarantor, idx) => (
//                                       <div key={idx} className="text-sm text-gray-900">
//                                         {guarantor}
//                                       </div>
//                                     ))}
//                                   </div>
//                                 ) : 'जामीन नाही'
//                               ) : (
//                                 <div className="space-y-2">
//                                   {[0, 1].map((guarantorIndex) => {
//                                     const dropdownKey = `${memberId}-${guarantorIndex}`
//                                     const suggestions = getGuarantorSuggestions(memberId, memberGuarantors[guarantorIndex])

//                                     return (
//                                       <div key={guarantorIndex} className="relative">
//                                         <div className="flex gap-2">
//                                           <input
//                                             type="text"
//                                             value={memberGuarantors[guarantorIndex]}
//                                             onChange={(e) => handleGuarantorChange(memberId, guarantorIndex, e.target.value)}
//                                             onFocus={() => setActiveGuarantorDropdown(dropdownKey)}
//                                             className="flex-1 px-3 py-1 border border-gray-300 rounded-md text-black text-sm"
//                                             placeholder={`जामीन ${guarantorIndex + 1} (पर्यायी)`}
//                                           />
//                                           <button
//                                             onClick={() => toggleGuarantorDropdown(memberId, guarantorIndex)}
//                                             className="px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm"
//                                           >
//                                             ↓
//                                           </button>
//                                         </div>

//                                         {activeGuarantorDropdown === dropdownKey && suggestions.length > 0 && (
//                                           <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
//                                             {suggestions.map((suggestion) => (
//                                               <div
//                                                 key={suggestion._id || suggestion.id}
//                                                 onClick={() => handleGuarantorSelect(memberId, guarantorIndex, suggestion.name)}
//                                                 className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
//                                               >
//                                                 <div className="text-sm font-medium text-gray-900">{suggestion.name}</div>
//                                                 <div className="text-xs text-gray-500">{suggestion.serialNo}</div>
//                                               </div>
//                                             ))}
//                                           </div>
//                                         )}
//                                       </div>
//                                     )
//                                   })}

//                                   {allGuarantors.length > 0 && (
//                                     <div className="text-xs text-gray-500">
//                                       विद्यमान जामीन: {allGuarantors.join(', ')}
//                                     </div>
//                                   )}
//                                 </div>
//                               )}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <div className="text-sm font-medium text-gray-900">
//                                 ₹{newPrincipal.toLocaleString()}
//                               </div>
//                               {borrowAmount > 0 && !readOnlyMode && (
//                                 <div className="text-xs text-green-600">
//                                   +₹{parseInt(borrowAmount).toLocaleString()}
//                                 </div>
//                               )}
//                             </td>
//                             {!readOnlyMode && (
//                               <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                                 <button
//                                   onClick={() => processSingleBorrowing(memberId)}
//                                   disabled={!borrowAmount || parseInt(borrowAmount) <= 0}
//                                   className={`px-3 py-2 text-sm rounded-md w-full ${
//                                     borrowAmount && parseInt(borrowAmount) > 0
//                                       ? 'bg-blue-600 text-white hover:bg-blue-700'
//                                       : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                                   }`}
//                                 >
//                                   सबमिट करा
//                                 </button>
//                               </td>
//                             )}
//                           </tr>
//                         )
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Summary Section */}
//         <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="bg-white rounded-lg shadow-md p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">पेमेंट सारांश</h3>
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">एकूण भाग संकलन:</span>
//                 <span className="font-medium">₹{monthStats.totalShareCollection.toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">एकूण व्याज:</span>
//                 <span className="font-medium">₹{monthStats.totalInterest.toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">एकूण दंड:</span>
//                 <span className="font-medium">₹{monthStats.totalPenalties.toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between pt-2 border-t">
//                 <span className="text-gray-900 font-semibold">एकूण संकलित:</span>
//                 <span className="font-bold text-green-600">₹{monthStats.totalPaid.toLocaleString()}</span>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-md p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">कर्जदार सारांश</h3>
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">एकूण कर्जदार:</span>
//                 <span className="font-medium">{members.filter(m => m.isBorrower).length}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">या महिन्यातील एकूण कर्ज:</span>
//                 <span className="font-medium">₹{monthStats.totalBorrowedThisMonth.toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">एकूण कर्ज शिल्लक:</span>
//                 <span className="font-medium">₹{monthStats.totalPrincipal.toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between pt-2 border-t">
//                 <span className="text-gray-900 font-semibold">एकूण कर्ज (सर्व काळ):</span>
//                 <span className="font-bold text-blue-600">₹{monthStats.totalBorrowed.toLocaleString()}</span>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-md p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">सिस्टम माहिती</h3>
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">भाग रक्कम:</span>
//                 <span className="font-medium">₹{SHARE_AMOUNT}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">व्याज दर:</span>
//                 <span className="font-medium">{INTEREST_RATE}%</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600">दंड दर:</span>
//                 <span className="font-medium">{PENALTY_RATE}% + ₹{BASE_PENALTY}</span>
//               </div>
//               <div className="flex justify-between pt-2 border-t">
//                 <span className="text-gray-900 font-semibold">मोड:</span>
//                 <span className={`font-bold ${readOnlyMode ? 'text-yellow-600' : 'text-green-600'}`}>
//                   {readOnlyMode ? 'फक्त वाचन' : 'संपादन करण्यायोग्य'}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }
// app/months/[date]/page.js
'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useParams } from "next/navigation"

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

  // Get member's principal at start of month (before any loans this month)
  const getPrincipalBeforeMonthLoans = (member) => {
    const memberId = member._id || member.id
    const currentPrincipal = member.currentPrincipal || 0
    const totalBorrowedThisMonth = getTotalBorrowingThisMonth(memberId)
    return Math.max(0, currentPrincipal - totalBorrowedThisMonth)
  }

  // Get total amount borrowed in current month
  const getTotalBorrowingThisMonth = (memberId) => {
    if (!monthLoans[memberId]) return 0
    return monthLoans[memberId].reduce((sum, loan) => sum + (loan.amount || 0), 0)
  }

  // Get member's current principal including this month's loans
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
    
    if (existingPayment?.paid) {
      return {
        shareAmount: SHARE_AMOUNT,
        muddalPaid: existingPayment.calculatedMuddal || existingPayment.muddalPaid || 0,
        interestAmount: existingPayment.interestAmount || 0,
        totalCompulsory: SHARE_AMOUNT + (existingPayment.interestAmount || 0),
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
        shareAmount: SHARE_AMOUNT,
        muddalPaid: 0,
        interestAmount: 0,
        totalCompulsory: SHARE_AMOUNT,
        principalBeforeLoans: 0,
        currentPrincipalWithLoans: 0,
        newPrincipal: 0,
        total: SHARE_AMOUNT,
        totalBorrowedThisMonth: 0,
        principalBeforePayment: 0
      }
    }

    const muddalPaid = Math.max(0, parseInt(muddalInputs[memberId]) || 0)
    const principalBeforeLoans = getPrincipalBeforeMonthLoans(member)
    const totalBorrowedThisMonth = getTotalBorrowingThisMonth(memberId)
    const currentPrincipalWithLoans = principalBeforeLoans + totalBorrowedThisMonth
    
    // Interest is calculated on current principal (including this month's loans) minus muddal payment
    const principalAfterMuddal = Math.max(0, currentPrincipalWithLoans - muddalPaid)
    const interestAmount = Math.round(principalAfterMuddal * (INTEREST_RATE / 100))
    const totalCompulsory = SHARE_AMOUNT + interestAmount
    const total = SHARE_AMOUNT + muddalPaid + interestAmount

    return {
      shareAmount: SHARE_AMOUNT,
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

  // Payment Functions
  const processPayment = async (memberId, paymentMode = 'cash') => {
    if (readOnlyMode) return

    const member = members.find(m => (m._id || m.id) === memberId)
    if (!member) return

    const paymentDetails = calculatePaymentDetails(member)
    const penaltyAmount = calculatePenalty(member)
    const totalDue = paymentDetails.total + penaltyAmount

    try {
      const response = await fetch(`/api/months/${date}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member._id || member.id,
          shareAmount: SHARE_AMOUNT,
          muddalPaid: paymentDetails.muddalPaid,
          interestAmount: paymentDetails.interestAmount,
          penaltyAmount,
          totalAmount: totalDue,
          paymentMode,
          principalBefore: paymentDetails.currentPrincipalWithLoans,
          principalAfter: paymentDetails.newPrincipal
        })
      })

      const result = await response.json()
      
      if (result.success) {
        await loadMonthData()
        setShowPaymentMode(null)
        alert(`Payment processed successfully via ${paymentMode === 'cash' ? 'Cash' : 'Online'}!\nTotal collected: ₹${totalDue}`)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      alert('Failed to process payment')
    }
  }

  const revertPayment = async (memberId) => {
    if (readOnlyMode) return

    const member = members.find(m => (m._id || m.id) === memberId)
    if (!member) return

    const paymentDetails = calculatePaymentDetails(member)
    
    // Show confirmation with details
    const confirmMessage = `Are you sure you want to revert this payment?\n\n` +
      `Current Principal: ₹${member.currentPrincipal?.toLocaleString()}\n` +
      `Principal Before Payment: ₹${paymentDetails.principalBeforePayment?.toLocaleString()}\n` +
      `Muddal Paid: ₹${paymentDetails.muddalPaid?.toLocaleString()}\n\n` +
      `After revert, principal will be: ₹${paymentDetails.principalBeforePayment?.toLocaleString()}`
    
    if (!confirm(confirmMessage)) return

    try {
      const response = await fetch(`/api/months/${date}/payments?memberId=${memberId}`, {
        method: 'DELETE'
      })

      const result = await response.json()
      
      if (result.success) {
        await loadMonthData()
        setMuddalInputs(prev => ({ ...prev, [memberId]: 0 }))
        setPenaltyInputs(prev => ({ ...prev, [memberId]: 0 }))
        setShowPaymentMode(null)
        alert('Payment reverted successfully')
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error reverting payment:', error)
      alert('Failed to revert payment')
    }
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
    
    // Show members with loans this month + members with pending borrow amounts
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
    const totalShareCollection = members.length * SHARE_AMOUNT
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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex gap-4 px-6">
              <button
                onClick={() => setActiveTab('collection')}
                className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'collection'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                संकलन तपशील (Payment Collection)
              </button>
              
              <button
                onClick={() => setActiveTab('borrowing')}
                className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'borrowing'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                कर्ज व्यवस्थापन (Loan Management)
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Collection Tab */}
            {activeTab === 'collection' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">मासिक संकलन व्यवस्थापन (Monthly Collection Management)</h2>
                  <p className="text-sm text-gray-600">
                    {readOnlyMode 
                      ? "फक्त पहाण्यासाठी - व्यवहार पूर्ण झाला (Read Only - Transaction Completed)" 
                      : `भाग रक्कम (Share): ₹${SHARE_AMOUNT} | व्याज (Interest): ${INTEREST_RATE}% | दंड (Penalty): ${PENALTY_RATE}% + ₹${BASE_PENALTY}`
                    }
                  </p>
                </div>

                {/* Search */}
                {!readOnlyMode && (
                  <div className="mb-6">
                    <input
                      type="text"
                      value={collectionSearchTerm}
                      onChange={(e) => setCollectionSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="नाव किंवा अनुक्रमांक प्रविष्ट करा (Search by Name or Serial No.)"
                    />
                  </div>
                )}

                {/* Collection Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          सभा. क्र<br/>(Serial No.)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          भागधारकाचे नाव<br/>(Member Name)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          भाग रक्कम<br/>(Share Amount)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          कर्ज शिल्लक<br/>(Loan Balance)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          मुद्दल भरणा<br/>(Principal Payment)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          व्याज<br/>(Interest)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          दंड<br/>(Penalty)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          नवीन शिल्लक<br/>(New Balance)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          एकूण<br/>(Total)
                        </th>
                        {!readOnlyMode && (
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            क्रिया<br/>(Action)
                          </th>
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
                          <tr key={memberId} className={getPaymentStatusClass(member)}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {member.serialNo}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{SHARE_AMOUNT.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {(member.isBorrower || totalBorrowedThisMonth > 0) ? (
                                <div>
                                  <div className="text-red-600 font-semibold">
                                    ₹{paymentDetails.principalBeforeLoans.toLocaleString()}
                                  </div>
                                  {totalBorrowedThisMonth > 0 && (
                                    <div className="text-xs text-blue-600 mt-1">
                                      +₹{totalBorrowedThisMonth.toLocaleString()} (इस महीने)
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {(member.isBorrower || totalBorrowedThisMonth > 0) ? (
                                readOnlyMode ? (
                                  isPaid ? (
                                    <div className="text-sm text-blue-600 font-medium">
                                      ₹{(monthPayments[memberId]?.calculatedMuddal || monthPayments[memberId]?.muddalPaid || 0).toLocaleString()}
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )
                                ) : isPaid ? (
                                  <div className="text-sm text-blue-600 font-medium">
                                    ₹{(monthPayments[memberId]?.calculatedMuddal || monthPayments[memberId]?.muddalPaid || 0).toLocaleString()}
                                  </div>
                                ) : (
                                  <input
                                    type="number"
                                    value={muddalInputs[memberId] || ''}
                                    onChange={(e) => handleMuddalChange(memberId, e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded-md text-black"
                                    placeholder="0"
                                    disabled={isPaid}
                                  />
                                )
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {(member.isBorrower || totalBorrowedThisMonth > 0) ? (
                                <div>
                                  <span className="text-orange-600 font-medium">
                                    ₹{paymentDetails.interestAmount.toLocaleString()}
                                  </span>
                                  {totalBorrowedThisMonth > 0 && !isPaid && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      (on ₹{paymentDetails.currentPrincipalWithLoans.toLocaleString()})
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {readOnlyMode ? (
                                isPaid && penaltyAmount > 0 ? (
                                  <div className="text-sm text-red-600 font-medium">
                                    ₹{penaltyAmount.toLocaleString()}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )
                              ) : isPaid ? (
                                penaltyAmount > 0 ? (
                                  <div className="text-sm text-red-600 font-medium">
                                    ₹{penaltyAmount.toLocaleString()}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )
                              ) : (
                                <div className="space-y-1">
                                  <button
                                    onClick={() => togglePenalty(memberId)}
                                    className={`px-2 py-1 text-xs rounded w-full ${
                                      member.penaltyApplied ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                    }`}
                                    disabled={isPaid}
                                  >
                                    {member.penaltyApplied ? 'दंड ✓' : 'दंड नाही'}
                                  </button>
                                  {member.penaltyApplied && (
                                    <input
                                      type="number"
                                      value={penaltyInputs[memberId] || ''}
                                      onChange={(e) => handlePenaltyChange(memberId, e.target.value)}
                                      className="w-full px-1 py-1 border border-gray-300 rounded-md text-black text-xs"
                                      placeholder={calculatePenalty(member).toString()}
                                      disabled={isPaid}
                                    />
                                  )}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {(member.isBorrower || totalBorrowedThisMonth > 0) ? (
                                <div>
                                  <div className="text-purple-600 font-semibold">
                                    ₹{remainingPrincipal.toLocaleString()}
                                  </div>
                                  {paymentDetails.currentPrincipalWithLoans > remainingPrincipal && (
                                    <div className="text-xs text-green-600 mt-1">
                                      ↓ ₹{(paymentDetails.currentPrincipalWithLoans - remainingPrincipal).toLocaleString()}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                              ₹{totalAmount.toLocaleString()}
                            </td>
                            {!readOnlyMode && (
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="space-y-2">
                                  {!isPaid ? (
                                    showPaymentMode === memberId ? (
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => processPayment(memberId, 'cash')}
                                          className="flex-1 px-2 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700"
                                          title="रोख पेमेंट (Cash)"
                                        >
                                          रोख
                                        </button>
                                        <button
                                          onClick={() => processPayment(memberId, 'online')}
                                          className="flex-1 px-2 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700"
                                          title="ऑनलाइन पेमेंट (Online)"
                                        >
                                          ऑनलाइन
                                        </button>
                                        <button
                                          onClick={() => setShowPaymentMode(null)}
                                          className="px-2 py-2 text-sm rounded-md bg-gray-600 text-white hover:bg-gray-700"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setShowPaymentMode(memberId)}
                                        className="w-full px-3 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700"
                                      >
                                        पेमेंट करा
                                      </button>
                                    )
                                  ) : (
                                    <button
                                      onClick={() => revertPayment(memberId)}
                                      className="w-full px-3 py-2 text-sm rounded-md bg-yellow-600 text-white hover:bg-yellow-700"
                                    >
                                      परत करा
                                    </button>
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Borrowing Tab - same as before */}
            {activeTab === 'borrowing' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">कर्ज व्यवस्थापन (Loan Management)</h2>
                  <p className="text-sm text-gray-600">
                    {readOnlyMode
                      ? "फक्त पहाण्यासाठी - व्यवहार पूर्ण झाला (Read Only - Transaction Completed)"
                      : "कर्ज प्रक्रियेसाठी नाव किंवा अनुक्रमांकाने सदस्य शोधा (Search member for loan processing)"
                    }
                  </p>
                </div>

                {!readOnlyMode && (
                  <div className="mb-6">
                    <input
                      type="text"
                      value={borrowingSearchTerm}
                      onChange={(e) => setBorrowingSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="नाव किंवा अनुक्रमांक प्रविष्ट करा (Search by Name or Serial No.)"
                    />
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">सभा. क्र<br/>(Serial No.)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">भागधारकाचे नाव<br/>(Member Name)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">मागील कर्ज<br/>(Previous Loan)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">यावेळी घेतलेले कर्ज<br/>(Loan Taken)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">जामीन<br/>(Guarantor)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">नवीन कर्ज शिल्लक<br/>(New Loan Balance)</th>
                        {!readOnlyMode && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">क्रिया<br/>(Action)</th>}
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
            )}
          </div>
        </div>

        {/* Summary Section - same as before */}
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
      </main>
    </div>
  )
}