'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DepartmentDetail from '@/components/DepartmentDetail';

export default function DepartmentsPage() {
  const [activeDept, setActiveDept] = useState('oversight');
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await fetch('/api/departments');
        const data = await res.json();
        if (Array.isArray(data)) {
          setDepartments(data);
          if (data.length > 0 && activeDept === 'oversight') {
            if (!data.find(d => d.id === 'oversight')) {
              setActiveDept(data[0].id);
            }
          }
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
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 px-4 py-3 z-30 flex items-center justify-between">
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
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
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

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto mt-[57px] md:mt-0">
        <div className="p-4 md:p-8">
          <DepartmentDetail
            departmentId={activeDept}
            departmentName={departments.find(d => d.id === activeDept)?.name || ''}
            departmentNotionId={departments.find(d => d.id === activeDept)?.notionId}
          />
        </div>
      </div>
    </div>
  );
}
