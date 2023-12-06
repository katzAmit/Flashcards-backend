import express from 'express';
import flashcardRoutes from './routes/flashcardRoutes';
import DatabaseSingleton from './db/DatabaseSingleton';

const app = express();

const db = DatabaseSingleton.getInstance();

// Mount your flashcard routes
app.use('/', flashcardRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Ensure to handle database closure appropriately
// db.close();
