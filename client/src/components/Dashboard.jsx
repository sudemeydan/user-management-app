import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../axiosInstance';
import {
    Users, LogOut, LayoutDashboard, Loader2, Crown, Clock,
    Lock, Unlock, Camera, FileText, Briefcase, BrainCircuit
} from 'lucide-react';

// Modüler Tab Bileşenleri
import FeedTab from './tabs/FeedTab';
import UsersTab from './tabs/UsersTab';
import MyCVsTab from './tabs/MyCVsTab';
import AllCVsTab from './tabs/AllCVsTab';
import ATSTailorTab from './tabs/ATSTailorTab';

const Dashboard = ({ user, onLogout }) => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoadingAction, setIsLoadingAction] = useState(false);
    const [uploadingImg, setUploadingImg] = useState(false);
    const fileInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState('users');

    // Feed state
    const [posts, setPosts] = useState([]);
    const [postContent, setPostContent] = useState('');
    const [postImages, setPostImages] = useState([]);
    const postFileInputRef = useRef(null);

    // Modal state
    const [formData, setFormData] = useState({
        name: '', username: '', email: '', age: '', address: '', password: '', role: 'FREE_USER'
    });
    const [editingId, setEditingId] = useState(null);

    // CV state
    const [myCvs, setMyCvs] = useState([]);
    const [allActiveCvs, setAllActiveCvs] = useState([]);

    useEffect(() => {
        fetchUsers();
        fetchPosts();
        fetchMyCVs();
        fetchAllActiveCvs();
    }, []);

    // Polling: İşlenmekte olan CV varsa, 5 saniyede bir kontrol et
    useEffect(() => {
        let pollInterval;
        const hasProcessingCV = myCvs.some(cv => cv.status === 'PENDING' || cv.status === 'PROCESSING');
        if (hasProcessingCV) {
            pollInterval = setInterval(() => {
                axiosInstance.get(`/users/${user.id}/cvs`).then((response) => {
                    const freshCvs = response.data.data;
                    const stillProcessing = freshCvs.some(cv => cv.status === 'PENDING' || cv.status === 'PROCESSING');
                    if (!stillProcessing) setMyCvs(freshCvs);
                }).catch(err => console.error(err));
            }, 5000);
        }
        return () => { if (pollInterval) clearInterval(pollInterval); };
    }, [myCvs, user.id]);

    // ---- VERI ÇEKME FONKSİYONLARI ----
    const fetchAllActiveCvs = async () => {
        try { const response = await axiosInstance.get('/users/all-active-cvs'); setAllActiveCvs(response.data.data); }
        catch (error) { console.error("Aktif CV'ler çekilemedi:", error); }
    };

    const fetchMyCVs = async () => {
        try { const response = await axiosInstance.get(`/users/${user.id}/cvs`); setMyCvs(response.data.data); }
        catch (error) { console.error("CV'ler çekilemedi:", error); }
    };

    const fetchUsers = async () => {
        try {
            const response = await axiosInstance.get('/users');
            const fetchedUsers = response.data.data;
            setUsers(fetchedUsers);
            const latestCurrentUser = fetchedUsers.find(u => u.id === user.id);
            if (latestCurrentUser) localStorage.setItem('userData', JSON.stringify(latestCurrentUser));
        } catch (error) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                alert("Oturum süreniz doldu. Lütfen tekrar giriş yapın."); onLogout();
            }
        }
    };

    const fetchPosts = async () => {
        try { const response = await axiosInstance.get('/posts'); setPosts(response.data.data); }
        catch (error) { console.error("Gönderiler çekilemedi:", error); }
    };

    // ---- HANDLER FONKSİYONLARI ----
    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!postContent.trim() && postImages.length === 0) return;
        setIsLoadingAction(true);
        const postData = new FormData();
        postData.append('content', postContent);
        postImages.forEach((file) => postData.append('images', file));
        try { await axiosInstance.post('/posts', postData, { headers: { 'Content-Type': 'multipart/form-data' } }); setPostContent(''); setPostImages([]); fetchPosts(); alert("Gönderi başarıyla paylaşıldı!"); }
        catch (error) { alert("Gönderi paylaşılamadı: " + (error.response?.data?.message || error.message)); }
        finally { setIsLoadingAction(false); }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Bu gönderiyi silmek istediğinize emin misiniz?")) return;
        try { await axiosInstance.delete(`/posts/${postId}`); fetchPosts(); }
        catch (error) { alert("Silme hatası: " + (error.response?.data?.message || error.message)); }
    };

    const handlePostImageSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 10) { alert("Tek seferde en fazla 10 resim yükleyebilirsiniz!"); return; }
        setPostImages(files);
    };

    const handleImageClick = () => fileInputRef.current.click();

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { alert("Lütfen geçerli bir resim dosyası seçin!"); return; }
        setUploadingImg(true);
        const formData = new FormData();
        formData.append('image', file);
        try { await axiosInstance.post('/users/upload-avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); alert("Profil resmi güncellendi! 📸"); fetchUsers(); }
        catch (error) { alert("Resim yüklenirken hata oluştu."); }
        finally { setUploadingImg(false); }
    };

    const handleDownloadTargetCV = async (targetUserId, targetUserName) => {
        try {
            const response = await axiosInstance.get(`/users/${targetUserId}/cvs`);
            const targetCVS = response.data.data;
            const activeCV = targetCVS.find(cv => cv.isActive);
            if (!activeCV) { alert("Bu kullanıcının aktif bir CV'si bulunmuyor."); return; }
            // Download
            const res = await axiosInstance.get(`/users/cv-download/${activeCV.fileId}`, { responseType: 'blob' });
            const blob = new Blob([res.data]);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `${targetUserName}_CV.pdf`; document.body.appendChild(a); a.click(); a.remove();
        } catch (error) { alert("Kullanıcı CV'sine erişim izniniz yok veya CV bulunamadı."); }
    };

    const handleTogglePrivacy = async () => {
        const currentUserData = users.find(u => u.id === user.id) || user;
        try { await axiosInstance.patch(`/users/${user.id}/privacy`, { isPrivate: !currentUserData.isPrivate }); fetchUsers(); }
        catch (error) { alert("Gizlilik ayarı değiştirilemedi."); }
    };

    const sendConnectionRequest = async (receiverId) => {
        try { await axiosInstance.post('/connections/request', { receiverId }); fetchUsers(); }
        catch (error) { alert("İstek gönderilemedi"); }
    };

    const acceptConnection = async (connectionId) => {
        try { await axiosInstance.put(`/connections/accept/${connectionId}`); fetchUsers(); }
        catch (error) { alert("Hata oluştu"); }
    };

    const removeConnection = async (connectionId) => {
        try { await axiosInstance.delete(`/connections/remove/${connectionId}`); fetchUsers(); }
        catch (error) { alert("Hata oluştu"); }
    };

    const blockUser = async (blockedId) => {
        if (!window.confirm("Bu kullanıcıyı engellemek istediğinize emin misiniz?")) return;
        try { await axiosInstance.post(`/users/${blockedId}/block`); fetchUsers(); alert("Kullanıcı engellendi."); }
        catch (error) { alert("Engelleme hatası: " + (error.response?.data?.message || error.message)); }
    };

    const unblockUser = async (blockedId) => {
        try { await axiosInstance.delete(`/users/${blockedId}/block`); fetchUsers(); alert("Kullanıcının engeli kaldırıldı."); }
        catch (error) { alert("Engel kaldırma hatası: " + (error.response?.data?.message || error.message)); }
    };

    const handleRequestUpgrade = async () => {
        setIsLoadingAction(true);
        try { const response = await axiosInstance.post('/users/request-upgrade'); alert(response.data.message); fetchUsers(); }
        catch (error) { alert("Hata: " + (error.response?.data?.message || error.message)); }
        finally { setIsLoadingAction(false); }
    };

    const handleAdminAction = async (userId, action) => {
        if (!window.confirm("İşlemi onaylıyor musunuz?")) return;
        try { await axiosInstance.post('/users/handle-upgrade', { userId, action }); fetchUsers(); }
        catch (error) { alert("İşlem Hatası: " + error.message); }
    };

    // ---- HESAPLANAN DEĞİŞKENLER ----
    const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    const currentUserData = users.find(u => u.id === user.id) || user;
    const hasPendingRequest = currentUserData.upgradeRequests?.some(req => req.status === 'PENDING');
    const profileImgUrl = currentUserData.profileImage?.url;

    return (
        <div className="min-h-screen bg-gray-100 flex font-sans">
            {/* SIDEBAR */}
            <aside className="w-64 bg-indigo-900 text-white flex flex-col fixed h-full shadow-2xl z-20">
                <div className="p-6 flex items-center gap-3 border-b border-indigo-800">
                    <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg">YD</div>
                    <div><h1 className="font-bold text-lg tracking-wide">Ağımız</h1><p className="text-xs text-indigo-300">Sosyal Panel</p></div>
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-4">
                    {[
                        { key: 'feed', icon: <LayoutDashboard size={20} />, label: 'Akış (Feed)' },
                        { key: 'users', icon: <Users size={20} />, label: 'Kişiler' },
                        { key: 'cvs', icon: <FileText size={20} />, label: 'Özgeçmişlerim' },
                        { key: 'all-cvs', icon: <Briefcase size={20} />, label: 'Tüm Özgeçmişler' },
                        { key: 'ats-tailor', icon: <BrainCircuit size={20} />, label: 'İlana Göre Uyarla' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === tab.key ? 'bg-indigo-800 text-white shadow-sm' : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'}`}
                        >
                            {tab.icon}<span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Alt Profil Alanı */}
                <div className="p-4 border-t border-indigo-800">
                    <div className="flex items-center gap-3 mb-2 px-2">
                        <div className="relative group cursor-pointer" onClick={handleImageClick}>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-xs text-white overflow-hidden border-2 border-indigo-700">
                                {uploadingImg ? <Loader2 className="animate-spin w-4 h-4" />
                                    : profileImgUrl
                                        ? <img src={currentUserData.profileImage?.fileId ? `${axiosInstance.defaults.baseURL}/posts/image/${currentUserData.profileImage.fileId}` : profileImgUrl} alt="Profil" className="w-full h-full object-cover" />
                                        : currentUserData.name?.charAt(0).toUpperCase()
                                }
                            </div>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{currentUserData.name}</p>
                            <p className="text-xs text-indigo-300 truncate">{currentUserData.role}</p>
                        </div>
                    </div>

                    <button onClick={handleTogglePrivacy} className="w-full flex items-center justify-between px-3 py-2 mb-4 bg-indigo-950/50 rounded-lg border border-indigo-700 hover:bg-indigo-800 transition">
                        <span className="flex items-center gap-2 text-sm text-indigo-200">
                            {currentUserData.isPrivate ? <Lock size={14} className="text-amber-400" /> : <Unlock size={14} className="text-green-400" />}
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

            {/* MAIN CONTENT */}
            <main className="flex-1 ml-64 p-8">
                {/* PRO Upgrade Banner */}
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

                {/* Tab İçerikleri */}
                {activeTab === 'feed' && (
                    <FeedTab
                        user={user}
                        posts={posts}
                        postContent={postContent}
                        setPostContent={setPostContent}
                        postImages={postImages}
                        setPostImages={setPostImages}
                        postFileInputRef={postFileInputRef}
                        isLoadingAction={isLoadingAction}
                        handleCreatePost={handleCreatePost}
                        handleDeletePost={handleDeletePost}
                        handlePostImageSelect={handlePostImageSelect}
                        axiosBaseURL={axiosInstance.defaults.baseURL}
                    />
                )}

                {activeTab === 'users' && (
                    <UsersTab
                        user={user}
                        filteredUsers={filteredUsers}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        sendConnectionRequest={sendConnectionRequest}
                        acceptConnection={acceptConnection}
                        removeConnection={removeConnection}
                        blockUser={blockUser}
                        unblockUser={unblockUser}
                        handleDownloadTargetCV={handleDownloadTargetCV}
                        handleAdminAction={handleAdminAction}
                        axiosBaseURL={axiosInstance.defaults.baseURL}
                    />
                )}

                {activeTab === 'cvs' && (
                    <MyCVsTab user={user} myCvs={myCvs} fetchMyCVs={fetchMyCVs} />
                )}

                {activeTab === 'all-cvs' && (
                    <AllCVsTab allActiveCvs={allActiveCvs} />
                )}

                {activeTab === 'ats-tailor' && (
                    <ATSTailorTab myCvs={myCvs} />
                )}
            </main>
        </div>
    );
};

export default Dashboard;