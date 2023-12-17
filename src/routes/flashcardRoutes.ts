import express from 'express';
import cardsController from '../controllers/flashcardController';

const router = express.Router();

router.get('/flashcards', cardsController.getFlashcards);

router.get('/flashcards/:cardId', cardsController.getFlashcard);

router.delete('/flashcards/:cardId', cardsController.deleteFlashcard);

router.post('/flashcards', cardsController.createFlashcard);

router.put('/flashcards/:cardId', cardsController.updateFlashcard);

router.get('/quizzes', cardsController.getQuizzes)

router.get('/categories', cardsController.getCategories)

export default router;
