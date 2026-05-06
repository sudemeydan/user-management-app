import React, { useState, useEffect } from 'react';
import axiosInstance from '../../axiosInstance';
import { ShieldAlert, Info, AlertTriangle, UserCheck, Loader2 } from 'lucide-react';

const AdminLogsTab: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    
    // Filters
    const [actionFilter, setActionFilter] = useState('');
    const [levelFilter, setLevelFilter] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', '20');
            if (actionFilter) params.append('action', actionFilter);
            if (levelFilter) params.append('level', levelFilter);

            const response = await axiosInstance.get(`/logs?${params.toString()}`);
            if (response.data.success) {
                setLogs(response.data.data);
                setTotal(response.data.total);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Loglar yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, actionFilter, levelFilter]);

    const getIconForAction = (action: string) => {
        if (action.includes('LOGIN') || action.includes('LOGOUT')) return <UserCheck size={16} className="text-blue-500" />;
        if (action.includes('FAILED')) return <AlertTriangle size={16} className="text-red-500" />;
        if (action.includes('ADMIN')) return <ShieldAlert size={16} className="text-purple-500" />;
        return <Info size={16} className="text-gray-500" />;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('tr-TR', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6" style={{ border: '1px solid var(--border)' }}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Sistem Logları (ELK)</h2>
                    <p className="text-sm text-gray-500">Elasticsearch üzerinden gelen yönetici ve güvenlik kayıtları.</p>
                </div>
                
                <div className="flex gap-3">
                    <select 
                        value={levelFilter} 
                        onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}
                        className="p-2 border rounded-xl text-sm outline-none"
                    >
                        <option value="">Tüm Seviyeler</option>
                        <option value="info">INFO</option>
                        <option value="error">ERROR</option>
                        <option value="warn">WARN</option>
                    </select>

                    <input 
                        type="text" 
                        placeholder="Action (Örn: LOGIN)" 
                        value={actionFilter}
                        onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                        className="p-2 border rounded-xl text-sm outline-none w-48"
                    />
                </div>
            </div>

            {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl mb-4">{error}</div>}

            <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="p-4 font-semibold">Zaman</th>
                            <th className="p-4 font-semibold">Seviye</th>
                            <th className="p-4 font-semibold">İşlem (Action)</th>
                            <th className="p-4 font-semibold">Mesaj</th>
                            <th className="p-4 font-semibold">Detaylar</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && logs.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-gray-400" /></td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">Log bulunamadı.</td></tr>
                        ) : (
                            logs.map((log: any, idx: number) => (
                                <tr key={log._id || idx} className="border-t border-gray-100 hover:bg-gray-50 transition">
                                    <td className="p-4 whitespace-nowrap text-xs text-gray-500">{formatDate(log['@timestamp'])}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                                            log.level === 'error' ? 'bg-red-100 text-red-600' : 
                                            log.level === 'warn' ? 'bg-yellow-100 text-yellow-600' : 
                                            'bg-blue-100 text-blue-600'
                                        }`}>
                                            {log.level?.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4 flex items-center gap-2 font-medium">
                                        {getIconForAction(log.action || '')}
                                        {log.action || '-'}
                                    </td>
                                    <td className="p-4">{log.message}</td>
                                    <td className="p-4 text-xs font-mono text-gray-600 max-w-xs truncate" title={JSON.stringify(log, null, 2)}>
                                        {Object.keys(log).filter(k => !['@timestamp', 'level', 'message', 'action'].includes(k)).map(k => (
                                            <span key={k} className="mr-2"><b>{k}:</b> {JSON.stringify(log[k])}</span>
                                        ))}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                <span>Toplam {total} kayıt</span>
                <div className="flex gap-2">
                    <button 
                        disabled={page === 1} 
                        onClick={() => setPage(p => p - 1)}
                        className="px-3 py-1 rounded-md border hover:bg-gray-50 disabled:opacity-50"
                    >Önceki</button>
                    <span className="px-3 py-1">Sayfa {page}</span>
                    <button 
                        disabled={logs.length < 20} 
                        onClick={() => setPage(p => p + 1)}
                        className="px-3 py-1 rounded-md border hover:bg-gray-50 disabled:opacity-50"
                    >Sonraki</button>
                </div>
            </div>
        </div>
    );
};

export default AdminLogsTab;
