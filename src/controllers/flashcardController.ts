import { Request, Response } from "express";
import * as flashcardService from "../services/flashcardService";
import { Category, Flashcard, Marathon } from "../types/flashcardInterfaces";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { User } from "../types/flashcardInterfaces";
import { RequestWithUserPayload } from "../types/request.interface";
import {
  getCategoryByFlashcardId,
  deleteCategory,
  getCategoryRowCount,
  getCategories,
  createFlashcard,
  deleteFlashcardById,
  getFlashcardbyId,
  getFlashcards,
  updateFlashcardbyId,
  checkCategoryExists,
  addCategory,
  createQuizRecords,
  getMarathons,
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
        if (rowCount == 1) {
          await deleteCategory(username, category);
        }
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
  // submitQuiz: async (req: RequestWithUserPayload, res: Response) => {
  //   try {
  //     if (req.user) {
  //       const id = uuidv4();
  //       const username = req.user.username;
  //       const { flashcards, start_time, end_time } = req.body;

  //       // Update flashcards and create quiz records
  //       await Promise.all([
  //         updateFlashCards(username, flashcards),
  //         createQuizRecords(id, username, flashcards, start_time, end_time)
  //       ]);

  //       res.status(200).json({ message: 'Quiz submitted successfully' });
  //     } else {
  //       res.status(401).json({ error: 'Unauthorized' });
  //     }
  //   } catch (error) {
  //     console.error("Error submitting quiz:", error);
  //     res.status(400).json({ error: "Invalid data" });
  //   }
  // },
  updateFlashCards: async (username: string, flashcards: Flashcard[]) => {
    for (const flashcard of flashcards) {
      const id = flashcard.id;
      const updatedFields = { username: flashcard };
      // await updateFlashcardById(flashcard.id, updatedFields);
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
  // quizzes
  getQuizzes: async (req: RequestWithUserPayload, res: Response) => {
    const { categories } = req.body;
    const username = req.user?.username;

    try {
      const quizzes = [];

      for (let i = 0; i < categories.length; i++) {
        const selectedFlashcards = await getFlashcards(username, categories[i]);

        if (selectedFlashcards.length < 5) {
          res.status(400).json({
            error: `Category '${categories[i]}' doesn't have enough flashcards for a quiz.`,
          });
          return;
        }

        const selectedIndices = new Set<number>();
        const selectedDifficultyLevels = new Set<string>();

        const numFlashcards = selectedFlashcards.length;

        while (selectedIndices.size < numFlashcards) {
          const randomIndex = Math.floor(
            Math.random() * selectedFlashcards.length
          );

          if (!selectedIndices.has(randomIndex)) {
            selectedIndices.add(randomIndex);
            selectedDifficultyLevels.add(
              selectedFlashcards[randomIndex].difficulty_level
            );
          }
        }

        const selectedDifficultyLevelsArray = Array.from(
          selectedDifficultyLevels
        ).sort((a, b) => {
          const difficultyOrder = ["Easy", "Medium", "Hard"];
          return difficultyOrder.indexOf(a) - difficultyOrder.indexOf(b);
        });

        const selectedFlashcardIndices: number[] = Array.from(selectedIndices);

        const selectedFlashcardsForQuiz: Flashcard[] =
          selectedFlashcardIndices.map(
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

  generateMarathon: async (req: RequestWithUserPayload, res: Response) => {
    const { category, days } = req.body;
    const username = req.user?.username;
    type Quiz = {
      id: string;
      title: string;
      categories: any[]; // Update with the correct type
      flashcards: any[]; // Update with the correct type
      difficulty_levels: any[];
    };

    try {
      const Marathon: Quiz[] = [];
      const MarathonIndices: number[][] = new Array(days).fill([]);

      const allFlashcardsInCategory = await getFlashcards(username, category);
      const usedMap: number[] = new Array(allFlashcardsInCategory.length).fill(
        0
      );

      if (allFlashcardsInCategory.length < days) {
        // not enough for all days
        res.status(400).json({
          error: `Selected category doesn't have enough flashcards for a marathon.`,
        });
        return;
      }

      const numOfFlashcardsPerQuiz = allFlashcardsInCategory.length / days;

      // divide the questions as indices
      for (let i: number = 0; i < days; i += 1) {
        for (let j: number = 0; j < numOfFlashcardsPerQuiz; j += 1) {
          let randomIndex: number = Math.floor(Math.random() * usedMap.length);
          while (usedMap[randomIndex] === 1) {
            let randomIndex: number = Math.floor(
              Math.random() * usedMap.length
            );
          }
          usedMap[randomIndex] = 1;
          MarathonIndices[i][j] = randomIndex;
        }
      }

      // map the indices to quizzes
      for (let i = 0; i < days; i += 1) {
        const curQuiz: Quiz = {
          id: `quiz${i + 1}`,
          title: `Quiz ${i + 1}`,
          categories: [category], // Update with the correct data structure
          flashcards: MarathonIndices[i].map(
            (index: number) => allFlashcardsInCategory[index]
          ),
          difficulty_levels: ["Easy", "Medium", "Hard"], // Update with the correct data structure
        };
        Marathon.push(curQuiz);
      }
      res.status(200).json(Marathon);
    } catch (error) {
      console.error("Error generating Marathon:", error);
      res.status(500).json({ error: "Failed to generate Marathon" });
    }
  },

  getMarathons: async (req: RequestWithUserPayload, res: Response) => {
    try {
      const username = req.user?.username;

      if (!username) {
        return res
          .status(500)
          .json({ error: "Internal server error, user not found" });
      }

      const marathons: Marathon[] = await getMarathons(username);
      res.json(marathons);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
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
