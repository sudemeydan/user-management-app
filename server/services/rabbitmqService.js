// server/services/rabbitmqService.js
const amqp = require('amqplib');

let channel = null;

// RabbitMQ'ya bağlanma fonksiyonu
async function connectRabbitMQ() {
    try {
        // docker-compose.yml dosyamızda environment olarak RABBITMQ_URL tanımlamıştık
        // Eğer bulamazsa (lokal test için) varsayılan adresi kullanır
        const amqpServer = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

        const connection = await amqp.connect(amqpServer);
        channel = await connection.createChannel();

        // Python tarafında oluşturduğumuz kuyruğun aynısını burada da tanımlıyoruz (hata olmaması için)
        await channel.assertQueue('cv_parsing_queue', { durable: true });

        console.log('RabbitMQ bağlantısı başarılı ve kuyruk hazır.');
    } catch (error) {
        console.error('RabbitMQ bağlantı hatası:', error);
    }
}

// Kuyruğa mesaj gönderme fonksiyonu
async function sendToQueue(queueName, data) {
    try {
        if (!channel) {
            await connectRabbitMQ(); // Kanal yoksa önce bağlan
        }

        // Göndereceğimiz JSON verisini RabbitMQ'nun anlayacağı Buffer formatına çeviriyoruz
        channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
        console.log(` [x] Kuyruğa görev eklendi: ${queueName}`);
    } catch (error) {
        console.error('Kuyruğa mesaj gönderilirken hata oluştu:', error);
    }
}

module.exports = {
    connectRabbitMQ,
    sendToQueue
};