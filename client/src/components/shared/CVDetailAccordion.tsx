import React, { useState } from 'react';
import axiosInstance from '../../axiosInstance';
import { CVData, TailoredCV, CVEntry } from '../../types/cv';
import {
    BrainCircuit, UserCheck, Zap, Crown, Briefcase, FileSignature, ChevronDown, ChevronUp, Download, Loader2, XCircle
} from 'lucide-react';

interface CVDetailAccordionProps {
    cv: CVData;
    fetchMyCVs?: () => void;
}

const CVDetailAccordion: React.FC<CVDetailAccordionProps> = ({ cv, fetchMyCVs }) => {
    const [openTailoredId, setOpenTailoredId] = useState<number | null>(null);
    const [loadingIds, setLoadingIds] = useState<(string | number)[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'classic'>('modern');

    const toggleTailored = (id: number) => {
        setOpenTailoredId(openTailoredId === id ? null : id);
    };

    const handleDownloadTailoredCV = async (fileId: string, fileName: string) => {
        try {
            const res = await axiosInstance.get(`/users/cv-download/${fileId}`, { responseType: 'blob' });
            const blob = new Blob([res.data]);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); a.remove();
        } catch (error) { alert("İndirme sırasında bir hata oluştu."); }
    };

    const handleDownloadOriginalCV = async () => {
        setLoadingIds(prev => [...prev, 'original-' + cv.id]);
        try {
            const res = await axiosInstance.get(`/users/cvs/${cv.id}/download-pdf?template=${selectedTemplate}`, { responseType: 'blob' });
            const blob = new Blob([res.data]);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `CV-${cv.personalInfo?.firstName || 'Ats'}-${cv.id}.pdf`; document.body.appendChild(a); a.click(); a.remove();
        } catch (error) {
            alert("PDF oluşturulurken bir hata oluştu.");
        } finally {
            setLoadingIds(prev => prev.filter(id => id !== 'original-' + cv.id));
        }
    };

    const handleGenerateTailoredPDF = async (tailoredCvId: number) => {
        setLoadingIds(prev => [...prev, tailoredCvId]);
        try {
            const res = await axiosInstance.post(`/users/tailored-cvs/${tailoredCvId}/optimize`);
            alert(res.data.message);
            if (fetchMyCVs) fetchMyCVs();
        } catch (error: any) {
            alert("Dosya hazırlama hatası: " + (error.response?.data?.message || error.message));
        } finally {
            setLoadingIds(prev => prev.filter(id => id !== tailoredCvId));
        }
    };
    if (cv.status === 'FAILED') {
        return (
            <div className="p-6 bg-red-50 border-t border-red-100 rounded-b-xl shadow-inner text-red-700 text-sm">
                <p className="font-bold flex items-center gap-2 mb-1"><XCircle size={16} /> İşlem Başarısız</p>
                <p>{cv.atsFormatFeedback || 'CV ayrıştırılırken bir hata oluştu veya işlem tamamlanamadı.'}</p>
            </div>
        );
    }

    if (!cv.entries || cv.entries.length === 0) {
        return <div className="p-6 text-center text-gray-500 text-sm">Ayrıştırılmış detay bulunamadı veya işlenemedi.</div>;
    }

    const skills = cv.entries.filter((e: CVEntry) => e.category === 'SKILL');
    const experiences = cv.entries.filter((e: CVEntry) => e.category === 'EXPERIENCE');
    const education = cv.entries.filter((e: CVEntry) => e.category === 'EDUCATION');

    // ATS Skor renklendirmesi
    const getScoreColor = (score: number) => {
        if (score >= 70) return { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500', label: 'Uyumlu' };
        if (score >= 40) return { bg: 'bg-amber-100', text: 'text-amber-700', bar: 'bg-amber-500', label: 'İyileştirilebilir' };
        return { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500', label: 'Format Değiştirmeli' };
    };

    return (
        <div className="p-6 bg-gray-50 border-t border-gray-100 rounded-b-xl shadow-inner">
            {/* ATS Skor Barı */}
            {cv.atsFormatScore !== null && cv.atsFormatScore !== undefined && (
                <div className="mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <BrainCircuit size={16} className="text-purple-500" /> ATS Uyumluluk Skoru
                        </h4>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${getScoreColor(cv.atsFormatScore).bg} ${getScoreColor(cv.atsFormatScore).text}`}>
                            {cv.atsFormatScore}/100 — {getScoreColor(cv.atsFormatScore).label}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${getScoreColor(cv.atsFormatScore).bar}`}
                            style={{ width: `${cv.atsFormatScore}%` }}
                        />
                    </div>
                    {cv.atsFormatFeedback && (
                        <p className="text-xs text-gray-500 mt-2 leading-relaxed italic">{cv.atsFormatFeedback}</p>
                    )}
                </div>
            )}

            {/* AI Analiz Etiketi & İndirme Butonu */}
            <div className="flex items-center justify-between mb-6">
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-indigo-200">
                    <BrainCircuit size={14} /> Yapay Zeka Analizi
                </span>

                <div className="flex items-center gap-2">
                    <select 
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value as 'modern' | 'classic')}
                        className="bg-gray-100 border border-gray-300 text-gray-700 text-xs font-semibold py-1.5 px-2 rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
                    >
                        <option value="modern">Modern (İki Sütun)</option>
                        <option value="classic">Klasik (Tek Sütun)</option>
                    </select>
                    <button 
                        onClick={handleDownloadOriginalCV}
                        disabled={loadingIds.includes('original-' + cv.id)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-1.5 px-4 rounded-lg transition-colors shadow-sm disabled:bg-blue-300"
                    >
                        {loadingIds.includes('original-' + cv.id) ? (
                            <> <Loader2 size={16} className="animate-spin" /> Hazırlanıyor... </>
                        ) : (
                            <> <Download size={16} /> PDF İndir </>
                        )}
                    </button>
                </div>
            </div>

            {/* Özet */}
            {cv.summary && (
                <div className="mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2"><UserCheck size={16} className="text-indigo-500" /> Profesyonel Özet</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{cv.summary}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Yetenekler */}
                {skills.length > 0 && (
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><Zap size={16} className="text-amber-500" /> Yetenekler & Teknolojiler</h4>
                        <div className="flex flex-wrap gap-2">
                            {skills.map((skill: CVEntry, idx: number) => (
                                <span key={idx} className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-md border border-gray-200">
                                    {skill.title} {skill.subtitle && <span className="text-gray-400">({skill.subtitle})</span>}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Eğitim */}
                {education.length > 0 && (
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><Crown size={16} className="text-blue-500" /> Eğitim Geçmişi</h4>
                        <div className="space-y-3">
                            {education.map((edu: CVEntry, idx: number) => (
                                <div key={idx} className="border-l-2 border-blue-200 pl-3">
                                    <p className="font-semibold text-gray-800 text-sm">{edu.title}</p>
                                    <p className="text-indigo-600 text-xs font-medium">{edu.subtitle}</p>
                                    {(edu.startDate || edu.endDate) && (
                                        <p className="text-gray-400 text-xs mt-1">{edu.startDate || '?'} - {edu.endDate || 'Devam Ediyor'}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Deneyimler */}
                {experiences.length > 0 && (
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm md:col-span-2">
                        <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><Briefcase size={16} className="text-green-500" /> İş Deneyimleri</h4>
                        <div className="space-y-4">
                            {experiences.map((exp: CVEntry, idx: number) => (
                                <div key={idx} className="relative pl-4 border-l-2 border-green-200">
                                    <div className="absolute w-2 h-2 bg-green-500 rounded-full -left-[5px] top-1.5"></div>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{exp.subtitle || 'Belirtilmemiş Rol'}</p>
                                            <p className="text-indigo-600 text-xs font-medium">{exp.title}</p>
                                        </div>
                                        <span className="text-gray-400 text-xs bg-gray-50 px-2 py-1 rounded">
                                            {exp.startDate || '?'} - {exp.endDate || 'Present'}
                                        </span>
                                    </div>
                                    {exp.description && <p className="text-gray-600 text-xs mt-2 leading-relaxed">{exp.description}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* AI ile Uyarlanmış Sürümler (Tailored CVs) */}
                {cv.tailoredCVs && cv.tailoredCVs.length > 0 && (
                    <div className="md:col-span-2 mt-4 space-y-4">
                        <h4 className="text-md font-bold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                            <FileSignature size={18} className="text-pink-500" /> Yapay Zeka ile Uyarlanmış Sürümler
                        </h4>
                        {cv.tailoredCVs.map((tcv: TailoredCV) => (
                            <div key={tcv.id} className="bg-white rounded-xl border border-pink-200 overflow-hidden shadow-sm">
                                <div
                                    className="p-4 bg-pink-50/50 flex justify-between items-center cursor-pointer hover:bg-pink-50 transition"
                                    onClick={() => toggleTailored(tcv.id)}
                                >
                                    <div>
                                        <div className="font-bold text-gray-800 text-sm">
                                            {tcv.jobPosting?.title || 'Pozisyon Belirtilmemiş'}
                                            <span className="text-pink-600 ml-2 font-medium">({tcv.jobPosting?.company || 'Şirket Belirtilmemiş'})</span>
                                            {tcv.atsScore && (
                                                <span className="ml-3 text-xs font-bold bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full border border-pink-200">
                                                    ATS Skoru: {tcv.atsScore}/100
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                        {tcv.fileId ? (
                                            <button 
                                                onClick={() => handleDownloadTailoredCV(tcv.fileId!, `Tailored-${tcv.jobPosting?.title || 'CV'}.pdf`)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition border border-indigo-100"
                                                title="PDF İndir"
                                            >
                                                <Download size={18} />
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleGenerateTailoredPDF(tcv.id)}
                                                disabled={loadingIds.includes(tcv.id)}
                                                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition border border-purple-100 flex items-center gap-1 text-xs font-bold"
                                                title="Dosya Hazırla"
                                            >
                                                {loadingIds.includes(tcv.id) ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                                                <span>PDF Üret</span>
                                            </button>
                                        )}
                                        <button className="text-gray-400 p-2" onClick={() => toggleTailored(tcv.id)}>
                                            {openTailoredId === tcv.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {openTailoredId === tcv.id && (
                                    <div className="p-4 border-t border-pink-100 space-y-4">
                                        {tcv.improvedSummary && (
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <h5 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                                                    <BrainCircuit size={14} className="text-purple-500" /> İyileştirilmiş Profesyonel Özet
                                                </h5>
                                                <p className="text-sm text-gray-600 leading-relaxed">{tcv.improvedSummary}</p>
                                            </div>
                                        )}

                                        {tcv.entries && tcv.entries.length > 0 && (
                                            <div>
                                                <h5 className="text-xs font-bold text-gray-700 mb-3">Değiştirilen / Eklenen Kayıtlar</h5>
                                                <div className="space-y-3">
                                                    {tcv.entries.map((entry: CVEntry, idx: number) => (
                                                        <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="bg-pink-100 text-pink-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                                                                    {entry.category}
                                                                </span>
                                                                <span className="font-semibold text-gray-800 text-sm">{entry.name}</span>
                                                            </div>
                                                            {entry.description && (
                                                                <p className="text-xs text-gray-600 leading-relaxed mb-2">{entry.description}</p>
                                                            )}
                                                            {entry.aiComment && (
                                                                <p className="text-[11px] text-purple-600 font-medium flex items-start gap-1.5 italic bg-purple-50/50 p-2 rounded">
                                                                    <BrainCircuit size={12} className="mt-0.5 flex-shrink-0" /> {entry.aiComment}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CVDetailAccordion;
