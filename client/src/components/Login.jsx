import React, { useState } from 'react';
import { Mail, Lock, User, MapPin, Calendar, ArrowRight, Loader2, AlertCircle, ChevronDown } from 'lucide-react';

const Login = ({ onLogin, onRegister, onForgotPassword }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    username: '',
    age: '',
    address: ''
  });

  const validCities = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Eskişehir", "Kocaeli"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (isForgotPasswordMode) {
      if (!formData.email) {
        setError("Lütfen e-posta adresinizi giriniz.");
        setIsLoading(false);
        return;
      }
      setTimeout(async () => {
        const success = await onForgotPassword(formData.email);
        if (success) setIsForgotPasswordMode(false);
        setIsLoading(false);
      }, 800);
      return;
    }

    if (isRegisterMode) {
      if (formData.password !== formData.confirmPassword) {
        setError("Girdiğiniz şifreler eşleşmiyor.");
        setIsLoading(false);
        return;
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        setError("Şifre en az 8 karakter olmalı; bir büyük harf, bir küçük harf ve bir rakam içermelidir.");
        setIsLoading(false);
        return;
      }

      if (!formData.address) {
        setError("Lütfen yaşadığınız şehri seçiniz.");
        setIsLoading(false);
        return;
      }
    }

    setTimeout(() => {
      if (isRegisterMode) {
        const { confirmPassword, ...dataToSend } = formData;
        onRegister(dataToSend);
      } else {
        onLogin(formData.email, formData.password);
      }
      setIsLoading(false);
    }, 800);
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setIsForgotPasswordMode(true);
    setError('');
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white shadow-2xl z-10 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              {isForgotPasswordMode ? 'Şifremi Unuttum' : (isRegisterMode ? 'Hesap Oluştur' : 'Tekrar Hoşgeldin!')}
            </h1>
            <p className="mt-2 text-gray-500">
              {isForgotPasswordMode ? 'Şifre sıfırlama bağlantısı göndermek için e-posta adresini gir.' : (isRegisterMode ? 'Yönetim paneline katılmak için bilgilerini gir.' : 'Devam etmek için lütfen giriş yap.')}
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-start gap-3 text-sm animate-fadeIn">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {!isForgotPasswordMode && isRegisterMode && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input name="name" type="text" placeholder="Ad Soyad" value={formData.name} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white" required />
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input name="username" type="text" placeholder="Kullanıcı Adı" value={formData.username} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white" required />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="relative col-span-1">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input name="age" type="number" placeholder="Yaş" value={formData.age} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white" />
                  </div>

                  {/* ŞEHİR SEÇİMİ BURADA (Kayıt Modunda Görünür) */}
                  <div className="relative col-span-2">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <select
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white appearance-none cursor-pointer ${!formData.address ? 'text-gray-400' : 'text-gray-900'}`}
                      required
                    >
                      <option value="" disabled>Şehir Seçiniz</option>
                      {validCities.map((city, index) => (
                        <option key={index} value={city} className="text-gray-900">{city}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input name="email" type="email" placeholder="E-posta Adresi" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white" required />
              </div>

              {!isForgotPasswordMode && (
                <div className="relative animate-fadeIn">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input name="password" type="password" placeholder="Şifre" value={formData.password} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white" required={!isForgotPasswordMode} />
                </div>
              )}

              {/* ŞİFREMİ UNUTTUM LİNKİ BURADA (Sadece Giriş Modunda Görünür) */}
              {!isForgotPasswordMode && !isRegisterMode && (
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center">
                    <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer" />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                      Beni Hatırla
                    </label>
                  </div>
                  <div className="text-sm">
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline transition"
                    >
                      Şifremi unuttum
                    </button>
                  </div>
                </div>
              )}

              {!isForgotPasswordMode && isRegisterMode && (
                <div className="relative animate-fadeIn">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input name="confirmPassword" type="password" placeholder="Şifre Tekrar" value={formData.confirmPassword} onChange={handleChange} className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-gray-50 hover:bg-white" required />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/30 transform transition hover:-translate-y-0.5 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                <>
                  {isForgotPasswordMode ? 'Bağlantı Gönder' : (isRegisterMode ? 'Kayıt Ol' : 'Giriş Yap')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {!isForgotPasswordMode ? (
            <div className="text-center animate-fadeIn">
              <p className="text-sm text-gray-600">
                {isRegisterMode ? 'Zaten bir hesabın var mı?' : 'Henüz hesabın yok mu?'}
                <button
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setError('');
                  }}
                  className="ml-2 font-medium text-indigo-600 hover:text-indigo-500 transition underline decoration-2 underline-offset-4"
                >
                  {isRegisterMode ? 'Giriş Yap' : 'Hemen Kaydol'}
                </button>
              </p>
            </div>
          ) : (
            <div className="text-center animate-fadeIn">
              <button
                onClick={() => {
                  setIsForgotPasswordMode(false);
                  setError('');
                }}
                className="mt-4 font-medium text-sm text-indigo-600 hover:text-indigo-500 transition underline decoration-2 underline-offset-4"
              >
                Giriş Ekranına Dön
              </button>
            </div>
          )}
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