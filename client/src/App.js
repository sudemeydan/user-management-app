import React, { useState } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ResetPassword from './components/ResetPassword';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userData');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post('http://127.0.0.1:3001/users/login', { email, password });

      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);

      localStorage.setItem('userData', JSON.stringify(response.data.user));

      setUser(response.data.user);
    } catch (error) {
      alert("Giriş Başarısız: " + (error.response?.data?.message || error.message));
    }
  };

  const handleRegister = async (registerData) => {
    try {
      const formattedData = {
        ...registerData,
        age: registerData.age ? parseInt(registerData.age) : null
      };

      await axios.post('http://127.0.0.1:3001/users/register', formattedData);
      alert("Kayıt Başarılı! Şimdi giriş yapabilirsin.");
    } catch (error) {
      alert("Kayıt Hatası: " + (error.response?.data?.message || error.message));
    }
  };

  const handleForgotPassword = async (email) => {
    try {
      await axios.post('http://127.0.0.1:3001/users/forgot-password', { email });
      alert("Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu kontrol edin.");
      return true;
    } catch (error) {
      alert("Hata: " + (error.response?.data?.message || error.message));
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    localStorage.removeItem('userData');

    setUser(null);
  };

  const path = window.location.pathname;

  if (path.startsWith('/reset-password/')) {
    const token = path.split('/')[2];
    return <ResetPassword token={token} />;
  }

  return (
    <div>
      {!user ? (
        <Login onLogin={handleLogin} onRegister={handleRegister} onForgotPassword={handleForgotPassword} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;