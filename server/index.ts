import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import cvRoutes from './routes/cvRoutes';
import atsRoutes from './routes/atsRoutes';
import tailoringRoutes from './routes/tailoringRoutes';
import postRoutes from './routes/postRoutes';
import connectionRoutes from './routes/connectionRoutes';
import errorHandler from './middlewares/errorHandler';
import { sendToQueue, connectRabbitMQ } from './services/rabbitmqService';

const app = express();
const PORT = 3001;

connectRabbitMQ();

app.get('/test-mq', async (req: Request, res: Response) => {
  try {
    // Python'a göndermek istediğimiz Hello World verisi
    const testData = {
      task: "TEST_TASK",
      message: "Hello World! Node.js'ten sevgiler.",
      time: new Date().toISOString()
    };

    // Kuyruğa mesajı fırlatıyoruz
    await sendToQueue('cv_parsing_queue', testData as any);

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
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[REQUEST] SUNUCUYA ISTEK GELDI: [${req.method}] ${req.url}`);
  next();
});

const { apiLimiter } = require('./middlewares/rateLimiter');
app.use(apiLimiter); // Genel API limiti

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


import { startApolloServer } from './graphql/apolloServer';

const AppError = require('./utils/AppError').default || require('./utils/AppError');

// Apollo Server'ı başlat, GraphQL endpoint'ini kaydet
startApolloServer(app).then(() => {
  
  // DİKKAT: 404 Handler tüm geçerli rotalardan (GraphQL dahil) SONRA gelmelidir.
  app.use((req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Bu sunucuda ${req.originalUrl} adresi bulunamadı!`, 404));
  });

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`[READY] Sunucu ${PORT} calisiyor!`);
  });
});