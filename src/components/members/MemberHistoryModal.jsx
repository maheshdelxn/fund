import React, { useEffect, useState } from 'react';
import { X, Calendar, Phone, Hash, CreditCard, TrendingUp, History, User, Banknote, ShieldAlert } from 'lucide-react';
import { membersAPI } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/Skeleton';
import { format } from 'date-fns';

const MemberHistoryModal = ({ memberId, isOpen, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (isOpen && memberId) {
            fetchMemberDetails();
        } else {
            setData(null);
            setLoading(true);
        }
    }, [isOpen, memberId]);

    const fetchMemberDetails = async () => {
        setLoading(true);
        try {
            const res = await membersAPI.getById(memberId);
            if (res.success) {
                setData(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch member details", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-white/90 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100/50 bg-white/50">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            {loading ? <Skeleton className="h-8 w-48 rounded-lg" /> : data?.member?.name || 'Member Details'}
                            {!loading && data?.member?.serialNo && (
                                <span className="text-sm font-medium px-3 py-1 bg-gray-100 text-gray-600 rounded-full">
                                    #{data.member.serialNo}
                                </span>
                            )}
                        </h2>
                        {!loading && (
                            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                <Phone size={14} /> {data?.member?.phone || 'N/A'}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-8 border-b border-gray-100/50 bg-gray-50/50 overflow-x-auto hide-scrollbar">
                    {['overview', 'loans', 'payments'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-4 text-sm font-semibold capitalize relative transition-colors ${activeTab === tab ? 'text-teal-700' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {tab === 'overview' && 'आढावा (Overview)'}
                            {tab === 'loans' && 'कर्ज इतिहास (Loans)'}
                            {tab === 'payments' && 'भरणा इतिहास (Payments)'}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-t-full" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-white/40">
                    {loading ? (
                        <div className="space-y-6">
                            <Skeleton className="h-32 w-full rounded-2xl" />
                            <Skeleton className="h-64 w-full rounded-2xl" />
                        </div>
                    ) : (
                        <>
                            {activeTab === 'overview' && <OverviewTab data={data} />}
                            {activeTab === 'loans' && <LoansTab borrowings={data?.borrowings || []} />}
                            {activeTab === 'payments' && <PaymentsTab payments={data?.payments || []} />}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const OverviewTab = ({ data }) => {
    const { member, deposits, borrowings, payments } = data || {};

    const totalSavings = deposits?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;
    const totalLoansTaken = borrowings?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

    // Determine current loan outstanding (simplified logic, ideally comes from backend or calculation)
    const currentPrincipal = member?.currentPrincipal || 0;

    return (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    label="एकूण बचत (Total Savings)"
                    value={`₹${totalSavings.toLocaleString()}`}
                    icon={Banknote}
                    color="green"
                />
                <StatCard
                    label="एकूण कर्ज घेतले (Total Loans)"
                    value={`₹${totalLoansTaken.toLocaleString()}`}
                    icon={CreditCard}
                    color="purple"
                />
                <StatCard
                    label="सध्याचे बाकी कर्ज (Outstanding)"
                    value={`₹${currentPrincipal.toLocaleString()}`}
                    icon={ShieldAlert}
                    color="orange"
                />
            </div>

            {/* Personal Info */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User size={18} className="text-gray-400" />
                    वैयक्तिक माहिती
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                    <InfoRow label="पू्र्ण नाव" value={member?.name} />
                    <InfoRow label="मोबाईल नंबर" value={member?.phone} />
                    <InfoRow label="ईमेल" value={member?.email || '-'} />
                    <InfoRow label="सामील दिनांक" value={member?.joinDate ? format(new Date(member.joinDate), 'dd MMM yyyy') : '-'} />
                    <InfoRow label="पत्ता" value={member?.address || '-'} />
                    <InfoRow label="एकूण शेअर्स" value={member?.numberOfShares || '0'} />
                </div>
            </div>
        </div>
    );
};

const LoansTab = ({ borrowings }) => {
    if (!borrowings?.length) {
        return <EmptyState message="कोणताही कर्ज इतिहास नाही" />;
    }

    return (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">तारीख</th>
                            <th className="px-6 py-4 text-right">रक्कम</th>
                            <th className="px-6 py-4 text-right">मागील बाकी</th>
                            <th className="px-6 py-4 text-right">नवीन बाकी</th>
                            <th className="px-6 py-4">जामीनदार</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {borrowings.map((loan, idx) => (
                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {loan.borrowingDate ? format(new Date(loan.borrowingDate), 'dd MMM yyyy') : '-'}
                                    <div className="text-xs text-gray-400 font-normal">
                                        {loan.monthlyData?.monthName} {loan.monthlyData?.year}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-purple-700">
                                    ₹{loan.amount?.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right text-gray-500">
                                    ₹{loan.previousPrincipal?.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-right text-gray-900">
                                    ₹{loan.newPrincipal?.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {loan.guarantors?.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                            {loan.guarantors.map((g, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                                                    {g}
                                                </span>
                                            ))}
                                        </div>
                                    ) : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const PaymentsTab = ({ payments }) => {
    if (!payments?.length) {
        return <EmptyState message="कोणताही भरणा इतिहास नाही" />;
    }

    return (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">महिना</th>
                                <th className="px-6 py-4 text-right">शेअर्स</th>
                                <th className="px-6 py-4 text-right">मुद्दल</th>
                                <th className="px-6 py-4 text-right">व्याज</th>
                                <th className="px-6 py-4 text-right">दंड</th>
                                <th className="px-6 py-4 text-right">एकूण</th>
                                <th className="px-6 py-4 text-center">मोड</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {payments.map((payment, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {payment.monthlyData?.monthName} {payment.monthlyData?.year}
                                        <div className="text-xs text-gray-400 font-normal">
                                            {payment.paymentDate ? format(new Date(payment.paymentDate), 'dd MMM') : '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-600">
                                        ₹{payment.shareAmount?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-600">
                                        ₹{payment.muddalPaid?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right text-orange-600 font-medium">
                                        ₹{payment.interestAmount?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right text-red-600">
                                        {payment.penaltyAmount > 0 ? `₹${payment.penaltyAmount}` : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right font-bold text-green-700">
                                        ₹{payment.totalAmount?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${payment.paymentMode === 'online'
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'bg-emerald-50 text-emerald-700'
                                            }`}>
                                            {payment.paymentMode === 'online' ? 'ONL' : 'CASH'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const StatCard = ({ label, value, icon: Icon, color }) => {
    const colorClasses = {
        green: 'bg-emerald-50 text-emerald-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start justify-between hover:shadow-md transition-shadow">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
                <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
            </div>
            <div className={`p-3 rounded-xl ${colorClasses[color] || 'bg-gray-50 text-gray-600'}`}>
                <Icon size={24} />
            </div>
        </div>
    );
};

const InfoRow = ({ label, value }) => (
    <div className="flex flex-col">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</span>
        <span className="text-base font-medium text-gray-900 mt-0.5">{value}</span>
    </div>
);

const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <History size={32} />
        </div>
        <p className="text-lg font-medium">{message}</p>
    </div>
);

export default MemberHistoryModal;
