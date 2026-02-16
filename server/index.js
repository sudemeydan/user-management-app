const express = require('express');
const cors = require('cors');
const userController = require('./controllers/userController');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());


app.get('/users', userController.getUsers); // -> userController'daki getUsers fonksiyonuna git

app.post('/users', userController.createUser); // -> userController'daki createUser fonksiyonuna git

app.post('/login', userController.login); // -> userController'daki login fonksiyonuna git

app.put('/users/:id', userController.updateUser);

app.delete('/users/:id', userController.deleteUser);

app.listen(PORT, () => {
  console.log(`🚀 Sunucu ${PORT} portunda, 5 Yıldızlı MVC Mimarisiyle çalışıyor!`);
});