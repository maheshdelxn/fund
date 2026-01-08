'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authAPI, membersAPI } from '@/lib/api-client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { UserPlus, Search, Edit2, Trash2, AlertCircle, CheckCircle, X } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'

// Modal Component for Defaulter History
const DefaulterHistoryModal = ({ member, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(null) // monthId being updated

  const handleAddPenalty = async (monthId, monthName, currentAmount) => {
    const amount = prompt(`दंड रक्कम प्रविष्ट करा ${monthName}:`, currentAmount || 0)
    if (amount === null) return // Cancelled

    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount < 0) {
      alert('कृपया वैध रक्कम प्रविष्ट करा')
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
        alert(data.error || 'दंड अद्यतनित करण्यात अयशस्वी')
      }
    } catch (error) {
      console.error('Error adding penalty:', error)
      alert('दंड अद्यतनित करण्यात अयशस्वी')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-xl border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <AlertCircle className="text-red-500" />
            थकबाकी महिने इतिहास (Unpaid History)
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="mb-4 p-4 bg-red-50 rounded-xl border border-red-100">
          <p className="font-semibold text-red-800 text-lg">{member.name}</p>
          <p className="text-red-600 text-sm">पेमेंट थकबाकीदार इतिहास</p>
        </div>

        {member.unpaidMonths && member.unpaidMonths.length > 0 ? (
          <div className="space-y-4">
            <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50">
              {member.unpaidMonths.map((month) => (
                <div key={month._id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="font-medium text-gray-800">{month.name}</div>
                    <div className="text-sm text-red-500 font-medium bg-red-50 inline-block px-2 py-0.5 rounded-full mt-1">पेमेंट बाकी</div>
                    {month.penaltyAmount > 0 && (
                      <div className="text-xs text-orange-600 font-medium mt-1">
                        दंड लावला: ₹{month.penaltyAmount}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddPenalty(month._id, month.name, month.penaltyAmount)}
                    disabled={loading === month._id}
                    className="text-sm font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 px-3 py-2 rounded-lg transition-colors"
                  >
                    {loading === month._id ? 'सेव्ह करत आहे...' : (month.penaltyAmount > 0 ? 'दंड संपादित करा' : 'दंड जोडा')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
            <p className="text-gray-500">अलीकडील इतिहासात कोणतेही थकबाकी महिने आढळले नाहीत.</p>
          </div>
        )}

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
          >
            बंद करा
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Members() {
  const [user, setUser] = useState(null)
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
      setError('सभासद लोड करण्यास अयशस्वी')
    } finally {
      // Delay slightly for smooth transition
      setTimeout(() => setLoading(false), 300)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authAPI.getMe()
        setUser(userData) // Helper for layout
        await loadMembers()
      } catch (error) {
        // router.push('/login')
        // Mock for dev
        setUser({ name: 'Admin User' })
        await loadMembers()
      }
    }

    checkAuth()
  }, [router])

  const addMember = async () => {
    if (!newMember.name || !newMember.address || !newMember.phone) {
      setError('कृपया सर्व रकाने भरा')
      return
    }

    try {
      setError('')
      setSuccess('')
      await membersAPI.create(newMember)
      setSuccess('सभासद यशस्वीरित्या जोडले!')
      setNewMember({ name: '', address: '', phone: '' })
      await loadMembers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error.message || 'सभासद जोडण्यास अयशस्वी')
    }
  }

  const removeMember = async (id) => {
    if (!window.confirm('तुम्हाला खात्री आहे की तुम्ही या सभासदाला काढू इच्छिता?')) {
      return
    }

    try {
      setError('')
      setSuccess('')
      await membersAPI.delete(id)
      setSuccess('सभासद यशस्वीरित्या काढले!')
      await loadMembers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error.message || 'सभासद काढण्यास अयशस्वी')
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
      setError('कृपया सर्व रकाने भरा')
      return
    }

    try {
      setError('')
      setSuccess('')
      await membersAPI.update(id, editForm)
      setSuccess('सभासद यशस्वीरित्या अद्यतनित केले!')
      setEditingMember(null)
      setEditForm({ name: '', address: '', phone: '' })
      await loadMembers()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error.message || 'सभासद अद्यतनित करण्यास अयशस्वी')
    }
  }

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  if (loading) return (
    <DashboardLayout user={user || { name: 'User' }}>
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>

        {/* Add Member Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <Skeleton className="h-6 w-40 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1"><Skeleton className="h-3 w-20" /><Skeleton className="h-10 w-full rounded-xl" /></div>
            <div className="space-y-1"><Skeleton className="h-3 w-20" /><Skeleton className="h-10 w-full rounded-xl" /></div>
            <div className="space-y-1"><Skeleton className="h-3 w-20" /><Skeleton className="h-10 w-full rounded-xl" /></div>
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">सभासद (Members)</h1>
            <p className="text-gray-500 text-sm">संस्थेचे सभासद व्यवस्थापित करा आणि इतिहास पहा</p>
          </div>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <CheckCircle size={18} />
            {success}
          </div>
        )}

        {/* Add Member Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-4 text-gray-800 font-semibold">
            <UserPlus size={20} className="text-teal-600" />
            <h2>नवीन सभासद जोडा</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase">पूर्ण नाव</label>
              <input
                type="text"
                placeholder="उदा. राहुल पाटील"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase">पत्ता</label>
              <input
                type="text"
                placeholder="उदा. शिवाजी नगर"
                value={newMember.address}
                onChange={(e) => setNewMember({ ...newMember, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase">फोन</label>
              <input
                type="tel"
                placeholder="उदा. 9876543210"
                value={newMember.phone}
                onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={addMember}
              className="bg-teal-600 text-white px-6 py-2.5 rounded-xl hover:bg-teal-700 font-medium transition-colors shadow-lg shadow-teal-200/50"
            >
              सभासद जोडा
            </button>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">सर्व सभासद</h2>
            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
              एकूण: {members.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">सभासद आयडी</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">नाव</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">पत्ता</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">फोन</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">सामील दिनांक</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">क्रिया</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {members.map(member => (
                  <tr key={member._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-teal-600 font-mono">
                      {member.serialNo}
                    </td>
                    <td className="px-6 py-4">
                      {editingMember === member._id ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => handleEditChange('name', e.target.value)}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none w-full"
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${member.isDefaulter ? 'bg-red-100 text-red-600' : 'bg-teal-100 text-teal-600'}`}>
                            {member.name.charAt(0)}
                          </div>
                          <span
                            className={`font-medium cursor-pointer hover:underline ${member.isDefaulter ? 'text-red-600' : 'text-gray-800'}`}
                            onClick={() => member.isDefaulter && setSelectedDefaulter(member)}
                            title={member.isDefaulter ? "थकबाकी इतिहास पहा" : ""}
                          >
                            {member.name}
                            {member.isDefaulter && <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded border border-red-200 uppercase tracking-wide">थकबाकीदार</span>}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {editingMember === member._id ? (
                        <input
                          type="text"
                          value={editForm.address}
                          onChange={(e) => handleEditChange('address', e.target.value)}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none w-full"
                        />
                      ) : (
                        member.address
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-600">
                      {editingMember === member._id ? (
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => handleEditChange('phone', e.target.value)}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none w-full"
                        />
                      ) : (
                        member.phone
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(member.joinDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {editingMember === member._id ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => saveEdit(member._id)} className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors">
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={cancelEdit} className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* View link hidden for redundancy, clicking name works for common use cases or we can add back if needed */}
                          {/* <Link href={`/members/${member._id}`} className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                             <Eye size={16} />
                           </Link> */}
                          <button onClick={() => startEdit(member)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="संपादित करा">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => removeMember(member._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="हटवा">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Defaulter Modal */}
      {selectedDefaulter && (
        <DefaulterHistoryModal
          member={selectedDefaulter}
          onClose={() => setSelectedDefaulter(null)}
          onUpdate={async () => {
            const response = await membersAPI.getAll()
            setMembers(response.data)
            const updatedDefaulter = response.data.find(m => m._id === selectedDefaulter._id)
            if (updatedDefaulter) {
              setSelectedDefaulter(updatedDefaulter)
            }
          }}
        />
      )}
    </DashboardLayout>
  )
}