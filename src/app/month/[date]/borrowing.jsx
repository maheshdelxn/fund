// // borrowing.jsx
// 'use client'
// import { useState, useMemo, useEffect } from 'react'

// export default function BorrowingTab({
//   members,
//   setMembers,
//   readOnlyMode,
//   borrowAmounts,
//   setBorrowAmounts,
//   guarantors,
//   setGuarantors,
//   monthLoans,
//   setMonthLoans,
//   borrowingSearchTerm,
//   setBorrowingSearchTerm,
//   searchedBorrowingMembers,
//   setSearchedBorrowingMembers,
//   getMembersWithMonthLoans,
//   getTotalBorrowingThisMonth,
//   getPreviousPrincipal,
//   getAllGuarantorsThisMonth,
//   activeGuarantorDropdown,
//   setActiveGuarantorDropdown,
//   exportToPDF,
//   isGeneratingPDF,
//   processAllBorrowings
// }) {
//   // ===== UI Handlers =====
//   const handleBorrowAmountChange = (memberId, amount) => {
//     setBorrowAmounts(prev => ({ ...prev, [memberId]: parseInt(amount) || 0 }))
//   }

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

//   // ===== Helper Functions =====
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

//   const getGuarantorSuggestions = (memberId, input) => {
//     if (!input.trim()) return []
//     const currentMember = members.find(m => m.id === memberId)
//     return members.filter(member => 
//       member.id !== memberId && 
//       (member.name.toLowerCase().includes(input.toLowerCase()) || 
//        member.serialNo.toLowerCase().includes(input.toLowerCase())) &&
//       canBeGuarantor(memberId, member.name)
//     ).slice(0, 5)
//   }

//   // ===== Borrowing Functions =====
//   const processSingleBorrowing = (memberId) => {
//     if (readOnlyMode) return;

//     const borrowAmount = borrowAmounts[memberId] || 0
//     if (borrowAmount <= 0) {
//       alert('Please enter a valid amount')
//       return
//     }

//     const memberGuarantors = guarantors[memberId] || ['', '']
//     const validGuarantors = memberGuarantors.filter(g => g.trim() !== '')
    
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
//           guarantors: validGuarantors
//         }
//         updatedMember.loanHistory = [...(member.loanHistory || []), newLoanRecord]
//         return updatedMember
//       }
//       return member
//     })

//     setMonthLoans(prev => {
//       const currentLoans = prev[memberId] || []
//       return {
//         ...prev,
//         [memberId]: [
//           ...currentLoans,
//           {
//             amount: borrowAmount,
//             guarantors: validGuarantors,
//             date: new Date().toISOString().split('T')[0]
//           }
//         ]
//       }
//     })

//     setMembers(updatedMembers)
//     setBorrowAmounts(prev => ({ ...prev, [memberId]: 0 }))
//     setGuarantors(prev => ({ ...prev, [memberId]: ['', ''] }))

//     const member = updatedMembers.find(m => m.id === memberId)
//     alert(`Loan of ₹${borrowAmount.toLocaleString()} processed successfully for ${member?.name || 'member'}`)
//   }

//   // ===== Get Display Members =====
//   const getDisplayMembers = (membersList) => {
//     return membersList.map((member) => ({
//       ...member,
//       displaySerialNo: member.serialNo
//     }))
//   }

//   const displayBorrowingMembers = useMemo(() => {
//     if (readOnlyMode) {
//       return getDisplayMembers(getMembersWithMonthLoans)
//     } else {
//       if (borrowingSearchTerm.trim()) {
//         return getDisplayMembers(searchedBorrowingMembers)
//       } else {
//         const membersWithCurrentLoans = getDisplayMembers(getMembersWithMonthLoans)
//         const membersWithPendingBorrowals = members.filter(member => 
//           borrowAmounts[member.id] > 0 && !getMembersWithMonthLoans.some(loanMember => loanMember.id === member.id)
//         )
//         return [...membersWithCurrentLoans, ...getDisplayMembers(membersWithPendingBorrowals)]
//       }
//     }
//   }, [searchedBorrowingMembers, borrowingSearchTerm, readOnlyMode, getMembersWithMonthLoans, members, borrowAmounts])

//   return (
//     <div className="bg-white rounded-lg shadow-md overflow-hidden">
//       <div className="px-6 py-4 border-b border-gray-200">
//         <div className="flex justify-between items-center">
//           <div>
//             <h2 className="text-lg font-semibold text-gray-800">कर्ज व्यवस्थापन</h2>
//             <p className="text-sm text-gray-600 mt-1">
//               {readOnlyMode ? (
//                 "फक्त पहाण्यासाठी - व्यवहार पूर्ण झाला"
//               ) : (
//                 "कर्ज प्रक्रियेसाठी नाव किंवा अनुक्रमांकाने सदस्य शोधा. फक्त शोधलेले सदस्य दर्शविले जातील."
//               )}
//             </p>
//           </div>
//           <div className="flex items-center space-x-2">
//             {!readOnlyMode && (
//               <button onClick={processAllBorrowings} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">सर्व प्रक्रिया करा</button>
//             )}
//             <button 
//               onClick={() => exportToPDF('borrowing')} 
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

//       {!readOnlyMode && (
//         <div className="px-6 py-4 bg-gray-50 border-b">
//           <div className="max-w-md">
//             <label htmlFor="borrowingSearch" className="block text-sm font-medium text-gray-700 mb-2">नाव किंवा अनुक्रमांकाने सदस्य शोधा</label>
//             <input
//               type="text"
//               id="borrowingSearch"
//               value={borrowingSearchTerm}
//               onChange={(e) => setBorrowingSearchTerm(e.target.value)}
//               className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
//               placeholder="नाव किंवा अनुक्रमांक प्रविष्ट करा (उदा., MBR001)"
//             />
//             {borrowingSearchTerm && (
//               <p className="text-sm text-gray-600 mt-2">{searchedBorrowingMembers.length} सदस्य(सदस्य) सापडले</p>
//             )}
//           </div>
//         </div>
//       )}

//       <div className="overflow-x-auto">
//         <table className="borrowing-table min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20 whitespace-nowrap">सभा. क्र</th>
//               <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-48 whitespace-nowrap">भागधारकाचे नाव</th>
//               <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32 whitespace-nowrap">मागील कर्ज</th>
//               <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-40 whitespace-nowrap">यावेळी घेतलेले कर्ज</th>
//               <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-64 whitespace-nowrap">जामीन</th>
//               <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32 whitespace-nowrap">नवीन कर्ज शिल्लक</th>
//               {!readOnlyMode && (
//                 <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24 whitespace-nowrap">क्रिया</th>
//               )}
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {(readOnlyMode ? getDisplayMembers(getMembersWithMonthLoans) : displayBorrowingMembers).map((member) => {
//               const borrowAmount = borrowAmounts[member.id] || ''
//               const totalBorrowingThisMonth = getTotalBorrowingThisMonth(member.id)
//               const previousPrincipal = getPreviousPrincipal(member)
//               const allGuarantors = getAllGuarantorsThisMonth(member.id)
//               const newPrincipal = (member.currentPrincipal || 0) + (parseInt(borrowAmount) || 0)
//               const memberGuarantors = guarantors[member.id] || ['', '']

//               return (
//                 <tr key={member.id} className="hover:bg-gray-50">
//                   <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 w-20 text-center font-medium">
//                     {member.displaySerialNo}
//                   </td>
//                   <td className="px-3 py-4 w-48 min-w-0">
//                     <div className="text-center">
//                       <div className="text-sm font-medium text-gray-900">{member.name}</div>
//                       <div className="text-sm text-gray-500">{member.phone}</div>
//                       <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${member.isBorrower ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
//                         {member.isBorrower ? 'विद्यमान कर्जदार' : 'नवीन कर्जदार'}
//                       </span>
//                     </div>
//                   </td>
//                   <td className="px-3 py-4 text-sm text-gray-900 w-32 text-center">
//                     ₹{previousPrincipal.toLocaleString()}
//                   </td>
//                   <td className="px-3 py-4 w-40 min-w-0">
//                     {readOnlyMode ? (
//                       totalBorrowingThisMonth > 0 ? (
//                         <div className="text-center">
//                           <div className="font-semibold text-green-600">
//                             ₹{totalBorrowingThisMonth.toLocaleString()}
//                           </div>
//                         </div>
//                       ) : (
//                         <span className="text-gray-500">-</span>
//                       )
//                     ) : (
//                       <div className="space-y-2">
//                         <input
//                           type="number"
//                           value={borrowAmount}
//                           onChange={(e) => handleBorrowAmountChange(member.id, e.target.value)}
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-black [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//                           placeholder="रक्कम प्रविष्ट करा"
//                         />
//                         {totalBorrowingThisMonth > 0 && (
//                           <div className="text-xs text-green-600">
//                             या महिन्यात आधीच कर्ज: ₹{totalBorrowingThisMonth.toLocaleString()}
//                           </div>
//                         )}
//                       </div>
//                     )}
//                   </td>
//                   <td className="px-3 py-4 w-64 min-w-0">
//                     {readOnlyMode ? (
//                       allGuarantors.length > 0 ? (
//                         <div className="space-y-1 text-center">
//                           {allGuarantors.map((guarantor, idx) => (
//                             <div key={idx} className="text-blue-600 text-sm">{guarantor}</div>
//                           ))}
//                         </div>
//                       ) : (
//                         <span className="text-gray-500">जामीन नाही</span>
//                       )
//                     ) : (
//                       <div className="space-y-2">
//                         {[0, 1].map((guarantorIndex) => {
//                           const dropdownKey = `${member.id}-${guarantorIndex}`
//                           const suggestions = getGuarantorSuggestions(member.id, memberGuarantors[guarantorIndex])
                          
//                           return (
//                             <div key={guarantorIndex} className="guarantor-dropdown-container relative">
//                               <div className="flex items-center space-x-2">
//                                 <input
//                                   type="text"
//                                   value={memberGuarantors[guarantorIndex]}
//                                   onChange={(e) => handleGuarantorChange(member.id, guarantorIndex, e.target.value)}
//                                   onFocus={() => setActiveGuarantorDropdown(dropdownKey)}
//                                   className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-black text-sm"
//                                   placeholder={`जामीन ${guarantorIndex + 1} (पर्यायी)`}
//                                 />
//                                 <button 
//                                   type="button" 
//                                   onClick={() => toggleGuarantorDropdown(member.id, guarantorIndex)} 
//                                   className="px-2 py-1 bg-gray-200 rounded-md hover:bg-gray-300 text-sm transition-colors"
//                                 >
//                                   ↓
//                                 </button>
//                               </div>
//                               {activeGuarantorDropdown === dropdownKey && suggestions.length > 0 && (
//                                 <div className="guarantor-dropdown absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-32 overflow-y-auto">
//                                   {suggestions.map((suggestion) => (
//                                     <div 
//                                       key={suggestion.id} 
//                                       className="guarantor-suggestion px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0" 
//                                       onClick={() => handleGuarantorSelect(member.id, guarantorIndex, suggestion.name)}
//                                     >
//                                       <div className="font-medium text-gray-700 text-sm">{suggestion.name}</div>
//                                       <div className="text-xs text-gray-500">{suggestion.serialNo}</div>
//                                     </div>
//                                   ))}
//                                 </div>
//                               )}
//                               {activeGuarantorDropdown === dropdownKey && suggestions.length === 0 && memberGuarantors[guarantorIndex] && (
//                                 <div className="guarantor-dropdown absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
//                                   <div className="px-3 py-2 text-gray-500 text-center text-sm">
//                                     कोणतेही सदस्य सापडले नाहीत
//                                   </div>
//                                 </div>
//                               )}
//                               {memberGuarantors[guarantorIndex] && !canBeGuarantor(member.id, memberGuarantors[guarantorIndex]) && (
//                                 <p className="text-xs text-red-600 mt-1">या जामीनकडे आधीच २ हमी आहेत</p>
//                               )}
//                             </div>
//                           )
//                         })}
//                         {allGuarantors.length > 0 && (
//                           <div className="text-xs text-blue-600 mt-1">
//                             विद्यमान जामीन: {allGuarantors.join(', ')}
//                           </div>
//                         )}
//                       </div>
//                     )}
//                   </td>
//                   <td className="px-3 py-4 text-sm text-gray-900 w-32 text-center">
//                     <div className="font-semibold">₹{newPrincipal.toLocaleString()}</div>
//                     {borrowAmount > 0 && !readOnlyMode && (
//                       <div className="text-xs text-green-600">+₹{parseInt(borrowAmount).toLocaleString()}</div>
//                     )}
//                   </td>
//                   {!readOnlyMode && (
//                     <td className="px-3 py-4 w-24 text-center min-w-0">
//                       <button 
//                         onClick={() => processSingleBorrowing(member.id)} 
//                         disabled={!borrowAmount || parseInt(borrowAmount) <= 0} 
//                         className={`px-3 py-2 text-sm rounded-md w-full ${
//                           borrowAmount && parseInt(borrowAmount) > 0 
//                             ? 'bg-blue-600 text-white hover:bg-blue-700 transition-colors' 
//                             : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                         }`}
//                       >
//                         सबमिट करा
//                       </button>
//                     </td>
//                   )}
//                 </tr>
//               )
//             })}
//           </tbody>
//         </table>
//         {!readOnlyMode && borrowingSearchTerm && displayBorrowingMembers.length === 0 && (
//           <div className="px-6 py-8 text-center">
//             <div className="text-gray-500">
//               <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//               <p className="mt-2 text-lg font-medium">कोणतेही सदस्य सापडले नाहीत</p>
//               <p className="text-sm">भिन्न नाव किंवा अनुक्रमांकासह शोधण्याचा प्रयत्न करा</p>
//             </div>
//           </div>
//         )}
//         {readOnlyMode && getMembersWithMonthLoans.length === 0 && (
//           <div className="px-6 py-8 text-center">
//             <div className="text-gray-500">
//               <p className="text-lg font-medium">कोणतेही कर्ज डेटा उपलब्ध नाही</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }



'use client'
import { useState } from 'react'
import { monthsAPI } from '@/lib/api-client'

export default function Borrowing({ monthData, allMembers, date, onUpdate }) {
  const [selectedMember, setSelectedMember] = useState('')
  const [amount, setAmount] = useState('')
  const [interestRate, setInterestRate] = useState('0')
  const [dueDate, setDueDate] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  const [transactionId, setTransactionId] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Get borrowings from monthData
  const borrowings = monthData?.borrowings || []

  // Calculate interest amount
  const interestAmount = amount && interestRate ? (parseFloat(amount) * parseFloat(interestRate)) / 100 : 0

  const handleAddBorrowing = async (e) => {
    e.preventDefault()
    
    if (!selectedMember || !amount) {
      setError('Please select a member and enter an amount')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')

      await monthsAPI.addBorrowing(date, {
        memberId: selectedMember,
        amount: parseFloat(amount),
        interestRate: parseFloat(interestRate) || 0,
        dueDate: dueDate || null,
        paymentMethod,
        transactionId,
        notes
      })

      setSuccess('Borrowing added successfully!')
      
      // Reset form
      setSelectedMember('')
      setAmount('')
      setInterestRate('0')
      setDueDate('')
      setPaymentMethod('cash')
      setTransactionId('')
      setNotes('')
      
      // Refresh month data
      if (onUpdate) await onUpdate()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Failed to add borrowing')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBorrowing = async (borrowingId) => {
    if (!window.confirm('Are you sure you want to delete this borrowing record?')) {
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')

      await monthsAPI.deleteBorrowing(date, borrowingId)
      
      setSuccess('Borrowing deleted successfully!')
      
      // Refresh month data
      if (onUpdate) await onUpdate()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Failed to delete borrowing')
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

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'repaid':
        return 'bg-green-100 text-green-800'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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

      {/* Add Borrowing Form */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Borrowing</h3>
        
        <form onSubmit={handleAddBorrowing} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Member *</label>
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
                required
              >
                <option value="">Select Member</option>
                {allMembers
                  .filter(m => m.isBorrower || m.totalBorrowed > 0)
                  .map(member => (
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
                placeholder="25000"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="2"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interest Amount</label>
              <input
                type="text"
                value={formatCurrency(interestAmount)}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
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
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
              >
                {loading ? 'Adding...' : 'Add Borrowing'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-black"
              rows="2"
              placeholder="Additional notes (optional)"
            />
          </div>
        </form>
      </div>

      {/* Borrowings List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Borrowing Records ({borrowings.length})
        </h3>

        {borrowings.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">No borrowing records yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Interest</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {borrowings.map((borrowing) => (
                    <tr key={borrowing._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {borrowing.member?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-blue-600">
                        {formatCurrency(borrowing.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {borrowing.interestRate}% ({formatCurrency(borrowing.interestAmount)})
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-purple-600">
                        {formatCurrency(borrowing.amount + borrowing.interestAmount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {borrowing.dueDate ? formatDate(borrowing.dueDate) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {borrowing.paymentMethod?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(borrowing.status)}`}>
                          {borrowing.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDeleteBorrowing(borrowing._id)}
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

      {/* Summary */}
      {borrowings.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Borrowings</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(borrowings.reduce((sum, b) => sum + b.amount, 0))}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Interest</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(borrowings.reduce((sum, b) => sum + b.interestAmount, 0))}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Payable</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(borrowings.reduce((sum, b) => sum + b.amount + b.interestAmount, 0))}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}