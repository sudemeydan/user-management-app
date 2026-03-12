import React from 'react';
import axiosInstance from '../../axiosInstance';
import { Briefcase, Download } from 'lucide-react';

const AllCVsTab = ({ allActiveCvs }) => {
    const downloadCVStream = async (fileId, fileName) => {
        try {
            const res = await axiosInstance.get(`/users/cv-download/${fileId}`, { responseType: 'blob' });
            const blob = new Blob([res.data]);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); a.remove();
        } catch (error) { alert("İndirme sırasında bir hata oluştu."); }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-6 max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Briefcase /> Tüm Aktif Özgeçmişler</h2>
                <p className="text-sm text-gray-500">Platformdaki diğer kullanıcıların paylaşıma açtığı özgeçmişler</p>
            </div>
            {allActiveCvs.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
                    Sistemde şu an sizin görüntüleyebileceğiniz paylaşılan aktif bir CV bulunmuyor.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-semibold rounded-tl-xl">Kullanıcı Adı</th>
                                <th className="p-4 font-semibold">Dosya Adı</th>
                                <th className="p-4 font-semibold">Boyut</th>
                                <th className="p-4 font-semibold text-center">Tarih</th>
                                <th className="p-4 font-semibold text-right rounded-tr-xl">İndir</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {allActiveCvs.map(cv => (
                                <tr key={cv.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 font-medium text-gray-800 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">{cv.userName?.charAt(0).toUpperCase()}</div>
                                        <div><div className="font-bold">{cv.userName}</div><div className="text-xs text-gray-400">{cv.userRole}</div></div>
                                    </td>
                                    <td className="p-4 text-gray-500 max-w-[200px] truncate" title={cv.fileName}>{cv.fileName}</td>
                                    <td className="p-4 text-gray-500">{cv.fileSize > 1024 * 1024 ? `${(cv.fileSize / (1024 * 1024)).toFixed(2)} MB` : `${(cv.fileSize / 1024).toFixed(2)} KB`}</td>
                                    <td className="p-4 text-center text-gray-500">{new Date(cv.createdAt).toLocaleDateString('tr-TR')}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => downloadCVStream(cv.fileId, cv.fileName)} title="İndir" className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition border border-transparent hover:border-indigo-200 inline-flex items-center gap-1"><Download size={18} /> <span className="font-semibold text-xs py-1">İndir</span></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AllCVsTab;
