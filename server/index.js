const express = require('express');
const cors = require('cors');

const userRoutes = require('./routes/userRoutes'); 

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/users', userRoutes); 

app.listen(PORT, () => {
  console.log(`🚀 Sunucu ${PORT} portunda, 5 Yıldızlı MVC Mimarisiyle çalışıyor!`);
});