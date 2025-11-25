'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react'; // Added useEffect
import DepartmentDetail from '@/components/DepartmentDetail';

export default function Home() {
  const [activeDept, setActiveDept] = useState('oversight'); // Renamed selectedDepartment to activeDept
  const [departments, setDepartments] = useState<any[]>([]); // New state for departments
  const [loading, setLoading] = useState(true); // New state for loading

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await fetch('/api/departments');
        const data = await res.json();
        if (Array.isArray(data)) {
          setDepartments(data);
          // Set first department as active if none selected and we have data
          if (data.length > 0 && activeDept === 'oversight') {
            // Optional: defaulting to first one, or keeping 'oversight' if it exists
            // For now let's keep the user's selection logic or default to the first one
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
  }, []); // Empty dependency array means this runs once on mount

  // Derive selectedDept from the fetched departments
  const selectedDept = departments.find(d => d.id === activeDept) || departments[0];

  return (
    <div className="flex h-screen bg-white font-sans"> {/* Added font-sans */}
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-8 pb-4">
          <h1 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">SETTINGS</h1>
          <h2 className="text-3xl font-light text-gray-900">Departments</h2>
        </div>

        {/* Department List */}
        <div className="flex-1 overflow-y-auto px-4 space-y-1"> {/* Added space-y-1 */}
          {loading ? (
            <div className="p-4 text-sm text-gray-400">Loading departments...</div> // Loading indicator
          ) : (
            departments.map((dept) => ( // Using departments state
              <button
                key={dept.id}
                onClick={() => setActiveDept(dept.id)} // Changed to setActiveDept
                className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group flex items-center justify-between ${ // Updated styling
                  activeDept === dept.id
                    ? 'bg-black text-white shadow-lg shadow-gray-200'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <span className="font-medium text-sm">{dept.name}</span> {/* Updated styling */}
                {activeDept === dept.id && ( // Only show arrow for active department
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            ))
          )}
        </div>

        {/* Bottom Navigation */}
        <div className="p-8 border-t border-gray-100">
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

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <DepartmentDetail
          departmentId={activeDept}
          departmentName={departments.find(d => d.id === activeDept)?.name || ''}
          departmentNotionId={departments.find(d => d.id === activeDept)?.notionId}
        />
      </div>
    </div>
  );
}
