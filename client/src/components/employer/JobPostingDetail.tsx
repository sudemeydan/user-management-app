import React, { useState } from 'react';
import { EmployerJobPostingDetail } from '../../types/employer';
import CandidateScoreCard from './CandidateScoreCard';
import ApplicationUploadModal from './ApplicationUploadModal';
import { ArrowLeft, Upload, Sparkles, Loader2, Users, MapPin, Briefcase, BarChart3 } from 'lucide-react';

interface JobPostingDetailProps {
    jobPosting: EmployerJobPostingDetail;
    onBack: () => void;
    onRefresh: () => void;
    axiosInstance: any;
}

const JobPostingDetail: React.FC<JobPostingDetailProps> = ({ jobPosting, onBack, onRefresh, axiosInstance }) => {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    const handleAnalyzeAll = async () => {
        if (!window.confirm("Tüm bekleyen başvurular analiz edilecek. Devam etmek istiyor musunuz?")) return;
        setAnalyzing(true);
        try {
            const res = await axiosInstance.post(`/employer/job-postings/${jobPosting.id}/analyze-all`);
            alert(res.data.message);
            onRefresh();
        } catch (error: any) {
            alert("Analiz hatası: " + (error.response?.data?.message || error.message));
        } finally {
            setAnalyzing(false);
        }
    };

    const applications = jobPosting.applications || [];
    const completedCount = applications.filter(a => a.analysisStatus === 'COMPLETED').length;
    const pendingCount = applications.filter(a => a.analysisStatus === 'PENDING' || a.analysisStatus === 'FAILED').length;
    const avgScore = completedCount > 0
        ? Math.round(applications.filter(a => a.matchScore != null).reduce((sum, a) => sum + (a.matchScore || 0), 0) / completedCount)
        : 0;

    return (
        <div>
            {/* Back button + Header */}
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600 transition mb-4"
            >
                <ArrowLeft size={16} /> İlanlarıma Dön
            </button>

            {/* Job Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h2 className="text-xl font-bold text-gray-800 mb-1">{jobPosting.title}</h2>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                            <span className="flex items-center gap-1"><Briefcase size={14} /> {jobPosting.company}</span>
                            {jobPosting.location && <span className="flex items-center gap-1"><MapPin size={14} /> {jobPosting.location}</span>}
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line max-h-32 overflow-y-auto">
                            {jobPosting.description}
                        </p>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-gray-100">
                    <div className="text-center">
                        <p className="text-2xl font-black text-indigo-600">{applications.length}</p>
                        <p className="text-xs text-gray-400">Toplam Başvuru</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-black text-green-600">{completedCount}</p>
                        <p className="text-xs text-gray-400">Analiz Edildi</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-black text-amber-500">{pendingCount}</p>
                        <p className="text-xs text-gray-400">Bekleyen</p>
                    </div>
                    <div className="text-center">
                        <p className={`text-2xl font-black ${avgScore >= 70 ? 'text-green-600' : avgScore >= 40 ? 'text-yellow-600' : 'text-gray-400'}`}>
                            {completedCount > 0 ? avgScore : '—'}
                        </p>
                        <p className="text-xs text-gray-400">Ort. Skor</p>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
                <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
                >
                    <Upload size={18} /> Aday CV'si Yükle
                </button>
                <button
                    onClick={handleAnalyzeAll}
                    disabled={analyzing || pendingCount === 0}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {analyzing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    {analyzing ? 'Analiz Ediliyor...' : `Tümünü Analiz Et (${pendingCount})`}
                </button>
            </div>

            {/* Candidate List */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <BarChart3 size={20} className="text-indigo-500" />
                    Başvuru Skor Tablosu
                </h3>
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    En yüksek skor → En düşük
                </span>
            </div>

            {applications.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
                    <Users size={40} className="mx-auto text-gray-200 mb-4" />
                    <h4 className="text-base font-bold text-gray-600 mb-2">Henüz Başvuru Yok</h4>
                    <p className="text-sm text-gray-400">Aday CV'lerini yükleyerek başlayın.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {applications.map((app, index) => (
                        <div key={app.id} className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mt-5">
                                <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                            </div>
                            <div className="flex-1">
                                <CandidateScoreCard application={app} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            <ApplicationUploadModal
                isOpen={showUploadModal}
                jobPostingId={jobPosting.id}
                onClose={() => setShowUploadModal(false)}
                onUploaded={onRefresh}
                axiosInstance={axiosInstance}
            />
        </div>
    );
};

export default JobPostingDetail;
