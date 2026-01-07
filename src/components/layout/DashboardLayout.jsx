'use client';

import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardLayout({ children, user }) {
    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <TopBar user={user} />
                <main className="flex-1 p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
