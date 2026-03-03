# 1. Altyapı olarak hafif bir Node.js sürümü kullan
FROM node:18-slim
RUN apt-get update && apt-get install -y openssl

# 2. Konteyner içinde çalışacağımız klasörü belirle
WORKDIR /app

# 3. Önce sadece paket dosyalarını kopyala (Hızlandırmak için)
COPY package*.json ./

# 4. Kütüphaneleri kur
RUN npm install

# 5. Prisma şemasını kopyala ve Prisma Client'ı oluştur (Çok kritik!)
COPY prisma ./prisma/
RUN npx prisma generate

# 6. Kodların geri kalanını kopyala
COPY . .

# 7. Dışarıya 3001 portunu açtığımızı belirt
EXPOSE 3001

# 8. Konteyner çalıştığında ayağa kalkacak komut
CMD ["node", "index.js"]