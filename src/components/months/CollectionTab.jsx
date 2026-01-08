import React from 'react';
import { Search, Check, RotateCcw } from 'lucide-react';

const CollectionTab = ({
    filteredMembers,
    searchTerm,
    onSearchChange,
    muddalInputs,
    handleMuddalChange,
    penaltyInputs,
    handlePenaltyChange,
    monthPayments,
    readOnlyMode,
    calculatePaymentDetails,
    calculatePenalty,
    hasMemberPaid,
    handleUndoPayment,
    processPayment,
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
                    placeholder="सभासद शोधा (Search members)..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm text-gray-700"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="p-4 font-semibold text-gray-600 w-16 text-center">क्र.</th>
                                <th className="p-4 font-semibold text-gray-600 min-w-[200px]">सभासद (Member)</th>
                                <th className="p-4 font-semibold text-gray-600 text-right">शेअर्स</th>
                                <th className="p-4 font-semibold text-gray-600 text-right">बाकी शेअर्स</th>
                                <th className="p-4 font-semibold text-gray-600 text-right">मुद्दल</th>
                                <th className="p-4 font-semibold text-gray-600 text-right">व्याज</th>
                                <th className="p-4 font-semibold text-gray-600 text-right">दंड</th>
                                <th className="p-4 font-semibold text-gray-600 text-right">एकूण</th>
                                <th className="p-4 font-semibold text-gray-600 text-right">शिल्लक</th>
                                <th className="p-4 font-semibold text-gray-600 text-center w-32">कृती</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredMembers.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="p-12 text-center text-gray-500 flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                            <Search className="text-gray-300" size={20} />
                                        </div>
                                        <p>"{searchTerm}" साठी कोणतेही सभासद सापडले नाहीत</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredMembers.map((member) => {
                                    const pd = calculatePaymentDetails(member);
                                    const isPaid = hasMemberPaid(member);
                                    const memberId = member._id || member.id;

                                    const existingPayment = monthPayments[memberId];
                                    const penalty = isPaid
                                        ? (existingPayment?.penaltyAmount || 0)
                                        : calculatePenalty(member);

                                    const total = isPaid
                                        ? (existingPayment?.paidAmount || 0)
                                        : ((pd?.total || 0) + penalty);

                                    const shares = pd?.shareAmount || 0;
                                    const muddalPaidVal = isPaid ? (existingPayment?.muddalPaid || 0) : pd?.muddalPaid;
                                    const interest = pd?.interestAmount || 0;
                                    const newPrincipal = pd?.newPrincipal || 0;

                                    const hasArrears = pd?.pendingShares > 0;

                                    return (
                                        <tr
                                            key={memberId}
                                            className={`group transition-colors duration-150 ${isPaid ? 'bg-green-50/30' : 'hover:bg-gray-50/80'} ${hasArrears && !isPaid ? 'text-red-600' : ''}`}
                                        >
                                            <td className="p-4 text-center font-medium text-gray-500">
                                                {member.serialNo}
                                            </td>
                                            <td className="p-4">
                                                <button
                                                    onClick={() => onMemberClick && onMemberClick(memberId)}
                                                    className="flex flex-col text-left hover:opacity-75 transition-opacity"
                                                >
                                                    <span className={`font-semibold transition-colors ${hasArrears && !isPaid ? 'text-red-600 group-hover:text-red-700' : 'text-gray-900 group-hover:text-teal-700'}`}>{member.name}</span>
                                                    <span className={`text-xs ${hasArrears && !isPaid ? 'text-red-400' : 'text-gray-400'}`}>{member.phone}</span>
                                                </button>
                                            </td>
                                            <td className="p-4 text-right tabular-nums text-gray-600">
                                                ₹{shares.toLocaleString()}
                                            </td>
                                            <td className="p-4 text-right tabular-nums">
                                                {pd?.pendingShares > 0 ? (
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-bold text-red-600">₹{pd.pendingShares.toLocaleString()}</span>
                                                        {member.pendingMonths && member.pendingMonths.length > 0 && (
                                                            <span className="text-[10px] text-red-400 font-medium">
                                                                ({member.pendingMonths.join(', ')})
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-300">-</span>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                {isPaid ? (
                                                    <span className="tabular-nums font-medium text-gray-900">₹{muddalPaidVal.toLocaleString()}</span>
                                                ) : (
                                                    member.isBorrower || (pd && pd.totalBorrowedThisMonth > 0) ? (
                                                        <div className="flex justify-end">
                                                            <input
                                                                type="number"
                                                                className="w-24 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-right text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-gray-900 placeholder-gray-300"
                                                                value={muddalInputs[memberId] || ''}
                                                                onChange={(e) => handleMuddalChange(memberId, e.target.value)}
                                                                placeholder="0"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-300 text-xl">-</span>
                                                    )
                                                )}
                                            </td>
                                            <td className="p-4 text-right tabular-nums text-gray-600">
                                                {interest > 0 ? `₹${interest.toLocaleString()}` : <span className="text-gray-300">-</span>}
                                            </td>
                                            <td className="p-4 text-right">
                                                {isPaid ? (
                                                    penalty > 0 ? (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700">
                                                            ₹{penalty}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-300">-</span>
                                                    )
                                                ) : (
                                                    <div className="flex justify-end">
                                                        <input
                                                            type="number"
                                                            className="w-20 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-right text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-red-600 placeholder-red-200"
                                                            value={penaltyInputs[memberId] || ''}
                                                            onChange={(e) => handlePenaltyChange(memberId, e.target.value)}
                                                            placeholder={penalty > 0 ? penalty : '0'}
                                                        />
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-4 text-right">
                                                <span className={`font-bold tabular-nums ${isPaid ? 'text-green-700' : 'text-gray-900'}`}>
                                                    ₹{total.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right tabular-nums text-gray-500">
                                                {newPrincipal > 0 ? `₹${newPrincipal.toLocaleString()}` : <span className="text-gray-300">-</span>}
                                            </td>
                                            <td className="p-4 text-center">
                                                {isPaid ? (
                                                    <div className="flex flex-col items-center">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                                                            <Check size={10} strokeWidth={3} />
                                                            PAID
                                                        </span>
                                                        {!readOnlyMode && (
                                                            <button
                                                                onClick={() => handleUndoPayment(memberId)}
                                                                className="mt-1 text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors opacity-0 group-hover:opacity-100"
                                                            >
                                                                <RotateCcw size={10} /> रद्द करा
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    !readOnlyMode && (
                                                        <div className="flex gap-2 justify-center">
                                                            <button
                                                                onClick={() => processPayment(member, 'cash')}
                                                                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 active:scale-95 transition-all shadow-sm shadow-emerald-200"
                                                            >
                                                                कॅश
                                                            </button>
                                                            <button
                                                                onClick={() => processPayment(member, 'online')}
                                                                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200"
                                                            >
                                                                ऑनलाईन
                                                            </button>
                                                        </div>
                                                    )
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

export default CollectionTab;
