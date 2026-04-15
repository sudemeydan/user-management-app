import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import axiosInstance from '../axiosInstance';
import { User } from '../types/auth';
import {
    Users, LogOut, LayoutDashboard, Loader2, Crown, Clock,
    Lock, Unlock, Camera, FileText, Briefcase, BrainCircuit, Building2
} from 'lucide-react';

import FeedTab from './tabs/FeedTab';
import UsersTab from './tabs/UsersTab';
import MyCVsTab from './tabs/MyCVsTab';
import AllCVsTab from './tabs/AllCVsTab';
import ATSTailorTab from './tabs/ATSTailorTab';
import EmployerTab from './tabs/EmployerTab';

interface DashboardProps {
    user: User;
    onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
    const [users, setUsers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isLoadingAction, setIsLoadingAction] = useState<boolean>(false);
    const [uploadingImg, setUploadingImg] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<string>('users');

    const [posts, setPosts] = useState<any[]>([]);
    const [postContent, setPostContent] = useState<string>('');
    const [postImages, setPostImages] = useState<File[]>([]);
    const postFileInputRef = useRef<HTMLInputElement>(null);

    const [myCvs, setMyCvs] = useState<any[]>([]);
    const [allActiveCvs, setAllActiveCvs] = useState<any[]>([]);

    useEffect(() => {
        fetchUsers();
        fetchPosts();
        fetchMyCVs();
        fetchAllActiveCvs();
    }, []);

    useEffect(() => {
        let pollInterval: NodeJS.Timeout;
        const hasProcessingCV = myCvs.some(cv => cv.status === 'PENDING' || cv.status === 'PROCESSING');
        
        if (hasProcessingCV) {
            pollInterval = setInterval(() => {
                axiosInstance.get(`/users/${user.id}/cvs`).then((response) => {
                    const freshCvs = response.data.data;
                    const stillProcessing = freshCvs.some((cv: any) => cv.status === 'PENDING' || cv.status === 'PROCESSING');
                    
                    // Sadece durum değiştiğinde veya işlem bittiğinde state güncelle
                    if (!stillProcessing || JSON.stringify(freshCvs) !== JSON.stringify(myCvs)) {
                        setMyCvs(freshCvs);
                    }
                }).catch(err => console.error(err));
            }, 5000);
        }
        return () => { if (pollInterval) clearInterval(pollInterval); };
    }, [user.id, myCvs.length]); // myCvs'in tamamı yerine sadece boyutu takip et

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
            const latestCurrentUser = fetchedUsers.find((u: any) => u.id === user.id);
            if (latestCurrentUser) localStorage.setItem('userData', JSON.stringify(latestCurrentUser));
        } catch (error: any) {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                alert("Oturum süreniz doldu. Lütfen tekrar giriş yapın."); onLogout();
            }
        }
    };

    const fetchPosts = async () => {
        try { const response = await axiosInstance.get('/posts'); setPosts(response.data.data); }
        catch (error) { console.error("Gönderiler çekilemedi:", error); }
    };

    const handleCreatePost = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!postContent.trim() && postImages.length === 0) return;
        setIsLoadingAction(true);
        const postData = new FormData();
        postData.append('content', postContent);
        postImages.forEach((file) => postData.append('images', file));
        try { 
            await axiosInstance.post('/posts', postData, { headers: { 'Content-Type': 'multipart/form-data' } }); 
            setPostContent(''); setPostImages([]); fetchPosts(); alert("Gönderi başarıyla paylaşıldı!"); 
        }
        catch (error: any) { alert("Gönderi paylaşılamadı: " + (error.response?.data?.message || error.message)); }
        finally { setIsLoadingAction(false); }
    };

    const handleDeletePost = async (postId: string | number) => {
        if (!window.confirm("Bu gönderiyi silmek istediğinize emin misiniz?")) return;
        try { await axiosInstance.delete(`/posts/${postId}`); fetchPosts(); }
        catch (error: any) { alert("Silme hatası: " + (error.response?.data?.message || error.message)); }
    };

    const handlePostImageSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const files = Array.from(e.target.files);
        if (files.length > 10) { alert("Tek seferde en fazla 10 resim yükleyebilirsiniz!"); return; }
        setPostImages(files);
    };

    const handleImageClick = () => fileInputRef.current?.click();

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];
        if (!file.type.startsWith('image/')) { alert("Lütfen geçerli bir resim dosyası seçin!"); return; }
        setUploadingImg(true);
        const tfData = new FormData();
        tfData.append('image', file);
        try { 
            await axiosInstance.post('/users/upload-avatar', tfData, { headers: { 'Content-Type': 'multipart/form-data' } }); 
            alert("Profil resmi güncellendi! 📸"); fetchUsers(); 
        }
        catch (error: any) { alert("Resim yüklenirken hata oluştu."); }
        finally { setUploadingImg(false); }
    };

    const handleDownloadTargetCV = async (targetUserId: string | number, targetUserName: string) => {
        try {
            const response = await axiosInstance.get(`/users/${targetUserId}/cvs`);
            const targetCVS = response.data.data;
            const activeCV = targetCVS.find((cv: any) => cv.isActive);
            if (!activeCV) { alert("Bu kullanıcının aktif bir CV'si bulunmuyor."); return; }
            const res = await axiosInstance.get(`/users/cv-download/${activeCV.fileId}`, { responseType: 'blob' });
            const blob = new Blob([res.data]);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `${targetUserName}_CV.pdf`; document.body.appendChild(a); a.click(); a.remove();
        } catch (error) { alert("Kullanıcı CV'sine erişim izniniz yok veya CV bulunamadı."); }
    };

    const handleTogglePrivacy = async () => {
        const cd = users.find(u => u.id === user.id) || user;
        try { await axiosInstance.patch(`/users/${user.id}/privacy`, { isPrivate: !cd.isPrivate }); fetchUsers(); }
        catch (error) { alert("Gizlilik ayarı değiştirilemedi."); }
    };

    const sendConnectionRequest = async (receiverId: string | number) => {
        try { await axiosInstance.post('/connections/request', { receiverId }); fetchUsers(); }
        catch (error) { alert("İstek gönderilemedi"); }
    };

    const acceptConnection = async (connectionId: string | number) => {
        try { await axiosInstance.put(`/connections/accept/${connectionId}`); fetchUsers(); }
        catch (error) { alert("Hata oluştu"); }
    };

    const removeConnection = async (connectionId: string | number) => {
        try { await axiosInstance.delete(`/connections/remove/${connectionId}`); fetchUsers(); }
        catch (error) { alert("Hata oluştu"); }
    };

    const blockUser = async (blockedId: string | number) => {
        if (!window.confirm("Bu kullanıcıyı engellemek istediğinize emin misiniz?")) return;
        try { await axiosInstance.post(`/users/${blockedId}/block`); fetchUsers(); alert("Kullanıcı engellendi."); }
        catch (error: any) { alert("Engelleme hatası: " + (error.response?.data?.message || error.message)); }
    };

    const unblockUser = async (blockedId: string | number) => {
        try { await axiosInstance.delete(`/users/${blockedId}/block`); fetchUsers(); alert("Kullanıcının engeli kaldırıldı."); }
        catch (error: any) { alert("Engel kaldırma hatası: " + (error.response?.data?.message || error.message)); }
    };

    const handleRequestUpgrade = async () => {
        setIsLoadingAction(true);
        try { const response = await axiosInstance.post('/users/request-upgrade'); alert(response.data.message); fetchUsers(); }
        catch (error: any) { alert("Hata: " + (error.response?.data?.message || error.message)); }
        finally { setIsLoadingAction(false); }
    };

    const handleAdminAction = async (userId: string | number, action: string) => {
        if (!window.confirm("İşlemi onaylıyor musunuz?")) return;
        try { await axiosInstance.post('/users/handle-upgrade', { userId, action }); fetchUsers(); }
        catch (error: any) { alert("İşlem Hatası: " + error.message); }
    };

    const filteredUsers = users.filter((u: any) => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    const cd = users.find(u => u.id === user.id) || user;
    const hasPendingRequest = cd.upgradeRequests?.some((req: any) => req.status === 'PENDING');
    const profileImgUrl = cd.profileImage?.url;

    return (
        <div className="min-h-screen flex font-sans" style={{background: 'var(--bg)'}}>
            <aside className="w-64 fixed h-full flex flex-col z-20 shadow-2xl" style={{background: 'var(--surface)', borderRight: '1px solid var(--border)'}}>
                <div className="p-6 flex items-center gap-3" style={{borderBottom: '1px solid var(--border)'}}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-lg" style={{background: 'linear-gradient(135deg, #6c63ff, #9c8fff)', fontFamily: 'Syne, sans-serif', fontSize: '11px', letterSpacing: '1px'}}>CV·AI</div>
                    <div>
                        <h1 className="font-bold text-base tracking-wide" style={{fontFamily: 'Syne, sans-serif', color: 'var(--text)'}}>Ağımız</h1>
                        <p className="text-xs" style={{color: 'var(--muted)'}}>Sosyal Panel</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 mt-2">
                    {[
                        { key: 'feed', icon: <LayoutDashboard size={18} />, label: 'Akış (Feed)' },
                        { key: 'users', icon: <Users size={18} />, label: 'Kişiler' },
                        { key: 'cvs', icon: <FileText size={18} />, label: 'Özgeçmişlerim' },
                        { key: 'all-cvs', icon: <Briefcase size={18} />, label: 'Tüm Özgeçmişler' },
                        { key: 'ats-tailor', icon: <BrainCircuit size={18} />, label: 'İlana Göre Uyarla' },
                        { key: 'employer', icon: <Building2 size={18} />, label: 'İK Paneli' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all text-sm"
                            style={activeTab === tab.key ? {
                                background: 'rgba(108,99,255,0.18)', color: '#a09dff',
                                border: '1px solid rgba(108,99,255,0.3)', boxShadow: '0 0 16px rgba(108,99,255,0.15)'
                            } : {
                                background: 'transparent', color: 'var(--muted)', border: '1px solid transparent'
                            }}
                        >
                            {tab.icon}<span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4" style={{borderTop: '1px solid var(--border)'}}>
                    <div className="flex items-center gap-3 mb-3 px-1">
                        <div className="relative group cursor-pointer" onClick={handleImageClick}>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white overflow-hidden" style={{background: 'linear-gradient(135deg, #f6d365, #fda085)', border: '2px solid var(--border)'}}>
                                {uploadingImg ? <Loader2 className="animate-spin w-4 h-4" />
                                    : profileImgUrl
                                        ? <img src={cd.profileImage?.fileId ? `${axiosInstance.defaults.baseURL}/posts/image/${cd.profileImage.fileId}` : profileImgUrl} alt="Profil" className="w-full h-full object-cover" />
                                        : cd.name?.charAt(0).toUpperCase()
                                }
                            </div>
                            <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition" style={{background: 'rgba(0,0,0,0.5)'}}>
                                <Camera size={12} className="text-white" />
                            </div>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold truncate" style={{color: 'var(--text)', fontFamily: 'Syne, sans-serif'}}>{cd.name}</p>
                            <p className="text-xs truncate" style={{color: 'var(--muted)'}}>{cd.role}</p>
                        </div>
                    </div>

                    <button onClick={handleTogglePrivacy} className="w-full flex items-center justify-between px-3 py-2 mb-2 rounded-xl transition-all" style={{background: 'var(--surface2)', border: '1px solid var(--border)'}}>
                        <span className="flex items-center gap-2 text-xs font-medium" style={{color: 'var(--muted)'}}>
                            {cd.isPrivate ? <Lock size={13} style={{color: '#f6a623'}} /> : <Unlock size={13} style={{color: 'var(--accent3)'}} />}
                            {cd.isPrivate ? 'Gizli Hesap' : 'Açık Hesap'}
                        </span>
                        <div className={`w-8 h-4 rounded-full relative transition-colors`} style={{background: cd.isPrivate ? '#f6a623' : '#3a3a55'}}>
                            <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${cd.isPrivate ? 'right-0.5' : 'left-0.5'}`}></div>
                        </div>
                    </button>

                    <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-2 rounded-xl transition-all text-sm font-medium" style={{background: 'rgba(255,101,132,0.08)', border: '1px solid rgba(255,101,132,0.2)', color: '#ff6584'}}>
                        <LogOut size={15} /> Çıkış Yap
                    </button>
                </div>
            </aside>

            <main className="flex-1 ml-64 p-8 relative" style={{zIndex: 1}}>
                {user.role === 'FREE_USER' && (
                    <div className="mb-8 relative overflow-hidden rounded-2xl text-white p-7 flex items-center justify-between" style={{background: 'linear-gradient(135deg, #6c63ff 0%, #9c8fff 50%, #ff6584 100%)', boxShadow: '0 8px 40px rgba(108,99,255,0.3)'}}>
                        <div className="absolute inset-0 opacity-20" style={{background: 'radial-gradient(ellipse at top left, rgba(255,255,255,0.3), transparent 60%)'}}></div>
                        <div style={{position: 'relative'}}>
                            <h3 className="text-2xl font-extrabold mb-1" style={{fontFamily: 'Syne, sans-serif'}}>PRO Paketine Geçiş Yap! ✨</h3>
                            <p className="text-sm opacity-80 max-w-lg">Daha fazla kişiye ulaşmak ve tüm gönderileri görmek için yükseltme talep et.</p>
                        </div>
                        <div className="flex flex-col items-center gap-3" style={{position: 'relative'}}>
                            {hasPendingRequest ? (
                                <div className="px-6 py-3 rounded-xl font-bold flex items-center gap-2 cursor-not-allowed" style={{background: 'rgba(255,255,255,0.2)', fontFamily: 'Syne, sans-serif'}}><Clock className="animate-pulse" size={16} /> İnceleniyor...</div>
                            ) : (
                                <button onClick={handleRequestUpgrade} disabled={isLoadingAction} className="font-bold py-3 px-8 rounded-xl shadow-lg transition-all flex items-center gap-2" style={{background: 'rgba(255,255,255,0.95)', color: '#6c63ff', fontFamily: 'Syne, sans-serif'}}>
                                    {isLoadingAction ? <Loader2 className="animate-spin" size={16} /> : <><Crown size={16} /> YÜKSELTME TALEP ET</>}
                                </button>
                            )}
                        </div>
                    </div>
                )}

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
                        axiosBaseURL={axiosInstance.defaults.baseURL!}
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

                {activeTab === 'employer' && (
                    <EmployerTab user={user} />
                )}
            </main>
        </div>
    );
};

export default Dashboard;
