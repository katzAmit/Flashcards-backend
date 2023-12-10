import { Database } from 'sqlite3';
import DatabaseSingleton from '../db/DatabaseSingleton';
import { Flashcard } from '../types/flashcardInterfaces';
import { User } from '../types/flashcardInterfaces'
const db: Database = DatabaseSingleton.getInstance();

export const createFlashcard = async (flashcard: Flashcard): Promise<void> => {
  const { id: id, username: username, question: question, answer: answer, category: category, difficulty_level: difficulty_level } = flashcard;
  return new Promise<void>((resolve, reject) => {
    db.run(
      'INSERT INTO flashcards (id, username, question, answer, category, difficulty_level) VALUES (?, ?, ?, ?, ?)',
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

export const updateFlashcardbyId = async (id: string, body: Partial<Flashcard>): Promise<void> => {
  const { username, question, answer, category, difficulty_level } = body;
  return new Promise<void>((resolve, reject) => {
    db.run(
      'UPDATE flashcards SET username = ?, question = ?, answer = ?, category = ?, difficulty_level = ? WHERE id = ?',
      [username, question, answer, category, difficulty_level, id],
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
    db.run(
      'DELETE FROM flashcards WHERE id = ?',
      [id],
      function (err) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          console.log(`Flashcard deleted with ID: ${id}`);
          resolve();
        }
      }
    );
  });
};

export const getFlashcards = async (username: string, category?: string, difficulty_level?: string): Promise<Flashcard[]> => {
  return new Promise<Flashcard[]>((resolve, reject) => {
    let query = 'SELECT * FROM flashcards WHERE username = ?';
    const queryParams = [username];

    if (category) {
      query += ' AND category = ?';
      queryParams.push(category);
    }

    if (difficulty_level) {
      query += ' AND difficulty_level = ?';
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

export const getFlashcardbyId = async (id: string): Promise<Flashcard | null> => {
  return new Promise<Flashcard | null>((resolve, reject) => {
    db.get('SELECT * FROM flashcards WHERE id = ?', [id], (err, row: Flashcard) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

export const validateUser = async (username: string, password: string): Promise<User> => {
  const userQuery = 'SELECT * FROM user WHERE username = ? AND password = ?';
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

export const registerUser = async (username: string, password: string, fname: string, lname: string): Promise<boolean> => {
  return new Promise<boolean>((resolve, reject) => {
    db.run(`INSERT INTO User (username, password, fname, lname) VALUES (?, ?, ?, ?)`, [username, password, fname, lname], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    })
  })
};

export const getUserFirstName = async (username: string): Promise<string | null> => {
  const userQuery = 'SELECT fname FROM user WHERE username = ?';
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
  const userQuery = 'SELECT username FROM user WHERE username = ?';
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



