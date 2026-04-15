import React from 'react';
import { EmployerJobPosting } from '../../types/employer';
import { Briefcase, MapPin, Users, Calendar, Plus, Trash2 } from 'lucide-react';

interface JobPostingListProps {
    jobPostings: EmployerJobPosting[];
    onSelect: (id: number) => void;
    onCreateNew: () => void;
    onDelete: (id: number) => void;
}

const JobPostingList: React.FC<JobPostingListProps> = ({ jobPostings, onSelect, onCreateNew, onDelete }) => {

    const handleDelete = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (!window.confirm("Bu ilanı ve tüm başvuruları silmek istediğinize emin misiniz?")) return;
        onDelete(id);
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Syne, sans-serif' }}>
                        İş İlanlarım
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">{jobPostings.length} ilan</p>
                </div>
                <button
                    onClick={onCreateNew}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-lg transition flex items-center gap-2 text-sm"
                >
                    <Plus size={18} /> Yeni İlan Oluştur
                </button>
            </div>

            {/* Empty State */}
            {jobPostings.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Briefcase size={28} className="text-indigo-500" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">Henüz İlanınız Yok</h3>
                    <p className="text-sm text-gray-400 mb-6">İlk iş ilanınızı oluşturup adayları analiz etmeye başlayın.</p>
                    <button
                        onClick={onCreateNew}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl transition"
                    >
                        İlk İlanı Oluştur
                    </button>
                </div>
            )}

            {/* Job Posting Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobPostings.map(job => (
                    <div
                        key={job.id}
                        onClick={() => onSelect(job.id)}
                        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 cursor-pointer transition-all hover:shadow-md hover:border-indigo-200 group"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-gray-800 truncate group-hover:text-indigo-600 transition">{job.title}</h3>
                                <p className="text-sm text-gray-500 truncate">{job.company}</p>
                            </div>
                            <button
                                onClick={e => handleDelete(e, job.id)}
                                className="p-2 hover:bg-red-50 rounded-xl transition opacity-0 group-hover:opacity-100"
                                title="İlanı Sil"
                            >
                                <Trash2 size={16} className="text-red-400" />
                            </button>
                        </div>

                        <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                            {job.description.substring(0, 120)}...
                        </p>

                        <div className="flex items-center gap-3 text-xs text-gray-400">
                            {job.location && (
                                <span className="flex items-center gap-1">
                                    <MapPin size={12} /> {job.location}
                                </span>
                            )}
                            <span className="flex items-center gap-1">
                                <Users size={12} /> {job._count?.applications || 0} başvuru
                            </span>
                            <span className="flex items-center gap-1 ml-auto">
                                <Calendar size={12} /> {new Date(job.createdAt).toLocaleDateString('tr-TR')}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default JobPostingList;
