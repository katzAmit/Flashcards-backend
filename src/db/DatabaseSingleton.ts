import sqlite3 from 'sqlite3';
class DatabaseSingleton {
  // static getUsers(): {
  //   return []
  // }
  private static instance: sqlite3.Database | null = null;

  private constructor() { } // Prevents external instantiation

  static getInstance(): sqlite3.Database {
    if (!DatabaseSingleton.instance) {
      DatabaseSingleton.instance = new sqlite3.Database('flashcard.db', (err) => {
        if (err) {
          console.error(err.message);
        } else {
          console.log('Connected to the SQLite database.');
          DatabaseSingleton.initializeTables(); // Call table initialization
        }
      });
    } else {
      // If the instance already exists, perform operations here if needed
    }
    return DatabaseSingleton.instance;
  }

  private static initializeTables() {
    DatabaseSingleton.instance?.run(`CREATE TABLE IF NOT EXISTS flashcards (
            id INTEGER PRIMARY KEY,
            question TEXT,
            answer TEXT
        )`, (initErr) => {
      if (initErr) {
        console.error('Error initializing flashcards table:', initErr.message);
      } else {
        console.log('Flashcards table initialized.');
        DatabaseSingleton.insertSingleFlashcard(); // Call method to insert a single flashcard
      }
    });
  }

  private static insertSingleFlashcard() {
    // Insert a single flashcard into the flashcards table
    const question = 'What is the capital of Israel?';
    const answer = 'Jerusalem';

    DatabaseSingleton.instance?.run(
      'INSERT INTO flashcards (question, answer) VALUES (?, ?)',
      [question, answer],
      (insertErr) => {
        if (insertErr) {
          console.error('Error inserting a flashcard:', insertErr.message);
        } else {
          console.log('Single flashcard inserted into flashcards table.');
        }
      }
    );
  }
}

export default DatabaseSingleton;
