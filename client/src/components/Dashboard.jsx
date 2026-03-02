import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../axiosInstance';
import { 
    Users, UserPlus, LogOut, Edit2, Trash2, Search, 
    X, CheckCircle, LayoutDashboard, Settings, 
    Crown, Zap, Loader2, Clock, Check, XCircle, Camera,
    Lock, Unlock, Send, UserCheck, UserX 
} from 'lucide-react';

const Dashboard = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '', username: '', email: '', age: '', address: '', password: '', role: 'FREE_USER'
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  
  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/users');
      const fetchedUsers = response.data.data;
      setUsers(fetchedUsers);

      const latestCurrentUser = fetchedUsers.find(u => u.id === user.id);
      if (latestCurrentUser) {
          localStorage.setItem('userData', JSON.stringify(latestCurrentUser));
      }
    } catch (error) {
      console.error("Veri çekme hatası:", error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          alert("Oturum süreniz doldu. Lütfen tekrar giriş yapın.");
          onLogout(); 
      }
    }
  };
  const handleImageClick = () => fileInputRef.current.click();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert("Lütfen geçerli bir resim dosyası seçin!");
        return;
    }

    setUploadingImg(true);
    const formData = new FormData();
    formData.append('image', file); 

    try {
        await axiosInstance.post('/users/upload-avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert("Profil resmi güncellendi! 📸");
        
        fetchUsers(); 
        
    } catch (error) {
        console.error("Upload Hatası:", error);
        alert("Resim yüklenirken hata oluştu: " + (error.response?.data?.message || error.message));
    } finally {
        setUploadingImg(false);
    }
  };

  const handleTogglePrivacy = async () => {
    const currentUserData = users.find(u => u.id === user.id) || user;
    try {
        await axiosInstance.patch(`/users/${user.id}/privacy`, { isPrivate: !currentUserData.isPrivate });
        fetchUsers();
    } catch (error) {
        alert("Gizlilik ayarı değiştirilemedi.");
    }
  };

  const sendConnectionRequest = async (receiverId) => {
    try {
        await axiosInstance.post('/connections/request', { receiverId });
        fetchUsers();
    } catch (error) {
        alert(error.response?.data?.message || "İstek gönderilemedi");
    }
  };

  const acceptConnection = async (connectionId) => {
    try {
        await axiosInstance.put(`/connections/accept/${connectionId}`);
        fetchUsers();
    } catch (error) {
        alert("Hata oluştu");
    }
  };

  const removeConnection = async (connectionId) => {
    try {
        await axiosInstance.delete(`/connections/remove/${connectionId}`);
        fetchUsers();
    } catch (error) {
        alert("Hata oluştu");
    }
  };
  // ------------------------------------

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const openModal = (userToEdit = null) => {
    if (userToEdit) {
        setFormData({ ...userToEdit, password: '' });
        setEditingId(userToEdit.id);
    } else {
        setFormData({ name: '', username: '', email: '', age: '', address: '', password: '', role: 'FREE_USER' });
        setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleRequestUpgrade = async () => {
    setIsLoadingAction(true);
    try {
        const response = await axiosInstance.post('/users/request-upgrade');
        alert(response.data.message);
        fetchUsers();
    } catch (error) {
        alert("Hata: " + (error.response?.data?.message || error.message));
    } finally {
        setIsLoadingAction(false);
    }
  };

  const handleAdminAction = async (userId, action) => {
    if(!window.confirm("İşlemi onaylıyor musunuz?")) return;
    try {
        await axiosInstance.post('/users/handle-upgrade', { userId, action });
        fetchUsers();
    } catch (error) {
        alert("İşlem Hatası: " + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedData = { ...formData, age: formData.age ? parseInt(formData.age) : null };
      if (editingId) {
        await axiosInstance.put(`/users/${editingId}`, formattedData);
        alert("Kullanıcı Güncellendi! ✅");
      } else {
        await axiosInstance.post('/users', formattedData);
        alert("Yeni Kullanıcı Eklendi! 🛡️");
      }
      setIsModalOpen(false);
      fetchUsers(); 
    } catch (error) {
      alert("İşlem hatası: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu kullanıcıyı silmek istediğine emin misin?")) {
      try {
        await axiosInstance.delete(`/users/${id}`);
        fetchUsers();
      } catch (error) {
        alert("Silme hatası: " + error.message);
      }
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingRequests = users.filter(u => {
    const lastReq = u.upgradeRequests && u.upgradeRequests.length > 0 ? u.upgradeRequests[u.upgradeRequests.length - 1] : null;
    return lastReq && lastReq.status === 'PENDING';
  });

  const currentUserData = users.find(u => u.id === user.id) || user;
  const hasPendingRequest = currentUserData.upgradeRequests?.some(req => req.status === 'PENDING');
  const profileImgUrl = currentUserData.profileImage?.url;

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      <aside className="w-64 bg-indigo-900 text-white flex flex-col fixed h-full shadow-2xl z-20">
        <div className="p-6 flex items-center gap-3 border-b border-indigo-800">
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg">YD</div>
            <div><h1 className="font-bold text-lg tracking-wide">Ağımız</h1><p className="text-xs text-indigo-300">Sosyal Panel</p></div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-800 rounded-xl text-white shadow-sm"><LayoutDashboard size={20} /><span className="font-medium">Akış (Feed)</span></button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-indigo-200 hover:bg-indigo-800/50 hover:text-white rounded-xl transition"><Users size={20} /><span className="font-medium">Kişiler</span></button>
        </nav>

        <div className="p-4 border-t border-indigo-800">
            <div className="flex items-center gap-3 mb-2 px-2">
                <div className="relative group cursor-pointer" onClick={handleImageClick}>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-xs text-white overflow-hidden border-2 border-indigo-700">
                        {uploadingImg ? <Loader2 className="animate-spin w-4 h-4" /> : profileImgUrl ? <img src={profileImgUrl} alt="Profil" className="w-full h-full object-cover" /> : currentUserData.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera size={14} className="text-white" /></div>
                </div>
                <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{currentUserData.name}</p>
                    <p className="text-xs text-indigo-300 truncate">{currentUserData.role}</p>
                </div>
            </div>

            {/* YENİ: Gizlilik Toggle Butonu */}
            <button onClick={handleTogglePrivacy} className="w-full flex items-center justify-between px-3 py-2 mb-4 bg-indigo-950/50 rounded-lg border border-indigo-700 hover:bg-indigo-800 transition">
                <span className="flex items-center gap-2 text-sm text-indigo-200">
                    {currentUserData.isPrivate ? <Lock size={14} className="text-amber-400"/> : <Unlock size={14} className="text-green-400"/>}
                    {currentUserData.isPrivate ? 'Gizli Hesap' : 'Açık Hesap'}
                </span>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${currentUserData.isPrivate ? 'bg-amber-500' : 'bg-gray-500'}`}>
                    <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${currentUserData.isPrivate ? 'right-0.5' : 'left-0.5'}`}></div>
                </div>
            </button>

            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-200 py-2 rounded-lg transition text-sm font-medium border border-red-500/20">
                <LogOut size={16} /> Çıkış Yap
            </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8">
        {user.role === 'FREE_USER' && (
            <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl p-8 flex items-center justify-between">
                <div>
                    <h3 className="text-3xl font-extrabold mb-2">PRO Paketine Geçiş Yap!</h3>
                    <p className="text-indigo-100 max-w-xl text-lg">Daha fazla kişiye ulaşmak ve tüm gönderileri görmek için yükseltme talep et.</p>
                </div>
                <div className="flex flex-col items-center gap-3">
                     {hasPendingRequest ? (
                         <div className="bg-white/20 px-6 py-3 rounded-xl font-bold flex items-center gap-2 cursor-not-allowed"><Clock className="animate-pulse" /> İnceleniyor...</div>
                     ) : (
                         <button onClick={handleRequestUpgrade} disabled={isLoadingAction} className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2">
                            {isLoadingAction ? <Loader2 className="animate-spin" /> : 'YÜKSELTME TALEP ET'}
                         </button>
                     )}
                </div>
            </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-8">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input type="text" placeholder="Kişi Ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredUsers.map((u) => {
                            // --- BAĞLANTI (CONNECTION) MANTIĞI ---
                            const sentReq = u.receivedConnections?.find(c => c.senderId === user.id);
                            const receivedReq = u.sentConnections?.find(c => c.receiverId === user.id);
                            
                            let connStatus = 'NONE';
                            let connId = null;

                            if (sentReq) { connStatus = sentReq.status === 'ACCEPTED' ? 'ACCEPTED' : 'PENDING_SENT'; connId = sentReq.id; } 
                            else if (receivedReq) { connStatus = receivedReq.status === 'ACCEPTED' ? 'ACCEPTED' : 'PENDING_RECEIVED'; connId = receivedReq.id; }

                            // GİZLİLİK KONTROLÜ
                            const canViewDetails = user.role === 'SUPERADMIN' || u.id === user.id || !u.isPrivate || connStatus === 'ACCEPTED';

                            return (
                                <tr key={u.id} className="hover:bg-gray-50/80 transition group">
                                    <td className="p-5 font-medium flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                                {canViewDetails && u.profileImage?.url ? (
                                                    <img src={u.profileImage.url} alt="" className="w-full h-full object-cover filter hover:brightness-110" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-500 font-bold text-sm">
                                                        {u.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                            {u.isPrivate && <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-0.5 rounded-full border-2 border-white"><Lock size={10}/></div>}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-800 font-bold">{u.name}</span>
                                            </div>
                                            <div className="text-gray-400 text-xs font-normal">
                                                {canViewDetails ? u.email : 'Gizli Kullanıcı'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">{u.role}</span>
                                    </td>
                                    
                                    {/* --- İŞLEM / BAĞLANTI BUTONLARI --- */}
                                    <td className="p-5 text-right">
                                        {u.id !== user.id && (
                                            <div className="flex justify-end gap-2 items-center">
                                                {connStatus === 'NONE' && (
                                                    <button onClick={() => sendConnectionRequest(u.id)} className="flex items-center gap-1 text-xs bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-600 px-3 py-1.5 rounded-lg transition font-medium">
                                                        <UserPlus size={14} /> İstek Gönder
                                                    </button>
                                                )}
                                                {connStatus === 'PENDING_SENT' && (
                                                    <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg font-medium"><Clock size={14}/> Bekliyor</span>
                                                )}
                                                {connStatus === 'PENDING_RECEIVED' && (
                                                    <div className="flex gap-1">
                                                        <button onClick={() => acceptConnection(connId)} className="flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition"><Check size={14}/> Kabul</button>
                                                        <button onClick={() => removeConnection(connId)} className="flex items-center gap-1 text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200 transition"><X size={14}/> Red</button>
                                                    </div>
                                                )}
                                                {connStatus === 'ACCEPTED' && (
                                                    <button onClick={() => removeConnection(connId)} className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg group-hover:bg-red-50 group-hover:text-red-600 transition">
                                                        <UserCheck size={14} className="group-hover:hidden" />
                                                        <UserX size={14} className="hidden group-hover:block" />
                                                        <span className="group-hover:hidden">Bağlı</span>
                                                        <span className="hidden group-hover:block">Kaldır</span>
                                                    </button>
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
      </main>

      {/* Modal Kodu */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">{editingId ? 'Düzenle' : 'Oluştur'}</h3>
                    <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <input name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Ad Soyad" />
                    <input name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Email" />
                    <div className="flex gap-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-200 py-2 rounded">İptal</button>
                        <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded">Kaydet</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;