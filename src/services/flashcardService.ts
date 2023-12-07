import { Database } from 'sqlite3';
import DatabaseSingleton from '../db/DatabaseSingleton';
import { Flashcard } from '../types/flashcardInterfaces';
import { User } from '../types/flashcardInterfaces'
const db: Database = DatabaseSingleton.getInstance();

export const createFlashcard = async (body: Flashcard): Promise<void> => {
  const { UserID, Question, Answer, Category, DifficultyLevel } = body;
  return new Promise<void>((resolve, reject) => {
    db.run(
      'INSERT INTO flashcards (UserID, Question, Answer, Category, DifficultyLevel) VALUES (?, ?, ?, ?, ?)',
      [UserID, Question, Answer, Category, DifficultyLevel],
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
  // ... (unchanged)
};

export const getAllFlashcards = async (): Promise<Flashcard[]> => {
  return new Promise<Flashcard[]>((resolve, reject) => {
    db.all('SELECT * FROM flashcards', (err, rows: Flashcard[]) => {
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
  const userQuery = 'SELECT * FROM User WHERE Username = ? AND Password = ?';

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

export const registerUser = async (username: string, password: string, fName: string, lName: string): Promise<boolean> => {
  return new Promise<boolean>((resolve, reject) => {
    db.run(`INSERT INTO User (Username, Password, fName, lName) VALUES (?, ?, ?, ?)`, [username, password, fName, lName], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(true);
      }
    })
  })
};

export const getUserFirstName = async (username: string): Promise<string | null> => {
  const userQuery = 'SELECT fName FROM User WHERE Username = ?';
  return new Promise<string | null>((resolve, reject) => {
    db.get(userQuery, [username], (err, row: { fName?: string }) => {
      if (err) {
        reject(err);
      } else {
        if (row && row.fName) {
          resolve(row.fName); // Extract fName from the row and resolve with it
        } else {
          resolve(null); // Resolve with null if no user found or fName is undefined
        }
      }
    });
  });
};


