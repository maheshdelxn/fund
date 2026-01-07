'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CreditCard,
  MoreHorizontal,
  PlusCircle,
  FileText
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';
import { monthsAPI, authAPI } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/Skeleton';

// Stat Card Component
const StatCard = ({ title, amount, trend, icon: Icon, colorClass, bgClass }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-xl", bgClass)}>
        <Icon size={24} className={colorClass} />
      </div>
      <button className="text-gray-300 hover:text-gray-500">
        <MoreHorizontal size={20} />
      </button>
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <div className="flex items-end gap-3">
        <h3 className="text-2xl font-bold text-gray-800">{amount}</h3>
        {trend && (
          <span className={cn(
            "text-xs font-semibold px-2 py-1 rounded-full mb-1",
            trend > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </div>
  </div>
);

// Month Card Component
const MonthCard = ({ month, onClick }) => (
  <div
    onClick={onClick}
    className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-teal-200 transition-all cursor-pointer group"
  >
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors">
          <Calendar size={20} />
        </div>
        <div>
          <h4 className="font-bold text-gray-800">{month.monthName} {month.year}</h4>
          <span className={cn(
            "text-[10px] uppercase font-bold px-2 py-0.5 rounded-full",
            month.status === 'completed' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
          )}>
            {month.status === 'completed' ? 'बंद' : 'चालू'}
          </span>
        </div>
      </div>
      <ArrowUpRight size={18} className="text-gray-300 group-hover:text-teal-500 transition-colors" />
    </div>

    <div className="space-y-2 mt-4">
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">जमा झाले</span>
        <span className="font-bold text-gray-800">₹ {(month.totalCollected || 0).toLocaleString()}</span>
      </div>
      {/* Simple Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="bg-teal-500 h-1.5 rounded-full"
          style={{ width: `${Math.min(100, ((month.totalCollected || 0) / 100000) * 100)}%` }}
        ></div>
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState([]);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalFund: 0,
    monthlyCollection: 0,
    pendingLoans: 0
  });
  const router = useRouter();

  // Mock Data for Charts
  const chartData = [
    { name: 'Jan', collected: 40000, given: 24000 },
    { name: 'Feb', collected: 30000, given: 13980 },
    { name: 'Mar', collected: 20000, given: 58000 },
    { name: 'Apr', collected: 27800, given: 39080 },
    { name: 'May', collected: 18900, given: 48000 },
    { name: 'Jun', collected: 23900, given: 38000 },
    { name: 'Jul', collected: 34900, given: 43000 },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await authAPI.getMe();
        if (userData.success) {
          setUser(userData.data || userData);
          await loadData();
        } else {
          await loadData();
        }
      } catch (e) {
        console.error("Auth check failed:", e);
        await loadData();
      }
    };
    checkAuth();
  }, []);

  const loadData = async () => {
    try {
      const monthsRes = await monthsAPI.getAll();
      if (monthsRes.success) {
        const sortedMonths = monthsRes.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setMonths(sortedMonths);

        const totalCol = sortedMonths.reduce((acc, m) => acc + (m.totalCollected || 0), 0);
        const totalLoans = sortedMonths.reduce((acc, m) => acc + (m.totalGiven || 0), 0);

        setStats({
          totalMembers: 42,
          totalFund: totalCol - totalLoans,
          monthlyCollection: sortedMonths[0]?.totalCollected || 0,
          pendingLoans: totalLoans
        });
      }
    } catch (e) {
      console.error("Failed to load dashboard data", e);
    } finally {
      // Small artificial delay to prevent flicker if data loads too fast, 
      // but long enough to show smooth skeleton if needed.
      setTimeout(() => setLoading(false), 300);
    }
  };

  const handleCreateMonth = () => {
    const date = new Date();
    const monthName = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    const exists = months.find(m => m.monthName === monthName && m.year === year);
    if (exists) {
      router.push(`/month/${exists.date}?name=${monthName}&year=${year}`);
    } else {
      monthsAPI.POST({ month: date.getMonth() + 1, year }).then(res => {
        if (res.success) {
          router.push(`/month/${res.data.date}?name=${monthName}&year=${year}`);
        }
      }).catch(err => {
        const dateStr = date.toISOString().split('T')[0];
        router.push(`/month/${dateStr}?name=${monthName}&year=${year}`);
      });
    }
  };

  const currentDate = new Date();
  const currentMonthName = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();


  if (loading) {
    return (
      <DashboardLayout user={user || { name: 'User' }}>
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
          {/* Header Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <Skeleton className="h-6 w-6 rounded-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
            ))}
          </div>

          {/* Middle Section Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100">
              <div className="flex justify-between mb-6">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-32" />
              </div>
              <Skeleton className="h-64 w-full rounded-xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full rounded-3xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>

      <div className="flex flex-col gap-8 animate-in fade-in duration-500">
        {/* Top Header Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">डॅशबोर्ड</h2>
          <p className="text-gray-500 text-sm mt-1">आपल्या फंडाच्या कामगिरीचा आढावा</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="एकूण शिल्लक (Total Balance)"
            amount={`₹${stats.totalFund.toLocaleString()}`}
            trend={-0.89}
            icon={Wallet}
            colorClass="text-teal-600"
            bgClass="bg-teal-50"
          />
          <StatCard
            title="मासिक जमा (Monthly Income)"
            amount={`₹${stats.monthlyCollection.toLocaleString()}`}
            trend={6.25}
            icon={ArrowUpRight}
            colorClass="text-green-600"
            bgClass="bg-green-50"
          />
          <StatCard
            title="एकूण बचत (Total Savings)"
            amount={`₹79,290`}
            trend={-1.25}
            icon={Calendar} // Just a placeholder
            colorClass="text-orange-600"
            bgClass="bg-orange-50"
          />
          <StatCard
            title="वाटप केलेले कर्ज (Loans)"
            amount={`₹${stats.pendingLoans.toLocaleString()}`}
            trend={25.15}
            icon={ArrowDownLeft}
            colorClass="text-purple-600"
            bgClass="bg-purple-50"
          />
        </div>

        {/* Middle Section: Chart and Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-gray-800">आर्थिक प्रवाह (Money Flow)</h3>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span> जमा (Collection)
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-gray-300"></span> कर्ज (Loans)
                </div>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="collected" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorCollected)" />
                  <Area type="monotone" dataKey="given" stroke="#e5e7eb" strokeWidth={3} fill="transparent" strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* "My Card" / Current Month Section */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-teal-800 to-teal-600 rounded-3xl p-6 text-white shadow-xl shadow-teal-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Wallet size={120} />
              </div>

              <div className="relative z-10 flex justify-between items-start mb-8">
                <CreditCard size={28} className="opacity-80" />
              </div>

              <div className="relative z-10 mb-8">
                <p className="text-teal-200 text-sm mb-1">चालू महिन्याची शिल्लक</p>
                <h3 className="text-3xl font-bold tracking-tight">₹ 45,231.00</h3>
              </div>

              <div className="relative z-10 flex justify-between items-end">
                <div>
                  <p className="text-xs text-teal-200 uppercase tracking-widest mb-1">खातेदार</p>
                  <p className="font-medium tracking-wide">शिवांजली फंड</p>
                </div>
                <div>
                  <p className="text-xs text-teal-200 uppercase tracking-widest mb-1">महिना</p>
                  <p className="font-medium tracking-wide">{currentMonthName} {currentYear}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm text-gray-500">मासिक उद्दिष्टे (Targets)</p>
                  <h4 className="font-bold text-gray-800 text-lg">Running Low</h4>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">-0.89%</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm py-3 border-b border-gray-50">
                <span className="text-gray-500">चलन (Currency)</span>
                <span className="font-medium text-gray-800">INR / रुपया</span>
              </div>
              <div className="flex items-center justify-between text-sm py-3">
                <span className="text-gray-500">स्थिती (Status)</span>
                <span className="font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs">चालू</span>
              </div>
              <button className="w-full mt-2 py-3 rounded-xl bg-gray-50 hover:bg-teal-50 text-gray-600 hover:text-teal-600 font-medium transition-colors text-sm flex items-center justify-center gap-2">
                + व्यवहार जोडा
              </button>
            </div>
          </div>
        </div>

        {/* Monthly Collections / History Section (RESTORED) */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-800">मासिक तपशील आणि इतिहास</h3>
            <button onClick={handleCreateMonth} className="flex items-center gap-2 text-sm text-teal-600 font-medium hover:underline">
              <PlusCircle size={14} /> नवीन महिना सुरू करा
            </button>
          </div>

          {months.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {months.map(month => (
                <MonthCard
                  key={month._id}
                  month={month}
                  onClick={() => router.push(`/month/${month.date}?name=${month.monthName}&year=${month.year}${month.status === 'completed' ? '&historical=true' : ''}`)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <FileText size={32} />
              </div>
              <h3 className="font-bold text-gray-800">कोणताही इतिहास आढळला नाही</h3>
              <p className="text-gray-500 text-sm mt-1">येथे जमा तपशील पाहण्यासाठी नवीन महिना सुरू करा.</p>
              <button
                onClick={handleCreateMonth}
                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
              >
                चालू महिना तयार करा
              </button>
            </div>
          )}
        </div>

        {/* Recent Transactions / Members */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-800">अलीकडील व्यवहार</h3>
            <button className="text-sm text-teal-600 font-medium hover:underline">सर्व पहा</button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b last:border-0 border-gray-50">
                <div className="flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", i % 2 === 0 ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600")}>
                    {i % 2 === 0 ? <Users size={20} /> : <Wallet size={20} />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">सभासद भरणा - राहुल पाटील</p>
                    <p className="text-xs text-gray-500">आज सकाळी 09:4{i}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800 text-sm">+ ₹5,200</p>
                  <p className="text-xs text-green-500">पूर्ण</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
