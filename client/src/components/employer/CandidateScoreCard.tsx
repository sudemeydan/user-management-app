import React from 'react';
import { CandidateApplication } from '../../types/employer';
import { CheckCircle, AlertTriangle, Clock, XCircle, ThumbsUp, ThumbsDown } from 'lucide-react';

interface CandidateScoreCardProps {
    application: CandidateApplication;
}

const CandidateScoreCard: React.FC<CandidateScoreCardProps> = ({ application }) => {
    const { candidateName, candidateEmail, matchScore, scoreSummary, strengths, weaknesses, analysisStatus, cvFileName } = application;

    const getScoreColor = (score: number) => {
        if (score >= 80) return { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-50', border: 'border-green-200', ring: 'ring-green-500/30' };
        if (score >= 50) return { bg: 'bg-yellow-500', text: 'text-yellow-700', light: 'bg-yellow-50', border: 'border-yellow-200', ring: 'ring-yellow-500/30' };
        return { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-50', border: 'border-red-200', ring: 'ring-red-500/30' };
    };

    const getStatusBadge = () => {
        switch (analysisStatus) {
            case 'COMPLETED':
                return <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700"><CheckCircle size={12} /> Tamamlandı</span>;
            case 'ANALYZING':
                return <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 animate-pulse"><Clock size={12} /> Analiz Ediliyor</span>;
            case 'FAILED':
                return <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-700"><XCircle size={12} /> Başarısız</span>;
            default:
                return <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600"><Clock size={12} /> Bekliyor</span>;
        }
    };

    const scoreColors = matchScore != null ? getScoreColor(matchScore) : null;

    return (
        <div className={`bg-white rounded-2xl shadow-sm border transition-all hover:shadow-md ${scoreColors ? scoreColors.border : 'border-gray-200'}`}>
            <div className="p-5">
                {/* Header: Score + Name + Status */}
                <div className="flex items-start gap-4">
                    {/* Score Circle */}
                    {analysisStatus === 'COMPLETED' && matchScore != null ? (
                        <div className={`flex-shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center ${scoreColors!.light} ring-2 ${scoreColors!.ring}`}>
                            <span className={`text-2xl font-black ${scoreColors!.text}`}>{matchScore}</span>
                            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">SKOR</span>
                        </div>
                    ) : (
                        <div className="flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center bg-gray-50 ring-2 ring-gray-200/50">
                            <Clock size={24} className="text-gray-300" />
                        </div>
                    )}

                    {/* Name & Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <h4 className="text-base font-bold text-gray-800 truncate">{candidateName}</h4>
                                {candidateEmail && <p className="text-xs text-gray-400 truncate">{candidateEmail}</p>}
                                <p className="text-xs text-gray-400 mt-0.5 truncate">📎 {cvFileName}</p>
                            </div>
                            {getStatusBadge()}
                        </div>
                    </div>
                </div>

                {/* Analysis Results */}
                {analysisStatus === 'COMPLETED' && (
                    <div className="mt-4 space-y-3">
                        {/* Summary */}
                        {scoreSummary && (
                            <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-sm text-gray-700 leading-relaxed">{scoreSummary}</p>
                            </div>
                        )}

                        {/* Strengths & Weaknesses */}
                        <div className="grid grid-cols-2 gap-3">
                            {strengths && strengths.length > 0 && (
                                <div className="space-y-1.5">
                                    <p className="text-xs font-semibold text-green-600 flex items-center gap-1"><ThumbsUp size={12} /> Güçlü Yönler</p>
                                    {strengths.map((s, i) => (
                                        <p key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                                            <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                                            <span>{s}</span>
                                        </p>
                                    ))}
                                </div>
                            )}
                            {weaknesses && weaknesses.length > 0 && (
                                <div className="space-y-1.5">
                                    <p className="text-xs font-semibold text-red-500 flex items-center gap-1"><ThumbsDown size={12} /> Eksik Noktalar</p>
                                    {weaknesses.map((w, i) => (
                                        <p key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                                            <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>
                                            <span>{w}</span>
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {analysisStatus === 'PENDING' && (
                    <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <p className="text-xs text-amber-700 flex items-center gap-1.5">
                            <AlertTriangle size={13} />
                            CV henüz parse edilmedi veya analiz bekleniyor. "Tümünü Analiz Et" butonunu kullanın.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CandidateScoreCard;
