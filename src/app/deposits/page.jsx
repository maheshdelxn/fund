'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authAPI, depositsAPI, membersAPI } from '@/lib/api-client'

export default function Deposits() {
  const [deposits, setDeposits] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingDeposit, setEditingDeposit] = useState(null)
  const [selectedMember, setSelectedMember] = useState('')
  const [editForm, setEditForm] = useState({ 
    memberId: '',
    name: '', 
    phone: '', 
    alternatePhone: '', 
    amount: '', 
    date: '',
    shares: '',
    shareAmount: ''
  })
  const [newDeposit, setNewDeposit] = useState({ 
    memberId: '',
    name: '', 
    phone: '', 
    alternatePhone: '', 
    amount: '', 
    date: '',
    shares: '',
    shareAmount: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  // Load deposits from API
  const loadDeposits = async () => {
    try {
      setLoading(true)
      const response = await depositsAPI.getAll()
      setDeposits(response.data)
    } catch (error) {
      console.error('Load deposits error:', error)
      setError('Failed to load deposits')
    } finally {
      setLoading(false)
    }
  }

  // Load members from API
  const loadMembers = async () => {
    try {
      const response = await membersAPI.getAll()
      setMembers(response.data)
    } catch (error) {
      console.error('Load members error:', error)
      setError('Failed to load members')
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await authAPI.getMe()
        await Promise.all([loadDeposits(), loadMembers()])
      } catch (error) {
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  // Handle member selection
  const handleMemberSelect = (memberId) => {
    setSelectedMember(memberId)
    const member = members.find(m => m._id === memberId)
    if (member) {
      setNewDeposit({
        ...newDeposit,
        memberId: member._id,
        name: member.name,
        phone: member.phone,
        alternatePhone: ''
      })
    }
  }

  const addDeposit = async () => {
    if (!newDeposit.name || !newDeposit.phone || !newDeposit.amount || !newDeposit.date || !newDeposit.shares) {
      setError('Please fill all required fields (Name, Phone, Amount, Date, and Shares)')
      return
    }

    try {
      setError('')
      setSuccess('')
      
      // Create deposit - API will auto-create member if memberId is not provided
      const depositData = {
        name: newDeposit.name,
        phone: newDeposit.phone,
        alternatePhone: newDeposit.alternatePhone,
        amount: parseFloat(newDeposit.amount),
        shares: parseInt(newDeposit.shares),
        date: newDeposit.date
      }

      // If member is selected, include memberId
      if (newDeposit.memberId) {
        depositData.memberId = newDeposit.memberId
      }

      await depositsAPI.create(depositData)
      setSuccess('Deposit added successfully!')
      
      // Reset form
      setNewDeposit({ 
        memberId: '',
        name: '', 
        phone: '', 
        alternatePhone: '', 
        amount: '', 
        date: '',
        shares: '',
        shareAmount: ''
      })
      setSelectedMember('')
      
      // Reload data
      await Promise.all([loadDeposits(), loadMembers()])
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error.message || 'Failed to add deposit')
    }
  }

  const startEditDeposit = (deposit) => {
    setEditingDeposit(deposit._id)
    setEditForm({
      name: deposit.name,
      phone: deposit.phone,
      alternatePhone: deposit.alternatePhone || '',
      amount: deposit.amount.toString(),
      date: deposit.date.split('T')[0],
      shares: deposit.shares.toString(),
      shareAmount: deposit.shareAmount.toString()
    })
  }

  const cancelEditDeposit = () => {
    setEditingDeposit(null)
    setEditForm({ 
      name: '', 
      phone: '', 
      alternatePhone: '', 
      amount: '', 
      date: '',
      shares: '',
      shareAmount: ''
    })
  }

  const saveEditDeposit = async () => {
    if (!editForm.name || !editForm.phone || !editForm.amount || !editForm.date || !editForm.shares) {
      setError('Please fill all required fields')
      return
    }

    try {
      setError('')
      setSuccess('')
      await depositsAPI.update(editingDeposit, {
        ...editForm,
        amount: parseFloat(editForm.amount),
        shares: parseInt(editForm.shares)
      })
      setSuccess('Deposit updated successfully!')
      setEditingDeposit(null)
      setEditForm({ 
        name: '', 
        phone: '', 
        alternatePhone: '', 
        amount: '', 
        date: '',
        shares: '',
        shareAmount: ''
      })
      await loadDeposits()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error.message || 'Failed to update deposit')
    }
  }

  const removeDeposit = async (depositId) => {
    if (!window.confirm('Are you sure you want to remove this deposit record?')) {
      return
    }

    try {
      setError('')
      setSuccess('')
      await depositsAPI.delete(depositId)
      setSuccess('Deposit deleted successfully!')
      await loadDeposits()
      
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error.message || 'Failed to delete deposit')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading deposits...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Deposit Management</h1>
            <Link 
              href="/dashboard" 
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Add Deposit Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Deposit</h2>
          
          {/* Member Selection */}
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Existing Member (Optional)
            </label>
            <select
              value={selectedMember}
              onChange={(e) => handleMemberSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="">-- Or Add New Member Below --</option>
              {members.map(member => (
                <option key={member._id} value={member._id}>
                  {member.name} - {member.phone}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-gray-600">
              Select an existing member or fill in the details below to create a new one
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-4">
            <input
              type="text"
              placeholder="Name *"
              value={newDeposit.name}
              onChange={(e) => setNewDeposit({...newDeposit, name: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            
            <input
              type="text"
              placeholder="Phone *"
              value={newDeposit.phone}
              onChange={(e) => setNewDeposit({...newDeposit, phone: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            
            <input
              type="text"
              placeholder="Alternate Phone (Optional)"
              value={newDeposit.alternatePhone}
              onChange={(e) => setNewDeposit({...newDeposit, alternatePhone: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            
            <input
              type="number"
              placeholder="Amount (₹) *"
              value={newDeposit.amount}
              onChange={(e) => setNewDeposit({...newDeposit, amount: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            
            <input
              type="number"
              placeholder="No. of Shares *"
              value={newDeposit.shares}
              onChange={(e) => {
                const shares = e.target.value;
                setNewDeposit({
                  ...newDeposit, 
                  shares: shares,
                  shareAmount: shares ? (parseInt(shares) * 1000).toString() : ''
                })
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            
            <input
              type="number"
              placeholder="Share Amount (₹)"
              value={newDeposit.shareAmount}
              readOnly
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-gray-50"
            />
            
            <input
              type="date"
              value={newDeposit.date}
              onChange={(e) => setNewDeposit({...newDeposit, date: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>
          <button 
            onClick={addDeposit}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Add Deposit
          </button>
        </div>

        {/* Deposit Records Table */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Deposit Records ({deposits.length})
          </h2>
          
          {deposits.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No deposit records found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alt Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Share Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deposits.map(deposit => (
                    <tr key={deposit._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {editingDeposit === deposit._id ? (
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                            className="px-2 py-1 border border-gray-300 rounded-md w-full text-black"
                          />
                        ) : (
                          <>
                            {deposit.member?.name || deposit.name}
                            {deposit.member && (
                              <span className="ml-2 text-xs text-gray-500">
                                (Member)
                              </span>
                            )}
                          </>
                        )}
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {editingDeposit === deposit._id ? (
                          <input
                            type="text"
                            value={editForm.phone}
                            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                            className="px-2 py-1 border border-gray-300 rounded-md w-full text-black"
                          />
                        ) : (
                          deposit.member?.phone || deposit.phone
                        )}
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {editingDeposit === deposit._id ? (
                          <input
                            type="text"
                            value={editForm.alternatePhone}
                            onChange={(e) => setEditForm({...editForm, alternatePhone: e.target.value})}
                            className="px-2 py-1 border border-gray-300 rounded-md w-full text-black"
                            placeholder="Optional"
                          />
                        ) : (
                          deposit.alternatePhone || '-'
                        )}
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {editingDeposit === deposit._id ? (
                          <input
                            type="date"
                            value={editForm.date}
                            onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                            className="px-2 py-1 border border-gray-300 rounded-md text-black"
                          />
                        ) : (
                          formatDate(deposit.date)
                        )}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {editingDeposit === deposit._id ? (
                          <input
                            type="number"
                            value={editForm.amount}
                            onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
                            className="px-2 py-1 border border-gray-300 rounded-md w-full text-black"
                          />
                        ) : (
                          formatCurrency(deposit.amount)
                        )}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {editingDeposit === deposit._id ? (
                          <input
                            type="number"
                            value={editForm.shares}
                            onChange={(e) => {
                              const shares = e.target.value;
                              setEditForm({
                                ...editForm, 
                                shares: shares,
                                shareAmount: shares ? (parseInt(shares) * 1000).toString() : ''
                              })
                            }}
                            className="px-2 py-1 border border-gray-300 rounded-md w-full text-black"
                          />
                        ) : (
                          deposit.shares
                        )}
                      </td>

                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {editingDeposit === deposit._id ? (
                          <input
                            type="number"
                            value={editForm.shareAmount}
                            readOnly
                            className="px-2 py-1 border border-gray-300 rounded-md w-full text-black bg-gray-50"
                          />
                        ) : (
                          formatCurrency(deposit.shareAmount)
                        )}
                      </td>
                      
                      <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
                        {editingDeposit === deposit._id ? (
                          <>
                            <button 
                              onClick={saveEditDeposit}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button 
                              onClick={cancelEditDeposit}
                              className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => startEditDeposit(deposit)}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => removeDeposit(deposit._id)}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}





// 'use client'
// import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'

// export default function Deposits() {
//   const [deposits, setDeposits] = useState([])
//   const [editingDeposit, setEditingDeposit] = useState(null)
//   const [editForm, setEditForm] = useState({ 
//     name: '', 
//     phone: '', 
//     alternatePhone: '', 
//     amount: '', 
//     date: '',
//     shares: '',
//     shareAmount: ''
//   })
//   const [newDeposit, setNewDeposit] = useState({ 
//     name: '', 
//     phone: '', 
//     alternatePhone: '', 
//     amount: '', 
//     date: '',
//     shares: '',
//     shareAmount: ''
//   })
//   const router = useRouter()

//   // Load deposit records from localStorage
//   useEffect(() => {
//     const isLoggedIn = localStorage.getItem('isLoggedIn')
//     // if (isLoggedIn !== 'true') {
//     //   router.push('/login')
//     //   return
//     // }

//     // Load deposit records
//     const savedDeposits = localStorage.getItem('deposits')
//     if (savedDeposits) {
//       setDeposits(JSON.parse(savedDeposits))
//     }
//   }, [router])

//   // Save deposits to localStorage whenever it changes
//   useEffect(() => {
//     localStorage.setItem('deposits', JSON.stringify(deposits))
//   }, [deposits])

//   const addDeposit = () => {
//     if (newDeposit.name && newDeposit.phone && newDeposit.amount && newDeposit.date && newDeposit.shares) {
//       const deposit = {
//         id: Date.now().toString(),
//         name: newDeposit.name,
//         phone: newDeposit.phone,
//         alternatePhone: newDeposit.alternatePhone,
//         amount: parseFloat(newDeposit.amount),
//         date: newDeposit.date,
//         shares: parseInt(newDeposit.shares),
//         shareAmount: parseFloat(newDeposit.shareAmount) || parseInt(newDeposit.shares) * 1000,
//         createdAt: new Date().toISOString()
//       }

//       setDeposits(prevDeposits => [deposit, ...prevDeposits])
//       setNewDeposit({ 
//         name: '', 
//         phone: '', 
//         alternatePhone: '', 
//         amount: '', 
//         date: '',
//         shares: '',
//         shareAmount: ''
//       })
//     } else {
//       alert('Please fill all required fields (Name, Phone, Amount, Date, and Shares)')
//     }
//   }

//   const startEditDeposit = (deposit) => {
//     setEditingDeposit(deposit.id)
//     setEditForm({
//       name: deposit.name,
//       phone: deposit.phone,
//       alternatePhone: deposit.alternatePhone || '',
//       amount: deposit.amount.toString(),
//       date: deposit.date,
//       shares: deposit.shares.toString(),
//       shareAmount: deposit.shareAmount.toString()
//     })
//   }

//   const cancelEditDeposit = () => {
//     setEditingDeposit(null)
//     setEditForm({ 
//       name: '', 
//       phone: '', 
//       alternatePhone: '', 
//       amount: '', 
//       date: '',
//       shares: '',
//       shareAmount: ''
//     })
//   }

//   const saveEditDeposit = () => {
//     if (editForm.name && editForm.phone && editForm.amount && editForm.date && editForm.shares && editingDeposit) {
//       setDeposits(prevDeposits => 
//         prevDeposits.map(deposit =>
//           deposit.id === editingDeposit
//             ? { 
//                 ...deposit, 
//                 name: editForm.name,
//                 phone: editForm.phone,
//                 alternatePhone: editForm.alternatePhone,
//                 amount: parseFloat(editForm.amount), 
//                 date: editForm.date,
//                 shares: parseInt(editForm.shares),
//                 shareAmount: parseFloat(editForm.shareAmount) || parseInt(editForm.shares) * 1000
//               }
//             : deposit
//         )
//       )
      
//       setEditingDeposit(null)
//       setEditForm({ 
//         name: '', 
//         phone: '', 
//         alternatePhone: '', 
//         amount: '', 
//         date: '',
//         shares: '',
//         shareAmount: ''
//       })
//     } else {
//       alert('Please fill all required fields')
//     }
//   }

//   const removeDeposit = (depositId) => {
//     if (window.confirm('Are you sure you want to remove this deposit record?')) {
//       setDeposits(prevDeposits => prevDeposits.filter(deposit => deposit.id !== depositId))
//     }
//   }

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR'
//     }).format(amount)
//   }

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-IN')
//   }

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <h1 className="text-2xl font-bold text-gray-900">Deposit Management</h1>
//             <Link 
//               href="/dashboard" 
//               className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
//             >
//               ← Back to Dashboard
//             </Link>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Add Deposit Form */}
//         <div className="bg-white rounded-lg shadow-md p-6 mb-8">
//           <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Deposit</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 mb-4">
//             <input
//               type="text"
//               placeholder="Name *"
//               value={newDeposit.name}
//               onChange={(e) => setNewDeposit({...newDeposit, name: e.target.value})}
//               className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
//             />
            
//             <input
//               type="text"
//               placeholder="Phone *"
//               value={newDeposit.phone}
//               onChange={(e) => setNewDeposit({...newDeposit, phone: e.target.value})}
//               className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
//             />
            
//             <input
//               type="text"
//               placeholder="Alternate Phone (Optional)"
//               value={newDeposit.alternatePhone}
//               onChange={(e) => setNewDeposit({...newDeposit, alternatePhone: e.target.value})}
//               className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
//             />
            
//             <input
//               type="number"
//               placeholder="Amount (₹) *"
//               value={newDeposit.amount}
//               onChange={(e) => setNewDeposit({...newDeposit, amount: e.target.value})}
//               className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
//             />
            
//             <input
//               type="number"
//               placeholder="No. of Shares *"
//               value={newDeposit.shares}
//               onChange={(e) => {
//                 const shares = e.target.value;
//                 setNewDeposit({
//                   ...newDeposit, 
//                   shares: shares,
//                   shareAmount: shares ? (parseInt(shares) * 1000).toString() : ''
//                 })
//               }}
//               className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
//             />
            
//             <input
//               type="number"
//               placeholder="Share Amount (₹)"
//               value={newDeposit.shareAmount}
//               onChange={(e) => setNewDeposit({...newDeposit, shareAmount: e.target.value})}
//               className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-gray-50"
//               readOnly
//             />
            
//             <input
//               type="date"
//               value={newDeposit.date}
//               onChange={(e) => setNewDeposit({...newDeposit, date: e.target.value})}
//               className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
//             />
//           </div>
//           <button 
//             onClick={addDeposit}
//             className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
//           >
//             Add Deposit
//           </button>
//         </div>

//         {/* Deposit Records Table */}
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h2 className="text-lg font-semibold text-gray-800 mb-4">
//             Deposit Records ({deposits.length})
//           </h2>
          
//           {deposits.length === 0 ? (
//             <div className="text-center py-8">
//               <p className="text-gray-600">No deposit records found.</p>
//             </div>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alt Phone</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Share Amount</th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {deposits.map(deposit => (
//                     <tr key={deposit.id} className="hover:bg-gray-50">
//                       <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                         {editingDeposit === deposit.id ? (
//                           <input
//                             type="text"
//                             value={editForm.name}
//                             onChange={(e) => setEditForm({...editForm, name: e.target.value})}
//                             className="px-2 py-1 border border-gray-300 rounded-md w-full text-black"
//                           />
//                         ) : (
//                           deposit.name
//                         )}
//                       </td>
                      
//                       <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {editingDeposit === deposit.id ? (
//                           <input
//                             type="text"
//                             value={editForm.phone}
//                             onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
//                             className="px-2 py-1 border border-gray-300 rounded-md w-full text-black"
//                           />
//                         ) : (
//                           deposit.phone
//                         )}
//                       </td>
                      
//                       <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {editingDeposit === deposit.id ? (
//                           <input
//                             type="text"
//                             value={editForm.alternatePhone}
//                             onChange={(e) => setEditForm({...editForm, alternatePhone: e.target.value})}
//                             className="px-2 py-1 border border-gray-300 rounded-md w-full text-black"
//                             placeholder="Optional"
//                           />
//                         ) : (
//                           deposit.alternatePhone || '-'
//                         )}
//                       </td>
                      
//                       <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {editingDeposit === deposit.id ? (
//                           <input
//                             type="date"
//                             value={editForm.date}
//                             onChange={(e) => setEditForm({...editForm, date: e.target.value})}
//                             className="px-2 py-1 border border-gray-300 rounded-md text-black"
//                           />
//                         ) : (
//                           formatDate(deposit.date)
//                         )}
//                       </td>

//                       <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
//                         {editingDeposit === deposit.id ? (
//                           <input
//                             type="number"
//                             value={editForm.amount}
//                             onChange={(e) => setEditForm({...editForm, amount: e.target.value})}
//                             className="px-2 py-1 border border-gray-300 rounded-md w-full text-black"
//                           />
//                         ) : (
//                           formatCurrency(deposit.amount)
//                         )}
//                       </td>

//                       <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
//                         {editingDeposit === deposit.id ? (
//                           <input
//                             type="number"
//                             value={editForm.shares}
//                             onChange={(e) => {
//                               const shares = e.target.value;
//                               setEditForm({
//                                 ...editForm, 
//                                 shares: shares,
//                                 shareAmount: shares ? (parseInt(shares) * 1000).toString() : ''
//                               })
//                             }}
//                             className="px-2 py-1 border border-gray-300 rounded-md w-full text-black"
//                           />
//                         ) : (
//                           deposit.shares
//                         )}
//                       </td>

//                       <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
//                         {editingDeposit === deposit.id ? (
//                           <input
//                             type="number"
//                             value={editForm.shareAmount}
//                             onChange={(e) => setEditForm({...editForm, shareAmount: e.target.value})}
//                             className="px-2 py-1 border border-gray-300 rounded-md w-full text-black bg-gray-50"
//                             readOnly
//                           />
//                         ) : (
//                           formatCurrency(deposit.shareAmount)
//                         )}
//                       </td>
                      
//                       <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
//                         {editingDeposit === deposit.id ? (
//                           <>
//                             <button 
//                               onClick={saveEditDeposit}
//                               className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
//                             >
//                               Save
//                             </button>
//                             <button 
//                               onClick={cancelEditDeposit}
//                               className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
//                             >
//                               Cancel
//                             </button>
//                           </>
//                         ) : (
//                           <>
//                             <button 
//                               onClick={() => startEditDeposit(deposit)}
//                               className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
//                             >
//                               Edit
//                             </button>
//                             <button 
//                               onClick={() => removeDeposit(deposit.id)}
//                               className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
//                             >
//                               Delete
//                             </button>
//                           </>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </div>
//       </main>
//     </div>
//   )
// }