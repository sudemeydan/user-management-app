import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Yönlendirmeler için
import axiosInstance from '../axiosInstance'; // Kendi axios yapın
import {
    Mail, Lock, MapPin, User, Loader2,
    ArrowRight, AlertCircle, CheckCircle2, ChevronDown
} from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        address: ''
    });

    const validCities = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Eskişehir", "Kocaeli"];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(''); // Kullanıcı yazmaya başlayınca hatayı temizle
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // 1. Frontend Validasyonları
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.address) {
            return setError("Lütfen tüm alanları doldurun.");
        }

        if (formData.password !== formData.confirmPassword) {
            return setError("Girdiğiniz şifreler eşleşmiyor.");
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            return setError("Şifre en az 8 karakter olmalı; bir büyük harf, bir küçük harf ve bir rakam içermelidir.");
        }

        // 2. Backend İstediği
        setIsLoading(true);
        try {
            // Senin API yapına göre endpoint'i '/register' veya '/users/register' olarak güncelleyebilirsin
            await axiosInstance.post('/register', formData);

            setSuccess("Kayıt başarıyla oluşturuldu! Giriş sayfasına yönlendiriliyorsunuz...");

            // 2 saniye sonra Login sayfasına yönlendir
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || "Kayıt işlemi sırasında bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

                {/* Üst Kısım - Gradient Başlık */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <User size={32} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-wide">Aramıza Katıl</h2>
                    <p className="text-indigo-100 text-sm mt-2">Hesabını oluştur ve ağı keşfetmeye başla.</p>
                </div>

                <div className="p-8">
                    {/* Hata Mesajı */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-start gap-3 text-sm">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Başarı Mesajı */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-start gap-3 text-sm">
                            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* İsim Soyisim */}
                        <div className="relative">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Ad Soyad</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                                />
                            </div>
                        </div>

                        {/* E-posta */}
                        <div className="relative">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">E-posta Adresi</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="ornek@mail.com"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                                />
                            </div>
                        </div>

                        {/* Şehir Seçimi */}
                        <div className="relative">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Yaşadığınız Şehir</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <select
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition appearance-none cursor-pointer ${!formData.address ? 'text-gray-400' : 'text-gray-900'}`}
                                >
                                    <option value="" disabled>Şehir Seçiniz</option>
                                    {validCities.map((city, idx) => (
                                        <option key={idx} value={city} className="text-gray-900">{city}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                            </div>
                        </div>

                        {/* Şifre */}
                        <div className="relative">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Şifre</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                                />
                            </div>
                        </div>

                        {/* Şifre Tekrar */}
                        <div className="relative">
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Şifre Tekrar</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                                />
                            </div>
                        </div>

                        {/* Kayıt Butonu */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Hesap Oluştur <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Login'e Yönlendirme */}
                    <div className="mt-8 text-center text-sm text-gray-500">
                        Zaten bir hesabın var mı? {' '}
                        <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline transition">
                            Giriş Yap
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;