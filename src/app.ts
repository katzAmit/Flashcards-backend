import express from 'express';
import flashcardRoutes from './routes/flashcardRoutes';
import DatabaseSingleton from './db/DatabaseSingleton';
import authenticateToken from './middleware/middleware'
import flashController from './controllers/flashcardController'
require('dotenv').config();

const app = express();
app.use(express.json());
const db = DatabaseSingleton.getInstance();

app.post('/login', flashController.loginPage);
app.post('/register', flashController.registerUser);

app.use(authenticateToken);

app.use('/', flashcardRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
