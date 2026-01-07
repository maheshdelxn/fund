'use client';

import { Search, Bell, User } from 'lucide-react';

export default function TopBar({ user }) {
    return (
        <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-8 sticky top-0 z-10 w-full">
            {/* Search Bar - Visual only for now */}
            <div className="relative w-96 hidden md:block">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-100 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition-colors"
                    placeholder="Search for member, loan, or deposit..."
                />
            </div>

            <div className="flex items-center gap-6">
                <button className="relative p-2 text-gray-400 hover:text-teal-600 transition-colors rounded-full hover:bg-gray-50">
                    <Bell size={20} />
                    <span className="absolute top-1 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                </button>

                <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-700">{user?.name || 'Admin User'}</p>
                        <p className="text-xs text-gray-400">Fund Manager</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                        {/* <User size={20} className="text-gray-500" /> */}
                        <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=0d9488&color=fff`} className="h-full w-full object-cover" alt="Profile" />
                    </div>
                </div>
            </div>
        </header>
    );
}
