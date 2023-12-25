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
  createQuizRecord,
  updateFlashCards,
  getMarathons,
  createMarathonRecord,
  getCurrentMarathonQuiz,
  getMarathonById,
  updateMarathonbyId,
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
          isAuto: isAuto,
        } = req.body;
        const newFlashcard: Flashcard = {
          id: id,
          username: username,
          question: question,
          answer: answer,
          category: category,
          difficulty_level: difficulty_level,
          is_auto: isAuto,
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
        const is_auto = updatedFields?.is_auto;
        const category = updatedFields?.category;
        if (is_auto === 1 || is_auto === undefined) {
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
        } else {
          return res.status(404).json({ error: "Flashcard is not Auto" });
        }
      }
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
  submitQuiz: async (req: RequestWithUserPayload, res: Response) => {
    try {
      if (req.user) {
        const id = uuidv4();
        const username = req.user.username;
        const {
          flashcards,
          quiz_id,
          start_time,
          end_time,
          marathon_or_practice,
          marathon_id,
        } = req.body;

        const updateFlashcardsPromise = updateFlashCards(flashcards);

        const createQuizzesPromise = Promise.all(
          flashcards.map(async (flashcard: Flashcard) => {
            const { id: flashcardId, difficulty_level, category } = flashcard;
            await createQuizRecord(
              id,
              flashcardId,
              username,
              difficulty_level,
              category,
              start_time,
              end_time
            );
          })
        );

        if (marathon_or_practice === "marathon") {
          // Retrieve the existing marathon
          const existingMarathon = await getMarathonById(marathon_id, quiz_id);

          if (existingMarathon) {
            // Update the did_quiz field for the existing marathon
            await updateMarathonbyId(
              existingMarathon.marathon_id,
              existingMarathon.quiz_id,
              {
                did_quiz: 1,
                // Add other fields as needed for your updateMarathon function
              }
            );
          } else {
            // Handle the case where the marathon does not exist
            console.error("Marathon not found for update.");
          }
        }

        await Promise.all([updateFlashcardsPromise, createQuizzesPromise]);

        res.status(200).json({ message: "Quiz submitted successfully" });
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(400).json({ error: "Invalid data" });
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

  getStats: async (req: RequestWithUserPayload, res: Response) => {
    const username = req.user?.username;
    try {
      const stats = [];

      // for (let i = 1; i < 6; i++) {
      //   const functionName = `getStats${i}`;
      //   const stat = await flashcardService.(window as any)[functionName](username);
      //   stats.push(stat);
      // }

      let stat1 = await flashcardService.getStats1(username);
      stats.push(stat1);
      let stat2 = await flashcardService.getStats2(username);
      stats.push(stat2);
      let stat3 = await flashcardService.getStats3(username);
      stats.push(stat3);
      let stat4 = await flashcardService.getStats4(username);
      stats.push(stat4);
      let stat5 = await flashcardService.getStats5(username);
      stats.push(stat5);
      res.status(200).json(stats);
    } catch (error) {
      console.error("Error generating stats:", error);
      res.status(500).json({ error: "Failed to generate stats" });
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
    const { category, total_days } = req.body;
    const username = req.user?.username;

    if (!username) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    try {
      const startDate = new Date(); // Current date as start date for the marathon
      const curMarathonUUID = uuidv4();
      for (let i = 0; i < total_days; i++) {
        const curQuizUUID = uuidv4(); // Generate UUID for the quiz

        const curQuiz: any = {
          id: `quiz${i + 1}`,
          physical_id: curQuizUUID, // UUID for the quiz
          title: `Quiz ${i + 1}`,
          categories: [category],
          flashcards: [],
          difficulty_levels: ["Easy", "Medium", "Hard"],
        };

        const allFlashcardsInCategory = await getFlashcards(username, category);
        const usedMap: number[] = new Array(
          allFlashcardsInCategory.length
        ).fill(0);
        const numOfFlashcardsPerQuiz = Math.floor(
          allFlashcardsInCategory.length / total_days
        );

        for (let j = 0; j < numOfFlashcardsPerQuiz; j++) {
          let randomIndex = Math.floor(
            Math.random() * allFlashcardsInCategory.length
          );

          while (usedMap[randomIndex] === 1) {
            randomIndex = Math.floor(
              Math.random() * allFlashcardsInCategory.length
            );
          }

          usedMap[randomIndex] = 1;
          const selectedFlashcard = allFlashcardsInCategory[randomIndex];

          // Create quiz record for each flashcard in the quiz
          await createQuizRecord(
            curQuiz.physical_id,
            selectedFlashcard.id,
            username,
            selectedFlashcard.difficulty_level,
            category
          );

          curQuiz.flashcards.push(selectedFlashcard);
        }

        await createMarathonRecord(
          curMarathonUUID,
          curQuizUUID,
          username,
          category,
          i, // Current day starting from 0
          total_days,
          startDate, // Start date for the marathon
          0
        );
      }

      res.status(200).json(curMarathonUUID);
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
  getCurrentMarathonQuiz: async (
    req: RequestWithUserPayload,
    res: Response
  ) => {
    try {
      const { marathon_id } = req.body; // Extract marathon ID from the request body
      const quiz = await getCurrentMarathonQuiz(marathon_id);
      res.status(200).json(quiz); // Send the retrieved quiz as the response
    } catch (error) {
      console.error("Error fetching current marathon quiz:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};
