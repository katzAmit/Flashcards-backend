import express from 'express';
import cardsController from '../controllers/flashcardController';

const router = express.Router();
// GET / (root)

router.get('/flashcards', cardsController.getAllFlashcards);

// GET /:cardId
router.get('/flashcards/:cardId', cardsController.getFlashcardbyId);

// POST /
router.post('/flashcards', cardsController.createFlashcard);

// PUT /:cardId
router.put('/flashcards/:cardId', cardsController.updateFlashcardbyId);

export default router;
