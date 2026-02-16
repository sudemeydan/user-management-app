import React, { useState } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Dashboard from './components/Dashboard'; 

function App() {
  const [user, setUser] = useState(null);


  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:3001/login', { email, password });
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
      
      await axios.post('http://localhost:3001/users', formattedData);
      alert("Kayıt Başarılı! Şimdi giriş yapabilirsin.");
    } catch (error) {
      alert("Kayıt Hatası: " + (error.response?.data?.message || error.message));
    }
  };


  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div>
      {!user ? (
        // Kullanıcı yoksa Login Ekranı
        <Login onLogin={handleLogin} onRegister={handleRegister} />
      ) : (
        // Kullanıcı varsa Dashboard Ekranı
        // Kullanıcı bilgisini ve çıkış fonksiyonunu Dashboard'a gönderiyoruz
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;