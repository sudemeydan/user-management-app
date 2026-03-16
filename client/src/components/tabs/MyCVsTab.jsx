import React, { useState } from 'react';
import axiosInstance from '../../axiosInstance';
import CVDetailAccordion from '../shared/CVDetailAccordion';
import {
    FileText, UploadCloud, Loader2, Download, Trash2,
    Star, CheckCircle, XCircle, Activity,
    ChevronDown, ChevronUp, Zap
} from 'lucide-react';

const MyCVsTab = ({ user, myCvs, fetchMyCVs }) => {
    const [isUploadingCV, setIsUploadingCV] = useState(false);
    const [atsLoading, setAtsLoading] = useState(null); // CV ID'si loading ise
    const [expandedCvId, setExpandedCvId] = useState(null);
    const cvFileInputRef = React.useRef(null);

    const handleCVUploadChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
        if (!allowedTypes.includes(file.type)) { alert("Lütfen sadece PDF veya DOCX dosyası yükleyin."); return; }
        if (file.size > 5 * 1024 * 1024) { alert("Dosya boyutu 5MB'dan küçük olmalıdır."); return; }

        setIsUploadingCV(true);
        const tfData = new FormData();
        tfData.append('cvFile', file);
        try {
            await axiosInstance.post('/users/upload-cv', tfData, { headers: { 'Content-Type': 'multipart/form-data' } });
            fetchMyCVs();
        } catch (error) { alert("CV yüklenemedi: " + (error.response?.data?.message || error.message)); }
        finally { setIsUploadingCV(false); if (cvFileInputRef.current) cvFileInputRef.current.value = ""; }
    };

    const handleCVActivate = async (cvId) => {
        try { await axiosInstance.put(`/users/cvs/${cvId}/activate`); fetchMyCVs(); }
        catch (error) { alert("Aktifleştirme başarısız: " + (error.response?.data?.message || error.message)); }
    };

    const handleCVDelete = async (cvId) => {
        if (!window.confirm("Bu CV'yi silmek istediğinize emin misiniz?")) return;
        try { await axiosInstance.delete(`/users/cvs/${cvId}`); fetchMyCVs(); }
        catch (error) { alert("Silme başarısız: " + (error.response?.data?.message || error.message)); }
    };

    const downloadCVStream = async (fileId, fileName) => {
        try {
            const res = await axiosInstance.get(`/users/cv-download/${fileId}`, { responseType: 'blob' });
            const blob = new Blob([res.data]);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); a.remove();
        } catch (error) { alert("İndirme sırasında bir hata oluştu."); }
    };

    const handleOptimizeATS = async (cvId) => {
        if (!window.confirm("CV'nizi ATS uyumlu şablona dönüştürmek istediğinize emin misiniz?")) return;
        setAtsLoading(cvId);
        try {
            const res = await axiosInstance.post(`/users/cvs/${cvId}/optimize`);
            alert(res.data.message);
            fetchMyCVs();
        } catch (error) {
            alert("ATS dönüştürme hatası: " + (error.response?.data?.message || error.message));
        } finally {
            setAtsLoading(null);
        }
    };

    const toggleCvDetails = (cvId) => setExpandedCvId(expandedCvId === cvId ? null : cvId);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><FileText /> Özgeçmiş Yönetimi</h2>
                <div>
                    <input type="file" ref={cvFileInputRef} onChange={handleCVUploadChange} accept=".pdf,.doc,.docx" className="hidden" />
                    <button onClick={() => cvFileInputRef.current.click()} disabled={isUploadingCV} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 shadow-sm">
                        {isUploadingCV ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
                        Yeni CV Yükle
                    </button>
                </div>
            </div>

            {myCvs.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
                    Henüz hiç özgeçmiş yüklemediniz. İş arayışınızda öne çıkmak için hemen bir CV ekleyin!
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {myCvs.map(cv => {
                        const isProcessing = cv.status === 'PENDING' || cv.status === 'PROCESSING';
                        const isFailed = cv.status === 'FAILED';
                        const isExpanded = expandedCvId === cv.id;

                        return (
                            <div key={cv.id} className={`border rounded-xl transition-all duration-300 overflow-hidden ${cv.isActive ? 'border-indigo-300 bg-indigo-50/20 shadow-md' : 'border-gray-200 bg-white hover:border-indigo-200'}`}>
                                {/* Ana Satır */}
                                <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => !isProcessing && toggleCvDetails(cv.id)}>
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-lg flex-shrink-0 ${isProcessing ? 'bg-amber-100 text-amber-600 animate-pulse' : isFailed ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                            {isProcessing ? <Activity size={20} /> : <FileText size={20} />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 text-sm">{cv.fileName}</h4>
                                            <div className="flex items-center gap-3 text-xs mt-1 text-gray-500">
                                                <span>{new Date(cv.createdAt).toLocaleDateString('tr-TR')}</span>
                                                <span>•</span>
                                                <span>{cv.fileSize > 1024 * 1024 ? `${(cv.fileSize / (1024 * 1024)).toFixed(2)} MB` : `${(cv.fileSize / 1024).toFixed(2)} KB`}</span>
                                                {/* Mini ATS Badge */}
                                                {cv.atsFormatScore !== null && cv.atsFormatScore !== undefined && (
                                                    <>
                                                        <span>•</span>
                                                        <span className={`font-bold ${cv.atsFormatScore >= 70 ? 'text-green-600' : cv.atsFormatScore >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                                                            ATS: {cv.atsFormatScore}/100
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {isProcessing ? (
                                            <span className="flex items-center gap-1.5 text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full"><Loader2 size={12} className="animate-spin" /> YZ İşliyor...</span>
                                        ) : isFailed ? (
                                            <span className="flex items-center gap-1.5 text-xs font-bold bg-red-100 text-red-700 px-3 py-1 rounded-full"><XCircle size={12} /> Hata Oluştu</span>
                                        ) : cv.isActive ? (
                                            <span className="flex items-center gap-1 text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200"><CheckCircle size={12} /> Profilde Aktif</span>
                                        ) : (
                                            <span className="text-xs font-semibold text-gray-400">Pasif</span>
                                        )}

                                        <div className="flex items-center gap-1 border-l pl-4 border-gray-200" onClick={e => e.stopPropagation()}>
                                            {/* ATS Optimizasyon Butonu */}
                                            {!isProcessing && cv.atsFormatScore !== null && cv.atsFormatScore < 70 && (
                                                <button
                                                    onClick={() => handleOptimizeATS(cv.id)}
                                                    disabled={atsLoading === cv.id}
                                                    title="ATS Şablonuna Dönüştür"
                                                    className="p-2 text-purple-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition"
                                                >
                                                    {atsLoading === cv.id ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                                                </button>
                                            )}
                                            {!isProcessing && !cv.isActive && (
                                                <button onClick={() => handleCVActivate(cv.id)} title="Aktif Yap" className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition"><Star size={18} /></button>
                                            )}
                                            <button onClick={() => downloadCVStream(cv.fileId, cv.fileName)} title="İndir" className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"><Download size={18} /></button>
                                            <button onClick={() => handleCVDelete(cv.id)} title="Sil" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                                            {!isProcessing && (
                                                <button className="p-1 text-gray-400" onClick={() => toggleCvDetails(cv.id)}>
                                                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Detay */}
                                {isExpanded && !isProcessing && <CVDetailAccordion cv={cv} fetchMyCVs={fetchMyCVs} />}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyCVsTab;
