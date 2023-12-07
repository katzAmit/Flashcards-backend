// app.ts
import express from 'express';
import flashcardRoutes from './routes/flashcardRoutes';
import { authenticateToken } from './middleware/middleware'
import DatabaseSingleton from './db/DatabaseSingleton';

const app = express();

const db = DatabaseSingleton.getInstance();

// Middleware for login and register routes (to be implemented)
// For example:
// app.use('/login', loginMiddleware);
// app.use('/register', registerMiddleware);

// Protect routes with authentication middleware
app.use(authenticateToken);

// Mount your flashcard routes
app.use('/', flashcardRoutes);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
