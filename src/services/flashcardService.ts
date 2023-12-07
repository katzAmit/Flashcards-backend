// Import the required types and Database instance
import { Database } from 'sqlite3';
import DatabaseSingleton from '../db/DatabaseSingleton';
import { Flashcard } from '../types/flashcardInterfaces';

const db: Database = DatabaseSingleton.getInstance();

export const createFlashcard = async (body: Flashcard): Promise<void> => {
  const { UserID, Question, Answer, Category, DifficultyLevel } = body;
  try {
    await new Promise<void>((resolve, reject) => {
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
  } catch (err) {
    console.error(err);
  }
};


export const updateFlashcardbyId = async (id: string, body: Partial<Flashcard>): Promise<void> => {
  const validKeys: (keyof Flashcard)[] = ['Question', 'Answer', 'Category', 'DifficultyLevel']; // Define keys that can be updated

  const updates: string[] = [];
  const values: any[] = [];

  // Filter only valid keys and construct the SET part of the SQL query
  for (const key in body) {
    if (validKeys.includes(key as keyof Flashcard)) {
      updates.push(`${key} = ?`);
      values.push(body[key as keyof Flashcard]);
    }
  }

  if (updates.length === 0) {
    console.log('No valid fields to update.');
    return;
  }

  values.push(id); // Add the ID for the WHERE clause

  const sql = `UPDATE flashcards SET ${updates.join(', ')} WHERE id = ?`;

  try {
    await new Promise<void>((resolve, reject) => {
      db.run(sql, values, function (err) {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          if (this.changes === 0) {
            console.log('Flashcard not found.');
          } else {
            console.log(`Flashcard with ID ${id} updated successfully.`);
          }
          resolve();
        }
      });
    });
  } catch (err) {
    console.error(err);
  }
};

export const getAllFlashcards = async (): Promise<Flashcard[]> => {
  try {
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
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const getFlashcardbyId = async (id: string): Promise<Flashcard | null> => {
  try {
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
  } catch (err) {
    console.error(err);
    return null;
  }
};
