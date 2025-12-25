// 'use client'
// import { useState, useMemo, useEffect } from 'react'

// export default function CollectionTab({
//   members,
//   setMembers,
//   readOnlyMode,
//   monthPayments,
//   setMonthPayments,
//   muddalInputs,
//   setMuddalInputs,
//   penaltyInputs,
//   setPenaltyInputs,
//   calculatePaymentDetails,
//   calculatePenalty,
//   showPaymentMode,
//   setShowPaymentMode,
//   SHARE_AMOUNT,
//   INTEREST_RATE,
//   PENALTY_RATE,
//   BASE_PENALTY,
//   collectionSearchTerm,
//   setCollectionSearchTerm,
//   filter,
//   setFilter,
//   exportToPDF,
//   isGeneratingPDF,
//   collectionCompleted,
//   markAllAsPaid
// }) {
//   // ===== Helper Functions =====
//   const hasMemberPaid = (member) => !!monthPayments[member.id]?.paid

//   const getPaymentStatusClass = (member) => (hasMemberPaid(member) ? 'bg-green-50 border-l-4 border-green-400' : 'bg-white')

//   // ===== UI Handlers =====
//   const handleMuddalChange = (memberId, amount) => {
//     setMuddalInputs(prev => ({ ...prev, [memberId]: parseInt(amount) || 0 }))
//   }

//   const handlePenaltyChange = (memberId, amount) => {
//     setPenaltyInputs(prev => ({ ...prev, [memberId]: parseInt(amount) || 0 }))
//   }

//   const togglePenalty = (memberId) => {
//     setMembers(members.map(m => m.id === memberId ? { ...m, penaltyApplied: !m.penaltyApplied } : m))
//   }

//   const processPayment = (memberId, paymentMode = 'cash') => {
//   if (readOnlyMode) return;

//   const member = members.find(m => m.id === memberId)
//   if (!member) return

//   // Get current input values
//   const muddalPaid = Math.max(0, parseInt(muddalInputs[memberId]) || 0)
//   const penaltyAmount = calculatePenalty(member)
  
//   // Calculate payment details
//   const paymentDetails = calculatePaymentDetails(member)
//   const totalDue = paymentDetails.total

//   // Update member's current principal (reduce loan by muddal paid)
//   const updatedMembers = members.map(m => {
//     if (m.id !== memberId) return m
//     const updated = { ...m }

//     if (m.isBorrower) {
//       updated.currentPrincipal = Math.max(0, (m.currentPrincipal || 0) - muddalPaid)
//     }

//     updated.penaltyApplied = false
//     return updated
//   })

//   setMembers(updatedMembers)

//   // Store payment record
//   setMonthPayments(prev => ({
//     ...prev,
//     [memberId]: {
//       paid: true,
//       paidAmount: totalDue,
//       penaltyAmount: penaltyAmount,
//       muddalPaid: muddalPaid,
//       interestAmount: paymentDetails.interestAmount,
//       paymentMode: paymentMode,
//       ts: new Date().toISOString(),
//     },
//   }))

//   setShowPaymentMode(null)

//   alert(`Payment processed successfully via ${paymentMode === 'cash' ? 'Cash' : 'Online'}!\nTotal collected: ₹${totalDue}`)
// }

//   const revertPayment = (memberId) => {
//     if (readOnlyMode) return;

//     const member = members.find(m => m.id === memberId)
//     if (!member) return

//     const updatedMembers = members.map(m => {
//       if (m.id !== memberId) return m
//       const updated = { ...m }

//       if (m.isBorrower) {
//         const payment = monthPayments[memberId]
//         if (payment && payment.muddalPaid) {
//           updated.currentPrincipal = (m.currentPrincipal || 0) + payment.muddalPaid
//         }
//       }

//       return updated
//     })

//     setMembers(updatedMembers)

//     setMonthPayments(prev => {
//       const newPayments = { ...prev }
//       delete newPayments[memberId]
//       return newPayments
//     })

//     setMuddalInputs(prev => ({ ...prev, [memberId]: 0 }))
//     setPenaltyInputs(prev => ({ ...prev, [memberId]: 0 }))
//     setShowPaymentMode(null)

//     alert(`Payment reverted successfully for ${member.name}`)
//   }

//   // ===== Search Functionality =====
//   const searchedCollectionMembers = useMemo(() => {
//     if (!collectionSearchTerm.trim()) return members
//     return members.filter(member => 
//       member.name.toLowerCase().includes(collectionSearchTerm.toLowerCase()) ||
//       member.serialNo.toLowerCase().includes(collectionSearchTerm.toLowerCase())
//     )
//   }, [members, collectionSearchTerm])

//   // ===== Filters =====
//   const filteredMembers = useMemo(() => {
//     const membersToFilter = collectionSearchTerm.trim() ? searchedCollectionMembers : members
    
//     return membersToFilter.filter(member => {
//       if (filter === 'all') return true
//       if (filter === 'borrower') return member.isBorrower
//       if (filter === 'non-borrower') return !member.isBorrower
//       if (filter === 'penalty') return member.penaltyApplied
//       return true
//     })
//   }, [members, searchedCollectionMembers, collectionSearchTerm, filter])

//   const getDisplayMembers = (membersList) => {
//     return membersList.map((member) => ({
//       ...member,
//       displaySerialNo: member.serialNo
//     }))
//   }

//   const displayFilteredMembers = useMemo(() => 
//     getDisplayMembers(filteredMembers), 
//     [filteredMembers]
//   )

//   return (
//     <div className="bg-white rounded-lg shadow-md overflow-hidden">
//       <div className="px-6 py-4 border-b border-gray-200">
//         <div className="flex justify-between items-center">
//           <div>
//             <h2 className="text-lg font-semibold text-gray-800">मासिक संकलन व्यवस्थापन</h2>
//             <p className="text-sm text-gray-600 mt-1">
//               {readOnlyMode ? (
//                 "फक्त पहाण्यासाठी - व्यवहार पूर्ण झाला"
//               ) : (
//                 `पेमेंट व्यवस्थापित करा, भाग रक्कम: ₹${SHARE_AMOUNT} | व्याज: ${INTEREST_RATE}% | दंड: ${PENALTY_RATE}% + ₹${BASE_PENALTY}`
//               )}
//             </p>
//           </div>
//           <div className="flex items-center space-x-2">
//             <div className="flex items-center space-x-2 text-sm">
//               <div className="flex items-center">
//                 <div className="w-3 h-3 bg-green-400 rounded-full mr-2"></div>
//                 <span>पेमेंट झाले</span>
//               </div>
//               <div className="flex items-center">
//                 <div className="w-3 h-3 bg-white border border-gray-300 rounded-full mr-2"></div>
//                 <span>प्रलंबित</span>
//               </div>
//             </div>
//             <button 
//               onClick={() => exportToPDF('collection')} 
//               disabled={isGeneratingPDF}
//               className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
//                 isGeneratingPDF 
//                   ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
//                   : 'bg-blue-600 text-white hover:bg-blue-700'
//               }`}
//             >
//               {isGeneratingPDF ? (
//                 <>
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//                   तयार होत आहे...
//                 </>
//               ) : (
//                 <>
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                   </svg>
//                   PDF निर्यात करा
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Collection Search Bar */}
//       {!readOnlyMode && (
//         <div className="px-6 py-4 bg-gray-50 border-b">
//           <div className="max-w-md">
//             <label htmlFor="collectionSearch" className="block text-sm font-medium text-gray-700 mb-2">नाव किंवा अनुक्रमांकाने सदस्य शोधा</label>
//             <input
//               type="text"
//               id="collectionSearch"
//               value={collectionSearchTerm}
//               onChange={(e) => setCollectionSearchTerm(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
//               placeholder="नाव किंवा अनुक्रमांक प्रविष्ट करा (उदा., MBR001)"
//             />
//             {collectionSearchTerm && (
//               <p className="text-sm text-gray-600 mt-2">{searchedCollectionMembers.length} सदस्य(सदस्य) सापडले</p>
//             )}
//           </div>
//         </div>
//       )}

//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200 collection-table">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20 whitespace-nowrap">सभा. क्र</th>
//               <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-48 whitespace-nowrap">भागधारकाचे नाव</th>
//               <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20 whitespace-nowrap">भाग रक्कम</th>
//               <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28 whitespace-nowrap">कर्ज</th>
//               <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24 whitespace-nowrap">मुद्दल</th>
//               <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20 whitespace-nowrap">व्याज</th>
//               <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-28 whitespace-nowrap">दंड</th>
//               <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20 whitespace-nowrap">एकूण</th>
//               <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32 whitespace-nowrap">शिल्लक कर्ज</th>
//               {!readOnlyMode && (
//                 <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32 whitespace-nowrap">क्रिया</th>
//               )}
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//   {displayFilteredMembers.length > 0 ? (
//     displayFilteredMembers.map((member) => {
//       const paymentDetails = calculatePaymentDetails(member)
//       const isPaid = hasMemberPaid(member)
//       const totalAmount = paymentDetails.total
//       const paymentMode = monthPayments[member.id]?.paymentMode

//       return (
//         <tr key={member.id} className={`hover:bg-gray-50 transition-colors ${getPaymentStatusClass(member)}`}>
//           <td className="px-3 py-4 text-sm text-gray-900 font-medium w-20 text-center">
//             {member.displaySerialNo}
//           </td>
          
//           <td className="px-3 py-4 w-48 min-w-0">
//             <div className="text-center">
//               <div className="text-sm font-medium text-gray-900">{member.name}</div>
//               <div className="text-sm text-gray-500">{member.phone}</div>
//             </div>
//           </td>
          
//           <td className="px-3 py-4 text-sm text-gray-900 w-20 text-center">
//             ₹{SHARE_AMOUNT}
//           </td>
          
//           {/* LOAN COLUMN - Show original loan amount */}
//           <td className="px-3 py-4 text-sm text-gray-900 w-28 text-center">
//             {member.isBorrower ? (
//               <div>₹{paymentDetails.currentLoan?.toLocaleString()}</div>
//             ) : '-'}
//           </td>
          
//           {/* MUDDAL COLUMN */}
//           <td className="px-3 py-4 w-24 text-center min-w-0">
//             {readOnlyMode || isPaid ? (
//               <div>
//                 <div className="font-semibold text-green-600">₹{paymentDetails.muddalPaid.toLocaleString()}</div>
//               </div>
//             ) : (
//               <input
//                 type="number"
//                 value={muddalInputs[member.id] || ''}
//                 onChange={(e) => handleMuddalChange(member.id, e.target.value)}
//                 className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
//                 placeholder="0"
//                 disabled={isPaid}
//               />
//             )}
//           </td>
          
//           {/* INTEREST COLUMN - Calculated on remaining loan */}
//           <td className="px-3 py-4 text-sm text-gray-900 w-20 text-center">
//             {member.isBorrower ? (
//               <div>
//                 <div>₹{paymentDetails.interestAmount}</div>
//                 <div className="text-xs text-gray-500">
//                   (3% of ₹{paymentDetails.remainingLoan.toLocaleString()})
//                 </div>
//               </div>
//             ) : '-'}
//           </td>
          
//           {/* PENALTY COLUMN */}
//           <td className="px-3 py-4 w-28 text-center min-w-0">
//             {paymentDetails.penaltyAmount > 0 ? (
//               <div className="font-semibold text-red-600">₹{paymentDetails.penaltyAmount.toLocaleString()}</div>
//             ) : (
//               <span className="text-gray-500">-</span>
//             )}
//           </td>
          
//           {/* TOTAL COLUMN */}
//           <td className="px-3 py-4 text-sm font-semibold text-gray-900 w-20 text-center">
//             ₹{totalAmount.toLocaleString()}
//           </td>
          
//           {/* REMAINING PRINCIPAL COLUMN - Show loan after muddal */}
//           <td className="px-3 py-4 text-sm text-gray-900 w-32 text-center min-w-0">
//             {member.isBorrower ? (
//               <div>
//                 <div className="font-semibold">₹{paymentDetails.remainingLoan.toLocaleString()}</div>
//                 {paymentDetails.currentLoan > paymentDetails.remainingLoan && (
//                   <div className="text-xs text-green-600">
//                     -₹{(paymentDetails.currentLoan - paymentDetails.remainingLoan).toLocaleString()}
//                   </div>
//                 )}
//               </div>
//             ) : '-'}
//           </td>
          
//           {!readOnlyMode && (
//             <td className="px-3 py-4 w-32 text-center min-w-0">
//               <div className="flex flex-col space-y-2 items-center">
//                 {!isPaid ? (
//                   showPaymentMode === member.id ? (
//                     <div className="flex space-x-1">
//                       <button
//                         onClick={() => processPayment(member.id, 'cash')}
//                         className="flex-1 px-2 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 text-xs"
//                         title="रोख पेमेंट"
//                       >
//                         रोख
//                       </button>
//                       <button
//                         onClick={() => processPayment(member.id, 'online')}
//                         className="flex-1 px-2 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 text-xs"
//                         title="ऑनलाइन पेमेंट"
//                       >
//                         ऑनलाइन
//                       </button>
//                       <button
//                         onClick={() => setShowPaymentMode(null)}
//                         className="px-2 py-2 text-sm rounded-md bg-gray-600 text-white hover:bg-gray-700 text-xs"
//                       >
//                         ×
//                       </button>
//                     </div>
//                   ) : (
//                     <button
//                       onClick={() => setShowPaymentMode(member.id)}
//                       className="w-full px-3 py-2 text-sm rounded-md bg-green-600 text-white hover:bg-green-700"
//                     >
//                       पेमेंट करा
//                     </button>
//                   )
//                 ) : (
//                   <button
//                     onClick={() => revertPayment(member.id)}
//                     className="w-full px-3 py-2 text-sm rounded-md bg-yellow-600 text-white hover:bg-yellow-700"
//                   >
//                     परत करा
//                   </button>
//                 )}
//               </div>
//             </td>
//           )}
//         </tr>
//       )
//     })
//   ) : (
//     <tr>
//       <td colSpan={readOnlyMode ? "9" : "10"} className="px-6 py-8 text-center">
//         <div className="text-gray-500">
//           <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//           <p className="mt-2 text-lg font-medium">कोणतेही सदस्य सापडले नाहीत</p>
//           <p className="text-sm">आपला फिल्टर किंवा शोध संज्ञा बदलण्याचा प्रयत्न करा</p>
//         </div>
//       </td>
//     </tr>
//   )}
// </tbody>
//         </table>
//       </div>
//     </div>
//   )
// }


'use client'
import { useState } from 'react'
import { monthsAPI } from '@/lib/api-client'

export default function Collection({ monthData, allMembers, date, onUpdate }) {
  const [selectedMember, setSelectedMember] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [transactionId, setTransactionId] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingPayment, setEditingPayment] = useState(null)

  // Get payments from monthData
  const payments = monthData?.payments || []
  
  // Get members who haven't paid yet
  const paidMemberIds = payments.map(p => p.member._id || p.member)
  const unpaidMembers = allMembers.filter(m => !paidMemberIds.includes(m._id))

  const handleAddPayment = async (e) => {
    e.preventDefault()
    
    if (!selectedMember || !amount) {
      setError('Please select a member and enter an amount')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')

      await monthsAPI.addPayment(date, {
        memberId: selectedMember,
        amount: parseFloat(amount),
        paymentMethod,
        transactionId,
        notes
      })

      setSuccess('Payment added successfully!')
      
      // Reset form
      setSelectedMember('')
      setAmount('')
      setPaymentMethod('cash')
      setTransactionId('')
      setNotes('')
      
      // Refresh month data
      if (onUpdate) await onUpdate()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Failed to add payment')
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) {
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')

      await monthsAPI.deletePayment(date, paymentId)
      
      setSuccess('Payment deleted successfully!')
      
      // Refresh month data
      if (onUpdate) await onUpdate()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Failed to delete payment')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Add Payment Form */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Payment</h3>
        
        <form onSubmit={handleAddPayment} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Member *</label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
              required
            >
              <option value="">Select Member</option>
              {unpaidMembers.map(member => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="5000"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="neft">NEFT</option>
              <option value="rtgs">RTGS</option>
              <option value="cheque">Cheque</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
            <input
              type="text"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
            <button
              type="submit"
              disabled={loading || unpaidMembers.length === 0}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Adding...' : 'Add Payment'}
            </button>
          </div>
        </form>

        {unpaidMembers.length === 0 && (
          <p className="text-sm text-gray-600 mt-2">All members have paid for this month!</p>
        )}
      </div>

      {/* Payments List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Payment Records ({payments.length})
        </h3>

        {payments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No payments recorded yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {payment.member?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {payment.paymentMethod?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {payment.transactionId || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDate(payment.paymentDate)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDeletePayment(payment._id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-800 font-medium disabled:text-gray-400"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Unpaid Members List */}
      {unpaidMembers.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Unpaid Members ({unpaidMembers.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unpaidMembers.map(member => (
              <div
                key={member._id}
                className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
              >
                <h4 className="font-semibold text-gray-900">{member.name}</h4>
                <p className="text-sm text-gray-600">{member.phone}</p>
                <p className="text-sm text-gray-600">{member.email}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}