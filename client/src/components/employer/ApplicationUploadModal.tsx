import React, { useState, useRef } from 'react';
import { X, Upload, Loader2, User, Mail, FileText } from 'lucide-react';

interface ApplicationUploadModalProps {
    isOpen: boolean;
    jobPostingId: number;
    onClose: () => void;
    onUploaded: () => void;
    axiosInstance: any;
}

const ApplicationUploadModal: React.FC<ApplicationUploadModalProps> = ({ isOpen, jobPostingId, onClose, onUploaded, axiosInstance }) => {
    const [candidateName, setCandidateName] = useState('');
    const [candidateEmail, setCandidateEmail] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!candidateName.trim()) { alert("Aday adı zorunludur."); return; }
        if (!file) { alert("Lütfen bir CV dosyası seçin."); return; }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('cvFile', file);
            formData.append('candidateName', candidateName.trim());
            if (candidateEmail.trim()) {
                formData.append('candidateEmail', candidateEmail.trim());
            }

            await axiosInstance.post(`/employer/job-postings/${jobPostingId}/applications`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert("Başvuru başarıyla yüklendi! CV işleniyor... 📄");
            setCandidateName(''); setCandidateEmail(''); setFile(null);
            onUploaded();
            onClose();
        } catch (error: any) {
            alert("Hata: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
            <div
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                            <Upload size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Aday CV'si Yükle</h2>
                            <p className="text-xs text-gray-400">Başvuru bilgilerini girin</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                            <User size={14} /> Aday Adı *
                        </label>
                        <input
                            type="text"
                            value={candidateName}
                            onChange={e => setCandidateName(e.target.value)}
                            placeholder="Ör: Ahmet Yılmaz"
                            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                            <Mail size={14} /> E-posta <span className="text-gray-400 font-normal">(opsiyonel)</span>
                        </label>
                        <input
                            type="email"
                            value={candidateEmail}
                            onChange={e => setCandidateEmail(e.target.value)}
                            placeholder="aday@email.com"
                            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                            <FileText size={14} /> CV Dosyası (PDF) *
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`w-full p-4 border-2 border-dashed rounded-xl cursor-pointer transition text-center ${
                                file ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/30'
                            }`}
                        >
                            {file ? (
                                <div className="flex items-center justify-center gap-2">
                                    <FileText size={18} className="text-emerald-600" />
                                    <span className="text-sm font-medium text-emerald-700">{file.name}</span>
                                    <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(0)} KB)</span>
                                </div>
                            ) : (
                                <div>
                                    <Upload size={24} className="mx-auto text-gray-300 mb-2" />
                                    <p className="text-sm text-gray-500">Dosya seçmek için tıklayın</p>
                                    <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX — Maks. 5MB</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !candidateName.trim() || !file}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                        {loading ? 'Yükleniyor...' : 'Başvuruyu Yükle'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ApplicationUploadModal;
