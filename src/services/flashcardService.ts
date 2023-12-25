import { Database } from "sqlite3";
import DatabaseSingleton from "../db/DatabaseSingleton";
import {
  Category,
  Flashcard,
  Marathon,
  MarathonRow,
} from "../types/flashcardInterfaces";
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
  category: string,
  start_time?: Date, // Making start_time optional
  end_time?: Date // Making end_time optional
) => {
  return new Promise<void>((resolve, reject) => {
    const values: any[] = [
      quizId,
      flashcardId,
      difficulty_level,
      username,
      category,
    ];

    let query = `INSERT INTO quizzes (quiz_id, flashcard_id, difficulty_level, username, category) VALUES (?, ?, ?, ?, ?)`;

    // Check for start_time and end_time presence
    if (start_time && end_time) {
      query = `INSERT INTO quizzes (quiz_id, flashcard_id, difficulty_level, username, category, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      values.push(start_time, end_time);
    }

    db.run(query, values, (err) => {
      if (err) {
        reject(err);
        console.log("THere was an ERRROR!!!", err);
      } else {
        resolve();
        console.log("Success");
      }
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
export const getFlashcardbyId = async (id: string): Promise<Flashcard> => {
  return new Promise<Flashcard>((resolve, reject) => {
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

export const getMarathons = async (
  username: string | undefined
): Promise<Marathon[]> => {
  return new Promise<Marathon[]>((resolve, reject) => {
    if (!username) {
      reject(new Error("Invalid username"));
      return;
    }

    const query = "SELECT * FROM marathons WHERE username = ?";
    const queryParams = [username];

    db.all(query, queryParams, (err, rows: MarathonRow[]) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        const marathonsMap: Map<string, Marathon> = new Map();
        rows.forEach((row) => {
          const {
            marathon_id,
            quiz_id,
            username,
            total_days,
            current_day,
            start_date,
            category,
            did_quiz,
          } = row;

          if (!marathonsMap.has(marathon_id)) {
            const marathonDate: Date = new Date(start_date);
            const today = new Date();
            const timeDiff = Math.abs(today.getTime() - marathonDate.getTime());
            const currentDay: number = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            marathonsMap.set(marathon_id, {
              marathon_id,
              quizzes: [],
              username,
              total_days,
              current_day: currentDay,
              start_date,
              category,
              did_quiz,
            });
          }
        });

        const marathons: Marathon[] = Array.from(marathonsMap.values());
        resolve(marathons);
      }
    });
  });
};

export const updateMarathonbyId = async (
  marathon_id: string,
  quiz_id: string,
  body: Partial<Marathon>
): Promise<void> => {
  const { did_quiz } = body;
  return new Promise<void>((resolve, reject) => {
    db.run(
      "UPDATE marathons SET did_quiz=? WHERE marathon_id = ? AND quiz_id = ?",
      [did_quiz, marathon_id, quiz_id],
      function (err) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log(`Marathon updated with ID: ${marathon_id}`);
          resolve();
        }
      }
    );
  });
};

// export const updateMarathon = async (marathon: MarathonRow) => {
//   const updatedFields: Partial<Marathon> = {
//     marathon_id: marathon.marathon_id,
//     did_quiz: marathon.did_quiz,
//   };
//   await updateMarathonbyId(marathon.marathon_id, updatedFields);
// };

export const getStats1 = async (
  username: string | undefined
): Promise<string> => {
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
          resolve("08:00-16:00");
        } else if (maxIndex === 1) {
          resolve("16:00-00:00");
        } else {
          resolve("00:00-08:00");
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

export const getStats3 = async (
  username: string | undefined
): Promise<{ x: number; y: number }[]> => {
  return new Promise<{ x: number; y: number }[]>((resolve, reject) => {
    const query = `
      SELECT
        difficulty_level,
        COUNT(DISTINCT question) AS questionCount
      FROM
        flashcards
      WHERE
        username = ?
      GROUP BY
        difficulty_level;
    `;

    db.all(query, [username], (err, rows: { difficulty_level?: string; questionCount?: number }[]) => {
      if (err) {
        reject(err);
      } else {
        // Ensure the array length is exactly 3
        const result = Array.from({ length: 3 }, (_, index) => {
          const difficultyLevel = getDifficultyLevelByIndex(index);
          const row = rows.find((r) => r.difficulty_level === difficultyLevel);
          return {
            x: row ? row.questionCount || 0 : 0,
            y: row ? row.questionCount || 0 : 0,
          };
        });

        resolve(result);
      }
    });
  });
};

const getDifficultyLevelByIndex = (index: number): string => {
  switch (index) {
    case 0:
      return 'Easy';
    case 1:
      return 'Medium';
    case 2:
      return 'Hard';
    default:
      return 'Unknown';
  }
};




export const getStats4 = async (
  username: string | undefined
): Promise<{ category: string; easy: number; medium: number; hard: number }[]> => {
  return new Promise<{ category: string; easy: number; medium: number; hard: number }[]>((resolve, reject) => {
    const query = `
      SELECT
        category,
        SUM(CASE WHEN difficulty_level = 'Easy' THEN 1 ELSE 0 END) AS easy,
        SUM(CASE WHEN difficulty_level = 'Medium' THEN 1 ELSE 0 END) AS medium,
        SUM(CASE WHEN difficulty_level = 'Hard' THEN 1 ELSE 0 END) AS hard
      FROM
        flashcards
      WHERE
        username = ?
      GROUP BY
        category;
    `;

    db.all(query, [username], (err, rows: { category: string; easy: number; medium: number; hard: number }[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};


export const getStats5 = async (
  username: string | undefined
): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const query = `
    SELECT
  COUNT(DISTINCT quiz_id) AS numberOfQuizzes,
  CASE
    WHEN COUNT(DISTINCT quiz_id) > 0 THEN
      ROUND(SUM((CAST(strftime('%s', end_date) AS REAL) - CAST(strftime('%s', start_date) AS REAL)) / 60) / COUNT(DISTINCT quiz_id))
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
export const createMarathonRecord = async (
  marathonId: string,
  quizId: string,
  username: string,
  category: string,
  currentDay: number,
  totalDays: number,
  startDate: Date,
  did_quiz: number,
  num_questions: number,
  num_quizes: number
) => {
  return new Promise<void>((resolve, reject) => {
    db.run(
      `INSERT INTO marathons (marathon_id, quiz_id, username, category, current_day, total_days, start_date, did_quiz, num_questions, num_quizes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        marathonId,
        quizId,
        username,
        category,
        currentDay,
        totalDays,
        startDate.toISOString(),
        did_quiz,
        num_questions,
        num_quizes
      ],
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      }
    );
  });
};
export const getMarathonStartDate = async (
  marathon_id: string
): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    db.get(
      "SELECT start_date FROM marathons WHERE marathon_id = ?",
      [marathon_id],
      (err, row: any) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          if (row && row.start_date) {
            resolve(row.start_date);
          }
        }
      }
    );
  });
};
export const getQuizIdByCurrentDay = async (
  marathon_id: string,
  current_day: number
): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    db.get(
      "SELECT quiz_id FROM marathons WHERE marathon_id = ? AND current_day = ?",
      [marathon_id, current_day],
      (err, row: { quiz_id: string }) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          if (row && row.quiz_id) {
            resolve(row.quiz_id);
          }
        }
      }
    );
  });
};
export const getFlashcardIdsByQuizId = async (
  quiz_id: string
): Promise<string[]> => {
  {
    return new Promise<string[]>((resolve, reject) => {
      let query = "SELECT flashcard_id FROM quizzes WHERE quiz_id = ?";
      const queryParams = [quiz_id];
      db.all(query, queryParams, (err, rows: { flashcard_id: string }[]) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(rows.map((row) => row.flashcard_id));
        }
      });
    });
  }
};

export const getCurrentMarathonQuiz = async (marathon_id: string) => {
  try {
    const marathonStartDate: string = await getMarathonStartDate(marathon_id);
    const marathonDate: Date = new Date(marathonStartDate);
    const today = new Date();
    const timeDiff = Math.abs(today.getTime() - marathonDate.getTime());
    const currentDay: number = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const quizId: string = await getQuizIdByCurrentDay(marathon_id, currentDay);
    const flashcardIds: string[] = await getFlashcardIdsByQuizId(quizId);
    console.log("Flashcards ARE!", flashcardIds);
    const flashcardPromises = flashcardIds.map((flashcard_id) =>
      getFlashcardbyId(flashcard_id)
    );
    const flashcards: Flashcard[] = await Promise.all(flashcardPromises);
    const theMarathon = await getMarathonById(marathon_id, quizId);
    const did_quiz = theMarathon?.did_quiz;
    return { id: quizId, flashcards: flashcards, did_quiz: did_quiz };
  } catch (e) {
    console.error(e);
  }
};

export const getMarathonById = async (
  marathonId: string,
  quizId: string
): Promise<MarathonRow | null> => {
  return new Promise<MarathonRow | null>((resolve, reject) => {
    const query =
      "SELECT * FROM marathons WHERE marathon_id = ? AND quiz_id = ?";
    const queryParams = [marathonId, quizId];

    db.get(query, queryParams, (err, row: MarathonRow | undefined) => {
      if (err) {
        console.error("Error fetching marathon by ID:", err);
        reject(err);
      } else {
        if (row) {
          const marathon: MarathonRow = {
            marathon_id: row.marathon_id,
            quiz_id: row.quiz_id,
            username: row.username,
            total_days: row.total_days,
            current_day: row.current_day,
            start_date: row.start_date,
            category: row.category,
            did_quiz: row.did_quiz,
          };

          resolve(marathon);
        } else {
          // If no matching marathon is found, return null
          resolve(null);
        }
      }
    });
  });
};

