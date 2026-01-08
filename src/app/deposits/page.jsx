'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI, depositsAPI, membersAPI } from '@/lib/api-client'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { Wallet, PlusCircle, Calendar, Save, RotateCcw, Trash2, Edit2, CheckCircle, AlertCircle, Phone, CreditCard } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'

export default function Deposits() {
  const [user, setUser] = useState(null)
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

  const loadDeposits = async () => {
    try {
      setLoading(true)
      const response = await depositsAPI.getAll()
      setDeposits(response.data)
    } catch (error) {
      console.error('Load deposits error:', error)
      setError('ठेवी लोड करण्यास अयशस्वी')
    } finally {
      // Small delay for smooth transition
      setTimeout(() => setLoading(false), 300)
    }
  }

  const loadMembers = async () => {
    try {
      const response = await membersAPI.getAll()
      setMembers(response.data)
    } catch (error) {
      console.error('Load members error:', error)
      setError('सभासद लोड करण्यास अयशस्वी')
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authAPI.getMe()
        setUser(userData)
        await Promise.all([loadDeposits(), loadMembers()])
      } catch (error) {
        // router.push('/login')
        setUser({ name: 'Admin User' })
        await Promise.all([loadDeposits(), loadMembers()])
      }
    }
    checkAuth()
  }, [router])

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
      setError('कृपया सर्व रकाने भरा')
      return
    }

    try {
      setError('')
      setSuccess('')
      const depositData = {
        name: newDeposit.name,
        phone: newDeposit.phone,
        alternatePhone: newDeposit.alternatePhone,
        amount: parseFloat(newDeposit.amount),
        shares: parseInt(newDeposit.shares),
        date: newDeposit.date
      }

      if (newDeposit.memberId) {
        depositData.memberId = newDeposit.memberId
      }

      await depositsAPI.create(depositData)
      setSuccess('ठेव यशस्वीरित्या जोडली!')
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
      await Promise.all([loadDeposits(), loadMembers()])
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error.message || 'ठेव जोडण्यास अयशस्वी')
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
    setEditForm({ name: '', phone: '', alternatePhone: '', amount: '', date: '', shares: '', shareAmount: '' })
  }

  const saveEditDeposit = async () => {
    if (!editForm.name || !editForm.phone || !editForm.amount || !editForm.date || !editForm.shares) {
      setError('कृपया सर्व रकाने भरा')
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
      setSuccess('ठेव यशस्वीरित्या अद्यतनित केली!')
      setEditingDeposit(null)
      setEditForm({ name: '', phone: '', alternatePhone: '', amount: '', date: '', shares: '', shareAmount: '' })
      await loadDeposits()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error.message || 'ठेव अद्यतनित करण्यास अयशस्वी')
    }
  }

  const removeDeposit = async (depositId) => {
    if (!window.confirm('तुम्हाला खात्री आहे की तुम्ही ही ठेव काढू इच्छिता?')) {
      return
    }
    try {
      setError('')
      setSuccess('')
      await depositsAPI.delete(depositId)
      setSuccess('ठेव यशस्वीरित्या काढली!')
      await loadDeposits()
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error.message || 'ठेव काढण्यास अयशस्वी')
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
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
        </div>

        {/* Add Deposit Card Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <Skeleton className="h-6 w-40 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="space-y-1"><Skeleton className="h-3 w-24" /><Skeleton className="h-10 w-full rounded-xl" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><Skeleton className="h-3 w-24" /><Skeleton className="h-10 w-full rounded-xl" /></div>
                <div className="space-y-1"><Skeleton className="h-3 w-24" /><Skeleton className="h-10 w-full rounded-xl" /></div>
              </div>
              <div className="space-y-1"><Skeleton className="h-3 w-24" /><Skeleton className="h-10 w-full rounded-xl" /></div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1"><Skeleton className="h-3 w-24" /><Skeleton className="h-10 w-full rounded-xl" /></div>
                <div className="space-y-1"><Skeleton className="h-3 w-24" /><Skeleton className="h-10 w-full rounded-xl" /></div>
                <div className="space-y-1"><Skeleton className="h-3 w-24" /><Skeleton className="h-10 w-full rounded-xl" /></div>
              </div>
              <Skeleton className="h-12 w-full rounded-xl mt-2" />
            </div>
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
                <Skeleton className="h-16 w-full rounded-lg" />
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

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">ठेवी आणि कर्ज (Deposits & Loans)</h1>
            <p className="text-gray-500 text-sm">सभासदांच्या ठेवी व्यवस्थापित करा आणि शेअर्सचा मागोवा घ्या</p>
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

        {/* Add Deposit Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-50">
            <PlusCircle size={20} className="text-teal-600" />
            <h2 className="font-semibold text-gray-800">नवीन ठेव नोंदणी</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Member Selection */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">सभासद निवडा</label>
                <select
                  value={selectedMember}
                  onChange={(e) => handleMemberSelect(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm"
                >
                  <option value="">-- स्वतः भरा किंवा सभासद निवडा --</option>
                  {members.map(member => (
                    <option key={member._id} value={member._id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-gray-500 uppercase block">शेअर्स (भाग)</label>
                    <span className="text-[10px] text-teal-600 font-bold bg-teal-50 px-1.5 py-0.5 rounded">₹ 5,000 प्रति शेअर</span>
                  </div>
                  <input
                    type="number"
                    placeholder="0"
                    value={newDeposit.shares}
                    onChange={(e) => {
                      const shares = e.target.value;
                      const val = shares ? parseInt(shares) * 5000 : '';
                      setNewDeposit({
                        ...newDeposit,
                        shares: shares,
                        amount: val.toString(),
                        shareAmount: val.toString()
                      })
                    }}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">एकूण रक्कम</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={newDeposit.amount}
                      readOnly
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium text-sm"
                      placeholder="₹ 0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">तारीख</label>
                <input
                  type="date"
                  value={newDeposit.date}
                  onChange={(e) => setNewDeposit({ ...newDeposit, date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Right Column: Manual Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">पूर्ण नाव</label>
                  <input
                    type="text"
                    value={newDeposit.name}
                    onChange={(e) => setNewDeposit({ ...newDeposit, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm"
                    disabled={!!selectedMember}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">फोन</label>
                  <input
                    type="text"
                    value={newDeposit.phone}
                    onChange={(e) => setNewDeposit({ ...newDeposit, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm"
                    disabled={!!selectedMember}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase mb-1 block">पर्यायी फोन</label>
                  <input
                    type="text"
                    value={newDeposit.alternatePhone}
                    onChange={(e) => setNewDeposit({ ...newDeposit, alternatePhone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm"
                    placeholder="ऐच्छिक"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={addDeposit}
                  className="w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 font-medium transition-all shadow-lg shadow-teal-200/50 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  ठेव जतन करा
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Deposit List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="font-bold text-gray-800">अलीकडील ठेवी</h2>
            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
              एकूण: {deposits.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">आयडी</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">सभासद / नाव</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">संपर्क</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">तारीख</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">शेअर्स</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">रक्कम</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">क्रिया</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {deposits.map(deposit => (
                  <tr key={deposit._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-bold text-teal-600 font-mono">
                      {deposit.member?.serialNo || deposit.serialNo || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {editingDeposit === deposit._id ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none w-full"
                        />
                      ) : (
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{deposit.name}</p>
                          {deposit.member && <p className="text-[10px] text-teal-600 bg-teal-50 inline-block px-1.5 rounded mt-0.5">नोंदणीकृत सभासद</p>}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {editingDeposit === deposit._id ? (
                        <input
                          type="text"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none w-full"
                        />
                      ) : (
                        <div className="flex flex-col text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Phone size={12} /> {deposit.phone}</span>
                          {deposit.alternatePhone && <span className="text-xs text-gray-400">{deposit.alternatePhone}</span>}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">
                      {editingDeposit === deposit._id ? (
                        <input
                          type="date"
                          value={editForm.date}
                          onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none w-full"
                        />
                      ) : formatDate(deposit.date)}
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                      {editingDeposit === deposit._id ? (
                        <input
                          type="number"
                          value={editForm.shares}
                          onChange={(e) => {
                            const idx = e.target.value;
                            const val = idx ? parseInt(idx) * 5000 : '';
                            setEditForm({ ...editForm, shares: idx, amount: val.toString(), shareAmount: val.toString() })
                          }}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none w-20"
                        />
                      ) : deposit.shares}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-green-600 text-sm bg-green-50 px-2 py-1 rounded-lg">
                        {formatCurrency(deposit.amount)}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      {editingDeposit === deposit._id ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={saveEditDeposit} className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors">
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={cancelEditDeposit} className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                            <RotateCcw size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEditDeposit(deposit)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="संपादित करा">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => removeDeposit(deposit._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="हटवा">
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
    </DashboardLayout>
  )
}