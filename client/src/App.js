import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [formData, setFormData] = useState({
    name: '', username: '', email: '', age: '', address: '', password: ''
  });
  const [editingId, setEditingId] = useState(null);

  // --- API FONKSİYONLARI ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', loginData);
      alert(response.data.message);
      setIsLoggedIn(true);
      setCurrentUser(response.data.user);
      fetchUsers();
    } catch (error) {
      alert("Hata: " + (error.response?.data?.message || "Giriş başarısız"));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/users', formData);
      alert("Kayıt Başarılı! 🎉 Şimdi giriş yapabilirsin.");
      setFormData({ name: '', username: '', email: '', age: '', address: '', password: '' });
      setIsRegisterMode(false); 
    } catch (error) {
      alert("Kayıt Hatası: " + error.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/users');
      setUsers(response.data.data); 
    } catch (error) { console.error(error); }
  };

  const handleDashboardSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:3001/users/${editingId}`, formData);
        alert("Kullanıcı Güncellendi! ✅");
      } else {
        await axios.post('http://localhost:3001/users', formData);
        alert("Yeni Kullanıcı Eklendi! 🛡️");
      }
      setFormData({ name: '', username: '', email: '', age: '', address: '', password: '' });
      setEditingId(null);
      fetchUsers();
    } catch (error) { alert("İşlem hatası!"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Emin misin?")) {
      await axios.delete(`http://localhost:3001/users/${id}`);
      fetchUsers();
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setLoginData({ email: '', password: '' });
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({ ...user, password: '' });
  };

  // --- EKRAN 1: GİRİŞ / KAYIT ---
  if (!isLoggedIn) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-secondary">
        <div className="card p-4 shadow-lg" style={{ width: '450px' }}>
          <h3 className="text-center mb-4 text-primary">
            {isRegisterMode ? "📝 Kayıt Ol" : "🔐 Giriş Yap"}
          </h3>

          {isRegisterMode ? (
            <form onSubmit={handleRegister}>
              <div className="mb-2"><input className="form-control" placeholder="Ad Soyad" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
              <div className="mb-2"><input className="form-control" placeholder="Kullanıcı Adı" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required /></div>
              <div className="mb-2"><input type="email" className="form-control" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required /></div>
              <div className="mb-2"><input type="number" className="form-control" placeholder="Yaş" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} required /></div>
              <div className="mb-2"><input type="password" className="form-control" placeholder="Şifre Oluştur" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required /></div>
              <div className="mb-3"><input className="form-control" placeholder="Adres" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
              <button type="submit" className="btn btn-success w-100">Kayıt Ol</button>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <label>Email Adresi</label>
                <input type="email" className="form-control" value={loginData.email} onChange={e => setLoginData({...loginData, email: e.target.value})} required />
              </div>
              <div className="mb-3">
                <label>Şifre</label>
                <input type="password" className="form-control" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} required />
              </div>
              <button type="submit" className="btn btn-primary w-100">Giriş Yap</button>
            </form>
          )}
          <div className="text-center mt-3">
            {isRegisterMode ? (
              <p>Hesabın var mı? <span role="button" className="text-primary fw-bold" onClick={() => setIsRegisterMode(false)}>Giriş Yap</span></p>
            ) : (
              <p>Hesabın yok mu? <span role="button" className="text-primary fw-bold" onClick={() => setIsRegisterMode(true)}>Kayıt Ol</span></p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- EKRAN 2: PANEL ---
  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded shadow-sm">
        <h2>🚀 Yönetim Paneli</h2>
        <div>
          <span className="me-3 fw-bold text-success">👤 {currentUser?.name}</span>
          <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">Çıkış</button>
        </div>
      </div>
      <div className="card p-4 mb-4 shadow-sm">
        <h5>{editingId ? "✏️ Kullanıcı Düzenle" : "➕ Yönetici Olarak Ekle"}</h5>
        <form onSubmit={handleDashboardSubmit}>
          <div className="row g-2">
            <div className="col-md-6"><input className="form-control" placeholder="Ad Soyad" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></div>
            <div className="col-md-6"><input className="form-control" placeholder="Kullanıcı Adı" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required /></div>
            <div className="col-md-6"><input type="email" className="form-control" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required /></div>
            <div className="col-md-2"><input type="number" className="form-control" placeholder="Yaş" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} required /></div>
            <div className="col-md-4"><input type="password" className="form-control" placeholder="Şifre" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required /></div>
            <div className="col-12"><input className="form-control" placeholder="Adres" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} /></div>
          </div>
          <button type="submit" className={`btn w-100 mt-3 ${editingId ? 'btn-warning' : 'btn-dark'}`}>
            {editingId ? "Güncelle" : "Ekle"}
          </button>
          {editingId && <button className="btn btn-secondary w-100 mt-2" onClick={() => {setEditingId(null); setFormData({name: '', username: '', email: '', age: '', address: '', password: ''})}}>İptal</button>}
        </form>
      </div>
      <table className="table table-hover table-bordered shadow-sm bg-white">
        <thead className="table-dark">
          <tr><th>Ad Soyad</th><th>Email</th><th>Rol</th><th>İşlemler</th></tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td><span className="badge bg-info text-dark">User</span></td>
              <td>
                <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(user)}>✏️</button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user.id)}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;