import { Database } from "sqlite3";
import DatabaseSingleton from "../db/DatabaseSingleton";
import { Category, Flashcard, Marathon } from "../types/flashcardInterfaces";
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
export const createQuizRecord = async (
  quizId: string,
  flashcardId: string,
  username: string,
  difficulty_level: string,
  start_time: Date,
  end_time: Date,
  category: string
) => {
  return new Promise<void>((resolve, reject) => {
    db.run(
      `INSERT INTO quizzes (id, flashcard_id, difficulty_level, username, start_date, end_date, category) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [quizId, flashcardId, difficulty_level, username, start_time, end_time, category],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
}

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
export const checkCategoryExists = (
  username: string,
  category: string
): Promise<boolean> => {
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

export const addCategory = async (
  username: string,
  category: string
): Promise<void> => {
  await db.run("INSERT INTO categories (category, username) VALUES (?, ?)", [
    category,
    username,
  ]);
};

export const getCategoryRowCount = async (
  username: string,
  category: string
): Promise<number> => {
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

export const getCategoryByFlashcardId = async (
  flashcardId: string
): Promise<string> => {
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

export const deleteCategory = async (
  username: string,
  category: string
): Promise<void> => {
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

export const updateFlashCards = async (flashcards: Flashcard[]) => {
  for (const flashcard of flashcards) {
    const updatedFields: Partial<Flashcard> = {
      username: flashcard.username,
      question: flashcard.question,
      answer: flashcard.answer,
      category: flashcard.category,
      difficulty_level: flashcard.difficulty_level,
    };
    await updateFlashcardbyId(flashcard.id, updatedFields);
  }
};

export const createMarathon = async (marathon: Marathon): Promise<void> => {
  const {
    id: id,
    username: username,
    category: category,
    total_days: total_days,
    current_day: current_day,
  } = marathon;
  return new Promise<void>((resolve, reject) => {
    db.run(
      "INSERT INTO marathons (id, username, category, total_days, current_day) VALUES (?, ?, ?, ?, ?)",
      [id, username, category, total_days, current_day],
      function (err) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log(`New marathon added with ID: ${this.lastID}`);
          resolve();
        }
      }
    );
  });
};

export const getMarathons = async (
  username: string | undefined
): Promise<Marathon[]> => {
  return new Promise<Marathon[]>((resolve, reject) => {
    let query = "SELECT * FROM marathons WHERE username = ?";
    const queryParams = [username];

    db.all(query, queryParams, (err, rows: Marathon[]) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};


export const getStats1 = async (username: string | undefined): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const queryMorning =
      "SELECT COUNT(*) AS count FROM quizzes WHERE username = ? AND difficulty_level = 'Easy' AND strftime('%H:%M', end_date) BETWEEN '08:00' AND '15:59'";
    const queryAfternoon =
      "SELECT COUNT(*) AS count FROM quizzes WHERE username = ? AND difficulty_level = 'Easy' AND strftime('%H:%M', end_date) BETWEEN '16:00' AND '23:59'";
    const queryNight =
      "SELECT COUNT(*) AS count FROM quizzes WHERE username = ? AND difficulty_level = 'Easy' AND (strftime('%H:%M', end_date) BETWEEN '00:00' AND '07:59' OR strftime('%H:%M', end_date) >= '00:00' AND strftime('%H:%M', end_date) <= '08:00')";

    const getQuizCount = (query: string, params: any[]): Promise<number> => {
      return new Promise<number>((resolve, reject) => {
        db.get(query, params, (err, row: { count?: number }) => {
          if (err) {
            reject(err);
          } else {
            resolve(row ? row.count || 0 : 0); // Return the count or 0 if no matching row
          }
        });
      });
    };

    Promise.all([
      getQuizCount(queryMorning, [username]),
      getQuizCount(queryAfternoon, [username]),
      getQuizCount(queryNight, [username]),
    ])
      .then((counts) => {
        // Determine the period with the highest count
        const maxCount = Math.max(...counts);
        const maxIndex = counts.indexOf(maxCount);

        // Resolve with the corresponding period
        if (maxIndex === 0) {
          resolve('08:00-16:00');
        } else if (maxIndex === 1) {
          resolve('16:00-00:00');
        } else {
          resolve('00:00-08:00');
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export const getStats2 = async (username: string | undefined):
Promise<{ category: string; questions: number }[]> => { 
  const query = `
    SELECT
      category,
      COUNT(*) AS questions
    FROM
      flashcards
    WHERE
      difficulty_level = 'Easy'
    GROUP BY
      category;
  `;
  
  return new Promise<{ category: string; questions: number }[]>((resolve, reject) => {
    db.all(query, (err, rows: { category: string , questions: number }[]) => {
      if (err) {
        reject(err);
        return;
      }
      // const result = rows.map((row) => ({
      //   x: row.category || "Unknown", // Use a default value if category is undefined
      //   y: row.easyCount,
      // }));
      if(rows.length!= 0){
        resolve(rows);
      }
      else
      resolve([]);
     
    });
  });

};

export const getStats3 = async (username: string | undefined):
  Promise<string> => { return "" };

export const getStats4 = async (username: string | undefined):
  Promise<string> => { return "" };

export const getStats5 = async (username: string | undefined):
  Promise<string> => {
  return new Promise<string>((resolve, reject) => {

    const query = `
    SELECT
  COUNT(DISTINCT id) AS numberOfQuizzes,
  CASE
    WHEN COUNT(DISTINCT id) > 0 THEN
      ROUND(SUM((CAST(strftime('%s', end_date) AS REAL) - CAST(strftime('%s', start_date) AS REAL)) / 60) / COUNT(DISTINCT id))
    ELSE
      0
  END AS averageTimePerQuiz
FROM quizzes;
  `;

    db.get(query, (err, row: {numberOfQuizzes?: number, averageTimePerQuiz?: number }) => {
      if (err) {
        reject(err);
      } else {
        if (row) {
          const numberOfQuizzes = row.numberOfQuizzes || 0;
          const averageTimePerQuiz = row.averageTimePerQuiz || 0;
  
          // Access the results
          if (numberOfQuizzes > 0) {
            resolve(`${averageTimePerQuiz} min`);
          } else {
            resolve("0 min");
          }
        } else {
          reject(err);
        }
        
      }
    });

  });
};
