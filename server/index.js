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

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});
