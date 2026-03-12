import React from 'react';
import {
    BrainCircuit, UserCheck, Zap, Crown, Briefcase
} from 'lucide-react';

const CVDetailAccordion = ({ cv }) => {
    if (!cv.entries || cv.entries.length === 0) {
        return <div className="p-6 text-center text-gray-500 text-sm">Ayrıştırılmış detay bulunamadı veya işlenemedi.</div>;
    }

    const skills = cv.entries.filter(e => e.category === 'SKILL');
    const experiences = cv.entries.filter(e => e.category === 'EXPERIENCE');
    const education = cv.entries.filter(e => e.category === 'EDUCATION');

    // ATS Skor renklendirmesi
    const getScoreColor = (score) => {
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

            {/* AI Analiz Etiketi */}
            <div className="flex items-center gap-2 mb-6">
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-indigo-200">
                    <BrainCircuit size={14} /> Yapay Zeka Analizi
                </span>
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
                            {skills.map((skill, idx) => (
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
                            {education.map((edu, idx) => (
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
                            {experiences.map((exp, idx) => (
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
            </div>
        </div>
    );
};

export default CVDetailAccordion;
