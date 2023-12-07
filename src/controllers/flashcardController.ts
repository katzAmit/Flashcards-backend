import { Request, Response } from 'express';
import * as flashcardService from '../services/flashcardService';
import { Flashcard } from '../types/flashcardInterfaces';
import { v4 as uuidv4 } from 'uuid';
export default {
  getAllFlashcards: async (req: Request, res: Response) => {
    try {
      const flashcards = await flashcardService.getAllFlashcards();
      res.json(flashcards);
    } catch (error) {
      res.status(500).json({ error: 'Internal  server error' });
    }
  },

  createFlashcard: async (req: Request, res: Response) => {
    try {
      const { UserID, Question, Answer, Category, DifficultyLevel } = req.body as Flashcard;
      const FlashcardID: string = uuidv4()
      const newFlashcard: Flashcard = {
        FlashcardID,
        UserID,
        Question,
        Answer,
        Category,
        DifficultyLevel,
      };
      await flashcardService.createFlashcard(newFlashcard);
      res.status(201).json(newFlashcard);
    } catch (error) {
      res.status(400).json({ error: 'Invalid data' });
    }
  },

  updateFlashcardbyId: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updatedFields: Partial<Flashcard> = req.body;
      await flashcardService.updateFlashcardbyId(id, updatedFields);
      const updatedFlashcard = await flashcardService.getFlashcardbyId(id);
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
      const { id } = req.params;
      const flashcard = await flashcardService.getFlashcardbyId(id);
      if (!flashcard) {
        return res.status(404).json({ error: 'Flashcard not found' });
      }
      res.json(flashcard);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },
};
