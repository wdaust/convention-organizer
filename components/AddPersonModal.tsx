import React, { useState } from 'react';

interface AddPersonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (person: any, role: string) => void;
    title?: string;
}

export default function AddPersonModal({ isOpen, onClose, onAdd, title = 'Add Additional Assistant', role = 'Assistant Overseer' }: AddPersonModalProps & { role?: string }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState(role);

    React.useEffect(() => {
        setSelectedRole(role);
    }, [role]);

    React.useEffect(() => {
        const searchPeople = async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                return;
            }

            setLoading(true);
            try {
                const res = await fetch(`/api/people?search=${encodeURIComponent(searchQuery)}`);
                const data = await res.json();
                setSearchResults(data);
            } catch (error) {
                console.error('Failed to search people', error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(searchPeople, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="p-6 pb-0">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Search for a brother to add.
                    </p>

                    {/* Role Selection */}
                    <div className="mb-4">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Role</label>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="w-full p-3 bg-gray-100 border-none rounded-lg text-gray-900 font-bold focus:ring-2 focus:ring-blue-500 appearance-none"
                        >
                            <option value="Keyman">Keyman</option>
                            <option value="Captain">Captain</option>
                            <option value="Member">Member</option>
                            <option value="Assistant Overseer">Assistant Overseer</option>
                            <option value="Department Overseer">Department Overseer</option>
                        </select>
                    </div>

                    {/* Search */}
                    <div className="relative mb-6">
                        <input
                            type="text"
                            placeholder="Search by name"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-100 border-none rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                        <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Results List */}
                <div className="px-6 pb-2 max-h-64 overflow-y-auto">
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">Results</h3>

                    {loading ? (
                        <div className="text-sm text-gray-400">Searching...</div>
                    ) : (
                        <div className="space-y-3">
                            {searchResults.map(person => (
                                <div key={person.id} className="flex items-center justify-between">
                                    <div>
                                        <div className="font-bold text-gray-900">{person.name}</div>
                                        <div className="text-xs text-gray-500">{person.email}</div>
                                    </div>
                                    <button
                                        onClick={() => onAdd(person, selectedRole)}
                                        className="px-3 py-1 bg-black text-white text-xs font-bold rounded hover:bg-gray-800 uppercase"
                                    >
                                        ADD {selectedRole}
                                    </button>
                                </div>
                            ))}
                            {searchQuery && searchResults.length === 0 && (
                                <div className="text-sm text-gray-400">No people found.</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
