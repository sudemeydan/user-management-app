import React, { useState } from 'react';
import { X, Briefcase, Loader2 } from 'lucide-react';

interface CreateJobPostingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: () => void;
    axiosInstance: any;
}

const CreateJobPostingModal: React.FC<CreateJobPostingModalProps> = ({ isOpen, onClose, onCreated, axiosInstance }) => {
    const [title, setTitle] = useState('');
    const [company, setCompany] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !company.trim() || !description.trim()) {
            alert("Başlık, şirket ve açıklama alanları zorunludur.");
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.post('/employer/job-postings', {
                title: title.trim(),
                company: company.trim(),
                description: description.trim(),
                location: location.trim() || undefined
            });
            alert("İş ilanı başarıyla oluşturuldu! 🎉");
            setTitle(''); setCompany(''); setDescription(''); setLocation('');
            onCreated();
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
                className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Briefcase size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-800">Yeni İş İlanı</h2>
                            <p className="text-xs text-gray-400">İlan detaylarını girin</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition">
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Pozisyon Başlığı *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Ör: Senior Backend Developer"
                            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Şirket Adı *</label>
                        <input
                            type="text"
                            value={company}
                            onChange={e => setCompany(e.target.value)}
                            placeholder="Ör: TechCorp A.Ş."
                            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Konum <span className="text-gray-400 font-normal">(opsiyonel)</span></label>
                        <input
                            type="text"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            placeholder="Ör: İstanbul, Türkiye / Remote"
                            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">İlan Açıklaması *</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Pozisyon gereksinimleri, aranan nitelikler, sorumluluklar..."
                            className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none text-sm"
                            rows={8}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !title.trim() || !company.trim() || !description.trim()}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Briefcase size={20} />}
                        {loading ? 'Oluşturuluyor...' : 'İlanı Oluştur'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateJobPostingModal;
