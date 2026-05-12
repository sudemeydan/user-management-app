import winston from 'winston';
import { ElasticsearchTransport, ElasticsearchTransportOptions } from 'winston-elasticsearch';

// Elasticsearch bağlantı ayarları
const esTransportOpts: ElasticsearchTransportOptions = {
  level: 'info',
  clientOpts: { node: 'http://localhost:9200' }, // Docker container adı kullanılıyorsa 'http://elasticsearch:9200' olarak değiştirilmeli, ancak geliştirme aşamasında localhost daha rahat olabilir veya docker içinde isek elasticsearch
  indexPrefix: 'admin-logs',
};

// Docker ortamında çalışıp çalışmadığımızı kontrol edelim
const isDocker = process.env.DATABASE_URL?.includes('@db:5432');
if (isDocker) {
  esTransportOpts.clientOpts = { node: 'http://elasticsearch:9200' };
}

const esTransport = new ElasticsearchTransport(esTransportOpts);

// Konsol çıktısı için daha okunabilir bir format
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json() // Elasticsearch için JSON formatında olmalı
  ),
  defaultMeta: { service: 'user-management-backend' },
  transports: [
    esTransport, // Logları Elasticsearch'e gönderir
    consoleTransport, // Logları konsola yazdırır
  ],
});

// Elasticsearch bağlantı hatalarını konsola basalım ki gözden kaçmasın
esTransport.on('error', (error: any) => {
  console.error('Elasticsearch Logger Hatası:', error);
});

export default logger;
