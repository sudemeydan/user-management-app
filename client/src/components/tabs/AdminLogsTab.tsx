import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../../axiosInstance';
import { ShieldAlert, Info, AlertTriangle, UserCheck, Loader2, RefreshCw } from 'lucide-react';

const AdminLogsTab: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [actionFilter, setActionFilter] = useState('');
    const [levelFilter, setLevelFilter] = useState('');
    const LIMIT = 20;

    const fetchLogs = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params: Record<string, string> = {
                page: page.toString(),
                limit: LIMIT.toString(),
            };
            if (actionFilter) params.action = actionFilter.toUpperCase();
            if (levelFilter) params.level = levelFilter;

            const response = await axiosInstance.get('/logs', { params });
            if (response.data.success) {
                setLogs(response.data.data);
                setTotal(response.data.total);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Loglar yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    }, [page, actionFilter, levelFilter]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const getActionBadge = (action: string) => {
        if (!action) return null;
        const colors: Record<string, string> = {
            LOGIN: 'bg-green-100 text-green-700',
            LOGOUT: 'bg-blue-100 text-blue-700',
            LOGIN_FAILED: 'bg-red-100 text-red-700',
            ADMIN_DELETE_USER: 'bg-red-100 text-red-700',
            ADMIN_UPDATE_USER: 'bg-yellow-100 text-yellow-700',
            ADMIN_BLOCK_USER: 'bg-orange-100 text-orange-700',
            ADMIN_UNBLOCK_USER: 'bg-teal-100 text-teal-700',
            ADMIN_HANDLE_UPGRADE: 'bg-purple-100 text-purple-700',
            ADMIN_TOGGLE_PRIVACY: 'bg-indigo-100 text-indigo-700',
        };
        const cls = colors[action] || 'bg-gray-100 text-gray-700';
        return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cls}`}>{action}</span>;
    };

    const getLevelBadge = (level: string) => {
        const colors: Record<string, string> = {
            error: 'bg-red-100 text-red-600',
            warn: 'bg-yellow-100 text-yellow-700',
            info: 'bg-blue-100 text-blue-700',
        };
        const cls = colors[level] || 'bg-gray-100 text-gray-700';
        return <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase ${cls}`}>{level || '-'}</span>;
    };

    const getRowIcon = (action: string) => {
        if (!action) return <Info size={15} className="text-gray-400" />;
        if (action.includes('LOGIN') || action.includes('LOGOUT')) return <UserCheck size={15} className="text-blue-500" />;
        if (action.includes('FAILED') || action.includes('DELETE')) return <AlertTriangle size={15} className="text-red-500" />;
        return <ShieldAlert size={15} className="text-purple-500" />;
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('tr-TR');
    };

    const totalPages = Math.ceil(total / LIMIT);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif', color: 'var(--text)' }}>
                        Sistem Logları
                    </h2>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
                        Elasticsearch — Toplam <b>{total}</b> kayıt
                    </p>
                </div>

                <div className="flex gap-2 items-center">
                    <select
                        value={levelFilter}
                        onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}
                        className="px-3 py-2 rounded-xl text-sm border outline-none"
                        style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    >
                        <option value="">Tüm Seviyeler</option>
                        <option value="info">INFO</option>
                        <option value="error">ERROR</option>
                        <option value="warn">WARN</option>
                    </select>

                    <select
                        value={actionFilter}
                        onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                        className="px-3 py-2 rounded-xl text-sm border outline-none"
                        style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                    >
                        <option value="">Tüm İşlemler</option>
                        <option value="LOGIN">Login</option>
                        <option value="LOGOUT">Logout</option>
                        <option value="LOGIN_FAILED">Login Başarısız</option>
                        <option value="ADMIN_DELETE_USER">Kullanıcı Sil</option>
                        <option value="ADMIN_UPDATE_USER">Kullanıcı Güncelle</option>
                        <option value="ADMIN_BLOCK_USER">Kullanıcı Engelle</option>
                        <option value="ADMIN_UNBLOCK_USER">Engel Kaldır</option>
                        <option value="ADMIN_HANDLE_UPGRADE">Yükseltme Yönet</option>
                        <option value="CREATE_POST">Gönderi Oluştur</option>
                        <option value="DELETE_POST">Gönderi Sil</option>
                    </select>

                    <button
                        onClick={fetchLogs}
                        className="p-2 rounded-xl transition-all"
                        style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
                        title="Yenile"
                    >
                        <RefreshCw size={16} style={{ color: 'var(--muted)' }} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl mb-4 text-sm" style={{ background: 'rgba(255,101,132,0.1)', border: '1px solid rgba(255,101,132,0.3)', color: '#ff6584' }}>
                    {error}
                </div>
            )}

            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr style={{ background: 'var(--surface2)', color: 'var(--muted)' }}>
                            <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Zaman</th>
                            <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Seviye</th>
                            <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">İşlem</th>
                            <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Mesaj</th>
                            <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Kullanıcı</th>
                            <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Rol</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && logs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-16 text-center">
                                    <Loader2 className="animate-spin mx-auto mb-2" style={{ color: 'var(--muted)' }} />
                                    <p style={{ color: 'var(--muted)' }} className="text-sm">Yükleniyor...</p>
                                </td>
                            </tr>
                        ) : logs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-16 text-center" style={{ color: 'var(--muted)' }}>
                                    Henüz log kaydı bulunmuyor.
                                </td>
                            </tr>
                        ) : (
                            logs.map((log, idx) => (
                                <tr
                                    key={log._id || idx}
                                    className="transition-colors"
                                    style={{ borderTop: '1px solid var(--border)' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: 'var(--muted)' }}>
                                        {formatDate(log.timestamp)}
                                    </td>
                                    <td className="px-4 py-3">
                                        {getLevelBadge(log.level)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            {getRowIcon(log.action)}
                                            {getActionBadge(log.action)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm max-w-xs truncate" style={{ color: 'var(--text)' }}>
                                        {log.message}
                                    </td>
                                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>
                                        {log.email || (log.userId ? `ID: ${log.userId}` : '-')}
                                    </td>
                                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>
                                        {log.role || '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="mt-4 flex justify-between items-center text-sm" style={{ color: 'var(--muted)' }}>
                    <span>Sayfa {page} / {totalPages}</span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="px-4 py-1.5 rounded-lg border transition-all disabled:opacity-40"
                            style={{ border: '1px solid var(--border)' }}
                        >
                            ← Önceki
                        </button>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="px-4 py-1.5 rounded-lg border transition-all disabled:opacity-40"
                            style={{ border: '1px solid var(--border)' }}
                        >
                            Sonraki →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLogsTab;
