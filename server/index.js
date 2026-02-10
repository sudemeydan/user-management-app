const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3001;

// Middleware 
app.use(cors());
app.use(express.json()); // JSON verilerini okuyabilmek için

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Veritabanına bağlanırken hata oluştu:', err.message);
  } else {
    console.log('SQLite veritabanına bağlandı.');
    
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      username TEXT,
      age INTEGER,
      password TEXT,
      email TEXT UNIQUE,
      address TEXT,
      isactive INTEGER DEFAULT 1
    )`, (err) => {
      if (err) {
        console.error('Tablo oluşturulurken hata:', err.message);
      } else {
        console.log('Users tablosu hazır.');
      }
    });
  }
});

// Basit bir test rotası
app.get('/', (req, res) => {
  res.send('Sunucu çalışıyor! Merhaba');
});

//POST
app.post('/users', (req, res) => {
    console.log("Gelen Veri (Body):", req.body);
  const { name, username, age, password, email, address } = req.body;//Objeyi parçalama (Destructuring)

  const sql = `INSERT INTO users (name, username, age, password, email, address) VALUES (?, ?, ?, ?, ?, ?)`;
  const params = [name, username, age, password, email, address];

  db.run(sql, params, function(err) {
    if (err) {

      return res.status(400).json({ error: err.message });
    }
    res.status(201).json({
      message: "Kullanıcı başarıyla oluşturuldu",
      id: this.lastID,
      data: req.body
    });
  });
});

// - GET Metodu ---
app.get('/users', (req, res) => {
  // SQL Sorgusu: Tüm kullanıcıları seç
  const sql = "SELECT * FROM users";

  // db.all: Birden fazla satır döneceği için 'all' kullanıyoruz
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    // Başarılı olursa satırları (rows) JSON olarak dön
    res.status(200).json({
      message: "Kullanıcı listesi getirildi",
      data: rows
    });
  });
});

// --- 3. EMAIL İLE KULLANICI GETİRME - GET Metodu ---
app.get('/users/:email', (req, res) => {
  // URL'deki :email kısmını alıyoruz
  const email = req.params.email;

  const sql = "SELECT * FROM users WHERE email = ?";
  
  // db.get: Tek bir satır beklediğimiz için 'get' kullanıyoruz
  db.get(sql, [email], (err, row) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    // Eğer kullanıcı bulunamazsa row 'undefined' gelir
    if (!row) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }
    res.status(200).json({
      message: "Kullanıcı bulundu",
      data: row
    });
  });
});


// --- 4. KULLANICI GÜNCELLEME (UPDATE) - PUT Metodu ---
app.put('/users/:id', (req, res) => {
  const id = req.params.id;
  const { name, username, age, password, email, address } = req.body;

  // SQL Sorgusu: ID'si eşleşen satırı güncelle
  const sql = `UPDATE users SET name = ?, username = ?, age = ?, password = ?, email = ?, address = ? WHERE id = ?`;
  const params = [name, username, age, password, email, address, id];

  db.run(sql, params, function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    // changes: kaç satırın etkilendiğini gösterir
    if (this.changes === 0) {
      return res.status(404).json({ message: "Güncellenecek kullanıcı bulunamadı" });
    }
    res.json({
      message: "Kullanıcı başarıyla güncellendi",
      data: req.body,
      changes: this.changes
    });
  });
});

// --- 5. KULLANICI SİLME (DELETE) - DELETE Metodu ---
app.delete('/users/:id', (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM users WHERE id = ?";

  db.run(sql, id, function(err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Silinecek kullanıcı bulunamadı" });
    }
    res.json({
      message: "Kullanıcı silindi",
      changes: this.changes
    });
  });
});





// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});
