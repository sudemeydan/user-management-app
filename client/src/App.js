import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [users, setUsers] = useState([]);
  
  // FORM İÇİN STATE (Hafıza)
  // Kullanıcının inputlara yazdığı verileri burada tutacağız
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    age: '',
    address: '',
    password: '' // Backend beklediği için ekledik
  });

  // GÜNCELLEME MODU MU?
  // Eğer burası null ise "Yeni Ekle", doluysa "Güncelle" modundayız
  const [editingId, setEditingId] = useState(null);

  // 1. Verileri Çekme (READ)
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/users');
      setUsers(response.data.data); 
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Formdaki Değişiklikleri Yakalama
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Form Gönderme (CREATE veya UPDATE)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Sayfanın yenilenmesini engelle

    try {
      if (editingId) {
        // --- GÜNCELLEME (PUT) ---
        await axios.put(`http://localhost:3001/users/${editingId}`, formData);
        alert("Kullanıcı başarıyla güncellendi! ✅");
      } else {
        // --- YENİ EKLEME (POST) ---
        await axios.post('http://localhost:3001/users', formData);
        alert("Yeni kullanıcı eklendi! 🎉");
      }

      // İşlem bitince formu temizle ve listeyi yenile
      setFormData({ name: '', username: '', email: '', age: '', address: '', password: '' });
      setEditingId(null);
      fetchUsers();

    } catch (error) {
      console.error("İşlem hatası:", error);
      alert("Bir hata oluştu!");
    }
  };

  // 4. Düzenle Butonuna Basınca (Verileri Forma Doldur)
  const handleEdit = (user) => {
    setEditingId(user.id); // Güncellenecek kişinin ID'sini hafızaya al
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      age: user.age,
      address: user.address,
      password: user.password
    });
  };

  // 5. Silme İşlemi (DELETE)
  const handleDelete = async (id) => {
    if (window.confirm("Bu kullanıcıyı silmek istediğine emin misin?")) {
      try {
        await axios.delete(`http://localhost:3001/users/${id}`);
        fetchUsers(); 
      } catch (error) {
        console.error("Silme hatası:", error);
      }
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">🚀 Kullanıcı Yönetim Paneli</h2>

      {/* --- FORM ALANI --- */}
      <div className="card p-4 mb-4 shadow-sm bg-light">
        <h4>{editingId ? "✏️ Kullanıcıyı Düzenle" : "➕ Yeni Kullanıcı Ekle"}</h4>
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-md-6">
              <input type="text" name="name" className="form-control" placeholder="Ad Soyad" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <input type="text" name="username" className="form-control" placeholder="Kullanıcı Adı" value={formData.username} onChange={handleChange} required />
            </div>
            <div className="col-md-6">
              <input type="email" name="email" className="form-control" placeholder="E-mail" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="col-md-2">
              <input type="number" name="age" className="form-control" placeholder="Yaş" value={formData.age} onChange={handleChange} required />
            </div>
            <div className="col-md-4">
              <input type="password" name="password" className="form-control" placeholder="Şifre" value={formData.password} onChange={handleChange} required />
            </div>
            <div className="col-12">
              <input type="text" name="address" className="form-control" placeholder="Adres" value={formData.address} onChange={handleChange} />
            </div>
          </div>
          <button type="submit" className={`btn w-100 mt-3 ${editingId ? 'btn-warning' : 'btn-success'}`}>
            {editingId ? "Güncellemeyi Kaydet" : "Kaydet"}
          </button>
          {editingId && <button className="btn btn-secondary w-100 mt-2" onClick={() => {setEditingId(null); setFormData({ name: '', username: '', email: '', age: '', address: '', password: '' })}}>İptal</button>}
        </form>
      </div>

      {/* --- TABLO ALANI --- */}
      <div className="card shadow">
        <div className="card-body">
          <table className="table table-hover table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Ad Soyad</th>
                <th>Kullanıcı Adı</th>
                <th>Email</th>
                <th>Yaş</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>@{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.age}</td>
                  <td>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(user)}>
                      ✏️ Düzenle
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user.id)}>
                      🗑️ Sil
                    </button>
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