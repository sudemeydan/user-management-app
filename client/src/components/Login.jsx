import React, { useState } from 'react';
import { Mail, Lock, User, MapPin, Calendar, ArrowRight, Loader2 } from 'lucide-react';

const Login = ({ onLogin, onRegister }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    username: '',
    age: '',
    address: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
        if (isRegisterMode) {
            onRegister(formData);
        } else {
            onLogin(formData.email, formData.password);
        }
        setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white shadow-2xl z-10">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              {isRegisterMode ? 'Hesap Oluştur' : 'Tekrar Hoşgeldin!'}
            </h1>
            <p className="mt-2 text-gray-500">
              {isRegisterMode ? 'Yönetim paneline katılmak için bilgilerini gir.' : 'Devam etmek için lütfen giriş yap.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {isRegisterMode && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input name="name" type="text" placeholder="Ad Soyad" onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white" required />
                    </div>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input name="username" type="text" placeholder="Kullanıcı Adı" onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white" required />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="relative col-span-1">
                        <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input name="age" type="number" placeholder="Yaş" onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white" />
                    </div>
                    <div className="relative col-span-2">
                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <input name="address" type="text" placeholder="Şehir/Adres" onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white" />
                    </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
                <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input name="email" type="email" placeholder="E-posta Adresi" onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white" required />
                </div>

                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input name="password" type="password" placeholder="Şifre" onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white" required />
                </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/30 transform transition hover:-translate-y-0.5 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                  <>
                    {isRegisterMode ? 'Kayıt Ol' : 'Giriş Yap'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              {isRegisterMode ? 'Zaten bir hesabın var mı?' : 'Henüz hesabın yok mu?'}
              <button
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="ml-2 font-medium text-indigo-600 hover:text-indigo-500 transition underline decoration-2 underline-offset-4"
              >
                {isRegisterMode ? 'Giriş Yap' : 'Hemen Kaydol'}
              </button>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block w-1/2 bg-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-800 opacity-90"></div>
        <img 
            src="https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80" 
            alt="Background" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
        />
        <div className="absolute inset-0 flex items-center justify-center p-12 text-white">
            <div className="max-w-md text-center">
                <h2 className="text-4xl font-bold mb-6">Profesyonel Yönetim</h2>
                <p className="text-lg text-indigo-100 leading-relaxed">
                    Kullanıcılarını, verilerini ve tüm süreçlerini tek bir yerden güvenle yönet. Modern altyapı, güçlü güvenlik.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;