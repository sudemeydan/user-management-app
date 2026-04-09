# 1. Altyapı
FROM node:18-slim

# Puppeteer için gerekli sistem bağımlılıkları
RUN apt-get update && apt-get install -y \
    openssl \
    wget \
    gnupg \
    ca-certificates \
    libglib2.0-0 \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Paket dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları kur
RUN npm install --legacy-peer-deps

# Prisma şemasını kopyala ve Prisma Client'ı oluştur
COPY prisma ./prisma/
RUN npx prisma generate

# Kodların geri kalanını kopyala
COPY . .

EXPOSE 3001

# Geliştirme modu: nodemon + ts-node
CMD ["npm", "run", "dev"]