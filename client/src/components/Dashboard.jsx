import React, { useState, useEffect, useRef } from 'react';
import axiosInstance from '../axiosInstance';
import {
    Users, UserPlus, LogOut, Edit2, Trash2, Search,
    X, CheckCircle, LayoutDashboard, Settings,
    Crown, Zap, Loader2, Clock, Check, XCircle, Camera,
    Lock, Unlock, Send, UserCheck, UserX, ImageIcon,
    FileText, Download, UploadCloud, Star, StarOff, Briefcase,
    ChevronDown, ChevronUp, BrainCircuit, Activity
} from 'lucide-react';

const Dashboard = ({ user, onLogout }) => {
    // ... (Önceki state'lerin tamamı aynı)
    const [users, setUsers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoadingAction, setIsLoadingAction] = useState(false);
    const [uploadingImg, setUploadingImg] = useState(false);
    const fileInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState('users');
    const [posts, setPosts] = useState([]);
    const [postContent, setPostContent] = useState('');
    const [postImages, setPostImages] = useState([]);
    const postFileInputRef = useRef(null);
    const [formData, setFormData] = useState({
        name: '', username: '', email: '', age: '', address: '', password: '', role: 'FREE_USER'
    });
    const [editingId, setEditingId] = useState(null);
    const [myCvs, setMyCvs] = useState([]);
    const [allActiveCvs, setAllActiveCvs] = useState([]);
    const [isUploadingCV, setIsUploadingCV] = useState(false);
    const cvFileInputRef = useRef(null);

    // YENİ STATE: Detayları açılan CV'nin ID'sini tutmak için
    const [expandedCvId, setExpandedCvId] = useState(null);

    useEffect(() => {
        fetchUsers();
        fetchPosts();
        fetchMyCVs();
        fetchAllActiveCvs();
    }, []);

    // YENİ EFFECT (POLLING): İşlenmekte olan (PENDING/PROCESSING) CV varsa, 5 saniyede bir kontrol et
    useEffect(() => {
        let pollInterval;

        // myCvs içinde PENDING veya PROCESSING var mı kontrol et
        const hasProcessingCV = myCvs.some(cv => cv.status === 'PENDING' || cv.status === 'PROCESSING');

        if (hasProcessingCV) {
            // 5 saniyede bir çalışacak interval'i kur
            pollInterval = setInterval(() => {
                // Burada doğrudan fetchMyCVs çağırmak yerine gizli bir API çağrısı yapıp
                // durumu manuel güncelliyoruz. Böylece her seferinde setMyCvs yapmayız.
                axiosInstance.get(`/users/${user.id}/cvs`).then((response) => {
                    const freshCvs = response.data.data;

                    // SADECE eğer durumlarda bir değişiklik varsa state'i güncelle!
                    // Bu sayede sonsuz döngüyü (infinite loop) engelliyoruz.
                    const stillProcessing = freshCvs.some(cv => cv.status === 'PENDING' || cv.status === 'PROCESSING');

                    if (!stillProcessing) {
                        // Eğer artık işlenen CV kalmadıysa, o zaman ekrana yansıt (State'i güncelle)
                        setMyCvs(freshCvs);
                    }
                }).catch(err => console.error(err));

            }, 5000);
        }

        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [myCvs, user.id]);

    const fetchAllActiveCvs = async () => {
        try {
            const response = await axiosInstance.get('/users/all-active-cvs');
            setAllActiveCvs(response.data.data);
        } catch (error) {
            console.error("Aktif CV'ler çekilemedi:", error);
        }
    };

    const fetchMyCVs = async (showLoading = true) => {
        try {
            const response = await axiosInstance.get(`/users/${user.id}/cvs`);
            setMyCvs(response.data.data);
        } catch (error) {
            console.error("CV'ler çekilemedi:", error);
        }
    };

    // ... (Diğer tüm fonksiyonlar aynı: fetchUsers, fetchPosts, handleCreatePost, handleDeletePost, vs.)
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
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                alert("Oturum süreniz doldu. Lütfen tekrar giriş yapın.");
                onLogout();
            }
        }
    };

    const fetchPosts = async () => {
        try {
            const response = await axiosInstance.get('/posts');
            setPosts(response.data.data);
        } catch (error) {
            console.error("Gönderiler çekilemedi:", error);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!postContent.trim() && postImages.length === 0) return;
        setIsLoadingAction(true);
        const postData = new FormData();
        postData.append('content', postContent);
        postImages.forEach((file) => postData.append('images', file));
        try {
            await axiosInstance.post('/posts', postData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setPostContent(''); setPostImages([]); fetchPosts();
            alert("Gönderi başarıyla paylaşıldı!");
        } catch (error) { alert("Gönderi paylaşılamadı: " + (error.response?.data?.message || error.message)); }
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
        try {
            await axiosInstance.post('/users/upload-avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert("Profil resmi güncellendi! 📸"); fetchUsers();
        } catch (error) { alert("Resim yüklenirken hata oluştu."); }
        finally { setUploadingImg(false); }
    };

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
            const res = await axiosInstance.post('/users/upload-cv', tfData, { headers: { 'Content-Type': 'multipart/form-data' } });
            // Alert'i kaldırdım veya basitleştirdim çünkü arka planda işlenecek
            console.log(res.data.message);
            fetchMyCVs(); // CV'yi PENDING olarak anında ekranda görsün diye
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

    const handleDownloadTargetCV = async (targetUserId, targetUserName) => {
        try {
            const response = await axiosInstance.get(`/users/${targetUserId}/cvs`);
            const targetCVS = response.data.data;
            const activeCV = targetCVS.find(cv => cv.isActive);
            if (!activeCV) { alert("Bu kullanıcının aktif bir CV'si bulunmuyor."); return; }
            downloadCVStream(activeCV.fileId, `${targetUserName}_CV.pdf`);
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

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formattedData = { ...formData, age: formData.age ? parseInt(formData.age) : null };
            if (editingId) { await axiosInstance.put(`/users/${editingId}`, formattedData); alert("Kullanıcı Güncellendi! ✅"); }
            else { await axiosInstance.post('/users', formattedData); alert("Yeni Kullanıcı Eklendi! 🛡️"); }
            setIsModalOpen(false); fetchUsers();
        } catch (error) { alert("İşlem hatası: " + (error.response?.data?.message || error.message)); }
    };

    const toggleCvDetails = (cvId) => {
        setExpandedCvId(expandedCvId === cvId ? null : cvId);
    };

    const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    const currentUserData = users.find(u => u.id === user.id) || user;
    const hasPendingRequest = currentUserData.upgradeRequests?.some(req => req.status === 'PENDING');
    const profileImgUrl = currentUserData.profileImage?.url;

    // YENİ UI YARDIMCI FONKSİYONU: Parse edilmiş verileri gruplayıp göstermek için
    const renderCvDetails = (cv) => {
        if (!cv.entries || cv.entries.length === 0) return <div className="p-6 text-center text-gray-500 text-sm">Ayrıştırılmış detay bulunamadı veya işlenemedi.</div>;

        // Kategorilere göre ayır
        const skills = cv.entries.filter(e => e.category === 'SKILL');
        const experiences = cv.entries.filter(e => e.category === 'EXPERIENCE');
        const education = cv.entries.filter(e => e.category === 'EDUCATION');
        const others = cv.entries.filter(e => !['SKILL', 'EXPERIENCE', 'EDUCATION'].includes(e.category));

        return (
            <div className="p-6 bg-gray-50 border-t border-gray-100 rounded-b-xl shadow-inner">
                {/* AI Analiz Etiketi */}
                <div className="flex items-center gap-2 mb-6">
                    <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 border border-indigo-200">
                        <BrainCircuit size={14} /> Yapay Zeka Analizi
                    </span>
                </div>

                {/* Özet Alanı */}
                {cv.summary && (
                    <div className="mb-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2"><UserCheck size={16} className="text-indigo-500" /> Profesyonel Özet</h4>
                        <p className="text-gray-600 text-sm leading-relaxed">{cv.summary}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Yetenekler */}
                    {skills.length > 0 && (
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><Zap size={16} className="text-amber-500" /> Yetenekler & Teknolojiler</h4>
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill, idx) => (
                                    <span key={idx} className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-md border border-gray-200">
                                        {skill.title} {skill.subtitle && <span className="text-gray-400">({skill.subtitle})</span>}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Eğitim */}
                    {education.length > 0 && (
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><Crown size={16} className="text-blue-500" /> Eğitim Geçmişi</h4>
                            <div className="space-y-3">
                                {education.map((edu, idx) => (
                                    <div key={idx} className="border-l-2 border-blue-200 pl-3">
                                        <p className="font-semibold text-gray-800 text-sm">{edu.title}</p>
                                        <p className="text-indigo-600 text-xs font-medium">{edu.subtitle}</p>
                                        {(edu.startDate || edu.endDate) && (
                                            <p className="text-gray-400 text-xs mt-1">{edu.startDate || '?'} - {edu.endDate || 'Devam Ediyor'}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Deneyimler */}
                    {experiences.length > 0 && (
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm md:col-span-2">
                            <h4 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2"><Briefcase size={16} className="text-green-500" /> İş Deneyimleri</h4>
                            <div className="space-y-4">
                                {experiences.map((exp, idx) => (
                                    <div key={idx} className="relative pl-4 border-l-2 border-green-200">
                                        <div className="absolute w-2 h-2 bg-green-500 rounded-full -left-[5px] top-1.5"></div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-gray-800 text-sm">{exp.subtitle || 'Belirtilmemiş Rol'}</p>
                                                <p className="text-indigo-600 text-xs font-medium">{exp.title}</p>
                                            </div>
                                            <span className="text-gray-400 text-xs bg-gray-50 px-2 py-1 rounded">
                                                {exp.startDate || '?'} - {exp.endDate || 'Present'}
                                            </span>
                                        </div>
                                        {exp.description && <p className="text-gray-600 text-xs mt-2 leading-relaxed">{exp.description}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-100 flex font-sans">
            <aside className="w-64 bg-indigo-900 text-white flex flex-col fixed h-full shadow-2xl z-20">
                <div className="p-6 flex items-center gap-3 border-b border-indigo-800">
                    <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-xl shadow-lg">YD</div>
                    <div><h1 className="font-bold text-lg tracking-wide">Ağımız</h1><p className="text-xs text-indigo-300">Sosyal Panel</p></div>
                </div>

                <nav className="flex-1 p-4 space-y-2 mt-4">
                    <button onClick={() => setActiveTab('feed')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'feed' ? 'bg-indigo-800 text-white shadow-sm' : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'}`}>
                        <LayoutDashboard size={20} /><span className="font-medium">Akış (Feed)</span>
                    </button>
                    <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'users' ? 'bg-indigo-800 text-white shadow-sm' : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'}`}>
                        <Users size={20} /><span className="font-medium">Kişiler</span>
                    </button>
                    <button onClick={() => setActiveTab('cvs')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'cvs' ? 'bg-indigo-800 text-white shadow-sm' : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'}`}>
                        <FileText size={20} /><span className="font-medium">Özgeçmişlerim</span>
                    </button>
                    <button onClick={() => setActiveTab('all-cvs')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'all-cvs' ? 'bg-indigo-800 text-white shadow-sm' : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'}`}>
                        <Briefcase size={20} /><span className="font-medium">Tüm Özgeçmişler</span>
                    </button>
                </nav>

                <div className="p-4 border-t border-indigo-800">
                    <div className="flex items-center gap-3 mb-2 px-2">
                        <div className="relative group cursor-pointer" onClick={handleImageClick}>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-xs text-white overflow-hidden border-2 border-indigo-700">
                                {uploadingImg ? <Loader2 className="animate-spin w-4 h-4" /> : profileImgUrl ? <img src={currentUserData.profileImage?.fileId ? `${axiosInstance.defaults.baseURL}/posts/image/${currentUserData.profileImage.fileId}` : profileImgUrl} alt="Profil" className="w-full h-full object-cover" /> : currentUserData.name?.charAt(0).toUpperCase()}
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

            <main className="flex-1 ml-64 p-8">

                {/* PRO Upgrade vs (Değişmedi) */}
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

                {/* Feed Tab (Değişmedi) */}
                {activeTab === 'feed' && (
                    // ... (Mevcut Feed Kodu)
                    <div className="max-w-3xl mx-auto space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                            <form onSubmit={handleCreatePost}>
                                <textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} placeholder="Aklınızdan neler geçiyor?" className="w-full p-4 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none" rows="3"></textarea>
                                {postImages.length > 0 && (
                                    <div className="flex gap-2 mt-3 overflow-x-auto py-2">
                                        {postImages.map((file, index) => (
                                            <div key={index} className="relative min-w-[80px] h-20 rounded-lg overflow-hidden border border-gray-200">
                                                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex justify-between items-center mt-4">
                                    <div className="flex items-center gap-2">
                                        <input type="file" multiple accept="image/*" className="hidden" ref={postFileInputRef} onChange={handlePostImageSelect} />
                                        <button type="button" onClick={() => postFileInputRef.current.click()} className="flex items-center gap-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition font-medium text-sm">
                                            <ImageIcon size={18} /> Resim Ekle ({postImages.length}/10)
                                        </button>
                                    </div>
                                    <button type="submit" disabled={isLoadingAction} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition flex items-center gap-2">
                                        {isLoadingAction ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Paylaş
                                    </button>
                                </div>
                            </form>
                        </div>
                        <div className="space-y-6">
                            {posts.length === 0 ? <div className="text-center text-gray-500 py-10">Henüz hiç gönderi yok. İlk paylaşan sen ol!</div> : (
                                posts.map(post => (
                                    <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                                        <div className="p-5 flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 overflow-hidden">
                                                    {post.author.profileImage?.fileId ? <img src={`${axiosInstance.defaults.baseURL}/posts/image/${post.author.profileImage.fileId}`} alt="author" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold">{post.author.name?.charAt(0)}</div>}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800">{post.author.name}</h4>
                                                    <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString('tr-TR')}</p>
                                                </div>
                                            </div>
                                            {(user.id === post.authorId || user.role === 'SUPERADMIN') && (
                                                <button onClick={() => handleDeletePost(post.id)} className="text-gray-400 hover:text-red-500 transition p-1"><Trash2 size={18} /></button>
                                            )}
                                        </div>
                                        {post.content && <div className="px-5 pb-4 text-gray-700 whitespace-pre-wrap">{post.content}</div>}
                                        {post.images?.length > 0 && (
                                            <div className={`grid gap-1 px-5 pb-5 ${post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
                                                {post.images.map(img => (
                                                    <div key={img.id} className="relative pt-[100%] rounded-lg overflow-hidden bg-gray-100">
                                                        <img src={`${axiosInstance.defaults.baseURL}/posts/image/${img.fileId}`} alt="post" className="absolute top-0 left-0 w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {/* Users Tab (Değişmedi) */}
                {activeTab === 'users' && (
                    // ... (Mevcut Users Kodu)
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
                                    {filteredUsers.map((u) => {
                                        const sentReq = u.receivedConnections?.find(c => c.senderId === user.id);
                                        const receivedReq = u.sentConnections?.find(c => c.receiverId === user.id);
                                        let connStatus = 'NONE';
                                        let connId = null;
                                        if (sentReq) { connStatus = sentReq.status === 'ACCEPTED' ? 'ACCEPTED' : 'PENDING_SENT'; connId = sentReq.id; }
                                        else if (receivedReq) { connStatus = receivedReq.status === 'ACCEPTED' ? 'ACCEPTED' : 'PENDING_RECEIVED'; connId = receivedReq.id; }
                                        const isBlockedByMe = u.isBlockedByMe;
                                        const pendingUpgrade = u.upgradeRequests?.find(req => req.status === 'PENDING');
                                        const canViewDetails = user.role === 'SUPERADMIN' || u.id === user.id || !u.isPrivate || connStatus === 'ACCEPTED';

                                        return (
                                            <tr key={u.id} className="hover:bg-gray-50/80 transition group">
                                                <td className="p-5 font-medium flex items-center gap-3">
                                                    <div className="relative">
                                                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                                            {canViewDetails && u.profileImage?.fileId ? <img src={`${axiosInstance.defaults.baseURL}/posts/image/${u.profileImage.fileId}`} alt="" className="w-full h-full object-cover filter hover:brightness-110" /> : <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-500 font-bold text-sm">{u.name?.charAt(0).toUpperCase()}</div>}
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
                                                                    <button onClick={() => acceptConnection(connId)} className="flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600 transition"><Check size={14} /> Kabul</button>
                                                                    <button onClick={() => removeConnection(connId)} className="flex items-center gap-1 text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200 transition"><X size={14} /> Red</button>
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
                                                            {isBlockedByMe ? (
                                                                <button onClick={() => unblockUser(u.id)} className="flex items-center gap-1 text-xs bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 px-3 py-1.5 rounded-lg transition font-medium border border-gray-200">Engeli Kaldır</button>
                                                            ) : (
                                                                <button onClick={() => blockUser(u.id)} className="flex items-center gap-1 text-xs bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg transition font-medium border border-red-200"><UserX size={14} /> Engelle</button>
                                                            )}
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
                )}

                {/* --- GÜNCELLENEN CVS TABI --- */}
                {activeTab === 'cvs' && (
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

                                            {/* Ana Satır (Tıklanabilir) */}
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
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    {/* Durum Badge'leri */}
                                                    {isProcessing ? (
                                                        <span className="flex items-center gap-1.5 text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full"><Loader2 size={12} className="animate-spin" /> YZ İşliyor...</span>
                                                    ) : isFailed ? (
                                                        <span className="flex items-center gap-1.5 text-xs font-bold bg-red-100 text-red-700 px-3 py-1 rounded-full"><XCircle size={12} /> Hata Oluştu</span>
                                                    ) : cv.isActive ? (
                                                        <span className="flex items-center gap-1 text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200"><CheckCircle size={12} /> Profilde Aktif</span>
                                                    ) : (
                                                        <span className="text-xs font-semibold text-gray-400">Pasif</span>
                                                    )}

                                                    {/* Aksiyon Butonları (Olayların click'in dışarı sızmasını engellemek için stopPropagation) */}
                                                    <div className="flex items-center gap-1 border-l pl-4 border-gray-200" onClick={e => e.stopPropagation()}>
                                                        {!isProcessing && !cv.isActive && (
                                                            <button onClick={() => handleCVActivate(cv.id)} title="Aktif Yap" className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition"><Star size={18} /></button>
                                                        )}
                                                        <button onClick={() => downloadCVStream(cv.fileId, cv.fileName)} title="İndir" className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"><Download size={18} /></button>
                                                        <button onClick={() => handleCVDelete(cv.id)} title="Sil" className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>

                                                        {/* Aç/Kapat Oku */}
                                                        {!isProcessing && (
                                                            <button className="p-1 text-gray-400" onClick={() => toggleCvDetails(cv.id)}>
                                                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Genişletilmiş Detay Alanı (Accordion) */}
                                            {isExpanded && !isProcessing && renderCvDetails(cv)}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Tüm Aktif Özgeçmişler Tabı (Değişmedi) */}
                {activeTab === 'all-cvs' && (
                    // ... (Mevcut All CVs Kodu)
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-6 max-w-5xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Briefcase /> Tüm Aktif Özgeçmişler</h2>
                            <p className="text-sm text-gray-500">Platformdaki diğer kullanıcıların paylaşıma açtığı özgeçmişler</p>
                        </div>
                        {allActiveCvs.length === 0 ? (
                            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">Sistemde şu an sizin görüntüleyebileceğiniz paylaşılan aktif bir CV bulunmuyor.</div>
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
                )}
            </main>
        </div>
    );
};

export default Dashboard;