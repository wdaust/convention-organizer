'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await fetch('/api/departments');
        const data = await res.json();
        if (Array.isArray(data)) {
          setDepartments(data);
        }
      } catch (error) {
        console.error('Failed to fetch departments', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDepartments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200">
        <Link href="/settings" className="p-2 -ml-2 text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-lg font-bold">Departments</h1>
        <div className="w-10"></div>
      </div>

      {/* Departments List */}
      <div className="max-w-2xl mx-auto px-6 py-4">
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading departments...</div>
          ) : (
            departments.map((dept) => (
              <Link
                key={dept.id}
                href={`/departments/${dept.id}`}
                className="flex items-center justify-between w-full px-5 py-4 bg-white rounded-xl shadow-sm hover:shadow-md transition"
              >
                <span className="text-base font-bold text-gray-900">{dept.name}</span>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))
          )}
        </div>

        {/* Arena Map Link */}
        <div className="mt-8">
          <Link
            href="/map"
            className="flex items-center justify-between w-full py-3 px-4 bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wide rounded hover:bg-gray-100 transition"
          >
            <span>Arena Map</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
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
}>
  {/* Mobile Header */ }
  < div className = "md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 z-30 flex items-center justify-between" >
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-base font-bold">
          {departments.find(d => d.id === activeDept)?.name || 'Departments'}
        </h1>
        <Link href="/" className="p-2 -mr-2 text-gray-600 hover:text-gray-900">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>
      </div >

  {/* Mobile Overlay */ }
{
  mobileMenuOpen && (
    <div
      className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
      onClick={() => setMobileMenuOpen(false)}
    />
  )
}

{/* Sidebar */ }
<div className={`
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        fixed md:static
        inset-y-0 left-0
        w-64 md:w-64
        bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        z-50
        flex flex-col
        mt-[57px] md:mt-0
      `}>
  {/* Settings Header */}
  <div className="p-6 pb-3">
    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">SETTINGS</div>

    {/* Departments List */}
    <div className="space-y-1">
      {departments.map((dept) => (
        <button
          key={dept.id}
          onClick={() => {
            setActiveDept(dept.id);
            setMobileMenuOpen(false);
          }}
          className={`
                  w-full text-left px-4 py-2.5 rounded text-sm font-medium transition
                  ${activeDept === dept.id
              ? 'bg-gray-900 text-white'
              : 'text-gray-600 hover:bg-gray-100'
            }
                  flex items-center justify-between
                `}
        >
          <span>{dept.name}</span>
          {activeDept === dept.id && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      ))}
    </div>
  </div>

  {/* Arena Map Link */}
  <div className="mt-auto p-6 pt-3">
    <Link
      href="/map"
      onClick={() => setMobileMenuOpen(false)}
      className="flex items-center justify-between w-full py-3 px-4 bg-gray-50 text-gray-600 text-xs font-bold uppercase tracking-wide rounded hover:bg-gray-100 transition"
    >
      <span>Arena Map</span>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    </Link>
  </div>
</div>

{/* Main Content */ }
<div className="flex-1 overflow-y-auto mt-[57px] md:mt-0">
  <div className="p-4 md:p-8">
    <DepartmentDetail
      departmentId={activeDept}
      departmentName={departments.find(d => d.id === activeDept)?.name || ''}
      departmentNotionId={departments.find(d => d.id === activeDept)?.notionId}
    />
  </div>
</div>
    </div >
  );
}
