const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes'); 
const connectionRoutes = require('./routes/connectionRoutes');
const app = express();
const PORT = 3001;
const errorHandler = require('./middlewares/errorHandler');

app.use(cors());
app.use((req, res, next) => {
  console.log(`📢 SUNUCUYA İSTEK GELDİ: [${req.method}] ${req.url}`);
  next();
});
app.use(express.json());

app.use('/users', userRoutes); 

app.use('/connections', connectionRoutes);

const AppError = require('./utils/AppError');
app.use((req, res, next) => {
  next(new AppError(`Bu sunucuda ${req.originalUrl} adresi bulunamadı!`, 404));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Sunucu ${PORT} çalışıyor!`);
});