import amqp, { Connection, Channel } from 'amqplib';
import prisma from '../utils/prisma';
import { parseCVText, analyzeATSCompatibility } from './geminiService';

export interface RabbitMQMessagePayload {
  cvId: number | string;
  fileData: string;
}

export interface RabbitMQResultPayload {
  cvId: number | string;
  status: 'COMPLETED' | 'FAILED';
  rawText?: string;
  error?: string;
}

function calculateJaccardSimilarity(str1?: string | null, str2?: string | null): number {
    if (!str1 || !str2) return 0;
    const set1 = new Set(str1.toLowerCase().split(/\s+/));
    const set2 = new Set(str2.toLowerCase().split(/\s+/));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size === 0 ? 0 : intersection.size / union.size;
}

let connection: Connection | null = null;
let channel: Channel | null = null;

export const connectRabbitMQ = async (): Promise<void> => {
    try {
        const amqpUrl = process.env.RABBITMQ_URL || 'amqp://localhost';

        connection = await amqp.connect(amqpUrl);
        channel = await connection.createChannel();

        await channel.assertQueue('cv_parsing_queue', { durable: true });
        await channel.assertQueue('cv_result_queue', { durable: true });

        console.log('✅ RabbitMQ Bağlantısı Başarılı');

        startResultConsumer();

    } catch (error: any) {
        console.error('❌ RabbitMQ Bağlantı Hatası:', error.message);
        setTimeout(connectRabbitMQ, 5000);
    }
};

export const sendToQueue = async (queueName: string, message: RabbitMQMessagePayload): Promise<void> => {
    if (!channel) {
        console.error("RabbitMQ kanalı hazır değil.");
        return;
    }
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        persistent: true,
    });
};

const startResultConsumer = async (): Promise<void> => {
    if (!channel) return;

    console.log("📥 cv_result_queue dinleniyor...");

    channel.consume('cv_result_queue', async (msg) => {
        if (msg !== null) {
            try {
                const resultData = JSON.parse(msg.content.toString()) as RabbitMQResultPayload;
                const { cvId, status, rawText, error } = resultData;

                console.log(`[x] Python'dan cevap geldi. CV ID: ${cvId}, Durum: ${status}`);

                if (status === 'FAILED') {
                    await prisma.cV.update({
                        where: { id: parseInt(cvId as string) },
                        data: { status: 'FAILED' }
                    });
                    console.error(`CV Ayrıştırma hatası (Python): ${error}`);
                }
                else if (status === 'COMPLETED' && rawText) {
                    await prisma.cV.update({
                        where: { id: parseInt(cvId as string) },
                        data: {
                            status: 'PROCESSING',
                            rawText: rawText
                        }
                    });

                    console.log(`[x] Spam kontrolü yapılıyor (CV ID: ${cvId})...`);
                    const currentCV = await prisma.cV.findUnique({ where: { id: parseInt(cvId as string) }, select: { userId: true } });

                    if (currentCV) {
                        const textLength = rawText.length;
                        const minLength = Math.floor(textLength * 0.90);
                        const maxLength = Math.ceil(textLength * 1.10);  

                        const otherUsersCVs: any[] = await prisma.$queryRaw`
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
                            await prisma.cV.update({
                                where: { id: parseInt(cvId as string) },
                                data: {
                                    status: 'FAILED',
                                    atsFormatFeedback: 'Güvenlik Politikası: Mükerrer CV.'
                                }
                            });
                            channel!.ack(msg);
                            return;
                        }

                        console.log(`[x] Gemini'ye gönderiliyor (CV ID: ${cvId})...`);
                        const parsedData: any = await parseCVText(rawText);

                        const atsAnalysis: any = await analyzeATSCompatibility(rawText);

                        await prisma.cV.update({
                            where: { id: parseInt(cvId as string) },
                            data: {
                                summary: parsedData.summary,
                                atsFormatScore: atsAnalysis.score,
                                atsFormatFeedback: atsAnalysis.feedback,
                                status: 'COMPLETED'
                            }
                        });

                        if (parsedData.entries && parsedData.entries.length > 0) {
                            const entriesToCreate = parsedData.entries.map((entry: any) => ({
                                cvId: parseInt(cvId as string),
                                category: entry.category,
                                title: entry.title || "Belirtilmemiş",
                                subtitle: entry.subtitle,
                                startDate: entry.startDate,
                                endDate: entry.endDate,
                                description: entry.description,
                                metadata: entry.metadata ? entry.metadata : null
                            }));

                            await prisma.cVEntry.createMany({
                                data: entriesToCreate
                            });
                        }
                        console.log(`✅ CV (ID: ${cvId}) kaydedildi!`);
                    }
                }

                channel!.ack(msg);
            } catch (error) {
                console.error("❌ Consumer işleme hatası:", error);
                channel!.nack(msg, false, false);
            }
        }
    });
};
