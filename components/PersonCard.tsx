import React from 'react';

interface PersonCardProps {
    name: string;
    email?: string;
    phone?: string;
    role: string;
    tags?: string[];
    imageUrl?: string;
    onRemove?: () => void;
    onEdit?: () => void;
}

export default function PersonCard({
    name,
    email,
    phone,
    role,
    tags = [],
    imageUrl,
    onRemove,
    onEdit
}: PersonCardProps) {
    return (
        <div className="bg-white rounded-2xl p-6 mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex gap-5">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                        {imageUrl ? (
                            <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                        ) : (
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        )}
                    </div>

                    {/* Info */}
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 mb-0.5">{name}</h3>
                        <p className="text-xs font-medium text-gray-400 mb-3 uppercase tracking-wide">{role}</p>

                        <div className="space-y-1 mb-4">
                            {email && (
                                <a href={`mailto:${email}`} className="block text-sm text-blue-500 font-medium hover:underline">
                                    {email}
                                </a>
                            )}

                            {phone && (
                                <div className="text-sm text-blue-500 font-medium">{phone}</div>
                            )}
                        </div>

                        {/* Tags */}
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag, index) => (
                                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-md">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button className="text-gray-300 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
