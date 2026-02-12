import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  // EKRAN KONTROLÜ (Giriş yapıldı mı?)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // LOGIN STATE
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // YÖNETİM PANELİ STATE'LERİ
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '', username: '', email: '', age: '', address: '', password: ''
  });
  const [editingId, setEditingId] = useState(null);

  // --- GİRİŞ YAPMA FONKSİYONU ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', {
        email: loginEmail,
        password: loginPassword
      });
      alert(response.data.message);
      setIsLoggedIn(true); // Giriş başarılı, paneli aç!
      setCurrentUser(response.data.user);
      fetchUsers(); // Kullanıcıları çek
    } catch (error) {
      alert("Giriş Başarısız: " + (error.response?.data?.message || "Hata"));
    }
  };

  // --- ÇIKIŞ YAPMA ---
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setLoginEmail('');
    setLoginPassword('');
  };

  // --- MEVCUT FONKSİYONLAR (Aynen koruyoruz) ---
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/users');
      setUsers(response.data.data); 
    } catch (error) { console.error(error); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:3001/users/${editingId}`, formData);
        alert("Güncellendi! ✅");
      } else {
        await axios.post('http://localhost:3001/users', formData);
        alert("Kullanıcı Eklendi (Şifreli)! 🛡️");
      }
      setFormData({ name: '', username: '', email: '', age: '', address: '', password: '' });
      setEditingId(null);
      fetchUsers();
    } catch (error) { alert("İşlem hatası!"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Silmek istiyor musun?")) {
      await axios.delete(`http://localhost:3001/users/${id}`);
      fetchUsers();
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({ ...user, password: '' }); // Güvenlik için şifre alanını boş getir
  };

  // --- EKRAN 1: GİRİŞ FORMU ---
  if (!isLoggedIn) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-dark">
        <div className="card p-4 shadow-lg" style={{ width: '400px' }}>
          <h3 className="text-center mb-3">🔐 Güvenli Giriş</h3>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label>Email Adresi</label>
              <input 
                type="email" 
                className="form-control" 
                value={loginEmail} 
                onChange={(e) => setLoginEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="mb-3">
              <label>Şifre</label>
              <input 
                type="password" 
                className="form-control" 
                value={loginPassword} 
                onChange={(e) => setLoginPassword(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">Giriş Yap</button>
            <p className="text-muted text-center mt-3 small">
              Not: Daha önce kayıt olmadıysan giriş yapamazsın. <br/>
              Postman/ThunderClient ile bir kullanıcı oluşturup dene!
            </p>
          </form>
        </div>
      </div>
    );
  }

  // --- EKRAN 2: YÖNETİM PANELİ (Giriş Başarılıysa) ---
  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🛠 Yönetim Paneli</h2>
        <div>
          <span className="me-3 fw-bold text-primary">Merhaba, {currentUser?.name}</span>
          <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">Çıkış Yap</button>
        </div>
      </div>

      {/* Form Alanı */}
      <div className="card p-4 mb-4 shadow-sm bg-light">
        <h4>{editingId ? "✏️ Düzenle" : "➕ Yeni Kullanıcı (Otomatik Hashlenir)"}</h4>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6"><input type="text" name="name" className="form-control" placeholder="Ad Soyad" value={formData.name} onChange={handleChange} required /></div>
            <div className="col-md-6"><input type="text" name="username" className="form-control" placeholder="Kullanıcı Adı" value={formData.username} onChange={handleChange} required /></div>
            <div className="col-md-6"><input type="email" name="email" className="form-control" placeholder="E-mail" value={formData.email} onChange={handleChange} required /></div>
            <div className="col-md-2"><input type="number" name="age" className="form-control" placeholder="Yaş" value={formData.age} onChange={handleChange} required /></div>
            <div className="col-md-4"><input type="password" name="password" className="form-control" placeholder="Şifre" value={formData.password} onChange={handleChange} required /></div>
            <div className="col-12"><input type="text" name="address" className="form-control" placeholder="Adres" value={formData.address} onChange={handleChange} /></div>
          </div>
          <button type="submit" className={`btn w-100 mt-3 ${editingId ? 'btn-warning' : 'btn-success'}`}>{editingId ? "Güncelle" : "Kaydet"}</button>
          {editingId && <button className="btn btn-secondary w-100 mt-2" onClick={() => {setEditingId(null); setFormData({ ...formData, password: '' })}}>İptal</button>}
        </form>
      </div>

      {/* Tablo Alanı */}
      <div className="card shadow">
        <div className="card-body">
          <table className="table table-hover table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Ad Soyad</th>
                <th>Email</th>
                <th>Şifre (Hashli Hali)</th> {/* Hash'i görelim diye ekledim */}
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td className="text-muted small" style={{maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {user.password ? user.password.substring(0, 20) + "..." : "Şifresiz"}
                  </td>
                  <td>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(user)}>✏️</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;