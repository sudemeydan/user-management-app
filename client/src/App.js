import React, { useState } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Dashboard from './components/Dashboard'; 

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userData');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:3001/users/login', { email, password });

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
      
      await axios.post('http://localhost:3001/users/register', formattedData);
      alert("Kayıt Başarılı! Şimdi giriş yapabilirsin.");
    } catch (error) {
      alert("Kayıt Hatası: " + (error.response?.data?.message || error.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken'); 
    localStorage.removeItem('refreshToken');
    
    localStorage.removeItem('userData'); 
    
    setUser(null);
  };

  return (
    <div>
      {!user ? (
        <Login onLogin={handleLogin} onRegister={handleRegister} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;