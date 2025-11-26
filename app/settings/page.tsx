'use client';

import React from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white px-6 py-4 flex items-center justify-between">
                <Link href="/" className="text-gray-600 hover:text-gray-900">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <button className="p-2 text-gray-600 hover:text-gray-900">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="5" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="12" cy="19" r="1.5" />
                    </svg>
                </button>
            </div>

            {/* Main Content */}
            <div className="max-w-2xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">ADMINISTRATION</h1>

                {/* Settings Links */}
                <div className="space-y-3 mb-auto">
                    <Link
                        href="/departments"
                        className="flex items-center justify-between w-full px-5 py-4 bg-white rounded-xl shadow-sm hover:shadow-md transition"
                    >
                        <span className="text-base font-bold text-gray-400 uppercase tracking-wide">DEPARTMENTS</span>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>

                    <Link
                        href="/settings/event-setup"
                        className="flex items-center justify-between w-full px-5 py-4 bg-white rounded-xl shadow-sm hover:shadow-md transition"
                    >
                        <span className="text-base font-medium text-gray-400">Event Setup</span>
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>

                {/* Log Out Button */}
                <div className="fixed bottom-32 left-0 right-0 px-6 max-w-2xl mx-auto">
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="w-full py-4 bg-orange-500 text-white font-bold text-lg rounded-xl hover:bg-orange-600 transition shadow-lg"
                    >
                        Log Out
                    </button>

                    {/* Footer Buttons */}
                    <div className="flex gap-3 mt-4">
                        <button className="flex-1 py-3 bg-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-300 transition">
                            Rate Our App
                        </button>
                        <button className="flex-1 py-3 bg-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-300 transition">
                            Report A Bug
                        </button>
                        <button className="flex-1 py-3 bg-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-300 transition">
                            Contact Us
                        </button>
                    </div>
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

                    <Link href="/departments" className="flex flex-col items-center gap-1 py-2 px-4 text-gray-400">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        <span className="text-[10px] font-bold">My Shifts</span>
                    </Link>

                    <button className="flex flex-col items-center gap-1 py-2 px-4 text-gray-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-[10px] font-bold">Info</span>
                    </button>

                    <Link href="/settings" className="flex flex-col items-center gap-1 py-2 px-4 text-orange-500">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                        <span className="text-[10px] font-bold">Settings</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
