// 'use client'
// import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'

// export default function Members() {
//   const [members, setMembers] = useState([])
//   const [newMember, setNewMember] = useState({ name: '', email: '', phone: '' })
//   const [editingMember, setEditingMember] = useState(null)
//   const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' })
//   const router = useRouter()

//   // Load members from localStorage on component mount
//   useEffect(() => {
//     const isLoggedIn = localStorage.getItem('isLoggedIn')
//     if (isLoggedIn !== 'true') {
//       router.push('/login')
//       return
//     }

//     const savedMembers = localStorage.getItem('members')
//     if (savedMembers) {
//       setMembers(JSON.parse(savedMembers))
//     } else {
//       // Initialize with default members if none exist
//       const defaultMembers = [
//         { id: 1, name: 'John Doe', email: 'john@email.com', phone: '123-456-7890', joinDate: '2024-01-15' },
//         { id: 2, name: 'Jane Smith', email: 'jane@email.com', phone: '123-456-7891', joinDate: '2024-01-20' },
//         { id: 3, name: 'Mike Johnson', email: 'mike@email.com', phone: '123-456-7892', joinDate: '2024-02-01' }
//       ]
//       setMembers(defaultMembers)
//       localStorage.setItem('members', JSON.stringify(defaultMembers))
//     }
//   }, [router])

//   // Save members to localStorage whenever members array changes
//   useEffect(() => {
//     if (members.length > 0) {
//       localStorage.setItem('members', JSON.stringify(members))
//     }
//   }, [members])

//   const addMember = () => {
//     if (newMember.name && newMember.email) {
//       const member = {
//         id: members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1,
//         ...newMember,
//         joinDate: new Date().toISOString().split('T')[0]
//       }
//       const updatedMembers = [...members, member]
//       setMembers(updatedMembers)
//       setNewMember({ name: '', email: '', phone: '' })
//     }
//   }

//   const removeMember = (id) => {
//     if (window.confirm('Are you sure you want to remove this member?')) {
//       setMembers(members.filter(member => member.id !== id))
//     }
//   }

//   const startEdit = (member) => {
//     setEditingMember(member.id)
//     setEditForm({
//       name: member.name,
//       email: member.email,
//       phone: member.phone
//     })
//   }

//   const cancelEdit = () => {
//     setEditingMember(null)
//     setEditForm({ name: '', email: '', phone: '' })
//   }

//   const saveEdit = (id) => {
//     if (editForm.name && editForm.email) {
//       const updatedMembers = members.map(member =>
//         member.id === id
//           ? { ...member, ...editForm }
//           : member
//       )
//       setMembers(updatedMembers)
//       setEditingMember(null)
//       setEditForm({ name: '', email: '', phone: '' })
//     }
//   }

//   const handleEditChange = (field, value) => {
//     setEditForm(prev => ({ ...prev, [field]: value }))
//   }

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <h1 className="text-2xl font-bold text-gray-900">Member Management</h1>
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
//         {/* Add Member Form */}
//         <div className="bg-white rounded-lg shadow-md p-6 mb-8">
//           <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Member</h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//             <input
//               type="text"
//               placeholder="Full Name"
//               value={newMember.name}
//               onChange={(e) => setNewMember({...newMember, name: e.target.value})}
//               className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
//             />
//             <input
//               type="email"
//               placeholder="Email"
//               value={newMember.email}
//               onChange={(e) => setNewMember({...newMember, email: e.target.value})}
//               className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
//             />
//             <input
//               type="tel"
//               placeholder="Phone"
//               value={newMember.phone}
//               onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
//               className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 "
//             />
//           </div>
//           <button 
//             onClick={addMember}
//             className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             Add Member
//           </button>
//         </div>

//         {/* Members List */}
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h2 className="text-lg font-semibold text-gray-800 mb-4">
//             Members List ({members.length})
//           </h2>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {members.map(member => (
//                   <tr key={member.id} className="hover:bg-gray-50">
//                     <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {editingMember === member.id ? (
//                         <input
//                           type="text"
//                           value={editForm.name}
//                           onChange={(e) => handleEditChange('name', e.target.value)}
//                           className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
//                         />
//                       ) : (
//                         member.name
//                       )}
//                     </td>
//                     <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {editingMember === member.id ? (
//                         <input
//                           type="email"
//                           value={editForm.email}
//                           onChange={(e) => handleEditChange('email', e.target.value)}
//                           className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
//                         />
//                       ) : (
//                         member.email
//                       )}
//                     </td>
//                     <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {editingMember === member.id ? (
//                         <input
//                           type="tel"
//                           value={editForm.phone}
//                           onChange={(e) => handleEditChange('phone', e.target.value)}
//                           className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
//                         />
//                       ) : (
//                         member.phone
//                       )}
//                     </td>
//                     <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{member.joinDate}</td>
//                     <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
//                       {editingMember === member.id ? (
//                         <>
//                           <button 
//                             onClick={() => saveEdit(member.id)}
//                             className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
//                           >
//                             Save
//                           </button>
//                           <button 
//                             onClick={cancelEdit}
//                             className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
//                           >
//                             Cancel
//                           </button>
//                         </>
//                       ) : (
//                         <>
//                           <button 
//                             onClick={() => startEdit(member)}
//                             className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                           >
//                             Edit
//                           </button>
//                           <button 
//                             onClick={() => removeMember(member.id)}
//                             className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
//                           >
//                             Remove
//                           </button>
//                         </>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }


'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authAPI, membersAPI } from '@/lib/api-client'

// Modal Component for Defaulter History
const DefaulterHistoryModal = ({ member, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(null) // monthId being updated

  const handleAddPenalty = async (monthId, monthName, currentAmount) => {
    const amount = prompt(`Enter penalty amount for ${monthName}:`, currentAmount || 0)
    if (amount === null) return // Cancelled

    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount < 0) {
      alert('Please enter a valid amount')
      return
    }

    try {
      setLoading(monthId)
      // Call penalty API
      const response = await fetch('/api/members/penalty', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: member._id,
          monthId,
          monthName,
          amount: numAmount
        })
      })

      const data = await response.json()
      if (data.success) {
        // Refresh member data
        onUpdate()
      } else {
        alert(data.error || 'Failed to update penalty')
      }
    } catch (error) {
      console.error('Error adding penalty:', error)
      alert('Failed to update penalty')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-red-600">
            Unpaid Months History - {member.name}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        {member.unpaidMonths && member.unpaidMonths.length > 0 ? (
          <div className="space-y-4">
            <p className="text-gray-600 mb-2">
              This member has missed payments for the following months:
            </p>
            <div className="border rounded-lg divide-y">
              {member.unpaidMonths.map((month) => (
                <div key={month._id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <div className="font-medium text-gray-800">{month.name}</div>
                    <div className="text-sm text-red-500">Payment Pending</div>
                    {month.penaltyAmount > 0 && (
                      <div className="text-xs text-orange-600 font-medium">
                        Penalty Applied: ₹{month.penaltyAmount}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddPenalty(month._id, month.name, month.penaltyAmount)}
                    disabled={loading === month._id}
                    className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200 border border-red-200"
                  >
                    {loading === month._id ? 'Saving...' : (month.penaltyAmount > 0 ? 'Update Penalty' : 'Add Penalty')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No unpaid months found in recent history.</p>
        )}

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Members() {
  const [members, setMembers] = useState([])
  const [selectedDefaulter, setSelectedDefaulter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newMember, setNewMember] = useState({ name: '', address: '', phone: '' })
  const [editingMember, setEditingMember] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', address: '', phone: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  // Load members from API
  const loadMembers = async () => {
    try {
      setLoading(true)
      const response = await membersAPI.getAll()
      setMembers(response.data)
    } catch (error) {
      console.error('Load members error:', error)
      setError('Failed to load members')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await authAPI.getMe()
        await loadMembers()
      } catch (error) {
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  const addMember = async () => {
    if (!newMember.name || !newMember.address || !newMember.phone) {
      setError('Please fill all fields')
      return
    }

    try {
      setError('')
      setSuccess('')
      await membersAPI.create(newMember)
      setSuccess('Member added successfully!')
      setNewMember({ name: '', address: '', phone: '' })
      await loadMembers()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error.message || 'Failed to add member')
    }
  }

  const removeMember = async (id) => {
    if (!window.confirm('Are you sure you want to remove this member?')) {
      return
    }

    try {
      setError('')
      setSuccess('')
      await membersAPI.delete(id)
      setSuccess('Member removed successfully!')
      await loadMembers()

      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error.message || 'Failed to remove member')
    }
  }

  const startEdit = (member) => {
    setEditingMember(member._id)
    setEditForm({
      name: member.name,
      address: member.address,
      phone: member.phone
    })
  }

  const cancelEdit = () => {
    setEditingMember(null)
    setEditForm({ name: '', address: '', phone: '' })
  }

  const saveEdit = async (id) => {
    if (!editForm.name || !editForm.address || !editForm.phone) {
      setError('Please fill all fields')
      return
    }

    try {
      setError('')
      setSuccess('')
      await membersAPI.update(id, editForm)
      setSuccess('Member updated successfully!')
      setEditingMember(null)
      setEditForm({ name: '', address: '', phone: '' })
      await loadMembers()

      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error.message || 'Failed to update member')
    }
  }

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading members...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Member Management</h1>
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

        {/* Add Member Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Member</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Full Name"
              value={newMember.name}
              onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            <input
              type="text"
              placeholder="Address"
              value={newMember.address}
              onChange={(e) => setNewMember({ ...newMember, address: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={newMember.phone}
              onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>
          <button
            onClick={addMember}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add Member
          </button>
        </div>

        {/* Members List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Members List ({members.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {members.map(member => (
                  <tr key={member._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingMember === member._id ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => handleEditChange('name', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                        />
                      ) : (
                        <span
                          className={`cursor-pointer hover:underline ${member.isDefaulter ? 'text-red-600 font-bold' : 'text-gray-900'}`}
                          onClick={() => {
                            if (member.isDefaulter) {
                              setSelectedDefaulter(member)
                            }
                          }}
                          title={member.isDefaulter ? "Click to view unpaid history" : ""}
                        >
                          {member.name}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingMember === member._id ? (
                        <input
                          type="text"
                          value={editForm.address}
                          onChange={(e) => handleEditChange('address', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                        />
                      ) : (
                        member.address
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingMember === member._id ? (
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => handleEditChange('phone', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                        />
                      ) : (
                        member.phone
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(member.joinDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
                      {editingMember === member._id ? (
                        <>
                          <button
                            onClick={() => saveEdit(member._id)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href={`/members/${member._id}`}
                            className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 inline-block"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => startEdit(member)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => removeMember(member._id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Defaulter Modal */}
      {selectedDefaulter && (
        <DefaulterHistoryModal
          member={selectedDefaulter}
          onClose={() => setSelectedDefaulter(null)}
          onUpdate={async () => {
            // Reload members to reflect changes (and potentially updated penalties)
            await loadMembers()
            // We need to re-find the selected defaulter from the new list to update the modal content
            // Identifying by ID since the member object reference changes
            // Actually, loadMembers updates 'members' state. 
            // We should update 'selectedDefaulter' with the new data.
            // But we can't easily grab it here without waiting.
            // Simpler: The modal stays open, but we need fresh data passed to it.
            // We can do: setSelectedDefaulter(null) then open again? No.
            // Better: Pass a refresh handler that handles re-fetching and updating local selectedDefaulter.

            // For now, loadMembers() runs. The modal uses 'selectedDefaulter' state.
            // We should update selectedDefaulter with the fresh object from the NEW members list.
            // This requires an effect or finding it.
            // Let's rely on loadMembers finishing, then finding the member:
            const response = await membersAPI.getAll()
            setMembers(response.data)
            const updatedDefaulter = response.data.find(m => m._id === selectedDefaulter._id)
            if (updatedDefaulter) {
              setSelectedDefaulter(updatedDefaulter)
            }
          }}
        />
      )}
    </div>
  )
}













































// 'use client'
// import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'

// export default function Members() {
//   const [members, setMembers] = useState([])
//   const [newMember, setNewMember] = useState({ name: '', email: '', phone: '' })
//   const [editingMember, setEditingMember] = useState(null)
//   const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' })
//   const router = useRouter()

//   // Load members from localStorage on component mount
//   useEffect(() => {
//     const isLoggedIn = localStorage.getItem('isLoggedIn')
//     // if (isLoggedIn !== 'true') {
//     //   router.push('/login')
//     //   return
//     // }

//     const savedMembers = localStorage.getItem('members')
//     if (savedMembers) {
//       setMembers(JSON.parse(savedMembers))
//     } else {
//       // Initialize with default members if none exist
//       const defaultMembers = [
//         { id: 1, name: 'John Doe', email: 'john@email.com', phone: '123-456-7890', joinDate: '2024-01-15' },
//         { id: 2, name: 'Jane Smith', email: 'jane@email.com', phone: '123-456-7891', joinDate: '2024-01-20' },
//         { id: 3, name: 'Mike Johnson', email: 'mike@email.com', phone: '123-456-7892', joinDate: '2024-02-01' }
//       ]
//       setMembers(defaultMembers)
//       localStorage.setItem('members', JSON.stringify(defaultMembers))
//     }
//   }, [router])

//   // Save members to localStorage whenever members array changes
//   useEffect(() => {
//     if (members.length > 0) {
//       localStorage.setItem('members', JSON.stringify(members))
//     }
//   }, [members])

//   const addMember = () => {
//     if (newMember.name && newMember.email) {
//       const member = {
//         id: members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1,
//         ...newMember,
//         joinDate: new Date().toISOString().split('T')[0]
//       }
//       const updatedMembers = [...members, member]
//       setMembers(updatedMembers)
//       setNewMember({ name: '', email: '', phone: '' })
//     }
//   }

//   const removeMember = (id) => {
//     if (window.confirm('Are you sure you want to remove this member?')) {
//       setMembers(members.filter(member => member.id !== id))
//     }
//   }

//   const startEdit = (member) => {
//     setEditingMember(member.id)
//     setEditForm({
//       name: member.name,
//       email: member.email,
//       phone: member.phone
//     })
//   }

//   const cancelEdit = () => {
//     setEditingMember(null)
//     setEditForm({ name: '', email: '', phone: '' })
//   }

//   const saveEdit = (id) => {
//     if (editForm.name && editForm.email) {
//       const updatedMembers = members.map(member =>
//         member.id === id
//           ? { ...member, ...editForm }
//           : member
//       )
//       setMembers(updatedMembers)
//       setEditingMember(null)
//       setEditForm({ name: '', email: '', phone: '' })
//     }
//   }

//   const handleEditChange = (field, value) => {
//     setEditForm(prev => ({ ...prev, [field]: value }))
//   }

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center py-4">
//             <h1 className="text-2xl font-bold text-gray-900">Member Management</h1>
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
//         {/* Add Member Form */}
//         <div className="bg-white rounded-lg shadow-md p-6 mb-8">
//           <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Member</h2>
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
//             <input
//               type="text"
//               placeholder="Full Name"
//               value={newMember.name}
//               onChange={(e) => setNewMember({...newMember, name: e.target.value})}
//               className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
//             />
//             <input
//               type="email"
//               placeholder="Email"
//               value={newMember.email}
//               onChange={(e) => setNewMember({...newMember, email: e.target.value})}
//               className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
//             />
//             <input
//               type="tel"
//               placeholder="Phone"
//               value={newMember.phone}
//               onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
//               className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 "
//             />
//           </div>
//           <button
//             onClick={addMember}
//             className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             Add Member
//           </button>
//         </div>

//         {/* Members List */}
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h2 className="text-lg font-semibold text-gray-800 mb-4">
//             Members List ({members.length})
//           </h2>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {members.map(member => (
//                   <tr key={member.id} className="hover:bg-gray-50">
//                     <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {editingMember === member.id ? (
//                         <input
//                           type="text"
//                           value={editForm.name}
//                           onChange={(e) => handleEditChange('name', e.target.value)}
//                           className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
//                         />
//                       ) : (
//                         member.name
//                       )}
//                     </td>
//                     <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {editingMember === member.id ? (
//                         <input
//                           type="email"
//                           value={editForm.email}
//                           onChange={(e) => handleEditChange('email', e.target.value)}
//                           className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
//                         />
//                       ) : (
//                         member.email
//                       )}
//                     </td>
//                     <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
//                       {editingMember === member.id ? (
//                         <input
//                           type="tel"
//                           value={editForm.phone}
//                           onChange={(e) => handleEditChange('phone', e.target.value)}
//                           className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
//                         />
//                       ) : (
//                         member.phone
//                       )}
//                     </td>
//                     <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{member.joinDate}</td>
//                     <td className="px-4 py-4 whitespace-nowrap text-sm space-x-2">
//                       {editingMember === member.id ? (
//                         <>
//                           <button
//                             onClick={() => saveEdit(member.id)}
//                             className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
//                           >
//                             Save
//                           </button>
//                           <button
//                             onClick={cancelEdit}
//                             className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
//                           >
//                             Cancel
//                           </button>
//                         </>
//                       ) : (
//                         <>
//                           <button
//                             onClick={() => startEdit(member)}
//                             className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                           >
//                             Edit
//                           </button>
//                           <button
//                             onClick={() => removeMember(member.id)}
//                             className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
//                           >
//                             Remove
//                           </button>
//                         </>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }