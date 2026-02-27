import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../axiosInstance';
import { 
    Users, UserPlus, LogOut, Edit2, Trash2, Search, 
    X, CheckCircle, LayoutDashboard, Settings, 
    Crown, Zap, Loader2, Clock, Check, XCircle, Camera
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
      setUsers(response.data.data);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    }
  };

  
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

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
        
        window.location.reload(); 
    } catch (error) {
        console.error("Upload Hatası:", error);
        alert("Resim yüklenirken hata oluştu: " + (error.response?.data?.message || error.message));
    } finally {
        setUploadingImg(false);
    }
  };

 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModal = (userToEdit = null) => {
    if (userToEdit) {
        setFormData({
            name: userToEdit.name || '',
            username: userToEdit.username || '',
            email: userToEdit.email || '',
            age: userToEdit.age || '',
            address: userToEdit.address || '',
            password: '',
            role: userToEdit.role || 'FREE_USER'
        });
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
    if(!window.confirm(action === 'APPROVE' ? "Kullanıcıyı PRO yapmak istiyor musun?" : "İsteği reddetmek istiyor musun?")) return;

    try {
        await axiosInstance.post('/users/handle-upgrade', { userId, action });
        fetchUsers();
        alert("İşlem Başarılı! ✅");
    } catch (error) {
        alert("İşlem Hatası: " + error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null
      };

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
    const lastReq = u.upgradeRequests && u.upgradeRequests.length > 0 
        ? u.upgradeRequests[u.upgradeRequests.length - 1] 
        : null;
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
            <div>
                <h1 className="font-bold text-lg tracking-wide">Yönetim</h1>
                <p className="text-xs text-indigo-300">Panel v2.0</p>
            </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-800 rounded-xl text-white shadow-sm"><LayoutDashboard size={20} /><span className="font-medium">Genel Bakış</span></button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-indigo-200 hover:bg-indigo-800/50 hover:text-white rounded-xl transition"><Users size={20} /><span className="font-medium">Kullanıcılar</span></button>
            
            {(user.role === 'PRO_USER' || user.role === 'SUPERADMIN') && (
                <div className="mt-6 px-4 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-500/30 flex items-center gap-3 text-amber-200 animate-fadeIn">
                    <Crown size={20} className="text-amber-400" />
                    <span className="font-bold text-sm">PRO Üyelik Aktif</span>
                </div>
            )}
        </nav>

        <div className="p-4 border-t border-indigo-800">
            {/* --- PROFİL KARTI VE RESİM YÜKLEME --- */}
            <div className="flex items-center gap-3 mb-4 px-2">
                <div className="relative group cursor-pointer" onClick={handleImageClick}>
                    {/* Gizli Dosya Inputu */}
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        accept="image/*"
                    />
                    
                    {/* Profil Resmi veya Baş Harf */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-xs text-white overflow-hidden border-2 border-indigo-700">
                        {uploadingImg ? (
                            <Loader2 className="animate-spin w-4 h-4" />
                        ) : profileImgUrl ? (
                            <img src={profileImgUrl} alt="Profil" className="w-full h-full object-cover" />
                        ) : (
                            currentUserData.name?.charAt(0).toUpperCase()
                        )}
                    </div>

                    {/* Hover ile çıkan kamera ikonu */}
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={14} className="text-white" />
                    </div>
                </div>

                <div className="overflow-hidden">
                    <p className="text-sm font-medium truncate">{currentUserData.name}</p>
                    <p className="text-xs text-indigo-300 truncate">{currentUserData.role}</p>
                </div>
            </div>
            {/* ------------------------------------- */}

            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-200 py-2 rounded-lg transition text-sm font-medium border border-red-500/20">
                <LogOut size={16} /> Çıkış Yap
            </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 p-8">
        
        {user.role === 'SUPERADMIN' && pendingRequests.length > 0 && (
            <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock className="text-orange-500" /> Bekleyen Yükseltme İstekleri ({pendingRequests.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pendingRequests.map(reqUser => (
                        <div key={reqUser.id} className="p-4 bg-orange-50 rounded-xl border border-orange-200 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-gray-800">{reqUser.name}</p>
                                <p className="text-xs text-gray-500">{reqUser.email}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleAdminAction(reqUser.id, 'APPROVE')} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600" title="Onayla"><Check size={18} /></button>
                                <button onClick={() => handleAdminAction(reqUser.id, 'REJECT')} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600" title="Reddet"><X size={18} /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {user.role === 'FREE_USER' && (
            <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative p-8 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider border border-white/20">Freemium Plan</span>
                            <span className="flex items-center text-amber-300 text-sm font-medium"><Zap size={14} className="mr-1 fill-current" /> Sınırlı Erişim</span>
                        </div>
                        <h3 className="text-3xl font-extrabold mb-2">PRO Paketine Geçiş Yap!</h3>
                        <p className="text-indigo-100 max-w-xl text-lg">Daha fazla özellik için yükseltme talep et.</p>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                         {hasPendingRequest ? (
                             <div className="bg-white/20 px-6 py-3 rounded-xl font-bold flex items-center gap-2 cursor-not-allowed">
                                 <Clock className="animate-pulse" /> Talep İnceleniyor...
                             </div>
                         ) : (
                             <button 
                                onClick={handleRequestUpgrade}
                                disabled={isLoadingAction}
                                className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2"
                             >
                                {isLoadingAction ? <Loader2 className="animate-spin" /> : 'YÜKSELTME TALEP ET'}
                             </button>
                         )}
                    </div>
                </div>
            </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-8">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input type="text" placeholder="Ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                </div>
                
                {(user.role === 'SUPERADMIN' || user.role === 'PRO_USER') && (
                    <button onClick={() => openModal()} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:-translate-y-0.5 transition">
                        <UserPlus size={20} /> Yeni Kullanıcı
                    </button>
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                            <th className="p-5">Kullanıcı</th>
                            <th className="p-5">Rol</th>
                            <th className="p-5">Durum</th>
                            <th className="p-5 text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {filteredUsers.map((u) => {
                            const userLastReq = u.upgradeRequests && u.upgradeRequests.length > 0 
                                ? u.upgradeRequests[u.upgradeRequests.length - 1] 
                                : null;
                            const isPending = userLastReq && userLastReq.status === 'PENDING';

                            return (
                                <tr key={u.id} className="hover:bg-gray-50/80 transition group">
                                    <td className="p-5 font-medium flex items-center gap-3">
                                        {/* Tabloda da resmi gösterelim */}
                                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                            {u.profileImage?.url ? (
                                                <img src={u.profileImage.url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-500 font-bold text-xs">
                                                    {u.name?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            {u.name} 
                                            <div className="text-gray-500 text-xs font-normal">{u.email}</div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            u.role === 'SUPERADMIN' ? 'bg-purple-100 text-purple-700' : 
                                            u.role === 'PRO_USER' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                        }`}>{u.role}</span>
                                    </td>
                                    <td className="p-5">
                                        {isPending && u.role === 'FREE_USER' ? (
                                            <span className="text-orange-500 text-xs font-bold flex items-center gap-1"><Clock size={12} /> Talep Var</span>
                                        ) : <span className="text-green-500 text-xs">Aktif</span>}
                                    </td>
                                    <td className="p-5 text-right">
                                        {(user.role === 'SUPERADMIN' || (user.role === 'PRO_USER' && u.role === 'FREE_USER')) && (
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openModal(u)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18} /></button>
                                                <button onClick={() => handleDelete(u.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
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

      {/* MODAL KODLARI BURADA AYNI ŞEKİLDE DURUYOR (Değişiklik yok, kod kısalığı için gizliyorum ama sen yapıştırırken silme!) */}
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
                    
                    {user.role === 'SUPERADMIN' && (
                        <div>
                            <label className="text-xs font-bold text-gray-500">Kullanıcı Rolü</label>
                            <select name="role" value={formData.role} onChange={handleChange} className="w-full p-2 border rounded bg-white">
                                <option value="FREE_USER">FREE USER</option>
                                <option value="PRO_USER">PRO USER</option>
                                <option value="SUPERADMIN">SUPERADMIN</option>
                            </select>
                        </div>
                    )}

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