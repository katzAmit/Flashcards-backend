// flashcardService.ts

import { Database } from 'sqlite3';
import DatabaseSingleton from '../db/DatabaseSingleton';
const db: Database = DatabaseSingleton.getInstance()

export const createFlashcard = async (body: any) => {
  const { question, answer } = body;
  return new Promise((resolve, reject) => {
    db.run('INSERT INTO flashcards (question, answer) VALUES (?, ?)', [question, answer], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, question, answer });
      }
    });
  });
};

export const getAllFlashcards = async () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM flashcards', (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

export const updateFlashcardbyId = async (id: string, body: any) => {
  const { question, answer } = body;
  return new Promise((resolve, reject) => {
    db.run('UPDATE flashcards SET question = ?, answer = ? WHERE id = ?', [question, answer, id], function (err) {
      if (err) {
        reject(err);
      } else if (this.changes === 0) {
        resolve(null); // Indicates that no rows were affected (flashcard not found)
      } else {
        resolve({ id, question, answer });
      }
    });
  });
};

export const getFlashcardbyId = async (id: string) => {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM flashcards WHERE id = ?', [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};
