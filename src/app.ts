import express from 'express';
import flashcardRoutes from './routes/flashcardRoutes';
import DatabaseSingleton from './db/DatabaseSingleton';
import authenticateToken from './middleware/middleware'
import flashController from './controllers/flashcardController'
const cors = require('cors');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());
const db = DatabaseSingleton.getInstance();
DatabaseSingleton.initializeDatabase()
app.post('/login', flashController.loginPage);
app.post('/register', flashController.registerUser);

app.use(authenticateToken);

app.use('/', flashcardRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
