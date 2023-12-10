import express from 'express';
import cardsController from '../controllers/flashcardController';

const router = express.Router();
// GET / (root)

router.get('/flashcards', cardsController.getFlashcards);

// GET /:cardId
router.get('/flashcards/:cardId', cardsController.getFlashcard);

router.delete('/flashcards/:cardId', cardsController.deleteFlashcard);

// POST /
router.post('/flashcards', cardsController.createFlashcard);

// PUT /:cardId
router.put('/flashcards/:cardId', cardsController.updateFlashcard);

export default router;
