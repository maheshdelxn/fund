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

export default function Members() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [newMember, setNewMember] = useState({ name: '', email: '', phone: '' })
  const [editingMember, setEditingMember] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '' })
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
    if (!newMember.name || !newMember.email || !newMember.phone) {
      setError('Please fill all fields')
      return
    }

    try {
      setError('')
      setSuccess('')
      await membersAPI.create(newMember)
      setSuccess('Member added successfully!')
      setNewMember({ name: '', email: '', phone: '' })
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
      email: member.email,
      phone: member.phone
    })
  }

  const cancelEdit = () => {
    setEditingMember(null)
    setEditForm({ name: '', email: '', phone: '' })
  }

  const saveEdit = async (id) => {
    if (!editForm.name || !editForm.email || !editForm.phone) {
      setError('Please fill all fields')
      return
    }

    try {
      setError('')
      setSuccess('')
      await membersAPI.update(id, editForm)
      setSuccess('Member updated successfully!')
      setEditingMember(null)
      setEditForm({ name: '', email: '', phone: '' })
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
              onChange={(e) => setNewMember({...newMember, name: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            <input
              type="email"
              placeholder="Email"
              value={newMember.email}
              onChange={(e) => setNewMember({...newMember, email: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={newMember.phone}
              onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
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
                        member.name
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingMember === member._id ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => handleEditChange('email', e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-black"
                        />
                      ) : (
                        member.email
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