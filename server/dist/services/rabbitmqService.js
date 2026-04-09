"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToQueue = exports.connectRabbitMQ = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const geminiService_1 = require("./geminiService");
function calculateJaccardSimilarity(str1, str2) {
    if (!str1 || !str2)
        return 0;
    const set1 = new Set(str1.toLowerCase().split(/\s+/));
    const set2 = new Set(str2.toLowerCase().split(/\s+/));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size === 0 ? 0 : intersection.size / union.size;
}
let connection = null;
let channel = null;
const connectRabbitMQ = async () => {
    try {
        const amqpUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
        connection = await amqplib_1.default.connect(amqpUrl);
        channel = await connection.createChannel();
        await channel.assertQueue('cv_parsing_queue', { durable: true });
        await channel.assertQueue('cv_result_queue', { durable: true });
        console.log('[OK] RabbitMQ Baglantisi Basarili');
        startResultConsumer();
    }
    catch (error) {
        console.error('u2757 RabbitMQ Bau011flantu0131 Hatasu0131:', error.message);
        setTimeout(exports.connectRabbitMQ, 5000);
    }
};
exports.connectRabbitMQ = connectRabbitMQ;
const sendToQueue = async (queueName, message) => {
    if (!channel) {
        console.error("RabbitMQ kanalı hazır değil.");
        return;
    }
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        persistent: true,
    });
};
exports.sendToQueue = sendToQueue;
const startResultConsumer = async () => {
    if (!channel)
        return;
    console.log("[INFO] cv_result_queue dinleniyor...");
    channel.consume('cv_result_queue', async (msg) => {
        if (msg !== null) {
            try {
                const resultData = JSON.parse(msg.content.toString());
                const { cvId, status, rawText, error } = resultData;
                console.log(`[x] Python'dan cevap geldi. CV ID: ${cvId}, Durum: ${status}`);
                if (status === 'FAILED') {
                    await prisma_1.default.cV.update({
                        where: { id: parseInt(cvId) },
                        data: { status: 'FAILED' }
                    });
                    console.error(`[ERROR] CV Ayristirma hatasi (Python): ${error}`);
                }
                else if (status === 'COMPLETED' && rawText) {
                    await prisma_1.default.cV.update({
                        where: { id: parseInt(cvId) },
                        data: {
                            status: 'PROCESSING',
                            rawText: rawText
                        }
                    });
                    console.log(`[INFO] Spam kontrolu yapiliyor (CV ID: ${cvId})...`);
                    const currentCV = await prisma_1.default.cV.findUnique({ where: { id: parseInt(cvId) }, select: { userId: true } });
                    if (currentCV) {
                        const textLength = rawText.length;
                        const minLength = Math.floor(textLength * 0.90);
                        const maxLength = Math.ceil(textLength * 1.10);
                        const otherUsersCVs = await prisma_1.default.$queryRaw `
                            SELECT id, "userId", "rawText"
                            FROM "CV"
                            WHERE "userId" != ${currentCV.userId}
                              AND "rawText" IS NOT NULL
                              AND LENGTH("rawText") BETWEEN ${minLength} AND ${maxLength}
                        `;
                        let isSpam = false;
                        for (const existingCV of otherUsersCVs) {
                            const similarity = calculateJaccardSimilarity(rawText, existingCV.rawText);
                            if (similarity > 0.85) {
                                console.warn(`[!] SPAM tespit edildi!`);
                                isSpam = true;
                                break;
                            }
                        }
                        if (isSpam) {
                            await prisma_1.default.cV.update({
                                where: { id: parseInt(cvId) },
                                data: {
                                    status: 'FAILED',
                                    atsFormatFeedback: 'Guvenlik Politikasi: Mukerrer CV.'
                                }
                            });
                            channel.ack(msg);
                            return;
                        }
                        console.log(`[INFO] Gemini'ye gonderiliyor (CV ID: ${cvId})...`);
                        const parsedData = await (0, geminiService_1.parseCVText)(rawText);
                        const atsAnalysis = await (0, geminiService_1.analyzeATSCompatibility)(rawText);
                        await prisma_1.default.cV.update({
                            where: { id: parseInt(cvId) },
                            data: {
                                summary: parsedData.summary,
                                atsFormatScore: atsAnalysis.score,
                                atsFormatFeedback: atsAnalysis.feedback,
                                status: 'COMPLETED'
                            }
                        });
                        if (parsedData.entries && parsedData.entries.length > 0) {
                            const entriesToCreate = parsedData.entries.map((entry) => ({
                                cvId: parseInt(cvId),
                                category: entry.category,
                                title: entry.title || "Belirtilmemis",
                                subtitle: entry.subtitle,
                                startDate: entry.startDate,
                                endDate: entry.endDate,
                                description: entry.description,
                                metadata: entry.metadata ? entry.metadata : null
                            }));
                            await prisma_1.default.cVEntry.createMany({
                                data: entriesToCreate
                            });
                        }
                        console.log(`[OK] CV (ID: ${cvId}) kaydedildi!`);
                    }
                }
                channel.ack(msg);
            }
            catch (error) {
                console.error('u274c Consumer iu015fleme hatasu0131:', error);
                channel.nack(msg, false, true);
            }
        }
    });
};
