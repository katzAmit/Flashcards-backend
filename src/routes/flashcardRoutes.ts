import express from 'express';
import cardsController from '../controllers/flashcardController';

const router = express.Router();

// GET / (root)
router.get('/', cardsController.getAllFlashcards);

// GET /:cardId
router.get('/:cardId', cardsController.getFlashcardbyId);

// POST /
router.post('/', cardsController.createFlashcard);

// PUT /:cardId
router.put('/:cardId', cardsController.updateFlashcardbyId);

export default router;
