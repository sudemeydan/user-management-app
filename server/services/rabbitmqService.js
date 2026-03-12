// server/services/rabbitmqService.js
const amqp = require('amqplib');
const prisma = require('../utils/prisma');
const { parseCVText, analyzeATSCompatibility } = require('./geminiService');

let connection = null;
let channel = null;

const connectRabbitMQ = async () => {
    try {
        // ÇÖZÜM BURASI: 
        // docker-compose.yml'deki RABBITMQ_URL'i (amqp://rabbitmq:5672) kullan. 
        // Eğer o yoksa (lokal geliştirme için) default olarak 'amqp://localhost' kullan.
        const amqpUrl = process.env.RABBITMQ_URL || 'amqp://localhost';

        connection = await amqp.connect(amqpUrl);
        channel = await connection.createChannel();

        // Kuyrukları tanımla
        await channel.assertQueue('cv_parsing_queue', { durable: true });
        await channel.assertQueue('cv_result_queue', { durable: true });

        console.log('✅ RabbitMQ Bağlantısı Başarılı');

        // Worker'ı (dinleyiciyi) başlat
        startResultConsumer();

    } catch (error) {
        console.error('❌ RabbitMQ Bağlantı Hatası:', error.message);
        setTimeout(connectRabbitMQ, 5000); // 5 saniye sonra tekrar dene
    }
};
// Node.js'ten Python'a mesaj (PDF verisi) gönderme fonksiyonu
const sendToQueue = async (queueName, message) => {
    if (!channel) {
        console.error("RabbitMQ kanalı hazır değil.");
        return;
    }
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
        persistent: true,
    });
};

// Python'dan gelen sonucu dinleme ve Gemini'yi tetikleme
const startResultConsumer = async () => {
    if (!channel) return;

    console.log("📥 cv_result_queue dinleniyor...");

    channel.consume('cv_result_queue', async (msg) => {
        if (msg !== null) {
            try {
                const resultData = JSON.parse(msg.content.toString());
                const { cvId, status, rawText, error } = resultData;

                console.log(`[x] Python'dan cevap geldi. CV ID: ${cvId}, Durum: ${status}`);

                if (status === 'FAILED') {
                    // Python tarafında hata çıktıysa DB'yi güncelle
                    await prisma.cV.update({
                        where: { id: parseInt(cvId) },
                        data: { status: 'FAILED' }
                    });
                    console.error(`CV Ayrıştırma hatası (Python): ${error}`);
                }
                else if (status === 'COMPLETED' && rawText) {
                    // Python başarılı. DB'de statüyü PROCESSING yap, ham metni kaydet
                    await prisma.cV.update({
                        where: { id: parseInt(cvId) },
                        data: {
                            status: 'PROCESSING',
                            rawText: rawText
                        }
                    });

                    // 1. Gemini'ye ham metni gönder ve JSON al
                    console.log(`[x] Gemini'ye gönderiliyor (CV ID: ${cvId})...`);
                    const parsedData = await parseCVText(rawText);

                    // 2. Gemini'den gelen verileri DB'ye kaydet
                    // YENİ: ATS format analizi yap
                    console.log(`[x] ATS Analizi yapılıyor (CV ID: ${cvId})...`);
                    const atsAnalysis = await analyzeATSCompatibility(rawText);

                    await prisma.cV.update({
                        where: { id: parseInt(cvId) },
                        data: {
                            summary: parsedData.summary,
                            atsFormatScore: atsAnalysis.score,
                            atsFormatFeedback: atsAnalysis.feedback,
                            status: 'COMPLETED'
                        }
                    });

                    // 3. Entries (Yetenekler, Eğitimler vb.) tablosuna kayıt at
                    if (parsedData.entries && parsedData.entries.length > 0) {
                        const entriesToCreate = parsedData.entries.map(entry => ({
                            cvId: parseInt(cvId),
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
                    console.log(`✅ CV (ID: ${cvId}) başarıyla işlendi ve veritabanına kaydedildi!`);
                }

                channel.ack(msg); // Mesaj işlendi, kuyruktan sil
            } catch (error) {
                console.error("❌ Consumer işleme hatası:", error);

                // Hata durumunda veritabanındaki CV durumunu FAILED yap
                try {
                    const resultData = JSON.parse(msg.content.toString());
                    if (resultData && resultData.cvId) {
                        await prisma.cV.update({
                            where: { id: parseInt(resultData.cvId) },
                            data: { status: 'FAILED' }
                        });
                        console.log(`[!] CV ID: ${resultData.cvId} durumu FAILED olarak güncellendi.`);
                    }
                } catch (dbError) {
                    console.error("❌ Durum güncellenirken ikincil hata oluştu:", dbError);
                }

                channel.ack(msg); // Hata olsa bile diğer mesajları tıkamamak için onayla
            }
        }
    });
};

module.exports = {
    connectRabbitMQ,
    sendToQueue
};