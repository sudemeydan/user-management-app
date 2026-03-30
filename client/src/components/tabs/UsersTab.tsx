import React from 'react';
import {
    UserPlus, Crown, Lock, Check, X,
    Clock, UserCheck, UserX, Download
} from 'lucide-react';

interface UsersTabProps {
    user: any;
    filteredUsers: any[];
    searchTerm: string;
    setSearchTerm: (t: string) => void;
    sendConnectionRequest: (id: string | number) => void;
    acceptConnection: (id: string | number) => void;
    removeConnection: (id: string | number) => void;
    blockUser: (id: string | number) => void;
    unblockUser: (id: string | number) => void;
    handleDownloadTargetCV: (id: string | number, name: string) => void;
    handleAdminAction: (id: string | number, action: string) => void;
    axiosBaseURL: string;
}

const UsersTab: React.FC<UsersTabProps> = ({
    user,
    filteredUsers,
    searchTerm,
    setSearchTerm,
    sendConnectionRequest,
    acceptConnection,
    removeConnection,
    blockUser,
    unblockUser,
    handleDownloadTargetCV,
    handleAdminAction,
    axiosBaseURL
}) => {
    const Search = require('lucide-react').Search;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input type="text" placeholder="Kişi Ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredUsers.map((u: any) => {
                            const sentReq = u.receivedConnections?.find((c: any) => c.senderId === user.id);
                            const receivedReq = u.sentConnections?.find((c: any) => c.receiverId === user.id);
                            let connStatus = 'NONE';
                            let connId: string | number | null = null;
                            if (sentReq) { connStatus = sentReq.status === 'ACCEPTED' ? 'ACCEPTED' : 'PENDING_SENT'; connId = sentReq.id; }
                            else if (receivedReq) { connStatus = receivedReq.status === 'ACCEPTED' ? 'ACCEPTED' : 'PENDING_RECEIVED'; connId = receivedReq.id; }
                            const isBlockedByMe = u.isBlockedByMe;
                            const pendingUpgrade = u.upgradeRequests?.find((req: any) => req.status === 'PENDING');
                            const canViewDetails = user.role === 'SUPERADMIN' || u.id === user.id || !u.isPrivate || connStatus === 'ACCEPTED';

                            return (
                                <tr key={u.id} className="hover:bg-gray-50/80 transition group">
                                    <td className="p-5 font-medium flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                                {canViewDetails && u.profileImage?.fileId
                                                    ? <img src={`${axiosBaseURL}/posts/image/${u.profileImage.fileId}`} alt="" className="w-full h-full object-cover filter hover:brightness-110" />
                                                    : <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-500 font-bold text-sm">{u.name?.charAt(0).toUpperCase()}</div>
                                                }
                                            </div>
                                            {u.isPrivate && <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-0.5 rounded-full border-2 border-white"><Lock size={10} /></div>}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2"><span className="text-gray-800 font-bold">{u.name}</span></div>
                                            <div className="text-gray-400 text-xs font-normal">{canViewDetails ? u.email : 'Gizli Kullanıcı'}</div>
                                        </div>
                                    </td>
                                    <td className="p-5"><span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">{u.role}</span></td>
                                    <td className="p-5 text-right">
                                        {u.id !== user.id && (
                                            <div className="flex justify-end gap-2 items-center">
                                                {user.role === 'SUPERADMIN' && pendingUpgrade && (
                                                    <div className="flex items-center gap-1 border-r border-gray-200 pr-3 mr-1">
                                                        <span className="text-xs text-amber-500 font-bold mr-2"><Crown size={14} className="inline mb-0.5" /> PRO İstiyor</span>
                                                        <button onClick={() => handleAdminAction(u.id, 'APPROVE')} className="bg-green-500 hover:bg-green-600 text-white px-2 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">Onayla</button>
                                                        <button onClick={() => handleAdminAction(u.id, 'REJECT')} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1.5 rounded-lg text-xs font-bold transition shadow-sm">Red</button>
                                                    </div>
                                                )}
                                                {connStatus === 'NONE' && <button onClick={() => sendConnectionRequest(u.id)} className="flex items-center gap-1 text-xs bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 px-3 py-1.5 rounded-lg transition font-medium"><UserPlus size={14} /> İstek Gönder</button>}
                                                {connStatus === 'PENDING_SENT' && <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg font-medium"><Clock size={14} /> Bekliyor</span>}
                                                {connStatus === 'PENDING_RECEIVED' && (
                                                    <div className="flex gap-1">
                                                        <button onClick={() => acceptConnection(connId as string|number)} className="flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition"><Check size={14} /> Kabul</button>
                                                        <button onClick={() => removeConnection(connId as string|number)} className="flex items-center gap-1 text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200 transition"><X size={14} /> Red</button>
                                                    </div>
                                                )}
                                                {connStatus === 'ACCEPTED' && (
                                                    <button onClick={() => removeConnection(connId as string|number)} className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg group-hover:bg-red-50 group-hover:text-red-600 transition">
                                                        <UserCheck size={14} className="group-hover:hidden" />
                                                        <UserX size={14} className="hidden group-hover:block" />
                                                        <span className="group-hover:hidden">Bağlı</span>
                                                        <span className="hidden group-hover:block">Kaldır</span>
                                                    </button>
                                                )}
                                                {isBlockedByMe
                                                    ? <button onClick={() => unblockUser(u.id)} className="flex items-center gap-1 text-xs bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 px-3 py-1.5 rounded-lg transition font-medium border border-gray-200">Engeli Kaldır</button>
                                                    : <button onClick={() => blockUser(u.id)} className="flex items-center gap-1 text-xs bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg transition font-medium border border-red-200"><UserX size={14} /> Engelle</button>
                                                }
                                                {canViewDetails && !isBlockedByMe && (
                                                    <button onClick={() => handleDownloadTargetCV(u.id, u.name)} title="Aktif CV'sini İndir" className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white px-3 py-1.5 rounded-lg transition font-medium border border-indigo-200 ml-2"><Download size={14} /> CV İndir</button>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UsersTab;
