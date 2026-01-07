import React from 'react';
import { Search, Plus, UserPlus } from 'lucide-react';

const BorrowingTab = ({
    members,
    searchTerm,
    onSearchChange,
    borrowAmounts,
    handleBorrowAmountChange,
    guarantors,
    setGuarantors,
    readOnlyMode,
    processSingleBorrowing,
    getTotalBorrowingThisMonth,
    onMemberClick
}) => {
    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400" size={18} />
                </div>
                <input
                    type="text"
                    placeholder="कर्ज देण्यासाठी सभासद शोधा..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm text-gray-700"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="p-4 font-semibold text-gray-600 w-16 text-center">क्र.</th>
                                <th className="p-4 font-semibold text-gray-600 min-w-[200px]">सभासद (Member)</th>
                                <th className="p-4 font-semibold text-gray-600 text-right">सध्याची मुद्दल</th>
                                <th className="p-4 font-semibold text-gray-600 text-right">नवीन कर्ज रक्कम</th>
                                <th className="p-4 font-semibold text-gray-600">जामीनदार</th>
                                <th className="p-4 font-semibold text-gray-600 text-center w-32">कृती</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {members.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-12 text-center text-gray-500 flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                            <Search className="text-gray-300" size={20} />
                                        </div>
                                        <p>कोणतेही सभासद सापडले नाहीत.</p>
                                    </td>
                                </tr>
                            ) : (
                                members.map((member) => {
                                    const memberId = member._id || member.id;
                                    const currentP = member.currentPrincipal || 0;
                                    const loanAmt = borrowAmounts[memberId] || '';
                                    const alreadyBorrowed = getTotalBorrowingThisMonth(memberId);

                                    const currentGuarantors = guarantors[memberId] || ['', ''];

                                    // Helper to update specific guarantor index
                                    const handleGuarantorChange = (index, value) => {
                                        setGuarantors(prev => {
                                            const currentList = prev[memberId] || ['', ''];
                                            const newList = [...currentList];
                                            newList[index] = value;
                                            return { ...prev, [memberId]: newList };
                                        });
                                    };

                                    return (
                                        <tr key={memberId} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="p-4 text-center font-medium text-gray-500">
                                                {member.serialNo}
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => onMemberClick && onMemberClick(memberId)}
                                                    className="flex flex-col text-left hover:opacity-75 transition-opacity"
                                                >
                                                    <span className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">{member.name}</span>
                                                </button>
                                            </td>
                                            <td className="p-4 text-right font-medium text-gray-700 tabular-nums">
                                                ₹{currentP.toLocaleString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                {!readOnlyMode ? (
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className="relative">
                                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                                <span className="text-gray-400 text-xs">₹</span>
                                                            </div>
                                                            <input
                                                                type="number"
                                                                className="w-32 pl-6 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-right text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-900 placeholder-gray-300"
                                                                value={loanAmt}
                                                                onChange={(e) => handleBorrowAmountChange(memberId, e.target.value)}
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                        {alreadyBorrowed > 0 && (
                                                            <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                                                                + ₹{alreadyBorrowed.toLocaleString()} जोडले
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-900 font-medium">₹{alreadyBorrowed.toLocaleString()}</span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                {!readOnlyMode ? (
                                                    <div className="flex flex-col gap-2 max-w-[200px]">
                                                        <div className="relative">
                                                            <UserPlus size={14} className="absolute left-2.5 top-2 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                placeholder="जामीनदार 1"
                                                                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-900"
                                                                value={currentGuarantors[0]}
                                                                onChange={(e) => handleGuarantorChange(0, e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="relative">
                                                            <UserPlus size={14} className="absolute left-2.5 top-2 text-gray-400" />
                                                            <input
                                                                type="text"
                                                                placeholder="जामीनदार 2"
                                                                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-900"
                                                                value={currentGuarantors[1]}
                                                                onChange={(e) => handleGuarantorChange(1, e.target.value)}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-600 italic">
                                                        {guarantors[memberId]?.join(', ') || 'जामीनदार नाहीत'}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                {!readOnlyMode && (
                                                    <button
                                                        onClick={() => processSingleBorrowing(memberId)}
                                                        disabled={!loanAmt || parseInt(loanAmt) <= 0}
                                                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all shadow-sm shadow-purple-200 disabled:shadow-none active:scale-95"
                                                    >
                                                        <Plus size={14} /> जोडा
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BorrowingTab;
