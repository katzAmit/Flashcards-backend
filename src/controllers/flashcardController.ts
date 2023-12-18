import { Request, Response } from "express";
import * as flashcardService from "../services/flashcardService";
import { Category, Flashcard } from "../types/flashcardInterfaces";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { User } from "../types/flashcardInterfaces";
import { RequestWithUserPayload } from "../types/request.interface";
import {
  getCategoryByFlashcardId,
  deleteCategory,
  getCategoryRowCount,
  getCategories,
  generateQuizzes,
  createFlashcard,
  deleteFlashcardById,
  getFlashcardbyId,
  getFlashcards,
  updateFlashcardbyId,
  checkCategoryExists,
  addCategory,
} from "../services/flashcardService";
export default {
  // flashcards
  getFlashcards: async (req: RequestWithUserPayload, res: Response) => {
    try {
      const category = req.query.category as string | undefined;
      const difficulty_level = req.query.difficulty_level as string | undefined;
      const username = req.user?.username;

      if (!username) {
        return res
          .status(500)
          .json({ error: "Internal server error, user not found" });
      }

      const flashcards: Flashcard[] = await getFlashcards(
        username,
        category,
        difficulty_level
      );
      res.json(flashcards);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getFlashcard: async (req: RequestWithUserPayload, res: Response) => {
    try {
      const { cardId } = req.params;
      const flashcard = await getFlashcardbyId(cardId);
      if (!flashcard) {
        return res.status(404).json({ error: "Flashcard not found" });
      }
      res.json(flashcard);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
  deleteFlashcard: async (req: RequestWithUserPayload, res: Response) => {
    try {
      if (req.user) {
        const username = req.user.username;
        const { cardId } = req.params;
        const category = await getCategoryByFlashcardId(cardId);
        const rowCount = await getCategoryRowCount(username, category);
        if (rowCount == 1) { await deleteCategory(username, category); }
        await deleteFlashcardById(cardId);
        res.json({
          message: `Flashcard with ID ${cardId} deleted successfully`,
        });
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
  createFlashcard: async (req: RequestWithUserPayload, res: Response) => {
    try {
      if (req.user) {
        const id = uuidv4();
        const username = req.user.username;
        const {
          question: question,
          answer: answer,
          category: category,
          difficulty_level: difficulty_level,
        } = req.body;
        const newFlashcard: Flashcard = {
          id: id,
          username: username,
          question: question,
          answer: answer,
          category: category,
          difficulty_level: difficulty_level,
        };
        const category_exist: boolean = await checkCategoryExists(
          username,
          category
        );
        if (!category_exist) {
          await addCategory(username, category);
        }
        await createFlashcard(newFlashcard);
        res.status(201).json(newFlashcard);
      }
    } catch (error) {
      res.status(400).json({ error: "Invalid data" });
    }
  },
  updateFlashcard: async (req: RequestWithUserPayload, res: Response) => {
    try {
      if (req.user) {
        const username = req.user?.username;
        const { cardId } = req.params;
        const updatedFields: Partial<Flashcard> = req.body;
        const category = updatedFields?.category;
        if (category) {
          const category_exist: boolean = await checkCategoryExists(
            username,
            category
          );
          if (!category_exist) {
            await addCategory(username, category);
          }
          await updateFlashcardbyId(cardId, updatedFields);
          const updatedFlashcard = await getFlashcardbyId(cardId);
          if (!updatedFlashcard) {
            return res.status(404).json({ error: "Flashcard not found" });
          }
          res.json(updatedFlashcard);
        }
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
  getCategories: async (req: RequestWithUserPayload, res: Response) => {
    try {
      const username = req.user?.username;
      if (username) {
        const categories: Category[] = await getCategories(username);
        if (!categories) {
          return res.status(404).json({ error: "Flashcard not found" });
        }
        res.json(categories);
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
  generateQuizzes: async (
    req: RequestWithUserPayload,
    res: Response
  ): Promise<void> => {
    // try {
    //   const quizes: Quiz[] = await generateQuizzes();
    //   res.status(200).json({ message: 'Quizzes generated successfully.' });
    // } catch (error) {
    //   console.error(error);
    //   res.status(500).json({ error: 'Failed to generate quizzes.' });
    // }
  },
  // quizzes
  getQuizzes: async (req: RequestWithUserPayload, res: Response) => {
    const { categories } = req.body;
    const username = req.user?.username;

    try {
      const quizzes = [];

      for (let i = 0; i < Math.min(4, categories.length); i++) {
        const selectedFlashcards = await getFlashcards(username, categories[i]);

        if (selectedFlashcards.length < 3) {
          res.status(400).json({
            error: `Category '${categories[i]}' doesn't have enough flashcards for a quiz.`,
          });
          return;
        }

        const selectedIndices = new Set<number>();
        const selectedDifficultyLevels = new Set<string>();

        const numFlashcards = Math.floor(Math.random() * (selectedFlashcards.length - 2)) + 4;

        while (selectedIndices.size < numFlashcards) {
          const randomIndex = Math.floor(Math.random() * selectedFlashcards.length);

          if (!selectedIndices.has(randomIndex)) {
            selectedIndices.add(randomIndex);
            selectedDifficultyLevels.add(
              selectedFlashcards[randomIndex].difficulty_level
            );
          }
        }

        const selectedDifficultyLevelsArray = Array.from(selectedDifficultyLevels).sort((a, b) => {
          const difficultyOrder = ['Easy', 'Medium', 'Hard'];
          return difficultyOrder.indexOf(a) - difficultyOrder.indexOf(b);
        });

        const selectedFlashcardIndices: number[] = Array.from(selectedIndices);

        const selectedFlashcardsForQuiz: Flashcard[] = selectedFlashcardIndices.map(
          (index: number) => selectedFlashcards[index]
        );

        const quiz = {
          id: `Quiz_${i + 1}`,
          title: `Quiz ${i + 1}`,
          categories: [categories[i]],
          flashcards: selectedFlashcardsForQuiz,
          difficulty_levels: selectedDifficultyLevelsArray,
        };

        quizzes.push(quiz);
      }

      res.status(200).json(quizzes);
    } catch (error) {
      console.error("Error generating quizzes:", error);
      res.status(500).json({ error: "Failed to generate quizzes" });
    }
  },
  // login
  loginPage: async (req: Request, res: Response) => {
    const { username, password } = req.body;

    const isValidUser: User = await flashcardService.validateUser(
      username,
      password
    );

    if (isValidUser) {
      const tokenPayload = {
        username: username,
        fname: isValidUser.fname,
      };
      const token = jwt.sign(tokenPayload, "secret_key"); // Replace 'secret_key' with your actual secret key
      res.status(200).json({ token });
    } else {
      res.status(403).json({ error: "Invalid credentials" });
    }
  },
  registerUser: async (req: Request, res: Response) => {
    const { username, password, fname, lname } = req.body;
    const userExists: boolean = await flashcardService.userExists(username);
    if (!userExists) {
      const isRegistered = await flashcardService.registerUser(
        username,
        password,
        fname,
        lname
      );
      if (!isRegistered) {
        res
          .status(500)
          .json({ error: "Error when signing up, please try again" });
      } else {
        res.status(201).json({ message: "User created successfully." });
      }
    } else {
      res.status(400).json({ error: "User already exists" });
    }
  },
};
