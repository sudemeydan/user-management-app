import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { setSocketIO } from './services/socketService';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import cvRoutes from './routes/cvRoutes';
import atsRoutes from './routes/atsRoutes';
import tailoringRoutes from './routes/tailoringRoutes';
import postRoutes from './routes/postRoutes';
import connectionRoutes from './routes/connectionRoutes';
import employerRoutes from './routes/employerRoutes';
import logRoutes from './routes/logRoutes';
import errorHandler from './middlewares/errorHandler';
import { sendToQueue, connectRabbitMQ } from './services/rabbitmqService';

const app = express();
const PORT = 3001;

const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

setSocketIO(io);


io.on('connection', (socket: import('socket.io').Socket) => {
  console.log(`[SOCKET] Yeni bağlantı: ${socket.id}`);

  socket.on('join', (userId: string | number) => {
    socket.join(`user_${userId}`);
    console.log(`[SOCKET] Kullanıcı ${userId} room'a katıldı.`);
  });

  socket.on('disconnect', () => {
    console.log(`[SOCKET] Bağlantı koptu: ${socket.id}`);
  });
});

connectRabbitMQ();

app.get('/test-mq', async (req: Request, res: Response) => {
  try {
    const testData = {
      task: "TEST_TASK",
      message: "Hello World! Node.js'ten sevgiler.",
      time: new Date().toISOString()
    };

    await sendToQueue('cv_parsing_queue', testData as any);

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
app.use(apiLimiter);

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/users', userRoutes);
app.use('/users', authRoutes);
app.use('/users', cvRoutes);
app.use('/users', atsRoutes);
app.use('/users', tailoringRoutes);

app.use('/connections', connectionRoutes);
app.use('/posts', postRoutes);
app.use('/employer', employerRoutes);
app.use('/logs', logRoutes);


import { startApolloServer } from './graphql/apolloServer';

const AppError = require('./utils/AppError').default || require('./utils/AppError');

startApolloServer(app).then(() => {

  app.use((req: Request, res: Response, next: NextFunction) => {
    next(new AppError(`Bu sunucuda ${req.originalUrl} adresi bulunamadı!`, 404));
  });

  app.use(errorHandler);

  httpServer.listen(PORT, () => {
    console.log(`[READY] Sunucu ${PORT} calisiyor! (WebSocket aktif)`);
  });
});