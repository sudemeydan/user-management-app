# 1. Altyapı
FROM node:18-alpine

# 2. Çalışma dizini
WORKDIR /app

# 3. Paketleri kopyala ve kur
COPY package*.json ./
RUN npm install

# 4. Kodları kopyala
COPY . .

# 5. React'in varsayılan portu
EXPOSE 3000

# 6. Başlatma komutu
CMD ["npm", "start"]