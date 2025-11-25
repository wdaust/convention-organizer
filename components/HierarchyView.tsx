import React, { useState } from 'react';
import PersonCard from './PersonCard';

interface Assignment {
    id: string;
    personId: string;
    role: string;
    reportsTo?: string;
    children?: Assignment[];
    [key: string]: any;
}

interface HierarchyViewProps {
    assignment: Assignment;
    peopleMap: Record<string, any>;
    onAddSubordinate: (parentId: string, parentRole: string) => void;
    level?: number;
}

export default function HierarchyView({ assignment, peopleMap, onAddSubordinate, level = 0 }: HierarchyViewProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const person = peopleMap[assignment.personId];

    if (!person) return null;

    const getNextRole = (currentRole: string) => {
        switch (currentRole) {
            case 'Assistant Overseer': return 'Keyman';
            case 'Keyman': return 'Captain';
            case 'Captain': return 'Member';
            default: return 'Member';
        }
    };

    const nextRole = getNextRole(assignment.role);
    const hasChildren = assignment.children && assignment.children.length > 0;

    return (
        <div className={`mb-4 ${level > 0 ? 'ml-8 border-l-2 border-gray-100 pl-4' : ''}`}>
            <div className="flex items-start gap-2">
                {/* Expand/Collapse Toggle */}
                {(hasChildren || level < 3) && ( // Allow expanding if it has children OR if we can add children (up to level 3)
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="mt-4 p-1 text-gray-400 hover:text-gray-600 transition"
                    >
                        <svg
                            className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}

                <div className="flex-1">
                    <PersonCard
                        {...person}
                        role={assignment.role}
                        onEdit={() => console.log('Edit', person.name)}
                    />

                    {/* Children / Subordinates */}
                    {isExpanded && (
                        <div className="mt-4">
                            {assignment.children?.map(child => (
                                <HierarchyView
                                    key={child.id}
                                    assignment={child}
                                    peopleMap={peopleMap}
                                    onAddSubordinate={onAddSubordinate}
                                    level={level + 1}
                                />
                            ))}

                            {/* Add Subordinate Button */}
                            {assignment.role !== 'Member' && (
                                <button
                                    onClick={() => onAddSubordinate(assignment.id, nextRole)}
                                    className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition py-2 px-4 border border-dashed border-gray-200 rounded-lg w-full justify-center hover:border-gray-300"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add {nextRole}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
