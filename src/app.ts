import express from 'express';
import flashcardRoutes from './routes/flashcardRoutes'
const app = express();

app.use('/', flashcardRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
