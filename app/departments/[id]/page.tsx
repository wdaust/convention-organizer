'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DepartmentOverviewPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [department, setDepartment] = useState<any>(null);

    useEffect(() => {
        async function fetchDepartment() {
            try {
                const res = await fetch('/api/departments');
                const data = await res.json();
                const dept = data.find((d: any) => d.id === id);
                setDepartment(dept);
            } catch (error) {
                console.error('Failed to fetch department', error);
            }
        }

        fetchDepartment();
    }, [id]);

    const menuItems = [
        { label: 'Department Settings', href: `/departments/${id}/settings` },
        { label: 'Department Docs', href: `/departments/${id}/docs` },
        { label: 'Department Messaging', href: `/departments/${id}/messaging` },
        { label: 'Department Inventory', href: `/departments/${id}/inventory` },
        { label: 'Department Check-In', href: `/departments/${id}/check-in` },
        { label: 'Department Oversight', href: `/departments/${id}/oversight` },
        { label: 'Department Reports', href: `/departments/${id}/reports` },
        { label: 'Meetings', href: `/departments/${id}/meetings` },
        { label: 'Congregation List', href: `/departments/${id}/congregation` },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200">
                <button onClick={() => router.back()} className="p-2 -ml-2 bg-black text-white rounded-xl">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <div className="flex-1 ml-4">
                    <h1 className="text-lg font-bold text-gray-900">
                        {department?.name || 'Loading...'} Department
                    </h1>
                    <p className="text-xs text-gray-500">Structure</p>
                </div>
                <button className="p-2 text-gray-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="19" r="1.5" />
                    </svg>
                </button>
            </div>

            {/* Menu Items */}
            <div className="max-w-2xl mx-auto px-6 py-4">
                <div className="space-y-3">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center justify-between w-full px-5 py-4 bg-white rounded-xl shadow-sm hover:shadow-md transition"
                        >
                            <span className="text-base font-bold text-gray-900">{item.label}</span>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
                <div className="flex items-center justify-around px-2 py-2">
                    <Link href="/" className="flex flex-col items-center gap-1 py-2 px-4 text-gray-400">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                        </svg>
                        <span className="text-[10px] font-bold">Dashboard</span>
                    </Link>

                    <button className="flex flex-col items-center gap-1 py-2 px-4 text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="text-[10px] font-bold">Notifications</span>
                    </button>

                    <Link href="/departments" className="flex flex-col items-center gap-1 py-2 px-4 text-gray-900">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        <span className="text-[10px] font-bold">My Assignments</span>
                    </Link>

                    <button className="flex flex-col items-center gap-1 py-2 px-4 text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-[10px] font-bold">Info</span>
                    </button>

                    <Link href="/settings" className="flex flex-col items-center gap-1 py-2 px-4 text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-[10px] font-bold">Settings</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
