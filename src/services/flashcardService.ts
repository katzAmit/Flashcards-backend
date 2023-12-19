import { Database } from "sqlite3";
import DatabaseSingleton from "../db/DatabaseSingleton";
import { Category, Flashcard } from "../types/flashcardInterfaces";
import { User } from "../types/flashcardInterfaces";
import { Quiz } from "../types/flashcardInterfaces";
import { resolve } from "path";
import { rejects } from "assert";
const db: Database = DatabaseSingleton.getInstance();

export const createFlashcard = async (flashcard: Flashcard): Promise<void> => {
  const {
    id: id,
    username: username,
    question: question,
    answer: answer,
    category: category,
    difficulty_level: difficulty_level,
  } = flashcard;
  return new Promise<void>((resolve, reject) => {
    db.run(
      "INSERT INTO flashcards (id, username, question, answer, category, difficulty_level) VALUES (?, ?, ?, ?, ?, ?)",
      [id, username, question, answer, category, difficulty_level],
      function (err) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log(`New flashcard added with ID: ${this.lastID}`);
          resolve();
        }
      }
    );
  });
};
export const updateFlashcardbyId = async (
  id: string,
  body: Partial<Flashcard>
): Promise<void> => {
  const { username, question, answer, category, difficulty_level } = body;
  return new Promise<void>((resolve, reject) => {
    db.run(
      "UPDATE flashcards SET question = ?, answer = ?, category = ?, difficulty_level = ? WHERE id = ?",
      [question, answer, category, difficulty_level, id],
      function (err) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log(`Flashcard updated with ID: ${id}`);
          resolve();
        }
      }
    );
  });
};
export const deleteFlashcardById = async (id: string): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    db.run("DELETE FROM flashcards WHERE id = ?", [id], function (err) {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        console.log(`Flashcard deleted with ID: ${id}`);
        resolve();
      }
    });
  });
};
export const createQuizRecords = async (quizId: string, username: string, flashcards: any[], start_time: Date, end_time: Date) => {
  return new Promise<void>((resolve, reject) => {
    const insertQuery = `INSERT INTO quizzes (quiz_id, flashcard_id, username, start_date, end_date) VALUES (?, ?, ?, ?, ?)`;

    // Assuming each flashcard has an 'id' property
    const values = flashcards.map(flashcard => [quizId, flashcard.id, username, start_time, end_time]);

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      values.forEach(value => {
        db.run(insertQuery, value, function (err) {
          if (err) {
            db.run('ROLLBACK');
            reject(err);
          }
        });
      });

      db.run('COMMIT', (err) => {
        if (err) {
          db.run('ROLLBACK');
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
};

export const getFlashcards = async (
  username: string | undefined,
  category?: string,
  difficulty_level?: string
): Promise<Flashcard[]> => {
  return new Promise<Flashcard[]>((resolve, reject) => {
    let query = "SELECT * FROM flashcards WHERE username = ?";
    const queryParams = [username];

    if (category) {
      query += " AND category = ?";
      queryParams.push(category);
    }

    if (difficulty_level) {
      query += " AND difficulty_level = ?";
      queryParams.push(difficulty_level);
    }

    db.all(query, queryParams, (err, rows: Flashcard[]) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};
export const getFlashcardbyId = async (
  id: string
): Promise<Flashcard | null> => {
  return new Promise<Flashcard | null>((resolve, reject) => {
    db.get(
      "SELECT * FROM flashcards WHERE id = ?",
      [id],
      (err, row: Flashcard) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(row);
        }
      }
    );
  });
};
// login
export const validateUser = async (
  username: string,
  password: string
): Promise<User> => {
  const userQuery = "SELECT * FROM users WHERE username = ? AND password = ?";
  return new Promise<User>((resolve, reject) => {
    db.get(userQuery, [username, password], (err, row: User) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

export const registerUser = async (
  username: string,
  password: string,
  fname: string,
  lname: string
): Promise<boolean> => {
  return new Promise<boolean>((resolve, reject) => {
    db.run(
      `INSERT INTO users (username, password, fname, lname) VALUES (?, ?, ?, ?)`,
      [username, password, fname, lname],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      }
    );
  });
};

export const getUserFirstName = async (
  username: string
): Promise<string | null> => {
  const userQuery = "SELECT fname FROM users WHERE username = ?";
  return new Promise<string | null>((resolve, reject) => {
    db.get(userQuery, [username], (err, row: { fname?: string }) => {
      if (err) {
        reject(err);
      } else {
        if (row && row.fname) {
          resolve(row.fname); // Extract fName from the row and resolve with it
        } else {
          resolve(null); // Resolve with null if no user found or fName is undefined
        }
      }
    });
  });
};
export const userExists = async (username: string): Promise<boolean> => {
  const userQuery = "SELECT username FROM users WHERE username = ?";
  return new Promise<boolean>((resolve, reject) => {
    db.get(userQuery, [username], (err, row: { username?: string }) => {
      if (err) {
        reject(err);
      } else {
        if (row && row.username) {
          resolve(true); // User exists
        } else {
          resolve(false); // User doesn't exist
        }
      }
    });
  });
};
export const getCategories = async (username: string): Promise<Category[]> => {
  const categoriesQuery = "SELECT category FROM categories WHERE username = ?";
  return new Promise<Category[]>((resolve, reject) => {
    db.all(categoriesQuery, [username], (err, rows: { category: string }[]) => {
      if (err) {
        reject(err);
      } else {
        const categories: Category[] = rows.map((row) => ({
          category: row.category,
          username: username,
        }));
        resolve(categories);
      }
    });
  });
};
//categories
export const checkCategoryExists = (username: string, category: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.get(
      "SELECT 1 FROM categories WHERE username = ? AND category = ? LIMIT 1",
      [username, category],
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(!!result);
        }
      }
    );
  });
};

export const addCategory = async (username: string, category: string): Promise<void> => {
  await db.run(
    "INSERT INTO categories (category, username) VALUES (?, ?)",
    [category, username]
  );
};

export const getCategoryRowCount = async (username: string, category: string): Promise<number> => {
  return new Promise<number>((resolve, reject) => {
    db.get(
      "SELECT COUNT(*) as count FROM flashcards WHERE username = ? AND category = ?",
      [username, category],
      (error, result: { count: number }) => {
        if (error) {
          reject(error);
        } else {
          resolve(result ? result.count : 0);
        }
      }
    );
  });
};

export const getCategoryByFlashcardId = async (flashcardId: string): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    db.get(
      "SELECT category FROM flashcards WHERE id = ?",
      [flashcardId],
      (error, result: { category: string }) => {
        if (error) {
          console.error("Error executing query:", error);
          reject(error);
        } else {
          resolve(result ? result.category : "");
        }
      }
    );
  });
};


export const deleteCategory = async (username: string, category: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(
      "DELETE FROM categories WHERE username = ? AND category = ?",
      [username, category],
      (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      }
    );
  });
};


