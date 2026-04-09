"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const cvRoutes_1 = __importDefault(require("./routes/cvRoutes"));
const atsRoutes_1 = __importDefault(require("./routes/atsRoutes"));
const tailoringRoutes_1 = __importDefault(require("./routes/tailoringRoutes"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const connectionRoutes_1 = __importDefault(require("./routes/connectionRoutes"));
const errorHandler_1 = __importDefault(require("./middlewares/errorHandler"));
const rabbitmqService_1 = require("./services/rabbitmqService");
const app = (0, express_1.default)();
const PORT = 3001;
(0, rabbitmqService_1.connectRabbitMQ)();
app.get('/test-mq', async (req, res) => {
    try {
        // Python'a göndermek istediğimiz Hello World verisi
        const testData = {
            task: "TEST_TASK",
            message: "Hello World! Node.js'ten sevgiler.",
            time: new Date().toISOString()
        };
        // Kuyruğa mesajı fırlatıyoruz
        await (0, rabbitmqService_1.sendToQueue)('cv_parsing_queue', testData);
        // Kullanıcıya (tarayıcıya) anında cevap dönüyoruz
        res.status(200).json({
            success: true,
            info: "Mesaj başarıyla RabbitMQ'ya bırakıldı!"
        });
    }
    catch (error) {
        console.error("Test mesajı hatası:", error);
        res.status(500).json({ error: "Mesaj gönderilemedi." });
    }
});
app.use((0, cors_1.default)());
app.use((req, res, next) => {
    console.log(`[REQUEST] SUNUCUYA ISTEK GELDI: [${req.method}] ${req.url}`);
    next();
});
const { apiLimiter } = require('./middlewares/rateLimiter');
app.use(apiLimiter); // Genel API limiti
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
// 1. Yeni Domain Router'ları (Geriye dönük uyumluluk için hepsi /users altında birleştiriyoruz)
app.use('/users', userRoutes_1.default);
app.use('/users', authRoutes_1.default);
app.use('/users', cvRoutes_1.default);
app.use('/users', atsRoutes_1.default);
app.use('/users', tailoringRoutes_1.default);
app.use('/connections', connectionRoutes_1.default);
app.use('/posts', postRoutes_1.default);
const apolloServer_1 = require("./graphql/apolloServer");
const AppError = require('./utils/AppError').default || require('./utils/AppError');
app.use((req, res, next) => {
    next(new AppError(`Bu sunucuda ${req.originalUrl} adresi bulunamadı!`, 404));
});
app.use(errorHandler_1.default);
// Apollo Server'ı başlat ve ardından Express'i dinlemeye aç
(0, apolloServer_1.startApolloServer)(app).then(() => {
    app.listen(PORT, () => {
        console.log(`[READY] Sunucu ${PORT} calisiyor!`);
    });
});
