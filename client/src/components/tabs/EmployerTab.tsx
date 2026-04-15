import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../axiosInstance';
import { User } from '../../types/auth';
import { EmployerJobPosting, EmployerJobPostingDetail } from '../../types/employer';
import JobPostingList from '../employer/JobPostingList';
import JobPostingDetail from '../employer/JobPostingDetail';
import CreateJobPostingModal from '../employer/CreateJobPostingModal';
import { Loader2, Building2, ShieldAlert } from 'lucide-react';

interface EmployerTabProps {
    user: User;
}

const EmployerTab: React.FC<EmployerTabProps> = ({ user }) => {
    const [view, setView] = useState<'list' | 'detail'>('list');
    const [jobPostings, setJobPostings] = useState<EmployerJobPosting[]>([]);
    const [selectedJobDetail, setSelectedJobDetail] = useState<EmployerJobPostingDetail | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Rol kontrolü
    const hasAccess = user.role === 'ADMIN' || user.role === 'EMPLOYER' || user.role === 'SUPERADMIN';

    const fetchJobPostings = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axiosInstance.get('/employer/job-postings');
            setJobPostings(res.data.data);
        } catch (error: any) {
            console.error("İlanlar çekilemedi:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchJobPostingDetail = useCallback(async (id: number) => {
        try {
            setLoading(true);
            const res = await axiosInstance.get(`/employer/job-postings/${id}`);
            setSelectedJobDetail(res.data.data);
            setView('detail');
        } catch (error: any) {
            alert("İlan detayı alınamadı: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    }, []);

    const handleDeleteJobPosting = async (id: number) => {
        try {
            await axiosInstance.delete(`/employer/job-postings/${id}`);
            alert("İlan silindi.");
            fetchJobPostings();
        } catch (error: any) {
            alert("Silme hatası: " + (error.response?.data?.message || error.message));
        }
    };

    useEffect(() => {
        if (hasAccess) {
            fetchJobPostings();
        }
    }, [hasAccess, fetchJobPostings]);

    // Erişim yoksa
    if (!hasAccess) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert size={32} className="text-red-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Erişim Kısıtlı</h3>
                    <p className="text-sm text-gray-400">
                        İK paneline erişmek için <strong>EMPLOYER</strong> veya <strong>ADMIN</strong> rolüne sahip olmanız gerekiyor.
                    </p>
                </div>
            </div>
        );
    }

    // Loading
    if (loading && view === 'list' && jobPostings.length === 0) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
                <span className="ml-3 text-gray-500 text-sm">İlanlar yükleniyor...</span>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Building2 size={20} className="text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'Syne, sans-serif' }}>İK Paneli</h1>
                    <p className="text-xs text-gray-400">İlanlarınızı yönetin, adayları analiz edin</p>
                </div>
            </div>

            {/* Content */}
            {view === 'list' && (
                <JobPostingList
                    jobPostings={jobPostings}
                    onSelect={fetchJobPostingDetail}
                    onCreateNew={() => setShowCreateModal(true)}
                    onDelete={handleDeleteJobPosting}
                />
            )}

            {view === 'detail' && selectedJobDetail && (
                <JobPostingDetail
                    jobPosting={selectedJobDetail}
                    onBack={() => { setView('list'); setSelectedJobDetail(null); fetchJobPostings(); }}
                    onRefresh={() => fetchJobPostingDetail(selectedJobDetail.id)}
                    axiosInstance={axiosInstance}
                />
            )}

            {/* Create Modal */}
            <CreateJobPostingModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreated={fetchJobPostings}
                axiosInstance={axiosInstance}
            />
        </div>
    );
};

export default EmployerTab;
