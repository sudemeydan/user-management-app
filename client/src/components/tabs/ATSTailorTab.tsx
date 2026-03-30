import React, { useState } from 'react';
import axiosInstance from '../../axiosInstance';
import {
    BrainCircuit, Loader2, CheckCircle,
    Send, ArrowRight, Sparkles, ChevronDown
} from 'lucide-react';

const STEPS = {
    INPUT: 'INPUT',
    PROPOSALS: 'PROPOSALS',
    DONE: 'DONE'
};

interface ATSTailorTabProps {
    myCvs: any[];
}

const ATSTailorTab: React.FC<ATSTailorTabProps> = ({ myCvs }) => {
    const [step, setStep] = useState<string>(STEPS.INPUT);
    const [jobText, setJobText] = useState<string>('');
    const [jobUrl, setJobUrl] = useState<string>('');
    const [selectedCvId, setSelectedCvId] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const [jobPosting, setJobPosting] = useState<any>(null);
    const [proposals, setProposals] = useState<any>(null);
    const [approvedIndexes, setApprovedIndexes] = useState<Set<number>>(new Set());

    const handleAnalyze = async () => {
        if (!jobText.trim()) { alert("Lütfen iş ilanı metnini girin."); return; }
        if (!selectedCvId) { alert("Lütfen bir CV seçin."); return; }

        setLoading(true);
        try {
            const jobRes = await axiosInstance.post('/users/job-postings', { jobText, url: jobUrl || null });
            const createdJob = jobRes.data.data;
            setJobPosting(createdJob);

            const proposalRes = await axiosInstance.get(`/users/cvs/${selectedCvId}/tailor/${createdJob.id}`);
            setProposals(proposalRes.data.data);

            if (proposalRes.data.data?.proposals) {
                setApprovedIndexes(new Set(proposalRes.data.data.proposals.map((_: any, i: number) => i)));
            }
            setStep(STEPS.PROPOSALS);
        } catch (error: any) {
            alert("Analiz hatası: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTailored = async () => {
        setLoading(true);
        try {
            const approvedProposals = proposals.proposals.filter((_: any, i: number) => approvedIndexes.has(i));
            await axiosInstance.post('/users/tailored-cvs', {
                originalCvId: parseInt(selectedCvId),
                jobPostingId: jobPosting.id,
                improvedSummary: proposals.improvedSummary,
                atsScore: proposals.atsScore || null,
                approvedProposals
            });
            setStep(STEPS.DONE);
        } catch (error: any) {
            alert("Uyarlama hatası: " + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const toggleProposal = (index: number) => {
        setApprovedIndexes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) newSet.delete(index);
            else newSet.add(index);
            return newSet;
        });
    };

    const resetAll = () => {
        setStep(STEPS.INPUT);
        setJobText(''); setJobUrl(''); setSelectedCvId('');
        setJobPosting(null); setProposals(null);
        setApprovedIndexes(new Set());
    };

    const processedCvs = myCvs.filter(cv => cv.status === 'COMPLETED');

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-8">
                {[
                    { key: STEPS.INPUT, label: '1. İlan Gir & CV Seç' },
                    { key: STEPS.PROPOSALS, label: '2. Önerileri İncele' },
                    { key: STEPS.DONE, label: '3. Tamamlandı' }
                ].map((s, i) => (
                    <React.Fragment key={s.key}>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${step === s.key ? 'bg-indigo-600 text-white shadow-lg' : Object.keys(STEPS).indexOf(step) > i ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                            {Object.keys(STEPS).indexOf(step) > i ? <CheckCircle size={16} /> : null}
                            {s.label}
                        </div>
                        {i < 2 && <ArrowRight size={16} className="text-gray-300" />}
                    </React.Fragment>
                ))}
            </div>

            {step === STEPS.INPUT && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-1">
                            <BrainCircuit className="text-purple-500" /> İş İlanına Göre CV Uyarla
                        </h2>
                        <p className="text-sm text-gray-500">İş ilanı metnini yapıştırın, CV'nizi seçin — yapay zeka uyarlama önerileri sunacak.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">CV Seçin</label>
                        {processedCvs.length === 0 ? (
                            <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">İşlenmiş bir CV'niz yok. Önce bir CV yükleyin ve işlenmesini bekleyin.</p>
                        ) : (
                            <div className="relative">
                                <select
                                    value={selectedCvId}
                                    onChange={(e) => setSelectedCvId(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition appearance-none pr-10 text-sm"
                                >
                                    <option value="">-- CV seçin --</option>
                                    {processedCvs.map(cv => (
                                        <option key={cv.id} value={cv.id}>
                                            {cv.fileName} {cv.isActive ? '(Aktif)' : ''} {cv.atsFormatScore ? `— ATS: ${cv.atsFormatScore}/100` : ''}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">İş İlanı Metni</label>
                        <textarea
                            value={jobText}
                            onChange={(e) => setJobText(e.target.value)}
                            placeholder="İş ilanını buraya yapıştırın... (Pozisyon gereklilikleri, aranan nitelikler vb.)"
                            className="w-full p-4 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none text-sm"
                            rows={8}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">İlan URL'si <span className="text-gray-400 font-normal">(opsiyonel)</span></label>
                        <input
                            type="url"
                            value={jobUrl}
                            onChange={(e) => setJobUrl(e.target.value)}
                            placeholder="https://kariyer.net/ilan/..."
                            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
                        />
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !jobText.trim() || !selectedCvId}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                        {loading ? 'Analiz Ediliyor...' : 'Yapay Zeka ile Analiz Et'}
                    </button>
                </div>
            )}

            {step === STEPS.PROPOSALS && proposals && (
                <div className="space-y-6">
                    {proposals.improvedSummary && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Sparkles size={18} className="text-purple-500" /> Önerilen Profesyonel Özet
                            </h3>
                            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-sm text-purple-900 leading-relaxed">
                                {proposals.improvedSummary}
                            </div>
                        </div>
                    )}

                    {proposals.proposals && proposals.proposals.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-gray-800">İçerik Önerileri</h3>
                                <div className="flex items-center gap-2">
                                    {proposals.atsScore !== undefined && (
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                            proposals.atsScore >= 75 ? 'bg-green-100 text-green-700' :
                                            proposals.atsScore >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                            ATS Uyum: {proposals.atsScore}/100
                                        </span>
                                    )}
                                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                        {approvedIndexes.size}/{proposals.proposals.length} onaylandı
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {proposals.proposals.map((proposal: any, index: number) => {
                                    const isApproved = approvedIndexes.has(index);
                                    return (
                                        <div
                                            key={index}
                                            className={`border rounded-xl p-4 transition-all cursor-pointer ${isApproved ? 'border-green-300 bg-green-50/50' : 'border-gray-200 bg-gray-50 opacity-60'}`}
                                            onClick={() => toggleProposal(index)}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{proposal.category}</span>
                                                        {proposal.suggestedTitle && (
                                                            <span className="text-sm font-semibold text-gray-800">{proposal.suggestedTitle}</span>
                                                        )}
                                                    </div>
                                                    {proposal.suggestedDescription && (
                                                        <p className="text-sm text-gray-700 mb-2 leading-relaxed">{proposal.suggestedDescription}</p>
                                                    )}
                                                    {proposal.aiComment && (
                                                        <p className="text-xs text-purple-600 italic flex items-center gap-1">
                                                            <BrainCircuit size={12} /> {proposal.aiComment}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 transition ${isApproved ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300 bg-white'}`}>
                                                    {isApproved && <CheckCircle size={14} />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep(STEPS.INPUT)}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition"
                        >
                            ← Geri Dön
                        </button>
                        <button
                            onClick={handleCreateTailored}
                            disabled={loading || approvedIndexes.size === 0}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            {loading ? 'Oluşturuluyor...' : `Onaylanan ${approvedIndexes.size} Öneriyle CV Oluştur`}
                        </button>
                    </div>
                </div>
            )}

            {step === STEPS.DONE && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={32} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">CV Başarıyla Uyarlandı! 🎉</h2>
                    <p className="text-gray-500 mb-6">Yapay zeka önerileriyle güçlendirilmiş CV'niz kaydedildi.</p>
                    <button
                        onClick={resetAll}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow transition"
                    >
                        Yeni Uyarlama Başlat
                    </button>
                </div>
            )}
        </div>
    );
};

export default ATSTailorTab;
