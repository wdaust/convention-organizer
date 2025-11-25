
import React, { useState } from 'react';
import PersonCard from './PersonCard';
import AddPersonModal from './AddPersonModal';

import HierarchyView from './HierarchyView';

interface DepartmentDetailProps {
    departmentId: string;
    departmentName: string;
    departmentNotionId?: string;
}

export default function DepartmentDetail({ departmentId, departmentName, departmentNotionId }: DepartmentDetailProps) {
    const [assignments, setAssignments] = useState<any[]>([]);
    const [peopleMap, setPeopleMap] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [modalRole, setModalRole] = useState('Assistant Overseer');
    const [parentId, setParentId] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('oversight');

    const TABS = [
        { id: 'oversight', label: 'Department Oversight' },
        { id: 'settings', label: 'Department Settings' },
        { id: 'docs', label: 'Department Docs' },
        { id: 'inventory', label: 'Department Inventory' },
        { id: 'messaging', label: 'Department Messaging' },
        { id: 'check-in', label: 'Department Check-In' },
        { id: 'reports', label: 'Department Reports' },
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch assignments for this department
            // Use the Notion UUID if available, otherwise fallback to ID (which might fail if API expects UUID)
            const idToUse = departmentNotionId || departmentId;
            const res = await fetch(`/api/assignments?departmentId=${idToUse}`);
            const data = await res.json();

            if (!Array.isArray(data)) {
                console.error('Failed to load assignments:', data);
                setAssignments([]);
                return;
            }

            setAssignments(data);

            // 2. Fetch details for the people in these assignments
            // (In a real app, we might batch this or have the API return it)
            const pIds = [...new Set(data.map((a: any) => a.personId))];
            const people: Record<string, any> = {};

            // For now, we'll just fetch everyone (optimization needed later)
            // Or better, we fetch individually if the list is small.
            // Since we don't have a batch fetch API yet, let's fetch all people and filter (temporary hack for prototype)
            // A better way is to update the API to return person details.
            // Let's assume for now we just fetch the list of people we need.
            // Actually, let's just fetch ALL people for now since the DB is small.
            const pRes = await fetch('/api/people');
            const pData = await pRes.json();
            pData.forEach((p: any) => {
                people[p.id] = p;
            });
            setPeopleMap(people);

        } catch (error) {
            console.error('Failed to fetch department data', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (departmentId) {
            fetchData();
        }
    }, [departmentId]);

    const handleAddPerson = async (person: any, role: string) => {
        try {
            await fetch('/api/assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    personId: person.id,
                    departmentId: departmentNotionId || departmentId,
                    role: role || modalRole, // Use passed role or fallback to state
                    reportsTo: parentId, // Pass the parent ID if adding a subordinate
                    tags: []
                })
            });
            setIsAddModalOpen(false);
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Failed to add person', error);
        }
    };

    const openAddModal = (role: string, parentId: string | null = null) => {
        setModalRole(role);
        setParentId(parentId);
        setIsAddModalOpen(true);
    };

    const overseerAssignment = assignments.find(a => a.role === 'Department Overseer');
    const overseer = overseerAssignment ? peopleMap[overseerAssignment.personId] : null;

    // Get root level assistants (those who don't report to anyone OR report to the Overseer - simplified for now)
    // Actually, assistants usually report to the Overseer. But in our flat list logic, we just find them by role.
    // For the hierarchy view, we'll treat 'Assistant Overseer' as the top level of the sub-trees.
    const assistants = assignments.filter(a => a.role === 'Assistant Overseer');

    return (
        <div className="max-w-3xl mx-auto pt-8 px-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 text-xs font-medium text-orange-500 mb-4 uppercase tracking-wide">
                    <button className="hover:text-orange-600">
                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Structure
                    </button>
                </div>

                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">{departmentName} Department</h1>
                        <p className="text-gray-400 font-light">
                            {TABS.find(t => t.id === activeTab)?.label.replace('Department ', '')}
                        </p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="mb-8 overflow-x-auto">
                <div className="flex space-x-1 border-b border-gray-100 min-w-max">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-3 text-xs font-bold uppercase tracking-wide transition-colors relative ${activeTab === tab.id
                                ? 'text-gray-900'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab.label.replace('Department ', '')}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            {activeTab === 'oversight' && (
                <>
                    {/* Department Overseer Section */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Department Overseer</h2>
                            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                        {overseer ? (
                            <PersonCard
                                {...overseer}
                                role="Department Overseer"
                                onEdit={() => console.log('Edit overseer')}
                            />
                        ) : (
                            <button
                                onClick={() => openAddModal('Department Overseer')}
                                className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold hover:border-gray-400 hover:text-gray-600 transition"
                            >
                                + Add Department Overseer
                            </button>
                        )}
                    </div>

                    {/* Assistant Overseer Section & Hierarchy */}
                    <div className="mb-10">
                        <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-4">Department Structure</h2>

                        {/* Render Hierarchy Roots (Assistant Overseers) */}
                        {assistants.map(assistantAssignment => {
                            // Build tree for this assistant
                            const buildTree = (rootId: string): any => {
                                const children = assignments.filter(a => a.reportsTo === rootId);
                                return {
                                    ...assignments.find(a => a.id === rootId),
                                    children: children.map(c => buildTree(c.id))
                                };
                            };

                            const assistantTree = buildTree(assistantAssignment.id);

                            return (
                                <HierarchyView
                                    key={assistantAssignment.id}
                                    assignment={assistantTree}
                                    peopleMap={peopleMap}
                                    onAddSubordinate={(parentId, role) => openAddModal(role, parentId)}
                                />
                            );
                        })}

                        <button
                            onClick={() => openAddModal('Assistant Overseer')}
                            className="w-full py-4 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition shadow-lg shadow-gray-200 mt-4"
                        >
                            Add Additional Assistant
                        </button>
                    </div>
                </>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <span className="font-bold text-gray-900">Check-in</span>
                            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" name="toggle" id="check-in-toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out translate-x-6 border-green-400" checked readOnly />
                                <label htmlFor="check-in-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-green-400 cursor-pointer"></label>
                            </div>
                        </div>
                        <div className="flex items-center justify-between mb-6">
                            <span className="font-bold text-gray-900">Whats-App</span>
                            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" name="toggle" id="whatsapp-toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out border-gray-300" />
                                <label htmlFor="whatsapp-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900">Tech Support Role</span>
                            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" name="toggle" id="tech-toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer transition-transform duration-200 ease-in-out border-gray-300" />
                                <label htmlFor="tech-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Docs Tab */}
            {activeTab === 'docs' && (
                <div className="space-y-4">
                    {[
                        { title: 'Accident Procedure', type: 'PDF' },
                        { title: 'Emergency Evac. Procedure', type: 'PDF' },
                        { title: 'General Procedure', type: '3 Items' }
                    ].map((doc, i) => (
                        <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{doc.title}</h3>
                                    <p className="text-xs text-gray-400 font-bold">{doc.type}</p>
                                </div>
                            </div>
                            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    ))}

                    <div className="pt-4 space-y-3">
                        <button className="w-full py-3 bg-gray-400 text-white rounded-xl font-bold text-sm hover:bg-gray-500 transition">
                            Add Folder
                        </button>
                        <button className="w-full py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition">
                            Add Document
                        </button>
                    </div>
                </div>
            )}

            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
                <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-gray-900">Lanyards</h3>
                            <p className="text-xs text-gray-400 font-bold">650</p>
                        </div>
                        <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>

                    <div className="pt-4">
                        <button className="w-full py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition">
                            Add Inventory Item
                        </button>
                    </div>
                </div>
            )}

            {/* Messaging Tab */}
            {activeTab === 'messaging' && (
                <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900">Department Notification</h3>
                            <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-orange-500 font-bold mb-3">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Nov 8 | 8:23am</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                            Brothers, please take a look at this document which is also posted in the documents section that explains XYZ.
                        </p>
                        <div className="flex gap-2 mb-4">
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded">ASSISTANTS</span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded">KEYMEN</span>
                        </div>
                        <div className="text-xs text-orange-500 font-bold">
                            Posted By: John Smith
                        </div>
                    </div>

                    <div className="pt-4">
                        <button className="w-full py-3 bg-black text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition">
                            Add Department Message
                        </button>
                    </div>
                </div>
            )}

            {/* Check-In Tab */}
            {activeTab === 'check-in' && (
                <div className="space-y-6">
                    <div className="flex justify-center mb-6">
                        <div className="bg-gray-100 p-1 rounded-full flex">
                            <button className="px-6 py-2 bg-black text-white rounded-full text-xs font-bold shadow-sm">Check In</button>
                            <button className="px-6 py-2 text-gray-500 text-xs font-bold hover:text-gray-900">Check Out</button>
                        </div>
                    </div>

                    <div className="relative mb-6">
                        <input type="text" placeholder="John Smith" className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500" />
                        <svg className="w-4 h-4 text-gray-400 absolute right-4 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>

                    <div className="space-y-3">
                        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                            <div>
                                <div className="font-bold text-gray-900">John Smith</div>
                                <div className="text-xs text-gray-500">Johnstown, NY</div>
                            </div>
                            <button className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-lg hover:bg-orange-600">
                                Check In
                            </button>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                            <div>
                                <div className="font-bold text-gray-900">Mike Smith</div>
                                <div className="text-xs text-gray-500">Mechanicville, NY</div>
                            </div>
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
                            <div>
                                <div className="font-bold text-gray-900">Jimmy Nutron</div>
                                <div className="text-xs text-gray-500">Smithfield, NY</div>
                            </div>
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
                <div className="flex flex-col items-center pt-8">
                    <div className="relative w-48 h-48 mb-8">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="96" cy="96" r="88" stroke="#E5E7EB" strokeWidth="12" fill="none" />
                            <circle cx="96" cy="96" r="88" stroke="#10B981" strokeWidth="12" fill="none" strokeDasharray="552" strokeDashoffset="138" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-gray-900">14</span>
                            <span className="text-sm font-bold text-gray-400">6,321</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-8 mb-8">
                        <div className="flex items-center gap-2 text-green-500 font-bold text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            Heart Pts
                        </div>
                        <div className="flex items-center gap-2 text-blue-500 font-bold text-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Steps
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 w-full">
                        <div className="text-center">
                            <div className="text-blue-500 font-bold text-lg">345</div>
                            <div className="text-xs text-gray-400 font-bold">Cal</div>
                        </div>
                        <div className="text-center">
                            <div className="text-blue-500 font-bold text-lg">154</div>
                            <div className="text-xs text-gray-400 font-bold">Move min</div>
                        </div>
                        <div className="text-center">
                            <div className="text-blue-500 font-bold text-lg">4.6</div>
                            <div className="text-xs text-gray-400 font-bold">km</div>
                        </div>
                        <div className="text-center">
                            <div className="text-blue-500 font-bold text-lg">7<span className="text-xs">h</span>32<span className="text-xs">m</span></div>
                            <div className="text-xs text-gray-400 font-bold">Sleep</div>
                        </div>
                    </div>
                </div>
            )}
            <AddPersonModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddPerson}
                title={`Add ${modalRole}`}
                role={modalRole}
            />
        </div>
    );
}
