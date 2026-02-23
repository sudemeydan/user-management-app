import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    age: '',
    address: '',
    password: '' 
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3001/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.data);
    } catch (error) {
      console.error("Veri çekme hatası:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formattedData = {
        ...formData,
        age: formData.age ? parseInt(formData.age) : null
      };

      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingId) {
        await axios.put(`http://localhost:3001/users/${editingId}`, formattedData, config);
        alert("Kullanıcı Güncellendi! ✅");
      } else {
        await axios.post('http://localhost:3001/users', formattedData, config);
        alert("Yeni Kullanıcı Eklendi! 🛡️");
      }

      setFormData({ name: '', username: '', email: '', age: '', address: '', password: '' });
      setEditingId(null);
      fetchUsers(); 
    } catch (error) {
      alert("İşlem hatası: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bu kullanıcıyı silmek istediğine emin misin?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3001/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchUsers();
      } catch (error) {
        alert("Silme hatası: " + error.message);
      }
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      age: user.age || '',
      address: user.address || '',
      password: '' 
    });
    setEditingId(user.id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <nav className="bg-white shadow-sm p-4 mb-8">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">
            👋 Hoşgeldin, <span className="text-blue-600">{user.name}</span>
          </h1>
          <button 
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Çıkış Yap
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-md sticky top-6">
              <h2 className="text-lg font-bold mb-4 text-gray-700 border-b pb-2">
                {editingId ? '✏️ Kullanıcı Düzenle' : '➕ Yeni Kullanıcı Ekle'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500">İsim Soyisim</label>
                  <input name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Ad Soyad" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">Kullanıcı Adı</label>
                  <input name="username" value={formData.username} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="username" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">Email</label>
                  <input name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="email@test.com" />
                </div>
                <div className="flex gap-2">
                    <div className="w-1/3">
                        <label className="text-xs font-semibold text-gray-500">Yaş</label>
                        <input name="age" type="number" value={formData.age} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="25" />
                    </div>
                    <div className="w-2/3">
                        <label className="text-xs font-semibold text-gray-500">Şifre</label>
                        <input name="password" type="password" value={formData.password} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder={editingId ? "Değiştirmek için yaz" : "****"} />
                    </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500">Adres</label>
                  <textarea name="address" value={formData.address} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" rows="2" placeholder="Adres bilgisi..." />
                </div>

                <div className="flex gap-2 pt-2">
                    <button type="submit" className={`flex-1 text-white py-2 rounded-lg font-medium transition ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'}`}>
                        {editingId ? 'Güncelle' : 'Kaydet'}
                    </button>
                    {editingId && (
                        <button type="button" onClick={() => {setEditingId(null); setFormData({name:'', username:'', email:'', age:'', address:'', password:''})}} className="bg-gray-400 hover:bg-gray-500 text-white px-4 rounded-lg">
                            İptal
                        </button>
                    )}
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h2 className="font-bold text-gray-700">📋 Kullanıcı Listesi</h2>
                    <span className="text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full font-semibold">{users.length} Kayıt</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold">İsim</th>
                                <th className="p-4 font-semibold">Kullanıcı Adı</th>
                                <th className="p-4 font-semibold">Email</th>
                                <th className="p-4 font-semibold text-center">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-gray-100">
                            {users.map((u) => (
                                <tr key={u.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 font-medium text-gray-800">{u.name}</td>
                                    <td className="p-4 text-gray-600">@{u.username}</td>
                                    <td className="p-4 text-gray-500">{u.email}</td>
                                    <td className="p-4 flex justify-center gap-2">
                                        <button onClick={() => handleEdit(u)} className="text-blue-500 hover:text-blue-700 font-medium px-2 py-1 rounded hover:bg-blue-50">Düzenle</button>
                                        <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50">Sil</button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-400">Henüz kayıtlı kullanıcı yok.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;