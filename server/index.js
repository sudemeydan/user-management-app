const express = require('express');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const cvRoutes = require('./routes/cvRoutes');
const atsRoutes = require('./routes/atsRoutes');
const tailoringRoutes = require('./routes/tailoringRoutes');
const postRoutes = require('./routes/postRoutes');
const connectionRoutes = require('./routes/connectionRoutes');
const app = express();
const PORT = 3001;
const errorHandler = require('./middlewares/errorHandler');
const { sendToQueue } = require('./services/rabbitmqService');

const { connectRabbitMQ } = require('./services/rabbitmqService');


connectRabbitMQ();

app.get('/test-mq', async (req, res) => {
  try {
    // Python'a göndermek istediğimiz Hello World verisi
    const testData = {
      task: "TEST_TASK",
      message: "Hello World! Node.js'ten sevgiler.",
      time: new Date().toISOString()
    };

    // Kuyruğa mesajı fırlatıyoruz
    await sendToQueue('cv_parsing_queue', testData);

    // Kullanıcıya (tarayıcıya) anında cevap dönüyoruz
    res.status(200).json({
      success: true,
      info: "Mesaj başarıyla RabbitMQ'ya bırakıldı!"
    });
  } catch (error) {
    console.error("Test mesajı hatası:", error);
    res.status(500).json({ error: "Mesaj gönderilemedi." });
  }
});


app.use(cors());
app.use((req, res, next) => {
  console.log(`📢 SUNUCUYA İSTEK GELDİ: [${req.method}] ${req.url}`);
  next();
});
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// 1. Yeni Domain Router'ları (Geriye dönük uyumluluk için hepsi /users altında birleştiriyoruz)
app.use('/users', userRoutes);
app.use('/users', authRoutes);
app.use('/users', cvRoutes); 
app.use('/users', atsRoutes);
app.use('/users', tailoringRoutes);

app.use('/connections', connectionRoutes);
app.use('/posts', postRoutes);


const AppError = require('./utils/AppError');
app.use((req, res, next) => {
  next(new AppError(`Bu sunucuda ${req.originalUrl} adresi bulunamadı!`, 404));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Sunucu ${PORT} çalışıyor!`);
});