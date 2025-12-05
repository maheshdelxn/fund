
































// 'use client'
// import { useEffect, useMemo, useState } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'
// import Link from 'next/link'
// import { useParams } from "next/navigation";

// export default function MonthDetailsPage({ params }) {
//   const [monthData, setMonthData] = useState(null)
//   const [members, setMembers] = useState([])
//   const [editingMember, setEditingMember] = useState(null)
//   const [editingPenalty, setEditingPenalty] = useState(null)
//   const [filter, setFilter] = useState('all')
//   const [activeTab, setActiveTab] = useState('collection')
//   const [paymentInputs, setPaymentInputs] = useState({})
//   const [penaltyInputs, setPenaltyInputs] = useState({})
//   const [borrowAmounts, setBorrowAmounts] = useState({})
//   const [collectionCompleted, setCollectionCompleted] = useState(false)
//   const [monthPayments, setMonthPayments] = useState({})
//   const [readOnlyMode, setReadOnlyMode] = useState(false)
//   const [completedTransactions, setCompletedTransactions] = useState({})
//   const [searchTerm, setSearchTerm] = useState('')
//   const [guarantors, setGuarantors] = useState({})
//   const [activeGuarantorDropdown, setActiveGuarantorDropdown] = useState(null) // [memberId-index]

//   const router = useRouter()
//   const searchParams = useSearchParams()
  
//   const monthName = searchParams?.get('name') || ''
//   const year = searchParams?.get('year') || ''
//   const { date } = useParams();

//   // ===== Constants =====
//   const SHARE_AMOUNT = 1000
//   const INTEREST_RATE = 3
//   const PENALTY_RATE = 2
//   const BASE_PENALTY = 200

//   // ===== Helpers =====
//   const monthIndexFromName = (name) => {
//     const idx = ['january','february','march','april','may','june','july','august','september','october','november','december']
//       .indexOf(String(name || '').toLowerCase())
//     return idx >= 0 ? idx : null
//   }

//   const makeMonthKey = () => {
//     const idx = monthIndexFromName(monthName)
//     if (year && idx !== null) {
//       const mm = String(idx + 1).padStart(2, '0')
//       return `${year}-${mm}`
//     }
//     if (date) {
//       const d = new Date(date)
//       if (!isNaN(d)) {
//         return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
//       }
//     }
//     const now = new Date()
//     return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
//   }

//   const monthKey = useMemo(() => makeMonthKey(), [monthName, year, date])

//   // ===== Business Logic =====
//   const calculatePaymentDetails = (member) => {
//     if (!member.isBorrower) {
//       return {
//         shareAmount: SHARE_AMOUNT,
//         interestAmount: 0,
//         totalCompulsory: SHARE_AMOUNT,
//         extraPayment: 0,
//         principalReduction: 0,
//         newPrincipal: member.currentPrincipal || 0,
//       }
//     }

//     const interestAmount = Math.round((member.currentPrincipal || 0) * (INTEREST_RATE / 100))
//     const totalCompulsory = SHARE_AMOUNT + interestAmount
//     const paidAmount = paymentInputs[member.id] || 0
    
//     let extraPayment = 0
//     let principalReduction = 0
//     let newPrincipal = member.currentPrincipal || 0

//     if (paidAmount > totalCompulsory) {
//       extraPayment = paidAmount - totalCompulsory
//       principalReduction = extraPayment
//       newPrincipal = Math.max(0, (member.currentPrincipal || 0) - principalReduction)
//     }

//     return {
//       shareAmount: SHARE_AMOUNT,
//       interestAmount,
//       totalCompulsory,
//       extraPayment,
//       principalReduction,
//       newPrincipal,
//     }
//   }

//   const calculatePenalty = (member) => {
//     if (!member.penaltyApplied) return 0

//     let penalty = BASE_PENALTY
//     if (member.isBorrower) {
//       penalty += Math.round((member.currentPrincipal || 0) * (PENALTY_RATE / 100))
//     }

//     return penaltyInputs[member.id] !== undefined ? penaltyInputs[member.id] : penalty
//   }

//   const checkCollectionCompleted = (mp = monthPayments) => {
//     const allPaid = members.length > 0 && members.every(m => mp[m.id]?.paid)
//     setCollectionCompleted(allPaid)
//   }

//   // ===== Initialization =====
//   const initializeMembers = () => {
//     return [
//       { id: 1, name: 'Alice Johnson', email: 'alice@email.com', phone: '123-456-7890', isBorrower: false, borrowedAmount: 0, currentPrincipal: 0, joinDate: '2024-01-15', penaltyApplied: false, loanHistory: [], serialNo: 'MBR001' },
//       { id: 2, name: 'Bob Smith', email: 'bob@email.com', phone: '123-456-7891', isBorrower: true, borrowedAmount: 100000, currentPrincipal: 100000, joinDate: '2024-01-20', penaltyApplied: false, loanHistory: [ { date: '2024-01-20', amount: 100000, type: 'initial' } ], serialNo: 'MBR002' },
//       { id: 3, name: 'Charlie Brown', email: 'charlie@email.com', phone: '123-456-7892', isBorrower: true, borrowedAmount: 50000, currentPrincipal: 45000, joinDate: '2024-02-01', penaltyApplied: true, loanHistory: [ { date: '2024-02-01', amount: 50000, type: 'initial' } ], serialNo: 'MBR003' },
//       { id: 4, name: 'David Wilson', email: 'david@email.com', phone: '123-456-7893', isBorrower: false, borrowedAmount: 0, currentPrincipal: 0, joinDate: '2024-02-15', penaltyApplied: false, loanHistory: [], serialNo: 'MBR004' },
//       { id: 5, name: 'Emma Davis', email: 'emma@email.com', phone: '123-456-7894', isBorrower: true, borrowedAmount: 75000, currentPrincipal: 70000, joinDate: '2024-03-01', penaltyApplied: false, loanHistory: [ { date: '2024-03-01', amount: 75000, type: 'initial' } ], serialNo: 'MBR005' },
//       { id: 6, name: 'Frank Miller', email: 'frank@email.com', phone: '123-456-7895', isBorrower: false, borrowedAmount: 0, currentPrincipal: 0, joinDate: '2024-03-15', penaltyApplied: false, loanHistory: [], serialNo: 'MBR006' },
//       { id: 7, name: 'Grace Lee', email: 'grace@email.com', phone: '123-456-7896', isBorrower: false, borrowedAmount: 0, currentPrincipal: 0, joinDate: '2024-04-01', penaltyApplied: false, loanHistory: [], serialNo: 'MBR007' },
//     ]
//   }

//   useEffect(() => {
//     const sample = initializeMembers()
//     setMembers(sample)
//     setMonthData({ date, name: monthName, year })
//   }, [date, monthName, year])

//   useEffect(() => {
//     checkCollectionCompleted(monthPayments)
//   }, [monthPayments])

//   // ===== UI Handlers =====
//   const handlePaymentChange = (memberId, amount) => {
//     setPaymentInputs(prev => ({ ...prev, [memberId]: parseInt(amount) || 0 }))
//   }
//   const handlePenaltyChange = (memberId, amount) => {
//     setPenaltyInputs(prev => ({ ...prev, [memberId]: parseInt(amount) || 0 }))
//   }
//   const handleBorrowAmountChange = (memberId, amount) => {
//     setBorrowAmounts(prev => ({ ...prev, [memberId]: parseInt(amount) || 0 }))
//   }

//   const togglePenalty = (memberId) => {
//     setMembers(members.map(m => m.id === memberId ? { ...m, penaltyApplied: !m.penaltyApplied } : m))
//   }

//   // ===== Guarantor Management =====
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
//     setActiveGuarantorDropdown(null) // Close dropdown after selection
//   }

//   const toggleGuarantorDropdown = (memberId, guarantorIndex) => {
//     const dropdownKey = `${memberId}-${guarantorIndex}`
//     setActiveGuarantorDropdown(activeGuarantorDropdown === dropdownKey ? null : dropdownKey)
//   }

//   // Check if a member can be a guarantor (not exceeding 2 guarantees)
// const canBeGuarantor = (memberId, guarantorName) => {
//   if (!guarantorName.trim()) return true
  
//   const guarantorMember = members.find(m => 
//     m.name.toLowerCase() === guarantorName.toLowerCase() || 
//     m.serialNo.toLowerCase() === guarantorName.toLowerCase()
//   )
  
//   if (!guarantorMember) return true
  
//   // Count how many times this member is already a guarantor from ACTUAL loan history
//   const guarantorCount = members.reduce((count, member) => {
//     if (member.loanHistory && member.loanHistory.length > 0) {
//       member.loanHistory.forEach(loan => {
//         if (loan.guarantors && loan.guarantors.length > 0) {
//           loan.guarantors.forEach(guarantor => {
//             if (guarantor.trim() && 
//                 (guarantor.toLowerCase() === guarantorMember.name.toLowerCase() || 
//                  guarantor.toLowerCase() === guarantorMember.serialNo.toLowerCase())) {
//               count++
//             }
//           })
//         }
//       })
//     }
//     return count
//   }, 0)
  
//   return guarantorCount < 2
// }

//   // Filter members for guarantor suggestions
//   const getGuarantorSuggestions = (memberId, input) => {
//     if (!input.trim()) return []
    
//     const currentMember = members.find(m => m.id === memberId)
//     return members.filter(member => 
//       member.id !== memberId && // Cannot be guarantor for themselves
//       (member.name.toLowerCase().includes(input.toLowerCase()) || 
//        member.serialNo.toLowerCase().includes(input.toLowerCase())) &&
//       canBeGuarantor(memberId, member.name)
//     ).slice(0, 5) // Limit to 5 suggestions
//   }

//   // ===== Search Functionality =====
//   const searchedMembers = useMemo(() => {
//     if (!searchTerm.trim()) return []
    
//     return members.filter(member => 
//       member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       member.serialNo.toLowerCase().includes(searchTerm.toLowerCase())
//     )
//   }, [members, searchTerm])

//   // ===== Payments =====
//   const processPayment = (memberId) => {
//     if (readOnlyMode) return;

//     const member = members.find(m => m.id === memberId)
//     const paymentDetails = calculatePaymentDetails(member)
//     const penaltyAmount = calculatePenalty(member)
//     const paidAmount = paymentInputs[memberId] || 0
//     const totalDue = paymentDetails.totalCompulsory + penaltyAmount

//     if (paidAmount < totalDue) {
//       alert(`Minimum payment required: ₹${totalDue}`)
//       return
//     }

//     const updatedMembers = members.map(m => {
//       if (m.id !== memberId) return m
//       const updated = { ...m }
//       if (m.isBorrower) {
//         const interestAmount = Math.round((m.currentPrincipal || 0) * (INTEREST_RATE / 100))
//         const compulsory = SHARE_AMOUNT + interestAmount
//         const extra = Math.max(0, paidAmount - compulsory - penaltyAmount) // Don't reduce penalty from principal
//         updated.currentPrincipal = Math.max(0, (m.currentPrincipal || 0) - extra)
//       }
//       updated.penaltyApplied = false
//       return updated
//     })

//     setMembers(updatedMembers)

//     setMonthPayments(prev => ({
//       ...prev,
//       [memberId]: {
//         paid: true,
//         paidAmount,
//         penaltyAmount,
//         ts: new Date().toISOString(),
//       },
//     }))

//     setPaymentInputs(prev => ({ ...prev, [memberId]: 0 }))
//     setPenaltyInputs(prev => ({ ...prev, [memberId]: 0 }))

//     alert(`Payment processed successfully!\nPaid: ₹${paidAmount}\nPenalty: ₹${penaltyAmount}`)
//   }

//   const markAllAsPaid = () => {
//     if (readOnlyMode) return;

//     const updates = {}
//     const updatedMembers = members.map(m => {
//       const paymentDetails = calculatePaymentDetails(m)
//       const penaltyAmount = calculatePenalty(m)
//       const totalDue = paymentDetails.totalCompulsory + penaltyAmount
//       const input = paymentInputs[m.id] || 0
//       const paidAmount = Math.max(totalDue, input)

//       if (m.isBorrower) {
//         const interestAmount = Math.round((m.currentPrincipal || 0) * (INTEREST_RATE / 100))
//         const compulsory = SHARE_AMOUNT + interestAmount
//         const extra = Math.max(0, paidAmount - compulsory - penaltyAmount) // Don't reduce penalty from principal
//         m = { ...m, currentPrincipal: Math.max(0, (m.currentPrincipal || 0) - extra) }
//       }
//       m = { ...m, penaltyApplied: false }

//       updates[m.id] = { paid: true, paidAmount, penaltyAmount, ts: new Date().toISOString() }
//       return m
//     })

//     setMembers(updatedMembers)
//     setMonthPayments(prev => ({ ...prev, ...updates }))
//     setPaymentInputs({})
//     setPenaltyInputs({})
//   }

//   // ===== Borrowings =====
//   const processAllBorrowings = () => {
//     if (readOnlyMode) return;

//     let hasBorrowings = false
//     const updatedMembers = members.map(member => {
//       const borrowAmount = borrowAmounts[member.id] || 0
//       if (borrowAmount > 0) {
//         hasBorrowings = true
//         const updatedMember = {
//           ...member,
//           isBorrower: true,
//           borrowedAmount: (member.borrowedAmount || 0) + borrowAmount,
//           currentPrincipal: (member.currentPrincipal || 0) + borrowAmount,
//         }
//         const newLoanRecord = { 
//           date: new Date().toISOString().split('T')[0], 
//           amount: borrowAmount, 
//           type: member.isBorrower ? 'additional' : 'initial',
//           guarantors: guarantors[member.id] || []
//         }
//         updatedMember.loanHistory = [...(member.loanHistory || []), newLoanRecord]
//         return updatedMember
//       }
//       return member
//     })

//     if (!hasBorrowings) {
//       alert('Please enter borrowing amounts for at least one member')
//       return
//     }

//     setMembers(updatedMembers)
//     setBorrowAmounts({})
//     setGuarantors({})
//     alert('All borrowings processed successfully!')
//   }

//   const processSingleBorrowing = (memberId) => {
//     if (readOnlyMode) return;

//     const borrowAmount = borrowAmounts[memberId] || 0
//     if (borrowAmount <= 0) {
//       alert('Please enter a valid amount')
//       return
//     }

//     // Validate guarantors if provided (not compulsory)
//     const memberGuarantors = guarantors[memberId] || ['', '']
//     const validGuarantors = memberGuarantors.filter(g => g.trim() !== '')
    
//     // Check if provided guarantors can guarantee (not exceeding 2 guarantees)
//     for (const guarantorName of validGuarantors) {
//       if (!canBeGuarantor(memberId, guarantorName)) {
//         alert(`Guarantor "${guarantorName}" cannot guarantee more than 2 loans`)
//         return
//       }
//     }

//     const updatedMembers = members.map(member => {
//       if (member.id === memberId) {
//         const updatedMember = {
//           ...member,
//           isBorrower: true,
//           borrowedAmount: (member.borrowedAmount || 0) + borrowAmount,
//           currentPrincipal: (member.currentPrincipal || 0) + borrowAmount,
//         }
//         const newLoanRecord = { 
//           date: new Date().toISOString().split('T')[0], 
//           amount: borrowAmount, 
//           type: member.isBorrower ? 'additional' : 'initial',
//           guarantors: memberGuarantors
//         }
//         updatedMember.loanHistory = [...(member.loanHistory || []), newLoanRecord]
//         return updatedMember
//       }
//       return member
//     })

//     setMembers(updatedMembers)
//     setBorrowAmounts(prev => ({ ...prev, [memberId]: 0 }))
//     setGuarantors(prev => ({ ...prev, [memberId]: ['', ''] }))

//     const member = members.find(m => m.id === memberId)
//     alert(`Loan of ₹${borrowAmount.toLocaleString()} processed successfully for ${member?.name || 'member'}`)
//   }

//   // ===== Complete Transaction =====
//   const handleCompleteTransaction = () => {
//     // Save current state to completed transactions
//     const transactionData = {
//       members: [...members],
//       monthPayments: {...monthPayments},
//       paymentInputs: {...paymentInputs},
//       penaltyInputs: {...penaltyInputs},
//       borrowAmounts: {...borrowAmounts},
//       completedAt: new Date().toISOString()
//     }
    
//     setCompletedTransactions(prev => ({
//       ...prev,
//       [monthKey]: transactionData
//     }))
    
//     setReadOnlyMode(true)
//     alert('Transaction completed! The page is now in read-only mode.')
//   }

//   // ===== Dynamic Stats Calculation =====
//   const calculateMonthStats = () => {
//     const totalShareCollection = members.length * SHARE_AMOUNT
//     const totalInterest = members.reduce((sum, m) => sum + calculatePaymentDetails(m).interestAmount, 0)
//     const totalPenalties = members.reduce((sum, m) => sum + calculatePenalty(m), 0)
//     const totalPaid = Object.values(monthPayments).reduce((sum, p) => sum + (p.paidAmount || 0), 0)
//     const totalPrincipal = members.reduce((s, m) => s + (m.currentPrincipal || 0), 0)
//     const totalBorrowed = members.reduce((s, m) => s + (m.borrowedAmount || 0), 0)

//     return {
//       totalShareCollection,
//       totalInterest,
//       totalPenalties,
//       totalPaid,
//       totalPrincipal,
//       totalBorrowed
//     }
//   }

//   const monthStats = calculateMonthStats()

//   // ===== Filters & Status =====
//   const filteredMembers = members.filter(member => {
//     if (filter === 'all') return true
//     if (filter === 'borrower') return member.isBorrower
//     if (filter === 'non-borrower') return !member.isBorrower
//     if (filter === 'penalty') return member.penaltyApplied
//     if (filter === 'can-borrow') return true
//     return true
//   })

//   const hasMemberPaid = (member) => !!monthPayments[member.id]?.paid

//   const getCardClass = (cardType) => {
//     const baseClass = 'rounded-lg shadow-md p-6 text-center cursor-pointer transition-all duration-200'
//     if (filter === cardType) {
//       switch (cardType) {
//         case 'all': return `${baseClass} bg-blue-100 border-2 border-blue-500 transform scale-105`
//         case 'borrower': return `${baseClass} bg-purple-100 border-2 border-purple-500 transform scale-105`
//         case 'non-borrower': return `${baseClass} bg-green-100 border-2 border-green-500 transform scale-105`
//         case 'penalty': return `${baseClass} bg-red-100 border-2 border-red-500 transform scale-105`
//         case 'can-borrow': return `${baseClass} bg-orange-100 border-2 border-orange-500 transform scale-105`
//         default: return `${baseClass} bg-white border-2 border-gray-300`
//       }
//     } else {
//       return `${baseClass} bg-white border border-gray-200 hover:shadow-lg hover:border-gray-300`
//     }
//   }

//   const getTextClass = (cardType) => {
//     if (filter === cardType) {
//       switch (cardType) {
//         case 'all': return 'text-blue-700'
//         case 'borrower': return 'text-purple-700'
//         case 'non-borrower': return 'text-green-700'
//         case 'penalty': return 'text-red-700'
//         case 'can-borrow': return 'text-orange-700'
//         default: return 'text-gray-700'
//       }
//     }
//     return 'text-gray-700'
//   }

//   const getTabClass = (tabName) => {
//     const baseClass = 'px-4 py-2 rounded-md font-medium transition-colors'
//     return activeTab === tabName ? `${baseClass} bg-blue-600 text-white` : `${baseClass} bg-gray-200 text-gray-700 hover:bg-gray-300`
//   }

//   const getPaymentStatusClass = (member) => (hasMemberPaid(member) ? 'bg-green-50 border-l-4 border-green-400' : 'bg-white')

//   // Get all borrowers with their loan history
//   const getAllBorrowersWithLoans = () => {
//     return members.filter(member => member.isBorrower && member.loanHistory && member.loanHistory.length > 0)
//   }

//   // Get flattened loan history for table rendering
//   const getFlattenedLoanHistory = () => {
//     const borrowers = getAllBorrowersWithLoans()
//     const flattened = []
    
//     borrowers.forEach(member => {
//       member.loanHistory.forEach((loan, index) => {
//         flattened.push({
//           memberId: member.id,
//           loanIndex: index,
//           member,
//           loan
//         })
//       })
//     })
    
//     return flattened
//   }

//   if (!monthData) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     )
//   }

//   const headerSub = () => {
//     const idx = monthIndexFromName(monthData.name)
//     const pretty = idx !== null ? `${String(25).padStart(2,'0')} ${monthData.name}` : '25th'
//     return pretty
//   }

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <header className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <div className="flex items-center space-x-4">
//               <h1 className="text-2xl font-bold text-gray-900">
//                 {monthData.name} {monthData.year} - Chit Fund Collection
//                 {readOnlyMode && <span className="ml-2 text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded">Read Only</span>}
//               </h1>
//               <span className="text-gray-600 text-sm bg-gray-100 px-3 py-1 rounded-full">
//                 {headerSub()}
//               </span>
//               {collectionCompleted && (
//                 <span className="text-green-600 text-sm bg-green-100 px-3 py-1 rounded-full">
//                   ✓ Collection Completed
//                 </span>
//               )}
//             </div>
//             <Link 
//               href="/dashboard" 
//               className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
//             >
//               ← Back to Dashboard
//             </Link>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Summary Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <div className={getCardClass('all')} onClick={() => setFilter('all')}>
//             <h3 className={`text-lg font-semibold mb-2 ${getTextClass('all')}`}>All Members</h3>
//             <p className={`text-3xl font-bold ${getTextClass('all')}`}>{members.length}</p>
//           </div>

//           <div className={getCardClass('borrower')} onClick={() => setFilter('borrower')}>
//             <h3 className={`text-lg font-semibold mb-2 ${getTextClass('borrower')}`}>Borrowers</h3>
//             <p className={`text-3xl font-bold ${getTextClass('borrower')}`}>
//               {members.filter(m => m.isBorrower).length}
//             </p>
//           </div>

//           <div className={getCardClass('non-borrower')} onClick={() => setFilter('non-borrower')}>
//             <h3 className={`text-lg font-semibold mb-2 ${getTextClass('non-borrower')}`}>Non-Borrowers</h3>
//             <p className={`text-3xl font-bold ${getTextClass('non-borrower')}`}>
//               {members.filter(m => !m.isBorrower).length}
//             </p>
//           </div>

//           <div className={getCardClass('penalty')} onClick={() => setFilter('penalty')}>
//             <h3 className={`text-lg font-semibold mb-2 ${getTextClass('penalty')}`}>Penalty Cases</h3>
//             <p className={`text-3xl font-bold ${getTextClass('penalty')}`}>
//               {members.filter(m => m.penaltyApplied).length}
//             </p>
//           </div>

          
//         </div>

//         {/* Collection Status Banner */}
//         {!collectionCompleted && activeTab === 'collection' && !readOnlyMode && (
//           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
//             <div className="flex items-center">
//               <div className="flex-shrink-0">
//                 <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <div className="ml-3">
//                 <h3 className="text-sm font-medium text-yellow-800">Collection In Progress</h3>
//                 <div className="mt-2 text-sm text-yellow-700">
//                   <p>Some members haven't completed their payments yet. Paid members are highlighted in green.</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Read Only Mode Banner */}
//         {readOnlyMode && (
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//             <div className="flex items-center">
//               <div className="flex-shrink-0">
//                 <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <div className="ml-3">
//                 <h3 className="text-sm font-medium text-blue-800">Read Only Mode</h3>
//                 <div className="mt-2 text-sm text-blue-700">
//                   <p>This transaction has been completed. All data is now in read-only mode for reference.</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Tab Navigation */}
//         <div className="flex space-x-4 mb-6">
//           <button className={getTabClass('collection')} onClick={() => setActiveTab('collection')}>Collection Details</button>
//           <button className={getTabClass('borrowing')} onClick={() => setActiveTab('borrowing')}>Borrowing Management</button>
//         </div>

//         {/* Collection Details Table */}
//         {activeTab === 'collection' && (
//           <div className="bg-white rounded-lg shadow-md overflow-hidden">
//             <div className="px-6 py-4 border-b border-gray-200">
//               <div className="flex justify-between items-center">
//                 <div>
//                   <h2 className="text-lg font-semibold text-gray-800">Monthly Collection Management</h2>
//                   <p className="text-sm text-gray-600 mt-1">
//                     {readOnlyMode ? (
//                       "View only - Transaction completed"
//                     ) : (
//                       `Manage payments, calculate interest, and apply penalties. Share Amount: ₹${SHARE_AMOUNT} | Interest: ${INTEREST_RATE}% | Penalty: ${PENALTY_RATE}% + ₹${BASE_PENALTY}`
//                     )}
//                   </p>
//                 </div>
//                 <div className="flex items-center space-x-2 text-sm">
//                   <div className="flex items-center">
//                     <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
//                     <span>Paid</span>
//                   </div>
//                   <div className="flex items-center">
//                     <div className="w-3 h-3 bg-white border border-gray-300 rounded-full mr-2"></div>
//                     <span>Pending</span>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr.No</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compulsory Payment</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount Paid</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penalty</th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                     {!readOnlyMode && (
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                     )}
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredMembers.length > 0 ? (
//                     filteredMembers.map((member) => {
//                       const paymentDetails = calculatePaymentDetails(member)
//                       const penaltyAmount = calculatePenalty(member)
//                       const paidAmountInput = paymentInputs[member.id] || 0
//                       const totalDue = paymentDetails.totalCompulsory + penaltyAmount
//                       const isPaid = hasMemberPaid(member)
//                       const actualPaidAmount = monthPayments[member.id]?.paidAmount || 0
//                       const actualPenaltyAmount = monthPayments[member.id]?.penaltyAmount || 0

//                       return (
//                         <tr key={member.id} className={`hover:bg-gray-50 transition-colors ${getPaymentStatusClass(member)}`}>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {member.serialNo}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div>
//                               <div className="text-sm font-medium text-gray-900">{member.name}</div>
//                               <div className="text-sm text-gray-500">{member.phone}</div>
//                               {member.isBorrower && member.loanHistory && (
//                                 <div className="text-xs text-gray-400 mt-1">Total Borrowed: ₹{member.borrowedAmount?.toLocaleString()}</div>
//                               )}
//                             </div>
//                           </td>

//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${member.isBorrower ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
//                               {member.isBorrower ? 'Borrower' : 'Non-Borrower'}
//                             </span>
//                           </td>

//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {member.isBorrower ? (
//                               <div>
//                                 <div>₹{member.currentPrincipal?.toLocaleString()}</div>
//                                 {member.borrowedAmount > member.currentPrincipal && (
//                                   <div className="text-xs text-green-600">Paid: ₹{(member.borrowedAmount - member.currentPrincipal).toLocaleString()}</div>
//                                 )}
//                               </div>
//                             ) : '-'}
//                           </td>

//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             <div className="space-y-1">
//                               <div>Share: ₹{SHARE_AMOUNT}</div>
//                               {member.isBorrower && (<div>Interest: ₹{paymentDetails.interestAmount}</div>)}
//                               <div className="font-semibold">Total: ₹{paymentDetails.totalCompulsory}</div>
//                             </div>
//                           </td>

//                           <td className="px-6 py-4 whitespace-nowrap">
//                             {readOnlyMode ? (
//                               // In read-only mode, show actual paid amount or dash if not paid
//                               isPaid ? (
//                                 <div>
//                                   <div className="font-semibold text-green-600">₹{actualPaidAmount.toLocaleString()}</div>
//                                   <div className="text-xs text-gray-500 mt-1">Paid this month</div>
//                                 </div>
//                               ) : (
//                                 <span className="text-gray-500">-</span>
//                               )
//                             ) : isPaid ? (
//                               // Show actual paid amount when member has paid
//                               <div>
//                                 <div className="font-semibold text-green-600">₹{actualPaidAmount.toLocaleString()}</div>
//                                 <div className="text-xs text-gray-500 mt-1">Paid this month</div>
//                               </div>
//                             ) : (
//                               // Show input field when not paid
//                               <>
//                                 <input
//                                   type="number"
//                                   value={paidAmountInput}
//                                   onChange={(e) => handlePaymentChange(member.id, e.target.value)}
//                                   className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
//                                   placeholder="Amount"
//                                   disabled={isPaid}
//                                 />
//                                 {paidAmountInput > 0 && (
//                                   <div className="text-xs text-gray-500 mt-1">Due: ₹{totalDue}</div>
//                                 )}
//                               </>
//                             )}
//                           </td>

//                           <td className="px-6 py-4 whitespace-nowrap">
//                             {readOnlyMode ? (
//                               // In read-only mode, show actual penalty amount or dash if no penalty
//                               isPaid ? (
//                                 actualPenaltyAmount > 0 ? (
//                                   <div className="font-semibold text-red-600">₹{actualPenaltyAmount.toLocaleString()}</div>
//                                 ) : (
//                                   <span className="text-gray-500">-</span>
//                                 )
//                               ) : (
//                                 <span className="text-gray-500">-</span>
//                               )
//                             ) : isPaid ? (
//                               // Show actual penalty amount when member has paid
//                               actualPenaltyAmount > 0 ? (
//                                 <div className="font-semibold text-red-600">₹{actualPenaltyAmount.toLocaleString()}</div>
//                               ) : (
//                                 <span className="text-gray-500">-</span>
//                               )
//                             ) : (
//                               // Show penalty controls when not paid
//                               <div className="flex items-center space-x-2">
//                                 <button
//                                   onClick={() => togglePenalty(member.id)}
//                                   className={`px-2 py-1 text-xs rounded ${member.penaltyApplied ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}
//                                   disabled={isPaid}
//                                 >
//                                   {member.penaltyApplied ? 'Penalty ✓' : 'No Penalty'}
//                                 </button>
//                                 {member.penaltyApplied && (
//                                   <div className="flex items-center space-x-1">
//                                     <span className="text-xs text-gray-600">₹</span>
//                                     <input
//                                       type="number"
//                                       value={penaltyInputs[member.id] !== undefined ? penaltyInputs[member.id] : penaltyAmount}
//                                       onChange={(e) => handlePenaltyChange(member.id, e.target.value)}
//                                       className="w-16 px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-black text-xs"
//                                       disabled={isPaid}
//                                     />
//                                   </div>
//                                 )}
//                               </div>
//                             )}
//                           </td>

//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
//                               {isPaid ? 'Paid ✓' : 'Pending'}
//                             </span>
//                           </td>

//                           {!readOnlyMode && (
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <button
//                                 onClick={() => processPayment(member.id)}
//                                 disabled={isPaid || (paidAmountInput < (paymentDetails.totalCompulsory + penaltyAmount))}
//                                 className={`w-full px-4 py-2 text-sm rounded-md ${isPaid || (paidAmountInput < (paymentDetails.totalCompulsory + penaltyAmount)) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
//                               >
//                                 {isPaid ? 'Paid' : 'Process Payment'}
//                               </button>
//                             </td>
//                           )}
//                         </tr>
//                       )
//                     })
//                   ) : (
//                     <tr>
//                       <td colSpan={readOnlyMode ? "8" : "9"} className="px-6 py-8 text-center">
//                         <div className="text-gray-500">
//                           <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                           </svg>
//                           <p className="mt-2 text-lg font-medium">No members found</p>
//                           <p className="text-sm">Try changing your filter or check back later</p>
//                         </div>
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* Borrowing Management Table */}
//         {activeTab === 'borrowing' && (
//           <>
//             {/* Current Borrowing Form */}
//             <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
//               <div className="px-6 py-4 border-b border-gray-200">
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <h2 className="text-lg font-semibold text-gray-800">Borrowing Management</h2>
//                     <p className="text-sm text-gray-600 mt-1">
//                       {readOnlyMode ? (
//                         "View only - Transaction completed"
//                       ) : (
//                         "Search for members by name or serial number to process loans. Guarantors are optional but recommended."
//                       )}
//                     </p>
//                   </div>
//                   {!readOnlyMode && (
//                     <button onClick={processAllBorrowings} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">Process All Borrowings</button>
//                   )}
//                 </div>
//               </div>

//               {/* Search Bar */}
//               {!readOnlyMode && (
//                 <div className="px-6 py-4 bg-gray-50 border-b">
//                   <div className="max-w-md">
//                     <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
//                       Search Member by Name or Serial Number
//                     </label>
//                     <input
//                       type="text"
//                       id="search"
//                       value={searchTerm}
//                       onChange={(e) => setSearchTerm(e.target.value)}
//                       className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
//                       placeholder="Enter name or serial number (e.g., MBR001)"
//                     />
//                     {searchTerm && (
//                       <p className="text-sm text-gray-600 mt-2">
//                         Found {searchedMembers.length} member(s)
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               )}

//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr.No</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member Name</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Previous Amount (Principal)</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                         {readOnlyMode ? 'Current Amount' : 'Current Borrowing Amount'}
//                       </th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guarantors (Optional)</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Principal Amount</th>
//                       {!readOnlyMode && (
//                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                       )}
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {(readOnlyMode ? members : searchedMembers).map((member, index) => {
//                       const borrowAmount = borrowAmounts[member.id] || 0
//                       const newPrincipal = (member.currentPrincipal || 0) + borrowAmount
//                       const memberGuarantors = guarantors[member.id] || ['', '']

//                       return (
//                         <tr key={member.id} className="hover:bg-gray-50">
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.serialNo}</td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div>
//                               <div className="text-sm font-medium text-gray-900">{member.name}</div>
//                               <div className="text-sm text-gray-500">{member.phone}</div>
//                               <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${member.isBorrower ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
//                                 {member.isBorrower ? 'Existing Borrower' : 'New Borrower'}
//                               </span>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{member.currentPrincipal?.toLocaleString() || '0'}</td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             {readOnlyMode ? (
//                               <span className="text-gray-500">-</span>
//                             ) : (
//                               <input
//                                 type="number"
//                                 value={borrowAmount}
//                                 onChange={(e) => handleBorrowAmountChange(member.id, e.target.value)}
//                                 className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
//                                 placeholder="Enter amount"
//                               />
//                             )}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             {readOnlyMode ? (
//                               member.loanHistory && member.loanHistory.length > 0 ? (
//                                 <div className="text-sm">
//                                   {member.loanHistory[member.loanHistory.length - 1]?.guarantors?.filter(g => g.trim() !== '').map((guarantor, idx) => (
//                                     <div key={idx} className="text-blue-600">{guarantor}</div>
//                                   ))}
//                                   {member.loanHistory[member.loanHistory.length - 1]?.guarantors?.filter(g => g.trim() !== '').length === 0 && (
//                                     <span className="text-gray-500">No guarantors</span>
//                                   )}
//                                 </div>
//                             ) : (
//                               <span className="text-gray-500">-</span>
//                             )
//                           ) : (
//                             <div className="space-y-2 min-w-[200px]">
//                               {[0, 1].map((guarantorIndex) => {
//                                 const dropdownKey = `${member.id}-${guarantorIndex}`
//                                 const suggestions = getGuarantorSuggestions(member.id, memberGuarantors[guarantorIndex])
                                
//                                 return (
//                                   <div key={guarantorIndex} className="relative">
//                                     <div className="flex items-center space-x-2">
//                                       <input
//                                         type="text"
//                                         value={memberGuarantors[guarantorIndex]}
//                                         onChange={(e) => handleGuarantorChange(member.id, guarantorIndex, e.target.value)}
//                                         onFocus={() => setActiveGuarantorDropdown(dropdownKey)}
//                                         className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-black text-sm"
//                                         placeholder={`Guarantor ${guarantorIndex + 1} (optional)`}
//                                       />
//                                       <button
//                                         type="button"
//                                         onClick={() => toggleGuarantorDropdown(member.id, guarantorIndex)}
//                                         className="px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm"
//                                       >
//                                         ↓
//                                       </button>
//                                     </div>
                                    
//                                     {activeGuarantorDropdown === dropdownKey && suggestions.length > 0 && (
//                                       <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
//                                         {suggestions.map((suggestion) => (
//                                           <div
//                                             key={suggestion.id}
//                                             className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
//                                             onClick={() => handleGuarantorSelect(member.id, guarantorIndex, suggestion.name)}
//                                           >
//                                             <div className="font-medium text-gray-500">{suggestion.name}</div>
//                                             <div className="text-xs text-gray-500">{suggestion.serialNo}</div>
//                                           </div>
//                                         ))}
//                                       </div>
//                                     )}
                                    
//                                     {memberGuarantors[guarantorIndex] && !canBeGuarantor(member.id, memberGuarantors[guarantorIndex]) && (
//                                       <p className="text-xs text-red-600 mt-1">This guarantor already has 2 guarantees</p>
//                                     )}
//                                   </div>
//                                 )
//                               })}
//                             </div>
//                           )}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             <div className="font-semibold">₹{newPrincipal.toLocaleString()}</div>
//                             {borrowAmount > 0 && !readOnlyMode && (
//                               <div className="text-xs text-green-600">+₹{borrowAmount.toLocaleString()}</div>
//                             )}
//                           </td>
//                           {!readOnlyMode && (
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               <button 
//                                 onClick={() => processSingleBorrowing(member.id)} 
//                                 disabled={borrowAmount <= 0}
//                                 className={`px-4 py-2 text-sm rounded-md ${
//                                   borrowAmount > 0
//                                     ? 'bg-blue-600 text-white hover:bg-blue-700' 
//                                     : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                                 }`}
//                               >
//                                 Submit
//                               </button>
//                             </td>
//                           )}
//                         </tr>
//                       )
//                     })}
//                   </tbody>
//                 </table>
                
//                 {!readOnlyMode && searchTerm && searchedMembers.length === 0 && (
//                   <div className="px-6 py-8 text-center">
//                     <div className="text-gray-500">
//                       <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                       </svg>
//                       <p className="mt-2 text-lg font-medium">No members found</p>
//                       <p className="text-sm">Try searching with a different name or serial number</p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Borrowing History Table */}
//             <div className="bg-white rounded-lg shadow-md overflow-hidden">
//               <div className="px-6 py-4 border-b border-gray-200">
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <h2 className="text-lg font-semibold text-gray-800">Borrowing History</h2>
//                     <p className="text-sm text-gray-600 mt-1">
//                       Complete history of all loans taken by members including guarantors and dates
//                     </p>
//                   </div>
//                   <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
//                     {getAllBorrowersWithLoans().length} Active Borrowers
//                   </span>
//                 </div>
//               </div>

//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr.No</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member Name</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Date</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Amount</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loan Type</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guarantors</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Principal</th>
//                       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Borrowed</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {getFlattenedLoanHistory().length > 0 ? (
//                       getFlattenedLoanHistory().map(({ memberId, loanIndex, member, loan }) => (
//                         <tr key={`${memberId}-${loanIndex}`} className="hover:bg-gray-50">
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {member.serialNo}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div>
//                               <div className="text-sm font-medium text-gray-900">{member.name}</div>
//                               <div className="text-sm text-gray-500">{member.phone}</div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {new Date(loan.date).toLocaleDateString()}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             <span className="font-semibold">₹{loan.amount?.toLocaleString()}</span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
//                               loan.type === 'initial' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
//                             }`}>
//                               {loan.type === 'initial' ? 'Initial Loan' : 'Additional Loan'}
//                             </span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             {loan.guarantors && loan.guarantors.filter(g => g.trim() !== '').length > 0 ? (
//                               <div className="space-y-1">
//                                 {loan.guarantors.filter(g => g.trim() !== '').map((guarantor, idx) => (
//                                   <div key={idx} className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs">
//                                     {guarantor}
//                                   </div>
//                                 ))}
//                               </div>
//                             ) : (
//                               <span className="text-gray-500 text-sm">No guarantors</span>
//                             )}
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             <span className="font-semibold">₹{member.currentPrincipal?.toLocaleString()}</span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                             <span className="font-semibold">₹{member.borrowedAmount?.toLocaleString()}</span>
//                           </td>
//                         </tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan="8" className="px-6 py-8 text-center">
//                           <div className="text-gray-500">
//                             <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                             </svg>
//                             <p className="mt-2 text-lg font-medium">No borrowing history found</p>
//                             <p className="text-sm">No members have taken any loans yet</p>
//                           </div>
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </>
//         )}

//         {/* Action Buttons */}
//         {!readOnlyMode && (
//           <div className="mt-6 flex flex-wrap gap-4">
//             {activeTab === 'collection' && (
//               <>
//                 <button onClick={markAllAsPaid} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors">Process All Payments</button>
//                 <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">Export to Excel</button>
//               </>
//             )}
//             <button onClick={handleCompleteTransaction} className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors">
//               Complete Transaction
//             </button>
//             <button className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors">Print Report</button>
//           </div>
//         )}

//         {/* Summary Section - Dynamic Data */}
//         <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="bg-white rounded-lg shadow-md p-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h3>
//             <div className="space-y-2 text-black">
//               <div className="flex justify-between">
//                 <span>Total Share Collection:</span>
//                 <span className="font-semibold">₹{monthStats.totalShareCollection.toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Total Interest:</span>
//                 <span className="font-semibold">₹{monthStats.totalInterest.toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Total Penalties:</span>
//                 <span className="font-semibold">₹{monthStats.totalPenalties.toLocaleString()}</span>
//               </div>
//               <div className="flex justify-between border-t pt-2">
//                 <span>Total Collected:</span>
//                 <span className="font-semibold text-green-600">₹{monthStats.totalPaid.toLocaleString()}</span>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-md p-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">Borrower Summary</h3>
//             <div className="space-y-2 text-black">
//               <div className="flex justify-between"><span>Total Borrowers:</span><span>{members.filter(m => m.isBorrower).length}</span></div>
//               <div className="flex justify-between"><span>Total Principal:</span><span className="font-semibold">₹{monthStats.totalPrincipal.toLocaleString()}</span></div>
//               <div className="flex justify-between"><span>Total Borrowed:</span><span className="font-semibold">₹{monthStats.totalBorrowed.toLocaleString()}</span></div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-md p-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">System Info</h3>
//             <div className="space-y-2 text-sm text-black">
//               <div className="flex justify-between"><span>Share Amount:</span><span>₹{SHARE_AMOUNT}</span></div>
//               <div className="flex justify-between"><span>Interest Rate:</span><span>{INTEREST_RATE}%</span></div>
//               <div className="flex justify-between"><span>Penalty Rate:</span><span>{PENALTY_RATE}% + ₹{BASE_PENALTY}</span></div>
//               <div className="flex justify-between">
//                 <span>Collection Status:</span>
//                 <span className={collectionCompleted ? 'text-green-600 font-semibold' : 'text-yellow-600 font-semibold'}>
//                   {collectionCompleted ? 'Completed' : 'In Progress'}
//                 </span>
//               </div>
//               <div className="flex justify-between">
//                 <span>Mode:</span>
//                 <span className={readOnlyMode ? 'text-blue-600 font-semibold' : 'text-gray-600 font-semibold'}>
//                   {readOnlyMode ? 'Read Only' : 'Editable'}
//                 </span>
//               </div>
//               <div className="flex justify-between"><span>Month Key:</span><span className="font-mono">{monthKey}</span></div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }





















































































'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useParams } from "next/navigation";

export default function MonthDetailsPage({ params }) {
  const [monthData, setMonthData] = useState(null)
  const [members, setMembers] = useState([])
  const [editingMember, setEditingMember] = useState(null)
  const [editingPenalty, setEditingPenalty] = useState(null)
  const [filter, setFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('collection')
  const [muddalInputs, setMuddalInputs] = useState({})
  const [penaltyInputs, setPenaltyInputs] = useState({})
  const [borrowAmounts, setBorrowAmounts] = useState({})
  const [collectionCompleted, setCollectionCompleted] = useState(false)
  const [monthPayments, setMonthPayments] = useState({})
  const [readOnlyMode, setReadOnlyMode] = useState(false)
  const [completedTransactions, setCompletedTransactions] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [collectionSearchTerm, setCollectionSearchTerm] = useState('')
  const [guarantors, setGuarantors] = useState({})
  const [activeGuarantorDropdown, setActiveGuarantorDropdown] = useState(null)
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [borrowingSearchTerm, setBorrowingSearchTerm] = useState('')
  const [searchedBorrowingMembers, setSearchedBorrowingMembers] = useState([])
  const [monthLoans, setMonthLoans] = useState({})
  const [showPaymentMode, setShowPaymentMode] = useState(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const monthName = searchParams?.get('name') || ''
  const year = searchParams?.get('year') || ''
  const { date } = useParams();

  // ===== Constants =====
  const SHARE_AMOUNT = 1000
  const INTEREST_RATE = 3
  const PENALTY_RATE = 2
  const BASE_PENALTY = 200

  // ===== Helper Functions =====
  const hasMemberPaid = (member) => !!monthPayments[member.id]?.paid

  const monthIndexFromName = (name) => {
    const idx = ['january','february','march','april','may','june','july','august','september','october','november','december']
      .indexOf(String(name || '').toLowerCase())
    return idx >= 0 ? idx : null
  }

  const makeMonthKey = () => {
    const idx = monthIndexFromName(monthName)
    if (year && idx !== null) {
      const mm = String(idx + 1).padStart(2, '0')
      return `${year}-${mm}`
    }
    if (date) {
      const d = new Date(date)
      if (!isNaN(d)) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      }
    }
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  const monthKey = useMemo(() => makeMonthKey(), [monthName, year, date])

  // ===== Business Logic =====
  const calculatePaymentDetails = (member) => {
    if (!member) return null

    // If payment already made, return stored details
    const existingPayment = monthPayments[member.id]
    if (existingPayment?.paid) {
      return {
        shareAmount: SHARE_AMOUNT,
        muddalPaid: existingPayment.calculatedMuddal || existingPayment.muddalPaid || 0,
        interestAmount: existingPayment.interestAmount || 0,
        totalCompulsory: SHARE_AMOUNT + (existingPayment.interestAmount || 0),
        newPrincipal: member.currentPrincipal || 0,
        total: existingPayment.calculatedTotal || existingPayment.paidAmount || 0,
      }
    }

    // Original logic for non-paid members
    if (!member.isBorrower) {
      return {
        shareAmount: SHARE_AMOUNT,
        muddalPaid: 0,
        interestAmount: 0,
        totalCompulsory: SHARE_AMOUNT,
        newPrincipal: member.currentPrincipal || 0,
        total: SHARE_AMOUNT,
      }
    }

    const muddalPaid = Math.max(0, parseInt(muddalInputs[member.id]) || 0)
    const currentPrincipal = Math.max(0, member.currentPrincipal || 0)
    const reducedPrincipal = Math.max(0, currentPrincipal - muddalPaid)
    const interestAmount = Math.round(reducedPrincipal * (INTEREST_RATE / 100))
    const totalCompulsory = SHARE_AMOUNT + interestAmount
    const total = SHARE_AMOUNT + muddalPaid + interestAmount

    return {
      shareAmount: SHARE_AMOUNT,
      muddalPaid,
      interestAmount,
      totalCompulsory,
      total,
      newPrincipal: reducedPrincipal,
    }
  }

  // ===== FIXED PENALTY CALCULATION =====
  const calculatePenalty = (member) => {
    if (!member) return 0
    
    // If payment already made, return stored penalty
    const existingPayment = monthPayments[member.id]
    if (existingPayment?.paid) {
      return existingPayment.calculatedPenalty || existingPayment.penaltyAmount || 0
    }

    // Check if penalty is applied to this member
    if (!member.penaltyApplied) return 0

    // Check if user manually entered penalty amount
    const userEnteredPenalty = penaltyInputs[member.id]
    if (userEnteredPenalty !== undefined && userEnteredPenalty !== '') {
      const manualPenalty = parseInt(userEnteredPenalty)
      if (!isNaN(manualPenalty) && manualPenalty >= 0) {
        return manualPenalty  // Use ONLY user's entered value
      }
    }

    // Calculate auto penalty (only if no user input)
    let penalty = BASE_PENALTY
    if (member.isBorrower) {
      const principalPenalty = Math.round((member.currentPrincipal || 0) * (PENALTY_RATE / 100))
      penalty += principalPenalty
    }
    
    return penalty
  }

  const checkCollectionCompleted = (mp = monthPayments) => {
    const allPaid = members.length > 0 && members.every(m => mp[m.id]?.paid)
    setCollectionCompleted(allPaid)
  }

  // ===== Initialization =====
  const initializeMembers = () => {
    return [
      { id: 1, name: 'Alice Johnson', email: 'alice@email.com', phone: '123-456-7890', isBorrower: false, borrowedAmount: 0, currentPrincipal: 0, joinDate: '2024-01-15', penaltyApplied: false, loanHistory: [], serialNo: 'MBR001' },
      { id: 2, name: 'Bob Smith', email: 'bob@email.com', phone: '123-456-7891', isBorrower: true, borrowedAmount: 100000, currentPrincipal: 100000, joinDate: '2024-01-20', penaltyApplied: false, loanHistory: [ { date: '2024-01-20', amount: 100000, type: 'initial', guarantors: [] } ], serialNo: 'MBR002' },
      { id: 3, name: 'Charlie Brown', email: 'charlie@email.com', phone: '123-456-7892', isBorrower: true, borrowedAmount: 50000, currentPrincipal: 45000, joinDate: '2024-02-01', penaltyApplied: true, loanHistory: [ { date: '2024-02-01', amount: 50000, type: 'initial', guarantors: [] } ], serialNo: 'MBR003' },
      { id: 4, name: 'David Wilson', email: 'david@email.com', phone: '123-456-7893', isBorrower: false, borrowedAmount: 0, currentPrincipal: 0, joinDate: '2024-02-15', penaltyApplied: false, loanHistory: [], serialNo: 'MBR004' },
      { id: 5, name: 'Emma Davis', email: 'emma@email.com', phone: '123-456-7894', isBorrower: true, borrowedAmount: 75000, currentPrincipal: 70000, joinDate: '2024-03-01', penaltyApplied: false, loanHistory: [ { date: '2024-03-01', amount: 75000, type: 'initial', guarantors: [] } ], serialNo: 'MBR005' },
      { id: 6, name: 'Frank Miller', email: 'frank@email.com', phone: '123-456-7895', isBorrower: false, borrowedAmount: 0, currentPrincipal: 0, joinDate: '2024-03-15', penaltyApplied: false, loanHistory: [], serialNo: 'MBR006' },
      { id: 7, name: 'Grace Lee', email: 'grace@email.com', phone: '123-456-7896', isBorrower: false, borrowedAmount: 0, currentPrincipal: 0, joinDate: '2024-04-01', penaltyApplied: false, loanHistory: [], serialNo: 'MBR007' },
    ]
  }

  useEffect(() => {
    const sample = initializeMembers()
    setMembers(sample)
    setMonthData({ date, name: monthName, year })
    
    const initialMonthLoans = {}
    sample.forEach(member => {
      if (member.loanHistory && member.loanHistory.length > 0) {
        member.loanHistory.forEach(loan => {
          try {
            const loanDate = new Date(loan.date)
            const loanMonthKey = `${loanDate.getFullYear()}-${String(loanDate.getMonth() + 1).padStart(2, '0')}`
            if (loanMonthKey === monthKey) {
              if (!initialMonthLoans[member.id]) {
                initialMonthLoans[member.id] = []
              }
              initialMonthLoans[member.id].push({
                amount: loan.amount,
                guarantors: loan.guarantors || [],
                date: loan.date
              })
            }
          } catch (error) {
            console.error('Error parsing loan date:', error)
          }
        })
      }
    })
    setMonthLoans(initialMonthLoans)
  }, [date, monthName, year, monthKey])

  useEffect(() => {
    checkCollectionCompleted(monthPayments)
  }, [monthPayments, members])

  // ===== UI Handlers =====
  const handleMuddalChange = (memberId, amount) => {
    setMuddalInputs(prev => ({ ...prev, [memberId]: parseInt(amount) || 0 }))
  }
  
  const handlePenaltyChange = (memberId, amount) => {
    setPenaltyInputs(prev => ({ ...prev, [memberId]: parseInt(amount) || 0 }))
  }
  
  const handleBorrowAmountChange = (memberId, amount) => {
    setBorrowAmounts(prev => ({ ...prev, [memberId]: parseInt(amount) || 0 }))
  }

  const togglePenalty = (memberId) => {
    setMembers(members.map(m => m.id === memberId ? { ...m, penaltyApplied: !m.penaltyApplied } : m))
  }

  // ===== Search Functionality =====
  const searchedMembers = useMemo(() => {
    if (!searchTerm.trim()) return members
    return members.filter(member => 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.serialNo.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [members, searchTerm])

  const searchedCollectionMembers = useMemo(() => {
    if (!collectionSearchTerm.trim()) return members
    return members.filter(member => 
      member.name.toLowerCase().includes(collectionSearchTerm.toLowerCase()) ||
      member.serialNo.toLowerCase().includes(collectionSearchTerm.toLowerCase())
    )
  }, [members, collectionSearchTerm])

  // ===== Borrowing Search Functionality =====
  useEffect(() => {
    if (!borrowingSearchTerm.trim()) {
      setSearchedBorrowingMembers([])
    } else {
      const filtered = members.filter(member => 
        member.name.toLowerCase().includes(borrowingSearchTerm.toLowerCase()) ||
        member.serialNo.toLowerCase().includes(borrowingSearchTerm.toLowerCase())
      )
      setSearchedBorrowingMembers(filtered)
    }
  }, [borrowingSearchTerm, members])

  // ===== Get Members with Loans for Current Month =====
  const getMembersWithMonthLoans = useMemo(() => {
    return members.filter(member => 
      monthLoans[member.id] && monthLoans[member.id].length > 0
    )
  }, [members, monthLoans])

  // ===== Filters & Status =====
  const filteredMembers = useMemo(() => {
    const membersToFilter = collectionSearchTerm.trim() ? searchedCollectionMembers : members
    
    return membersToFilter.filter(member => {
      if (filter === 'all') return true
      if (filter === 'borrower') return member.isBorrower
      if (filter === 'non-borrower') return !member.isBorrower
      if (filter === 'penalty') return member.penaltyApplied
      if (filter === 'can-borrow') return true
      return true
    })
  }, [members, searchedCollectionMembers, collectionSearchTerm, filter])

  // ===== Get Display Members with Correct Serial Numbers =====
  const getDisplayMembers = (membersList) => {
    return membersList.map((member) => ({
      ...member,
      displaySerialNo: member.serialNo
    }))
  }

  const displayFilteredMembers = useMemo(() => 
    getDisplayMembers(filteredMembers), 
    [filteredMembers]
  )

  const displaySearchedMembers = useMemo(() => 
    getDisplayMembers(searchedMembers), 
    [searchedMembers]
  )

  const displayMembers = useMemo(() => 
    getDisplayMembers(members), 
    [members]
  )

  // ===== Get Display Members for Borrowing Table =====
  const displayBorrowingMembers = useMemo(() => {
    if (readOnlyMode) {
      return getDisplayMembers(getMembersWithMonthLoans)
    } else {
      if (borrowingSearchTerm.trim()) {
        return getDisplayMembers(searchedBorrowingMembers)
      } else {
        const membersWithCurrentLoans = getDisplayMembers(getMembersWithMonthLoans)
        const membersWithPendingBorrowals = members.filter(member => 
          borrowAmounts[member.id] > 0 && !getMembersWithMonthLoans.some(loanMember => loanMember.id === member.id)
        )
        return [...membersWithCurrentLoans, ...getDisplayMembers(membersWithPendingBorrowals)]
      }
    }
  }, [searchedBorrowingMembers, borrowingSearchTerm, readOnlyMode, getMembersWithMonthLoans, members, borrowAmounts])

  // ===== Calculate Total Borrowing for Member in Current Month =====
  const getTotalBorrowingThisMonth = (memberId) => {
    if (!monthLoans[memberId]) return 0
    return monthLoans[memberId].reduce((sum, loan) => sum + loan.amount, 0)
  }

  // ===== Get All Guarantors for Member in Current Month =====
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

  // ===== Get Previous Principal (before this month's borrowing) =====
  const getPreviousPrincipal = (member) => {
    const totalBorrowingThisMonth = getTotalBorrowingThisMonth(member.id)
    return Math.max(0, (member.currentPrincipal || 0) - totalBorrowingThisMonth)
  }

  // ===== Guarantor Management =====
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
      m.name.toLowerCase() === guarantorName.toLowerCase() || 
      m.serialNo.toLowerCase() === guarantorName.toLowerCase()
    )
    if (!guarantorMember) return true
    
    let guarantorCount = 0
    Object.values(monthLoans).forEach(loans => {
      loans.forEach(loan => {
        if (loan.guarantors) {
          loan.guarantors.forEach(guarantor => {
            if (guarantor.trim() && 
                (guarantor.toLowerCase() === guarantorMember.name.toLowerCase() || 
                 guarantor.toLowerCase() === guarantorMember.serialNo.toLowerCase())) {
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
    const currentMember = members.find(m => m.id === memberId)
    return members.filter(member => 
      member.id !== memberId && 
      (member.name.toLowerCase().includes(input.toLowerCase()) || 
       member.serialNo.toLowerCase().includes(input.toLowerCase())) &&
      canBeGuarantor(memberId, member.name)
    ).slice(0, 5)
  }

  // ===== Payments =====
  const processPayment = (memberId, paymentMode = 'cash') => {
    if (readOnlyMode) return;

    const member = members.find(m => m.id === memberId)
    if (!member) return

    const paymentDetails = calculatePaymentDetails(member)
    const penaltyAmount = calculatePenalty(member)
    const totalDue = paymentDetails.total + penaltyAmount

    // Store ALL payment details
    const paymentData = {
      paid: true,
      paidAmount: totalDue,
      penaltyAmount,
      muddalPaid: paymentDetails.muddalPaid,
      interestAmount: paymentDetails.interestAmount,
      shareAmount: SHARE_AMOUNT,
      paymentMode: paymentMode,
      ts: new Date().toISOString(),
      // Store calculated values
      calculatedTotal: totalDue,
      calculatedMuddal: paymentDetails.muddalPaid,
      calculatedPenalty: penaltyAmount
    }

    const updatedMembers = members.map(m => {
      if (m.id !== memberId) return m
      const updated = { ...m }

      if (m.isBorrower) {
        updated.currentPrincipal = paymentDetails.newPrincipal
      }

      updated.penaltyApplied = false
      return updated
    })

    setMembers(updatedMembers)

    setMonthPayments(prev => ({
      ...prev,
      [memberId]: paymentData
    }))

    // Don't reset inputs for display - keep them for showing in table
    setMuddalInputs(prev => ({ ...prev, [memberId]: paymentData.calculatedMuddal || 0 }))
    setPenaltyInputs(prev => ({ ...prev, [memberId]: paymentData.calculatedPenalty || 0 }))
    setShowPaymentMode(null)

    alert(`Payment processed successfully via ${paymentMode === 'cash' ? 'Cash' : 'Online'}!\nTotal collected: ₹${totalDue}`)
  }

  // ===== Revert Payment =====
  const revertPayment = (memberId) => {
    if (readOnlyMode) return;

    const member = members.find(m => m.id === memberId)
    if (!member) return

    const updatedMembers = members.map(m => {
      if (m.id !== memberId) return m
      const updated = { ...m }

      if (m.isBorrower) {
        const payment = monthPayments[memberId]
        if (payment && payment.muddalPaid) {
          updated.currentPrincipal = (m.currentPrincipal || 0) + payment.muddalPaid
        }
      }

      return updated
    })

    setMembers(updatedMembers)

    setMonthPayments(prev => {
      const newPayments = { ...prev }
      delete newPayments[memberId]
      return newPayments
    })

    // Reset inputs when reverting
    setMuddalInputs(prev => ({ ...prev, [memberId]: 0 }))
    setPenaltyInputs(prev => ({ ...prev, [memberId]: 0 }))
    setShowPaymentMode(null)

    alert(`Payment reverted successfully for ${member.name}`)
  }

  const markAllAsPaid = () => {
    if (readOnlyMode) return;

    const updates = {}
    const updatedMembers = members.map(m => {
      const paymentDetails = calculatePaymentDetails(m)
      const penaltyAmount = calculatePenalty(m)
      const totalDue = paymentDetails.total + penaltyAmount

      const updated = { ...m }
      if (m.isBorrower) {
        updated.currentPrincipal = paymentDetails.newPrincipal
      }
      updated.penaltyApplied = false

      // Store all payment details
      updates[m.id] = { 
        paid: true, 
        paidAmount: totalDue, 
        penaltyAmount, 
        muddalPaid: paymentDetails.muddalPaid,
        interestAmount: paymentDetails.interestAmount,
        shareAmount: SHARE_AMOUNT,
        calculatedTotal: totalDue,
        calculatedMuddal: paymentDetails.muddalPaid,
        calculatedPenalty: penaltyAmount,
        paymentMode: 'cash',
        ts: new Date().toISOString() 
      }
      
      // Update inputs to preserve display
      setMuddalInputs(prev => ({ ...prev, [m.id]: paymentDetails.muddalPaid || 0 }))
      setPenaltyInputs(prev => ({ ...prev, [m.id]: penaltyAmount || 0 }))
      
      return updated
    })

    setMembers(updatedMembers)
    setMonthPayments(prev => ({ ...prev, ...updates }))
  }

  // ===== Borrowings =====
  const processSingleBorrowing = (memberId) => {
    if (readOnlyMode) return;

    const borrowAmount = borrowAmounts[memberId] || 0
    if (borrowAmount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    const memberGuarantors = guarantors[memberId] || ['', '']
    const validGuarantors = memberGuarantors.filter(g => g.trim() !== '')
    
    for (const guarantorName of validGuarantors) {
      if (!canBeGuarantor(memberId, guarantorName)) {
        alert(`Guarantor "${guarantorName}" cannot guarantee more than 2 loans`)
        return
      }
    }

    const updatedMembers = members.map(member => {
      if (member.id === memberId) {
        const updatedMember = {
          ...member,
          isBorrower: true,
          borrowedAmount: (member.borrowedAmount || 0) + borrowAmount,
          currentPrincipal: (member.currentPrincipal || 0) + borrowAmount,
        }
        
        const newLoanRecord = { 
          date: new Date().toISOString().split('T')[0], 
          amount: borrowAmount, 
          type: member.isBorrower ? 'additional' : 'initial',
          guarantors: validGuarantors
        }
        updatedMember.loanHistory = [...(member.loanHistory || []), newLoanRecord]
        return updatedMember
      }
      return member
    })

    setMonthLoans(prev => {
      const currentLoans = prev[memberId] || []
      return {
        ...prev,
        [memberId]: [
          ...currentLoans,
          {
            amount: borrowAmount,
            guarantors: validGuarantors,
            date: new Date().toISOString().split('T')[0]
          }
        ]
      }
    })

    setMembers(updatedMembers)
    setBorrowAmounts(prev => ({ ...prev, [memberId]: 0 }))
    setGuarantors(prev => ({ ...prev, [memberId]: ['', ''] }))

    const member = updatedMembers.find(m => m.id === memberId)
    alert(`Loan of ₹${borrowAmount.toLocaleString()} processed successfully for ${member?.name || 'member'}`)
  }

  const processAllBorrowings = () => {
    if (readOnlyMode) return;

    let hasBorrowings = false
    const newMonthLoans = { ...monthLoans }
    const updatedMembers = members.map(member => {
      const borrowAmount = borrowAmounts[member.id] || 0
      if (borrowAmount > 0) {
        hasBorrowings = true
        const memberGuarantors = guarantors[member.id] || ['', '']
        const validGuarantors = memberGuarantors.filter(g => g.trim() !== '')
        
        for (const guarantorName of validGuarantors) {
          if (!canBeGuarantor(member.id, guarantorName)) {
            alert(`Guarantor "${guarantorName}" cannot guarantee more than 2 loans for ${member.name}`)
            return member
          }
        }

        if (!newMonthLoans[member.id]) {
          newMonthLoans[member.id] = []
        }
        newMonthLoans[member.id].push({
          amount: borrowAmount,
          guarantors: validGuarantors,
          date: new Date().toISOString().split('T')[0]
        })

        const updatedMember = {
          ...member,
          isBorrower: true,
          borrowedAmount: (member.borrowedAmount || 0) + borrowAmount,
          currentPrincipal: (member.currentPrincipal || 0) + borrowAmount,
        }
        
        const newLoanRecord = { 
          date: new Date().toISOString().split('T')[0], 
          amount: borrowAmount, 
          type: member.isBorrower ? 'additional' : 'initial',
          guarantors: validGuarantors
        }
        updatedMember.loanHistory = [...(member.loanHistory || []), newLoanRecord]
        return updatedMember
      }
      return member
    })

    if (!hasBorrowings) {
      alert('Please enter borrowing amounts for at least one member')
      return
    }

    setMonthLoans(newMonthLoans)
    setMembers(updatedMembers)
    setBorrowAmounts({})
    setGuarantors({})
    
    alert('All borrowings processed successfully!')
  }

  // ===== Complete Transaction =====
  const handleCompleteTransaction = () => {
    const transactionData = {
      members: [...members],
      monthPayments: {...monthPayments},
      muddalInputs: {...muddalInputs},
      penaltyInputs: {...penaltyInputs},
      borrowAmounts: {...borrowAmounts},
      monthLoans: {...monthLoans},
      completedAt: new Date().toISOString()
    }

    setCompletedTransactions(prev => ({ ...prev, [monthKey]: transactionData }))
    setReadOnlyMode(true)
    alert('Transaction completed! The page is now in read-only mode.')
  }

  // ===== Dynamic Stats Calculation =====
  const calculateMonthStats = () => {
    const totalShareCollection = members.length * SHARE_AMOUNT
    const totalInterest = members.reduce((sum, m) => sum + (calculatePaymentDetails(m)?.interestAmount || 0), 0)
    const totalPenalties = members.reduce((sum, m) => sum + calculatePenalty(m), 0)
    const totalPaid = Object.values(monthPayments).reduce((sum, p) => sum + (p.paidAmount || 0), 0)
    const totalPrincipal = members.reduce((s, m) => s + (m.currentPrincipal || 0), 0)
    const totalBorrowed = members.reduce((s, m) => s + (m.borrowedAmount || 0), 0)
    const totalBorrowedThisMonth = Object.values(monthLoans).reduce((sum, loans) => 
      sum + loans.reduce((loanSum, loan) => loanSum + loan.amount, 0), 0
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

  const getCardClass = (cardType) => {
    const baseClass = 'rounded-lg shadow-md p-6 text-center cursor-pointer transition-all duration-200'
    if (filter === cardType) {
      switch (cardType) {
        case 'all': return `${baseClass} bg-blue-100 border-2 border-blue-500 transform scale-105`
        case 'borrower': return `${baseClass} bg-purple-100 border-2 border-purple-500 transform scale-105`
        case 'non-borrower': return `${baseClass} bg-green-100 border-2 border-green-500 transform scale-105`
        case 'penalty': return `${baseClass} bg-red-100 border-2 border-red-500 transform scale-105`
        case 'can-borrow': return `${baseClass} bg-orange-100 border-2 border-orange-500 transform scale-105`
        default: return `${baseClass} bg-white border-2 border-gray-300`
      }
    } else {
      return `${baseClass} bg-white border border-gray-200 hover:shadow-lg hover:border-gray-300`
    }
  }

  const getTextClass = (cardType) => {
    if (filter === cardType) {
      switch (cardType) {
        case 'all': return 'text-blue-700'
        case 'borrower': return 'text-purple-700'
        case 'non-borrower': return 'text-green-700'
        case 'penalty': return 'text-red-700'
        case 'can-borrow': return 'text-orange-700'
        default: return 'text-gray-700'
      }
    }
    return 'text-gray-700'
  }

  const getTabClass = (tabName) => {
    const baseClass = 'px-4 py-2 rounded-md font-medium transition-colors'
    return activeTab === tabName ? `${baseClass} bg-blue-600 text-white` : `${baseClass} bg-gray-200 text-gray-700 hover:bg-gray-300`
  }

  const getPaymentStatusClass = (member) => (hasMemberPaid(member) ? 'bg-green-50 border-l-4 border-green-400' : 'bg-white')

  // ===== Print Functionality =====
  const handlePrint = () => {
    setShowPrintPreview(true)
    setTimeout(() => {
      window.print()
      setTimeout(() => setShowPrintPreview(false), 500)
    }, 500)
  }

  // ===== PDF Export Functions =====
  const exportToPDF = async (tableType = 'collection') => {
    setIsGeneratingPDF(true)
    
    try {
      const pdfFrame = document.createElement('iframe')
      pdfFrame.style.display = 'none'
      document.body.appendChild(pdfFrame)
      
      const pdfWindow = pdfFrame.contentWindow
      const pdfDocument = pdfWindow.document
      
      // Write PDF content
      pdfDocument.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>शिवांजली फंड - ${monthData.name} ${monthData.year}</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 0.5cm;
            }
            
            body {
              font-family: 'Arial', sans-serif;
              margin: 0;
              padding: 0;
              background: white;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            .pdf-container {
              width: 100%;
              margin: 0;
              padding: 0;
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
            
            .logo {
              width: 80px;
              height: 80px;
              background: #2563eb;
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 8px;
              font-weight: bold;
              font-size: 12px;
              text-align: center;
            }
            
            .header-text {
              text-align: center;
              flex-grow: 1;
              margin: 0 20px;
            }
            
            .header-text h1 {
              margin: 0;
              font-size: 20px;
              color: #1e293b;
            }
            
            .header-text .subtitle {
              margin: 5px 0 0 0;
              font-size: 14px;
              color: #64748b;
            }
            
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 8px;
              margin-bottom: 15px;
            }
            
            .summary-item {
              border: 1px solid #cbd5e1;
              padding: 8px;
              text-align: center;
              border-radius: 4px;
            }
            
            .summary-label {
              font-size: 10px;
              font-weight: bold;
              color: #475569;
            }
            
            .summary-value {
              font-size: 12px;
              font-weight: bold;
              color: #1e293b;
            }
            
            .pdf-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 9px;
              margin-bottom: 20px;
              table-layout: fixed;
            }
            
            .pdf-table th {
              background: #f1f5f9;
              border: 1px solid #cbd5e1;
              padding: 6px 4px;
              text-align: center;
              font-weight: bold;
              color: #475569;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            .pdf-table td {
              border: 1px solid #cbd5e1;
              padding: 5px 3px;
              text-align: center;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            .paid-row {
              background: #f0fdf4 !important;
            }
            
            .page-number {
              text-align: center;
              font-size: 10px;
              color: #64748b;
              margin-top: 10px;
            }
            
            .page-break {
              page-break-after: always;
            }
          </style>
        </head>
        <body>
          <div class="pdf-container">
            ${tableType === 'collection' ? generateCollectionPDFPages() : generateBorrowingPDFPages()}
          </div>
        </body>
        </html>
      `)
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      pdfWindow.print()
      
      setTimeout(() => {
        document.body.removeChild(pdfFrame)
        setIsGeneratingPDF(false)
      }, 1000)
      
    } catch (error) {
      console.error('PDF generation failed:', error)
      setIsGeneratingPDF(false)
      alert('PDF generation failed. Please try again.')
    }
  }

  const generateCollectionPDFPages = () => {
    const memberChunks = chunkMembers(displayMembers, 30)
    const currentDate = getCurrentDate()
    
    return memberChunks.map((chunk, pageIndex) => `
      <div class="pdf-page ${pageIndex < memberChunks.length - 1 ? 'page-break' : ''}">
        <div class="pdf-header">
          <div class="header-content">
            <div class="logo">LOGO</div>
            <div class="header-text">
              <h1>शिवांजली फंड - संकलन अहवाल</h1>
              <p class="subtitle">महिना: ${monthData.name} ${monthData.year}</p>
              <p class="subtitle">तारीख: ${currentDate}</p>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 12px; font-weight: bold;">पृष्ठ ${pageIndex + 1} / ${memberChunks.length}</div>
            </div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-label">एकूण भाग रक्कम</div>
            <div class="summary-value">₹${monthStats.totalShareCollection.toLocaleString()}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">एकूण व्याज</div>
            <div class="summary-value">₹${monthStats.totalInterest.toLocaleString()}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">एकूण दंड</div>
            <div class="summary-value">₹${monthStats.totalPenalties.toLocaleString()}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">एकूण संकलित</div>
            <div class="summary-value" style="color: #059669;">₹${monthStats.totalPaid.toLocaleString()}</div>
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
              const isPaid = hasMemberPaid(member)
              const paymentDetails = calculatePaymentDetails(member)
              const penaltyAmount = isPaid ? (monthPayments[member.id]?.calculatedPenalty || monthPayments[member.id]?.penaltyAmount || 0) : calculatePenalty(member)
              const totalAmount = isPaid ? (monthPayments[member.id]?.calculatedTotal || monthPayments[member.id]?.paidAmount || 0) : paymentDetails.total + penaltyAmount
              const muddalPaid = isPaid ? (monthPayments[member.id]?.calculatedMuddal || monthPayments[member.id]?.muddalPaid || 0) : 0
              const paymentMode = monthPayments[member.id]?.paymentMode
              
              return `
                <tr class="${isPaid ? 'paid-row' : ''}">
                  <td>${member.serialNo}</td>
                  <td style="text-align: left; padding-left: 8px;">
                    <div style="font-weight: bold;">${member.name}</div>
                    <div style="font-size: 8px; color: #64748b;">${member.phone}</div>
                  </td>
                  <td>₹${SHARE_AMOUNT}</td>
                  <td>${member.isBorrower ? `₹${member.currentPrincipal?.toLocaleString()}` : '-'}</td>
                  <td>${muddalPaid > 0 ? `₹${muddalPaid.toLocaleString()}` : (isPaid ? '0' : '0')}</td>
                  <td>${member.isBorrower ? `₹${paymentDetails.interestAmount.toLocaleString()}` : '-'}</td>
                  <td>${penaltyAmount > 0 ? `₹${penaltyAmount.toLocaleString()}` : '-'}</td>
                  <td style="font-weight: bold;">₹${totalAmount.toLocaleString()}</td>
                  <td>${member.isBorrower ? `₹${paymentDetails.newPrincipal.toLocaleString()}` : '-'}</td>
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
              <div class="logo">LOGO</div>
              <div class="header-text">
                <h1>शिवांजली फंड - कर्ज अहवाल</h1>
                <p class="subtitle">महिना: ${monthData.name} ${monthData.year}</p>
                <p class="subtitle">तारीख: ${currentDate}</p>
              </div>
            </div>
          </div>
          <div style="text-align: center; padding: 50px;">
            <h3>${monthData.name} ${monthData.year} या महिन्यासाठी कोणतेही कर्ज प्रक्रियेस नाही</h3>
          </div>
        </div>
      `
    }
    
    return memberChunks.map((chunk, pageIndex) => `
      <div class="pdf-page ${pageIndex < memberChunks.length - 1 ? 'page-break' : ''}">
        <div class="pdf-header">
          <div class="header-content">
            <div class="logo">LOGO</div>
            <div class="header-text">
              <h1>शिवांजली फंड - कर्ज अहवाल</h1>
              <p class="subtitle">महिना: ${monthData.name} ${monthData.year}</p>
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
            <div class="summary-value">${membersWithLoans.filter(m => !m.isBorrower || m.loanHistory.length === 1).length}</div>
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
              const totalBorrowingThisMonth = getTotalBorrowingThisMonth(member.id)
              const previousPrincipal = getPreviousPrincipal(member)
              const allGuarantors = getAllGuarantorsThisMonth(member.id)
              
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

  if (!monthData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">लोड होत आहे...</p>
        </div>
      </div>
    )
  }

  const headerSub = () => {
    const idx = monthIndexFromName(monthData.name)
    const pretty = idx !== null ? `${String(25).padStart(2,'0')} ${monthData.name}` : '25th'
    return pretty
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <style jsx>{`
        .collection-table {
          table-layout: fixed;
          width: 100%;
        }
        .collection-table th,
        .collection-table td {
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .borrowing-table {
          table-layout: fixed;
          width: 100%;
        }
        .borrowing-table th,
        /* Fix for guarantor dropdown */
        .borrowing-table td {
          position: relative;
          overflow: visible !important;
        }
        .guarantor-dropdown-container {
          position: relative;
        }
        .guarantor-dropdown {
          position: absolute;
          z-index: 1000;
          width: 250px;
          margin-top: 2px;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 0.375rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          max-height: 200px;
          overflow-y: auto;
          left: 0;
        }
        .guarantor-suggestion {
          padding: 8px 12px;
          cursor: pointer;
          border-bottom: 1px solid #f3f4f6;
        }
        .guarantor-suggestion:hover {
          background-color: #eff6ff;
        }
        .guarantor-suggestion:last-child {
          border-bottom: none;
        }
      `}</style>
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {monthData.name} {monthData.year} - निधी संकलन
                {readOnlyMode && <span className="ml-2 text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded">फक्त वाचन</span>}
              </h1>
              <span className="text-gray-600 text-sm bg-gray-100 px-3 py-1 rounded-full">
                {headerSub()}
              </span>
              {collectionCompleted && (
                <span className="text-green-600 text-sm bg-green-100 px-3 py-1 rounded-full">✓ संकलन पूर्ण</span>
              )}
            </div>
            <Link href="/dashboard" className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">← डॅशबोर्ड वर परत</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards - Marathi */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={getCardClass('all')} onClick={() => setFilter('all')}>
            <h3 className={`text-lg font-semibold mb-2 ${getTextClass('all')}`}>सर्व सदस्य</h3>
            <p className={`text-3xl font-bold ${getTextClass('all')}`}>{members.length}</p>
          </div>

          <div className={getCardClass('borrower')} onClick={() => setFilter('borrower')}>
            <h3 className={`text-lg font-semibold mb-2 ${getTextClass('borrower')}`}>कर्जदार</h3>
            <p className={`text-3xl font-bold ${getTextClass('borrower')}`}>{members.filter(m => m.isBorrower).length}</p>
          </div>

          <div className={getCardClass('non-borrower')} onClick={() => setFilter('non-borrower')}>
            <h3 className={`text-lg font-semibold mb-2 ${getTextClass('non-borrower')}`}>कर्ज नसलेले</h3>
            <p className={`text-3xl font-bold ${getTextClass('non-borrower')}`}>{members.filter(m => !m.isBorrower).length}</p>
          </div>

          <div className={getCardClass('penalty')} onClick={() => setFilter('penalty')}>
            <h3 className={`text-lg font-semibold mb-2 ${getTextClass('penalty')}`}>दंड प्रकरणे</h3>
            <p className={`text-3xl font-bold ${getTextClass('penalty')}`}>{members.filter(m => m.penaltyApplied).length}</p>
          </div>
        </div>

        {/* Collection Status Banner */}
        {!collectionCompleted && activeTab === 'collection' && !readOnlyMode && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 a1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">संकलन प्रगतीपथावर</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>काही सदस्यांनी अद्याप त्यांचे पेमेंट पूर्ण केले नाहीत. पेमेंट केलेले सदस्य हिरव्या रंगात हायलाइट केले आहेत.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {readOnlyMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 a1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">फक्त वाचन मोड</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>हा व्यवहार पूर्ण झाला आहे. सर्व डेटा आता संदर्भासाठी फक्त वाचन मोडमध्ये आहे.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-4 mb-6">
          <button className={getTabClass('collection')} onClick={() => setActiveTab('collection')}>संकलन तपशील</button>
          <button className={getTabClass('borrowing')} onClick={() => setActiveTab('borrowing')}>कर्ज व्यवस्थापन</button>
        </div>

        {/* Collection Details Table */}
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                      isGeneratingPDF 
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

            {/* Collection Search Bar */}
            {!readOnlyMode && (
              <div className="px-6 py-4 bg-gray-50 border-b">
                <div className="max-w-md">
                  <label htmlFor="collectionSearch" className="block text-sm font-medium text-gray-700 mb-2">नाव किंवा अनुक्रमांकाने सदस्य शोधा</label>
                  <input
                    type="text"
                    id="collectionSearch"
                    value={collectionSearchTerm}
                    onChange={(e) => setCollectionSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="नाव किंवा अनुक्रमांक प्रविष्ट करा (उदा., MBR001)"
                  />
                  {collectionSearchTerm && (
                    <p className="text-sm text-gray-600 mt-2">${searchedCollectionMembers.length} सदस्य(सदस्य) सापडले</p>
                  )}
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="collection-table min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20 whitespace-nowrap">सभा. क्र</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-48 whitespace-nowrap">भागधारकाचे नाव</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20 whitespace-nowrap">भाग रक्कम</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28 whitespace-nowrap">कर्ज</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24 whitespace-nowrap">मुद्दल</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20 whitespace-nowrap">व्याज</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28 whitespace-nowrap">दंड</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20 whitespace-nowrap">एकूण</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32 whitespace-nowrap">शिल्लक कर्ज</th>
                    {!readOnlyMode && (
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32 whitespace-nowrap">क्रिया</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayFilteredMembers.length > 0 ? (
                    displayFilteredMembers.map((member) => {
                      const paymentDetails = calculatePaymentDetails(member)
const penaltyAmount = calculatePenalty(member)
const isPaid = hasMemberPaid(member)

// FIX: If paid → use stored total. If unpaid → calculate fresh.
const totalAmount = isPaid
  ? (monthPayments[member.id]?.calculatedTotal ||
     monthPayments[member.id]?.paidAmount ||
     0)
  : (paymentDetails.total + penaltyAmount)

                      const remainingPrincipal = paymentDetails.newPrincipal
                      const paymentMode = monthPayments[member.id]?.paymentMode

                      return (
                        <tr key={member.id} className={`hover:bg-gray-50 transition-colors ${getPaymentStatusClass(member)}`}>
                          <td className="px-3 py-4 text-sm text-gray-900 font-medium w-20 text-center">
                            {member.displaySerialNo}
                          </td>
                          
                          <td className="px-3 py-4 w-48 min-w-0">
                            <div className="text-center">
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.phone}</div>
                              {member.isBorrower && member.loanHistory && (
                                <div className="text-xs text-gray-400 mt-1">एकूण: ₹{member.borrowedAmount?.toLocaleString()}</div>
                              )}
                            </div>
                          </td>
                          
                          <td className="px-3 py-4 text-sm text-gray-900 w-20 text-center">
                            ₹{SHARE_AMOUNT}
                          </td>
                          
                          <td className="px-3 py-4 text-sm text-gray-900 w-28 text-center">
                            {member.isBorrower ? (
                              <div>
                                <div>₹{member.currentPrincipal?.toLocaleString()}</div>
                              </div>
                            ) : '-'}
                          </td>
                          
                          <td className="px-3 py-4 w-24 text-center min-w-0">
                            {readOnlyMode ? (
                              isPaid ? (
                                <div>
                                  <div className="font-semibold text-green-600">₹{(monthPayments[member.id]?.calculatedMuddal || monthPayments[member.id]?.muddalPaid || 0).toLocaleString()}</div>
                                </div>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )
                            ) : isPaid ? (
                              <div>
                                <div className="font-semibold text-green-600">₹{(monthPayments[member.id]?.calculatedMuddal || monthPayments[member.id]?.muddalPaid || 0).toLocaleString()}</div>
                              </div>
                            ) : (
                              <input
                                type="number"
                                value={muddalInputs[member.id] || ''}
                                onChange={(e) => handleMuddalChange(member.id, e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="0"
                                disabled={isPaid}
                              />
                            )}
                          </td>
                          
                          <td className="px-3 py-4 text-sm text-gray-900 w-20 text-center">
                            {member.isBorrower ? (
                              <div>
                                <div>₹{paymentDetails.interestAmount}</div>
                              </div>
                            ) : '-'}
                          </td>
                          
                          <td className="px-3 py-4 w-28 text-center min-w-0">
                            {readOnlyMode ? (
                              isPaid ? (
                                monthPayments[member.id]?.calculatedPenalty || monthPayments[member.id]?.penaltyAmount > 0 ? (
                                  <div className="font-semibold text-red-600">₹{(monthPayments[member.id]?.calculatedPenalty || monthPayments[member.id]?.penaltyAmount || 0).toLocaleString()}</div>
                                ) : (
                                  <span className="text-gray-500">-</span>
                                )
                              ) : (
                                <span className="text-gray-500">-</span>
                              )
                            ) : isPaid ? (
                              monthPayments[member.id]?.calculatedPenalty || monthPayments[member.id]?.penaltyAmount > 0 ? (
                                <div className="font-semibold text-red-600">₹{(monthPayments[member.id]?.calculatedPenalty || monthPayments[member.id]?.penaltyAmount || 0).toLocaleString()}</div>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )
                            ) : (
                              <div className="flex flex-col items-center space-y-1 min-w-0">
                                <button
                                  onClick={() => togglePenalty(member.id)}
                                  className={`px-2 py-1 text-xs rounded w-full ${member.penaltyApplied ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}
                                  disabled={isPaid}
                                >
                                  {member.penaltyApplied ? 'दंड ✓' : 'दंड नाही'}
                                </button>
                                {member.penaltyApplied && (
                                  <input
                                    type="number"
                                    value={penaltyInputs[member.id] !== undefined && penaltyInputs[member.id] !== '' 
                                           ? penaltyInputs[member.id] 
                                           : ''}
                                    onChange={(e) => handlePenaltyChange(member.id, e.target.value)}
                                    className="w-full px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-black text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    placeholder={calculatePenalty(member).toString()}
                                    disabled={isPaid}
                                  />
                                )}
                              </div>
                            )}
                          </td>
                          
                          <td className="px-3 py-4 text-sm font-semibold text-gray-900 w-20 text-center">
                            ₹{totalAmount.toLocaleString()}
                          </td>
                          
                          <td className="px-3 py-4 text-sm text-gray-900 w-32 text-center min-w-0">
                            {member.isBorrower ? (
                              <div>
                                <div className="font-semibold">₹{remainingPrincipal.toLocaleString()}</div>
                                {member.currentPrincipal > remainingPrincipal && (
                                  <div className="text-xs text-green-600">₹{(member.currentPrincipal - remainingPrincipal).toLocaleString()} ने कमी</div>
                                )}
                              </div>
                            ) : '-'}
                          </td>
                          
                          {!readOnlyMode && (
                            <td className="px-3 py-4 w-32 text-center min-w-0">
                              <div className="flex flex-col space-y-2 items-center">
                                {!isPaid ? (
                                  showPaymentMode === member.id ? (
                                    <div className="flex space-x-1">
                                      <button
                                        onClick={() => processPayment(member.id, 'cash')}
                                        className="flex-1 px-2 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 text-xs"
                                        title="रोख पेमेंट"
                                      >
                                        रोख
                                      </button>
                                      <button
                                        onClick={() => processPayment(member.id, 'online')}
                                        className="flex-1 px-2 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 text-xs"
                                        title="ऑनलाइन पेमेंट"
                                      >
                                        ऑनलाइन
                                      </button>
                                      <button
                                        onClick={() => setShowPaymentMode(null)}
                                        className="px-2 py-2 text-sm rounded-md bg-gray-600 text-white hover:bg-gray-700 text-xs"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setShowPaymentMode(member.id)}
                                      className="w-full px-3 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700"
                                    >
                                      पेमेंट करा
                                    </button>
                                  )
                                ) : (
                                  <button
                                    onClick={() => revertPayment(member.id)}
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
                    })
                  ) : (
                    <tr>
                      <td colSpan={readOnlyMode ? "9" : "10"} className="px-6 py-8 text-center">
                        <div className="text-gray-500">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="mt-2 text-lg font-medium">कोणतेही सदस्य सापडले नाहीत</p>
                          <p className="text-sm">आपला फिल्टर किंवा शोध संज्ञा बदलण्याचा प्रयत्न करा</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Borrowing Management Table */}
        {activeTab === 'borrowing' && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">कर्ज व्यवस्थापन</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {readOnlyMode ? (
                      "फक्त पहाण्यासाठी - व्यवहार पूर्ण झाला"
                    ) : (
                      "कर्ज प्रक्रियेसाठी नाव किंवा अनुक्रमांकाने सदस्य शोधा. फक्त शोधलेले सदस्य दर्शविले जातील."
                    )}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {!readOnlyMode && (
                    <button onClick={processAllBorrowings} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">सर्व प्रक्रिया करा</button>
                  )}
                  <button 
                    onClick={() => exportToPDF('borrowing')} 
                    disabled={isGeneratingPDF}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                      isGeneratingPDF 
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

            {!readOnlyMode && (
              <div className="px-6 py-4 bg-gray-50 border-b">
                <div className="max-w-md">
                  <label htmlFor="borrowingSearch" className="block text-sm font-medium text-gray-700 mb-2">नाव किंवा अनुक्रमांकाने सदस्य शोधा</label>
                  <input
                    type="text"
                    id="borrowingSearch"
                    value={borrowingSearchTerm}
                    onChange={(e) => setBorrowingSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="नाव किंवा अनुक्रमांक प्रविष्ट करा (उदा., MBR001)"
                  />
                  {borrowingSearchTerm && (
                    <p className="text-sm text-gray-600 mt-2">${searchedBorrowingMembers.length} सदस्य(सदस्य) सापडले</p>
                  )}
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="borrowing-table min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20 whitespace-nowrap">सभा. क्र</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-48 whitespace-nowrap">भागधारकाचे नाव</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32 whitespace-nowrap">मागील कर्ज</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40 whitespace-nowrap">यावेळी घेतलेले कर्ज</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-64 whitespace-nowrap">जामीन</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32 whitespace-nowrap">नवीन कर्ज शिल्लक</th>
                    {!readOnlyMode && (
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24 whitespace-nowrap">क्रिया</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(readOnlyMode ? getMembersWithMonthLoans : displayBorrowingMembers).map((member) => {
                    const borrowAmount = borrowAmounts[member.id] || ''
                    const totalBorrowingThisMonth = getTotalBorrowingThisMonth(member.id)
                    const previousPrincipal = getPreviousPrincipal(member)
                    const allGuarantors = getAllGuarantorsThisMonth(member.id)
                    const newPrincipal = (member.currentPrincipal || 0) + (parseInt(borrowAmount) || 0)
                    const memberGuarantors = guarantors[member.id] || ['', '']

                    return (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 w-20 text-center font-medium">
                          {member.displaySerialNo}
                        </td>
                        <td className="px-3 py-4 w-48 min-w-0">
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.phone}</div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${member.isBorrower ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                              {member.isBorrower ? 'विद्यमान कर्जदार' : 'नवीन कर्जदार'}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900 w-32 text-center">
                          ₹{previousPrincipal.toLocaleString()}
                        </td>
                        <td className="px-3 py-4 w-40 min-w-0">
                          {readOnlyMode ? (
                            totalBorrowingThisMonth > 0 ? (
                              <div className="text-center">
                                <div className="font-semibold text-green-600">
                                  ₹{totalBorrowingThisMonth.toLocaleString()}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )
                          ) : (
                            <div className="space-y-2">
                              <input
                                type="number"
                                value={borrowAmount}
                                onChange={(e) => handleBorrowAmountChange(member.id, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="रक्कम प्रविष्ट करा"
                              />
                              {totalBorrowingThisMonth > 0 && (
                                <div className="text-xs text-green-600">
                                  या महिन्यात आधीच कर्ज: ₹{totalBorrowingThisMonth.toLocaleString()}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-4 w-64 min-w-0">
                          {readOnlyMode ? (
                            allGuarantors.length > 0 ? (
                              <div className="space-y-1 text-center">
                                {allGuarantors.map((guarantor, idx) => (
                                  <div key={idx} className="text-blue-600 text-sm">{guarantor}</div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-500">जामीन नाही</span>
                            )
                          ) : (
                            <div className="space-y-2">
                              {[0, 1].map((guarantorIndex) => {
                                const dropdownKey = `${member.id}-${guarantorIndex}`
                                const suggestions = getGuarantorSuggestions(member.id, memberGuarantors[guarantorIndex])
                                
                                return (
                                  <div key={guarantorIndex} className="guarantor-dropdown-container">
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="text"
                                        value={memberGuarantors[guarantorIndex]}
                                        onChange={(e) => handleGuarantorChange(member.id, guarantorIndex, e.target.value)}
                                        onFocus={() => setActiveGuarantorDropdown(dropdownKey)}
                                        className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-black text-sm"
                                        placeholder={`जामीन ${guarantorIndex + 1} (पर्यायी)`}
                                      />
                                      <button 
                                        type="button" 
                                        onClick={() => toggleGuarantorDropdown(member.id, guarantorIndex)} 
                                        className="px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm transition-colors"
                                      >
                                        ↓
                                      </button>
                                    </div>
                                    {activeGuarantorDropdown === dropdownKey && suggestions.length > 0 && (
                                      <div className="guarantor-dropdown">
                                        {suggestions.map((suggestion) => (
                                          <div 
                                            key={suggestion.id} 
                                            className="guarantor-suggestion" 
                                            onClick={() => handleGuarantorSelect(member.id, guarantorIndex, suggestion.name)}
                                          >
                                            <div className="font-medium text-gray-700">{suggestion.name}</div>
                                            <div className="text-xs text-gray-500">{suggestion.serialNo}</div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {activeGuarantorDropdown === dropdownKey && suggestions.length === 0 && memberGuarantors[guarantorIndex] && (
                                      <div className="guarantor-dropdown">
                                        <div className="guarantor-suggestion text-gray-500 text-center">
                                          कोणतेही सदस्य सापडले नाहीत
                                        </div>
                                      </div>
                                    )}
                                    {memberGuarantors[guarantorIndex] && !canBeGuarantor(member.id, memberGuarantors[guarantorIndex]) && (
                                      <p className="text-xs text-red-600 mt-1">या जामीनकडे आधीच २ हमी आहेत</p>
                                    )}
                                  </div>
                                )
                              })}
                              {allGuarantors.length > 0 && (
                                <div className="text-xs text-blue-600 mt-1">
                                  विद्यमान जामीन: {allGuarantors.join(', ')}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900 w-32 text-center">
                          <div className="font-semibold">₹{newPrincipal.toLocaleString()}</div>
                          {borrowAmount > 0 && !readOnlyMode && (
                            <div className="text-xs text-green-600">+₹{parseInt(borrowAmount).toLocaleString()}</div>
                          )}
                        </td>
                        {!readOnlyMode && (
                          <td className="px-3 py-4 w-24 text-center min-w-0">
                            <button 
                              onClick={() => processSingleBorrowing(member.id)} 
                              disabled={!borrowAmount || parseInt(borrowAmount) <= 0} 
                              className={`px-3 py-2 text-sm rounded-md w-full ${
                                borrowAmount && parseInt(borrowAmount) > 0 
                                  ? 'bg-blue-600 text-white hover:bg-blue-700 transition-colors' 
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
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
              {!readOnlyMode && borrowingSearchTerm && displayBorrowingMembers.length === 0 && (
                <div className="px-6 py-8 text-center">
                  <div className="text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="mt-2 text-lg font-medium">कोणतेही सदस्य सापडले नाहीत</p>
                    <p className="text-sm">भिन्न नाव किंवा अनुक्रमांकासह शोधण्याचा प्रयत्न करा</p>
                  </div>
                </div>
              )}
              {readOnlyMode && getMembersWithMonthLoans.length === 0 && (
                <div className="px-6 py-8 text-center">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium">${monthData.name} ${monthData.year} साठी कोणतेही कर्ज डेटा उपलब्ध नाही</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!readOnlyMode && (
          <div className="mt-6 flex flex-wrap gap-4">
            {activeTab === 'collection' && (
              <>
                <button onClick={markAllAsPaid} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors">सर्व पेमेंट प्रक्रिया करा</button>
              </>
            )}
            <button onClick={handleCompleteTransaction} className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors">व्यवहार पूर्ण करा</button>
          </div>
        )}

        {/* Summary Section - Marathi */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">पेमेंट सारांश</h3>
            <div className="space-y-2 text-black">
              <div className="flex justify-between"><span>एकूण भाग संकलन:</span><span className="font-semibold">₹${monthStats.totalShareCollection.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>एकूण व्याज:</span><span className="font-semibold">₹${monthStats.totalInterest.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>एकूण दंड:</span><span className="font-semibold">₹${monthStats.totalPenalties.toLocaleString()}</span></div>
              <div className="flex justify-between border-t pt-2"><span>एकूण संकलित:</span><span className="font-semibold text-green-600">₹${monthStats.totalPaid.toLocaleString()}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">कर्जदार सारांश</h3>
            <div className="space-y-2 text-black">
              <div className="flex justify-between"><span>एकूण कर्जदार:</span><span>{members.filter(m => m.isBorrower).length}</span></div>
              <div className="flex justify-between"><span>या महिन्यातील एकूण कर्ज:</span><span className="font-semibold text-green-600">₹${monthStats.totalBorrowedThisMonth.toLocaleString()}</span></div>
              <div className="flex justify-between"><span>एकूण कर्ज शिल्लक:</span><span className="font-semibold">₹${monthStats.totalPrincipal.toLocaleString()}</span></div>
              <div className="flex justify-between border-t pt-2"><span>एकूण कर्ज (सर्व काळ):</span><span className="font-semibold">₹${monthStats.totalBorrowed.toLocaleString()}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">सिस्टम माहिती</h3>
            <div className="space-y-2 text-sm text-black">
              <div className="flex justify-between"><span>भाग रक्कम:</span><span>₹${SHARE_AMOUNT}</span></div>
              <div className="flex justify-between"><span>व्याज दर:</span><span>{INTEREST_RATE}%</span></div>
              <div className="flex justify-between"><span>दंड दर:</span><span>{PENALTY_RATE}% + ₹${BASE_PENALTY}</span></div>
              <div className="flex justify-between"><span>संकलन स्थिती:</span><span className={collectionCompleted ? 'text-green-600 font-semibold' : 'text-yellow-600 font-semibold'}>{collectionCompleted ? 'पूर्ण' : 'प्रगतीपथावर'}</span></div>
              <div className="flex justify-between"><span>मोड:</span><span className={readOnlyMode ? 'text-blue-600 font-semibold' : 'text-gray-600 font-semibold'}>{readOnlyMode ? 'फक्त वाचन' : 'संपादन करण्यायोग्य'}</span></div>
              <div className="flex justify-between"><span>महिना की:</span><span className="font-mono">{monthKey}</span></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}






































// // page.jsx
// 'use client'
// import { useEffect, useMemo, useState } from 'react'
// import { useRouter, useSearchParams } from 'next/navigation'
// import Link from 'next/link'
// import { useParams } from "next/navigation";
// import CollectionTab from './collection.jsx'
// import BorrowingTab from './borrowing.jsx'

// export default function MonthDetailsPage({ params }) {
//   const [monthData, setMonthData] = useState(null)
//   const [members, setMembers] = useState([])
//   const [editingMember, setEditingMember] = useState(null)
//   const [editingPenalty, setEditingPenalty] = useState(null)
//   const [filter, setFilter] = useState('all')
//   const [activeTab, setActiveTab] = useState('collection')
//   const [muddalInputs, setMuddalInputs] = useState({})
//   const [penaltyInputs, setPenaltyInputs] = useState({})
//   const [borrowAmounts, setBorrowAmounts] = useState({})
//   const [collectionCompleted, setCollectionCompleted] = useState(false)
//   const [monthPayments, setMonthPayments] = useState({})
//   const [readOnlyMode, setReadOnlyMode] = useState(false)
//   const [completedTransactions, setCompletedTransactions] = useState({})
//   const [searchTerm, setSearchTerm] = useState('')
//   const [collectionSearchTerm, setCollectionSearchTerm] = useState('')
//   const [guarantors, setGuarantors] = useState({})
//   const [activeGuarantorDropdown, setActiveGuarantorDropdown] = useState(null)
//   const [showPrintPreview, setShowPrintPreview] = useState(false)
//   const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
//   const [borrowingSearchTerm, setBorrowingSearchTerm] = useState('')
//   const [searchedBorrowingMembers, setSearchedBorrowingMembers] = useState([])
//   const [monthLoans, setMonthLoans] = useState({})
//   const [showPaymentMode, setShowPaymentMode] = useState(null)

//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const monthName = searchParams?.get('name') || ''
//   const year = searchParams?.get('year') || ''
//   const { date } = useParams();

//   // ===== Constants =====
//   const SHARE_AMOUNT = 1000
//   const INTEREST_RATE = 3
//   const PENALTY_RATE = 2
//   const BASE_PENALTY = 200

//   // ===== Helper Functions =====
//   const monthIndexFromName = (name) => {
//     const idx = ['january','february','march','april','may','june','july','august','september','october','november','december']
//       .indexOf(String(name || '').toLowerCase())
//     return idx >= 0 ? idx : null
//   }

//   const makeMonthKey = () => {
//     const idx = monthIndexFromName(monthName)
//     if (year && idx !== null) {
//       const mm = String(idx + 1).padStart(2, '0')
//       return `${year}-${mm}`
//     }
//     if (date) {
//       const d = new Date(date)
//       if (!isNaN(d)) {
//         return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
//       }
//     }
//     const now = new Date()
//     return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
//   }

//   const monthKey = useMemo(() => makeMonthKey(), [monthName, year, date])

//   // ===== Business Logic =====
//  // ===== Business Logic =====
// const calculatePaymentDetails = (member) => {
//   if (!member) return null

//   // Check if payment has been made
//   const payment = monthPayments[member.id]
//   const isPaid = payment?.paid

//   // Get muddal amount from inputs or payment record
//   const muddalPaid = isPaid ? (payment.muddalPaid || 0) : Math.max(0, parseInt(muddalInputs[member.id]) || 0)
  
//   // Current loan amount
//   const currentLoan = Math.max(0, member.currentPrincipal || 0)
  
//   // Remaining loan after muddal
//   const remainingLoan = Math.max(0, currentLoan - muddalPaid)

//   // For non-borrowers
//   if (!member.isBorrower) {
//     const penaltyAmount = isPaid ? (payment.penaltyAmount || 0) : calculatePenalty(member)
//     return {
//       shareAmount: SHARE_AMOUNT,
//       muddalPaid: muddalPaid,
//       interestAmount: 0,
//       totalCompulsory: SHARE_AMOUNT,
//       remainingLoan: 0,
//       total: SHARE_AMOUNT + muddalPaid + penaltyAmount,
//       penaltyAmount: penaltyAmount,
//       currentLoan: 0
//     }
//   }

//   // For borrowers
//   const interestAmount = Math.round(remainingLoan * (INTEREST_RATE / 100))
//   const penaltyAmount = isPaid ? (payment.penaltyAmount || 0) : calculatePenalty(member)
//   const total = SHARE_AMOUNT + muddalPaid + interestAmount + penaltyAmount

//   return {
//     shareAmount: SHARE_AMOUNT,
//     muddalPaid,
//     interestAmount,
//     totalCompulsory: SHARE_AMOUNT + interestAmount,
//     total,
//     remainingLoan: remainingLoan,
//     penaltyAmount: penaltyAmount,
//     currentLoan: currentLoan
//   }
// }

//   const calculatePenalty = (member) => {
//     if (!member) return 0
//     if (!member.penaltyApplied) return 0

//     let penalty = BASE_PENALTY
//     if (member.isBorrower) {
//       penalty += Math.round((member.currentPrincipal || 0) * (PENALTY_RATE / 100))
//     }

//     return penaltyInputs[member.id] !== undefined ? Math.max(0, parseInt(penaltyInputs[member.id]) || 0) : penalty
//   }

//   const checkCollectionCompleted = (mp = monthPayments) => {
//     const allPaid = members.length > 0 && members.every(m => mp[m.id]?.paid)
//     setCollectionCompleted(allPaid)
//   }

//   // ===== Initialization =====
//   const initializeMembers = () => {
//     return [
//       { id: 1, name: 'Alice Johnson', email: 'alice@email.com', phone: '123-456-7890', isBorrower: false, borrowedAmount: 0, currentPrincipal: 0, joinDate: '2024-01-15', penaltyApplied: false, loanHistory: [], serialNo: 'MBR001' },
//       { id: 2, name: 'Bob Smith', email: 'bob@email.com', phone: '123-456-7891', isBorrower: true, borrowedAmount: 100000, currentPrincipal: 100000, joinDate: '2024-01-20', penaltyApplied: false, loanHistory: [ { date: '2024-01-20', amount: 100000, type: 'initial', guarantors: [] } ], serialNo: 'MBR002' },
//       { id: 3, name: 'Charlie Brown', email: 'charlie@email.com', phone: '123-456-7892', isBorrower: true, borrowedAmount: 50000, currentPrincipal: 45000, joinDate: '2024-02-01', penaltyApplied: true, loanHistory: [ { date: '2024-02-01', amount: 50000, type: 'initial', guarantors: [] } ], serialNo: 'MBR003' },
//       { id: 4, name: 'David Wilson', email: 'david@email.com', phone: '123-456-7893', isBorrower: false, borrowedAmount: 0, currentPrincipal: 0, joinDate: '2024-02-15', penaltyApplied: false, loanHistory: [], serialNo: 'MBR004' },
//       { id: 5, name: 'Emma Davis', email: 'emma@email.com', phone: '123-456-7894', isBorrower: true, borrowedAmount: 75000, currentPrincipal: 70000, joinDate: '2024-03-01', penaltyApplied: false, loanHistory: [ { date: '2024-03-01', amount: 75000, type: 'initial', guarantors: [] } ], serialNo: 'MBR005' },
//       { id: 6, name: 'Frank Miller', email: 'frank@email.com', phone: '123-456-7895', isBorrower: false, borrowedAmount: 0, currentPrincipal: 0, joinDate: '2024-03-15', penaltyApplied: false, loanHistory: [], serialNo: 'MBR006' },
//       { id: 7, name: 'Grace Lee', email: 'grace@email.com', phone: '123-456-7896', isBorrower: false, borrowedAmount: 0, currentPrincipal: 0, joinDate: '2024-04-01', penaltyApplied: false, loanHistory: [], serialNo: 'MBR007' },
      
//     ]
//   }

//   useEffect(() => {
//     const sample = initializeMembers()
//     setMembers(sample)
//     setMonthData({ date, name: monthName, year })
    
//     const initialMonthLoans = {}
//     sample.forEach(member => {
//       if (member.loanHistory && member.loanHistory.length > 0) {
//         member.loanHistory.forEach(loan => {
//           try {
//             const loanDate = new Date(loan.date)
//             const loanMonthKey = `${loanDate.getFullYear()}-${String(loanDate.getMonth() + 1).padStart(2, '0')}`
//             if (loanMonthKey === monthKey) {
//               if (!initialMonthLoans[member.id]) {
//                 initialMonthLoans[member.id] = []
//               }
//               initialMonthLoans[member.id].push({
//                 amount: loan.amount,
//                 guarantors: loan.guarantors || [],
//                 date: loan.date
//               })
//             }
//           } catch (error) {
//             console.error('Error parsing loan date:', error)
//           }
//         })
//       }
//     })
//     setMonthLoans(initialMonthLoans)
//   }, [date, monthName, year, monthKey])

//   useEffect(() => {
//     checkCollectionCompleted(monthPayments)
//   }, [monthPayments, members])

//   // ===== Search Functionality =====
//   useEffect(() => {
//     if (!borrowingSearchTerm.trim()) {
//       setSearchedBorrowingMembers([])
//     } else {
//       const filtered = members.filter(member => 
//         member.name.toLowerCase().includes(borrowingSearchTerm.toLowerCase()) ||
//         member.serialNo.toLowerCase().includes(borrowingSearchTerm.toLowerCase())
//       )
//       setSearchedBorrowingMembers(filtered)
//     }
//   }, [borrowingSearchTerm, members])

//   // ===== Get Members with Loans for Current Month =====
//   const getMembersWithMonthLoans = useMemo(() => {
//     return members.filter(member => 
//       monthLoans[member.id] && monthLoans[member.id].length > 0
//     )
//   }, [members, monthLoans])

//   // ===== Calculate Total Borrowing for Member in Current Month =====
//   const getTotalBorrowingThisMonth = (memberId) => {
//     if (!monthLoans[memberId]) return 0
//     return monthLoans[memberId].reduce((sum, loan) => sum + loan.amount, 0)
//   }

//   // ===== Get All Guarantors for Member in Current Month =====
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

//   // ===== Get Previous Principal (before this month's borrowing) =====
//   const getPreviousPrincipal = (member) => {
//     const totalBorrowingThisMonth = getTotalBorrowingThisMonth(member.id)
//     return Math.max(0, (member.currentPrincipal || 0) - totalBorrowingThisMonth)
//   }

//   // ===== Payments =====
//   const markAllAsPaid = () => {
//     if (readOnlyMode) return;

//     const updates = {}
//     const updatedMembers = members.map(m => {
//       const paymentDetails = calculatePaymentDetails(m)
//       const totalDue = paymentDetails.total

//       const updated = { ...m }
//       if (m.isBorrower) {
//         updated.currentPrincipal = paymentDetails.newPrincipal
//       }
//       updated.penaltyApplied = false

//       updates[m.id] = { 
//         paid: true, 
//         paidAmount: totalDue, 
//         penaltyAmount: paymentDetails.penaltyAmount,
//         muddalPaid: paymentDetails.muddalPaid,
//         interestAmount: paymentDetails.interestAmount,
//         paymentMode: 'cash',
//         ts: new Date().toISOString() 
//       }
//       return updated
//     })

//     setMembers(updatedMembers)
//     setMonthPayments(prev => ({ ...prev, ...updates }))
//   }

//   // ===== Borrowings =====
//   const processAllBorrowings = () => {
//     if (readOnlyMode) return;

//     let hasBorrowings = false
//     const newMonthLoans = { ...monthLoans }
//     const updatedMembers = members.map(member => {
//       const borrowAmount = borrowAmounts[member.id] || 0
//       if (borrowAmount > 0) {
//         hasBorrowings = true
//         const memberGuarantors = guarantors[member.id] || ['', '']
//         const validGuarantors = memberGuarantors.filter(g => g.trim() !== '')
        
//         for (const guarantorName of validGuarantors) {
//           if (!canBeGuarantor(member.id, guarantorName)) {
//             alert(`Guarantor "${guarantorName}" cannot guarantee more than 2 loans for ${member.name}`)
//             return member
//           }
//         }

//         if (!newMonthLoans[member.id]) {
//           newMonthLoans[member.id] = []
//         }
//         newMonthLoans[member.id].push({
//           amount: borrowAmount,
//           guarantors: validGuarantors,
//           date: new Date().toISOString().split('T')[0]
//         })

//         const updatedMember = {
//           ...member,
//           isBorrower: true,
//           borrowedAmount: (member.borrowedAmount || 0) + borrowAmount,
//           currentPrincipal: (member.currentPrincipal || 0) + borrowAmount,
//         }
        
//         const newLoanRecord = { 
//           date: new Date().toISOString().split('T')[0], 
//           amount: borrowAmount, 
//           type: member.isBorrower ? 'additional' : 'initial',
//           guarantors: validGuarantors
//         }
//         updatedMember.loanHistory = [...(member.loanHistory || []), newLoanRecord]
//         return updatedMember
//       }
//       return member
//     })

//     if (!hasBorrowings) {
//       alert('Please enter borrowing amounts for at least one member')
//       return
//     }

//     setMonthLoans(newMonthLoans)
//     setMembers(updatedMembers)
//     setBorrowAmounts({})
//     setGuarantors({})
    
//     alert('All borrowings processed successfully!')
//   }

//   // ===== Helper function for canBeGuarantor (used in borrowing) =====
//   const canBeGuarantor = (memberId, guarantorName) => {
//     if (!guarantorName.trim()) return true
//     const guarantorMember = members.find(m => 
//       m.name.toLowerCase() === guarantorName.toLowerCase() || 
//       m.serialNo.toLowerCase() === guarantorName.toLowerCase()
//     )
//     if (!guarantorMember) return true
    
//     let guarantorCount = 0
//     Object.values(monthLoans).forEach(loans => {
//       loans.forEach(loan => {
//         if (loan.guarantors) {
//           loan.guarantors.forEach(guarantor => {
//             if (guarantor.trim() && 
//                 (guarantor.toLowerCase() === guarantorMember.name.toLowerCase() || 
//                  guarantor.toLowerCase() === guarantorMember.serialNo.toLowerCase())) {
//               guarantorCount++
//             }
//           })
//         }
//       })
//     })
    
//     return guarantorCount < 2
//   }

//   // ===== Complete Transaction =====
//   const handleCompleteTransaction = () => {
//     const transactionData = {
//       members: [...members],
//       monthPayments: {...monthPayments},
//       muddalInputs: {...muddalInputs},
//       penaltyInputs: {...penaltyInputs},
//       borrowAmounts: {...borrowAmounts},
//       monthLoans: {...monthLoans},
//       completedAt: new Date().toISOString()
//     }

//     setCompletedTransactions(prev => ({ ...prev, [monthKey]: transactionData }))
//     setReadOnlyMode(true)
//     alert('Transaction completed! The page is now in read-only mode.')
//   }

//   // ===== Dynamic Stats Calculation =====
//   const calculateMonthStats = () => {
//     const totalShareCollection = members.length * SHARE_AMOUNT
//     const totalInterest = members.reduce((sum, m) => sum + (calculatePaymentDetails(m)?.interestAmount || 0), 0)
//     const totalPenalties = members.reduce((sum, m) => sum + (calculatePaymentDetails(m)?.penaltyAmount || 0), 0)
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

//   // ===== PDF Export Functions =====
//   const exportToPDF = async (tableType = 'collection') => {
//     setIsGeneratingPDF(true)
    
//     try {
//       const pdfFrame = document.createElement('iframe')
//       pdfFrame.style.display = 'none'
//       document.body.appendChild(pdfFrame)
      
//       const pdfWindow = pdfFrame.contentWindow
//       const pdfDocument = pdfWindow.document
      
//       // Write PDF content
//       pdfDocument.write(`
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <title>शिवांजली फंड - ${monthData.name} ${monthData.year}</title>
//           <style>
//             @page {
//               size: A4 landscape;
//               margin: 0.5cm;
//             }
            
//             body {
//               font-family: 'Arial', sans-serif;
//               margin: 0;
//               padding: 0;
//               background: white;
//               -webkit-print-color-adjust: exact;
//               print-color-adjust: exact;
//             }
            
//             .pdf-container {
//               width: 100%;
//               margin: 0;
//               padding: 0;
//             }
            
//             .pdf-header {
//               background: #f8fafc;
//               padding: 15px;
//               border-bottom: 2px solid #e2e8f0;
//               margin-bottom: 15px;
//             }
            
//             .header-content {
//               display: flex;
//               justify-content: space-between;
//               align-items: center;
//             }
            
//             .logo {
//               width: 80px;
//               height: 80px;
//               background: #2563eb;
//               color: white;
//               display: flex;
//               align-items: center;
//               justify-content: center;
//               border-radius: 8px;
//               font-weight: bold;
//               font-size: 12px;
//               text-align: center;
//             }
            
//             .header-text {
//               text-align: center;
//               flex-grow: 1;
//               margin: 0 20px;
//             }
            
//             .header-text h1 {
//               margin: 0;
//               font-size: 20px;
//               color: #1e293b;
//             }
            
//             .header-text .subtitle {
//               margin: 5px 0 0 0;
//               font-size: 14px;
//               color: #64748b;
//             }
            
//             .summary-grid {
//               display: grid;
//               grid-template-columns: repeat(4, 1fr);
//               gap: 8px;
//               margin-bottom: 15px;
//             }
            
//             .summary-item {
//               border: 1px solid #cbd5e1;
//               padding: 8px;
//               text-align: center;
//               border-radius: 4px;
//             }
            
//             .summary-label {
//               font-size: 10px;
//               font-weight: bold;
//               color: #475569;
//             }
            
//             .summary-value {
//               font-size: 12px;
//               font-weight: bold;
//               color: #1e293b;
//             }
            
//             .pdf-table {
//               width: 100%;
//               border-collapse: collapse;
//               font-size: 9px;
//               margin-bottom: 20px;
//               table-layout: fixed;
//             }
            
//             .pdf-table th {
//               background: #f1f5f9;
//               border: 1px solid #cbd5e1;
//               padding: 6px 4px;
//               text-align: center;
//               font-weight: bold;
//               color: #475569;
//               overflow: hidden;
//               text-overflow: ellipsis;
//             }
            
//             .pdf-table td {
//               border: 1px solid #cbd5e1;
//               padding: 5px 3px;
//               text-align: center;
//               overflow: hidden;
//               text-overflow: ellipsis;
//             }
            
//             .paid-row {
//               background: #f0fdf4 !important;
//             }
            
//             .page-number {
//               text-align: center;
//               font-size: 10px;
//               color: #64748b;
//               margin-top: 10px;
//             }
            
//             .page-break {
//               page-break-after: always;
//             }
//           </style>
//         </head>
//         <body>
//           <div class="pdf-container">
//             ${tableType === 'collection' ? generateCollectionPDFPages() : generateBorrowingPDFPages()}
//           </div>
//         </body>
//         </html>
//       `)
      
//       await new Promise(resolve => setTimeout(resolve, 500))
      
//       pdfWindow.print()
      
//       setTimeout(() => {
//         document.body.removeChild(pdfFrame)
//         setIsGeneratingPDF(false)
//       }, 1000)
      
//     } catch (error) {
//       console.error('PDF generation failed:', error)
//       setIsGeneratingPDF(false)
//       alert('PDF generation failed. Please try again.')
//     }
//   }

//   const generateCollectionPDFPages = () => {
//     const getDisplayMembers = (membersList) => {
//       return membersList.map((member) => ({
//         ...member,
//         displaySerialNo: member.serialNo
//       }))
//     }
//     const displayMembers = getDisplayMembers(members)
//     const memberChunks = chunkMembers(displayMembers, 30)
//     const currentDate = getCurrentDate()
    
//     return memberChunks.map((chunk, pageIndex) => `
//       <div class="pdf-page ${pageIndex < memberChunks.length - 1 ? 'page-break' : ''}">
//         <div class="pdf-header">
//           <div class="header-content">
//             <div class="logo">LOGO</div>
//             <div class="header-text">
//               <h1>शिवांजली फंड - संकलन अहवाल</h1>
//               <p class="subtitle">महिना: ${monthData.name} ${monthData.year}</p>
//               <p class="subtitle">तारीख: ${currentDate}</p>
//             </div>
//             <div style="text-align: right;">
//               <div style="font-size: 12px; font-weight: bold;">पृष्ठ ${pageIndex + 1} / ${memberChunks.length}</div>
//             </div>
//           </div>
//         </div>

//         <div class="summary-grid">
//           <div class="summary-item">
//             <div class="summary-label">एकूण भाग रक्कम</div>
//             <div class="summary-value">₹${monthStats.totalShareCollection.toLocaleString()}</div>
//           </div>
//           <div class="summary-item">
//             <div class="summary-label">एकूण व्याज</div>
//             <div class="summary-value">₹${monthStats.totalInterest.toLocaleString()}</div>
//           </div>
//           <div class="summary-item">
//             <div class="summary-label">एकूण दंड</div>
//             <div class="summary-value">₹${monthStats.totalPenalties.toLocaleString()}</div>
//           </div>
//           <div class="summary-item">
//             <div class="summary-label">एकूण संकलित</div>
//             <div class="summary-value" style="color: #059669;">₹${monthStats.totalPaid.toLocaleString()}</div>
//           </div>
//         </div>

//         <table class="pdf-table">
//           <thead>
//             <tr>
//               <th width="5%">सभा. क्र</th>
//               <th width="15%">भागधारकाचे नाव</th>
//               <th width="6%">भाग रक्कम</th>
//               <th width="8%">कर्ज</th>
//               <th width="8%">मुद्दल</th>
//               <th width="8%">व्याज</th>
//               <th width="8%">दंड</th>
//               <th width="8%">एकूण</th>
//               <th width="10%">शिल्लक कर्ज</th>
//               <th width="6%">स्थिती</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${chunk.map((member) => {
//               const paymentDetails = calculatePaymentDetails(member)
//               const hasMemberPaid = (member) => !!monthPayments[member.id]?.paid
//               const isPaid = hasMemberPaid(member)
//               const totalAmount = paymentDetails.total
//               const paymentMode = monthPayments[member.id]?.paymentMode
              
//               return `
//                 <tr class="${isPaid ? 'paid-row' : ''}">
//                   <td>${member.serialNo}</td>
//                   <td style="text-align: left; padding-left: 8px;">
//                     <div style="font-weight: bold;">${member.name}</div>
//                     <div style="font-size: 8px; color: #64748b;">${member.phone}</div>
//                   </td>
//                   <td>₹${SHARE_AMOUNT}</td>
//                   <td>${member.isBorrower ? `₹${paymentDetails.currentLoan?.toLocaleString()}` : '-'}</td>
// <td>${paymentDetails.muddalPaid > 0 ? `₹${paymentDetails.muddalPaid.toLocaleString()}` : '0'}</td>
// <td>${member.isBorrower ? `₹${paymentDetails.interestAmount}` : '-'}</td>
//                   <td>${paymentDetails.penaltyAmount > 0 ? `₹${paymentDetails.penaltyAmount.toLocaleString()}` : '-'}</td>
//                   <td style="font-weight: bold;">₹${totalAmount.toLocaleString()}</td>
//                   <td>${member.isBorrower ? `₹${paymentDetails.remainingLoan.toLocaleString()}` : '-'}</td>
//                   <td>
//                     <span style="
//                       display: inline-block;
//                       padding: 2px 6px;
//                       border-radius: 10px;
//                       font-size: 8px;
//                       font-weight: bold;
//                       ${isPaid ? 
//                         (paymentMode === 'cash' ? 'background: #dcfce7; color: #166534;' : 
//                          paymentMode === 'online' ? 'background: #dbeafe; color: #1e40af;' : 
//                          'background: #dcfce7; color: #166534;') 
//                         : 'background: #fef3c7; color: #92400e;'}
//                     ">
//                       ${isPaid ? (paymentMode === 'cash' ? 'C' : paymentMode === 'online' ? 'O' : 'C') : 'Pending'}
//                     </span>
//                   </td>
//                 </tr>
//               `
//             }).join('')}
//           </tbody>
//         </table>

//         <div class="page-number">
//           पृष्ठ ${pageIndex + 1} / ${memberChunks.length}
//         </div>
//       </div>
//     `).join('')
//   }

//   const generateBorrowingPDFPages = () => {
//     const membersWithLoans = getMembersWithMonthLoans
//     const getDisplayMembers = (membersList) => {
//       return membersList.map((member) => ({
//         ...member,
//         displaySerialNo: member.serialNo
//       }))
//     }
//     const displayMembers = getDisplayMembers(membersWithLoans)
//     const memberChunks = chunkMembers(displayMembers, 30)
//     const currentDate = getCurrentDate()
    
//     if (membersWithLoans.length === 0) {
//       return `
//         <div class="pdf-page">
//           <div class="pdf-header">
//             <div class="header-content">
//               <div class="logo">LOGO</div>
//               <div class="header-text">
//                 <h1>शिवांजली फंड - कर्ज अहवाल</h1>
//                 <p class="subtitle">महिना: ${monthData.name} ${monthData.year}</p>
//                 <p class="subtitle">तारीख: ${currentDate}</p>
//               </div>
//             </div>
//           </div>
//           <div style="text-align: center; padding: 50px;">
//             <h3>${monthData.name} ${monthData.year} या महिन्यासाठी कोणतेही कर्ज प्रक्रियेस नाही</h3>
//           </div>
//         </div>
//       `
//     }
    
//     return memberChunks.map((chunk, pageIndex) => `
//       <div class="pdf-page ${pageIndex < memberChunks.length - 1 ? 'page-break' : ''}">
//         <div class="pdf-header">
//           <div class="header-content">
//             <div class="logo">LOGO</div>
//             <div class="header-text">
//               <h1>शिवांजली फंड - कर्ज अहवाल</h1>
//               <p class="subtitle">महिना: ${monthData.name} ${monthData.year}</p>
//               <p class="subtitle">तारीख: ${currentDate}</p>
//             </div>
//             <div style="text-align: right;">
//               <div style="font-size: 12px; font-weight: bold;">पृष्ठ ${pageIndex + 1} / ${memberChunks.length}</div>
//             </div>
//           </div>
//         </div>

//         <div class="summary-grid">
//           <div class="summary-item">
//             <div class="summary-label">या महिन्यातील एकूण कर्ज</div>
//             <div class="summary-value">₹${monthStats.totalBorrowedThisMonth.toLocaleString()}</div>
//           </div>
//           <div class="summary-item">
//             <div class="summary-label">एकूण कर्जदार</div>
//             <div class="summary-value">${membersWithLoans.length}</div>
//           </div>
//           <div class="summary-item">
//             <div class="summary-label">नवीन कर्जदार</div>
//             <div class="summary-value">${membersWithLoans.filter(m => !m.isBorrower || m.loanHistory.length === 1).length}</div>
//           </div>
//           <div class="summary-item">
//             <div class="summary-label">नवीन कर्ज शिल्लक</div>
//             <div class="summary-value">₹${monthStats.totalPrincipal.toLocaleString()}</div>
//           </div>
//         </div>

//         <table class="pdf-table">
//           <thead>
//             <tr>
//               <th width="5%">सभा. क्र</th>
//               <th width="20%">भागधारकाचे नाव</th>
//               <th width="15%">मागील कर्ज</th>
//               <th width="15%">यावेळी घेतलेले कर्ज</th>
//               <th width="25%">जामीन</th>
//               <th width="20%">नवीन कर्ज शिल्लक</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${chunk.map((member) => {
//               const totalBorrowingThisMonth = getTotalBorrowingThisMonth(member.id)
//               const previousPrincipal = getPreviousPrincipal(member)
//               const allGuarantors = getAllGuarantorsThisMonth(member.id)
              
//               return `
//                 <tr>
//                   <td>${member.serialNo}</td>
//                   <td style="text-align: left; padding-left: 8px;">
//                     <div style="font-weight: bold;">${member.name}</div>
//                     <div style="font-size: 8px; color: #64748b;">${member.phone}</div>
//                   </td>
//                   <td>₹${previousPrincipal.toLocaleString()}</td>
//                   <td style="font-weight: bold; color: #059669;">₹${totalBorrowingThisMonth.toLocaleString()}</td>
//                   <td style="text-align: left; padding-left: 8px;">
//                     ${allGuarantors.length > 0 ? 
//                       allGuarantors.map(guarantor => 
//                         `<div style="font-size: 8px; color: #1d4ed8;">${guarantor}</div>`
//                       ).join('') 
//                       : '<div style="font-size: 8px; color: #64748b;">जामीन नाही</div>'
//                     }
//                   </td>
//                   <td>₹${member.currentPrincipal?.toLocaleString()}</td>
//                 </tr>
//               `
//             }).join('')}
//           </tbody>
//         </table>

//         <div class="page-number">
//           पृष्ठ ${pageIndex + 1} / ${memberChunks.length}
//         </div>
//       </div>
//     `).join('')
//   }

//   const chunkMembers = (members, chunkSize) => {
//     const chunks = []
//     for (let i = 0; i < members.length; i += chunkSize) {
//       chunks.push(members.slice(i, i + chunkSize))
//     }
//     return chunks
//   }

//   const getCurrentDate = () => {
//     const now = new Date()
//     const day = String(now.getDate()).padStart(2, '0')
//     const month = now.toLocaleString('default', { month: 'long' })
//     const year = now.getFullYear()
//     return `${day} ${month} ${year}`
//   }

//   // ===== UI Helper Functions =====
//   const getCardClass = (cardType) => {
//     const baseClass = 'rounded-lg shadow-md p-6 text-center cursor-pointer transition-all duration-200'
//     if (filter === cardType) {
//       switch (cardType) {
//         case 'all': return `${baseClass} bg-blue-100 border-2 border-blue-500 transform scale-105`
//         case 'borrower': return `${baseClass} bg-purple-100 border-2 border-purple-500 transform scale-105`
//         case 'non-borrower': return `${baseClass} bg-green-100 border-2 border-green-500 transform scale-105`
//         case 'penalty': return `${baseClass} bg-red-100 border-2 border-red-500 transform scale-105`
//         case 'can-borrow': return `${baseClass} bg-orange-100 border-2 border-orange-500 transform scale-105`
//         default: return `${baseClass} bg-white border-2 border-gray-300`
//       }
//     } else {
//       return `${baseClass} bg-white border border-gray-200 hover:shadow-lg hover:border-gray-300`
//     }
//   }

//   const getTextClass = (cardType) => {
//     if (filter === cardType) {
//       switch (cardType) {
//         case 'all': return 'text-blue-700'
//         case 'borrower': return 'text-purple-700'
//         case 'non-borrower': return 'text-green-700'
//         case 'penalty': return 'text-red-700'
//         case 'can-borrow': return 'text-orange-700'
//         default: return 'text-gray-700'
//       }
//     }
//     return 'text-gray-700'
//   }

//   const getTabClass = (tabName) => {
//     const baseClass = 'px-4 py-2 rounded-md font-medium transition-colors'
//     return activeTab === tabName ? `${baseClass} bg-blue-600 text-white` : `${baseClass} bg-gray-200 text-gray-700 hover:bg-gray-300`
//   }

//   if (!monthData) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">लोड होत आहे...</p>
//         </div>
//       </div>
//     )
//   }

//   const headerSub = () => {
//     const idx = monthIndexFromName(monthData.name)
//     const pretty = idx !== null ? `${String(25).padStart(2,'0')} ${monthData.name}` : '25th'
//     return pretty
//   }

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <style jsx>{`
//         .collection-table {
//           table-layout: fixed;
//           width: 100%;
//         }
//         .collection-table th,
//         .collection-table td {
//           overflow: hidden;
//           text-overflow: ellipsis;
//         }
//         .borrowing-table {
//           table-layout: fixed;
//           width: 100%;
//         }
//         /* Fix for guarantor dropdown */
//         .borrowing-table td {
//           position: relative;
//           overflow: visible !important;
//         }
//         .guarantor-dropdown-container {
//           position: relative;
//         }
//         .guarantor-dropdown {
//           position: absolute;
//           z-index: 1000;
//           width: 250px;
//           margin-top: 2px;
//           background: white;
//           border: 1px solid #d1d5db;
//           border-radius: 0.375rem;
//           box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
//           max-height: 120px;
//           overflow-y: auto;
//           left: 0;
//         }
//         .guarantor-dropdown::-webkit-scrollbar {
//           width: 6px;
//         }
//         .guarantor-dropdown::-webkit-scrollbar-track {
//           background: #f3f4f6;
//           border-radius: 3px;
//         }
//         .guarantor-dropdown::-webkit-scrollbar-thumb {
//           background: #d1d5db;
//           border-radius: 3px;
//         }
//         .guarantor-dropdown::-webkit-scrollbar-thumb:hover {
//           background: #9ca3af;
//         }
//         .guarantor-suggestion {
//           padding: 8px 12px;
//           cursor: pointer;
//           border-bottom: 1px solid #f3f4f6;
//         }
//         .guarantor-suggestion:hover {
//           background-color: #eff6ff;
//         }
//         .guarantor-suggestion:last-child {
//           border-bottom: none;
//         }
//       `}</style>
//       <header className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <div className="flex items-center space-x-4">
//               <h1 className="text-2xl font-bold text-gray-900">
//                 {monthData.name} {monthData.year} - निधी संकलन
//                 {readOnlyMode && <span className="ml-2 text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded">फक्त वाचन</span>}
//               </h1>
//               <span className="text-gray-600 text-sm bg-gray-100 px-3 py-1 rounded-full">
//                 {headerSub()}
//               </span>
//               {collectionCompleted && (
//                 <span className="text-green-600 text-sm bg-green-100 px-3 py-1 rounded-full">✓ संकलन पूर्ण</span>
//               )}
//             </div>
//             <Link href="/dashboard" className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">← डॅशबोर्ड वर परत</Link>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Summary Cards - Marathi */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <div className={getCardClass('all')} onClick={() => setFilter('all')}>
//             <h3 className={`text-lg font-semibold mb-2 ${getTextClass('all')}`}>सर्व सदस्य</h3>
//             <p className={`text-3xl font-bold ${getTextClass('all')}`}>{members.length}</p>
//           </div>

//           <div className={getCardClass('borrower')} onClick={() => setFilter('borrower')}>
//             <h3 className={`text-lg font-semibold mb-2 ${getTextClass('borrower')}`}>कर्जदार</h3>
//             <p className={`text-3xl font-bold ${getTextClass('borrower')}`}>{members.filter(m => m.isBorrower).length}</p>
//           </div>

//           <div className={getCardClass('non-borrower')} onClick={() => setFilter('non-borrower')}>
//             <h3 className={`text-lg font-semibold mb-2 ${getTextClass('non-borrower')}`}>कर्ज नसलेले</h3>
//             <p className={`text-3xl font-bold ${getTextClass('non-borrower')}`}>{members.filter(m => !m.isBorrower).length}</p>
//           </div>

//           <div className={getCardClass('penalty')} onClick={() => setFilter('penalty')}>
//             <h3 className={`text-lg font-semibold mb-2 ${getTextClass('penalty')}`}>दंड प्रकरणे</h3>
//             <p className={`text-3xl font-bold ${getTextClass('penalty')}`}>{members.filter(m => m.penaltyApplied).length}</p>
//           </div>
//         </div>

//         {/* Collection Status Banner */}
//         {!collectionCompleted && activeTab === 'collection' && !readOnlyMode && (
//           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
//             <div className="flex items-center">
//               <div className="flex-shrink-0">
//                 <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 a1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <div className="ml-3">
//                 <h3 className="text-sm font-medium text-yellow-800">संकलन प्रगतीपथावर</h3>
//                 <div className="mt-2 text-sm text-yellow-700">
//                   <p>काही सदस्यांनी अद्याप त्यांचे पेमेंट पूर्ण केले नाहीत. पेमेंट केलेले सदस्य हिरव्या रंगात हायलाइट केले आहेत.</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {readOnlyMode && (
//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//             <div className="flex items-center">
//               <div className="flex-shrink-0">
//                 <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 a1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
//                 </svg>
//               </div>
//               <div className="ml-3">
//                 <h3 className="text-sm font-medium text-blue-800">फक्त वाचन मोड</h3>
//                 <div className="mt-2 text-sm text-blue-700">
//                   <p>हा व्यवहार पूर्ण झाला आहे. सर्व डेटा आता संदर्भासाठी फक्त वाचन मोडमध्ये आहे.</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Tab Navigation */}
//         <div className="flex space-x-4 mb-6">
//           <button className={getTabClass('collection')} onClick={() => setActiveTab('collection')}>संकलन तपशील</button>
//           <button className={getTabClass('borrowing')} onClick={() => setActiveTab('borrowing')}>कर्ज व्यवस्थापन</button>
//         </div>

//         {/* Render Active Tab */}
//         {activeTab === 'collection' ? (
//           <CollectionTab
//             members={members}
//             setMembers={setMembers}
//             readOnlyMode={readOnlyMode}
//             monthPayments={monthPayments}
//             setMonthPayments={setMonthPayments}
//             muddalInputs={muddalInputs}
//             setMuddalInputs={setMuddalInputs}
//             penaltyInputs={penaltyInputs}
//             setPenaltyInputs={setPenaltyInputs}
//             calculatePaymentDetails={calculatePaymentDetails}
//             calculatePenalty={calculatePenalty}
//             showPaymentMode={showPaymentMode}
//             setShowPaymentMode={setShowPaymentMode}
//             SHARE_AMOUNT={SHARE_AMOUNT}
//             INTEREST_RATE={INTEREST_RATE}
//             PENALTY_RATE={PENALTY_RATE}
//             BASE_PENALTY={BASE_PENALTY}
//             collectionSearchTerm={collectionSearchTerm}
//             setCollectionSearchTerm={setCollectionSearchTerm}
//             filter={filter}
//             setFilter={setFilter}
//             exportToPDF={exportToPDF}
//             isGeneratingPDF={isGeneratingPDF}
//             collectionCompleted={collectionCompleted}
//             markAllAsPaid={markAllAsPaid}
//           />
//         ) : (
//           <BorrowingTab
//             members={members}
//             setMembers={setMembers}
//             readOnlyMode={readOnlyMode}
//             borrowAmounts={borrowAmounts}
//             setBorrowAmounts={setBorrowAmounts}
//             guarantors={guarantors}
//             setGuarantors={setGuarantors}
//             monthLoans={monthLoans}
//             setMonthLoans={setMonthLoans}
//             borrowingSearchTerm={borrowingSearchTerm}
//             setBorrowingSearchTerm={setBorrowingSearchTerm}
//             searchedBorrowingMembers={searchedBorrowingMembers}
//             setSearchedBorrowingMembers={setSearchedBorrowingMembers}
//             getMembersWithMonthLoans={getMembersWithMonthLoans}
//             getTotalBorrowingThisMonth={getTotalBorrowingThisMonth}
//             getPreviousPrincipal={getPreviousPrincipal}
//             getAllGuarantorsThisMonth={getAllGuarantorsThisMonth}
//             activeGuarantorDropdown={activeGuarantorDropdown}
//             setActiveGuarantorDropdown={setActiveGuarantorDropdown}
//             exportToPDF={exportToPDF}
//             isGeneratingPDF={isGeneratingPDF}
//             processAllBorrowings={processAllBorrowings}
//           />
//         )}

//         {/* Action Buttons */}
//         {!readOnlyMode && (
//           <div className="mt-6 flex flex-wrap gap-4">
//             {activeTab === 'collection' && (
//               <>
//                 <button onClick={markAllAsPaid} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors">सर्व पेमेंट प्रक्रिया करा</button>
//               </>
//             )}
//             <button onClick={handleCompleteTransaction} className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors">व्यवहार पूर्ण करा</button>
//           </div>
//         )}

//         {/* Summary Section - Marathi */}
//         <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="bg-white rounded-lg shadow-md p-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">पेमेंट सारांश</h3>
//             <div className="space-y-2 text-black">
//               <div className="flex justify-between"><span>एकूण भाग संकलन:</span><span className="font-semibold">₹{monthStats.totalShareCollection.toLocaleString()}</span></div>
//               <div className="flex justify-between"><span>एकूण व्याज:</span><span className="font-semibold">₹{monthStats.totalInterest.toLocaleString()}</span></div>
//               <div className="flex justify-between"><span>एकूण दंड:</span><span className="font-semibold">₹{monthStats.totalPenalties.toLocaleString()}</span></div>
//               <div className="flex justify-between border-t pt-2"><span>एकूण संकलित:</span><span className="font-semibold text-green-600">₹{monthStats.totalPaid.toLocaleString()}</span></div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-md p-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">कर्जदार सारांश</h3>
//             <div className="space-y-2 text-black">
//               <div className="flex justify-between"><span>एकूण कर्जदार:</span><span>{members.filter(m => m.isBorrower).length}</span></div>
//               <div className="flex justify-between"><span>या महिन्यातील एकूण कर्ज:</span><span className="font-semibold text-green-600">₹{monthStats.totalBorrowedThisMonth.toLocaleString()}</span></div>
//               <div className="flex justify-between"><span>एकूण कर्ज शिल्लक:</span><span className="font-semibold">₹{monthStats.totalPrincipal.toLocaleString()}</span></div>
//               <div className="flex justify-between border-t pt-2"><span>एकूण कर्ज (सर्व काळ):</span><span className="font-semibold">₹{monthStats.totalBorrowed.toLocaleString()}</span></div>
//             </div>
//           </div>

//           <div className="bg-white rounded-lg shadow-md p-6">
//             <h3 className="text-lg font-semibold text-gray-800 mb-4">सिस्टम माहिती</h3>
//             <div className="space-y-2 text-sm text-black">
//               <div className="flex justify-between"><span>भाग रक्कम:</span><span>₹{SHARE_AMOUNT}</span></div>
//               <div className="flex justify-between"><span>व्याज दर:</span><span>{INTEREST_RATE}%</span></div>
//               <div className="flex justify-between"><span>दंड दर:</span><span>{PENALTY_RATE}% + ₹{BASE_PENALTY}</span></div>
//               <div className="flex justify-between"><span>संकलन स्थिती:</span><span className={collectionCompleted ? 'text-green-600 font-semibold' : 'text-yellow-600 font-semibold'}>{collectionCompleted ? 'पूर्ण' : 'प्रगतीपथावर'}</span></div>
//               <div className="flex justify-between"><span>मोड:</span><span className={readOnlyMode ? 'text-blue-600 font-semibold' : 'text-gray-600 font-semibold'}>{readOnlyMode ? 'फक्त वाचन' : 'संपादन करण्यायोग्य'}</span></div>
//               <div className="flex justify-between"><span>महिना की:</span><span className="font-mono">{monthKey}</span></div>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }
