import { Request, Response } from 'express';
import * as flashcardService from '../services/flashcardService';

export default {
  getAllFlashcards: async (req: Request, res: Response) => {
    try {
      const flashcards = await flashcardService.getAllFlashcards();
      res.json(flashcards);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  createFlashcard: async (req: Request, res: Response) => {
    try {
      const newFlashcard = await flashcardService.createFlashcard(req.body);
      res.status(201).json(newFlashcard);
    } catch (error) {
      res.status(400).json({ error: 'Invalid data' });
    }
  },

  updateFlashcardbyId: async (req: Request, res: Response) => {
    try {
      const { id } = req.params; // Assuming you have an 'id' parameter in the URL
      const updatedFlashcard = await flashcardService.updateFlashcardbyId(id, req.body);
      if (!updatedFlashcard) {
        return res.status(404).json({ error: 'Flashcard not found' });
      }
      res.json(updatedFlashcard);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },
  getFlashcardbyId: async (req: Request, res: Response) => {
    try {
      const { id } = req.params; // Assuming you have an 'id' parameter in the URL
      const Flashcard = await flashcardService.getFlashcardbyId(id);
      if (!Flashcard) {
        return res.status(404).json({ error: 'Flashcard not found' });
      }
      res.json(Flashcard);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
