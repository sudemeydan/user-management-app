import React, { useState, FormEvent } from 'react';
import axios from 'axios';
import { Lock, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ResetPasswordProps {
    token: string;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ token }) => {
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!password || !confirmPassword) {
            setError("Lütfen tüm alanları doldurun.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Girdiğiniz şifreler eşleşmiyor.");
            return;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
        if (!passwordRegex.test(password)) {
            setError("Şifre en az 8 karakter olmalı; bir büyük harf, bir küçük harf ve bir rakam içermelidir.");
            return;
        }

        setIsLoading(true);
        try {
            await axios.post(`http://127.0.0.1:3001/users/reset-password/${token}`, { newPassword: password });
            setSuccess("Şifreniz başarıyla güncellendi. Giriş ekranına yönlendiriliyorsunuz...");

            setTimeout(() => {
                window.location.href = '/';
            }, 2500);
        } catch (err: any) {
            setError(err.response?.data?.message || "Şifre sıfırlama işlemi sırasında bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50 font-sans">
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white shadow-2xl z-10 overflow-y-auto">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Yeni Şifre Belirle</h1>
                        <p className="mt-2 text-gray-500">Lütfen hesabın için yeni bir şifre gir.</p>
                    </div>
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-start gap-3 text-sm animate-fadeIn">
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-start gap-3 text-sm animate-fadeIn">
                            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                            <span>{success}</span>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input type="password" placeholder="Yeni Şifre" value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white" required />
                            </div>
                            <div className="relative animate-fadeIn">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <input type="password" placeholder="Yeni Şifre Tekrar" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white" required />
                            </div>
                        </div>
                        <button type="submit" disabled={isLoading || success !== ''}
                            className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/30 transform transition hover:-translate-y-0.5 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:hover:translate-y-0">
                            {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <>Şifreyi Güncelle<ArrowRight className="ml-2 h-5 w-5" /></>}
                        </button>
                    </form>
                    <div className="text-center">
                        <button onClick={() => window.location.href = '/'} className="mt-4 font-medium text-sm text-indigo-600 hover:text-indigo-500 transition underline decoration-2 underline-offset-4">
                            Giriş Ekranına Dön
                        </button>
                    </div>
                </div>
            </div>
            <div className="hidden lg:block w-1/2 bg-indigo-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-800 opacity-90"></div>
                <img src="https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" alt="Background" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay" />
                <div className="absolute inset-0 flex items-center justify-center p-12 text-white">
                    <div className="max-w-md text-center">
                        <h2 className="text-4xl font-bold mb-6">Güvenli Yönetim</h2>
                        <p className="text-lg text-indigo-100 leading-relaxed">
                            Şifrenizi güvenli bir şekilde güncelleyin ve hesabınıza erişimi yeniden sağlayın.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
