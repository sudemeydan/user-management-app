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
        onRegister(formData);
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
    <div className="min-h-screen flex font-sans" style={{background: 'var(--bg)'}}>
      {/* LEFT: Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 overflow-y-auto" style={{background: 'var(--surface)', borderRight: '1px solid var(--border)'}}>
        <div className="w-full max-w-md space-y-7">
          {/* Logo */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4 shadow-lg" style={{background: 'linear-gradient(135deg, #6c63ff, #9c8fff)'}}>
              <span className="text-white font-bold text-sm" style={{fontFamily: 'Syne, sans-serif', letterSpacing: '1px'}}>CV</span>
            </div>
            <h1 className="text-3xl font-extrabold mb-1" style={{fontFamily: 'Syne, sans-serif', color: 'var(--text)', letterSpacing: '-0.5px'}}>
              {isForgotPasswordMode ? 'Şifremi Unuttum' : (isRegisterMode ? 'Hesap Oluştur' : 'Tekrar Hoşgeldin!')}
            </h1>
            <p className="text-sm" style={{color: 'var(--muted)'}}>
              {isForgotPasswordMode ? 'Şifre sıfırlama bağlantısı için e-postanı gir.' : (isRegisterMode ? 'Bilgilerini gir ve aramıza katıl.' : 'Devam etmek için giriş yap.')}
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl flex items-start gap-3 text-sm animate-fadeIn" style={{background: 'rgba(255,101,132,0.08)', border: '1px solid rgba(255,101,132,0.25)', color: '#ff6584'}}>
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isForgotPasswordMode && isRegisterMode && (
              <div className="space-y-3 animate-fadeIn">
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-4 w-4" style={{color: 'var(--muted)'}} />
                    <input name="name" type="text" placeholder="Ad Soyad" value={formData.name} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition text-sm"
                      style={{background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)'}} required />
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-4 w-4" style={{color: 'var(--muted)'}} />
                    <input name="username" type="text" placeholder="Kullanıcı Adı" value={formData.username} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition text-sm"
                      style={{background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)'}} required />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="relative col-span-1">
                    <Calendar className="absolute left-3 top-3.5 h-4 w-4" style={{color: 'var(--muted)'}} />
                    <input name="age" type="number" placeholder="Yaş" value={formData.age} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition text-sm"
                      style={{background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)'}} />
                  </div>
                  <div className="relative col-span-2">
                    <MapPin className="absolute left-3 top-3.5 h-4 w-4" style={{color: 'var(--muted)'}} />
                    <select name="address" value={formData.address} onChange={handleChange} required
                      className="w-full pl-10 pr-10 py-3 rounded-xl outline-none transition text-sm appearance-none cursor-pointer"
                      style={{background: 'var(--surface2)', border: '1px solid var(--border)', color: formData.address ? 'var(--text)' : 'var(--muted)'}}>
                      <option value="" disabled>Şehir Seçiniz</option>
                      {validCities.map((city, index) => (
                        <option key={index} value={city} style={{background: 'var(--surface2)', color: 'var(--text)'}}>{city}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 pointer-events-none" style={{color: 'var(--muted)'}} />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4" style={{color: 'var(--muted)'}} />
                <input name="email" type="email" placeholder="E-posta Adresi" value={formData.email} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition text-sm"
                  style={{background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)'}} required />
              </div>

              {!isForgotPasswordMode && (
                <div className="relative animate-fadeIn">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4" style={{color: 'var(--muted)'}} />
                  <input name="password" type="password" placeholder="Şifre" value={formData.password} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition text-sm"
                    style={{background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)'}} required={!isForgotPasswordMode} />
                </div>
              )}

              {!isForgotPasswordMode && !isRegisterMode && (
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer" style={{color: 'var(--muted)'}}>
                    <input id="remember-me" name="remember-me" type="checkbox" className="rounded" />
                    Beni Hatırla
                  </label>
                  <button type="button" onClick={handleForgotPassword} className="font-medium transition" style={{color: 'var(--accent)'}}>
                    Şifremi unuttum
                  </button>
                </div>
              )}

              {!isForgotPasswordMode && isRegisterMode && (
                <div className="relative animate-fadeIn">
                  <Lock className="absolute left-3 top-3.5 h-4 w-4" style={{color: 'var(--muted)'}} />
                  <input name="confirmPassword" type="password" placeholder="Şifre Tekrar" value={formData.confirmPassword} onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl outline-none transition text-sm"
                    style={{background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)'}} required />
                </div>
              )}
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full flex items-center justify-center font-bold py-3 px-4 rounded-xl transition-all"
              style={{
                background: isLoading ? 'rgba(108,99,255,0.5)' : 'linear-gradient(135deg, #6c63ff, #9c8fff)',
                color: 'white', fontFamily: 'Syne, sans-serif', fontSize: '15px',
                boxShadow: isLoading ? 'none' : '0 8px 30px rgba(108,99,255,0.35)',
                transform: isLoading ? 'none' : undefined
              }}>
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
                <>
                  {isForgotPasswordMode ? 'Bağlantı Gönder' : (isRegisterMode ? 'Kayıt Ol' : 'Giriş Yap')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          {!isForgotPasswordMode ? (
            <div className="text-center animate-fadeIn text-sm" style={{color: 'var(--muted)'}}>
              {isRegisterMode ? 'Zaten bir hesabın var mı?' : 'Henüz hesabın yok mu?'}
              <button onClick={() => { setIsRegisterMode(!isRegisterMode); setError(''); }}
                className="ml-2 font-semibold transition" style={{color: 'var(--accent)'}}>
                {isRegisterMode ? 'Giriş Yap' : 'Hemen Kaydol'}
              </button>
            </div>
          ) : (
            <div className="text-center animate-fadeIn">
              <button onClick={() => { setIsForgotPasswordMode(false); setError(''); }}
                className="text-sm font-semibold transition" style={{color: 'var(--accent)'}}>
                Giriş Ekranına Dön
              </button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Brand Panel */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center p-12"
        style={{background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'}}>
        {/* Mesh overlay */}
        <div className="absolute inset-0" style={{background: 'radial-gradient(ellipse 70% 60% at 30% 30%, rgba(108,99,255,0.25) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 70% 70%, rgba(255,101,132,0.15) 0%, transparent 60%)'}}></div>
        {/* Floating orb */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full opacity-20" style={{background: 'radial-gradient(circle, #6c63ff, transparent)', filter: 'blur(40px)'}}></div>
        <div className="relative z-10 max-w-md text-center text-white">
          <div className="text-6xl mb-6">🚀</div>
          <h2 className="text-4xl font-bold mb-4" style={{fontFamily: 'Syne, sans-serif', letterSpacing: '-1px'}}>Profesyonel Yönetim</h2>
          <p className="text-lg leading-relaxed" style={{color: 'rgba(255,255,255,0.65)'}}>
            CV'lerini analiz et, iş ilanlarına göre uyarla ve kariyerini bir üst seviyeye taşı.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            {['ATS Analizi', 'AI Önerileri', 'PDF Export'].map(tag => (
              <span key={tag} className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)'}}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
