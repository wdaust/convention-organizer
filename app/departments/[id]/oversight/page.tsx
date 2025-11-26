'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import HierarchyView from '@/components/HierarchyView';
import AddPersonModal from '@/components/AddPersonModal';

export default function OversightPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: departmentId } = use(params);

  const [departmentName, setDepartmentName] = useState('');
  const [departmentNotionId, setDepartmentNotionId] = useState('');
  const [people, setPeople] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalRole, setModalRole] = useState('');
  const [modalParentId, setModalParentId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [departmentId]);

  async function fetchData() {
    if (!departmentId) return;

    setLoading(true);
    try {
      // Fetch department info
      const deptRes = await fetch('/api/departments');
      const depts = await deptRes.json();
      const dept = depts.find((d: any) => d.id === departmentId);

      if (dept) {
        console.log('Found department:', dept);
        setDepartmentName(dept.name);
        setDepartmentNotionId(dept.notionId);
      } else {
        console.error('Department not found for ID:', departmentId);
        console.log('Available departments:', depts.map((d: any) => ({ id: d.id, name: d.name })));
      }

      // Fetch people
      const peopleRes = await fetch('/api/people');
      const peopleData = await peopleRes.json();
      setPeople(peopleData);

      // Fetch assignments for this department - use notionId if available
      if (dept?.notionId) {
        const assignRes = await fetch(`/api/assignments?departmentId=${dept.notionId}`);
        const assignData = await assignRes.json();
        setAssignments(assignData);
      } else {
        console.warn('Cannot fetch assignments without department Notion ID');
        setAssignments([]);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddPerson = async (person: any, role: string) => {
    try {
      // Validate we have the Notion ID
      if (!departmentNotionId) {
        alert('Error: Department information not loaded. Please refresh the page.');
        return;
      }

      console.log('Adding person:', {
        personId: person.id,
        departmentNotionId,
        role,
        reportsTo: modalParentId
      });

      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personId: person.id,
          departmentId: departmentNotionId,
          role: role,
          reportsTo: modalParentId,
          tags: []
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        alert(`Failed to add ${role}: ${errorData.message || errorData.error}`);
        return;
      }

      setIsAddModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to add person', error);
      alert(`Failed to add ${role}. Please try again.`);
    }
  };

  const openAddModal = (role: string, parentId: string | null = null) => {
    setModalRole(role);
    setModalParentId(parentId);
    setIsAddModalOpen(true);
  };

  // Build hierarchy tree
  const buildTree = (parentId: string | null = null): any[] => {
    return assignments
      .filter(a => a.reportsTo === parentId)
      .map(assignment => {
        const person = people.find(p => p.id === assignment.personId);
        return {
          ...assignment,
          person,
          children: buildTree(assignment.id)
        };
      });
  };

  const hierarchyData = buildTree(null);

  // Create a map of people for easy lookup
  const peopleMap = people.reduce((map, person) => {
    map[person.id] = person;
    return map;
  }, {} as Record<string, any>);

  const handleAddSubordinate = (parentId: string, role: string) => {
    openAddModal(role, parentId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-200 sticky top-0 z-10">
        <Link href={`/departments/${departmentId}`} className="p-2 -ml-2 text-gray-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1 text-center">
          <h1 className="text-lg font-bold">{departmentName}</h1>
          <p className="text-xs text-gray-500">Oversight</p>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : (
          <>
            {/* Add Overseer Button */}
            {hierarchyData.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">No overseer assigned yet</p>
                <button
                  onClick={() => openAddModal('Overseer', null)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  + Add Overseer
                </button>
              </div>
            )}

            {/* Hierarchy Display */}
            {hierarchyData.length > 0 && (
              <div className="space-y-4">
                {hierarchyData.map(assignment => (
                  <HierarchyView
                    key={assignment.id}
                    assignment={assignment}
                    peopleMap={peopleMap}
                    onAddSubordinate={handleAddSubordinate}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Person Modal */}
      <AddPersonModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddPerson}
        title={`Add ${modalRole}`}
        role={modalRole}
      />

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
