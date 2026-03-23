# 1. Altyapı olarak hafif bir Node.js sürümü kullan
FROM node:18-slim
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

# 2. Konteyner içinde çalışacağımız klasörü belirle
WORKDIR /app

# 3. Önce sadece paket dosyalarını kopyala
COPY package*.json ./

# 4. Kütüphaneleri kur
RUN npm install

# 5. Prisma şemasını kopyala ve Prisma Client'ı oluştur 
COPY prisma ./prisma/
RUN npx prisma generate

# 6. Kodların geri kalanını kopyala
COPY . .

# 7. Dışarıya 3001 portunu açtığımızı belirt
EXPOSE 3001

# 8. Konteyner çalıştığında ayağa kalkacak komut
CMD ["node", "index.js"]