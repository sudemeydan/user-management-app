const express = require('express');
const cors = require('cors');
// Yeni Garsonumuzu (Controller) çağırıyoruz
const userController = require('./controllers/userController');

const app = express();
const PORT = 3001;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- ROTALAR (ROUTES) ---
// Artık burada "if/else" veya SQL yok. Sadece yönlendirme var.

// 1. Tüm Kullanıcıları Listele
app.get('/users', userController.getUsers); // -> userController'daki getUsers fonksiyonuna git

// 2. Yeni Kullanıcı Ekle (Kayıt Ol)
app.post('/users', userController.createUser); // -> userController'daki createUser fonksiyonuna git

// 3. Giriş Yap (Login)
app.post('/login', userController.login); // -> userController'daki login fonksiyonuna git

// 4. Kullanıcı Güncelle
app.put('/users/:id', userController.updateUser);

// 5. Kullanıcı Sil
app.delete('/users/:id', userController.deleteUser);

// --- SUNUCUYU BAŞLAT ---
app.listen(PORT, () => {
  console.log(`🚀 Sunucu ${PORT} portunda, 5 Yıldızlı MVC Mimarisiyle çalışıyor!`);
});