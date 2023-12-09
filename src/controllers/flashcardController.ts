import { Request, Response } from 'express';
import * as flashcardService from '../services/flashcardService';
import { Flashcard } from '../types/flashcardInterfaces';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import { User } from '../types/flashcardInterfaces'
import { RequestWithUserPayload } from '../types/request.interface';
export default {
  getAllFlashcards: async (req: RequestWithUserPayload, res: Response) => {
    try {
      if (!req.user) {
        return res.status(500).json({ error: 'Internal server error, user not found' });
      }

      const flashcards = await flashcardService.getAllFlashcards(req.user?.username);
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
  loginPage: async (req: Request, res: Response) => {
    const { username, password } = req.body;

    const isValidUser: User = await flashcardService.validateUser(username, password);

    if (isValidUser) {
      const tokenPayload = {
        username: username,
        fName: isValidUser.fName,
        // Add other properties as needed
      };
      const token = jwt.sign(tokenPayload, 'secret_key'); // Replace 'secret_key' with your actual secret key
      res.status(200).json({ token });
    } else {
      res.status(403).json({ error: 'That email and password combination is incorrect' });
    }
  },
  registerUser: async (req: Request, res: Response) => {
    const { username, password, fName, lName } = req.body;
    const userExists: boolean = await flashcardService.userExists(username);
    if (!userExists) {
      const isRegistered = await flashcardService.registerUser(username, password, fName, lName);
      if (!isRegistered) {
        res.status(500).json({ error: 'Error when signing up, please try again' });
      } else {
        res.status(201).json({ message: 'User created successfully.' });
      }
    }
    else {
      res.status(400).json({ error: 'User already exists' })
    }
  },
};
