'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, Users, Wallet, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
    { icon: LayoutDashboard, label: 'डॅशबोर्ड', href: '/dashboard' },
    { icon: Users, label: 'सभासद', href: '/members' },
    { icon: Wallet, label: 'ठेवी आणि कर्ज', href: '/deposits' },
    // { icon: Settings, label: 'सेटिंग्ज', href: '/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside
            className={cn(
                "bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 font-sans transition-all duration-300 ease-in-out",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            <div className={cn("p-8 pb-4 transition-all", isCollapsed ? "p-4 flex justify-center" : "")}>
                <div className="flex items-center gap-3 mb-2 justify-center">
                    <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-lg">श</span>
                    </div>
                    {!isCollapsed && (
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight whitespace-nowrap overflow-hidden">शिवांजली</h1>
                    )}
                </div>
                {!isCollapsed && <p className="text-xs text-gray-400 pl-11 whitespace-nowrap overflow-hidden">फंड व्यवस्थापन</p>}
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2 overflow-x-hidden">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-teal-500 text-white shadow-md shadow-teal-200"
                                    : "text-gray-500 hover:bg-teal-50 hover:text-teal-600",
                                isCollapsed ? "justify-center px-2" : ""
                            )}
                            title={isCollapsed ? item.label : ""}
                        >
                            <Icon size={20} className={cn("shrink-0", isActive ? "text-white" : "text-gray-400 group-hover:text-teal-600")} />
                            {!isCollapsed && <span className="font-medium whitespace-nowrap overflow-hidden">{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-gray-50 flex flex-col gap-2">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="flex items-center justify-center w-full py-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>

                <button
                    onClick={() => {
                        window.location.href = '/login';
                    }}
                    className={cn(
                        "flex items-center gap-4 px-4 py-3 w-full text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all",
                        isCollapsed ? "justify-center px-2" : ""
                    )}
                    title="बाहेर पडा"
                >
                    <LogOut size={20} className="shrink-0" />
                    {!isCollapsed && <span className="font-medium whitespace-nowrap overflow-hidden">बाहेर पडा</span>}
                </button>
            </div>
        </aside>
    );
}
